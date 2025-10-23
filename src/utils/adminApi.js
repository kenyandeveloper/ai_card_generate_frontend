import { adminApi as adminClient } from "./apiClient";

export const getAdminStats = (within = 5) => adminClient.getStats(within);

export const getOnlineUsers = (within = 5) =>
  adminClient.getOnlineUsers(within);

export const listUsers = (params = {}) => adminClient.listUsers(params);

const buildAdminParams = ({
  strategy = "fast",
  commit_per = "user",
  sleep_ms = 0,
  echo_sql = false,
} = {}) => {
  const params = { strategy };
  if (strategy === "slow") {
    params.commit_per = commit_per;
    params.sleep_ms = Number(sleep_ms || 0);
  }
  if (echo_sql) {
    params.echo_sql = 1;
  }
  return params;
};

export const deleteUsers = (emails = [], opts = {}) =>
  adminClient.deleteUsers(
    { emails, dry_run: Boolean(opts?.dry_run) },
    { params: buildAdminParams(opts) }
  );

export const deleteUsersByIds = (user_ids = [], opts = {}) =>
  adminClient.deleteUsersByIds(
    { user_ids, dry_run: Boolean(opts?.dry_run) },
    { params: buildAdminParams(opts) }
  );

export const createTeacherInvite = (payload) =>
  adminClient.createTeacherInvite(payload);

export const batchCreateDemoUsers = (payload) =>
  adminClient.batchCreateDemoUsers(payload);
