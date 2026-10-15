import { config } from "./config.js";

function authHeader() {
  return `Basic ${Buffer.from(`merchant.${config.merchantId}:${config.apiPassword}`).toString("base64")}`;
}

function gatewayReady() {
  return Boolean(config.merchantId && config.apiPassword);
}

async function gateway(method: string, path: string, body?: unknown) {
  if (!gatewayReady()) {
    return { result: "ERROR", error: { explanation: "Mastercard gateway credentials are not configured." } };
  }
  const res = await fetch(`${config.gatewayUrl}${path}`, {
    method,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json; charset=utf-8",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { result: "ERROR", error: { explanation: text.slice(0, 180) || `Gateway HTTP ${res.status}` } };
  }
}

export function sanitizeCard(num: string) {
  return (num || "").replace(/[\s-]/g, "");
}

export function txnId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export async function createCardSession(params: {
  orderId: string;
  amount: string;
  customerName?: string;
  email?: string;
  phone?: string;
  description?: string;
  card: { number: string; nameOnCard?: string; expiryMonth: string; expiryYear: string; securityCode: string };
}) {
  const created = await gateway("POST", `/api/rest/version/${config.apiVersion}/merchant/${config.merchantId}/session`, {
    session: { authenticationLimit: 25 },
  });
  if (created.result !== "SUCCESS" || !created.session?.id) {
    return { success: false, error: created?.error?.explanation || "Failed to initialize payment session with gateway", details: created };
  }
  const sessionId = created.session.id;
  const parts = (params.customerName || "Customer").trim().split(/\s+/);
  const year = params.card.expiryYear.trim().slice(-2);
  const month = params.card.expiryMonth.trim().padStart(2, "0");
  const updated = await gateway(
    "PUT",
    `/api/rest/version/${config.apiVersion}/merchant/${config.merchantId}/session/${sessionId}`,
    {
      order: {
        id: params.orderId,
        amount: params.amount,
        currency: config.currency,
        description: params.description || "Al Ramz Al Dhahabi - luxury watches and jewelry",
      },
      customer: {
        firstName: parts[0] || "Customer",
        lastName: parts.slice(1).join(" ") || ".",
        email: params.email || "checkout@alramzgold.com",
        ...(params.phone ? { phone: params.phone } : {}),
      },
      sourceOfFunds: {
        provided: {
          card: {
            number: sanitizeCard(params.card.number),
            nameOnCard: params.card.nameOnCard || params.customerName || "CARDHOLDER",
            expiry: { month, year },
            securityCode: params.card.securityCode.trim(),
          },
        },
      },
    }
  );
  if (updated.result === "ERROR") {
    return { success: false, error: updated?.error?.explanation || "Failed to configure payment session", details: updated };
  }
  return { success: true, sessionId, orderId: params.orderId, amount: params.amount };
}

export async function initiateAuthentication(orderId: string, sessionId: string, authTxn: string) {
  return gateway("PUT", `/api/rest/version/${config.apiVersion}/merchant/${config.merchantId}/order/${orderId}/transaction/${authTxn}`, {
    apiOperation: "INITIATE_AUTHENTICATION",
    authentication: { channel: "PAYER_BROWSER", purpose: "PAYMENT_TRANSACTION" },
    order: { currency: config.currency },
    session: { id: sessionId },
  });
}

export async function authenticatePayer(opts: {
  orderId: string;
  sessionId: string;
  amount: string;
  authTxn: string;
  payTxn: string;
  checkoutToken?: string;
  device?: any;
}) {
  const callbackUrl = new URL(`${config.appUrl}/api/payment/callback`);
  callbackUrl.searchParams.set("orderId", opts.orderId);
  callbackUrl.searchParams.set("sessionId", opts.sessionId);
  callbackUrl.searchParams.set("amount", opts.amount);
  callbackUrl.searchParams.set("authTransactionId", opts.authTxn);
  callbackUrl.searchParams.set("payTransactionId", opts.payTxn);
  if (opts.checkoutToken) callbackUrl.searchParams.set("token", opts.checkoutToken);
  const callback = callbackUrl.toString();
  return gateway("PUT", `/api/rest/version/${config.apiVersion}/merchant/${config.merchantId}/order/${opts.orderId}/transaction/${opts.authTxn}`, {
    apiOperation: "AUTHENTICATE_PAYER",
    authentication: { redirectResponseUrl: callback },
    order: { amount: opts.amount, currency: config.currency },
    session: { id: opts.sessionId },
    device: {
      browser: "MOZILLA",
      browserDetails: opts.device || {
        "3DSecureChallengeWindowSize": "FULL_SCREEN",
        acceptHeaders: "*/*",
        colorDepth: 24,
        javaEnabled: false,
        language: "ar",
        screenHeight: 844,
        screenWidth: 390,
        timeZone: 180,
      },
    },
  });
}

export async function processPayment(orderId: string, sessionId: string, amount: string, authTxn: string, payTxn: string) {
  return gateway("PUT", `/api/rest/version/${config.apiVersion}/merchant/${config.merchantId}/order/${orderId}/transaction/${payTxn}`, {
    apiOperation: "PAY",
    order: { amount, currency: config.currency },
    session: { id: sessionId },
    sourceOfFunds: { type: "CARD" },
    authentication: { transactionId: authTxn },
  });
}

export async function payWithApple(params: {
  orderId: string;
  amount: string;
  paymentToken: any;
  customerName?: string;
  email?: string;
  phone?: string;
}) {
  let tokenString = "";
  const token = params.paymentToken;
  if (typeof token === "string") {
    try {
      const parsed = JSON.parse(token);
      tokenString = parsed.paymentData ? (typeof parsed.paymentData === "string" ? parsed.paymentData : JSON.stringify(parsed.paymentData)) : JSON.stringify(parsed);
    } catch {
      tokenString = token;
    }
  } else if (token?.paymentData) {
    tokenString = typeof token.paymentData === "string" ? token.paymentData : JSON.stringify(token.paymentData);
  } else {
    tokenString = JSON.stringify(token || {});
  }
  const parts = (params.customerName || "Customer").trim().split(/\s+/);
  const gatewayOrderId = `${params.orderId}-${Date.now().toString().slice(-4)}`;
  const data = await gateway("PUT", `/api/rest/version/${config.apiVersion}/merchant/${config.merchantId}/order/${gatewayOrderId}/transaction/1`, {
    apiOperation: "PAY",
    order: {
      amount: params.amount,
      currency: config.currency,
      description: "Al Ramz Al Dhahabi - Apple Pay",
      walletProvider: "APPLE_PAY",
    },
    customer: {
      firstName: parts[0] || "Customer",
      lastName: parts.slice(1).join(" ") || ".",
      email: params.email || "checkout@alramzgold.com",
      ...(params.phone ? { phone: params.phone } : {}),
    },
    sourceOfFunds: {
      type: "CARD",
      provided: { card: { devicePayment: { paymentToken: tokenString } } },
    },
  });
  return { ...data, gatewayOrderId };
}

export function publicGatewayError(data: any) {
  return data?.error?.explanation || data?.response?.acquirerMessage || "Unable to process payment. Please verify the card and try again.";
}
