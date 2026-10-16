import { sendJson } from "./_lib/http.js";
import { getPaymentRules } from "./_lib/settings.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return sendJson(res, 405, { success: false, error: "Method not allowed" });
  const settings = await getPaymentRules();
  return sendJson(res, 200, {
    success: true,
    settings: {
      minAmount: settings.minAmount,
      maxAmount: settings.maxAmount,
      enforceAmountLimits: settings.enforceAmountLimits,
      enableEpayPortal: settings.enableEpayPortal,
      enableCheckoutPage: settings.enableCheckoutPage,
      enableOpenPaymentPortal: settings.enableOpenPaymentPortal,
      paymentsEnabled: settings.paymentsEnabled,
      portalPinRequired: Boolean(settings.enablePortalPin !== false && settings.portalPinCode && /^\d{4}$/.test(settings.portalPinCode)),
      checkoutPinRequired: Boolean(settings.enableCheckoutPin && settings.checkoutPinCode && /^\d{4}$/.test(settings.checkoutPinCode)),
    },
    hcaptchaSiteKey: process.env.VITE_HCAPTCHA_SITE_KEY || process.env.HCAPTCHA_SITE_KEY || "70fa0926-a8de-4128-a366-7ab806446be4",
    applePay: (process.env.VITE_APPLE_PAY_ENABLED || "true") !== "false",
  });
}
