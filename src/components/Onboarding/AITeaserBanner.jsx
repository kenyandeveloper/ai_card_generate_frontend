// src/components/Onboarding/AITeaserBanner.jsx
import { Alert, AlertTitle, Button, Stack } from "@mui/material";
import SparklesIcon from "@mui/icons-material/AutoAwesome";

export default function AITeaserBanner({ onTryAI, onDismiss }) {
  return (
    <Alert
      icon={<SparklesIcon fontSize="inherit" />}
      severity="info"
      sx={{
        border: 1,
        borderColor: "primary.main",
        bgcolor: "linear-gradient(135deg, #eef2ff, #f5faff)",
        mt: 3,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        borderRadius: 2,
      }}
      action={
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={onTryAI}
          >
            Try free AI deck
          </Button>
          <Button size="small" variant="outlined" onClick={onDismiss}>
            Not now
          </Button>
        </Stack>
      }
    >
      <AlertTitle sx={{ fontWeight: 700 }}>
        ✨ Want something custom?
      </AlertTitle>
      Generate a deck on <strong>any topic</strong> with AI. You get{" "}
      <strong>one free AI deck</strong> to try it out.
    </Alert>
  );
}
