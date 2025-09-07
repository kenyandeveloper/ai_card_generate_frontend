// src/utils/billingApi.js
import api from "./apiClient";

/**
 * Start hosted checkout.
 * Server enforces amount/currency (KES 100).
 * Optional payload: { email, phone_number, redirect_url }
 * - If redirect_url not provided, we default to `${origin}/billing/return`
 */
export async function createCheckout(payload = {}) {
  const defaultRedirect = `${window.location.origin.replace(
    /\/+$/,
    ""
  )}/billing/return`;
  const body = {
    ...payload,
    redirect_url: payload.redirect_url || defaultRedirect,
  };

  const { data } = await api.post("/billing/checkout", body);
  // => { checkout_url, api_ref: <checkout_id>, amount, currency, plan }

  // Persist checkout_id for the return page as a fallback when invoice_id is absent
  try {
    if (data?.api_ref) {
      localStorage.setItem("flashlearn:last_checkout_id", data.api_ref);
    }
  } catch {
    /* ignore */
  }

  return data;
}

/**
 * After IntaSend redirects back to your app, call this to trigger server-side verification.
 *
 * Accepts either:
 *   - verifyPayment("INV-123")                          // invoice_id string
 *   - verifyPayment({ invoice_id: "INV-123" })          // explicit
 *   - verifyPayment({ checkout_id: "CHK-abc" })         // fallback if no invoice_id in redirect
 *   - verifyPayment({ api_ref: "CHK-abc" })             // alias for checkout_id
 */
export async function verifyPayment(input) {
  let payload;
  if (typeof input === "string") {
    payload = { invoice_id: input };
  } else if (input && typeof input === "object") {
    const invoice_id =
      input.invoice_id || input.invoiceId || input.invoice || input.id || "";
    const checkout_id =
      input.checkout_id ||
      input.checkoutId ||
      input.api_ref ||
      input.apiRef ||
      "";
    payload = {};
    if (invoice_id) payload.invoice_id = invoice_id;
    if (checkout_id) payload.checkout_id = checkout_id;
  } else {
    payload = {};
  }

  const { data } = await api.post("/billing/verify", payload);
  // => { status: "activated" | "pending" | "failed", ... }
  return data;
}

/**
 * Get current subscription + monthly usage snapshot.
 * Useful to show free prompts remaining and whether user is active.
 */
export async function getBillingStatus() {
  const { data } = await api.get("/billing/status");
  /* =>
    {
      subscription_status: "active" | "inactive",
      plan: "monthly" | null,
      current_period_end: "2025-10-01T00:00:00Z" | null,
      month_key: "YYYY-MM",
      month_free_limit: 5,
      month_used: number,
      month_remaining: number,
      debug: {...}
    }
  */
  return data;
}
