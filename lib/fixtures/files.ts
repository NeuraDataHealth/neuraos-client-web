import type { FileDoc } from "@/lib/types";
import { at } from "./time";
import type { WithId } from "./types";
import { fixtureUids as u } from "./users";

/** Files per chat id. Contents are invented lab values with no patient identifiers. */
export const filesByChat: Record<string, WithId<FileDoc>[]> = {
  chat_group: [
    {
      id: "file_lactate",
      uploaderId: u.doctor,
      uploaderName: "Dr. Aarav Mehta",
      fileName: "ABG_bed12_0830.pdf",
      mimeType: "application/pdf",
      sizeBytes: 182_400,
      gcsUri: "gs://neuraos-fixtures/chats/chat_group/file_lactate",
      status: "ready",
      summary: "Arterial blood gas at 08:30: pH 7.29, lactate 4.6 mmol/L, bicarbonate 17 mmol/L.",
      extractedText: "pH 7.29 · pCO2 34 · pO2 82 · HCO3 17 · lactate 4.6 mmol/L · base excess −8",
      tokenEstimate: 40,
      createdAt: at("2026-10-25T08:36:00+05:30"),
    },
    {
      id: "file_cxr",
      uploaderId: u.priya,
      uploaderName: "Dr. Priya Raman",
      fileName: "CXR_portable.png",
      mimeType: "image/png",
      sizeBytes: 2_310_000,
      gcsUri: "gs://neuraos-fixtures/chats/chat_group/file_cxr",
      status: "processing",
      summary: null,
      extractedText: null,
      tokenEstimate: null,
      createdAt: at("2026-10-25T09:40:00+05:30"),
    },
  ],
  chat_chestpain: [
    {
      id: "file_ecg",
      uploaderId: u.doctor,
      uploaderName: "Dr. Aarav Mehta",
      fileName: "ECG_12lead.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 940_000,
      gcsUri: "gs://neuraos-fixtures/chats/chat_chestpain/file_ecg",
      status: "failed",
      summary: null,
      extractedText: null,
      tokenEstimate: null,
      createdAt: at("2026-10-25T07:50:00+05:30"),
    },
  ],
};
