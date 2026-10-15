import { dbQuery } from "./db.js";
import { dispatchTransactionNotifications } from "./notify.js";
import { getPaymentRules } from "./settings.js";

export function invoiceTotal(link: { items?: any[]; vatRate?: number; paymentChargeRate?: number }) {
  const subtotal = (link.items || []).reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1),
    0
  );
  const vatRate = link.vatRate != null ? Number(link.vatRate) : 0.15;
  const chargeRate = link.paymentChargeRate != null ? Number(link.paymentChargeRate) : 0.025;
  if (subtotal <= 0) return 0;
  return Number((subtotal + subtotal * vatRate + subtotal * chargeRate).toFixed(2));
}

export function mapLink(row: any) {
  let items: any[] = [];
  try {
    items = typeof row.items === "string" ? JSON.parse(row.items) : row.items || [];
  } catch {
    items = [];
  }
  const link = {
    shortCode: row.short_code,
    title: row.title,
    customerName: row.customer_name || "",
    customerEmail: row.customer_email || "",
    customerPhone: row.customer_phone || "",
    items,
    currency: row.currency || "SAR",
    vatRate: Number(row.vat_rate ?? 0.15),
    paymentChargeRate: Number(row.payment_charge_rate ?? 0.025),
    status: row.status,
    notes: row.notes || "",
    targetDomain: row.target_domain || "all",
    paidAt: row.paid_at || null,
  };
  return { ...link, total: invoiceTotal(link) };
}

export async function getLink(shortCode: string) {
  const code = (shortCode || "").trim().toUpperCase();
  if (!code) return null;
  const res = await dbQuery("SELECT * FROM payment_links WHERE short_code = $1 LIMIT 1", [code]);
  if (!res.rows.length) return null;
  return mapLink(res.rows[0]);
}

export async function markLinkPaid(shortCode: string, amount: number, receipt: string, method: string) {
  if (!shortCode) return;
  await dbQuery(
    `UPDATE payment_links
     SET status = 'PAID', paid_at = NOW(), paid_amount = $2, receipt_number = $3, payment_method = $4
     WHERE short_code = $1`,
    [shortCode.toUpperCase(), amount, receipt || null, method]
  );
}

export async function recordTransaction(data: {
  orderId: string;
  shortCode?: string;
  amount: number | string;
  status: string;
  apiOperation?: string;
  paymentMethod?: string;
  cardBrand?: string;
  cardLast4?: string;
  cardExpiry?: string;
  cardholderName?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  authCode?: string;
  receiptNumber?: string;
  acquirerResponseCode?: string;
  gatewayCode?: string;
  stan?: string;
  rrn?: string;
  errorMessage?: string;
  rawResponse?: unknown;
}) {
  const amount = Number(data.amount);
  await dbQuery(
    `INSERT INTO transactions (
      order_id, transaction_id, short_code, amount, currency, status, api_operation,
      payment_method, card_brand, card_last4, card_expiry, cardholder_name,
      customer_name, customer_email, customer_phone, auth_code, receipt_number,
      acquirer_response_code, gateway_code, stan, rrn, error_message, raw_response
    ) VALUES (
      $1,'1',$2,$3,'SAR',$4,$5,
      $6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,
      $16,$17,$18,$19,$20,$21
    )`,
    [
      data.orderId,
      data.shortCode || null,
      Number.isFinite(amount) ? amount : 0,
      data.status,
      data.apiOperation || "PAY",
      data.paymentMethod || null,
      data.cardBrand || null,
      data.cardLast4 || null,
      data.cardExpiry || null,
      data.cardholderName || null,
      data.customerName || null,
      data.customerEmail || null,
      data.customerPhone || null,
      data.authCode || null,
      data.receiptNumber || null,
      data.acquirerResponseCode || null,
      data.gatewayCode || null,
      data.stan || null,
      data.rrn || null,
      data.errorMessage || null,
      data.rawResponse ? JSON.stringify(data.rawResponse) : null,
    ]
  );

  if (data.status === "SUCCESS" || data.status === "FAILED") {
    try {
      await dispatchTransactionNotifications({
        orderId: data.orderId,
        amount,
        status: data.status,
        paymentMethod: data.paymentMethod,
        cardBrand: data.cardBrand,
        cardLast4: data.cardLast4,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        authCode: data.authCode,
        receiptNumber: data.receiptNumber,
        errorMessage: data.errorMessage,
      });
    } catch (err: any) {
      console.error("[notify] payment email failed:", err?.message || err);
    }
  }
}

export async function assertRateLimit(ip: string) {
  const rules = await getPaymentRules();
  const limit = Math.max(3, rules.ipVelocityPerMinute || 8);
  await dbQuery("INSERT INTO payment_attempts (ip) VALUES ($1)", [ip]);
  const res = await dbQuery(
    "SELECT COUNT(*)::int AS n FROM payment_attempts WHERE ip = $1 AND created_at > NOW() - INTERVAL '10 minutes'",
    [ip]
  );
  const n = Number(res.rows[0]?.n || 0);
  if (n > limit * 2) {
    return { allowed: false, message: "Too many payment attempts. Please wait a few minutes and try again." };
  }
  return { allowed: true };
}
