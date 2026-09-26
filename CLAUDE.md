# TEE-2026 Platform — Claude Code Session Context

## Project Overview

**Tomorrow's Earth Expo 2026 (TEE-2026)** — A school expo platform for student project submission
and public voting. Built with React (Vite + Wouter), tRPC, Drizzle ORM (PostgreSQL), Supabase
storage, and deployed on Vercel.

**Key paths:**
- `client/src/` — React frontend
- `server/` — tRPC routers and DB helpers
- `server/routers.ts` — main app router (inline + imported sub-routers)
- `server/routers/` — split routers: `projects.ts`, `admin.ts`, `auth.ts`, `notifications.ts`
- `server/db.ts` — all Drizzle DB helper functions
- `drizzle/schema.ts` — full database schema
- `shared/const.ts` — shared constants (phases, deadlines, `canSubmitProjects()`)

---

## What's Already Built

### Project Submission
- 3-step `ProjectForm` (Basic Info → Media Upload → Review & Submit)
- `AssignmentWizard` (teacher + category + subcategory selection)
- Client-side Zod validation, Supabase direct uploads
- `projects.submitProject` tRPC mutation (student-only)
- Rich DB schema: `abstract`, `sdgAlignment`, `researchMethod`, `experimentDetails`, etc.
- `projects.approve` / `projects.reject` mutations (teacher/admin)
- Teacher feedback system: `createFeedback`, `sendFeedback`, `getFeedback`
- Grading rubrics: `createRubric`, `getRubrics`
- Teacher↔student messaging: `sendMessage`, `getMessages`

### Voting
- `voting.vote` public procedure with DB-level dedup on `(voterIdentifier, projectId)`
- `voting.getLeaderboard` aggregation
- Admin-controlled `votingOpen` flag in `systemConfig` table
- `admin.toggleVoting` and `admin.getVotingStats`

### Student Dashboard
- Tabbed layout: Dashboard / Projects / Impact / Profile
- Stats cards, QuickChart charts, weather widget, Wikipedia integration
- Carbon-impact estimator

### Teacher / Admin
- `teacher.getStudentSubmissions` — projects scoped to supervisor
- `teacher.getPendingReviews` — queue of submitted projects
- `teacher.getAnalytics` — daily review metrics
- `admin.toggleVoting`, user role management, category/subcategory CRUD

### Notifications (schema only — NOT wired)
- Full `notifications` table with typed enum:
  `project_submitted`, `project_approved`, `project_rejected`, `deadline_reminder`, `system_alert`
- `server/routers/notifications.ts` exists but **is NOT mounted** in `server/routers.ts`

---

## 9 Critical Bugs Found During Audit

| # | Bug | Impact |
|---|-----|--------|
| 1 | `voting.vote` is public but `projects.getAll` requires teacher/admin auth | Voting broken for all public visitors |
| 2 | Two conflicting voting pages (`Vote.tsx` routed, `VotingPage.tsx` orphaned) | Dead code + UX confusion |
| 3 | `userHasVoted` hardcoded `false` in `VotingPage.tsx` | "You voted" state never reflected |
| 4 | Anonymous voter ID from localStorage only — clear it → unlimited re-voting | Vote integrity broken |
| 5 | `notifications` router not mounted in `server/routers.ts` | Zero notifications ever delivered |
| 6 | Assignment stored only in `localStorage` — clears on device switch | Data loss + teachers can't see pre-submission |
| 7 | Subcategory IDs computed by static index math, not from DB | Wrong category on any admin reorder |
| 8 | `submissionHistory` table exists but never written to | No audit trail |
| 9 | Submission deadline in `shared/const.ts` but `submitProject` never checks it | Deadline unenforceable |

---

## Implementation Progress

### ✅ Phase 1 — Fix Voting Pipeline — COMPLETED

**Goal:** Public visitors can see approved projects and cast one reliable vote per project.

**Changes made:**

`server/db.ts`
- Added `getPublicProjects()` — returns only `approved | finalist` projects with field allowlist:
  `id, title, teamName, grade, status, thumbnailUrl, abstract, categoryId, subcategoryId`
