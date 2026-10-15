import { sendJson } from "./_lib/http.js";
import { getLink } from "./_lib/ledger.js";
import { getPaymentRules } from "./_lib/settings.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return sendJson(res, 405, { success: false, error: "Method not allowed" });
  const rules = await getPaymentRules();
  if (!rules.enableOpenPaymentPortal) {
    return sendJson(res, 403, { success: false, error: "Invoices are currently unavailable." });
  }
  const code = String(req.query?.short || req.query?.code || "");
  const link = await getLink(code);
  if (!link) return sendJson(res, 404, { success: false, error: "Invoice not found." });
  return sendJson(res, 200, { success: true, link });
}
