import type { UserDoc } from "@/lib/types";
import { at } from "./time";
import type { WithId } from "./types";

/** Fictional people. Names follow the design files; nothing here is a real person. */
export const fixtureUids = {
  admin: "u_rhea",
  doctor: "u_aarav",
  priya: "u_priya",
  kabir: "u_kabir",
  neha: "u_neha",
} as const;

function user(id: string, doc: Partial<UserDoc> & Pick<UserDoc, "name" | "email" | "referralCode">): WithId<UserDoc> {
  return {
    id,
    photoUrl: null,
    specialty: null,
    createdAt: at("2026-10-24T10:00:00+05:30"),
    lastActiveAt: at("2026-10-25T09:00:00+05:30"),
    role: "user",
    verification: { status: "none", applicationId: null, verifiedAt: null },
    canContribute: false,
    referredBy: null,
    referralCount: 0,
    qualifiedReferralCount: 0,
    consent: { termsVersion: "2026-10", contributionTermsVersion: null, acceptedAt: at("2026-10-24T10:00:00+05:30") },
    ...doc,
  };
}

export const users: WithId<UserDoc>[] = [
  user(fixtureUids.admin, {
    name: "Rhea Kulkarni",
    email: "rhea.kulkarni@neuraos.example",
    referralCode: "RHEA4K2M",
    role: "admin",
  }),
  user(fixtureUids.doctor, {
    name: "Dr. Aarav Mehta",
    email: "aarav.mehta@stmarys.example",
    specialty: "Cardiology",
    referralCode: "AARV7Q3X",
    verification: { status: "approved", applicationId: "app_aarav", verifiedAt: at("2026-10-24T16:20:00+05:30") },
    canContribute: true,
    referralCount: 3,
    qualifiedReferralCount: 2,
    consent: {
      termsVersion: "2026-10",
      contributionTermsVersion: "2026-10",
      acceptedAt: at("2026-10-24T10:00:00+05:30"),
    },
  }),
  user(fixtureUids.priya, {
    name: "Dr. Priya Raman",
    email: "priya.raman@cityhospital.example",
    specialty: "Internal medicine",
    referralCode: "PRYA2N8D",
    referredBy: fixtureUids.doctor,
  }),
  user(fixtureUids.kabir, {
    name: "Dr. Kabir Iyer",
    email: "kabir.iyer@northclinic.example",
    specialty: "Emergency medicine",
    referralCode: "KBIR5T1W",
    referredBy: fixtureUids.doctor,
  }),
  user(fixtureUids.neha, {
    name: "Dr. Neha Joshi",
    email: "neha.joshi@lakeside.example",
    specialty: "Paediatrics",
    referralCode: "NEHA9C4R",
    verification: { status: "pending", applicationId: "app_neha", verifiedAt: null },
  }),
];

export const signedInUser = users[1];

/** The person opening invite links in the static join page (not a member of any fixture chat). */
export const previewJoiner = users[4];
