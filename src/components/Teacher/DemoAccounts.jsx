import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  listDemoAccounts,
  createDemoAccounts,
  extendDemoAccount,
  disableDemoAccount,
  redeemTeacherCode,
} from "../../utils/teacherApi";
import { useUser } from "../context/UserContext";
import TeacherInviteDialog from "./TeacherInviteDialog";
import { createTeacherInvite } from "../../utils/adminApi";

function daysLeft(expiresAt) {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt) - Date.now();
  return Math.ceil(ms / 86400000);
}

function StatusBadge({ days, disabled }) {
  if (disabled) {
    return (
      <span className="px-2 py-1 rounded text-xs font-medium bg-surface-highlight text-text-muted">
        Disabled
      </span>
    );
  }

  if (days == null) {
    return (
      <span className="px-2 py-1 rounded text-xs font-medium bg-surface-highlight text-text-muted">
        —
      </span>
    );
  }

  if (days < 1) {
    return (
      <span className="px-2 py-1 rounded text-xs font-medium bg-danger-soft/50 text-danger border border-danger">
        {days}d
      </span>
    );
  }

  if (days < 14) {
    return (
      <span className="px-2 py-1 rounded text-xs font-medium bg-warning-soft text-warning border border-warning">
        {days}d
      </span>
    );
  }

  return (
    <span className="px-2 py-1 rounded text-xs font-medium bg-success-soft text-success border border-success">
      {days}d
    </span>
  );
}

function SimplePagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];

  // Show: [1] ... [current-1] [current] [current+1] ... [total]
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, null, totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(
        1,
        null,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      pages.push(
        1,
        null,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        null,
        totalPages
      );
    }
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded hover:bg-surface-highlight disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page, i) =>
        page === null ? (
          <span key={`ellipsis-${i}`} className="px-2">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded font-medium ${
              page === currentPage
                ? "bg-primary text-text-primary"
                : "hover:bg-surface-highlight"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded hover:bg-surface-highlight disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function DemoAccounts() {
  const { refreshUser } = useUser();
  const location = useLocation();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [data, setData] = useState({ items: [], pagination: { total: 0 } });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [gated, setGated] = useState(false);
  const [dlgKey, setDlgKey] = useState(0);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await listDemoAccounts({ q, page, per_page: perPage });
      setData({
        items: res.items || res.results || [],
        pagination: res.pagination || { total: res.total || 0 },
      });
      setGated(false);
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.message ||
        "Failed to load demo accounts";
      setErr(msg);
      if (String(e?.response?.status) === "403") {
        setGated(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, page, perPage]);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const code = (sp.get("code") || "").trim();
    if (!code) return;

    (async () => {
      try {
        await redeemTeacherCode(code);
        await refreshUser();
        await load();
      } catch {
        setGated(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const totalPages = Math.max(
    1,
    Math.ceil((data.pagination.total || 0) / perPage)
  );

  const quickCreate = async () => {
    await createDemoAccounts({
      count: 5,
      prefix: "class",
      expires_in_days: 90,
    });
    await load();
  };

  const canSelfPromote =
    import.meta.env.DEV && !!import.meta.env.VITE_ADMIN_API_KEY;

  const selfPromote = async () => {
    try {
      setLoading(true);
      const inv = await createTeacherInvite({
        max_uses: 1,
        expires_in_days: 30,
      });
      await redeemTeacherCode(inv.code);
      await refreshUser();
      await load();
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || "Self-promote failed");
      setGated(true);
    } finally {
      setLoading(false);
      setDlgKey((k) => k + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Gated Access UI */}
      {gated && (
        <div className="bg-surface-elevated rounded-xl p-6 border border-border-muted">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-semibold">Teacher Portal</h1>
          </div>

          <p className="text-text-secondary mb-4">
            You need teacher access to view this page.
          </p>

          <div className="flex items-center gap-2">
            <TeacherInviteDialog key={dlgKey} cta variant="contained" />
            {canSelfPromote && (
              <button
                onClick={selfPromote}
                disabled={loading}
                className="px-4 py-2 rounded border border-border-muted hover:bg-surface-highlight disabled:opacity-50"
              >
                {loading ? "Granting…" : "Grant myself teacher access (dev)"}
              </button>
            )}
          </div>

          {err && <p className="text-danger mt-4">{String(err)}</p>}
        </div>
      )}

      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Teacher • Demo Accounts</h1>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search"
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            className="px-3 py-2 bg-surface-elevated border border-border-muted rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <select
            value={perPage}
            onChange={(e) => {
              setPage(1);
              setPerPage(Number(e.target.value));
            }}
            className="px-3 py-2 bg-surface-elevated border border-border-muted rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary w-28"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} per page
              </option>
            ))}
          </select>

          <button
            onClick={quickCreate}
            disabled={loading || gated}
            className="px-4 py-2 bg-primary hover:bg-primary-emphasis rounded font-medium disabled:opacity-50"
          >
            Create 5
          </button>

          <button
            onClick={load}
            disabled={loading}
            className="px-4 py-2 border border-border-muted hover:bg-surface-highlight rounded font-medium disabled:opacity-50"
          >
            {loading ? "…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {!gated && err && <p className="text-danger">{err}</p>}

      {/* Data Table */}
      <div className="bg-surface-elevated rounded-xl p-6 border border-border-muted">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-muted">
              <th className="text-left py-3 px-4 font-semibold">Username</th>
              <th className="text-left py-3 px-4 font-semibold">Email</th>
              <th className="text-left py-3 px-4 font-semibold">Expiry</th>
              <th className="text-left py-3 px-4 font-semibold">Status</th>
              <th className="text-left py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!gated &&
              (data.items || []).map((u) => {
                const d = daysLeft(u.demo_expires_at);
                const disabled = !!u.disabled;

                return (
                  <tr
                    key={u.id}
                  className="border-b border-border-muted hover:bg-surface-highlight"
                  >
                    <td className="py-3 px-4">{u.username}</td>
                    <td className="py-3 px-4 text-text-muted">{u.email}</td>
                    <td className="py-3 px-4">
                      <StatusBadge days={d} disabled={disabled} />
                    </td>
                    <td className="py-3 px-4">
                      {disabled ? "Disabled" : "Active"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            await extendDemoAccount(u.id, 30);
                            load();
                          }}
                          className="px-3 py-1 text-xs rounded border border-border-muted hover:bg-surface-highlight"
                        >
                          +30d
                        </button>
                        <button
                          onClick={async () => {
                            await disableDemoAccount(u.id);
                            load();
                          }}
                          className="px-3 py-1 text-xs rounded border border-border-muted hover:bg-surface-highlight"
                        >
                          {disabled ? "Enable" : "Disable"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

            {!gated && !data.items?.length && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-text-muted">
                  No demo accounts
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-4">
          <SimplePagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
