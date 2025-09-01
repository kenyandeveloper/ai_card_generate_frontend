import { Box, Container, Grid, Typography, Divider } from "@mui/material";

export default function Footer({ isDarkMode }) {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        bgcolor: isDarkMode ? "background.paper" : "background.nav",
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="body2"
          align="center"
          sx={{ color: "text.secondary" }}
        >
          © {new Date().getFullYear()} Flashlearn. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
