import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminBucket, adminDb } from "@/lib/firebase/admin";
import { ALLOWED_MIME, MAX_FILE_BYTES, MAX_UPLOADS_PER_USER_PER_CHAT } from "@/lib/limits";
import type {
  CompleteUploadResponse,
  FileUploadUrlRequest,
  FileUploadUrlResponse,
  FileUrlResponse,
} from "@/lib/contracts/files";
import { ApiError } from "@/lib/server/http/errors";
import type { AuthUser } from "@/lib/server/http/route";
import { extractFile } from "@/lib/server/ai/files";
import { recordSpend } from "@/lib/server/spend";
import type { ChatDoc, FileDoc } from "@/lib/types";

/** Upload metadata kept server-side until `complete`; clients cannot read `pendingFiles`. */
type PendingFile = Pick<FileDoc, "uploaderId" | "uploaderName" | "fileName" | "mimeType" | "sizeBytes">;

const UPLOAD_URL_MINUTES = 15;

function refundUpload(chatId: string, uid: string): Promise<unknown> {
  return adminDb()
    .doc(`chats/${chatId}`)
    .update({ [`uploadCounts.${uid}`]: FieldValue.increment(-1) })
    .catch(() => {});
}

/**
 * POST /api/chats/:id/files/upload-url
 *
 * Takes one upload from the caller's quota in a transaction (so parallel requests
 * cannot pass the limit), keeps the metadata in `pendingFiles/{fileId}` and returns
 * a signed PUT URL for `chats/{chatId}/{fileId}`. The file appears in the chat only
 * after `complete`, so abandoned uploads never show up as files.
 */
export async function createFileUploadUrl(
  chatId: string,
  user: AuthUser,
  body: FileUploadUrlRequest,
): Promise<FileUploadUrlResponse> {
  const db = adminDb();
  const chatRef = db.doc(`chats/${chatId}`);
  const fileId = chatRef.collection("files").doc().id;
  const pendingRef = chatRef.collection("pendingFiles").doc(fileId);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(chatRef);
    if (!snap.exists) throw new ApiError("NOT_FOUND", "Chat not found.");
    const chat = snap.data() as ChatDoc;
    if (!chat.memberIds.includes(user.uid)) throw new ApiError("NOT_MEMBER");
    if ((chat.uploadCounts?.[user.uid] ?? 0) >= MAX_UPLOADS_PER_USER_PER_CHAT) throw new ApiError("LIMIT_UPLOADS");

    const pending: PendingFile = {
      uploaderId: user.uid,
      uploaderName: chat.members[user.uid]?.name ?? user.name ?? "Member",
      fileName: body.fileName,
      mimeType: body.mimeType,
      sizeBytes: body.sizeBytes,
    };
    tx.update(chatRef, { [`uploadCounts.${user.uid}`]: FieldValue.increment(1) });
    tx.set(pendingRef, { ...pending, createdAt: FieldValue.serverTimestamp() });
  });

  const expiresAt = new Date(Date.now() + UPLOAD_URL_MINUTES * 60 * 1000);
  try {
    const [uploadUrl] = await adminBucket().file(`chats/${chatId}/${fileId}`).getSignedUrl({
      version: "v4",
      action: "write",
      expires: expiresAt,
      contentType: body.mimeType,
    });
    return { fileId, uploadUrl, expiresAt: expiresAt.toISOString(), headers: { "Content-Type": body.mimeType } };
  } catch (error) {
    await pendingRef.delete().catch(() => {});
    await refundUpload(chatId, user.uid);
    throw error;
  }
}

/**
 * POST /api/chats/:id/files/:fileId/complete
 *
 * Checks the stored object's size and type (a missing or invalid upload is removed
 * and its quota given back), creates the file as `processing`, runs extraction and
 * marks it `ready` or `failed`. Calling it again for a finished file returns its status.
 */
