import { assertAppleHost, validateAppleMerchant } from "../_lib/applepay.js";
import { readJson, requestHost, sendJson } from "../_lib/http.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return sendJson(res, 405, { success: false, error: "Method not allowed" });
  try {
    const body = readJson(req);
    const validationURL = String(body.validationURL || "");
    const host = assertAppleHost(String(body.domain || requestHost(req)));
    const merchantSession = await validateAppleMerchant(validationURL, host);
    return sendJson(res, 200, merchantSession);
  } catch (err: any) {
    return sendJson(res, 400, { success: false, error: err?.message || "Apple Pay validation failed." });
  }
}
