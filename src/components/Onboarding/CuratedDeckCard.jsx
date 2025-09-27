// src/components/Onboarding/CuratedDeckCard.jsx
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Chip,
  Box,
  Checkbox,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function CuratedDeckCard({ deck, selected, onToggle }) {
  return (
    <Card
      variant="outlined"
      sx={{
        position: "relative",
        borderColor: selected ? "primary.main" : "divider",
        boxShadow: selected ? "0 0 0 2px rgba(85,102,255,0.35)" : "none",
        transition: "all 0.2s ease",
      }}
    >
      <CardActionArea onClick={() => onToggle(deck.id)}>
        {/* Selection badge */}
        {selected && (
          <CheckCircleIcon
            color="primary"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              fontSize: 24,
              bgcolor: "background.paper",
              borderRadius: "50%",
            }}
          />
        )}

        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Chip size="small" label={deck.subject} variant="outlined" />
            <Chip size="small" label={`${deck.estCards} cards`} />
          </Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {deck.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {deck.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
