import { decryptCheckoutToken } from "../_lib/token";
import { markLinkPaid, recordTransaction } from "../_lib/ledger";
import { processPayment, publicGatewayError } from "../_lib/mpgs";

function page(title: string, message: string, target: string) {
  return `<!DOCTYPE html><html lang="ar"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
  <body style="font-family:system-ui,sans-serif;background:#fbfbf8;color:#064e3b;text-align:center;padding:48px 16px">
    <h2>${title}</h2><p>${message}</p>
    <script>window.top.location.href=${JSON.stringify(target)};</script>
  </body></html>`;
}

export default async function handler(req: any, res: any) {
  const q = req.query || {};
  let orderId = String(q.orderId || "");
  let sessionId = String(q.sessionId || "");
  let amount = String(q.amount || "");
  let authTxn = String(q.authTransactionId || "");
  let payTxn = String(q.payTransactionId || "");
  const token = String(q.token || "");
  const decoded = token ? decryptCheckoutToken(token) : null;
  const shortCode = decoded?.data?.shortCode || (orderId.startsWith("BS-") ? orderId : "");
  const customer = decoded?.data;

  if (req.body && typeof req.body === "object") {
    if (!orderId && req.body["order.id"]) orderId = String(req.body["order.id"]);
    if (!sessionId && req.body["session.id"]) sessionId = String(req.body["session.id"]);
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  if (!orderId || !sessionId || !amount || !authTxn || !payTxn) {
    res.status(400).send(page("Payment error", "Unable to confirm the bank challenge.", "/epay?error=callback"));
    return;
  }

  try {
    const payRes = await processPayment(orderId, sessionId, amount, authTxn, payTxn);
    if (payRes?.result === "SUCCESS") {
      const receipt = payRes.transaction?.receipt || "";
      const stan = payRes.transaction?.stan || "";
      if (shortCode) await markLinkPaid(shortCode, Number(amount), receipt, "CARD_3DS");
      await recordTransaction({
        orderId,
        shortCode: shortCode || undefined,
        amount,
        status: "SUCCESS",
        apiOperation: "PAY",
        paymentMethod: "CARD_3DS",
        cardBrand: payRes.sourceOfFunds?.provided?.card?.brand,
        cardLast4: payRes.sourceOfFunds?.provided?.card?.number ? String(payRes.sourceOfFunds.provided.card.number).slice(-4) : undefined,
        cardholderName: payRes.sourceOfFunds?.provided?.card?.nameOnCard || customer?.name,
        customerName: customer?.name,
        customerEmail: customer?.email,
        customerPhone: customer?.phone,
        authCode: payRes.authorizationResponse?.responseCode || payRes.transaction?.authorizationCode,
        receiptNumber: receipt,
        acquirerResponseCode: payRes.response?.acquirerCode,
        gatewayCode: payRes.response?.gatewayCode,
        stan,
        rrn: payRes.transaction?.rrn || "",
        rawResponse: payRes,
      });
      const target = `/epay/success?orderId=${encodeURIComponent(orderId)}&amount=${encodeURIComponent(amount)}&receipt=${encodeURIComponent(receipt)}&stan=${encodeURIComponent(stan)}&name=${encodeURIComponent(customer?.name || "")}`;
      res.status(200).send(page("Payment confirmed", "Returning to the receipt…", target));
      return;
    }
    const explanation = publicGatewayError(payRes);
    await recordTransaction({
      orderId,
      shortCode: shortCode || undefined,
      amount,
      status: "FAILED",
      paymentMethod: "CARD_3DS",
      customerName: customer?.name,
      errorMessage: explanation,
      gatewayCode: payRes?.response?.gatewayCode,
      rawResponse: payRes,
    });
    res.status(200).send(page("Payment declined", explanation, `/epay/checkout?error=${encodeURIComponent(explanation)}`));
  } catch (err: any) {
    res.status(500).send(page("Payment error", err?.message || "Please try again.", "/epay"));
  }
}
