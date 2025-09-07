// src/components/Billing/BillingDialog.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  createCheckout,
  getBillingStatus,
  verifyPayment,
} from "../../utils/billingApi";

const LAST_CHECKOUT_KEY = "flashlearn:last_checkout_id";

export default function BillingDialog({ open, onClose }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualId, setManualId] = useState(""); // invoice_id OR checkout_id
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const pollTimer = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const s = await getBillingStatus();
      setStatus(s);
      // Clear saved checkout id once active
      if (s?.subscription_status === "active") {
        try {
          localStorage.removeItem(LAST_CHECKOUT_KEY);
        } catch {}
      }
    } catch {
      // ignore ephemeral errors
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setError("");
    setManualId("");
    refresh();

    // while dialog is open, poll every 5s for 30s for UX
    if (pollTimer.current) clearInterval(pollTimer.current);
    let elapsed = 0;
    pollTimer.current = setInterval(async () => {
      elapsed += 5000;
      await refresh();
      if (elapsed >= 30000) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
    }, 5000);

    return () => {
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
    };
  }, [open, refresh]);

  const onSubscribe = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await createCheckout();
      // res => { checkout_url, api_ref, amount, currency, plan }
      if (!res?.checkout_url) throw new Error("No checkout URL returned");

      // Save api_ref so the return page can verify even if invoice_id is not provided
      try {
        localStorage.setItem(LAST_CHECKOUT_KEY, res.api_ref || "");
      } catch {
        // ignore storage errors
      }

      // Redirect in same tab so storage + auth context are preserved
      window.location.href = res.checkout_url;
    } catch (e) {
      setError("Could not start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onManualVerify = async () => {
    const val = manualId.trim();
    if (!val) return;
    try {
      setVerifying(true);
      setError("");
      // Be generous: send both fields; backend will use whichever matches
      await verifyPayment({ invoice_id: val, checkout_id: val });
      await refresh();
    } catch (e) {
      setError("Verification failed. Check the ID and try again.");
    } finally {
      setVerifying(false);
    }
  };

  const active = status?.subscription_status === "active";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Billing</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}

          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Plan: <b>Monthly — KES 100</b>
          </Typography>

          <Typography variant="body2">
            Status:{" "}
            <b style={{ color: active ? "green" : "inherit" }}>
              {active ? "Active" : "Inactive"}
            </b>
          </Typography>

          <Typography variant="body2">
            Free prompts this month:{" "}
            <b>
              {status?.month_used ?? 0}/{status?.month_free_limit ?? 5}
            </b>{" "}
            ({status?.month_remaining ?? 0} remaining)
          </Typography>

          {status?.current_period_end && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Renews: {new Date(status.current_period_end).toLocaleString()}
            </Typography>
          )}

          {!active && (
            <>
              <Button
                variant="contained"
                onClick={onSubscribe}
                disabled={loading}
                fullWidth
              >
                {loading ? (
                  <CircularProgress size={18} />
                ) : (
                  "Subscribe (KES 100)"
                )}
              </Button>

              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                After paying you’ll be redirected. If it doesn’t auto-activate,
                paste your <code>invoice_id</code> <i>or</i>{" "}
                <code>checkout_id</code> and press Verify:
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  label="invoice_id or checkout_id"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  fullWidth
                />
                <Button
                  variant="outlined"
                  onClick={onManualVerify}
                  disabled={verifying || !manualId.trim()}
                >
                  {verifying ? <CircularProgress size={18} /> : "Verify"}
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
