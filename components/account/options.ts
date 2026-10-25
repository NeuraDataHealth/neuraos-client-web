/** Versions the user accepts (stored with consent on the user and contribution docs). */
export const TERMS_VERSION = "2026-10";
export const CONTRIBUTION_TERMS_VERSION = "2026-10";

/** Specialty choices (from design/admin). */
export const SPECIALTIES = [
  "Cardiology",
  "Cardiothoracic surgery",
  "Dermatology",
  "Emergency medicine",
  "Endocrinology",
  "General practice",
  "Internal medicine",
  "Obstetrics",
  "Orthopaedics",
  "Paediatrics",
  "Psychiatry",
] as const;

/** Registering bodies for the verification form. */
export const COUNCILS = [
  "National Medical Commission",
  "Delhi Medical Council",
  "Gujarat Medical Council",
  "Karnataka Medical Council",
  "Maharashtra Medical Council",
  "Tamil Nadu Medical Council",
  "Telangana State Medical Council",
  "Travancore-Cochin Medical Council",
  "West Bengal Medical Council",
  "Other state medical council",
] as const;
