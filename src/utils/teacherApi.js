import { teacherApi as teacherClient } from "./apiClient";

export const createDemoAccounts = (payload) =>
  teacherClient.createDemoAccounts(payload);

export const listDemoAccounts = (params) =>
  teacherClient.listDemoAccounts(params);

export const updateDemoAccount = (studentId, payload) =>
  teacherClient.updateDemoAccount(studentId, payload);

export const disableDemoAccount = (studentId) =>
  teacherClient.disableDemoAccount(studentId);

export const extendDemoAccount = (studentId, days) =>
  teacherClient.extendDemoAccount(studentId, days);

export const copyDeck = (source_deck_id) =>
  teacherClient.copyDeck({ source_deck_id });

export const assignDeck = (deckId, student_ids) =>
  teacherClient.assignDeck(deckId, { student_ids });

export const unassignDeck = (deckId, student_ids) =>
  teacherClient.unassignDeck(deckId, { student_ids });

export const listStudentDecks = (studentId) =>
  teacherClient.listStudentDecks(studentId);

export const redeemTeacherCode = (code) =>
  teacherClient.redeemTeacherCode(code);
