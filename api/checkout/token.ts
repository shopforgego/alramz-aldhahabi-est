import { clientIp, readJson, sendJson } from "../_lib/http";
import { verifyHcaptcha } from "../_lib/hcaptcha";
import { getPaymentRules } from "../_lib/settings";
import { encryptCheckoutToken, decryptCheckoutToken } from "../_lib/token";
import { getLink } from "../_lib/ledger";

export default async function handler(req: any, res: any) {
  if (req.method === "GET") {
    const token = String(req.query?.token || "");
    const decoded = decryptCheckoutToken(token);
    if (!decoded.valid || !decoded.data) return sendJson(res, 400, { success: false, error: decoded.error });
    const rules = await getPaymentRules();
    if (!rules.paymentsEnabled || !rules.enableCheckoutPage) {
      return sendJson(res, 403, { success: false, error: "Checkout is currently unavailable." });
    }
    return sendJson(res, 200, { success: true, order: decoded.data });
  }

  if (req.method !== "POST") return sendJson(res, 405, { success: false, error: "Method not allowed" });

  const body = readJson(req);
  const rules = await getPaymentRules();
  if (!rules.paymentsEnabled || !rules.enableEpayPortal) {
    return sendJson(res, 403, { success: false, error: "The payment portal is currently unavailable." });
  }

  const captcha = await verifyHcaptcha(body.hcaptchaToken, clientIp(req));
  if (!captcha.success) return sendJson(res, 403, { success: false, error: captcha.error });

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();
  const lang = body.lang === "ar" ? "ar" : "en";
  if (name.length < 3) return sendJson(res, 400, { success: false, error: "Please provide a valid customer name." });
  if (!/^\S+@\S+\.\S+$/.test(email)) return sendJson(res, 400, { success: false, error: "Please enter a valid email address." });
  if (phone.length < 8) return sendJson(res, 400, { success: false, error: "Please enter a valid mobile number." });

  let amount = Number(body.amount);
  let orderId = String(body.orderId || "").trim();
  let shortCode = "";
  let description = String(body.description || "Al Ramz Al Dhahabi payment");

  if (body.shortCode) {
    const link = await getLink(String(body.shortCode));
    if (!link) return sendJson(res, 404, { success: false, error: "Payment link not found." });
    if (link.status !== "ACTIVE") return sendJson(res, 400, { success: false, error: "This invoice is no longer payable." });
    if (!rules.enableOpenPaymentPortal) return sendJson(res, 403, { success: false, error: "Closed invoices are currently unavailable." });
    amount = link.total;
    shortCode = link.shortCode;
    orderId = link.shortCode;
    description = link.title || description;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return sendJson(res, 400, { success: false, error: "Please enter a valid amount." });
  }
  if (!shortCode && rules.enforceAmountLimits && (amount < rules.minAmount || amount > rules.maxAmount)) {
    return sendJson(res, 400, { success: false, error: `Amount must be between ${rules.minAmount} and ${rules.maxAmount} SAR.` });
  }
  if (!orderId) orderId = `ARG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const token = encryptCheckoutToken({
    orderId,
    amount: amount.toFixed(2),
    name,
    email,
    phone,
    lang,
    description,
    shortCode: shortCode || undefined,
    ttlMs: shortCode ? 24 * 60 * 60 * 1000 : 30 * 60 * 1000,
  });

  const host = String(req.headers?.["x-forwarded-host"] || req.headers?.host || "www.alramzgold.com").split(",")[0].trim();
  const proto = String(req.headers?.["x-forwarded-proto"] || "https");
  const checkoutUrl = `${proto}://${host}/epay/checkout?token=${encodeURIComponent(token)}`;
  return sendJson(res, 200, { success: true, checkoutUrl, orderId, amount: amount.toFixed(2) });
}
