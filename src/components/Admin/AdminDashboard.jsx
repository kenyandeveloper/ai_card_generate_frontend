import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Download } from "lucide-react";
import {
  getAdminStats,
  listUsers,
  deleteUsers,
  createTeacherInvite,
  batchCreateDemoUsers,
} from "../../utils/adminApi";
import { formatEAT } from "../../utils/time";
import { handleApiError } from "../../services/errorHandler";
import { redeemTeacherCode } from "../../utils/teacherApi";
import { DataFetchWrapper } from "../common/DataFetchWrapper";
import { LoadingSkeleton, TableRowSkeleton } from "../common/LoadingSkeleton";
import { InlineSpinner } from "../common/LoadingSpinner";
import { showError, showSuccess } from "../common/ErrorSnackbar";

const ADMIN_KEY = import.meta.env?.VITE_ADMIN_API_KEY || "";

function StatCard({ label, value }) {
  return (
    <div className="bg-surface-elevated rounded-xl p-6 border border-border-muted h-full">
      <div className="text-xs uppercase text-text-muted tracking-wide font-medium">
        {label}
      </div>
      <div className="text-3xl font-bold mt-2 text-text-primary">{value}</div>
    </div>
  );
}

function Alert({ severity, children }) {
  const colors = {
    warning: "bg-warning-soft border-warning text-warning",
    error: "bg-danger-soft border-danger text-danger",
    success: "bg-success-soft border-success text-success",
    info: "bg-secondary-soft border-secondary text-secondary",
  };

  return (
    <div
      className={`rounded-lg border p-4 flex items-start gap-3 ${colors[severity]}`}
    >
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState(0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-text-primary">
        Admin Dashboard
      </h1>

      {!ADMIN_KEY && (
        <Alert severity="warning">
          <strong>VITE_ADMIN_API_KEY</strong> is not set. Admin calls will fail.
        </Alert>
      )}

      <div className="border-b border-border-muted mb-6">
        <div className="flex gap-1">
          {["Overview", "Create Demo Users", "Users", "Teacher Invites"].map(
            (label, i) => (
              <button
                key={i}
                onClick={() => setTab(i)}
                className={`px-6 py-3 font-medium transition-colors ${
                  tab === i
                    ? "text-primary border-b-2 border-primary"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      {tab === 0 && <OverviewTab />}
      {tab === 1 && <CreateDemoTab />}
      {tab === 2 && <UsersTab />}
      {tab === 3 && <TeacherInvitesTab />}
    </div>
  );
}

/* ---------------------------- Overview Tab ---------------------------- */

function OverviewTab() {
  const [within, setWithin] = useState(5);
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");
  const [loadingStats, setLoadingStats] = useState(false);
  const hasLoadedRef = useRef(false);

  const load = useCallback(async () => {
    try {
      setErr("");
      setLoadingStats(true);
      const data = await getAdminStats(within);
      setStats(data);
      hasLoadedRef.current = true;
    } catch (e) {
      const message = e.message || "Failed to load stats";
      setErr(message);
      if (!hasLoadedRef.current) {
        showError(message);
      }
    } finally {
      setLoadingStats(false);
    }
  }, [within]);

  // 🔁 Safer polling: no overlapping requests, respects tab visibility, 2-minute cadence
  useEffect(() => {
    const POLL_MS = 2 * 60 * 1000; // 120,000 ms
    let cancelled = false;
    let timer;

    const schedule = () => {
      timer = setTimeout(tick, POLL_MS);
    };

    const tick = async () => {
      if (cancelled) return;
      // Skip work if the tab is hidden; just reschedule
      if (!document.hidden) {
        await load();
      }
      if (!cancelled) schedule();
    };

    // Immediate fetch on mount / when `load` changes
    load();
    // Start the polling loop
    schedule();

    // If the tab becomes visible, do a prompt refresh
    const onVisible = () => {
      if (cancelled) return;
      if (!document.hidden) {
        clearTimeout(timer);
        tick(); // run now, then it will reschedule itself
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  const unverified = (stats?.total_users || 0) - (stats?.verified_users || 0);

  return (
    <DataFetchWrapper
      loading={!stats && loadingStats}
      error={err}
      onRetry={load}
      loadingComponent={<LoadingSkeleton count={4} height={80} />}
    >
      {stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <StatCard label="Total" value={stats.total_users} />
            <StatCard label="Verified" value={stats.verified_users} />
            <StatCard label="Unverified" value={unverified} />
            <StatCard label="Demo" value={stats.demo_users} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border-muted bg-surface-elevated p-6">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Online (≈{stats.within_minutes}m)
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-xs text-text-muted">
                    Window (minutes)
                  </label>
                  <input
                    type="number"
                    className="w-40 rounded border border-border-muted bg-background-subtle px-3 py-1.5 text-sm text-text-primary"
                    value={within}
                    onChange={(e) =>
                      setWithin(
                        Math.max(1, Math.min(120, Number(e.target.value) || 5))
                      )
                    }
                  />
                </div>
              </div>
              <div className="text-3xl font-bold text-text-primary">
                {stats.online_now}
              </div>
              <p className="mt-2 text-sm text-text-muted">
                Active last {stats.within_minutes} minute(s)
              </p>
            </div>

            <StatCard label="New (24h)" value={stats.new_last_24h} />
          </div>
        </div>
      )}
    </DataFetchWrapper>
  );
}

/* ------------------------- Create Demo Users Tab ------------------------- */

function CreateDemoTab() {
  const [count, setCount] = useState(10);
  const [prefix, setPrefix] = useState("class9");
  const [domain, setDomain] = useState("demo.flashlearn.local");
  const [expires, setExpires] = useState(90);
  const [fixedPw, setFixedPw] = useState("");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const asCSV = useMemo(() => {
    if (!result?.users?.length) return "";
    const header = ["username", "email", "password"];
    const rows = result.users.map((u) => [u.username, u.email, u.password]);
    const esc = (v) => `"${String(v).replaceAll('"', '""')}"`;
    return [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  }, [result]);

  const downloadCSV = () => {
    const blob = new Blob([asCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const ts = new Date().toISOString().slice(0, 19).replaceAll(":", "-");
    a.download = `demo-users-${ts}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const createBatch = async () => {
    try {
      setErr("");
      setLoading(true);
      setResult(null);
      const payload = {
        count: Number(count),
        prefix,
        email_domain: domain,
        expires_in_days: Number(expires) || undefined,
        password: fixedPw || undefined,
      };
      const data = await batchCreateDemoUsers(payload);
      setResult(data);
      showSuccess(
        `Created ${data.count} demo user${data.count === 1 ? "" : "s"}`
      );
    } catch (e) {
      const apiError = handleApiError(e);
      const message = apiError.message || "Failed to create demo users";
      setErr(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {err && <Alert severity="error">{err}</Alert>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-text-muted mb-1">Count</label>
          <input
            type="number"
            className="w-full bg-surface-elevated border border-border-muted rounded-lg px-4 py-2 text-text-primary"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-1">Prefix</label>
          <input
            type="text"
            className="w-full bg-surface-elevated border border-border-muted rounded-lg px-4 py-2 text-text-primary"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-1">
            Email domain
          </label>
          <input
            type="text"
            className="w-full bg-surface-elevated border border-border-muted rounded-lg px-4 py-2 text-text-primary"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-1">
            Expires in (days)
          </label>
          <input
            type="number"
            className="w-full bg-surface-elevated border border-border-muted rounded-lg px-4 py-2 text-text-primary"
            value={expires}
            onChange={(e) => setExpires(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-text-muted mb-1">
          Fixed password (optional)
        </label>
        <input
          type="text"
          className="w-full bg-surface-elevated border border-border-muted rounded-lg px-4 py-2 text-text-primary"
          value={fixedPw}
          onChange={(e) => setFixedPw(e.target.value)}
        />
      </div>

      <button
        onClick={createBatch}
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 font-medium transition-colors bg-primary hover:bg-primary-emphasis disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <InlineSpinner size={18} />
            Creating…
          </>
        ) : (
          "Create demo users"
        )}
      </button>

      {result?.users?.length > 0 && (
        <div className="space-y-4">
          <Alert severity="success">Created {result.count} users</Alert>

          <div className="bg-surface-elevated rounded-xl border border-border-muted overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-muted bg-background-subtle/50">
                  <th className="text-left px-6 py-3 font-medium text-text-secondary">
                    Username
                  </th>
                  <th className="text-left px-6 py-3 font-medium text-text-secondary">
                    Email
                  </th>
                  <th className="text-left px-6 py-3 font-medium text-text-secondary">
                    Password
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.users.map((u) => (
                  <tr
                    key={u.email}
                    className="border-b border-border-muted/50 hover:bg-surface-highlight/40"
                  >
                    <td className="px-6 py-3 text-text-primary">
                      {u.username}
                    </td>
                    <td className="px-6 py-3 text-text-primary">{u.email}</td>
                    <td className="px-6 py-3 text-text-primary">
                      {u.password}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {asCSV && (
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 border border-border-muted hover:bg-surface-elevated px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Users Tab ------------------------------ */

function UsersTab() {
  const [type, setType] = useState("all");
  const [q, setQ] = useState("");
  const [activeWithin, setActiveWithin] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [commitPer, setCommitPer] = useState("row");
  const [sleepMs, setSleepMs] = useState(20);
  const [echoSql, setEchoSql] = useState(true);
  const [opInfo, setOpInfo] = useState(null);

  const paramsForList = useCallback(() => {
    const params = {
      limit: perPage,
      offset: (page - 1) * perPage,
      sort: "created_at_desc",
    };
    if (q.trim()) params.q = q.trim();
    if (activeWithin) params.active_within = Number(activeWithin);
    if (type === "demo") params.is_demo = true;
    else if (type === "verified") params.email_verified = true;
    else if (type === "unverified") params.email_verified = false;
    return params;
  }, [perPage, page, q, activeWithin, type]);

  const load = useCallback(async () => {
    try {
      setErr("");
      setLoading(true);
      setSelected(new Set());
      const res = await listUsers(paramsForList());
      setData(res);
    } catch (e) {
      setErr(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [paramsForList]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / perPage));
  const items = data?.items || [];

  const toggleOne = (email) => {
    const next = new Set(selected);
    if (next.has(email)) next.delete(email);
    else next.add(email);
    setSelected(next);
  };

  const toggleAllOnPage = () => {
    const pageEmails = items.map((u) => u.email);
    const allSelected = pageEmails.every((e) => selected.has(e));
    const next = new Set(selected);
    if (allSelected) {
      pageEmails.forEach((e) => next.delete(e));
    } else {
      pageEmails.forEach((e) => next.add(e));
    }
    setSelected(next);
  };

  async function runDelete(strategy) {
    const emails = Array.from(selected);
    if (!emails.length) return;

    try {
      setOpInfo(null);
      const preview = await deleteUsers(emails, {
        strategy,
        commit_per: commitPer,
        sleep_ms: sleepMs,
        echo_sql: echoSql,
        dry_run: true,
      });

      const would =
        preview.count_would_delete || preview.deletable?.length || 0;
      const msg = [
        `Strategy: ${strategy.toUpperCase()}`,
        strategy === "slow"
          ? `commit_per=${commitPer}, sleep_ms=${sleepMs}`
          : "",
        echoSql ? "echo_sql=ON" : "",
        `This will delete ${would} user(s).`,
        preview.skipped_domain?.length
          ? `Skipped (domain not allowed): ${preview.skipped_domain.join(", ")}`
          : "",
        preview.not_found?.length
          ? `Not found: ${preview.not_found.join(", ")}`
          : "",
        "",
        "Proceed?",
      ]
        .filter(Boolean)
        .join("\n");

      if (!window.confirm(msg)) return;

      const res = await deleteUsers(emails, {
        strategy,
        commit_per: commitPer,
        sleep_ms: sleepMs,
        echo_sql: echoSql,
        dry_run: false,
      });

      setOpInfo({
        performance: res.performance,
        timing_seconds: res.timing_seconds,
        related: res.related_records_deleted,
        deleted: res.deleted?.length || 0,
        not_found: res.not_found?.length || 0,
      });

      const summary = [
        `Mode: ${res.performance}`,
        `Time: ${res.timing_seconds ?? "?"}s`,
        `Deleted: ${res.deleted?.length || 0}`,
      ]
        .filter(Boolean)
        .join(" • ");
      showSuccess(summary);

      await load();
    } catch (e) {
      showError(e.message || "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      {err && <Alert severity="error">{err}</Alert>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm text-text-muted mb-1">Type</label>
          <select
            className="w-full bg-surface-elevated border border-border-muted rounded-lg px-4 py-2 text-text-primary"
            value={type}
            onChange={(e) => {
              setPage(1);
              setType(e.target.value);
            }}
          >
            <option value="all">All</option>
            <option value="demo">Demo</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-1">
            Active within (mins)
          </label>
          <input
            type="text"
            placeholder="e.g. 5"
            className="w-full bg-surface-elevated border border-border-muted rounded-lg px-4 py-2 text-text-primary"
            value={activeWithin}
            onChange={(e) => {
              setPage(1);
              setActiveWithin(e.target.value);
            }}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-text-muted mb-1">
            Search (email or username)
          </label>
          <input
            type="text"
            className="w-full bg-surface-elevated border border-border-muted rounded-lg px-4 py-2 text-text-primary"
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
          />
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-1">Per page</label>
          <select
            className="w-full bg-surface-elevated border border-border-muted rounded-lg px-4 py-2 text-text-primary"
            value={perPage}
            onChange={(e) => {
              setPage(1);
              setPerPage(Number(e.target.value));
            }}
          >
            {[10, 20, 50, 100, 1000].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={load}
            disabled={loading}
            className="w-full border border-border-muted hover:bg-surface-elevated disabled:bg-background-subtle disabled:text-text-subtle px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? "…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-t border-b border-border-muted">
        <p className="text-sm text-text-muted">
          {data?.total ?? 0} total • {items.length} shown
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-muted">Commit per</label>
            <select
              className="bg-surface-elevated border border-border-muted rounded px-3 py-1.5 text-sm text-text-primary"
              value={commitPer}
              onChange={(e) => setCommitPer(e.target.value)}
            >
              <option value="user">user</option>
              <option value="row">row</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-text-muted">sleep ms</label>
            <input
              type="number"
              className="w-24 bg-surface-elevated border border-border-muted rounded px-3 py-1.5 text-sm text-text-primary"
              value={sleepMs}
              onChange={(e) =>
                setSleepMs(Math.max(0, Number(e.target.value) || 0))
              }
            />
          </div>

          <button
            onClick={() => setEchoSql((v) => !v)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              echoSql
                ? "bg-primary hover:bg-primary-emphasis text-text-primary"
                : "border border-border-muted hover:bg-surface-elevated text-text-secondary"
            }`}
          >
            SQL Echo {echoSql ? "ON" : "OFF"}
          </button>

          <div className="h-6 w-px bg-surface-highlight" />

          <button
            onClick={() => runDelete("fast")}
            disabled={!selected.size}
            className="bg-danger hover:bg-danger-emphasis disabled:bg-surface-highlight disabled:text-text-muted disabled:cursor-not-allowed px-4 py-1.5 rounded text-sm font-medium transition-colors text-text-primary"
          >
            Delete (FAST)
          </button>

          <button
            onClick={() => runDelete("slow")}
            disabled={!selected.size}
            className="border border-warning text-warning hover:bg-warning-soft disabled:border-border-muted disabled:text-text-muted disabled:cursor-not-allowed px-4 py-1.5 rounded text-sm font-medium transition-colors"
          >
            Delete (SLOW)
          </button>

          <button
            onClick={() => runDelete("turbo")}
            disabled={!selected.size}
            className="border border-accent text-accent hover:bg-accent-soft disabled:border-border-muted disabled:text-text-muted disabled:cursor-not-allowed px-4 py-1.5 rounded text-sm font-medium transition-colors"
          >
            Delete (TURBO)
          </button>
        </div>
      </div>

      {opInfo && (
        <Alert severity="info">
          Mode: <strong>{opInfo.performance}</strong> • Time:{" "}
          <strong>{opInfo.timing_seconds ?? "?"}s</strong>
          {opInfo.related && (
            <>
              {" "}
              • Children — progress: {opInfo.related.progress ?? "-"},
              flashcards: {opInfo.related.flashcards ?? "-"}, decks:{" "}
              {opInfo.related.decks ?? "-"}
            </>
          )}
        </Alert>
      )}

      <DataFetchWrapper
        loading={loading}
        error={err}
        onRetry={load}
        loadingComponent={
          <div className="overflow-hidden rounded-xl border border-border-muted bg-surface-elevated">
            <table className="w-full text-sm">
              <tbody>
                <TableRowSkeleton columns={8} rows={Math.min(perPage, 8)} />
              </tbody>
            </table>
          </div>
        }
        isEmpty={!loading && items.length === 0}
        emptyMessage="No users found."
      >
        <div className="bg-surface-elevated rounded-xl border border-border-muted overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-muted bg-background-subtle/50">
                <th className="px-6 py-3">
                  <input
                    type="checkbox"
                    checked={
                      items.length > 0 &&
                      items.every((u) => selected.has(u.email))
                    }
                    onChange={toggleAllOnPage}
                    className="w-4 h-4 rounded border-border-muted bg-background-subtle"
                  />
                </th>
                <th className="text-left px-6 py-3 font-medium text-text-secondary">
                  Username
                </th>
                <th className="text-left px-6 py-3 font-medium text-text-secondary">
                  Email
                </th>
                <th className="text-left px-6 py-3 font-medium text-text-secondary">
                  Demo
                </th>
                <th className="text-left px-6 py-3 font-medium text-text-secondary">
                  Verified
                </th>
                <th className="text-left px-6 py-3 font-medium text-text-secondary">
                  Last seen
                </th>
                <th className="text-left px-6 py-3 font-medium text-text-secondary">
                  Created
                </th>
                <th className="text-left px-6 py-3 font-medium text-text-secondary">
                  Demo expires
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => {
                const checked = selected.has(u.email);
                return (
                  <tr
                    key={u.id}
                    className="border-b border-border-muted/50 hover:bg-surface-highlight/40"
                  >
                    <td className="px-6 py-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOne(u.email)}
                        className="w-4 h-4 rounded border-border-muted bg-background-subtle"
                      />
                    </td>
                    <td className="px-6 py-3 text-text-primary">
                      {u.username}
                    </td>
                    <td className="px-6 py-3 text-text-primary">{u.email}</td>
                    <td className="px-6 py-3 text-text-primary">
                      {u.is_demo ? "Yes" : "No"}
                    </td>
                    <td className="px-6 py-3 text-text-primary">
                      {u.email_verified ? "Yes" : "No"}
                    </td>
                    <td className="px-6 py-3 text-text-primary">
                      {formatEAT(u.last_seen)}
                    </td>
                    <td className="px-6 py-3 text-text-primary">
                      {u.created_at
                        ? new Date(u.created_at).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-6 py-3 text-text-primary">
                      {u.demo_expires_at
                        ? new Date(u.demo_expires_at).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DataFetchWrapper>

      <div className="flex justify-center">
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-border-muted rounded-lg hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed text-text-secondary"
          >
            Previous
          </button>
          <div className="flex items-center px-4 py-2 text-text-secondary">
            Page {page} of {totalPages}
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-border-muted rounded-lg hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed text-text-secondary"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- Teacher Invites Tab ------------------------- */

function TeacherInvitesTab() {
  const [maxUses, setMaxUses] = useState(1);
  const [days, setDays] = useState(30);
  const [invite, setInvite] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const isDev = !!import.meta.env.DEV;
  const base = window.location.origin;
  const link = invite?.code ? `${base}/teacher?code=${invite.code}` : "";

  const makeInvite = async () => {
    try {
      setErr("");
      setLoading(true);
      const payload = {
        max_uses: Number(maxUses) || 1,
        expires_in_days: Number(days) || undefined,
      };
      const inv = await createTeacherInvite(payload);
      setInvite(inv);
      showSuccess("Invite created successfully");
    } catch (e) {
      const message = e.message || "Failed to create invite";
      setErr(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess("Copied to clipboard");
    } catch {
      // no-op
    }
  };

  const makeMeTeacher = async () => {
    try {
      setLoading(true);
      const inv =
        invite ||
        (await createTeacherInvite({ max_uses: 1, expires_in_days: 30 }));
      await redeemTeacherCode(inv.code);
      window.location.href = "/teacher";
    } catch (e) {
      const apiError = handleApiError(e);
      setErr(apiError.message || "Self-promote failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!ADMIN_KEY && (
        <Alert severity="warning">
          <strong>VITE_ADMIN_API_KEY</strong> is not set. Admin calls will fail.
        </Alert>
      )}

      {err && <Alert severity="error">{err}</Alert>}

      <div className="bg-surface-elevated rounded-xl p-6 border border-border-muted">
        <h2 className="text-xl font-semibold mb-4 text-text-primary">
          Create a Teacher Invite
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-text-muted mb-1">
              Max uses
            </label>
            <input
              type="number"
              className="w-full bg-background-subtle border border-border-muted rounded-lg px-4 py-2 text-text-primary"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">
              Expires in (days)
            </label>
            <input
              type="number"
              className="w-full bg-background-subtle border border-border-muted rounded-lg px-4 py-2 text-text-primary"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={makeInvite}
              disabled={loading || !ADMIN_KEY}
              className="w-full bg-primary hover:bg-primary-emphasis disabled:bg-surface-highlight disabled:text-text-primary0 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? "Creating…" : "Create invite"}
            </button>
          </div>
        </div>

        {invite && (
          <div className="space-y-4 pt-4 border-t border-border-muted">
            <Alert severity="success">Invite created.</Alert>

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-sm text-text-muted mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={invite.code}
                  disabled
                  className="w-full bg-background-subtle border border-border-muted rounded-lg px-4 py-2 text-text-muted"
                />
              </div>
              <button
                onClick={() => copy(invite.code)}
                className="border border-border-muted hover:bg-surface-highlight px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Copy
              </button>
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-sm text-text-muted mb-1">
                  Invite link
                </label>
                <input
                  type="text"
                  value={link}
                  disabled
                  className="w-full bg-background-subtle border border-border-muted rounded-lg px-4 py-2 text-text-muted"
                />
              </div>
              <button
                onClick={() => copy(link)}
                className="border border-border-muted hover:bg-surface-highlight px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Copy link
              </button>
            </div>

            {isDev && (
              <button
                onClick={makeMeTeacher}
                disabled={loading}
                className="w-full border border-border-muted hover:bg-surface-elevated disabled:bg-background-subtle disabled:text-text-subtle px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? "Applying…" : "Make me a teacher (dev)"}
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-sm text-text-muted">
        Tip: share the link with a logged-in user. When they open{" "}
        <code className="bg-surface-elevated px-2 py-0.5 rounded text-text-secondary">
          /teacher?code=…
        </code>
        , the portal will auto-redeem and unlock.
      </p>
    </div>
  );
}