- Added `getVotesByVoter(voterIdentifier)` — returns `{ projectId }[]` for a given voter

`server/routers/projects.ts`
- Added `projects.getPublic` as `publicProcedure` — safe for unauthenticated visitors

`server/routers.ts`
- Added `votingRateLimit` Map + `getClientIp()` (respects `x-forwarded-for`)
- `voting.vote` now enforces **5-second per-IP cooldown** via `TOO_MANY_REQUESTS`
- Added `voting.getUserVotes` public procedure — returns `number[]` of voted project IDs

`client/src/pages/Vote.tsx`
- Replaced `projects.getAll` (auth-gated) with `projects.getPublic` ✓
- Loads prior votes from `voting.getUserVotes` — "Voted" button state now accurate ✓
- Added `votingOpen` gate via `config.get({ key: "votingOpen" })` ✓
- Vote button disabled when `!isVotingOpen` ✓
- Uses `mutate` instead of `mutateAsync` ✓

`client/src/pages/VotingPage.tsx`
- **Deleted** (orphaned page, was never routed, had hardcoded `userHasVoted = false`)

---

### 🔄 Phase 2 — Assignment to Server — COMPLETED (session 2)

**Goal:** Assignment survives device switch; teachers see assigned students before submission; IDs
are authoritative from DB.

**Changes made:**

`server/db.ts`
- Added `updateAssignment(studentId, data)` — for upsert support when status = unlocked
- Added `getAssignmentsByTeacherName(teacherName)` — full join with `users`, `categories`,
  `subcategories` for teacher view

`server/routers.ts`
- `assignments.create` updated to **upsert semantics**:
  - No assignment → `INSERT`
  - Exists + `status = assigned` → throws "Assignment is locked"
  - Exists + `status = unlocked/reset` → `UPDATE`
- Added `assignments.getByTeacher` as `teacherProcedure` — uses `ctx.user.name` to scope results

`client/src/components/AssignmentWizard.tsx`
- Now fetches real DB category IDs via `trpc.categories.getAll` (matches by slug/name)
- Fetches real DB subcategory IDs via `trpc.subcategories.getByCategory` (enabled when category
  is selected, matches by name)
- Calls `assignments.create` mutation on submit — server-persisted ✓
- Writes to `localStorage` as a cache after mutation success ✓
- Submit button has `isPending` guard ✓

`client/src/pages/ProjectSubmissionPage.tsx`
- Added `assignments.getMyAssignment` query as primary data source
- Sync effect: when `localStorage` is empty but DB has an assignment → reconstructs
  `localStorage["project-setup"]` from server data (cross-device support) ✓
- Uses `serverAssignment` to set `hasSetup = true` independently of localStorage ✓

`client/src/pages/TeacherDashboard.tsx`
- Added **"Students" tab** with `trpc.assignments.getByTeacher` query
- New `AssignmentCard` component: student name, email, category, subcategory, status, date ✓

---

### ✅ Phase 3 — Submission Integrity & Deadline Enforcement — COMPLETED (session 3)

**Goal:** Submissions respect the phase gate, drafts work, and every status change is audited.

**Changes made:**

`server/routers/projects.ts` → `submitProject`
- Calls `canSubmitProjects()`; throws `PRECONDITION_FAILED` if false ✓
- Server-side cross-check that `subcategoryId` belongs to `categoryId` ✓
- Writes `submissionHistory` row (non-blocking — submission survives audit-table failure) ✓

`server/routers/projects.ts` — new mutations
- `projects.saveDraft` — `status = "draft"`, no deadline gate, idempotent upsert ✓
- `projects.updateMyProject` — owner-only edit before `SUBMISSION_DEADLINE`; on update sets
  `status = "submitted"` + writes history row with action `"revised"` ✓

`server/db.ts` — new helpers
- `createSubmissionHistory(data)` — inserts a row on every status change ✓
- `updateProjectStatusWithHistory(projectId, updates, history)` — status update + history
  insert wrapped in a single DB transaction ✓

