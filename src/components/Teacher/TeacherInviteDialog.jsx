// src/components/TeacherInviteDialog.jsx
import { useEffect, useRef, useState } from "react";
import { teacherApi, authApi } from "../../utils/apiClient";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function TeacherInviteDialog({
  open: controlledOpen,
  onClose,
  cta = false,
  ...btnProps
}) {
  const [internalOpen, setInternalOpen] = useState(!!controlledOpen);
  const open =
    typeof controlledOpen === "boolean" ? controlledOpen : internalOpen;

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const inputRef = useRef(null);

  const { setUser } = useUser();
  const navigate = useNavigate();

  // sync internal state if controlled
  useEffect(() => {
    if (typeof controlledOpen === "boolean") setInternalOpen(controlledOpen);
  }, [controlledOpen]);

  // focus the input when the dialog opens
  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  const handleOpen = () => setInternalOpen(true);
  const handleClose = () => {
    setErr("");
    setCode("");
    if (typeof controlledOpen !== "boolean") setInternalOpen(false);
    onClose?.();
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape" && !loading) handleClose();
  };

  const doRedeem = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    try {
      setErr("");
      setLoading(true);
      await teacherApi.redeemTeacherCode(trimmed);
      const me = await authApi.getUser();
      setUser(me);
      handleClose();
      navigate("/teacher");
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || "Redeem failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Optional CTA trigger button */}
      {cta && (
        <button
          type="button"
          onClick={handleOpen}
          className="px-4 py-2 rounded border border-border-muted hover:bg-surface-highlight disabled:opacity-50"
          {...btnProps}
        >
          Enter teacher code
        </button>
      )}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
          aria-labelledby="invite-dialog-title"
          onKeyDown={onKeyDown}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => !loading && handleClose()}
          />

          {/* Panel */}
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border-strong bg-background-subtle p-6 shadow-2xl">
            <h2 id="invite-dialog-title" className="text-lg font-semibold">
              Enter Teacher Invite Code
            </h2>

            <div className="mt-4 space-y-3">
              {err ? (
                <div
                  role="alert"
                  className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-danger text-sm"
                >
                  {String(err)}
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="invite-code"
                  className="block text-sm font-medium text-text-primary mb-1"
                >
                  Invite code
                </label>
                <input
                  id="invite-code"
                  ref={inputRef}
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading && code.trim())
                      doRedeem();
                  }}
                  placeholder="Paste your code"
                  className="w-full rounded-lg bg-surface-elevated border border-border-muted px-3 py-2 outline-none focus:border-border-muted"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 rounded border border-border-muted hover:border-border-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={doRedeem}
                disabled={loading || !code.trim()}
                className="px-4 py-2 rounded bg-primary hover:bg-primary font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Redeeming…" : "Redeem"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