export async function completeFileUpload(
  chatId: string,
  fileId: string,
  user: AuthUser,
): Promise<CompleteUploadResponse> {
  const db = adminDb();
  const chatRef = db.doc(`chats/${chatId}`);
  const fileRef = chatRef.collection("files").doc(fileId);
  const pendingRef = chatRef.collection("pendingFiles").doc(fileId);

  const [chatSnap, fileSnap, pendingSnap] = await Promise.all([chatRef.get(), fileRef.get(), pendingRef.get()]);
  if (!chatSnap.exists) throw new ApiError("NOT_FOUND", "Chat not found.");
  if (!(chatSnap.data() as ChatDoc).memberIds.includes(user.uid)) throw new ApiError("NOT_MEMBER");

  const existing = fileSnap.data() as FileDoc | undefined;
  if (existing && existing.uploaderId === user.uid && existing.status !== "processing") {
    return { fileId, status: existing.status };
  }
  const pending = pendingSnap.data() as PendingFile | undefined;
  if (!pending || pending.uploaderId !== user.uid) throw new ApiError("NOT_FOUND", "Upload not found.");

  const objectPath = `chats/${chatId}/${fileId}`;
  const storageFile = adminBucket().file(objectPath);
  const [exists] = await storageFile.exists();
  if (!exists) {
    await pendingRef.delete().catch(() => {});
    await refundUpload(chatId, user.uid);
    throw new ApiError("UPLOAD_MISSING");
  }

  const [metadata] = await storageFile.getMetadata();
  const sizeBytes = Number(metadata.size ?? 0);
  const mimeType = metadata.contentType ?? "";
  if (sizeBytes > MAX_FILE_BYTES || !(ALLOWED_MIME as readonly string[]).includes(mimeType)) {
    await storageFile.delete().catch(() => {});
    await pendingRef.delete().catch(() => {});
    await refundUpload(chatId, user.uid);
    throw new ApiError("BAD_FILE", "The file must be a PDF, PNG or JPEG under 10 MB.");
  }

  // Move pending → files once, even if complete is called twice at the same time.
  await db.runTransaction(async (tx) => {
    if (!(await tx.get(pendingRef)).exists) throw new ApiError("NOT_FOUND", "Upload not found.");
    tx.delete(pendingRef);
    tx.set(fileRef, {
      ...pending,
      mimeType,
      sizeBytes,
      gcsUri: `gs://${storageFile.bucket.name}/${objectPath}`,
      status: "processing",
      summary: null,
      extractedText: null,
      tokenEstimate: null,
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  let extraction: Awaited<ReturnType<typeof extractFile>>;
  try {
    extraction = await extractFile({ gcsUri: `gs://${storageFile.bucket.name}/${objectPath}`, mimeType, fileName: pending.fileName });
  } catch {
    await fileRef.update({ status: "failed" });
    return { fileId, status: "failed" };
  }

  await recordSpend([extraction.usage]);
  await fileRef.update({
    status: "ready",
    summary: extraction.summary,
    extractedText: extraction.extractedText,
    tokenEstimate: extraction.tokenEstimate,
  });
  return { fileId, status: "ready" };
}

/**
 * DELETE /api/chats/:id/files/:fileId
 *
 * Deletes a file. Caller must be the uploader or the chat owner.
 */
export async function deleteChatFile(
  chatId: string,
  fileId: string,
  user: AuthUser,
): Promise<{ ok: true }> {
  const db = adminDb();
  const chatRef = db.doc(`chats/${chatId}`);
  const fileRef = db.doc(`chats/${chatId}/files/${fileId}`);

  const [chatSnap, fileSnap] = await Promise.all([chatRef.get(), fileRef.get()]);
  if (!chatSnap.exists || !fileSnap.exists) {
    return { ok: true };
  }

  const chat = chatSnap.data() as ChatDoc;
  const file = fileSnap.data() as FileDoc;

  const isUploader = file.uploaderId === user.uid;
  const isOwner = chat.ownerId === user.uid;

  if (!isUploader && !isOwner) {
    throw new ApiError("FORBIDDEN", "Only the uploader or chat owner can delete this file.");
  }

  const bucket = adminBucket();
  await bucket.file(`chats/${chatId}/${fileId}`).delete().catch(() => {});
  await fileRef.delete().catch(() => {});

  return { ok: true };
}

/**
 * GET /api/files/:fileId/url?chatId=
 *
 * Generates a short-lived signed download URL for a file in a chat.
 * Caller must be a member of the chat or an admin.
 */
export async function getChatFileDownloadUrl(
  fileId: string,
  chatId: string,
  user: AuthUser,
): Promise<FileUrlResponse> {
  const db = adminDb();
  const chatSnap = await db.doc(`chats/${chatId}`).get();
  if (!chatSnap.exists) {
    throw new ApiError("NOT_FOUND", "Chat not found.");
  }

  const chat = chatSnap.data() as ChatDoc;
  const isMember = chat.memberIds.includes(user.uid);
  const isAdmin = user.admin;

  if (!isMember && !isAdmin) {
    throw new ApiError("NOT_MEMBER", "You are not a member of this chat.");
  }

  const fileSnap = await db.doc(`chats/${chatId}/files/${fileId}`).get();
  if (!fileSnap.exists) {
    throw new ApiError("NOT_FOUND", "File not found.");
  }

  const bucket = adminBucket();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const [url] = await bucket.file(`chats/${chatId}/${fileId}`).getSignedUrl({
    version: "v4",
    action: "read",
    expires: expiresAt,
  });

  return {
    url,
    expiresAt: expiresAt.toISOString(),
  };
}
