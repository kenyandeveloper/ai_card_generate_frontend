import axios from "axios";
import { getToken, clearToken } from "./authToken";
import { handleApiError } from "../services/errorHandler";

const normalizeBaseUrl = (value) => {
  if (!value) return "";
  return value.replace(/\/+$/, "");
};

const BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL);
const ADMIN_API_KEY = import.meta.env?.VITE_ADMIN_API_KEY || "";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("api:error", { detail: handleApiError(error) })
      );
    }

    if (import.meta?.env?.DEV) {
      const status = error?.response?.status || "ERR";
      const url = error?.config?.url || "(unknown)";
      const message =
        error?.response?.data || error?.message || "Unknown API error";
      console.warn(`[api] ${status} @ ${url}`, message);
    }

    return Promise.reject(error);
  }
);

const resolveData = (promise) => promise.then((response) => response?.data);

const get = (url, config = {}) => resolveData(apiClient.get(url, config));
const post = (url, data = {}, config = {}) =>
  resolveData(apiClient.post(url, data, config));
const put = (url, data = {}, config = {}) =>
  resolveData(apiClient.put(url, data, config));
const patch = (url, data = {}, config = {}) =>
  resolveData(apiClient.patch(url, data, config));
const del = (url, config = {}) => resolveData(apiClient.delete(url, config));

const withAdminHeaders = (config = {}) => {
  const headers = { ...(config.headers || {}) };
  if (ADMIN_API_KEY) {
    headers["X-Admin-Key"] = ADMIN_API_KEY;
  }
  return { ...config, headers };
};

export const authApi = {
  getUser: () => get("/user"),
  signup: (payload) => post("/signup", payload),
  login: (payload) => post("/login", payload),
  requestOtp: (payload) => post("/login/otp/request", payload),
  verifyOtp: (payload) => post("/login/otp/verify", payload),
  requestPasswordReset: (payload) => post("/forgot-password", payload),
  resetPassword: (payload) => post("/reset-password", payload),
};

export const deckApi = {
  list: (params = {}) =>
    get("/decks", { params: { page: 1, per_page: 10, ...params } }),
  get: (deckId) => get(`/decks/${deckId}`),
  create: (payload) => post("/decks", payload),
  update: (deckId, payload) => put(`/decks/${deckId}`, payload),
  remove: (deckId) => del(`/decks/${deckId}`),
  listFlashcards: (params = {}) => get("/flashcards", { params }),
  createFlashcard: (payload) => post("/flashcards", payload),
  updateFlashcard: (flashcardId, payload) =>
    put(`/flashcards/${flashcardId}`, payload),
  deleteFlashcard: (flashcardId) => del(`/flashcards/${flashcardId}`),
};

export const progressApi = {
  list: () => get("/progress"),
  listByDeck: (deckId) => get(`/progress/deck/${deckId}`),
  fetchProgressForDeck: (deckId) => get(`/progress/deck/${deckId}`),
  logReview: async (
    deckId,
    flashcardId,
    wasCorrect,
    timeSpentSeconds,
    trackReviews = true
  ) => {
    const response = await apiClient.post("/progress", {
      deck_id: deckId,
      flashcard_id: flashcardId,
      was_correct: wasCorrect,
      time_spent_seconds: timeSpentSeconds,
      track_reviews: trackReviews,
    });

    if (import.meta.env?.DEV) {
      console.log("[progressApi] Review logged:", {
        tracked: response?.data?.tracked ?? trackReviews,
        response: response.data,
      });
    }

    return response.data;
  },
};

export const sessionApi = {
  startSession: async (deckId, trackReviews = false) => {
    const response = await apiClient.post("/study/session/start", {
      deck_id: deckId,
      track_reviews: trackReviews,
    });
    if (import.meta.env?.DEV) {
      console.log("[sessionApi] Session started:", response.data);
    }
    return response.data;
  },

  getSessionStatus: async (deckId) => {
    const response = await apiClient.get("/study/session/status", {
      params: { deck_id: deckId },
    });
    return response.data;
  },
};

