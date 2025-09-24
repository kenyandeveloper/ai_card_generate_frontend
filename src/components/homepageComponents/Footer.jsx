// src/components/homepageComponents/Footer.jsx
import { Box, Container, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        bgcolor: "background.paper",
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
