# NeuraOS MVP — Tasks

Split from `docs/SPEC.md`, in build order. **Alpha deploy from `swaindhruti/neuraos-client-web` `alpha-launch` once C1, C2, C4 and their integration pass local testing. Groups ship behind `groupsEnabled: false` until C3 is tested.**
One task per PR; tick its box in that PR, and only in your own section. Ownership and the PR workflow are in `AGENTS.md` ("Team").

**Done means end to end:** route + hook + UI wired (no fixtures) + clicked through with `bun run dev` against the real Firebase project (setup: README "Local setup with real Firebase").

**How the halves meet:** the UI was built against fixtures in `lib/fixtures/`, typed with `lib/types.ts` and `lib/contracts`. Hooks return those same types. Each page reads its data in a client `*Container.tsx` (see `components/account/*Container.tsx` and `components/admin/*Container.tsx`); integrating a page means swapping the fixture in its container for the hook, with no type changes.

**What each hook must feed:** the static UI already takes these props, so return exactly these shapes (types from `lib/types.ts`, `WithId<T>` for documents, contracts for admin lists):

| Hook | Replaces fixture in | UI that consumes it |
| --- | --- | --- |
| `useChats` | `components/chat/ChatSidebarContainer.tsx` (`chats`) | `ChatSidebar` → `chats: WithId<ChatDoc>[]` |
| `useChat`, `useMessages`, `useFiles` | `components/chat/ChatScreenContainer.tsx` | `ChatScreen` → `chat`, `messages: WithId<MessageDoc>[]`, `files: WithId<FileDoc>[]` |
| `useSendMessage`, `useRetry`, `useFeedback`, `useUpload` | static stand-ins in `ChatScreen`, `usePendingUploads` | `Composer` `onSend(ComposerDraft)`, `AiMessage` `onRetry` / `onRate` |
| `useGroupActions`, `useJoin` | `GroupDialogs`, `app/join/[token]/page.tsx` | convert / invite / remove / leave / join callbacks, `JoinScreen` |
| Account and admin hooks | done (A1, P3, P4) | live on profile, verify, contribute and admin pages |

The chat and join pages can still be opened without sign-in with `NEXT_PUBLIC_UI_PREVIEW=true` in `.env.local` (dev only) to see what each hook feeds. Real pages must not import `lib/fixtures` once integrated.

**If a day slips,** cut in this order: voice contributions, reply quoting, member removal by owner, the file selector (summaries only), group chat (flag off). Never cut guardrails, limits, rules or the spend cap.

## Done on alpha-launch

- [x] Route groups, layouts, `AuthProvider` + `useAuth`; `lib/types.ts`, `lib/limits.ts`, `lib/contracts/*`, `lib/api/client.ts`
- [x] `lib/firebase/client.ts` + `admin.ts` (named database `neuraos`), `lib/server/ai/*` (Vertex: guardrail, streaming answer, extraction, file selector, transcription, PII check, system prompt, fixed replies)
- [x] `lib/server/http/route.ts` + `errors.ts`; `firestore.rules`, `storage.rules`
- [x] U1–U5 UI (design system, chat panel, groups, account pages, admin)
- [x] Real Firebase project connected: `apphosting.yaml`, `bun run check:setup` / `seed:config` / `set-admin`, `docs/SETUP.md`
- [x] Sign-in and onboarding: landing "Try it" → Google sign-in → `POST /api/onboarding` (user doc, referral code, referral cookie); sign out
- [x] **A1** hooks: `hooks/account/*` (`useProfile`, `useReferral`, `useVerification`, `useContributions`, `useContribution`, `useContributionActions`, `useVoiceRecorder`), `hooks/admin/*` (`useApplications`, `useAdminContributions`, `useAdminUsers`, `useAuditLogs`, `useConfig`), shared `hooks/firestore/{useDocument,useCollection}`
- [x] Profile: live user doc, save (`PATCH /api/profile`), referral card
- [x] Verification: document uploads (signed URL), submit and resubmit, live status
- [x] Contributions incl. voice: drafts, record → upload → transcribe, submit through the server PII check, list and read-only view
- [x] Admin panel: overview, application and contribution queues and reviews (signed document and audio links), decisions with audit log, users, settings, audit log

## Ashish — AI chat (main track; C1 first, it is the critical path)

All chat API routes use the segment `app/api/chats/[chatId]/`.

