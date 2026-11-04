import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminBucket, adminDb } from "@/lib/firebase/admin";
import {
  ALLOWED_MIME,
  FILE_RETENTION_DAYS,
  MAX_FILE_BYTES,
  MAX_FILES_PER_CHAT,
  MAX_UPLOADS_PER_USER_PER_CHAT,
  UPLOAD_BYTES_PER_DAY,
  UPLOADS_PER_DAY,
} from "@/lib/limits";
import type {
  CompleteUploadResponse,
  FileUploadUrlRequest,
  FileUploadUrlResponse,
  FileUrlResponse,
} from "@/lib/contracts/files";
import { usageRef } from "@/lib/server/chat/quota";
import { todayKey } from "@/lib/server/day";
import { ApiError } from "@/lib/server/http/errors";
import type { AuthUser } from "@/lib/server/http/route";
import { extractFile } from "@/lib/server/ai/files";
import { recordSpend } from "@/lib/server/spend";
import type { ChatDoc, FileDoc, UsageDoc } from "@/lib/types";

/** Upload metadata kept server-side until `complete`; clients cannot read `pendingFiles`. */
type PendingFile = Pick<FileDoc, "uploaderId" | "uploaderName" | "fileName" | "mimeType" | "sizeBytes"> & {
  /** IST day the upload was counted on, so a refund hits the same `usage` doc. */
  day: string;
};

const UPLOAD_URL_MINUTES = 15;
const DAY_MS = 24 * 60 * 60 * 1000;
const MB = 1024 * 1024;

/** Gives back an upload that never arrived or was invalid: chat count, daily count and bytes. */
async function refundUpload(chatId: string, pending: PendingFile): Promise<void> {
  const db = adminDb();
  await Promise.all([
    db.doc(`chats/${chatId}`).update({ [`uploadCounts.${pending.uploaderId}`]: FieldValue.increment(-1) }),
    usageRef(pending.uploaderId, pending.day).set(
      { uploads: FieldValue.increment(-1), uploadBytes: FieldValue.increment(-pending.sizeBytes) },
      { merge: true },
    ),
  ]).catch(() => {});
}

/**
 * POST /api/chats/:id/files/upload-url
 *
 * Takes one upload from the caller's quotas in a transaction (so parallel requests
 * cannot pass a limit): per user per chat, per chat, and per user per day (count and
 * bytes, all chats). Keeps the metadata in `pendingFiles/{fileId}` and returns
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

  const day = todayKey();
  const dailyRef = usageRef(user.uid, day);

  await db.runTransaction(async (tx) => {
    const [snap, usageSnap] = await Promise.all([tx.get(chatRef), tx.get(dailyRef)]);
    if (!snap.exists) throw new ApiError("NOT_FOUND", "Chat not found.");
    const chat = snap.data() as ChatDoc;
    if (!chat.memberIds.includes(user.uid)) throw new ApiError("NOT_MEMBER");

    const counts = chat.uploadCounts ?? {};
    if ((counts[user.uid] ?? 0) >= MAX_UPLOADS_PER_USER_PER_CHAT) {
      throw new ApiError("LIMIT_UPLOADS", `You can upload ${MAX_UPLOADS_PER_USER_PER_CHAT} files per chat.`);
    }
    if (Object.values(counts).reduce((sum, n) => sum + n, 0) >= MAX_FILES_PER_CHAT) {
      throw new ApiError("LIMIT_UPLOADS", `This chat already has ${MAX_FILES_PER_CHAT} files.`);
    }
    const usage = (usageSnap.data() ?? {}) as Partial<UsageDoc>;
    if ((usage.uploads ?? 0) >= UPLOADS_PER_DAY) {
      throw new ApiError("LIMIT_UPLOADS", `You can upload ${UPLOADS_PER_DAY} files a day. Try again tomorrow.`);
    }
    if ((usage.uploadBytes ?? 0) + body.sizeBytes > UPLOAD_BYTES_PER_DAY) {
      throw new ApiError("LIMIT_UPLOADS", `You can upload ${UPLOAD_BYTES_PER_DAY / MB} MB a day. Try a smaller file or try tomorrow.`);
    }

    const pending: PendingFile = {
      uploaderId: user.uid,
      uploaderName: chat.members[user.uid]?.name ?? user.name ?? "Member",
      fileName: body.fileName,
      mimeType: body.mimeType,
      sizeBytes: body.sizeBytes,
      day,
    };
    tx.update(chatRef, { [`uploadCounts.${user.uid}`]: FieldValue.increment(1) });
    tx.set(
      dailyRef,
      { uploads: FieldValue.increment(1), uploadBytes: FieldValue.increment(body.sizeBytes) },
      { merge: true },
    );
    // Firestore TTL removes pending docs of abandoned uploads after a day.
    tx.set(pendingRef, {
      ...pending,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: Timestamp.fromMillis(Date.now() + DAY_MS),
    });
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
    const pending = (await pendingRef.get()).data() as PendingFile | undefined;
    await pendingRef.delete().catch(() => {});
    if (pending) await refundUpload(chatId, pending);
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
    await refundUpload(chatId, pending);
    throw new ApiError("UPLOAD_MISSING");
  }

  const [metadata] = await storageFile.getMetadata();
  const sizeBytes = Number(metadata.size ?? 0);
  const mimeType = metadata.contentType ?? "";
  if (sizeBytes > MAX_FILE_BYTES || !(ALLOWED_MIME as readonly string[]).includes(mimeType)) {
    await storageFile.delete().catch(() => {});
    await pendingRef.delete().catch(() => {});
    await refundUpload(chatId, pending);
    throw new ApiError("BAD_FILE");
  }

  // Move pending → files once, even if complete is called twice at the same time.
  await db.runTransaction(async (tx) => {
    if (!(await tx.get(pendingRef)).exists) throw new ApiError("NOT_FOUND", "Upload not found.");
    const { day: uploadDay, ...meta } = pending;
    tx.delete(pendingRef);
    // The daily byte count used the declared size; correct it to the real one.
    if (sizeBytes !== pending.sizeBytes) {
      tx.set(usageRef(user.uid, uploadDay), { uploadBytes: FieldValue.increment(sizeBytes - pending.sizeBytes) }, { merge: true });
    }
    tx.set(fileRef, {
      ...meta,
      mimeType,
      sizeBytes,
      expiresAt: Timestamp.fromMillis(Date.now() + FILE_RETENTION_DAYS * DAY_MS),
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

  await recordSpend([extraction.usage], user.uid);
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
