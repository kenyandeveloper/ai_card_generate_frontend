import { Alert } from "@mui/material";

export default function ErrorHandler({ error, onClose }) {
  if (!error) return null;

  return (
    <Alert
      severity="error"
      sx={{ mb: { xs: 2, sm: 3, md: 4 } }}
      onClose={onClose}
    >
      {error}
    </Alert>
  );
}
