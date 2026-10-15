import { clientIp, readJson, sendJson } from "../_lib/http.js";
import { decryptCheckoutToken } from "../_lib/token.js";
import { getPaymentRules } from "../_lib/settings.js";
import { assertRateLimit, markLinkPaid, recordTransaction } from "../_lib/ledger.js";
import { payWithApple, publicGatewayError } from "../_lib/mpgs.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return sendJson(res, 405, { success: false, error: "Method not allowed" });
  try {
    const rules = await getPaymentRules();
    if (!rules.paymentsEnabled || !rules.enableCheckoutPage) {
      return sendJson(res, 403, { success: false, error: "Apple Pay is currently unavailable." });
    }
    const limit = await assertRateLimit(clientIp(req));
    if (!limit.allowed) return sendJson(res, 429, { success: false, error: limit.message });
    const body = readJson(req);
    const decoded = decryptCheckoutToken(String(body.token || ""));
    if (!decoded.valid || !decoded.data) return sendJson(res, 400, { success: false, error: decoded.error });
    const order = decoded.data;
    if (!body.paymentToken) return sendJson(res, 400, { success: false, error: "Missing Apple Pay token." });
    const payRes = await payWithApple({
      orderId: order.orderId,
      amount: order.amount,
      paymentToken: body.paymentToken,
      customerName: order.name,
      email: order.email,
      phone: order.phone,
    });
    if (payRes?.result !== "SUCCESS") {
      const explanation = publicGatewayError(payRes);
      await recordTransaction({
        orderId: order.orderId,
        shortCode: order.shortCode,
        amount: order.amount,
        status: "FAILED",
        paymentMethod: "APPLE_PAY",
        customerName: order.name,
        customerEmail: order.email,
        customerPhone: order.phone,
        errorMessage: explanation,
        gatewayCode: payRes?.response?.gatewayCode,
        rawResponse: payRes,
      });
      return sendJson(res, 400, { success: false, error: explanation });
    }
    const receipt = payRes.transaction?.receipt || "";
    const stan = payRes.transaction?.stan || "";
    if (order.shortCode) await markLinkPaid(order.shortCode, Number(order.amount), receipt, "APPLE_PAY");
    await recordTransaction({
      orderId: payRes.gatewayOrderId || order.orderId,
      shortCode: order.shortCode,
      amount: order.amount,
      status: "SUCCESS",
      paymentMethod: "APPLE_PAY",
      cardBrand: "APPLE_PAY",
      customerName: order.name,
      customerEmail: order.email,
      customerPhone: order.phone,
      authCode: payRes.authorizationResponse?.responseCode || payRes.transaction?.authorizationCode,
      receiptNumber: receipt,
      acquirerResponseCode: payRes.response?.acquirerCode,
      gatewayCode: payRes.response?.gatewayCode,
      stan,
      rrn: payRes.transaction?.rrn || "",
      rawResponse: payRes,
    });
    return sendJson(res, 200, { success: true, orderId: order.orderId, amount: order.amount, receipt, stan });
  } catch (err: any) {
    console.error("apple pay error", err?.message || err);
    return sendJson(res, 500, { success: false, error: "Apple Pay could not be completed." });
  }
}
