import type { ChatDoc, ChatMember } from "@/lib/types";
import { at } from "./time";
import type { WithId } from "./types";
import { fixtureUids as u } from "./users";

const member = (name: string, role: ChatMember["role"], joined: string): ChatMember => ({
  name,
  photoUrl: null,
  role,
  joinedAt: at(joined),
});

function solo(id: string, title: string, last: string): WithId<ChatDoc> {
  return {
    id,
    ownerId: u.doctor,
    title,
    createdAt: at(last),
    lastMessageAt: at(last),
    memberIds: [u.doctor],
    members: { [u.doctor]: member("Dr. Aarav Mehta", "owner", last) },
    inviteToken: null,
    inviteActive: false,
    forkedFrom: null,
    aiInFlight: {},
    uploadCounts: {},
  };
}

/** The doctor's chats, newest first. `chat_group` is a full 3-member group. */
export const chats: WithId<ChatDoc>[] = [
  {
    id: "chat_group",
    ownerId: u.doctor,
    title: "Septic shock · bed 12",
    createdAt: at("2026-10-25T08:10:00+05:30"),
    lastMessageAt: at("2026-10-25T09:42:00+05:30"),
    memberIds: [u.doctor, u.priya, u.kabir],
    members: {
      [u.doctor]: member("Dr. Aarav Mehta", "owner", "2026-10-25T08:10:00+05:30"),
      [u.priya]: member("Dr. Priya Raman", "member", "2026-10-25T08:31:00+05:30"),
      [u.kabir]: member("Dr. Kabir Iyer", "member", "2026-10-25T08:44:00+05:30"),
    },
    inviteToken: "tok_9f2c1a7e4b6d8a0c3e5f7b9d1a3c5e7f",
    inviteActive: true,
    forkedFrom: null,
    aiInFlight: {},
    uploadCounts: { [u.doctor]: 1, [u.priya]: 1 },
  },
  {
    id: "chat_ward4",
    ownerId: u.doctor,
    title: "Post-op AKI · ward 4",
    createdAt: at("2026-10-24T15:00:00+05:30"),
    lastMessageAt: at("2026-10-24T16:10:00+05:30"),
    memberIds: [u.doctor, u.priya],
    members: {
      [u.doctor]: member("Dr. Aarav Mehta", "owner", "2026-10-24T15:00:00+05:30"),
      [u.priya]: member("Dr. Priya Raman", "member", "2026-10-24T15:20:00+05:30"),
    },
    inviteToken: "tok_4b8d2f6a1c3e5g7h9j2k4m6n8p1q3r5s",
    inviteActive: true,
    forkedFrom: null,
    aiInFlight: {},
    uploadCounts: {},
  },
  solo("chat_chestpain", "Chest pain, normal troponin", "2026-10-25T07:55:00+05:30"),
  solo("chat_interaction", "Warfarin and clarithromycin", "2026-10-24T18:20:00+05:30"),
  solo("chat_peds", "Febrile infant, 6 weeks", "2026-10-24T11:05:00+05:30"),
  solo("chat_new", "New chat", "2026-10-25T09:50:00+05:30"),
];

export const groupChat = chats[0];
export const soloChat = chats.find((chat) => chat.id === "chat_chestpain") ?? chats[2];