- [x] **C1** `POST /api/chats`
- [x] **C1** `POST /api/chats/[chatId]/messages`: membership, per-minute and daily limits, `aiEnabled` and daily spend cap, `aiInFlight` slot transaction, guardrail replies (decline / 108–112 / injection), context builder, streaming to Firestore every `STREAM_FLUSH_MS`, finish and error handling (usage and spend shards, clear the slot in `finally`), referral qualification on first reply. Use `lib/server/ai/*`.
- [x] **C1** Retry and feedback routes
- [x] **C1** Shared PR: `guardrailLabel` on AI `MessageDoc` (`lib/types.ts`), so the UI tells emergency from declined without reading the text
- [x] **C4** `hooks/chat`: `useChats`, `useChat`, `useMessages`, `useFiles`, `useSendMessage`, `useRetry`, `useFeedback` (build on `hooks/firestore/*`)
- [x] **Chat integration**: chat list (`ChatSidebarContainer`), `app/(app)/chat/**`, new chat, `ChatScreen`, message rows (streaming, error/retry, declined, emergency, system), composer send, @mentions, reply-to, feedback, limit and error toasts. Remove chat fixtures from the real pages.
- [x] **E2E** SPEC.md section 16 "Solo chat" checklist with real Gemini

## Dibyanshu — uploads, groups, gaps, release readiness

