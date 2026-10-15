import { decryptCheckoutToken } from "../_lib/token.js";
import { markLinkPaid, recordTransaction } from "../_lib/ledger.js";
import { processPayment, publicGatewayError } from "../_lib/mpgs.js";

function page(title: string, message: string, target: string) {
  return `<!DOCTYPE html><html lang="ar"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
  <body style="font-family:system-ui,sans-serif;background:#fff;color:#141414;text-align:center;padding:48px 16px">
    <h2>${title}</h2><p>${message}</p>
    <script>window.top.location.href=${JSON.stringify(target)};</script>
  </body></html>`;
}

function queryFrom(req: any) {
  const fromQuery = req.query && typeof req.query === "object" ? req.query : {};
  let fromUrl: URLSearchParams | null = null;
  try {
    const raw = String(req.url || "");
    const q = raw.includes("?") ? raw.slice(raw.indexOf("?")) : "";
    fromUrl = new URLSearchParams(q);
  } catch {
    fromUrl = null;
  }
  return (name: string) => {
    const direct = fromQuery[name];
    if (direct != null && String(direct).trim()) return String(direct).trim();
    return fromUrl?.get(name)?.trim() || "";
  };
}

function formFields(req: any) {
  const out: Record<string, string> = {};
  const body = req.body;
  if (body && typeof body === "object" && !Buffer.isBuffer(body)) {
    for (const [key, value] of Object.entries(body)) out[key] = String(value ?? "");
    return out;
  }
  if (typeof body === "string" && body.trim()) {
    const params = new URLSearchParams(body);
    params.forEach((value, key) => {
      out[key] = value;
    });
  }
  return out;
}

function checkoutReturn(token: string, message: string) {
  const q = new URLSearchParams();
  if (token) q.set("token", token);
  if (message) q.set("error", message.slice(0, 300));
  return `/epay/checkout?${q.toString()}`;
}

export default async function handler(req: any, res: any) {
  const get = queryFrom(req);
  const form = formFields(req);
  let orderId = get("orderId") || form["order.id"] || form.orderId || "";
  let sessionId = get("sessionId") || form["session.id"] || form.sessionId || "";
  let amount = get("amount") || form.amount || "";
  let authTxn = get("authTransactionId") || form.authTransactionId || "";
  let payTxn = get("payTransactionId") || form.payTransactionId || "";
  const token = get("token") || form.token || "";
  const decoded = token ? decryptCheckoutToken(token) : null;
  const customer = decoded?.data;
  if (!orderId && customer?.orderId) orderId = customer.orderId;
  if (!amount && customer?.amount) amount = customer.amount;
  const shortCode = customer?.shortCode || (orderId.startsWith("BS-") ? orderId : "");

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  if (!orderId || !sessionId || !amount || !authTxn || !payTxn) {
    const target = token
      ? checkoutReturn(token, "تعذر تأكيد رمز التحقق. الجلسة ما زالت متاحة، أعد إدخال البطاقة.")
      : "/epay?error=callback";
    res.status(200).send(page("Payment error", "Unable to confirm the bank challenge.", target));
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
      const target = `/epay/success?orderId=${encodeURIComponent(orderId)}&amount=${encodeURIComponent(amount)}&receipt=${encodeURIComponent(receipt)}&stan=${encodeURIComponent(stan)}&name=${encodeURIComponent(customer?.name || "")}&email=${encodeURIComponent(customer?.email || "")}&phone=${encodeURIComponent(customer?.phone || "")}&lang=${encodeURIComponent(customer?.lang || "ar")}&status=SUCCESS`;
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
    res.status(200).send(page("Payment declined", explanation, checkoutReturn(token, explanation)));
  } catch (err: any) {
    const message = err?.message || "Please try again.";
    res.status(200).send(page("Payment error", message, token ? checkoutReturn(token, message) : "/epay"));
  }
}