`server/routers.ts` → `teacher.approve`, `teacher.reject`
- Both now call `updateProjectStatusWithHistory` (atomic status + history) ✓
- Insert `project_approved` / `project_rejected` notifications for `project.createdBy` ✓

`server/routers.ts` → `upload.getUploadUrl`
- MIME allow-list: JPEG/PNG/WebP/GIF, MP4/WebM/MOV, PDF/Word/PowerPoint ✓

`client/src/components/ProjectForm.tsx`
- Client-side size guards: images > 10 MB, videos > 500 MB rejected before upload ✓

`server/projects.submission.test.ts`
- Full suite: 60 tests green; mocks `canSubmitProjects` for deterministic submission tests ✓

---

### ✅ Phase 4 — Wire Notifications — COMPLETED (session 3)

**Goal:** The dashboard "Feedback Pending" chip and notification bell actually mean something.

**Changes made:**

`server/routers.ts`
- Mounted `notifications: notificationsRouter` in `appRouter` ✓

`server/routers/notifications.ts`
- `deleteNotification` verified to use `.delete(notifications)` (not `set({ read: true })`) ✓

`server/routers.ts` → `teacher.approve` / `teacher.reject`
- Insert `project_approved` / `project_rejected` notifications for `project.createdBy` ✓

`server/routers/projects.ts` → `submitProject`
- Inserts `project_submitted` notification for `supervisorId` ✓

`client/src/components/Navigation.tsx`
- Bell icon with unread count badge via `notifications.getUnreadCount` (60s stale + refetch) ✓

`client/src/pages/StudentDashboard.tsx`
- `feedbackCount` derived from `unreadNotifData?.unreadCount` + rejected projects ✓

**Risk:** Low. All additive. Gate email sends behind env var so local dev works without SMTP.

---

### ✅ Phase 5 — Revision Loop & Rich Fields — COMPLETED (session 5)

**Goal:** Students see rejection reason, can revise, and can fill the rich fields `ProjectDetail`
already renders.

**Changes made:**

`server/routers/projects.ts`
- Added `projects.getMyProjectById` — student-only query authorized by `createdBy` ✓
- Extended `projects.updateMyProject` input with `abstract`, `scientificQuestion`,
  `sdgAlignment` (1–17), `researchMethod`, `experimentDetails`, `dataExplanation`;
  values written via the existing transactional `updateProjectStatusWithHistory` ✓

`client/src/components/ProjectDetailsStep.tsx` (NEW)
- New step 2 of 4: abstract, scientific question, SDG 1–17 multi-select (chip UI),
  research method, experiment details, data explanation ✓

`client/src/components/ProjectForm.tsx`
- Added optional rich fields to schema; StepBar now 4 steps ✓
- `initialData` accepts rich fields + `id`; when `id` present the form calls
  `updateMyProject` (revision mode) instead of `submitProject` ✓
- Submit payload includes all rich fields ✓

`client/src/pages/ProjectEditPage.tsx` (NEW) + route `/project/:id/edit`
- Loads project via `projects.getMyProjectById`, passes `initialData` to `ProjectForm` ✓

`client/src/components/MyProjectsDashboard.tsx`
- `rejectionReason` already surfaced for rejected projects ✓
- New "Revise & Resubmit" CTA on rejected cards → navigates to `/project/:id/edit` ✓

**Risk:** Low-Medium. Keep form below 600 lines by extracting the new step.
**Depends on:** Phase 3 (deadline enforcement), Phase 4 (notifications)

---

### 📋 Phase 6 — Public Browse & Search — TODO

**Goal:** Anyone can find and explore projects without knowing the category in advance.

**Files to change:**

`server/db.ts`
- Add text-search index migration on `projects.title` + `projects.teamName`
- Extend `getPublicProjects()` to accept `{ q?, categoryId?, grade?, sort, limit, offset }`

`server/routers/projects.ts`
- Update `projects.getPublic` to accept filter/sort/pagination input
- Add `ILIKE` search on `title` + `teamName`

`client/src/pages/InnovationHub.tsx` (or new `client/src/pages/Projects.tsx`)
- Add filter bar: search input, category select, grade select, sort (newest/votes/featured)
- Add infinite scroll or pagination
- Mirror all filters to URL query params (per web patterns: "URL as state")

