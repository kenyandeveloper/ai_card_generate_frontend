"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Stack,
} from "@mui/material";
import { redeemTeacherCode } from "../../utils/teacherAuth";
import api from "../../utils/apiClient";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function TeacherInviteDialog({
  open: controlledOpen,
  onClose,
  cta = false,
  ...btnProps
}) {
  const [open, setOpen] = useState(!!controlledOpen);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const { setUser } = useUser();
  const navigate = useNavigate();

  // Keep internal "open" in sync with controlled prop (if provided)
  useEffect(() => {
    if (typeof controlledOpen === "boolean") setOpen(controlledOpen);
  }, [controlledOpen]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setErr("");
    setCode("");
    setOpen(false);
    onClose?.();
  };

  const doRedeem = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    try {
      setErr("");
      setLoading(true);
      await redeemTeacherCode(trimmed);
      // Refetch /user so role reflects immediately
      const me = await api.get("/user").then((r) => r.data);
      setUser(me);
      handleClose();
      navigate("/teacher");
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || "Redeem failed");
    } finally {
      setLoading(false);
    }
  };

  // If cta=true, render BOTH the button and the dialog so the click actually opens it
  return (
    <>
      {cta && (
        <Button onClick={handleOpen} {...btnProps}>
          Enter teacher code
        </Button>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Enter Teacher Invite Code</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {err ? <Alert severity="error">{String(err)}</Alert> : null}
            <TextField
              autoFocus
              label="Invite code"
              fullWidth
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading && code.trim()) doRedeem();
              }}
              placeholder="Paste your code"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={doRedeem}
            variant="contained"
            disabled={loading || !code.trim()}
          >
            {loading ? "Redeeming…" : "Redeem"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
