# Fast Refresh Refactor Plan

**Status**: 🟡 Awaiting Approval  
**Estimated Files Changed**: ~32  
**Estimated Breaking Risk**: Medium (large import surface, no logic changes planned)

---

## Files to Create

### 1. `src/utils/cache/cacheHelpers.js`
**Exports**:
- `FIVE_MINUTES` (from `DecksContext.jsx` and `ProgressContext.jsx`)
- `MAX_RETRY_ATTEMPTS` (from `DecksContext.jsx`)
- `isCacheFreshTimestamp(timestamp, ttl)` (new helper replacing inline `isCacheFresh`)
- `shouldUseCachedResult(cacheTimestamp, ttl, paramsSnapshot, lastParams)` (new helper mirroring deck cache guard)

**Import Impact**: 3 files (`DecksContext.jsx`, `ProgressContext.jsx`, `useDecks.js`)

---

### 2. `src/utils/notifications/notificationBus.js`
**Exports**:
- `setNotificationCallback` (from `ErrorSnackbar.jsx`)
- `showNotification` (from `ErrorSnackbar.jsx`)
- `showError` (from `ErrorSnackbar.jsx`)
- `showSuccess` (from `ErrorSnackbar.jsx`)
- `showInfo` (from `ErrorSnackbar.jsx`)
- `showWarning` (from `ErrorSnackbar.jsx`)

**Import Impact**: 6 files (`ErrorSnackbar.jsx`, `App.jsx`, `AdminDashboard.jsx`, `Study.jsx`, `MyDecks.jsx`, `StudyMode/useStudySession.js`)

---

### 3. `src/contexts/decksContextRegistry.js`
**Exports**:
- `DecksContext` (extracted from `DecksContext.jsx`)
- `useDecksContext` (currently exported from `DecksContext.jsx`)

**Import Impact**: 2 files (`DecksContext.jsx`, `hooks/useDecks.js`)

---

### 4. `src/contexts/progressContextRegistry.js`
**Exports**:
- `ProgressContext` (extracted from `ProgressContext.jsx`)
- `useProgressContext` (currently exported from `ProgressContext.jsx`)

**Import Impact**: 2 files (`ProgressContext.jsx`, `hooks/useProgress.js`)

---

### 5. `src/contexts/userContextRegistry.js`
**Exports**:
- `UserContext` (extracted from `components/context/UserContext.jsx`)
- `useUser` (currently exported from `components/context/UserContext.jsx`)

**Import Impact**: 18 files (all consumers of `useUser`, plus the provider)

---

### 6. `src/utils/constants/errorMessages.js` *(optional placeholder)*
**Exports**:
- Reserved for shared error copy if needed during notification refactor. No existing constants moved yet; remains empty unless required while updating `ErrorSnackbar`.

**Import Impact**: 0 files initially

---

## Migration Path

### Phase 1: Create Utility Modules (No Breaking Changes)
- [ ] Scaffold `utils/cache/cacheHelpers.js` with exported placeholders
- [ ] Scaffold `utils/notifications/notificationBus.js` with exported placeholders
- [ ] Scaffold registry files for Decks, Progress, and User contexts

### Phase 2: Update Context Providers (One at a Time)
- [ ] Refactor `DecksContext.jsx` to import context from registry file and rely on cache helpers
- [ ] Refactor `ProgressContext.jsx` similarly
- [ ] Refactor `components/context/UserContext.jsx` to consume registry hook/context

### Phase 3: Update Hook & Component Imports
- [ ] Update `hooks/useDecks.js` to consume `useDecksContext` from registry
- [ ] Update `hooks/useProgress.js` accordingly
- [ ] Update every component importing `useUser` to reflect the new path
- [ ] Update components relying on notification helpers to import from `notificationBus`

### Phase 4: Verification
- [ ] Run `npm run lint` to ensure no unused exports/paths
- [ ] Start dev server and confirm Fast Refresh emits no warnings
- [ ] Smoke test dashboard, decks, study flows, and auth flows

---

## Files Requiring Import Updates

### Decks context consumers
- `src/hooks/useDecks.js`
- `src/main.jsx` (provider wiring)

### Progress context consumers
- `src/hooks/useProgress.js`
- `src/main.jsx` (provider wiring)

### User context consumers
- `src/main.jsx`
- `src/App.jsx`
- `src/pages/ProgressPage.jsx`
- `src/pages/WelcomeOnboarding.jsx`
- `src/components/MyDecks/MyDecks.jsx`
- `src/components/Dashboard/DashboardLayout.jsx`
- `src/components/DashBoard.jsx`
- `src/components/Authentication/SignUp.jsx`
- `src/components/Authentication/Login.jsx`
- `src/components/Authentication/ForgotPassword.jsx`
- `src/components/NavBar.jsx`
- `src/components/Teacher/TeacherInviteDialog.jsx`
- `src/components/Teacher/DemoAccounts.jsx`
- `src/components/homepageComponents/Navbar.jsx`
- `src/components/homepageComponents/PersonalizedLearningSection.jsx`
- `src/components/homepageComponents/ProgressStatsSection.jsx`
- `src/components/Study/Study.jsx`
- `src/components/StudyModeComponents/StudyMode/index.jsx`
- `src/components/StudyModeComponents/StudyMode/useStudySession.js`
- `src/components/common/MetaStrip.jsx`
- `src/components/Admin/AdminDashboard.jsx`

### Notification helper consumers
- `src/App.jsx`
- `src/components/common/ErrorSnackbar.jsx`
- `src/components/Admin/AdminDashboard.jsx`
- `src/components/Study/Study.jsx`
- `src/components/MyDecks/MyDecks.jsx`
- `src/components/StudyModeComponents/StudyMode/useStudySession.js`

---

## Rollback Plan

1. Revert utility creation commits to restore original exports.
2. Revert context provider updates to reintroduce mixed exports.
3. Re-run `npm run lint` and start dev server to verify warnings return to prior state (ensuring environment parity).
4. Because core logic remains untouched, no data migration is required during rollback.

---

## Approval Checklist

Before implementing:
- [ ] All moved exports have been cataloged with new destinations.
- [ ] Every consuming file has been identified for import path updates.
- [ ] New helper/registry files have clear ownership and naming.
- [ ] Migration phases and verification steps are agreed upon.
- [ ] Stakeholders confirm tolerance for medium-risk refactor touching shared contexts.

