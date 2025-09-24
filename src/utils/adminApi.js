// utils/adminApi.js
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
const ADMIN_KEY = import.meta.env.VITE_ADMIN_API_KEY || "dev-only-key";

function headers(extra = {}) {
  return { "X-Admin-Key": ADMIN_KEY, ...extra };
}

function qsFrom(opts = {}) {
  const q = new URLSearchParams();
  Object.entries(opts).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function getAdminStats(within = 5) {
  const res = await fetch(`${API_URL}/admin/users/stats?within=${within}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`stats ${res.status}`);
  return res.json();
}

export async function getOnlineUsers(within = 5) {
  const res = await fetch(`${API_URL}/admin/users/online?within=${within}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`online ${res.status}`);
  return res.json();
}

export async function listUsers(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/admin/users/list?${qs}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`list ${res.status}`);
  return res.json();
}

/**
 * Delete by emails with demo knobs.
 * opts: {
 *   strategy: 'fast' | 'slow' | 'turbo',
 *   commit_per: 'user' | 'row', // slow only
 *   sleep_ms: number,            // slow only
 *   echo_sql: boolean            // optional
 *   dry_run: boolean             // default false
 * }
 */
export async function deleteUsers(emails = [], opts = {}) {
  const {
    strategy = "fast",
    commit_per = "user",
    sleep_ms = 0,
    echo_sql = false,
    dry_run = false,
  } = opts;

  const qs = qsFrom({
    strategy,
    commit_per: strategy === "slow" ? commit_per : undefined,
    sleep_ms: strategy === "slow" ? Number(sleep_ms || 0) : undefined,
    echo_sql: echo_sql ? 1 : undefined,
  });

  const res = await fetch(`${API_URL}/admin/users/delete${qs}`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ emails, dry_run: !!dry_run }),
  });
  if (!res.ok) throw new Error(`delete ${res.status}`);
  return res.json();
}

/** Optional: delete by IDs with the same knobs */
export async function deleteUsersByIds(user_ids = [], opts = {}) {
  const {
    strategy = "fast",
    commit_per = "user",
    sleep_ms = 0,
    echo_sql = false,
    dry_run = false,
  } = opts;

  const qs = qsFrom({
    strategy,
    commit_per: strategy === "slow" ? commit_per : undefined,
    sleep_ms: strategy === "slow" ? Number(sleep_ms || 0) : undefined,
    echo_sql: echo_sql ? 1 : undefined,
  });

  const res = await fetch(`${API_URL}/admin/users/delete-by-ids${qs}`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ user_ids, dry_run: !!dry_run }),
  });
  if (!res.ok) throw new Error(`delete_by_ids ${res.status}`);
  return res.json();
}
