import { useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

const NotificationSnackbar = ({
  open,
  message,
  severity = "info",
  onClose,
  autoHideDuration = 6000,
}) => {
  useEffect(() => {
    if (open && autoHideDuration > 0) {
      const timer = setTimeout(onClose, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [open, autoHideDuration, onClose]);

  if (!open) return null;

  const severityStyles = {
    success: "bg-success-soft border-success text-success",
    error: "bg-danger-soft border-danger text-danger",
    warning: "bg-warning-soft border-warning text-warning",
    info: "bg-secondary-soft border-secondary text-secondary",
  };

  const severityIcons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = severityIcons[severity];
  const styles = severityStyles[severity];

  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 border rounded-lg shadow-lg ${styles}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 p-4 text-text-primary">
        <Icon className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary transition-colors flex-shrink-0"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationSnackbar;
