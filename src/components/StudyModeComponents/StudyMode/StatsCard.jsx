import { Box, Typography } from "@mui/material";

const StatsCard = ({ icon: Icon, value, total, unit = "", label, color }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: 2,
      bgcolor: "background.paper",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      textAlign: "center",
    }}
  >
    <Icon size={24} style={{ color, marginBottom: 8 }} />
    <Typography variant="h4" sx={{ fontWeight: "bold", color: "text.primary" }}>
      {value}
      {total ? `/${total}` : unit}
    </Typography>
    <Typography variant="body2" sx={{ color: "text.secondary" }}>
      {label}
    </Typography>
  </Box>
);

export default StatsCard;