`client/src/pages/ProjectDetail.tsx`
- Add proper Open Graph / Twitter Card meta tags (requires thumbnail from Phase 8)

**Risk:** Low. Text search is the only real schema work.
**Depends on:** Phase 1 (`getPublic` base), Phase 8 (thumbnails for OG images)

---

### 📋 Phase 7 — Voting Integrity & Results — TODO

**Goal:** Votes are trustworthy enough to crown a winner; results are publicly viewable after close.

**Files to change:**

`drizzle/schema.ts` + new migration
- Add `voterIpHash varchar(64)` column to `votes` table
- Add unique index on `(projectId, voterIpHash)`

`server/db.ts`
- Update `createVote` to also hash and store the client IP
- Update `hasUserVoted` to check both `voterIdentifier` AND `voterIpHash`

`server/routers.ts` → `voting.vote`
- Hash `getClientIp(ctx.req)` with SHA-256 before storing
- Optional: add Cloudflare Turnstile token verification (gate behind `TURNSTILE_SECRET_KEY` env var)

`server/db.ts` + `server/routers.ts`
- Extend `getVotingLeaderboard` to accept optional `{ categoryId? }` for per-category rankings

`client/src/pages/` → new `VotingResults.tsx`
- Standalone results page readable after voting closes (`/voting-results`)
- Per-category leaderboard tabs

`client/src/pages/Vote.tsx`
- Add category filter tabs so voters can browse by category

`client/src/App.tsx`
- Add `/voting-results` route

**Risk:** Medium. Turnstile requires secrets; gate behind env var so CI still passes.
**Depends on:** Phase 1

---

### 📋 Phase 8 — Media & Thumbnails — TODO

**Goal:** Project cards on `/vote` and `/innovation-hub` show actual thumbnails.

**Files to change:**

`server/routers/projects.ts` → `submitProject`
- After inserting project, trigger async thumbnail generation from `imageUrls[0]`
- Use `sharp` to resize to 600×400 WebP, store in Supabase, update `thumbnailUrl`

`client/src/components/ProjectForm.tsx`
- Add client-side file size guard before upload: reject images > 10 MB, videos > 500 MB
- Show clear error message with the limit

`server/routers.ts` → `upload.getUploadUrl`
- Add MIME allow-list: `image/jpeg`, `image/png`, `image/webp`, `video/mp4`, etc.
- Reject unknown MIME types before issuing upload URL

**Risk:** Medium. Thumbnail generation adds server CPU; run async so it doesn't block submission.
**Depends on:** Phase 3 (submission integrity)

---

### 📋 Phase 9 — Team Members — TODO

**Goal:** Multi-student teams can collaborate on a single project.

**Files to change:**

`client/src/components/ProjectForm.tsx`
- Add "Team Members" step: email lookup → invite by email
- Update `teamMemberIds` JSON field on invite accept

`server/routers/projects.ts`
- Add `projects.inviteTeamMember` — sends notification + email to invitee
- Add `projects.acceptTeamInvite` — adds `userId` to `teamMemberIds` JSON
- Update `updateMyProject` authorization to allow any team member (not just `createdBy`)

**Risk:** Medium-High. Touches auth/identity flow.
**Depends on:** Phase 4 (notifications), Phase 5 (revisions + `updateMyProject`)

---

### 📋 Phase 10 — Admin Moderation UX — TODO

**Goal:** Reviewers have a usable, scannable queue with side-by-side review.

**Files to change:**

New page: `client/src/pages/ReviewQueue.tsx` (route: `/teacher/review-queue`)
- Filtered list of `status = "submitted"` projects scoped to `supervisorId = me`
- Side-by-side: project preview on left, rubric scorer + feedback box on right
- "Request changes" button: sets `status = "rejected"` + writes `rejectionReason` +
  inserts notification + history row (all pieces exist after Phase 4)

`client/src/App.tsx`
- Add `/teacher/review-queue` route (protected, teacher/admin only)

