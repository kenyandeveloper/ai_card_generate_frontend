// src/components/common/MetaStrip.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { Paper, Chip, Stack, Box, Tooltip, Fade } from "@mui/material";
import WhatshotRoundedIcon from "@mui/icons-material/WhatshotRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import AlarmRoundedIcon from "@mui/icons-material/AlarmRounded";
import { useUser } from "../context/UserContext"; // adjust path if needed

export default function MetaStrip({
  showStreak = true,
  showXP = true,
  showWeeklyGoal = true,
  showDue = false,
  dueCount = 0,
  // NEW: ephemeral controls
  ephemeral = false,
  ephemeralMs = 1200,
}) {
  const { user } = useUser?.() || {};
  const streak = user?.streakDays ?? user?.stats?.streak ?? 2;
  const xp = user?.xp ?? 120;
  const nextLevelXp = user?.nextLevelXp ?? 200;
  const weeklyTarget = user?.weeklyGoal?.targetDays ?? 3;
  const weeklyProgress = user?.weeklyGoal?.completedDays ?? 1;

  // show-then-hide state
  const [visible, setVisible] = useState(true);

  // respect reduced motion: no fade, but still hide after timeout
  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches,
    []
  );

  useEffect(() => {
    if (!ephemeral) return;
    const t = setTimeout(() => setVisible(false), ephemeralMs);
    return () => clearTimeout(t);
  }, [ephemeral, ephemeralMs]);

  const content = (
    <Paper
      elevation={0}
      sx={{
        px: 1.5,
        py: 1,
        mb: { xs: 2, md: 2.5 },
        border: 0,
        bgcolor: "transparent",
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexWrap: "wrap",
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`, // keep it lightweight
      }}
      aria-hidden={!visible}
    >
      <Stack direction="row" spacing={1} sx={{ flexGrow: 1, flexWrap: "wrap" }}>
        {showStreak && (
          <Chip
            icon={<WhatshotRoundedIcon color="warning" />}
            label={`Day ${streak} streak`}
            sx={{ bgcolor: "action.selected" }}
            size="small"
          />
        )}
        {showXP && (
          <Chip
            icon={<StarRoundedIcon />}
            label={`${xp}/${nextLevelXp} XP`}
            sx={{ bgcolor: "action.hover" }}
            size="small"
          />
        )}
        {showWeeklyGoal && (
          <Chip
            icon={<FlagRoundedIcon />}
            label={`${weeklyProgress}/${weeklyTarget} days this week`}
            sx={{ bgcolor: "action.hover" }}
            size="small"
          />
        )}
        {showDue && (
          <Tooltip title="Cards due for review (spaced repetition)">
            <Chip
              icon={<AlarmRoundedIcon />}
              label={`${dueCount} due`}
              sx={{ bgcolor: "action.hover" }}
              size="small"
            />
          </Tooltip>
        )}
      </Stack>

      {/* CTA removed intentionally */}
      <Box sx={{ ml: "auto" }} />
    </Paper>
  );

  if (!ephemeral || prefersReducedMotion) {
    // show normally (or snap-hide after timeout if reduced motion)
    return visible ? content : null;
  }

  return (
    <Fade in={visible} timeout={{ enter: 250, exit: 250 }} unmountOnExit>
      {content}
    </Fade>
  );
}
