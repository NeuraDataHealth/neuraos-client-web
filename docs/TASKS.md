# NeuraOS MVP — Tasks

Split from `docs/SPEC.md`, in build order. **Code complete: Mon 26 Oct, midnight. Launch: Tue 27 Oct, morning.**
One task per PR; tick its box in that PR. Ownership and the PR workflow are in `AGENTS.md` ("Team").

**How the halves meet:** the UI is built static against fixtures in `lib/fixtures/`, typed with `lib/types.ts` and `lib/contracts`. Hooks return those same types. At integration, each page swaps its fixture for the hook, with no type changes.

**If a day slips,** cut in this order: voice contributions, reply quoting, member removal by owner, the file selector (summaries only), group chat (flag off). Never cut guardrails, limits, rules or the spend cap.

## Already on alpha-launch

- [x] Route groups, placeholder pages, `(app)` / admin / sign-in layouts, `AuthProvider` + `useAuth`
- [x] `lib/types.ts`, `lib/limits.ts`, `lib/contracts/*`, `lib/api/client.ts`
- [x] `lib/firebase/client.ts` + `admin.ts`, `lib/server/ai/*` (Vertex: guardrail, streaming answer, extraction, file selector, transcription, PII check, system prompt, fixed replies)
- [x] `lib/server/http/route.ts` + `errors.ts` (token, App Check monitor-only, admin claim, zod, error mapping, request log); example `app/api/health`
- [x] `firestore.rules`, `storage.rules`

## Dhruti — UI and integration

- [x] **U1 Design system:** tokens, type scale and `components/ui` primitives from the three handoffs (`design/chat`, `design/groups`, `design/admin`)
- [x] **U2 Chat panel** (static, fixtures in `lib/fixtures`): app shell and sidebar, chat list, chat screen, message rows (user, AI streaming, error/retry, declined, emergency, system), composer, file chips, @mention picker, reply-to, feedback, toasts
- [x] **U3 Groups** (static): make-group consent modal, invite modal, members modal, leave dialog, join page and its states
- [ ] **U4 Account pages** (static): sign-in, profile and referral, verification form and status, contributions list, text editor, voice recorder UI, PII warning modal
- [ ] **U5 Admin** (static): overview, applications queue and review, contributions queue and review, users, settings, audit log
- [ ] **I1 Integration:** swap fixtures for hooks page by page; end-to-end test with the real env (SPEC.md section 16); deploy

## Dibyanshu — chat backend and hooks

- [ ] `POST /api/chats`
- [ ] `POST /api/chats/:id/messages`: limits, `aiEnabled` and daily spend cap check, `aiInFlight` slot, guardrail replies, context builder, streaming to Firestore every `STREAM_FLUSH_MS`, finish/error handling, usage and spend shards, referral qualification on first reply (use `lib/server/ai/*`)
- [ ] Retry and feedback routes
- [ ] Uploads: `upload-url`, `complete` with extraction, delete, `GET /api/files/:fileId/url`
- [ ] Groups: `convert` (shared history or fork), invite create/rotate/revoke, `join` (`MAX_MEMBERS` transaction), `leave`, remove member, system messages
- [ ] `hooks/chat`: `useChats`, `useChat`, `useMessages`, `useFiles` (onSnapshot), `useSendMessage`, `useRetry`, `useFeedback`, `useUpload`, `useGroupActions`, `useJoin`

## Ashish — account/admin backend and hooks

- [ ] `POST /api/onboarding` with referral code and referral counting
- [ ] Verification: `upload-url`, submit/resubmit
- [ ] Contributions: create, update, `audio-url`, `transcribe`, `submit` with PII check and limits
- [ ] Admin: applications and contributions lists and decisions (audit log in the same transaction), users, audit logs, config
- [ ] `scripts/set-admin.ts`, `scripts/seed-config.ts`, `firestore.indexes.json`, `firebase.json`
- [ ] `hooks/account`: `useProfile`, `useReferral`, `useVerification`, `useContributions`, `useContribution`, `useVoiceRecorder` (MediaRecorder, `MAX_VOICE_SECONDS`)
- [ ] `hooks/admin`: `useApplications`, `useAdminContributions`, `useAdminUsers`, `useAuditLogs`, `useConfig`
