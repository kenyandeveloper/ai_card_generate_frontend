// src/components/Billing/BillingReturn.jsx
import { useEffect, useState } from "react";
import { Loader, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { verifyPayment, getBillingStatus } from "../../utils/billingApi";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const withTimeout = (p, ms, label = "op") =>
  Promise.race([
    p,
    new Promise((_, rej) =>
      setTimeout(() => rej(new Error(`${label} timeout`)), ms)
    ),
  ]);

const DEBUG = false; // Toggle for debug logging

function log(...args) {
  if (DEBUG) console.log("[BillingReturn]", ...args);
}

function isSubscriptionActive(status) {
  return (
    status?.subscription_status === "active" ||
    status?.debug?.active_server_view === true ||
    Boolean(status?.current_period_end) ||
    (status?.debug?.reconcile_attempted === true &&
      status?.subscription_status !== "inactive")
  );
}

export default function BillingReturn() {
  const [msg, setMsg] = useState("Verifying payment…");
  const [done, setDone] = useState(false);
  const [verificationStep, setVerificationStep] = useState("initializing");
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout_id_param =
      params.get("checkout_id") || params.get("api_ref") || params.get("id");
    const invoice_id =
      params.get("invoice_id") ||
      params.get("invoiceId") ||
      params.get("invoice") ||
      params.get("invoice_no") ||
      params.get("invoiceNo");

    let stored_checkout_id = "";
    try {
      stored_checkout_id =
        localStorage.getItem("flashlearn:last_checkout_id") || "";
    } catch (err) {
      log("Failed to read localStorage:", err);
    }

    const final_checkout_id = checkout_id_param || stored_checkout_id;

    log("URL params:", Object.fromEntries(params.entries()));
    log("checkout_id:", final_checkout_id);
    log("invoice_id:", invoice_id);

    try {
      const cleanUrl = `${window.location.origin}${window.location.pathname}`;
      window.history.replaceState({}, document.title, cleanUrl);
    } catch (err) {
      log("Failed to clean URL:", err);
    }

    let cancelled = false;

    let successHandled = false;
    let pendingHandled = false;

    const finalizeSuccess = (message = "Payment verified! Your subscription is now active.") => {
      if (successHandled || cancelled) return;
      successHandled = true;
      setVerificationStep("complete");
      setMsg(message);
      setDone(true);
      setTimeout(() => {
        if (cancelled) return;
        setRedirecting(true);
        setTimeout(() => {
          if (!cancelled) window.location.href = "/mydecks";
        }, 1000);
      }, 2000);
      try {
        localStorage.removeItem("flashlearn:last_checkout_id");
      } catch (err) {
        log("Failed to remove checkout key:", err);
      }
    };

    const finalizePending = (
      message = "Payment received but verification is still in progress. You can check your billing status or try generating flashcards."
    ) => {
      if (successHandled || pendingHandled || cancelled) return;
      pendingHandled = true;
      setVerificationStep("complete");
      setMsg(message);
      setDone(true);
    };

    async function run() {
      try {
        setVerificationStep("verifying");
        setMsg("Verifying payment with IntaSend...");

        const verifyPayload = {};
        if (invoice_id) verifyPayload.invoice_id = invoice_id;
        if (final_checkout_id) verifyPayload.checkout_id = final_checkout_id;

        if (Object.keys(verifyPayload).length > 0) {
          try {
            log("Calling verifyPayment with:", verifyPayload);
            const verifyResult = await withTimeout(
              verifyPayment(verifyPayload),
              15000,
              "verifyPayment"
            );
            log("verifyPayment result:", verifyResult);

            if (verifyResult?.status === "activated") {
              try {
                const status = await withTimeout(
                  getBillingStatus(),
                  8000,
                  "getBillingStatus"
                );
                if (isSubscriptionActive(status)) {
                  finalizeSuccess();
                  return;
                }
              } catch (err) {
                log("Post-verify status check failed:", err?.message);
              }
              finalizePending(
                "Payment verified! Activation is processing on our servers. Check your billing status shortly."
              );
              return;
            }

            await sleep(800);
          } catch (err) {
            log("verifyPayment failed or timed out:", err?.message);
            setMsg("Payment verification in progress, checking status...");
          }
        }

        setVerificationStep("polling");
        setMsg("Checking subscription status...");

        let attempts = 0;
        const maxAttempts = 6;

        while (attempts < maxAttempts && !cancelled) {
          try {
            const delay = Math.min(1000 + attempts * 800, 4000);
            log(`Status check attempt ${attempts + 1}/${maxAttempts}`);

            const status = await withTimeout(
              getBillingStatus(),
              8000,
              "getBillingStatus"
            );
            log("status:", status);

            if (isSubscriptionActive(status)) {
              log("Subscription confirmed active!");
              finalizeSuccess();
              break;
            }

            attempts++;
            if (attempts >= 3 && !pendingHandled) {
              finalizePending(
                "Payment received! Activation is processing. Check your billing status or try generating flashcards."
              );
              break;
            }

            if (attempts < maxAttempts) await sleep(delay);
          } catch (err) {
            log(`Status poll error (attempt ${attempts + 1}):`, err?.message);
            attempts++;
            if (attempts < maxAttempts) await sleep(2000);
          }
        }

        if (!successHandled && !pendingHandled) {
          finalizePending();
          log("Payment may be pending server-side processing");
        }
      } catch (error) {
        log("Verification error:", error);
        setVerificationStep("error");
        setMsg(
          "Could not verify payment automatically. Please check your billing status or contact support if the issue persists."
        );
        setDone(true);
      } finally {
        try {
          if (!successHandled) {
            localStorage.removeItem("flashlearn:last_checkout_id");
          }
        } catch (err) {
          log("Failed to remove checkout key:", err);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const renderIcon = () => {
    if (verificationStep === "complete") {
      return <CheckCircle className="w-12 h-12 text-success" />;
    }
    if (verificationStep === "error") {
      return <AlertCircle className="w-12 h-12 text-danger" />;
    }
    return <Loader className="w-12 h-12 text-primary animate-spin" />;
  };

  const getStatusColor = () => {
    if (verificationStep === "complete") return "text-success";
    if (verificationStep === "error") return "text-danger";
    return "text-primary";
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <article className="max-w-2xl w-full bg-surface-elevated rounded-xl border border-border-muted p-8 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          {renderIcon()}

          <h1 className="text-2xl font-bold text-text-primary">
            Payment Verification
          </h1>

          <p
            className={`text-center text-lg ${getStatusColor()}`}
            aria-live="polite"
            aria-atomic="true"
          >
            {msg}
          </p>
        </div>

        {!done && verificationStep !== "error" && (
          <div className="flex flex-col items-center gap-3" role="status">
            <div className="flex items-center gap-3 text-text-muted">
              <Loader className="w-5 h-5 animate-spin" aria-hidden="true" />
              <span>Please wait...</span>
            </div>
          </div>
        )}

        {verificationStep === "error" && (
          <div className="bg-warning-soft border border-warning/30 rounded-lg p-6 space-y-4">
            <p className="font-semibold text-warning">What to do next:</p>
            <ul className="space-y-2 text-sm text-warning list-disc list-inside">
              <li>
                Try generating flashcards - your payment may have completed
              </li>
              <li>Check your billing status in the app</li>
              <li>Contact support if problems persist</li>
            </ul>
          </div>
        )}

        {redirecting && (
          <div
            className="flex items-center justify-center gap-2 text-text-muted"
            aria-live="polite"
          >
            <span>Redirecting to dashboard</span>
            <ArrowRight className="w-5 h-5 animate-pulse" />
          </div>
        )}

        {done && (
          <div className="flex justify-center">
            <a
              href="/mydecks"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-emphasis text-primary-foreground font-medium rounded-lg transition-colors duration-200"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        )}
      </article>
    </main>
  );
}
