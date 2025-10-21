// src/utils/billingApi.js
import { billingApi as billingClient } from "./apiClient";

/**
 * Start hosted checkout.
 * Server enforces amount/currency (KES 100).
 * Optional payload: { email, phone_number, redirect_url }
 * - If redirect_url not provided, we default to `${origin}/billing/return`
 */
export async function createCheckout(payload = {}) {
  const defaultRedirect = `${window.location.origin.replace(/\/+$/, "")}/billing/return`;
  const rawPlan =
    payload.plan_type || payload.plan || payload.planType || "monthly";
  const planType = String(rawPlan).trim().toLowerCase();
  const validPlan = ["daily", "monthly"].includes(planType) ? planType : "monthly";
  const body = {
    ...Object.fromEntries(
      Object.entries(payload || {}).filter(
        ([key]) =>
          key !== "plan" && key !== "planType" && key !== "plan_type"
      )
    ),
    redirect_url: payload.redirect_url || defaultRedirect,
    plan_type: validPlan,
  };

  const data = await billingClient.createCheckout(body);

  try {
    if (data?.api_ref) {
      localStorage.setItem("flashlearn:last_checkout_id", data.api_ref);
    }
  } catch {
    /* ignore */
  }

  return data;
}

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

  return billingClient.verifyPayment(payload);
}

export async function getBillingStatus() {
  const data = await billingClient.getStatus();
  return data;
}
