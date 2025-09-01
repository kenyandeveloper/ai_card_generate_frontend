import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Slider,
  TextField,
  Button,
  useTheme,
} from "@mui/material";

const WeeklyGoalDialog = ({
  open,
  onClose,
  weeklyGoal,
  onWeeklyGoalChange,
  onSave,
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
          width: "100%",
          maxWidth: 400,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: "bold" }}>Update Weekly Goal</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Set a realistic goal for how many cards you want to study each week.
        </Typography>
        <Box sx={{ px: 2 }}>
          <Slider
            value={weeklyGoal}
            onChange={(e, newValue) => onWeeklyGoalChange(newValue)}
            aria-labelledby="weekly-goal-slider"
            valueLabelDisplay="on"
            step={5}
            marks
            min={5}
            max={200}
            sx={{
              color: theme.palette.primary.main,
              "& .MuiSlider-valueLabel": {
                bgcolor: theme.palette.primary.main,
              },
            }}
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Custom value:
          </Typography>
          <TextField
            value={weeklyGoal}
            onChange={(e) => {
              const value = Number.parseInt(e.target.value);
              if (!isNaN(value) && value > 0) {
                onWeeklyGoalChange(value);
              }
            }}
            variant="outlined"
            size="small"
            type="number"
            inputProps={{ min: 1 }}
            sx={{ width: 100 }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" color="primary">
          Cancel
        </Button>
        <Button onClick={onSave} variant="contained" color="primary">
          Save Goal
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WeeklyGoalDialog;