export const dashboardApi = {
  fetchOverview: () => {
    if (import.meta.env?.DEV) {
      console.debug("[apiClient] GET /dashboard");
    }
    return get("/dashboard");
  },
  fetchDashboard: () => {
    if (import.meta.env?.DEV) {
      console.debug("[apiClient] GET /dashboard (fetchDashboard)");
    }
    return get("/dashboard");
  },
  updateUserStats: (payload) => put("/user/stats", payload),
};

export const quizApi = {
  generateQuiz: async (
    deckIds,
    questionCount = 10,
    quizType = "multiple_choice",
    timeLimit = null
  ) => {
    const response = await apiClient.post("/quiz/generate", {
      deck_ids: deckIds,
      question_count: questionCount,
      quiz_type: quizType,
      time_limit: timeLimit,
    });

    if (import.meta.env?.DEV) {
      console.log("[quizApi] Quiz generated:", response.data);
    }

    return response.data;
  },

  submitAnswer: async (
    quizId,
    flashcardId,
    userAnswer,
    timeSpent,
    options = null
  ) => {
    const response = await apiClient.post(`/quiz/${quizId}/answer`, {
      flashcard_id: flashcardId,
      user_answer: userAnswer,
      time_spent_seconds: timeSpent,
      options,
    });
    return response.data;
  },

  completeQuiz: async (quizId) => {
    const response = await apiClient.post(`/quiz/${quizId}/complete`);
    return response.data;
  },
};

export const adminApi = {
  getStats: (within) =>
    get("/admin/users/stats", withAdminHeaders({ params: { within } })),
  getOnlineUsers: (within) =>
    get("/admin/users/online", withAdminHeaders({ params: { within } })),
  listUsers: (params = {}) =>
    get("/admin/users/list", withAdminHeaders({ params })),
  deleteUsers: (payload, options = {}) =>
    post("/admin/users/delete", payload, withAdminHeaders(options)),
  deleteUsersByIds: (payload, options = {}) =>
    post("/admin/users/delete-by-ids", payload, withAdminHeaders(options)),
  createTeacherInvite: (payload) =>
    post("/admin/teacher-invites", payload, withAdminHeaders()),
  batchCreateDemoUsers: (payload) =>
    post("/admin/demo/batch_create", payload, withAdminHeaders()),
};

export const teacherApi = {
  createDemoAccounts: (payload) =>
    post("/teacher/demo-accounts", payload),
  listDemoAccounts: (params = {}) =>
    get("/teacher/demo-accounts/list", { params }),
  updateDemoAccount: (studentId, payload) =>
    patch(`/teacher/demo-accounts/${studentId}`, payload),
  disableDemoAccount: (studentId) =>
    post(`/teacher/demo-accounts/${studentId}/disable`),
  extendDemoAccount: (studentId, days) =>
    post(`/teacher/demo-accounts/${studentId}/extend`, { days }),
  copyDeck: (payload) => post("/teacher/decks/copy", payload),
  assignDeck: (deckId, payload) =>
    post(`/teacher/decks/${deckId}/assign`, payload),
  unassignDeck: (deckId, payload) =>
    post(`/teacher/decks/${deckId}/unassign`, payload),
  listStudentDecks: (studentId) =>
    get(`/teacher/students/${studentId}/decks`),
  redeemTeacherCode: (code) => post("/auth/teacher/redeem", { code }),
};

export const billingApi = {
  createCheckout: (payload) => post("/billing/checkout", payload),
  verifyPayment: (payload) => post("/billing/verify", payload),
  getStatus: () => get("/billing/status"),
};

export const onboardingApi = {
  fetchCatalog: (config = {}) => get("/catalog", config),
  seedCatalog: (payload) => post("/catalog/seed", payload),
  fetchDeckCount: () => get("/decks", { params: { per_page: 1 } }),
};

export const aiApi = {
  generate: (payload) => post("/ai/generate", payload),
};

export const http = {
  get,
  post,
  put,
  patch,
  delete: del,
};

export default apiClient;
