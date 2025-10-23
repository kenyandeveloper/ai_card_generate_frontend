// src/pages/WelcomeOnboarding.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CuratedDeckCard from "../components/Onboarding/CuratedDeckCard";
import AITeaserBanner from "../components/Onboarding/AITeaserBanner";
import {
  assignStarterDecks,
  fetchDeckCount,
  fetchCatalog,
} from "../utils/onboardingApi";
import { useUser } from "../hooks/useUser";
import NavBar from "../components/NavBar";
import { motion } from "framer-motion";

const MIN_PICK = 2;
const MAX_PICK = 3;
const DEFAULT_VISIBLE = 3;

export default function WelcomeOnboarding() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: userLoading } = useUser();

  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const hasCheckedDeckCountRef = useRef(false);

  const [catalog, setCatalog] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  const [showAll, setShowAll] = useState(false);
  const [aiDismissed, setAiDismissed] = useState(false);

  // derived subjects from catalog
  const subjects = useMemo(() => {
    const set = new Map();
    for (const d of catalog) {
      const id = d.subject || "other";
      if (!set.has(id)) {
        const label = id.charAt(0).toUpperCase() + id.slice(1);
        set.set(id, { id, label });
      }
    }
    return Array.from(set.values());
  }, [catalog]);

  const [activeSubjects, setActiveSubjects] = useState(new Set());
  useEffect(() => {
    if (!subjects.length) return;
    setActiveSubjects((prev) => {
      if (prev.size > 0) return prev;
      return new Set(subjects.map((s) => s.id));
    });
  }, [subjects]); // intentional: prime once

  const [selected, setSelected] = useState(() => new Set());

  const [snackbar, setSnackbar] = useState({
    open: false,
    msg: "",
    severity: "info", // 'info' | 'success' | 'warning' | 'error'
  });

  // redirect guard: if user already has decks, skip onboarding
  useEffect(() => {
    if (hasCheckedDeckCountRef.current) return;

    let cancelled = false;
    const run = async () => {
      if (userLoading) return;
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }
      try {
        const count = await fetchDeckCount();
        if (cancelled) return;
        if (count > 0) navigate("/dashboard");
        else setChecking(false);
      } catch (err) {
        if (!cancelled) setChecking(false);
        console.warn("[WelcomeOnboarding] deck count failed:", err);
      } finally {
        hasCheckedDeckCountRef.current = true;
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, userLoading, navigate]);

  // load catalog
  useEffect(() => {
    setLoadingCatalog(true);
    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      try {
        const data = await fetchCatalog({ signal: controller.signal });
        if (!cancelled) {
          setCatalog(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("[WelcomeOnboarding] catalog load failed:", err);
          setCatalog([]);
        }
      } finally {
        if (!cancelled) setLoadingCatalog(false);
      }
    };

    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  // read AI teaser dismissal once on mount
  useEffect(() => {
    try {
      setAiDismissed(localStorage.getItem("aiTeaserDismissed") === "1");
    } catch {
      // ignore localStorage read errors (e.g., privacy mode)
    }
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
    if (next.size === 0) return; // keep at least one active
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
    } catch {
      // ignore localStorage write errors (e.g., storage disabled)
    }
    setAiDismissed(true);
  };

  if (checking || loadingCatalog) {
    return (
      <>
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-border-muted border-t-slate-300"
            aria-label="Loading"
            role="status"
          />
        </div>
      </>
    );
  }

  return (
    <main className="min-h-dvh bg-background text-text-primary">
      <NavBar />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 md:pt-5 pb-6 md:pb-10">
        <header className="text-center mb-3">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Get started with learning in 2 minutes
          </h1>
          <p className="text-sm md:text-base text-text-secondary mt-1">
            Pick {MIN_PICK}–{MAX_PICK} decks you like — we’ll load starter
            content so you can begin right away.
          </p>
        </header>

        {/* Subject filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          {subjects.map((s) => {
            const on = activeSubjects.has(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSubject(s.id)}
                className={[
                  "px-3 py-1.5 rounded-full text-sm font-semibold transition border",
                  on
                    ? "bg-primary border-primary text-primary-foreground hover:bg-primary-emphasis"
                    : "bg-background-subtle border-border-muted text-text-secondary hover:border-primary hover:text-primary",
                ].join(" ")}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Show all toggle */}
        <div className="flex justify-center mb-2">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="px-4 py-2 rounded-lg border border-border-muted hover:border-border-muted text-sm"
          >
            {showAll ? "Show Less" : "Show All Catalogs"}
          </button>
        </div>

        {/* Deck grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {visibleDecks.map((deck) => {
            const deckId = deck.id || deck.key || deck.title;
            return (
              <div key={deckId}>
                <CuratedDeckCard
                  deck={deck}
                  selected={selected.has(deckId)}
                  onToggle={() => toggleDeck(deckId)}
                />
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2 mt-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleContinue}
            disabled={!canContinue || submitting}
            className="w-full sm:w-auto rounded-lg px-5 py-2.5 font-medium bg-primary hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Setting up…" : "Start learning"}
          </motion.button>

          <p className="text-sm text-text-secondary">
            Selected {selected.size}/{MAX_PICK}
          </p>
        </div>

        <hr className="my-4 border-border-strong" />

        {!aiDismissed && (
          <AITeaserBanner onTryAI={handleTryAI} onDismiss={handleDismissAI} />
        )}
      </section>

      {/* Snackbar / Toast */}
      {snackbar.open && (
        <div className="fixed inset-x-0 bottom-4 flex justify-center px-4">
          <div
            role="alert"
            className={[
              "w-full max-w-lg rounded-xl border px-4 py-3 shadow-lg",
              snackbar.severity === "error" &&
                "bg-danger-soft border-danger/30 text-danger",
              snackbar.severity === "warning" &&
                "bg-warning-soft border-warning/30 text-warning",
              snackbar.severity === "success" &&
                "bg-success-soft border-success/30 text-success",
              snackbar.severity === "info" &&
                "bg-secondary-soft border-secondary/30 text-secondary",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm">{snackbar.msg}</p>
              <button
                className="text-xs underline underline-offset-2 hover:opacity-80"
                onClick={() => setSnackbar((s) => ({ ...s, open: false }))}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