- [x] **C2** Uploads: `POST /api/chats/[chatId]/files/upload-url`, `POST .../files/[fileId]/complete` (verify the object, extraction), `DELETE .../files/[fileId]`, `GET /api/files/[fileId]/url`; `hooks/chat/useUpload.ts`
- [x] **Upload integration**: `AttachButton`, `AttachmentChips`, `CaseFiles`, `FileChip`, `usePendingUploads`. `ChatScreen` and `Composer` belong to Ashish: agree with him first and wire uploads in a separate small PR after his chat integration lands.
- [x] **C3** Groups: `convert` (shared history or fork), invite create/rotate/revoke, `POST /api/join/[token]` (`MAX_MEMBERS` transaction), `GET /api/join/[token]` preview (contract in `lib/contracts/groups.ts`), `leave`, remove member, system messages; `hooks/chat/useGroupActions.ts`, `hooks/chat/useJoin.ts`
- [x] **Groups integration**: `components/groups/**`, `app/join/**`, header group actions. Test with 2–3 accounts, then set `config/app.groupsEnabled` to `true`.
- [x] **Gap** `GET /api/admin/spend` (sum of today's spend shards) wired into the admin `SpendCard` and Settings (both show "—" today)
- [x] **Gap** Admin route to set a user's `canContribute`, wired to the switch in the user drawer (read-only today)
- [x] **Gap** Referral names on the profile, if cheap (evaluated: omitted as not cheap per SPEC §5 data model and privacy rules)
- [x] **Release readiness**: `bun run build` passes; no `lib/fixtures` imports in real pages (preview mode only); `firestore.indexes.json` lists every index the app's queries need; `apphosting.yaml` up to date
- [x] **E2E** SPEC.md section 16 "Uploads" and "Groups" checklists

## Fixed after review (5 Nov, on alpha-launch)

Review of PRs #2 and #3 found these; all fixed in `13e66e4`, `171e32a` and `2dd2f3e`. Lint and typecheck pass; nothing has been run against Firebase or Gemini yet.

- [x] **Spend cap was about 5× too loose:** real Vertex prices for both models in `lib/server/ai/pricing.ts` (switches on 1 Jan 2027); every AI call (guardrail, file selector, extraction, PII check, transcription, answer) is added to `spend/{today}` via `lib/server/spend.ts`
- [x] **Day boundary:** chat used the UTC date while admin and contributions used IST; one `todayKey()` in `lib/day.ts` (IST) everywhere
- [x] **Guardrail failed open:** a classifier error now turns the reply into Retry; retry re-runs the guardrail and checks the daily limit
- [x] Per-minute and daily limits in one transaction; two members retrying the same reply start only one
- [x] Context: history ends at the question (a retry never sees later messages), skips empty or failed replies, includes the quoted message; citations are the files the answer names; an empty answer becomes Retry
- [x] `messages.ts` split into `lib/server/chat/{context,quota,reply,messages}.ts`
- [x] Contribution submit no longer resets the chat's per-minute window; transcription and PII checks are counted in spend
- [x] Structured-output errors no longer put raw model output (message text, transcripts) in the logs
- [x] **Uploads:** quota reserved in a transaction at `upload-url` (parallel uploads can't pass the limit); metadata waits in server-only `pendingFiles` until `complete`, so abandoned uploads never show as files; missing or invalid uploads give the quota back; `complete` is idempotent
- [x] **Attachments:** the composer now sends the ready files' ids (always `[]` before); the server checks they are ready files the sender uploaded; failed chips no longer block sending
- [x] **New-chat screen:** attaching a file creates the chat first (files were faked as "ready" and lost); the chat opens as soon as the message is written instead of after the whole answer
- [x] Sidebar case files read the open chat live; the chat page no longer imports fixtures for its title
- [x] **Answers in Markdown:** descriptive answer format in the system prompt (opening answer, `##` sections, bullets, bold values, tables, bold file names); `components/chat/AiMarkdown.tsx` renders it (adds `react-markdown`, `remark-gfm`; raw HTML, images and unsafe links dropped)

**Still open (not blocking the alpha):**

- [ ] Images go to Gemini as extracted text only; SPEC section 8 says raw images go as `gs://` URIs when the selector picks them (left as is for now; fix with the Firebase setup)
- [x] Abandoned uploads: `pendingFiles` docs expire after a day (Firestore TTL) and Storage objects under `chats/` after 30 days (`storage.lifecycle.json`); see `docs/SETUP.md` step 4
- [x] The chat tab title shows the open chat's title (set by `ChatScreenContainer` once the chat loads)

## Launch-test limits and onboarding (6 Nov, on alpha-launch)

Lint and typecheck pass; checked with Bun scripts (pricing, IST day, Markdown render, file inspection with sample PDF / DOCX, role prompt lines). Not yet run against Firebase or Gemini.

- [x] **Limits** (`lib/limits.ts`, SPEC section 11): 4 members; uploads 3 per user per chat, 10 per chat, 5 and 25 MB per user per day; 30 solo chats and 10 owned groups (the next replaces the oldest after a confirm), 15 joined groups, 3 groups made and 5 joined a day, invites expire after 7 days; 30 AI replies and $0.60 of AI cost per user a day, 80 replies per group a day, 3 retries per reply, 2,500 output tokens per answer
- [x] Files deleted after 30 days (Firestore TTL in `firestore.indexes.json`, `storage.lifecycle.json`); see `docs/SETUP.md` steps 4–5
- [x] Vertex 429 / 503 retried twice with backoff
- [x] **Word and WEBP uploads**: `.docx` converted to text (`mammoth`), file signature checked, PDFs opened with `pdf-lib` (password-protected rejected, at most 30 pages)
- [x] **Onboarding role step**: `/welcome` after the first sign-in (role, department, year), editable on the profile, shown in admin users; the answer prompt adds one fixed line per role from the asker's user doc

**Also done:**

- [x] Daily upload allowance in the composer ("N of 5 uploads left today"; picks past the count or the 25 MB are refused before uploading) via `hooks/chat/useUploadAllowance.ts`
- [x] Owners delete a chat or group from the top bar (confirm, then `DELETE /api/chats/:id`)
- [x] **Admin:** spend card and Settings refetch today's spend every minute (clear loading / error text); settings saves merge and log only the changed fields ("Groups: off → on"); contributor switch shows as "Can contribute" pills; audit log loads older entries 100 at a time; the user drawer shows today's usage against the limits (`GET /api/admin/users/:id/usage`)
- [x] Members with the same name: avatar rows and admin document cards no longer use names as React keys (membership and mentions already use uids)
- [x] **Answer style** on the profile: concise (default, numbered points with key numbers), detailed (`##` sections) or exam notes (high-yield points, mnemonics); stored as `users.answerStyle` from a fixed list (`lib/answerStyle.ts`) and turned into a fixed format block in the system prompt; every style adds the Indian-context rules (guidelines, drugs, units, PHC / referral, 108 / 112)

## Dhruti — review, verify, deploy

- [ ] Review and merge every PR into `alpha-launch`
- [ ] Final end-to-end verification of SPEC.md section 1 (launch criteria) on the real project
- [ ] Deploy per `docs/SETUP.md`, then repeat the launch criteria on the live URL
