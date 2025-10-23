import { useEffect, useRef } from "react";

const WeeklyGoalDialog = ({
  open,
  onClose,
  weeklyGoal,
  onWeeklyGoalChange,
  onSave,
}) => {
  const dialogRef = useRef(null);

  // Close on backdrop click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, onClose]);

  if (!open) return null;

  const handleNumberInputChange = (e) => {
    const value = Number.parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      onWeeklyGoalChange(Math.min(value, 200)); // Cap at max
    }
  };

  return (
    <div className="fixed inset-0 bg-background-overlay flex items-center justify-center z-50 p-4">
      <div
        ref={dialogRef}
        className="weekly-goal-dialog bg-surface-elevated border border-border-muted rounded-2xl w-full max-w-md"
      >
        {/* Header */}
        <div className="p-6 border-b border-border-muted">
          <h2 className="text-xl font-bold text-text-primary">Update Weekly Goal</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-text-muted text-sm mb-6">
            Set a realistic goal for how many cards you want to study each week.
          </p>

          {/* Slider */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-text-secondary text-sm">
                Weekly Goal: {weeklyGoal} cards
              </span>
              <span className="text-text-muted text-xs">5-200</span>
            </div>

            <input
              type="range"
              value={weeklyGoal}
              onChange={(e) =>
                onWeeklyGoalChange(Number.parseInt(e.target.value))
              }
              min={5}
              max={200}
              step={5}
              className="w-full h-2 bg-surface-highlight rounded-lg appearance-none cursor-pointer slider"
            />

            <div className="flex justify-between text-xs text-text-primary0 mt-1">
              <span>5</span>
              <span>200</span>
            </div>
          </div>

          {/* Custom Input */}
          <div className="flex items-center gap-3">
            <span className="text-text-secondary text-sm whitespace-nowrap">
              Custom value:
            </span>
            <input
              type="number"
              value={weeklyGoal}
              onChange={handleNumberInputChange}
              min={1}
              className="bg-surface-highlight border border-border-muted rounded-lg px-3 py-2 text-text-primary text-sm w-24 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end p-6 border-t border-border-muted">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border-muted text-text-secondary hover:bg-surface-highlight rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-primary hover:bg-primary-emphasis text-text-primary rounded-lg transition-colors"
          >
            Save Goal
          </button>
        </div>
      </div>

      {/* Slider thumb styling */}
      <style>{`
        .weekly-goal-dialog .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e293b;
        }

        .weekly-goal-dialog .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e293b;
        }
      `}</style>
    </div>
  );
};

export default WeeklyGoalDialog;
