import type { Mention, MessageDoc } from "@/lib/types";
import { at } from "./time";
import type { WithId } from "./types";
import { fixtureUids as u } from "./users";

type Draft = Partial<MessageDoc> & Pick<MessageDoc, "senderType" | "text"> & { time: string };

function msg(id: string, { time, ...doc }: Draft): WithId<MessageDoc> {
  return {
    id,
    senderId: doc.senderType === "ai" ? "ai" : doc.senderType === "system" ? "system" : u.doctor,
    senderName: doc.senderType === "ai" ? "NeuraOS" : doc.senderType === "system" ? "" : "Dr. Aarav Mehta",
    mentions: [],
    replyTo: null,
    triggeredBy: null,
    attachmentIds: [],
    citedFileIds: [],
    status: "done",
    createdAt: at(time),
    updatedAt: at(time),
    ...doc,
  };
}

const ai: Mention = { type: "ai" };
const priya = { senderId: u.priya, senderName: "Dr. Priya Raman" };
const kabir = { senderId: u.kabir, senderName: "Dr. Kabir Iyer" };

/** Messages per chat id, oldest first. Every message state appears at least once. Fictional cases only. */
export const messagesByChat: Record<string, WithId<MessageDoc>[]> = {
  chat_group: [
    msg("g1", { senderType: "system", text: "Dr. Aarav Mehta made this a group", time: "2026-10-25T08:30:00+05:30" }),
    msg("g2", { senderType: "system", text: "Dr. Priya Raman joined", time: "2026-10-25T08:31:00+05:30" }),
    msg("g3", {
      senderType: "user",
      text: "68M, day 2 post laparotomy. MAP 58 after 30 ml/kg crystalloid, lactate 4.6. ABG attached.",
      attachmentIds: ["file_lactate"],
      time: "2026-10-25T08:36:00+05:30",
    }),
    msg("g4", { senderType: "system", text: "Dr. Kabir Iyer joined", time: "2026-10-25T08:44:00+05:30" }),
    msg("g5", {
      ...kabir,
      senderType: "user",
      text: "@Dr. Aarav Mehta noradrenaline started at 0.1 mcg/kg/min through the central line.",
      mentions: [{ type: "user", uid: u.doctor }],
      time: "2026-10-25T08:52:00+05:30",
    }),
    msg("g6", {
      ...priya,
      senderType: "user",
      text: "@AI what does the ABG suggest, and when should we repeat the lactate?",
      mentions: [ai],
      time: "2026-10-25T09:02:00+05:30",
    }),
    msg("g7", {
      senderType: "ai",
      text: "From ABG_bed12_0830.pdf: pH 7.29 with bicarbonate 17 and a base excess of −8 is a metabolic acidosis, and a lactate of 4.6 mmol/L fits septic shock with hypoperfusion.\n\nRepeat the lactate within 2 hours of the first sample and aim for a falling trend. Keep MAP at 65 or above, and review source control with the surgical team.",
      replyTo: { msgId: "g6", senderName: "Dr. Priya Raman", snippet: "@AI what does the ABG suggest, and when should…" },
      triggeredBy: "g6",
      citedFileIds: ["file_lactate"],
      time: "2026-10-25T09:02:20+05:30",
    }),
    msg("g8", {
      senderType: "user",
      text: "@AI should we add vasopressin at this dose?",
      mentions: [ai],
      replyTo: { msgId: "g5", senderName: "Dr. Kabir Iyer", snippet: "noradrenaline started at 0.1 mcg/kg/min…" },
      time: "2026-10-25T09:42:00+05:30",
    }),
    msg("g9", {
      senderType: "ai",
      text: "Guidelines suggest adding vasopressin when noradrenaline reaches about 0.25–0.5 mcg/kg/min rather than",
      status: "streaming",
      triggeredBy: "g8",
      replyTo: { msgId: "g8", senderName: "Dr. Aarav Mehta", snippet: "@AI should we add vasopressin at this dose?" },
      // Fresh when the module loads, so the streaming state shows until it goes stale (45 s) and offers Retry.
      time: new Date().toISOString(),
    }),
  ],
  chat_chestpain: [
    msg("c1", {
      senderType: "user",
      text: "54F, 3 hours of central chest tightness, ECG non-diagnostic, high-sensitivity troponin normal at 0 and 2 hours. Safe to discharge?",
      attachmentIds: ["file_ecg"],
      time: "2026-10-25T07:50:00+05:30",
    }),
    msg("c2", {
      senderType: "ai",
      text: "Two normal high-sensitivity troponins 2 hours apart make an acute MI unlikely. Before discharge, check the HEART score, look for other causes such as PE or dissection if the story fits, and arrange outpatient follow-up. I couldn't read ECG_12lead.jpg; upload it again if you want me to look at it.",
      triggeredBy: "c1",
      time: "2026-10-25T07:50:30+05:30",
    }),
    msg("c3", { senderType: "user", text: "What's the weather in Pune tomorrow?", time: "2026-10-25T07:52:00+05:30" }),
    msg("c4", {
      senderType: "ai",
      status: "blocked",
      text: "I can only help with medical and healthcare questions. Ask me about symptoms, conditions, medicines, lab results or reports.",
      triggeredBy: "c3",
      time: "2026-10-25T07:52:02+05:30",
    }),
    msg("c5", { senderType: "user", text: "My father has chest pain and can't breathe", time: "2026-10-25T07:53:00+05:30" }),
    msg("c6", {
      senderType: "ai",
      status: "blocked",
      text: "This sounds like a medical emergency. Call 108 for an ambulance or 112 for emergency services now, or go to the nearest emergency department.",
      triggeredBy: "c5",
      time: "2026-10-25T07:53:01+05:30",
    }),
    msg("c7", { senderType: "user", text: "Which risk score do you use for PE here?", time: "2026-10-25T07:55:00+05:30" }),
    msg("c8", { senderType: "ai", status: "error", text: "", triggeredBy: "c7", time: "2026-10-25T07:55:05+05:30" }),
  ],
  chat_new: [],
};
