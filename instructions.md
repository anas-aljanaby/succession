# Handoff Instructions: Org Dashboard Critical Functions Flow

## Original Request Context

User asked to fix the organization dashboard UI where:
- Organizations have critical functions (positions).
- Candidates are tied to those functions.
- Function creation/management flow was missing.
- Candidate management felt scattered.

User explicitly requested browser verification before implementation. The previous model confirmed:
- App started on `http://localhost:3000`.
- Logged in as consultant.
- Navigated to organization dashboard for `الهيئة العامة للبيانات`.
- User confirmed that this is the page to redesign.

Then implementation started but the session was interrupted.

## What The Previous Model Implemented

### 1) New data model for critical functions
- `types.ts`
  - Added `CriticalFunction` interface:
    - `id`, `title`, `department`, `priority`, `candidateId?`, `planId?`, `status`.
  - Added `criticalFunctions?: CriticalFunction[]` to `Organization`.

### 2) Mock data additions
- `constants.ts`
  - Added `criticalFunctions` arrays to org `id:1` and org `id:2`.
  - Added translation keys in both EN/AR for function flow labels:
    - `criticalFunctions`, `addFunction`, `functionName`, `functionDepartment`, `functionPriority`,
      `priorityHigh/Medium/Low`, `statusVacant/InProgress/Ready`,
      `noFunctionsYet`, `addFirstFunction`, `assignCandidate`, `editFunction`, `deleteFunction`,
      `confirmDeleteFunction`, `saveFn`, etc.

### 3) Dashboard UI redesign
- `components/Dashboard.tsx` was heavily rewritten.
- Added:
  - Critical Function cards with status + priority.
  - Function create/edit modal (`FunctionFormModal`).
  - Candidate assignment modal (`AssignCandidateModal`).
  - Function CRUD handlers:
    - `handleSaveFunction`
    - `handleDeleteFunction`
    - `handleAssignCandidate`
    - `handleUnassign`
  - Candidates quick access panel.
  - Metrics row now includes number of critical functions.
- Old "succession plans table" UI was removed from dashboard.

## Current State Verification (done now)

- `npm run build` succeeds.
- Build emits duplicate key warnings in `constants.ts` for translation key:
  - `createPlanForCandidate` (duplicate in both EN and AR dictionaries).
- No fatal compile errors, but functional flow is incomplete/inconsistent in places.

## Known Gaps / Likely Bugs To Continue From

1. **Modal state sync bug in `FunctionFormModal`**
   - `title/department/priority` are initialized from `editingFunction` only once via `useState`.
   - When editing different functions, values can become stale.
   - Fix with `useEffect` sync when `editingFunction`/`isOpen` changes.

2. **Assignment flow does not link plan to function**
   - `handleAssignCandidate` sets `candidateId` and status only.
   - `planId` remains unset.
   - Card looks up plan by `fn.planId`, so existing candidate plans are not recognized.
   - Should derive/link `planId` from candidate plan (`candidate.planId`) or explicit selection.

3. **Function status is not updated based on real readiness**
   - Status is static/manual (`vacant`/`in-progress`/`ready`) and can drift from actual plan readiness.
   - Recommended: compute status from assignment + plan readiness (`>=85 => ready`).

4. **Mock data inconsistencies**
   - Some critical function mock entries have mismatched candidate/plan combinations.
   - Example: function with `planId: 3` but no such plan in `mockSuccessionPlans`.
   - Clean mock mappings to avoid broken card behavior.

5. **Translation cleanup needed**
   - Remove duplicate keys like `createPlanForCandidate` in both language objects.
   - Keep only one canonical key per language block.

6. **End-to-end flow not fully closed yet**
   - Need to ensure complete UX path:
     - add function -> assign candidate -> create/select plan -> view plan -> update status.
   - Validate both EN and AR dashboards.

## Suggested Next Steps For Next Model

1. **Fix data-flow correctness first**
   - In dashboard mapping, derive linked plan from:
     - `fn.planId` OR fallback candidate `planId` where appropriate.
   - Update assignment handler to persist `planId` if candidate already has one.
   - Recompute function status from actual state (vacant/in-progress/ready).

2. **Fix form modal state behavior**
   - Add `useEffect` for `editingFunction` and reset on close/open.
   - Ensure "Add Function" always opens a clean form.

3. **Clean mock data + translations**
   - Align `criticalFunctions` plan IDs with existing mock plans.
   - Remove duplicate translation keys flagged by build warning.

4. **Run checks**
   - `npm run build`
   - `npm run test` (if available and passing in this branch)

5. **Browser verify via Playwright/Chrome (required by user preference)**
   - Start app and verify in real browser, not preview:
     - Consultant login
     - Open org (`الهيئة العامة للبيانات`)
     - Add/edit/delete function
     - Assign/unassign candidate
     - Create/view plan from function card
     - Confirm status + metrics update

## Files Most Relevant For Continuation

- `components/Dashboard.tsx`
- `types.ts`
- `constants.ts`
- `data/mockCandidates.ts`
- `components/app/org/OrgWorkspaceViews.tsx`

## Important Constraint Reminder

The repo is currently a dirty working tree with many unrelated changes. Continue surgically; avoid reverting unrelated edits.
