import { readJson, sendJson } from "../_lib/http.js";
import { getPaymentRules } from "../_lib/settings.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { success: false, error: "Method not allowed" });
  }

  try {
    const body = readJson(req);
    const pin = String(body?.pin ?? "").trim();

    if (!pin || !/^\d{4}$/.test(pin)) {
      return sendJson(res, 400, { success: false, error: "يرجى إدخال رمز PIN مكون من 4 أرقام" });
    }

    const type = body?.type === "checkout" ? "checkout" : body?.type === "epay" ? "epay" : "portal";
    const rules = await getPaymentRules();

    let expected = "";
    if (type === "checkout") {
      if (!rules.enableCheckoutPin || !rules.checkoutPinCode || !/^\d{4}$/.test(rules.checkoutPinCode)) {
        return sendJson(res, 200, { success: true, message: "No checkout PIN required" });
      }
      expected = rules.checkoutPinCode;
    } else if (type === "epay") {
      if (!rules.enableEpayPortalPin || !rules.epayPortalPinCode || !/^\d{4}$/.test(rules.epayPortalPinCode)) {
        return sendJson(res, 200, { success: true, message: "No epay PIN required" });
      }
      expected = rules.epayPortalPinCode;
    } else {
      if (rules.enablePortalPin === false || !rules.portalPinCode || !/^\d{4}$/.test(rules.portalPinCode)) {
        return sendJson(res, 200, { success: true, message: "No portal PIN required" });
      }
      expected = rules.portalPinCode;
    }

    // Constant-time comparison to prevent timing attacks
    let match = pin.length === expected.length;
    for (let i = 0; i < Math.max(pin.length, expected.length); i++) {
      if ((pin.charCodeAt(i) || 0) !== (expected.charCodeAt(i) || 0)) {
        match = false;
      }
    }

    if (!match) {
      return sendJson(res, 403, { success: false, error: "رمز PIN غير صحيح" });
    }

    return sendJson(res, 200, { success: true });
  } catch (err: any) {
    return sendJson(res, 500, { success: false, error: err?.message || "Internal error" });
  }
}
