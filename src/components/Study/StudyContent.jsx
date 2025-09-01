// src/components/Study/StudyContent.jsx
import { Box, Container, Typography, Pagination } from "@mui/material";
import StatsOverview from "./StatsOverview";
import DecksList from "./DecksList";

export default function StudyContent({
  userStats,
  decks,
  pagination,
  handlePageChange,
  onUpdateGoalClick,
  onDeckClick,
  onCreateDeckClick,
}) {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 4, fontWeight: "bold" }}
      >
        Study Dashboard
      </Typography>

      <StatsOverview
        userStats={userStats}
        onUpdateGoalClick={onUpdateGoalClick}
      />

      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
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
