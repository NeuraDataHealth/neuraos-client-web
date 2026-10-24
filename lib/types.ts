/**
 * Firestore document types (SPEC.md section 5). This file is the contract:
 * only the lead changes it, together with the spec.
 */

/** Structural Timestamp that both the client SDK and the Admin SDK satisfy. */
export type FirestoreTimestamp = {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
  toMillis(): number;
};

/* ---------- users ---------- */

export type UserRole = "user" | "admin";

export type VerificationStatus = "none" | "pending" | "approved" | "rejected" | "needs_info";

export type UserDoc = {
  name: string;
  email: string;
  photoUrl: string | null;
  specialty: string | null;
  createdAt: FirestoreTimestamp;
  lastActiveAt: FirestoreTimestamp;
  /** Display only; the real check is the `admin` custom claim. */
  role: UserRole;
  verification: {
    status: VerificationStatus;
    applicationId: string | null;
    verifiedAt: FirestoreTimestamp | null;
  };
  /** True only after admin approval. */
  canContribute: boolean;
  /** Same as the doc id in `referralCodes`. */
  referralCode: string;
  referredBy: string | null;
  referralCount: number;
  qualifiedReferralCount: number;
  consent: {
    termsVersion: string | null;
    contributionTermsVersion: string | null;
    acceptedAt: FirestoreTimestamp | null;
  };
};

/** `usage/{uid}_{yyyymmdd}` */
export type UsageDoc = {
  aiReplies: number;
  contributions: number;
  minuteWindowStart: FirestoreTimestamp;
  minuteCount: number;
};

/* ---------- chats ---------- */

export type ChatMemberRole = "owner" | "member";

export type ChatMember = {
  name: string;
  photoUrl: string | null;
  role: ChatMemberRole;
  joinedAt: FirestoreTimestamp;
};

/** Every chat is a group; a solo chat has one member. */
export type ChatDoc = {
  ownerId: string;
  title: string;
  createdAt: FirestoreTimestamp;
  lastMessageAt: FirestoreTimestamp;
  memberIds: string[];
  members: Record<string, ChatMember>;
  inviteToken: string | null;
  inviteActive: boolean;
  forkedFrom: string | null;
  /** uid → slot expiry. An expired entry counts as free. */
  aiInFlight: Record<string, FirestoreTimestamp>;
  /** Uploads ever made per uid, not current files. */
  uploadCounts: Record<string, number>;
};

export type SenderType = "user" | "ai" | "system";

/** Structured mentions; never parsed from text. */
export type Mention = { type: "ai" } | { type: "user"; uid: string };

export type ReplyTo = {
  msgId: string;
  senderName: string;
  snippet: string;
};

export type MessageStatus = "done" | "streaming" | "error" | "blocked";

/** `chats/{chatId}/messages/{msgId}` */
export type MessageDoc = {
  senderType: SenderType;
  senderId: string;
  /** Copied by the server; the client never supplies it. */
  senderName: string;
  text: string;
  mentions: Mention[];
  replyTo: ReplyTo | null;
  /** AI messages only. */
  triggeredBy: string | null;
  attachmentIds: string[];
  /** AI messages only. */
  citedFileIds: string[];
  status: MessageStatus;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
};

export type FileStatus = "processing" | "ready" | "failed";

/** `chats/{chatId}/files/{fileId}` */
export type FileDoc = {
  uploaderId: string;
  uploaderName: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  gcsUri: string;
  status: FileStatus;
  summary: string | null;
  extractedText: string | null;
  tokenEstimate: number | null;
  createdAt: FirestoreTimestamp;
};

/* ---------- feedback and referrals ---------- */

export type FeedbackRating = "up" | "down";

export type FeedbackDoc = {
  uid: string;
  chatId: string;
  msgId: string;
  rating: FeedbackRating;
  reason: string | null;
  createdAt: FirestoreTimestamp;
};

/** `referralCodes/{code}` */
export type ReferralCodeDoc = {
  uid: string;
  createdAt: FirestoreTimestamp;
};

/** `referrals/{referredUid}`: doc id is the new user, so one referral per user. */
export type ReferralDoc = {
  referrerUid: string;
  code: string;
  createdAt: FirestoreTimestamp;
  qualifiedAt: FirestoreTimestamp | null;
};

/* ---------- verification ---------- */

export type ApplicationStatus = "pending" | "approved" | "rejected" | "needs_info";

export type VerificationDocumentKind = "registration_certificate" | "id_proof";

export type VerificationDocument = {
  fileName: string;
  gcsUri: string;
  kind: VerificationDocumentKind;
};

export type VerificationApplicationDoc = {
  uid: string;
  fullName: string;
  phone: string;
  specialty: string;
  institution: string;
  registrationNumber: string;
  councilName: string;
  registrationYear: number;
  documents: VerificationDocument[];
  status: ApplicationStatus;
  reviewerUid: string | null;
  reviewNote: string | null;
  submittedAt: FirestoreTimestamp;
  reviewedAt: FirestoreTimestamp | null;
};

/* ---------- contributions ---------- */

export type ContributionType = "text" | "voice";

export type ContributionStatus = "draft" | "submitted" | "approved" | "rejected" | "needs_changes";

export type TranscriptStatus = "processing" | "ready" | "failed";

export type PiiStatus = "clean" | "flagged";

export type PiiFlagKind = "name" | "phone" | "id_number" | "address";

export type PiiFlag = {
  kind: PiiFlagKind;
  /** The flagged span, shown to the contributor and the reviewer. */
  excerpt: string;
};

export type ContributionDoc = {
  contributorUid: string;
  specialty: string;
  title: string;
  type: ContributionType;
  /** Typed text, or the transcript the contributor confirmed. */
  text: string;
  audio: { gcsUri: string; mimeType: string; durationSec: number } | null;
  transcript: { status: TranscriptStatus; draftText: string | null } | null;
  piiCheck: { status: PiiStatus; flags: PiiFlag[] } | null;
  status: ContributionStatus;
  contributionTermsVersion: string;
  reviewerUid: string | null;
  reviewNote: string | null;
  createdAt: FirestoreTimestamp;
  submittedAt: FirestoreTimestamp | null;
  reviewedAt: FirestoreTimestamp | null;
};

/* ---------- admin and operations ---------- */

export type AuditTargetType = "verificationApplication" | "contribution" | "config";

export type AuditLogDoc = {
  actorUid: string;
  action: string;
  targetType: AuditTargetType;
  targetId: string;
  fromStatus: string | null;
  toStatus: string | null;
  note: string | null;
  at: FirestoreTimestamp;
};

/** `config/app` */
export type AppConfigDoc = {
  aiEnabled: boolean;
  groupsEnabled: boolean;
  contributionsEnabled: boolean;
  dailySpendCapUsd: number;
};

/** `spend/{yyyymmdd}/shards/{0..9}` */
export type SpendShardDoc = {
  costUsd: number;
  inputTokens: number;
  outputTokens: number;
};

/** Guardrail classifier labels (SPEC.md section 12). */
export type GuardrailLabel = "medical" | "non_medical" | "emergency" | "injection";
