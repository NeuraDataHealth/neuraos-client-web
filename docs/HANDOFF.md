# NeuraOS alpha: handoff for launch

For the assistant helping Dhruti set up, test and deploy. Read this file, then `docs/SETUP.md` (the runbook), `docs/SPEC.md` sections 1 and 16 (what to test) and `AGENTS.md` (rules). Last updated 8 Nov 2026.

## How to help

- Guide Dhruti one step at a time: say what to click or run, what a good result looks like, then wait for "done" or the output before the next step.
- Never ask for, print or paste keys, `.env.local` or anything in `.secrets/`. Never commit them.
- Never run `bun run dev`, `bun run build` or `bun run start` yourself; Dhruti runs the app. You may run `bun run lint`, `bun run typecheck`, `bun run check:setup`, `bun run seed:config` and `bun run set-admin` when asked.
- Cloud (`gcloud`) commands run in **Cloud Shell** (Google Cloud console, `>_` icon), not on the laptop.
- Push only to `origin` = `swaindhruti/neuraos-client-web`, branch `alpha-launch`. Never force-push.
- Fictional test data only, never real patient details.

## Project facts

| | |
| --- | --- |
| GCP / Firebase project | `neuraos` (project number `1078342157419`) |
| Firestore database | `neuraos` (not `(default)`), `asia-south1` |
| Storage bucket | `neuraos.firebasestorage.app` |
| Gemini | Vertex AI, location `global`; answers `gemini-3.8-flash`, fast `gemini-3.5-flash-lite` |
| Hosting | Firebase App Hosting, config in `apphosting.yaml`, live branch `alpha-launch` |
| Admin | Firebase Auth custom claim `admin: true` (set by `bun run set-admin`) |

There is no `AI_MODE` switch any more (SPEC still mentions it): the app always calls real Gemini, so local testing costs real money. The per-user ($0.60) and app-wide (`dailySpendCapUsd`, $15) daily caps apply locally too.

## Done (code complete for the alpha)

- AI chat: streaming answers in Markdown, guardrail (non-medical, emergency 108 / 112, injection), retry, feedback, Vertex retries on 429 / 503, spend tracking against Gemini prices.
- Answer styles on the profile (concise default, detailed, exam notes), Indian context in every answer, prompt pitched to the user's role.
- Onboarding: Google sign-in → `/welcome` role step (role, department, year).
- Uploads: PDF, Word (.docx), JPEG, PNG, WEBP; type, size, page and password checks; daily allowance shown in the composer; files deleted after 30 days.
- Groups: make group, invite link (7 days), join, leave, remove member, owner deletes chat or group.
- Limits for the launch test (`lib/limits.ts`, SPEC section 11).
- Account: profile, referrals, doctor verification, case-study contributions (text and voice).
- Admin: applications, contributions, users, audit log, settings and spend.
- Landing page; "Try it" opens sign-in.
- Lint and typecheck pass. Nothing has run against the real Firebase project or Gemini yet.

**Known open item:** image and PDF reading sends Gemini a `gs://` link, which needs the Vertex AI service agent to read the bucket (fix in phase 1, step 6). Everything else open is in `docs/TASKS.md`.

## Phase 0: push the latest work

1. `git status`: if there are uncommitted changes (answer styles, tab title, docs), run `bun run lint` and `bun run typecheck`, then commit and `git push origin alpha-launch`.
2. Check: `git log origin/alpha-launch -1` matches local `HEAD`.

## Phase 1: set up the real project (once)

Follow `docs/SETUP.md` "Before any local testing", in order:

1. **Rules:** Firebase console → Firestore → database `neuraos` → Rules → paste `firestore.rules` → Publish. Storage → Rules → paste `storage.rules` → Publish.
2. **Config doc:** `bun run seed:config` (creates `config/app`). For group testing, set `groupsEnabled` to `true` in the console afterwards.
3. **Indexes:** the 4 composite indexes from `firestore.indexes.json` (console steps in SETUP step 3, or `firebase deploy --only firestore:indexes` if the Firebase CLI is logged in). Wait until all show "Enabled".
4. **File retention:** TTL policies on `files.expiresAt` and `pendingFiles.expiresAt`, then in Cloud Shell `gcloud storage buckets update gs://neuraos.firebasestorage.app --lifecycle-file=storage.lifecycle.json` (upload the file to Cloud Shell first).
5. **Gemini quota:** GCP console → IAM & Admin → Quotas → filter Vertex AI and both models; requests and tokens per minute should cover the testers.
6. **Let Gemini read uploads** (Cloud Shell):

   ```bash
   gcloud config set project neuraos
   gcloud storage buckets add-iam-policy-binding gs://neuraos.firebasestorage.app \
     --member=serviceAccount:service-1078342157419@gcp-sa-aiplatform.iam.gserviceaccount.com \
     --role=roles/storage.objectViewer
   ```

   If it says the service account doesn't exist, run `gcloud beta services identity create --service=aiplatform.googleapis.com` first.

