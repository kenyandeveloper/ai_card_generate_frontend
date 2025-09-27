// src/components/Dashboard/DashboardLayout.jsx
"use client";

import { Box, Container } from "@mui/material";
import NavBar from "../NavBar";
import MetaStrip from "../common/MetaStrip"; // ⬅️ use the shared component

const DashboardLayout = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "background.default",
      }}
    >
      <NavBar />

      {/* subtle background treatment */}
      <Box
        sx={{
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(1000px 300px at 20% -10%, rgba(99,102,241,0.08), transparent 60%), radial-gradient(800px 250px at 80% -10%, rgba(56,189,248,0.06), transparent 60%)",
            pointerEvents: "none",
          },
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            pt: { xs: 2, md: 3 },
            pb: { xs: 6, md: 10 },
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Ephemeral top strip — shows briefly, then disappears */}
          <MetaStrip
            showStreak
            showXP
            showWeeklyGoal
            showDue
            dueCount={0}
            ephemeral
            ephemeralMs={1200}
          />

          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
