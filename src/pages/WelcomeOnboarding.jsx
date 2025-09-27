// src/pages/WelcomeOnboarding.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Chip,
  Button,
  Grid,
  Divider,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import CuratedDeckCard from "../components/Onboarding/CuratedDeckCard";
import AITeaserBanner from "../components/Onboarding/AITeaserBanner";
// ❌ Remove static catalog imports
// import { SUBJECTS, CURATED_DECKS } from "../utils/catalog";
import {
  assignStarterDecks,
  fetchDeckCount,
  fetchCatalog,
} from "../utils/onboardingApi";
import { useUser } from "../components/context/UserContext";
import NavBar from "../components/NavBar";

const MIN_PICK = 2;
const MAX_PICK = 3;
const DEFAULT_VISIBLE = 3; // for "Show all" toggle

export default function WelcomeOnboarding() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: userLoading } = useUser();

  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [catalog, setCatalog] = useState([]); // normalized from API
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  const [showAll, setShowAll] = useState(false);

  // derived subjects from catalog
  const subjects = useMemo(() => {
    const set = new Map(); // preserve first-seen label order
    for (const d of catalog) {
      const id = d.subject || "other";
      if (!set.has(id)) {
        // label: title case-ish
        const label = id.charAt(0).toUpperCase() + id.slice(1);
        set.set(id, { id, label });
      }
    }
    return Array.from(set.values());
  }, [catalog]);

  const [activeSubjects, setActiveSubjects] = useState(new Set());
  useEffect(() => {
    // when catalog loads, default to all subjects active
    if (subjects.length && activeSubjects.size === 0) {
      setActiveSubjects(new Set(subjects.map((s) => s.id)));
    }
  }, [subjects]); // eslint-disable-line

  const [selected, setSelected] = useState(() => new Set());

  const [snackbar, setSnackbar] = useState({
    open: false,
    msg: "",
    severity: "info",
  });

  // redirect guard: if user already has decks, skip onboarding
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (userLoading) return;
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }
      const count = await fetchDeckCount();
      if (!mounted) return;
      if (count > 0) navigate("/dashboard");
      else setChecking(false);
    })();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, userLoading, navigate]);

  // load catalog dynamically (with fallback handled inside onboardingApi)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await fetchCatalog();
      if (!mounted) return;
      setCatalog(Array.isArray(data) ? data : []);
      setLoadingCatalog(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredBySubject = useMemo(() => {
    if (activeSubjects.size === 0) return catalog;
    return catalog.filter((d) => activeSubjects.has(d.subject || "other"));
  }, [catalog, activeSubjects]);

  const visibleDecks = useMemo(() => {
    if (showAll) return filteredBySubject;
    return filteredBySubject.slice(0, DEFAULT_VISIBLE);
  }, [filteredBySubject, showAll]);

  const toggleSubject = (id) => {
    const next = new Set(activeSubjects);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    if (next.size === 0) return; // require at least one subject on
    setActiveSubjects(next);
  };

  const toggleDeck = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else {
      if (next.size >= MAX_PICK) return;
      next.add(id);
    }
    setSelected(next);
  };

  const canContinue = selected.size >= MIN_PICK && selected.size <= MAX_PICK;

  const handleContinue = async () => {
    if (!canContinue || submitting) return;
    setSubmitting(true);
    const ids = Array.from(selected);
    const res = await assignStarterDecks(ids);
    setSubmitting(false);

    if (res.ok) {
      if (res.errors?.length) {
        setSnackbar({
          open: true,
          msg: `Some decks failed: ${res.errors
            .map((e) => e.deck_id || e)
            .join(", ")}`,
          severity: "warning",
        });
      }
      navigate("/dashboard");
    } else {
      setSnackbar({
        open: true,
        msg: "Failed to create starter decks. Please try again.",
        severity: "error",
      });
    }
  };

  const handleTryAI = () => navigate("/mydecks?ai=new");
  const handleDismissAI = () => {
    try {
      localStorage.setItem("aiTeaserDismissed", "1");
    } catch {}
  };

  if (checking || loadingCatalog) {
    return (
      <>
        <NavBar />
        <Container maxWidth="lg" sx={{ py: 6, textAlign: "center" }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "background.default" }}>
      <NavBar />
      <Container
        maxWidth="lg"
        sx={{ pt: { xs: 3, md: 5 }, pb: { xs: 6, md: 10 } }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h4" fontWeight={800}>
            Get started with learning in 2 minutes
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Pick {MIN_PICK}–{MAX_PICK} decks you like — we’ll load starter
            content so you can begin right away.
          </Typography>
        </Box>

        {/* Subject filters (derived) */}
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          sx={{ flexWrap: "wrap", mb: 2 }}
        >
          {subjects.map((s) => {
            const on = activeSubjects.has(s.id);
            return (
              <Chip
                key={s.id}
                label={s.label}
                onClick={() => toggleSubject(s.id)}
                color={on ? "primary" : "default"}
                variant={on ? "filled" : "outlined"}
                sx={{ fontWeight: 600 }}
              />
            );
          })}
        </Stack>

        {/* Show all toggle */}
        <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
          <Button variant="outlined" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Show Less" : "Show All Catalogs"}
          </Button>
        </Stack>

        <Grid container spacing={2}>
          {visibleDecks.map((deck) => {
            const deckId = deck.id || deck.key || deck.title;
            return (
              <Grid item xs={12} sm={6} md={4} key={deckId}>
                <CuratedDeckCard
                  deck={deck}
                  selected={selected.has(deckId)}
                  onToggle={() => toggleDeck(deckId)}
                />
              </Grid>
            );
          })}
        </Grid>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mt: 3 }}
          alignItems="center"
        >
          <Button
            size="large"
            variant="contained"
            onClick={handleContinue}
            disabled={!canContinue || submitting}
          >
            {submitting ? "Setting up…" : "Start learning"}
          </Button>
          <Typography variant="body2" color="text.secondary">
            Selected {selected.size}/{MAX_PICK}
          </Typography>
        </Stack>

        <Divider sx={{ my: 4 }} />

        {typeof window !== "undefined" &&
          localStorage.getItem("aiTeaserDismissed") !== "1" && (
            <AITeaserBanner onTryAI={handleTryAI} onDismiss={handleDismissAI} />
          )}
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
