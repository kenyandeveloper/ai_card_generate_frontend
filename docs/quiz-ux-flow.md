# Quiz UX Flow Plan

**Status**: 🟡 Draft  
**Scope**: Step 1 — Define the initial quiz UX flow prior to implementation

---

## Placement & Entry Points

- **Primary route**: add `/quiz` in `src/App.jsx` wired to a new `QuizPage`. This keeps the flow parallel to `/study`, lets us dedicate layout/state, and avoids modal complexity for the v1 launch.
- **Navigation**: surface a “Quiz” pill in `src/components/NavBar.jsx`. Show a premium badge when `isPremium === false` to hint at gating. Mobile drawer mirrors the same label.
- **Dashboard CTA**: add a secondary entry on the dashboard hero/CTA rail that deep-links to `/quiz`. Reuse existing CTA button styles for consistency.
- **Deep links**: deck cards (`DeckCard`) gain an optional “Start quiz” link when the user is premium and the deck has > `MIN_QUIZ_READY_CARDS`. Non-premium users toggle the upgrade dialog instead.

---

## Core States & Transitions

1. **Setup (`/quiz` root)**  
   - Shows deck selector (multi-select with search) using deck data already surfaced on Study/Dashboard.  
   - Inputs: question count (default 10, capped by usage/free tier), quiz type (see Question Formats), optional timer toggle.  
   - Primary CTA “Generate quiz” calls `quizApi.generateQuiz`. On success navigate to `/quiz/:quizId`.
   - Error surfaces inline above CTA using the existing `<StatusMessage>` pattern.

2. **In-Progress (`/quiz/:quizId`)**  
   - Renders one question at a time with progress bar (`questionIndex + 1 / total`).  
   - Timer bar appears when time limit enabled; runs client-side and is reset per-question.  
   - Interaction model: answer choices stacked card UI, submit button, next button.  
   - Feedback toast/overlay after submission (correct/incorrect with rationale). Automatically advances after delay.
   - Support pause/exit confirmation: navigating away triggers dialog with “Resume / Leave”.

3. **Results (`/quiz/:quizId/results`)**  
   - Summary card: score, accuracy %, time spent, decks covered.  
   - Question review list with expanders showing user answer vs correct answer.  
   - CTAs: “Retry quiz” (same params) and “Review decks” (link to `/study`).
   - When API marks quiz complete, refresh dashboard/progress caches.

Transitions: `/quiz` → `/quiz/:quizId` (after generation) → `/quiz/:quizId/results` (after completion). Failed generation or lost context returns the user to setup with message.

---

## Question Formats (Phase 1)

- **Multiple choice**: baseline format; four options max, pulled from API payload (`question.options`).  
- **True/false**: treat as multiple choice with two options; layout uses compact buttons.  
- Defer typed input, ordering, and matching until post-launch. API flags for unsupported types show a “Coming soon” message and disable the option in the setup form.

---

## State & Data Contracts

- **Frontend quiz model**:  
  ```ts
  type QuizSession = {
    id: string;
    deckIds: string[];
    questionCount: number;
    currentIndex: number;
    questions: QuizQuestion[];
    startedAt: number;
    timerPerQuestion?: number;
    score: { correct: number; incorrect: number };
    status: "setup" | "active" | "completed";
  };
  ```
- Store session state in a dedicated quiz context/hook (likely `useQuizSession`) with provider mounted inside the new `QuizPage`. Limit global exposure to avoid re-renders elsewhere.
- Normalize `quizApi.generateQuiz` payload to the above shape immediately; keep raw API response in ref for auditing.
- On `submitAnswer`, optimistically bump stats and merge server truth when response returns (handle corrections if different).

---

## Usage Gating & Limits

- Pull `usageInfo?.quizzes` and `isPremium` from `useProgress()`.  
- Free tier: limit to `3` questions per quiz and `X` quizzes/day (exact numbers from backend) — enforce in setup UI (disabled inputs + tooltip).  
- Non-premium entry attempts trigger billing dialog via existing `open-billing` event.  
- When usage is exhausted mid-quiz, show modal explaining limit and disable advancing; results still available for completed questions.

---

## Error & Recovery Considerations

- Generation failures: stay on setup, show inline error with retry CTA.  
- Lost quiz ID (refresh on session): fetch `/quiz/:quizId` to restore session; if unavailable, redirect to setup with toast.  
- API failures during submission: queue answer locally and retry with exponential backoff; on repeated failure surface “Resume later” path returning to setup.  
- Offline detection: when navigator offline, block generation/submit with banner and keep answers in local state until reconnect.

---

## Next Steps

1. Create UX skeleton in `/src/pages/QuizPage.jsx` with nested router setup and provider.  
2. Implement `useQuizSession` hook covering state transitions + timer.  
3. Build SetupForm, QuizSession, ResultsSummary components with storybook-like fixtures.  
4. Wire gating checks and nav updates once components exist.

