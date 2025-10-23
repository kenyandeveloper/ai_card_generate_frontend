import { Alert, AlertTitle, Button } from "@mui/material";
import { AlertCircle, RefreshCw } from "lucide-react";

export const ErrorAlert = ({
  title = "Error",
  message,
  onRetry,
  severity = "error",
  className = "",
}) => {
  if (!message) return null;

  return (
    <Alert
      severity={severity}
      icon={<AlertCircle size={24} />}
      className={className}
      sx={{ mb: 2 }}
      action={
        onRetry && (
          <Button
            color="inherit"
            size="small"
            startIcon={<RefreshCw size={16} />}
            onClick={onRetry}
          >
            Retry
          </Button>
        )
      }
    >
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
};

export const InlineError = ({ message, className = "" }) => {
  if (!message) return null;

  return (
    <p
      className={`mt-1 flex items-center gap-1 text-sm text-red-600 ${className}`}
    >
      <AlertCircle size={16} />
      {message}
    </p>
  );
};

export const ErrorPage = ({
  title = "Something went wrong",
  message = "An error occurred while loading this page.",
  onRetry,
}) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <AlertCircle size={64} className="mb-4 text-red-500" />
      <h2 className="mb-2 text-2xl font-bold">{title}</h2>
      <p className="mb-4 max-w-md text-gray-600 dark:text-gray-300">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="contained"
          startIcon={<RefreshCw size={16} />}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
