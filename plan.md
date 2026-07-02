# Exam-Guard: Advanced Online Examination System

Refactoring the existing Exam-Guard prototype into a production-ready application with full Supabase integration, role-based access control, and enhanced dashboards for both students and lecturers.

## Scope Summary
- **Architecture**: Move from a monolithic state-based app to a structured React application (since we are in a Vite environment, not Next.js, despite user's Next.js mention - we must stick to the existing Vite project structure but can implement routing).
- **Authentication**: Integrate Clerk for secure authentication.
- **Database (Supabase)**: Replace `localStorage` with a persistent PostgreSQL schema.
- **Roles**: Implement Lecturer and Student personas with distinct dashboards.
- **Student Dashboard**: Rebuilt with professional UI, security notices, and performance stats.
- **Lecturer Dashboard**: New interface for exam management and result monitoring.
- **Anti-Cheating**: Refine the existing tab-switch detection and integrate with the database for audit logging.

## Auth & RLS model
**Auth in scope:** yes
**Model:** supabase_auth (via Clerk + Supabase JWT or Clerk as primary with Supabase sync)
**RLS strategy:** `auth.uid()` based policies for students to see their own results; public read for exams; lecturer-only write for exams.
**Frontend implication:** Redirects to Clerk login if unauthenticated. Toast errors on unauthorized DB operations.

## Migration baseline
**Local migrations in project:** none
**User confirmed proceed on connected DB:** yes (via "dala-db-connected" signal)

## Affected Areas
- **Backend/DB**: New Supabase tables (`profiles`, `exams`, `questions`, `results`, `cheating_logs`).
- **Frontend Logic**: Transition `src/App.tsx` from conditional rendering to `react-router-dom` for route-based navigation.
- **Components**:
    - `src/components/StudentDashboard.tsx` (Enhanced version of current Dashboard)
    - `src/components/LecturerDashboard.tsx` (New)
    - `src/components/AuthCallback.tsx` (For syncing Clerk to Supabase)

## Ordered Phases

### Phase 1: Database & API Setup
- Define Supabase schema for exams, results, and users.
- Configure RLS policies.
- **Owner**: `supabase_engineer`

### Phase 2: Auth Integration (Clerk)
- Install `@clerk/clerk-react`.
- Wrap app in `<ClerkProvider>`.
- Implement role-based redirection logic.
- **Owner**: `frontend_engineer`

### Phase 3: Enhanced Student Dashboard
- Build the "improved" student UI with stats cards and security notices.
- Connect dashboard to fetch real exams from Supabase.
- **Owner**: `frontend_engineer`

### Phase 4: Lecturer Dashboard
- Create interface for lecturers to view results and (optionally) manage exams.
- **Owner**: `frontend_engineer`

### Phase 5: Anti-Cheating & Persistence
- Update `useAntiCheating` hook to log violations to Supabase `cheating_logs`.
- Ensure exam submission saves final score and strikes to Supabase.
- **Owner**: `frontend_engineer`

## Execution Handoff

**Plan status:** ready

**Dispatch order:**
1. supabase_engineer — Set up the database schema and RLS policies first.
2. frontend_engineer — Implement Clerk auth, routing, and new dashboard UIs.

**Per-agent instructions:**

### 1. supabase_engineer
- **Phases:** Phase 1
- **Scope:** 
    - Create `exams` table (id, title, description, duration_minutes, created_by).
    - Create `questions` table (id, exam_id, text, options, correct_answer).
    - Create `results` table (id, student_id, exam_id, score, total_questions, strikes, completed_at).
    - Create `cheating_logs` table (id, result_id, violation_type, timestamp).
    - Set up RLS: Users can read `exams`; Students can read their own `results`; Lecturers can read all `results`.
- **Files:** `supabase/migrations/20240321000000_initial_schema.sql` (or similar migration flow).
- **Acceptance criteria:** Tables exist in Supabase and RLS prevents students from seeing other students' results.

### 2. frontend_engineer
- **Phases:** Phase 2, 3, 4, 5
- **Scope:**
    - Install dependencies: `bun add @clerk/clerk-react react-router-dom @supabase/supabase-js`.
    - Set up Routing in `src/App.tsx` (`/`, `/student`, `/lecturer`, `/exam/:id`, `/results/:id`).
    - Build `StudentDashboard.tsx` following the UI requirements (Stats cards, Security notice).
    - Build `LecturerDashboard.tsx` showing a table of student submissions.
    - Update `ExamInterface.tsx` to fetch questions from Supabase and post results to Supabase.
    - Update `useAntiCheating.ts` to accept a callback for logging violations to the DB.
- **Files:** `src/App.tsx`, `src/components/StudentDashboard.tsx`, `src/components/LecturerDashboard.tsx`, `src/integrations/supabase/client.ts`.
- **Depends on:** Phase 1 (supabase_engineer).
- **Acceptance criteria:** App redirects to Clerk for login; roles correctly route to Student or Lecturer dashboards; Exam results are saved to Supabase.

IS_SUPABASE_REQUIRED: true
