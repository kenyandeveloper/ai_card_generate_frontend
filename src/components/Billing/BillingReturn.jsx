import { useEffect, useState } from "react";
import { verifyPayment, getBillingStatus } from "../../utils/billingApi";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const withTimeout = (p, ms, label = "op") =>
  Promise.race([
    p,
    new Promise((_, rej) =>
      setTimeout(() => rej(new Error(`${label} timeout`)), ms)
    ),
  ]);

export default function BillingReturn() {
  const [msg, setMsg] = useState("Verifying payment…");
  const [done, setDone] = useState(false);
  const [verificationStep, setVerificationStep] = useState("initializing");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tracking_id = params.get("tracking_id"); // sometimes present
    const checkout_id_param =
      params.get("checkout_id") || params.get("api_ref") || params.get("id");
    const invoice_id = params.get("invoice_id") || params.get("invoiceId");

    // Fallback: use the checkout_id we stored at checkout time
    let stored_checkout_id = "";
    try {
      stored_checkout_id =
        localStorage.getItem("flashlearn:last_checkout_id") || "";
    } catch {
      /* ignore */
    }

    const final_checkout_id = checkout_id_param || stored_checkout_id;

    console.log(
      "[BillingReturn] URL params:",
      Object.fromEntries(params.entries())
    );
    console.log("[BillingReturn] tracking_id:", tracking_id);
    console.log("[BillingReturn] checkout_id:", final_checkout_id);
    console.log("[BillingReturn] invoice_id:", invoice_id);

    // Replace the URL in-place to remove sensitive query params
    try {
      const cleanUrl = `${window.location.origin}${window.location.pathname}`;
      window.history.replaceState({}, document.title, cleanUrl);
    } catch {
      /* ignore */
    }

    let cancelled = false;

    async function run() {
      try {
        // Step 1: Ask server to verify with whatever identifiers we have
        setVerificationStep("verifying");
        setMsg("Verifying payment with IntaSend...");

        const verifyPayload = {};
        if (invoice_id) verifyPayload.invoice_id = invoice_id;
        if (final_checkout_id) verifyPayload.checkout_id = final_checkout_id;
        if (tracking_id) verifyPayload.tracking_id = tracking_id; // benign extra

        if (Object.keys(verifyPayload).length > 0) {
          try {
            console.log(
              "[BillingReturn] Calling verifyPayment with:",
              verifyPayload
            );
            const verifyResult = await withTimeout(
              verifyPayment(verifyPayload),
              15000,
              "verifyPayment"
            );
            console.log("[BillingReturn] verifyPayment result:", verifyResult);
            await sleep(800); // brief settle
          } catch (e) {
            console.warn("verifyPayment failed or timed out:", e?.message || e);
            setMsg("Payment verification in progress, checking status...");
          }
        }

        // Step 2: Poll /billing/status with progressive delay
        setVerificationStep("polling");
        setMsg("Checking subscription status...");

        let active = false;
        let attempts = 0;
        const maxAttempts = 20;

        while (attempts < maxAttempts && !cancelled) {
          try {
            const delay = Math.min(1000 + attempts * 500, 5000);
            console.log(
              `[BillingReturn] Status check attempt ${
                attempts + 1
              }/${maxAttempts}`
            );

            const status = await withTimeout(
              getBillingStatus(),
              8000,
              "getBillingStatus"
            );
            console.log("[BillingReturn] status:", status);

            if (
              status?.subscription_status === "active" ||
              status?.debug?.active_server_view === true ||
              Boolean(status?.current_period_end)
            ) {
              active = true;
              console.log("[BillingReturn] Subscription confirmed active!");
              break;
            }

            if (attempts < 5)
              setMsg("Verifying payment... This may take a moment.");
            else if (attempts < 10)
              setMsg("Still verifying payment with IntaSend...");
            else setMsg("Payment processing is taking longer than usual...");

            attempts++;
            if (attempts < maxAttempts) await sleep(delay);
          } catch (e) {
            console.warn(
              `Status poll error (attempt ${attempts + 1}):`,
              e?.message || e
            );
            attempts++;
            if (attempts < maxAttempts) await sleep(2000);
          }
        }

        setVerificationStep("complete");
        if (active) {
          setMsg("✅ Payment verified! Your subscription is now active.");
          console.log("[BillingReturn] Success - subscription is active");
        } else {
          setMsg(
            "⏳ Payment received but verification is still in progress. You can check your billing status or try generating flashcards - it should work soon!"
          );
          console.log(
            "[BillingReturn] Payment may be pending server-side processing"
          );
        }
      } catch (error) {
        console.error("[BillingReturn] Verification error:", error);
        setVerificationStep("error");
        setMsg(
          "❌ Could not verify payment automatically. Please check your billing status or contact support if the issue persists."
        );
      } finally {
        // Clean up stored checkout ID
        try {
          localStorage.removeItem("flashlearn:last_checkout_id");
        } catch {
          /* ignore */
        }

        if (!cancelled) {
          setDone(true);
          setTimeout(() => {
            if (!cancelled) window.location.href = "/mydecks";
          }, 4000);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <h2>Payment Verification</h2>
      <p>{msg}</p>
      {!done && (
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              display: "inline-block",
              width: 20,
              height: 20,
              border: "3px solid #f3f3f3",
              borderTop: "3px solid #3498db",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <span style={{ marginLeft: 8 }}>Please wait...</span>
        </div>
      )}

      {verificationStep === "error" && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: "#fff3cd",
            borderRadius: 4,
          }}
        >
          <p>
            <strong>What to do next:</strong>
          </p>
          <ul>
            <li>Try generating flashcards - your payment may have completed</li>
            <li>Check your billing status in the app</li>
            <li>Contact support if problems persist</li>
          </ul>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