## Phase 2: local check and make yourself admin

1. `.env.local` and the key in `.secrets/` are in place (README "Local setup with real Firebase"); `GOOGLE_APPLICATION_CREDENTIALS` is the absolute path to the key.
2. `bun run check:setup`: all four checks PASS (Firestore, Storage, signed URLs, Gemini). On a FAIL, fix that first.
3. Dhruti runs `bun run dev` and opens http://localhost:3000.
4. **Make yourself admin:**
   1. Sign in with Google once (this creates the Auth user and the user doc), finish the Welcome role step.
   2. In the repo: `bun run set-admin <your-google-email>`. It should report the claim was set.
   3. Sign out (Profile → Sign out) and sign in again, so the new token carries the claim.
   4. Open http://localhost:3000/admin: the admin panel loads. If it says not allowed, sign out and in once more.

   The claim belongs to the Firebase project, so the same account is admin on the live URL too (sign out and in there once).

## Phase 3: test locally (real Firebase, real Gemini)

Run SPEC section 1 (launch criteria) and every checklist in section 16. Use two Google accounts (or a teammate) for groups. Minimum pass:

1. Sign in → Welcome role step → chat. Sign out and in; chats persist.
2. Ask a medical question in each answer style (switch on Profile): concise gives numbered points, detailed gives sections, exam notes gives high-yield points; all use Indian guidelines and drugs.
3. Ask a non-medical question (declined) and an emergency one (108 / 112).
4. Upload a fictional PDF report and an image; answers cite the right file. A `.docx` works. A password-protected PDF and an over-10 MB file are refused. The composer shows uploads left today.
5. Make a group, copy the invite, join from the second account, both @mention the AI; leave; owner deletes the group.
6. Limits: 11 messages in a minute (11th blocked); daily limits per SPEC section 16.
7. Admin: users list shows the role, approve a verification, review a contribution, change a setting, spend card shows today's cost.
8. The browser tab shows the chat's title.

Write anything that fails into `docs/TASKS.md` (who owns it per `AGENTS.md`), fix, and re-test before deploying.

**Common errors:**

| Error | Likely cause |
| --- | --- |
| `permission-denied` in the browser console | rules not published, or wrong database |
| `FAILED_PRECONDITION` / "requires an index" | index missing or still building (the error has a create link) |
| Upload PUT blocked by CORS | bucket CORS missing `http://localhost:3000` or the live URL |
| Signed URL error | service account lacks `roles/iam.serviceAccountTokenCreator` |
| File stuck "failed" after upload | phase 1 step 6 not done, or Gemini quota |
| "NeuraOS is at capacity today" | `aiEnabled` is false or the daily spend cap was reached |

## Phase 4: deploy

Follow `docs/SETUP.md` "Deploy":

1. `apphosting.yaml` is in the repo with the public Firebase config and Gemini settings. No secrets in it; credentials come from the App Hosting service account.
2. Firebase console → App Hosting → Create backend → GitHub `swaindhruti/neuraos-client-web`, live branch `alpha-launch`, region closest to India. Wait for the first rollout.
3. Cloud Shell: give `firebase-app-hosting-compute@neuraos.iam.gserviceaccount.com` its roles (commands in SETUP Deploy step 3).
4. Authentication → Settings → Authorized domains → add the `*.hosted.app` URL. Add the live URL to bucket CORS (SETUP Deploy step 4).
5. App Hosting → Rollouts → new rollout so the roles apply.

Every later push to `alpha-launch` deploys automatically.

## Phase 5: test live, then open to testers

1. On the live URL, sign out and in (admin claim), open `/admin`.
2. Repeat the phase 3 minimum pass.
3. Admin → Settings: `aiEnabled` on, `groupsEnabled` on when groups passed, daily spend cap $15.
4. Share the link with a small first batch. Watch the spend card and Cloud Logging (App Hosting → Logs) daily; adjust limits in `lib/limits.ts` if needed.

**Rollback:** App Hosting → Rollouts → roll back to the previous rollout, or switch `aiEnabled` off in Admin → Settings to stop AI spend at once.
