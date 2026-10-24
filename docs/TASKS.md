# NeuraOS MVP — Tasks

Split from `docs/SPEC.md`, in build order. Launch: **Tue 27 Oct 2026**. Tick a box in the same commit that finishes it.

UI tasks list the API helper they need (`api.*` in `lib/api/client.ts`). The contracts already exist, so build the UI first and wire the call; it works once Dhruti's route lands. Firestore reads (`onSnapshot`) work as soon as the data exists.

If a day slips, cut in this order: voice contributions, reply quoting, member removal by owner, the file selector, group chat (flag off). Never cut guardrails, limits, rules or the spend cap.

## Dhruti — backend

**Sat 24 Oct**
- [x] `alpha-launch` branch, route groups, placeholder pages
- [x] `lib/types.ts`, `lib/limits.ts`, `lib/contracts/*`, `lib/api/client.ts`
- [x] `lib/firebase/client.ts` + `admin.ts`, `lib/server/ai/*` (Vertex calls)
- [x] `firestore.rules`, `storage.rules`
- [x] Shared auth and app shell: `AuthProvider` + `useAuth`, `RequireAuth` (redirect to `/sign-in?next=`), `(app)` layout with sidebar column, admin and sign-in layouts; placeholders for `ChatSidebar`, `UserCard` and the sign-in button
- [ ] Shared server helpers: verify ID token (App Check monitor-only), zod body parsing, `{ error: { code, message } }` responses, one JSON log line per request (no content)
- [ ] `firebase.json` + `firestore.indexes.json` for deploying rules and indexes (chats by `memberIds` + `lastMessageAt`, admin lists by `status` + `submittedAt`)
- [ ] `scripts/set-admin.ts` (admin claim by email) and `scripts/seed-config.ts` (`config/app` defaults)
- [ ] `POST /api/onboarding`: user doc, referral code (8 chars, retry on collision), referral counting in one transaction

**Sun 25 Oct**
- [ ] `POST /api/chats` (`MAX_CHATS_PER_USER`)
- [ ] `POST /api/chats/:id/messages`: membership, per-minute and daily limits, `aiEnabled` and spend cap, user message write
- [ ] AI pipeline: `aiInFlight` slot transaction, guardrail (decline / 108–112 / injection replies), AI message with `replyTo` + `triggeredBy`
- [ ] Context builder: system prompt, last 30 messages, quoted reply, file summaries + full text under `CONTEXT_FILE_TOKEN_BUDGET`, file selector above it
- [ ] Streaming: flush every `STREAM_FLUSH_MS`, finish (`done`, `citedFileIds`, usage, spend shard, clear slot in `finally`), error path, referral qualification on first reply
- [ ] Retry and feedback routes
- [ ] Uploads: `upload-url` (count, size, MIME), `complete` (verify object, extraction), `DELETE` file, `GET /api/files/:fileId/url`

**Mon 26 Oct**
- [ ] Groups: `convert` (shared history / fork with checked files + system message), invite create/rotate/revoke, `join` transaction (`MAX_MEMBERS`), `leave` (with `deleteMyFiles`), remove member
- [ ] Verification: `upload-url`, submit / resubmit
- [ ] Contributions: create, update, `audio-url`, `transcribe`, `submit` with PII check (`CONTRIBUTIONS_PER_DAY`, `MAX_VOICE_*`)
- [ ] Admin: applications and contributions lists + decisions (audit log in the same transaction), users, audit logs, config
- [ ] Spend cap: sum `spend/{today}` shards before each AI call; capacity reply
- [ ] Rules tests: cross-chat reads blocked, own-doc reads only, all client writes denied

**Tue 27 Oct**
- [ ] Deploy `alpha-launch` on App Hosting (`apphosting.yaml`), App Check enforce, Model Armor floor, budget alerts, log-based metrics and alerts
- [ ] Full test plan (SPEC.md section 16) against real Vertex

## Dibyanshu — chat UI

