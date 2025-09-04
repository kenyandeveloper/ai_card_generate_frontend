# 📍 Dashboard Development Roadmap

This roadmap outlines **short-term, mid-term, and long-term goals** for improving both the Dashboard’s codebase and the learner experience.  
Each phase builds on the previous one, starting with stability and maintainability, then moving toward engagement and personalization.

---

## 🟢 Short-Term (0–1 month)

### Developer Goals

- [ ] Extract **reusable card components** (reduce duplicated `bg-slate-800` + border styles).
- [ ] Centralize **animations** in a shared Framer Motion config file.
- [ ] Create **generic skeleton loaders** (`SkeletonCard`, `SkeletonList`).
- [ ] Clean up props (`theme`, `isDarkMode`) where no longer needed since dark mode is enforced.

### Learner Goals

- [ ] Add **"Continue where you left off"** button for decks.
- [ ] Show **weekly goal progress** more prominently (e.g., circular progress).
- [ ] Simplify mobile dashboard layout for faster access.

---

## 🟡 Mid-Term (1–3 months)

### Developer Goals

- [ ] Introduce **React Query / SWR** for data fetching, caching, and background refetching.
- [ ] Add **unit tests** for key dashboard components.
- [ ] Improve **performance** on large deck lists with pagination or virtualization.
- [ ] Run **accessibility audit**: ARIA labels, color contrast, keyboard navigation.

### Learner Goals

- [ ] Introduce **streaks, milestones, and badges** for motivation.
- [ ] Add **trend insights** (e.g., “20% more study time than last week”).
- [ ] Provide **basic spaced repetition reminders** (“15 cards due today”).
- [ ] Display **contextual stats** (“You mastered 50 cards = 25% of your deck”).

---

## 🔵 Long-Term (3–6 months)

### Developer Goals

- [ ] Build a **theming system** (allow “Dark Blue”, “Dark Purple”, etc.).
- [ ] Add **end-to-end tests** for dashboard workflows.
- [ ] Optimize for **offline support** (cache decks locally).
- [ ] Explore **PWA (Progressive Web App)** capabilities for mobile learners.

### Learner Goals

- [ ] Launch **gamification features**: achievements, XP, leaderboards (if social).
- [ ] Add **quick study timers** (5 min, 10 min, 15 min sessions).
- [ ] Introduce **distraction-free study mode** (minimal UI).
- [ ] Support **multi-language/localization** for global learners.
- [ ] Add **text-to-speech** option for flashcards.

---

## 🚀 Vision (6+ months)

Transform the dashboard into a **personal learning coach** that:

- Adapts recommendations based on learner performance.
- Motivates with achievements and personalized feedback.
- Supports learners across devices, offline, and in multiple languages.
- Scales to larger datasets with smooth performance.

---

## ✅ Next Action Steps

1. Refactor cards & skeletons → **immediate cleanup**.
2. Add "Continue where you left off" + weekly goal highlights → **quick learner wins**.
3. Introduce React Query and accessibility improvements → **robust foundation**.
4. Plan gamification & adaptive learning → **long-term engagement**.
