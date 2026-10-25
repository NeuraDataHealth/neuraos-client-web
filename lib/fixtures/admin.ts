import type {
  AdminApplication,
  AdminAuditLog,
  AdminContribution,
  AdminUser,
  AppConfig,
} from "@/lib/contracts/admin";
import { fixtureUids as u } from "./users";

/** Admin views use the API response shapes from lib/contracts/admin.ts (ISO dates). Fictional. */

const base = {
  phone: "+91 90000 00000",
  documents: [
    { fileName: "registration.pdf", kind: "registration_certificate" as const },
    { fileName: "id_front.jpg", kind: "id_proof" as const },
  ],
  reviewerUid: null,
  reviewNote: null,
  reviewedAt: null,
};

export const adminApplications: AdminApplication[] = [
  { ...base, id: "app_neha", uid: u.neha, fullName: "Dr. Neha Joshi", specialty: "Paediatrics", institution: "Lakeside Children's Hospital", registrationNumber: "MMC-2016-000123", councilName: "Maharashtra Medical Council", registrationYear: 2016, status: "pending", submittedAt: "2026-10-25T07:40:00+05:30" },
  { ...base, id: "app_kabir", uid: u.kabir, fullName: "Dr. Kabir Iyer", specialty: "Emergency medicine", institution: "North Clinic", registrationNumber: "KMC-2014-000456", councilName: "Karnataka Medical Council", registrationYear: 2014, status: "pending", submittedAt: "2026-10-25T06:15:00+05:30" },
  { ...base, id: "app_priya", uid: u.priya, fullName: "Dr. Priya Raman", specialty: "Internal medicine", institution: "City Hospital", registrationNumber: "TNMC-2012-000789", councilName: "Tamil Nadu Medical Council", registrationYear: 2012, status: "needs_info", reviewerUid: u.admin, reviewNote: "The ID proof is cut off at the bottom. Upload the full front side.", submittedAt: "2026-10-24T15:00:00+05:30", reviewedAt: "2026-10-24T17:30:00+05:30" },
  { ...base, id: "app_aarav", uid: u.doctor, fullName: "Dr. Aarav Mehta", specialty: "Cardiology", institution: "St. Mary's General Hospital", registrationNumber: "MMC-2011-000000", councilName: "Maharashtra Medical Council", registrationYear: 2011, status: "approved", reviewerUid: u.admin, submittedAt: "2026-10-24T11:00:00+05:30", reviewedAt: "2026-10-24T16:20:00+05:30" },
  { ...base, id: "app_test", uid: "u_test", fullName: "Dr. Sameer Khan", specialty: "Dermatology", institution: "Skin Care Centre", registrationNumber: "DMC-2019-000321", councilName: "Delhi Medical Council", registrationYear: 2019, status: "rejected", reviewerUid: u.admin, reviewNote: "The registration number isn't on the council register.", submittedAt: "2026-10-24T09:00:00+05:30", reviewedAt: "2026-10-24T12:00:00+05:30" },
];

const con = { contributorUid: u.doctor, contributorName: "Dr. Aarav Mehta", specialty: "Cardiology", reviewerUid: null, reviewNote: null, reviewedAt: null };

