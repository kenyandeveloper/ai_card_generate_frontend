import { Grid, Pagination, Box } from "@mui/material";
import { motion } from "framer-motion";
import DeckCard from "./DeckCard";
import EmptyState from "./EmptyState";

export default function DecksGrid({
  decks,
  filteredDecks,
  currentPage,
  totalPages,
  isMobile,
  onEdit,
  onDelete,
  onStudy,
  onPageChange,
  onCreateDeck,
  theme,
  navigate,
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1 },
        },
      }}
      initial="hidden"
      animate="visible"
    >
      {filteredDecks.length === 0 ? (
        <EmptyState
          theme={theme}
          onCreateDeck={onCreateDeck}
          isMobile={isMobile}
        />
      ) : (
        <>
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
            {filteredDecks.map((deck) => (
              <Grid item xs={6} sm={6} md={4} key={deck.id}>
                <DeckCard
                  deck={deck}
                  theme={theme}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStudy={onStudy}
                  navigate={navigate}
                  isMobile={isMobile}
                />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: { xs: 3, sm: 4 },
                mb: { xs: 2, sm: 3 },
              }}
            >
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={onPageChange}
                color="primary"
                size={isMobile ? "small" : "medium"}
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
        </>
      )}
    </motion.div>
  );
}
