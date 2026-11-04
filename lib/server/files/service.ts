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
import type { ChatDoc, FileDoc } from "@/lib/types";

/**
 * POST /api/chats/:id/files/upload-url
 *
 * Checks upload count, size and MIME type, then returns a signed PUT URL for
 * `chats/{chatId}/{fileId}` and initializes a processing record in Firestore.
 */
export async function createFileUploadUrl(
  chatId: string,
  user: AuthUser,
  body: FileUploadUrlRequest,
): Promise<FileUploadUrlResponse> {
  const db = adminDb();
  const chatRef = db.doc(`chats/${chatId}`);
  const chatSnap = await chatRef.get();

  if (!chatSnap.exists) {
    throw new ApiError("NOT_FOUND", "Chat not found.");
  }

  const chat = chatSnap.data() as ChatDoc;
  if (!chat.memberIds.includes(user.uid)) {
    throw new ApiError("NOT_MEMBER", "You are not a member of this chat.");
  }

  const uploadCount = chat.uploadCounts?.[user.uid] ?? 0;
  if (uploadCount >= MAX_UPLOADS_PER_USER_PER_CHAT) {
    throw new ApiError("LIMIT_UPLOADS", "You have reached the maximum number of uploads for this chat.");
  }

  const fileId = db.collection("chats").doc(chatId).collection("files").doc().id;
  const bucket = adminBucket();
  const objectPath = `chats/${chatId}/${fileId}`;
  const file = bucket.file(objectPath);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: expiresAt,
    contentType: body.mimeType,
  });

  const fileRef = db.doc(`chats/${chatId}/files/${fileId}`);
  await fileRef.set({
    uploaderId: user.uid,
    uploaderName: user.name ?? "Member",
    fileName: body.fileName,
    mimeType: body.mimeType,
    sizeBytes: body.sizeBytes,
    gcsUri: `gs://${bucket.name}/${objectPath}`,
    status: "processing",
    summary: null,
    extractedText: null,
    tokenEstimate: null,
    createdAt: FieldValue.serverTimestamp(),
  });

  return {
    fileId,
    uploadUrl: url,
    expiresAt: expiresAt.toISOString(),
    headers: { "Content-Type": body.mimeType },
  };
}

/**
 * POST /api/chats/:id/files/:fileId/complete
 *
 * Registers the upload, checks object size & type in Storage, increments chat uploadCounts,
 * runs fast-model extraction, and marks the file as ready or failed.
 */
export async function completeFileUpload(
  chatId: string,
  fileId: string,
  user: AuthUser,
): Promise<CompleteUploadResponse> {
  const db = adminDb();
  const chatRef = db.doc(`chats/${chatId}`);
  const fileRef = db.doc(`chats/${chatId}/files/${fileId}`);

  const [chatSnap, fileSnap] = await Promise.all([chatRef.get(), fileRef.get()]);
  if (!chatSnap.exists) {
    throw new ApiError("NOT_FOUND", "Chat not found.");
  }
  if (!fileSnap.exists) {
    throw new ApiError("NOT_FOUND", "File record not found.");
  }

  const chat = chatSnap.data() as ChatDoc;
  if (!chat.memberIds.includes(user.uid)) {
    throw new ApiError("NOT_MEMBER", "You are not a member of this chat.");
  }

  const fileDoc = fileSnap.data() as FileDoc;
  const bucket = adminBucket();
  const objectPath = `chats/${chatId}/${fileId}`;
  const storageFile = bucket.file(objectPath);

  const [exists] = await storageFile.exists();
  if (!exists) {
    throw new ApiError("UPLOAD_MISSING", "Uploaded file not found in storage.");
  }

  const [metadata] = await storageFile.getMetadata();
  const actualSize = Number(metadata.size ?? 0);
  const actualType = metadata.contentType ?? fileDoc.mimeType;

  const allowed = ALLOWED_MIME as readonly string[];
  if (actualSize > MAX_FILE_BYTES || !allowed.includes(actualType)) {
    await storageFile.delete().catch(() => {});
    await fileRef.delete().catch(() => {});
    throw new ApiError("BAD_FILE", "Uploaded file is invalid or exceeds maximum size.");
  }

  // Increment upload quota in chat doc
  await chatRef.set(
    {
      uploadCounts: {
        [user.uid]: FieldValue.increment(1),
      },
    },
    { merge: true },
  );

  // Run AI extraction
  try {
    const extraction = await extractFile({
      gcsUri: `gs://${bucket.name}/${objectPath}`,
      mimeType: actualType,
      fileName: fileDoc.fileName,
    });

    await fileRef.update({
      status: "ready",
      summary: extraction.summary,
      extractedText: extraction.extractedText,
      tokenEstimate: extraction.tokenEstimate,
      sizeBytes: actualSize,
    });

    return { fileId, status: "ready" };
  } catch (error) {
    console.error("Failed to extract file:", error);
    await fileRef.update({
      status: "failed",
      sizeBytes: actualSize,
    });
    return { fileId, status: "failed" };
  }
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
