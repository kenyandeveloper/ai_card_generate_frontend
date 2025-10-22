# Fast Refresh Refactor Plan (v2)

**Status**: 🟡 Awaiting Approval  
**Estimated Files Changed**: 9–12  
**Estimated Breaking Risk**: Low (utility extraction only, no context/hook relocation)

---

## Scope Adjustments

- ✅ Only extract existing utility constants/functions from context/component files.
- ✅ Keep `DecksContext`, `ProgressContext`, and `UserContext` definitions (and their hooks) inside their current files.
- ✅ Focus Phase A on Fast Refresh warnings caused by `DecksContext.jsx`, `ProgressContext.jsx`, and `components/common/ErrorSnackbar.jsx`.
- ❌ Defer any `UserContext` changes to a future phase; document as an open issue.
- ❌ Do not invent new helper APIs; only relocate existing code.

---

## Files to Create

### 1. `src/utils/cache/cacheHelpers.js`
**Purpose**: Centralize cache-related constants reused across deck/progress providers.

**Exports to move (existing today):**
- `FIVE_MINUTES` — currently defined in:
  - `src/contexts/DecksContext.jsx:17`
  - `src/contexts/ProgressContext.jsx:14`
- `MAX_RETRY_ATTEMPTS` — currently defined in:
  - `src/contexts/DecksContext.jsx:18`
  - `src/contexts/ProgressContext.jsx:15`

**Verification Snippets:**
```javascript
// src/contexts/DecksContext.jsx:17-18
const FIVE_MINUTES = 5 * 60 * 1000;
const MAX_RETRY_ATTEMPTS = 3;

// src/contexts/ProgressContext.jsx:14-15
const FIVE_MINUTES = 5 * 60 * 1000;
const MAX_RETRY_ATTEMPTS = 3;
```

**Import Impact**: 2 files (`DecksContext.jsx`, `ProgressContext.jsx`)

---

### 2. `src/utils/notifications/notificationBus.js`
**Purpose**: Remove non-component exports from `ErrorSnackbar.jsx`.

**Exports to move (existing today):**
- `setNotificationCallback` — `src/components/common/ErrorSnackbar.jsx:43`
- `showNotification` — `src/components/common/ErrorSnackbar.jsx:46`
- `showError` — `src/components/common/ErrorSnackbar.jsx:54`
- `showSuccess` — `src/components/common/ErrorSnackbar.jsx:55`
- `showInfo` — `src/components/common/ErrorSnackbar.jsx:56`
- `showWarning` — `src/components/common/ErrorSnackbar.jsx:57`

**Verification Snippet:**
```javascript
// src/components/common/ErrorSnackbar.jsx:40-57
let notificationCallback = null;

export const setNotificationCallback = (callback) => {
  notificationCallback = callback;
};

export const showNotification = (message, severity = "info") => {
  if (notificationCallback) {
    notificationCallback({ text: message, severity });
  } else {
    console.warn("Notification callback not set. Message:", message);
  }
};

export const showError = (message) => showNotification(message, "error");
export const showSuccess = (message) => showNotification(message, "success");
export const showInfo = (message) => showNotification(message, "info");
export const showWarning = (message) => showNotification(message, "warning");
```

**Import Impact**: 6 files (`App.jsx`, `components/common/ErrorSnackbar.jsx`, `components/Admin/AdminDashboard.jsx`, `components/Study/Study.jsx`, `components/MyDecks/MyDecks.jsx`, `components/StudyModeComponents/StudyMode/useStudySession.js`)

---

### 3. `src/utils/constants/errorMessages.js` *(Optional – Future Use)*
No existing shared error constants; this file will not be created in Phase A unless we discover reusable strings during implementation. Currently noted for tracking only.

---

## Migration Phases

### Phase A – Current Effort
1. Create `cacheHelpers.js` and `notificationBus.js` with the exact exports listed above.
2. Remove the duplicated constants/functions from the source files.
3. Update import statements in:
   - `src/contexts/DecksContext.jsx`
   - `src/contexts/ProgressContext.jsx`
   - `src/components/common/ErrorSnackbar.jsx`
   - All notification consumers (5 additional files)
4. Verify Fast Refresh warnings disappear:
   - Run `npm run lint`
   - Launch dev server, edit one of the affected components, ensure HMR works cleanly.

### Phase B – Deferred Work (document only)
- `UserContext.jsx` still mixes provider/component logic with utilities.
- Potential extraction targets: `setToken`, `logout`, `hasRole`.
- Defer to a separate effort; no changes in this phase.

---

## Files Requiring Import Updates

- `src/contexts/DecksContext.jsx`
- `src/contexts/ProgressContext.jsx`
- `src/components/common/ErrorSnackbar.jsx`
- `src/App.jsx`
- `src/components/Admin/AdminDashboard.jsx`
- `src/components/Study/Study.jsx`
- `src/components/MyDecks/MyDecks.jsx`
- `src/components/StudyModeComponents/StudyMode/useStudySession.js`

Estimated total touched: 8 source files + 2 new utility modules = 10 files.

---

## Risk & Validation

- **Risk Level**: Low – moving constants/functions without logic changes.
- **Validation Steps**:
  - `npm run lint`
  - `npm run build` (optional confidence check)
  - Manual sanity checks: dashboard load, deck CRUD, study session notifications.

---

## Known Issues / Follow-Up Items

- `components/context/UserContext.jsx` still triggers Fast Refresh warning; schedule as Phase B.
- Investigate shared error strings during Phase A implementation; if multiple files duplicate text, revisit `errorMessages.js`.

---

## Approval Checklist

- [ ] Confirm only existing exports are being moved.
- [ ] Confirm no context/hook relocation occurs.
- [ ] Confirm UserContext remains untouched in Phase A.
- [ ] Confirm estimated file touch count (≤12) and low risk are acceptable.
- [ ] Approve the two new utility modules before implementation begins.
