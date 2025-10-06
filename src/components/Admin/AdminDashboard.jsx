"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Alert,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Pagination,
  Checkbox,
  Toolbar,
  Stack,
  Divider,
} from "@mui/material";
import {
  getAdminStats,
  getOnlineUsers,
  listUsers,
  deleteUsers,
} from "../../utils/adminApi";

import { formatEAT } from "../../utils/time";

// Reuse the same envs your helper uses for the one endpoint we call locally
const API_URL = import.meta.env.VITE_API_URL;
const ADMIN_KEY = import.meta.env?.VITE_ADMIN_API_KEY || "";

function StatCard({ label, value }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5" sx={{ mt: 0.5 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState(0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
        Admin Dashboard
      </Typography>

      {!ADMIN_KEY ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>VITE_ADMIN_API_KEY</strong> is not set. Admin calls will fail.
        </Alert>
      ) : null}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Create Demo Users" />
        <Tab label="Users" />
      </Tabs>

      {tab === 0 && <OverviewTab />}
      {tab === 1 && <CreateDemoTab />}
      {tab === 2 && <UsersTab />}
    </Container>
  );
}

/* ---------------------------- Overview Tab ---------------------------- */

function OverviewTab() {
  const [within, setWithin] = useState(5); // minutes window for "online"
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
    const t = setInterval(load, 15000); // refresh every 15s
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [within]);

  if (err) return <Alert severity="error">{err}</Alert>;
  if (!stats) return <Typography>Loading…</Typography>;

  const unverified = (stats.total_users || 0) - (stats.verified_users || 0);

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total" value={stats.total_users} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Verified" value={stats.verified_users} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Unverified" value={unverified} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Demo" value={stats.demo_users} />
        </Grid>
      </Grid>

      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} sm={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
                sx={{ mb: 1 }}
              >
                <Typography variant="overline" color="text.secondary">
                  Online (≈{stats.within_minutes}m)
                </Typography>
                <TextField
                  size="small"
                  label="Window (minutes)"
                  type="number"
                  sx={{ width: 160 }}
                  value={within}
                  onChange={(e) =>
                    setWithin(
                      Math.max(1, Math.min(120, Number(e.target.value) || 5))
                    )
                  }
                />
              </Stack>
              <Typography variant="h5">{stats.online_now}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
                Active last {stats.within_minutes} minute(s)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <StatCard label="New (24h)" value={stats.new_last_24h} />
        </Grid>
      </Grid>
    </Box>
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

  // Local call (only this endpoint; others rely on utils/adminApi.js)
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
    <Box>
      {err && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {err}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Count"
            type="number"
            fullWidth
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Prefix"
            fullWidth
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Email domain"
            fullWidth
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Expires in (days)"
            type="number"
            fullWidth
            value={expires}
            onChange={(e) => setExpires(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Fixed password (optional)"
            fullWidth
            value={fixedPw}
            onChange={(e) => setFixedPw(e.target.value)}
          />
        </Grid>
      </Grid>

      <Button variant="contained" onClick={createBatch} disabled={loading}>
        {loading ? "Creating…" : "Create demo users"}
      </Button>

      {result?.users?.length ? (
        <Box sx={{ mt: 3 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Created {result.count} users
          </Alert>

          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Password</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.users.map((u) => (
                  <TableRow key={u.email}>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.password}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {asCSV && (
            <Button variant="outlined" onClick={downloadCSV}>
              Download CSV
            </Button>
          )}
        </Box>
      ) : null}
    </Box>
  );
}

/* ------------------------------- Users Tab ------------------------------ */

function UsersTab() {
  // Filters
  const [type, setType] = useState("all");
  const [q, setQ] = useState("");
  const [activeWithin, setActiveWithin] = useState("");

  // Paging
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // Data
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // Selection for deletes
  const [selected, setSelected] = useState(new Set());

  // Slow-mode demo knobs
  const [commitPer, setCommitPer] = useState("row"); // 'user' or 'row'
  const [sleepMs, setSleepMs] = useState(20); // 0..N
  const [echoSql, setEchoSql] = useState(true);

  // Last operation result (for UI feedback)
  const [opInfo, setOpInfo] = useState(null); // { performance, timing_seconds, related_records_deleted, ... }

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
      setSelected(new Set()); // clear selection on reload
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // 1) Dry-run preview (with same knobs)
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

      // eslint-disable-next-line no-alert
      if (!window.confirm(msg)) return;

      // 2) Actual delete
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

      // eslint-disable-next-line no-alert
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
      // eslint-disable-next-line no-alert
      alert(e.message || "Delete failed");
    }
  }

  return (
    <Box>
      {err && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {err}
        </Alert>
      )}

      {/* Filters & paging */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={3}>
          <TextField
            select
            label="Type"
            fullWidth
            value={type}
            onChange={(e) => {
              setPage(1);
              setType(e.target.value);
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="demo">Demo</MenuItem>
            <MenuItem value="verified">Verified</MenuItem>
            <MenuItem value="unverified">Unverified</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            label="Active within (mins)"
            fullWidth
            value={activeWithin}
            onChange={(e) => {
              setPage(1);
              setActiveWithin(e.target.value);
            }}
            placeholder="e.g. 5"
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label="Search (email or username)"
            fullWidth
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
          />
        </Grid>

        <Grid item xs={6} sm={1}>
          <TextField
            select
            label="Per page"
            fullWidth
            value={perPage}
            onChange={(e) => {
              setPage(1);
              setPerPage(Number(e.target.value));
            }}
          >
            {[10, 20, 50, 100, 1000].map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={6} sm={1} sx={{ display: "flex", alignItems: "center" }}>
          <Button
            variant="outlined"
            onClick={load}
            disabled={loading}
            fullWidth
          >
            {loading ? "…" : "Refresh"}
          </Button>
        </Grid>
      </Grid>

      {/* Delete toolbar with FAST/SLOW buttons and slow knobs */}
      <Toolbar
        disableGutters
        sx={{
          mb: 1,
          minHeight: "unset !important",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {data?.total ?? 0} total • {items.length} shown
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems="center"
        >
          {/* Slow knobs (only affect slow strategy) */}
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              select
              size="small"
              label="Commit per"
              value={commitPer}
              onChange={(e) => setCommitPer(e.target.value)}
              sx={{ width: 150 }}
            >
              <MenuItem value="user">user</MenuItem>
              <MenuItem value="row">row</MenuItem>
            </TextField>

            <TextField
              size="small"
              type="number"
              label="sleep ms"
              value={sleepMs}
              onChange={(e) =>
                setSleepMs(Math.max(0, Number(e.target.value) || 0))
              }
              sx={{ width: 120 }}
            />

            <Button
              variant={echoSql ? "contained" : "outlined"}
              onClick={() => setEchoSql((v) => !v)}
            >
              SQL Echo {echoSql ? "ON" : "OFF"}
            </Button>
          </Stack>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ display: { xs: "none", sm: "block" } }}
          />

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="error"
              disabled={!selected.size}
              onClick={() => runDelete("fast")}
            >
              Delete Selected (FAST)
            </Button>

            <Button
              variant="outlined"
              color="warning"
              disabled={!selected.size}
              onClick={() => runDelete("slow")}
            >
              Delete Selected (SLOW)
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              disabled={!selected.size}
              onClick={() => runDelete("turbo")}
            >
              Delete Selected (TURBO)
            </Button>
          </Stack>
        </Stack>
      </Toolbar>

      {opInfo && (
        <Alert severity="info" sx={{ mb: 1 }}>
          Mode: <strong>{opInfo.performance}</strong> • Time:{" "}
          <strong>{opInfo.timing_seconds ?? "?"}s</strong>
          {opInfo.related ? (
            <>
              {" "}
              • Children — progress: {opInfo.related.progress ?? "-"},
              flashcards: {opInfo.related.flashcards ?? "-"}, decks:{" "}
              {opInfo.related.decks ?? "-"}
            </>
          ) : null}
        </Alert>
      )}

      <Divider sx={{ mb: 1 }} />

      {/* Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selected.size > 0 && selected.size < (items?.length || 0)
                  }
                  checked={
                    items.length > 0 &&
                    items.every((u) => selected.has(u.email))
                  }
                  onChange={toggleAllOnPage}
                />
              </TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Demo</TableCell>
              <TableCell>Verified</TableCell>
              <TableCell>Last seen</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Demo expires</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((u) => {
              const checked = selected.has(u.email);
              return (
                <TableRow key={u.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={checked}
                      onChange={() => toggleOne(u.email)}
                    />
                  </TableCell>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.is_demo ? "Yes" : "No"}</TableCell>
                  <TableCell>{u.email_verified ? "Yes" : "No"}</TableCell>
                  <TableCell>{formatEAT(u.last_seen)}</TableCell>
                  <TableCell>
                    {u.created_at
                      ? new Date(u.created_at).toLocaleString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {u.demo_expires_at
                      ? new Date(u.demo_expires_at).toLocaleString()
                      : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
            {!items.length && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No users
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, v) => setPage(v)}
          color="primary"
          shape="rounded"
        />
      </Box>
    </Box>
  );
}
