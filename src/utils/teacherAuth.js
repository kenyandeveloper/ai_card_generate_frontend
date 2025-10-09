import api from "./apiClient";

export const redeemTeacherCode = async (code) =>
  api.post("/auth/teacher/redeem", { code }).then((r) => r.data);
