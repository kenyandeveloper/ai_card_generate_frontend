import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Download } from "lucide-react";
import {
  getAdminStats,
  listUsers,
  deleteUsers,
  createTeacherInvite,
} from "../../utils/adminApi";
import { formatEAT } from "../../utils/time";

const API_URL = import.meta.env.VITE_API_URL;
const ADMIN_KEY = import.meta.env?.VITE_ADMIN_API_KEY || "";

function StatCard({ label, value }) {
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 h-full">
      <div className="text-xs uppercase text-slate-400 tracking-wide font-medium">
        {label}
      </div>
      <div className="text-3xl font-bold mt-2 text-slate-100">{value}</div>
    </div>
  );
}

function Alert({ severity, children }) {
  const colors = {
    warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-200",
    error: "bg-red-500/10 border-red-500/20 text-red-200",
    success: "bg-green-500/10 border-green-500/20 text-green-200",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-200",
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
      <h1 className="text-4xl font-bold mb-6 text-slate-100">
        Admin Dashboard
      </h1>

      {!ADMIN_KEY && (
        <Alert severity="warning">
          <strong>VITE_ADMIN_API_KEY</strong> is not set. Admin calls will fail.
        </Alert>
      )}

      <div className="border-b border-slate-700 mb-6">
        <div className="flex gap-1">
          {["Overview", "Create Demo Users", "Users", "Teacher Invites"].map(
            (label, i) => (
              <button
                key={i}
                onClick={() => setTab(i)}
                className={`px-6 py-3 font-medium transition-colors ${
                  tab === i
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-slate-400 hover:text-slate-300"
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

  const load = async () => {
    try {
      setErr("");
      const data = await getAdminStats(within);
      setStats(data);
    } catch (e) {
      setErr(e.message || "Failed to load stats");
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [within]);

  if (err) return <Alert severity="error">{err}</Alert>;
  if (!stats) return <p className="text-slate-400">Loading…</p>;

  const unverified = (stats.total_users || 0) - (stats.verified_users || 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.total_users} />
        <StatCard label="Verified" value={stats.verified_users} />
        <StatCard label="Unverified" value={unverified} />
        <StatCard label="Demo" value={stats.demo_users} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="text-xs uppercase text-slate-400 tracking-wide font-medium">
              Online (≈{stats.within_minutes}m)
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-slate-400 mb-1">
                Window (minutes)
              </label>
              <input
                type="number"
                className="w-40 bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-slate-100"
                value={within}
                onChange={(e) =>
                  setWithin(
                    Math.max(1, Math.min(120, Number(e.target.value) || 5))
                  )
                }
              />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-100">
            {stats.online_now}
          </div>
          <p className="text-sm text-slate-400 mt-2">
            Active last {stats.within_minutes} minute(s)
          </p>
        </div>

        <StatCard label="New (24h)" value={stats.new_last_24h} />
      </div>
    </div>
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
      const res = await fetch(`${API_URL}/admin/demo/batch_create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": ADMIN_KEY,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setErr(e.message || "Failed to create demo users");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {err && <Alert severity="error">{err}</Alert>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Count</label>
          <input
            type="number"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-100"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Prefix</label>
          <input
            type="text"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-100"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">
            Email domain
          </label>
          <input
            type="text"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-100"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">
            Expires in (days)
          </label>
          <input
            type="number"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-100"
            value={expires}
            onChange={(e) => setExpires(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">
          Fixed password (optional)
        </label>
        <input
          type="text"
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-100"
          value={fixedPw}
          onChange={(e) => setFixedPw(e.target.value)}
        />
      </div>

      <button
        onClick={createBatch}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 px-6 py-2.5 rounded-lg font-medium transition-colors"
      >
        {loading ? "Creating…" : "Create demo users"}
      </button>

      {result?.users?.length > 0 && (
        <div className="space-y-4">
          <Alert severity="success">Created {result.count} users</Alert>

          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50">
                  <th className="text-left px-6 py-3 font-medium text-slate-300">
                    Username
                  </th>
                  <th className="text-left px-6 py-3 font-medium text-slate-300">
                    Email
                  </th>
                  <th className="text-left px-6 py-3 font-medium text-slate-300">
                    Password
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.users.map((u) => (
                  <tr
                    key={u.email}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30"
                  >
                    <td className="px-6 py-3 text-slate-200">{u.username}</td>
                    <td className="px-6 py-3 text-slate-200">{u.email}</td>
                    <td className="px-6 py-3 text-slate-200">{u.password}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {asCSV && (
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 border border-slate-600 hover:bg-slate-800 px-6 py-2.5 rounded-lg font-medium transition-colors"
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

  const paramsForList = () => {
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
  };

  const load = async () => {
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
  };

  useEffect(() => {
    load();
  }, [type, q, page, perPage, activeWithin]);

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

      alert(
        [
          `Mode: ${res.performance}`,
          `Time: ${res.timing_seconds ?? "?"}s`,
          `Deleted: ${res.deleted?.length || 0}`,
          res.related
            ? `Children → progress=${res.related.progress ?? "-"}, flashcards=${
                res.related.flashcards ?? "-"
              }, decks=${res.related.decks ?? "-"}`
            : "",
        ]
          .filter(Boolean)
          .join("\n")
      );

      await load();
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      {err && <Alert severity="error">{err}</Alert>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Type</label>
          <select
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-100"
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
          <label className="block text-sm text-slate-400 mb-1">
            Active within (mins)
          </label>
          <input
            type="text"
            placeholder="e.g. 5"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-100"
            value={activeWithin}
            onChange={(e) => {
              setPage(1);
              setActiveWithin(e.target.value);
            }}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-slate-400 mb-1">
            Search (email or username)
          </label>
          <input
            type="text"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-100"
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Per page</label>
          <select
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-100"
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
            className="w-full border border-slate-600 hover:bg-slate-800 disabled:bg-slate-900 disabled:text-slate-600 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? "…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-t border-b border-slate-700">
        <p className="text-sm text-slate-400">
          {data?.total ?? 0} total • {items.length} shown
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Commit per</label>
            <select
              className="bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-slate-100"
              value={commitPer}
              onChange={(e) => setCommitPer(e.target.value)}
            >
              <option value="user">user</option>
              <option value="row">row</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">sleep ms</label>
            <input
              type="number"
              className="w-24 bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-slate-100"
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
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "border border-slate-600 hover:bg-slate-800 text-slate-300"
            }`}
          >
            SQL Echo {echoSql ? "ON" : "OFF"}
          </button>

          <div className="h-6 w-px bg-slate-700" />

          <button
            onClick={() => runDelete("fast")}
            disabled={!selected.size}
            className="bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 px-4 py-1.5 rounded text-sm font-medium transition-colors"
          >
            Delete (FAST)
          </button>

          <button
            onClick={() => runDelete("slow")}
            disabled={!selected.size}
            className="border border-yellow-600 text-yellow-500 hover:bg-yellow-600/10 disabled:border-slate-700 disabled:text-slate-500 px-4 py-1.5 rounded text-sm font-medium transition-colors"
          >
            Delete (SLOW)
          </button>

          <button
            onClick={() => runDelete("turbo")}
            disabled={!selected.size}
            className="border border-purple-600 text-purple-500 hover:bg-purple-600/10 disabled:border-slate-700 disabled:text-slate-500 px-4 py-1.5 rounded text-sm font-medium transition-colors"
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

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50">
              <th className="px-6 py-3">
                <input
                  type="checkbox"
                  checked={
                    items.length > 0 &&
                    items.every((u) => selected.has(u.email))
                  }
                  onChange={toggleAllOnPage}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900"
                />
              </th>
              <th className="text-left px-6 py-3 font-medium text-slate-300">
                Username
              </th>
              <th className="text-left px-6 py-3 font-medium text-slate-300">
                Email
              </th>
              <th className="text-left px-6 py-3 font-medium text-slate-300">
                Demo
              </th>
              <th className="text-left px-6 py-3 font-medium text-slate-300">
                Verified
              </th>
              <th className="text-left px-6 py-3 font-medium text-slate-300">
                Last seen
              </th>
              <th className="text-left px-6 py-3 font-medium text-slate-300">
                Created
              </th>
              <th className="text-left px-6 py-3 font-medium text-slate-300">
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
                  className="border-b border-slate-700/50 hover:bg-slate-700/30"
                >
                  <td className="px-6 py-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOne(u.email)}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-900"
                    />
                  </td>
                  <td className="px-6 py-3 text-slate-200">{u.username}</td>
                  <td className="px-6 py-3 text-slate-200">{u.email}</td>
                  <td className="px-6 py-3 text-slate-200">
                    {u.is_demo ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-3 text-slate-200">
                    {u.email_verified ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-3 text-slate-200">
                    {formatEAT(u.last_seen)}
                  </td>
                  <td className="px-6 py-3 text-slate-200">
                    {u.created_at
                      ? new Date(u.created_at).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-6 py-3 text-slate-200">
                    {u.demo_expires_at
                      ? new Date(u.demo_expires_at).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              );
            })}
            {!items.length && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-8 text-center text-slate-400"
                >
                  No users
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center">
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-slate-600 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300"
          >
            Previous
          </button>
          <div className="flex items-center px-4 py-2 text-slate-300">
            Page {page} of {totalPages}
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-slate-600 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300"
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
    } catch (e) {
      setErr(e.message || "Failed to create invite");
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied!");
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
      await fetch(`${API_URL}/auth/teacher/redeem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            localStorage.getItem("authToken") ||
            localStorage.getItem("jwt") ||
            ""
          }`,
        },
        body: JSON.stringify({ code: inv.code }),
      }).then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      });
      window.location.href = "/teacher";
    } catch (e) {
      setErr(e.message || "Self-promote failed");
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

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-semibold mb-4 text-slate-100">
          Create a Teacher Invite
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Max uses
            </label>
            <input
              type="number"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-100"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Expires in (days)
            </label>
            <input
              type="number"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-100"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={makeInvite}
              disabled={loading || !ADMIN_KEY}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? "Creating…" : "Create invite"}
            </button>
          </div>
        </div>

        {invite && (
          <div className="space-y-4 pt-4 border-t border-slate-700">
            <Alert severity="success">Invite created.</Alert>

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-sm text-slate-400 mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={invite.code}
                  disabled
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-400"
                />
              </div>
              <button
                onClick={() => copy(invite.code)}
                className="border border-slate-600 hover:bg-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Copy
              </button>
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-sm text-slate-400 mb-1">
                  Invite link
                </label>
                <input
                  type="text"
                  value={link}
                  disabled
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-400"
                />
              </div>
              <button
                onClick={() => copy(link)}
                className="border border-slate-600 hover:bg-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Copy link
              </button>
            </div>

            {isDev && (
              <button
                onClick={makeMeTeacher}
                disabled={loading}
                className="w-full border border-slate-600 hover:bg-slate-800 disabled:bg-slate-900 disabled:text-slate-600 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? "Applying…" : "Make me a teacher (dev)"}
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-sm text-slate-400">
        Tip: share the link with a logged-in user. When they open{" "}
        <code className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
          /teacher?code=…
        </code>
        , the portal will auto-redeem and unlock.
      </p>
    </div>
  );
}
