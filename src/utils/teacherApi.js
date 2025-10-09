import api from "./apiClient";

export const createDemoAccounts = (payload) =>
  api.post("/teacher/demo-accounts", payload).then((r) => r.data);

export const listDemoAccounts = (params) =>
  api.get("/teacher/demo-accounts/list", { params }).then((r) => r.data);

export const updateDemoAccount = (studentId, payload) =>
  api.patch(`/teacher/demo-accounts/${studentId}`, payload).then((r) => r.data);

export const disableDemoAccount = (studentId) =>
  api.post(`/teacher/demo-accounts/${studentId}/disable`).then((r) => r.data);

export const extendDemoAccount = (studentId, days) =>
  api
    .post(`/teacher/demo-accounts/${studentId}/extend`, { days })
    .then((r) => r.data);

export const copyDeck = (source_deck_id) =>
  api.post("/teacher/decks/copy", { source_deck_id }).then((r) => r.data);

export const assignDeck = (deckId, student_ids) =>
  api
    .post(`/teacher/decks/${deckId}/assign`, { student_ids })
    .then((r) => r.data);

export const unassignDeck = (deckId, student_ids) =>
  api
    .post(`/teacher/decks/${deckId}/unassign`, { student_ids })
    .then((r) => r.data);

export const listStudentDecks = (studentId) =>
  api.get(`/teacher/students/${studentId}/decks`).then((r) => r.data);
