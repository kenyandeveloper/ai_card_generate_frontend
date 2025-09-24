// src/components/Study/StudyContent.jsx
import { Box, Container, Typography, Pagination } from "@mui/material";
import DecksList from "./DecksList";

export default function StudyContent({
  decks,
  pagination,
  handlePageChange,
  onDeckClick,
  onCreateDeckClick,
  extraTop, // 👈 NEW: render arbitrary content right under the title
}) {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      <Typography variant="h4" sx={{ mb: 2.5, fontWeight: 800 }}>
        Study Dashboard
      </Typography>

      {/* Optional slot under the title */}
      {extraTop}

      <Typography variant="h5" sx={{ mt: 2, mb: 1.5, fontWeight: 700 }}>
        Your Decks
      </Typography>

      <DecksList
        decks={decks}
        onDeckClick={onDeckClick}
        onCreateDeckClick={onCreateDeckClick}
      />

      {pagination.totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: { xs: 3, sm: 4 },
            mb: { xs: 2, sm: 3 },
          }}
        >
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={(_, page) => handlePageChange(page)}
            color="primary"
            size="medium"
            sx={{
              "& .MuiPaginationItem-root": {
                color: "text.primary",
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.dark" },
                },
              },
            }}
          />
        </Box>
      )}
    </Container>
  );
}