**Sat 24 Oct**
- [ ] `components/chat/ChatSidebar.tsx` (replace the placeholder): sidebar layout and mobile behaviour, `<UserCard />` at the bottom
- [ ] Chat list in the sidebar: `onSnapshot` on `chats` where `memberIds` array-contains uid, ordered by `lastMessageAt`; new chat button — needs `api.chats.create`
- [ ] Chat screen: `onSnapshot` on `messages` (by `createdAt`) and `files` of the open chat; user, AI and system message rows

**Sun 25 Oct**
- [ ] Composer: text (`MAX_MESSAGE_CHARS` counter), send — needs `api.messages.send`
- [ ] File upload UI and file chips (spinner while `processing`, name when `ready`, failed state, delete for uploader/owner; type and size checked before upload) — needs `api.files.uploadUrl`, `uploadToTarget`, `api.files.complete`, `api.files.remove`, `api.files.downloadUrl`
- [ ] AI message states: streaming (live text), error and stale streaming (`STALE_STREAM_SECONDS`) with Retry, declined (`blocked`), emergency notice — needs `api.messages.retry`
- [ ] Feedback buttons (thumbs up/down with optional reason) — needs `api.messages.feedback`
- [ ] @mentions: picker for AI and members, sent as structured `mentions`
- [ ] Reply-to: quote a message, show the quote on the reply (`replyToMsgId`)

**Mon 26 Oct**
- [ ] Make-group consent modal: share-history toggle, file checkboxes, patient-identifier notice — needs `api.groups.convert`
- [ ] Invite modal: copy `/join/{token}`, rotate, revoke — needs `api.groups.createInvite`, `api.groups.revokeInvite`
- [ ] Members modal (owner removes a member) and leave dialog ("Also delete the files I shared?") — needs `api.groups.removeMember`, `api.groups.leave`
- [ ] Join page `/join/[token]`: sign in first if needed, then join and open the chat; invalid and full states — needs `api.groups.join`
- [ ] Limit and error toasts for every `ApiError` code (`RATE_LIMIT`, `DAILY_LIMIT`, `AT_CAPACITY`, `AI_BUSY`, `LIMIT_UPLOADS`, `BAD_FILE`, `GROUP_FULL`, ...)

**Tue 27 Oct**
- [ ] Bug fixes; check every screen at 360 px

## Ashish — account and admin UI

**Sat 24 Oct**
- [ ] Sign-in page `app/sign-in/page.tsx` (replace the placeholder and `GoogleSignInButton`): uses `useAuth().signInWithGoogle`, returns to `?next=` (same-site paths only)
- [ ] `components/account/UserCard.tsx` (replace the placeholder): avatar, name, links to profile / verify / contribute, sign out (`useAuth().signOut`)
- [ ] Onboarding after sign-in: terms acceptance; store `?ref=CODE` in the `REFERRAL_COOKIE_NAME` cookie for `REFERRAL_COOKIE_DAYS`; call onboarding after sign-in; return to the page that asked for sign-in (e.g. the join link) — needs `api.onboarding.complete`
- [ ] Profile and referral link (`/?ref=CODE`, copy button, referral and qualified counts from `users/{uid}`)

**Sun 25 Oct**
- [ ] Verification apply form with certificate and ID proof uploads — needs `api.verification.uploadUrl`, `uploadToTarget`, `api.verification.submit`
- [ ] Verification status page (`pending`, `needs_info` with note and resubmit, `approved`, `rejected`)
- [ ] Contributions list (`onSnapshot` on own `contributions`; locked until `canContribute`)
- [ ] Text contribution editor: save draft, edit — needs `api.contributions.create`, `api.contributions.update`

**Mon 26 Oct**
- [ ] Voice recorder (MediaRecorder, `MAX_VOICE_SECONDS`) with editable transcript — needs `api.contributions.audioUrl`, `uploadToTarget`, `api.contributions.transcribe`, `api.contributions.update`
- [ ] PII warning modal before submit (show flags, fix or confirm) — needs `api.contributions.submit`
- [ ] Admin panel: hidden for non-admins (`admin` claim), applications queue + review, contributions queue + review (with PII flags), users, settings (toggles and spend cap), audit log — needs `api.admin.*`

**Tue 27 Oct**
- [ ] Bug fixes; check every screen at 360 px