`client/src/pages/TeacherDashboard.tsx`
- Add CTA button "Open Review Queue" linking to the new page

**Risk:** Low. Purely additive UI work using existing mutations.
**Depends on:** Phase 3, Phase 4

---

## Effort Summary

| Phase | Status | Effort | Risk |
|-------|--------|--------|------|
| 1 — Fix Voting Pipeline | ✅ DONE | 2d | Medium |
| 2 — Assignment to Server | ✅ DONE | 1.5d | Medium |
| 3 — Submission Integrity | ✅ DONE | 1d | Medium-High |
| 4 — Wire Notifications | ✅ DONE | 1d | Low |
| 5 — Revision Loop & Rich Fields | ✅ DONE | 1.5-2d | Low-Medium |
| 6 — Public Browse & Search | 📋 TODO | 1-1.5d | Low |
| 7 — Voting Integrity & Results | 📋 TODO | 1d | Medium |
| 8 — Media & Thumbnails | 📋 TODO | 1d | Medium |
| 9 — Team Members | 📋 TODO | 1.5d | Medium-High |
| 10 — Admin Moderation UX | 📋 TODO | 1d | Low |

**Recommended order:** 3 → 4 → 5+6 (parallel) → 7 → 8 → 9 → 10

---

## Key Architecture Notes

### tRPC Router Structure
All procedures live in `server/routers.ts` as an inline `appRouter` except:
- `adminRouter` → `server/routers/admin.ts`
- `authRouter` → `server/routers/auth.ts`
- `projectsRouter` → `server/routers/projects.ts`
- `notificationsRouter` → `server/routers/notifications.ts` (**not yet mounted**)

### Procedure Guards
- `publicProcedure` — no auth required
- `protectedProcedure` — any authenticated user
- `adminProcedure` — `role = admin` (defined inline in `routers.ts`)
- `teacherProcedure` — `role = teacher | admin` + `isProjectReviewer()` check
- `studentProcedure` — `role = student` (defined inline in `routers.ts`)

### Assignment Flow (after Phase 2)
```
AssignmentWizard
  → trpc.assignments.create (DB persistent, upsert semantics)
  → localStorage["project-setup"] (cache for ProjectForm)
  → navigate /project-submission

ProjectSubmissionPage
  → trpc.assignments.getMyAssignment (primary source)
  → if localStorage empty + server has data → reconstruct localStorage
  → show ProjectForm (reads from localStorage)
```

### Voting Flow (after Phase 1)
```
/vote (Vote.tsx only — VotingPage.tsx deleted)
  → trpc.projects.getPublic (public, field-allowlisted)
  → trpc.voting.getUserVotes({ voterIdentifier }) (from localStorage)
  → trpc.config.get({ key: "votingOpen" })
  → trpc.voting.vote (public, 5s per-IP rate limit)
```

### Data That Lives in localStorage
| Key | Purpose | Plan |
|-----|---------|------|
| `project-setup` | Assignment cache for ProjectForm | Populated from DB after Phase 2 |
| `voter_id` | Anonymous voter identifier | Supplemented with IP hash in Phase 7 |

---

## Environment Variables Required
```
DATABASE_URL              # PostgreSQL connection string
SUPABASE_URL              # For file uploads
SUPABASE_SERVICE_ROLE_KEY # Server-side Supabase access
GUARDIAN_API_KEY          # News widget (optional)
INATURALIST_API_TOKEN     # Wildlife widget (optional)
TURNSTILE_SECRET_KEY      # Anti-abuse for voting (Phase 7, optional)
```

---

## Testing Strategy
- **Unit:** Zod schema tests for `ProjectForm` and `submitProject` inputs; `shared/const.ts` phase
  gates
- **Integration:** tRPC caller tests — see `server/projects.test.ts` for existing pattern
- **E2E (Playwright):** (a) student sign-in → wizard → submit → approved → public sees it on
  `/vote`; (b) anonymous voter casts vote, cannot re-vote after localStorage clear (Phase 7 IP
  hash)
- **Visual regression:** `/vote`, `/innovation-hub`, `/student/dashboard` at 375 / 768 / 1440
