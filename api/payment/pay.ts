import { clientIp, readJson, sendJson } from "../_lib/http";
import { decryptCheckoutToken } from "../_lib/token";
import { getPaymentRules } from "../_lib/settings";
import { assertRateLimit, markLinkPaid, recordTransaction } from "../_lib/ledger";
import {
  authenticatePayer,
  createCardSession,
  initiateAuthentication,
  processPayment,
  publicGatewayError,
  sanitizeCard,
  txnId,
} from "../_lib/mpgs";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return sendJson(res, 405, { success: false, error: "Method not allowed" });
  const ip = clientIp(req);
  try {
    const rules = await getPaymentRules();
    if (!rules.paymentsEnabled || !rules.enableCheckoutPage) {
      return sendJson(res, 403, { success: false, error: "Card checkout is currently unavailable." });
    }
    const limit = await assertRateLimit(ip);
    if (!limit.allowed) return sendJson(res, 429, { success: false, error: limit.message, blocked: true });

    const body = readJson(req);
    const decoded = decryptCheckoutToken(String(body.token || ""));
    if (!decoded.valid || !decoded.data) return sendJson(res, 400, { success: false, error: decoded.error });
    const order = decoded.data;
    const card = body.card || {};
    const clean = sanitizeCard(card.number || "");
    if (clean.length < 15 || clean.length > 19) return sendJson(res, 400, { success: false, error: "Invalid card number." });
    const month = parseInt(card.expiryMonth, 10);
    if (!month || month < 1 || month > 12) return sendJson(res, 400, { success: false, error: "Invalid expiry month." });
    const year = parseInt(String(card.expiryYear || "").slice(-2), 10);
    const nowYear = new Date().getFullYear() % 100;
    if (!year || year < nowYear) return sendJson(res, 400, { success: false, error: "Card has expired." });
    if (String(card.securityCode || "").trim().length < 3) return sendJson(res, 400, { success: false, error: "Invalid security code." });

    const session = await createCardSession({
      orderId: order.orderId,
      amount: order.amount,
      customerName: order.name,
      email: order.email,
      phone: order.phone,
      description: order.description,
      card: {
        number: clean,
        nameOnCard: card.nameOnCard || order.name,
        expiryMonth: String(card.expiryMonth),
        expiryYear: String(card.expiryYear),
        securityCode: String(card.securityCode),
      },
    });
    if (!session.success || !session.sessionId) {
      await recordTransaction({
        orderId: order.orderId,
        shortCode: order.shortCode,
        amount: order.amount,
        status: "FAILED",
        paymentMethod: "CARD",
        customerName: order.name,
        customerEmail: order.email,
        customerPhone: order.phone,
        cardLast4: clean.slice(-4),
        errorMessage: session.error,
        rawResponse: session.details,
      });
      return sendJson(res, 400, { success: false, error: session.error || "Failed to initialize payment session with gateway." });
    }

    const authTxn = txnId();
    const payTxn = txnId();
    await initiateAuthentication(order.orderId, session.sessionId, authTxn);
    const auth = await authenticatePayer({
      orderId: order.orderId,
      sessionId: session.sessionId,
      amount: order.amount,
      authTxn,
      payTxn,
      device: body.device,
    });
    const challenge = auth?.authentication?.redirect?.html;
    if (challenge) {
      return sendJson(res, 200, {
        success: true,
        status: "3DS_CHALLENGE",
        html: challenge,
        orderId: order.orderId,
        amount: order.amount,
      });
    }
    if (auth?.result === "ERROR") {
      const explanation = publicGatewayError(auth);
      await recordTransaction({
        orderId: order.orderId,
        shortCode: order.shortCode,
        amount: order.amount,
        status: "FAILED",
        apiOperation: "AUTHENTICATE_PAYER",
        paymentMethod: "CARD",
        customerName: order.name,
        customerEmail: order.email,
        customerPhone: order.phone,
        cardLast4: clean.slice(-4),
        errorMessage: explanation,
        gatewayCode: auth?.response?.gatewayCode,
        rawResponse: auth,
      });
      return sendJson(res, 400, { success: false, error: explanation });
    }

    const payRes = await processPayment(order.orderId, session.sessionId, order.amount, authTxn, payTxn);
    if (payRes?.result !== "SUCCESS") {
      const explanation = publicGatewayError(payRes);
      await recordTransaction({
        orderId: order.orderId,
        shortCode: order.shortCode,
        amount: order.amount,
        status: "FAILED",
        paymentMethod: "CARD",
        customerName: order.name,
        customerEmail: order.email,
        customerPhone: order.phone,
        cardLast4: clean.slice(-4),
        errorMessage: explanation,
        gatewayCode: payRes?.response?.gatewayCode,
        rawResponse: payRes,
      });
      return sendJson(res, 400, { success: false, error: explanation });
    }

    const receipt = payRes.transaction?.receipt || "";
    const stan = payRes.transaction?.stan || "";
    if (order.shortCode) await markLinkPaid(order.shortCode, Number(order.amount), receipt, "CARD");
    await recordTransaction({
      orderId: order.orderId,
      shortCode: order.shortCode,
      amount: order.amount,
      status: "SUCCESS",
      paymentMethod: "CARD",
      cardBrand: payRes.sourceOfFunds?.provided?.card?.brand,
      cardLast4: clean.slice(-4),
      cardholderName: card.nameOnCard || order.name,
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
    return sendJson(res, 200, {
      success: true,
      status: "SUCCESS",
      orderId: order.orderId,
      amount: order.amount,
      receipt,
      stan,
    });
  } catch (err: any) {
    console.error("pay error", err?.message || err);
    return sendJson(res, 500, { success: false, error: "Unable to process payment. Please try again." });
  }
}
