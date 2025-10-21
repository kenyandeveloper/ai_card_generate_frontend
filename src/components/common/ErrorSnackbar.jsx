import { useEffect, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

export const ErrorSnackbar = ({
  message,
  onClose,
  autoHideDuration = 6000,
}) => {
  const [open, setOpen] = useState(Boolean(message));

  useEffect(() => {
    setOpen(Boolean(message));
  }, [message]);

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
    onClose?.();
  };

  if (!message) return null;

  const severity = message.severity || "error";
  const text = message.text || message.message || message;

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
        {text}
      </Alert>
    </Snackbar>
  );
};

let notificationCallback = null;

export const setNotificationCallback = (callback) => {
  notificationCallback = callback;
};

export const showNotification = (message, severity = "info") => {
  if (notificationCallback) {
    notificationCallback({ text: message, severity });
  } else {
    console.warn("Notification callback not set. Message:", message);
  }
};

export const showError = (message) => showNotification(message, "error");
export const showSuccess = (message) => showNotification(message, "success");
export const showInfo = (message) => showNotification(message, "info");
export const showWarning = (message) => showNotification(message, "warning");
