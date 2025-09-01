import { Grid, Typography, Box, Button } from "@mui/material";

export default function FooterLinkColumn({ title, links }) {
  return (
    <Grid item xs={12} md={2}>
      <Typography
        variant="subtitle1"
        sx={{ mb: 2, fontWeight: "bold", color: "text.primary" }}
      >
        {title}
      </Typography>
      <Box component="ul" sx={{ p: 0, m: 0, listStyle: "none" }}>
        {links.map((item) => (
          <Box component="li" key={item} sx={{ mb: 1 }}>
            <Button
              variant="text"
              sx={{
                p: 0,
                color: "text.secondary",
                "&:hover": { color: "primary.main" },
              }}
            >
              {item}
            </Button>
          </Box>
        ))}
      </Box>
    </Grid>
  );
}