export const adminContributions: AdminContribution[] = [
  { ...con, id: "con_af", title: "Fast AF with decompensated heart failure", type: "text", text: "71-year-old man with known LV impairment, two days of breathlessness and palpitations. He was seen by Mr. Rao from the next bed's family, who called 98200 00000.", audio: null, piiCheck: { status: "flagged", flags: [{ kind: "name", excerpt: "Mr. Rao" }, { kind: "phone", excerpt: "98200 00000" }] }, status: "submitted", submittedAt: "2026-10-25T08:00:00+05:30" },
  { ...con, id: "con_dka", contributorUid: u.kabir, contributorName: "Dr. Kabir Iyer", specialty: "Emergency medicine", title: "New-onset type 1 diabetes with DKA", type: "voice", text: "41-year-old woman, two days of vomiting and polyuria. pH 7.12, ketones 5.8. Fixed-rate insulin with saline, potassium added once below 5.5.", audio: { mimeType: "audio/webm", durationSec: 188 }, piiCheck: { status: "clean", flags: [] }, status: "submitted", submittedAt: "2026-10-25T07:20:00+05:30" },
  { ...con, id: "con_endo", title: "Infective endocarditis after dental work", type: "text", text: "45-year-old man with a bicuspid aortic valve, three weeks of fevers after a dental extraction.", audio: null, piiCheck: { status: "clean", flags: [] }, status: "needs_changes", reviewerUid: u.admin, reviewNote: "Add the culture result, antibiotic choice and duration, and the outcome.", submittedAt: "2026-10-24T19:00:00+05:30", reviewedAt: "2026-10-25T08:30:00+05:30" },
  { ...con, id: "con_hcm", title: "Syncope on exertion in a young athlete", type: "text", text: "19-year-old footballer, syncope mid-sprint. Echo: asymmetric septal hypertrophy with LVOT gradient 64 mmHg.", audio: null, piiCheck: { status: "clean", flags: [] }, status: "approved", reviewerUid: u.admin, submittedAt: "2026-10-24T18:00:00+05:30", reviewedAt: "2026-10-24T20:10:00+05:30" },
  { ...con, id: "con_dup", contributorUid: u.priya, contributorName: "Dr. Priya Raman", specialty: "Internal medicine", title: "Hyponatraemia in an older adult", type: "text", text: "Duplicate of an earlier submission.", audio: null, piiCheck: { status: "clean", flags: [] }, status: "rejected", reviewerUid: u.admin, reviewNote: "Same case as your earlier submission.", submittedAt: "2026-10-24T13:00:00+05:30", reviewedAt: "2026-10-24T14:00:00+05:30" },
];

const userBase = { role: "user" as const, canContribute: false, referralCount: 0, qualifiedReferralCount: 0, createdAt: "2026-10-24T10:00:00+05:30", lastActiveAt: "2026-10-25T09:00:00+05:30" };

export const adminUsers: AdminUser[] = [
  { ...userBase, uid: u.doctor, name: "Dr. Aarav Mehta", email: "aarav.mehta@stmarys.example", specialty: "Cardiology", verificationStatus: "approved", canContribute: true, referralCount: 3, qualifiedReferralCount: 2 },
  { ...userBase, uid: u.priya, name: "Dr. Priya Raman", email: "priya.raman@cityhospital.example", specialty: "Internal medicine", verificationStatus: "needs_info" },
  { ...userBase, uid: u.kabir, name: "Dr. Kabir Iyer", email: "kabir.iyer@northclinic.example", specialty: "Emergency medicine", verificationStatus: "pending" },
  { ...userBase, uid: u.neha, name: "Dr. Neha Joshi", email: "neha.joshi@lakeside.example", specialty: "Paediatrics", verificationStatus: "pending" },
  { ...userBase, uid: u.admin, name: "Rhea Kulkarni", email: "rhea.kulkarni@neuraos.example", specialty: null, role: "admin", verificationStatus: "none" },
];

export const adminAuditLogs: AdminAuditLog[] = [
  { id: "log4", actorUid: u.admin, action: "contribution.decision", targetType: "contribution", targetId: "con_endo", fromStatus: "submitted", toStatus: "needs_changes", note: "Add the culture result, antibiotic choice and duration, and the outcome.", at: "2026-10-25T08:30:00+05:30" },
  { id: "log3", actorUid: u.admin, action: "contribution.decision", targetType: "contribution", targetId: "con_hcm", fromStatus: "submitted", toStatus: "approved", note: null, at: "2026-10-24T20:10:00+05:30" },
  { id: "log2", actorUid: u.admin, action: "application.decision", targetType: "verificationApplication", targetId: "app_priya", fromStatus: "pending", toStatus: "needs_info", note: "The ID proof is cut off at the bottom. Upload the full front side.", at: "2026-10-24T17:30:00+05:30" },
  { id: "log1", actorUid: u.admin, action: "application.decision", targetType: "verificationApplication", targetId: "app_aarav", fromStatus: "pending", toStatus: "approved", note: null, at: "2026-10-24T16:20:00+05:30" },
  { id: "log0", actorUid: u.admin, action: "config.update", targetType: "config", targetId: "app", fromStatus: null, toStatus: null, note: "Daily spend cap 10 → 15 USD", at: "2026-10-24T10:30:00+05:30" },
];

export const adminConfig: AppConfig = {
  aiEnabled: true,
  groupsEnabled: true,
  contributionsEnabled: true,
  dailySpendCapUsd: 15,
};

/** Sum of today's spend shards, in USD. */
export const spendTodayUsd = 9.42;
