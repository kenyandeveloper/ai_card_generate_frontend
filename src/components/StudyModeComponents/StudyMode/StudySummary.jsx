import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Grid,
} from "@mui/material";
import { Trophy, Brain, Target, Clock } from "lucide-react";
import StatsCard from "./StatsCard";

const StudySummary = ({ showSummary, sessionStats, handleExitStudy }) => {
  return (
    <Dialog open={showSummary} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ textAlign: "center" }}>
          <Trophy size={48} style={{ color: "#4CAF50", marginBottom: 16 }} />
          {/* Use div instead of Typography to avoid heading nesting */}
          <div
            style={{
              fontSize: "2.125rem",
              fontWeight: "bold",
              marginBottom: "8px",
              color: (theme) => theme.palette.text.primary,
            }}
          >
            Study Session Complete!
          </div>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <StatsCard
                icon={Brain}
                value={sessionStats.correctAnswers}
                total={sessionStats.totalCards}
                label="Correct Answers"
                color="success.main"
              />
            </Grid>
            <Grid item xs={6}>
              <StatsCard
                icon={Target}
                value={Math.round(
                  (sessionStats.correctAnswers / sessionStats.totalCards) * 100
                )}
                unit="%"
                label="Accuracy"
                color="primary.main"
              />
            </Grid>
            <Grid item xs={6}>
              <StatsCard
                icon={Clock}
                value={Math.round(sessionStats.timeSpent)}
                unit="min"
                label="Time Spent"
                color="info.main"
              />
            </Grid>
            <Grid item xs={6}>
              <StatsCard
                icon={Trophy}
                value={sessionStats.cardsLearned}
                label="Cards Mastered"
                color="warning.main"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, justifyContent: "center" }}>
        <Button
          variant="contained"
          onClick={handleExitStudy}
          sx={{
            minWidth: 200,
            py: 1.5,
          }}
        >
          Back to Study
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudySummary;
