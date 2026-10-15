import nodemailer from "nodemailer";
import { dbQuery } from "./db.js";

const FROM = '"مؤسسة الرمز الذهبي الراقي" <alramzgold@naderalufuq.com>';

type Notice = {
  orderId: string;
  amount: number | string;
  status: string;
  paymentMethod?: string;
  cardBrand?: string;
  cardLast4?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  authCode?: string;
  receiptNumber?: string;
  errorMessage?: string;
};

function mailer() {
  const pass = process.env.SMTP_PASS || "";
  if (!pass) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || "info@naderalufuq.com",
      pass,
    },
    tls: { rejectUnauthorized: false },
  });
}

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(amount: number | string) {
  const value = typeof amount === "number" ? amount : Number(amount || 0);
  return Number.isFinite(value) ? value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";
}

function message(data: Notice, lang: "ar" | "en") {
  const success = data.status === "SUCCESS";
  const amount = money(data.amount);
  const en = lang === "en";
  const subject = en
    ? `${success ? "Transaction processed" : "Transaction failed"} — SAR ${amount} [${data.orderId}]`
    : `${success ? "إشعار تنفيذ الدفع بنجاح" : "إشعار فشل عملية الدفع"} — ${amount} ر.س [${data.orderId}]`;
  const rows: Array<[string, string]> = [
    [en ? "Order" : "رقم العملية", data.orderId],
    [en ? "Amount" : "المبلغ", `SAR ${amount}`],
    [en ? "Status" : "الحالة", success ? (en ? "Approved" : "مقبولة") : (en ? "Failed" : "غير مكتملة")],
  ];
  if (data.paymentMethod) rows.push([en ? "Method" : "طريقة الدفع", data.paymentMethod]);
  if (data.cardBrand || data.cardLast4) rows.push([en ? "Card" : "البطاقة", [data.cardBrand, data.cardLast4 ? `•••• ${data.cardLast4}` : ""].filter(Boolean).join(" ")]);
  if (data.customerName) rows.push([en ? "Customer" : "العميل", data.customerName]);
  if (data.customerEmail) rows.push([en ? "Customer email" : "بريد العميل", data.customerEmail]);
  if (data.customerPhone) rows.push([en ? "Customer phone" : "جوال العميل", data.customerPhone]);
  if (data.receiptNumber) rows.push([en ? "Receipt" : "رقم الإيصال", data.receiptNumber]);
  if (data.authCode) rows.push([en ? "Auth code" : "رمز التفويض", data.authCode]);
  if (!success && data.errorMessage) rows.push([en ? "Reason" : "السبب", data.errorMessage]);

  const text = [subject, ...rows.map(([label, value]) => `${label}: ${value}`)].join("\n");
  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 0;color:#64748b">${esc(label)}</td><td style="padding:8px 0;text-align:${en ? "right" : "left"};font-weight:700;color:#0f172a">${esc(value)}</td></tr>`
    )
    .join("");
  const html = `<!DOCTYPE html><html lang="${lang}" dir="${en ? "ltr" : "rtl"}"><body style="margin:0;padding:24px;background:#f8fafc;font-family:Tahoma,Arial,sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">
    <div style="padding:22px 24px;background:#064e3b;color:#fff">
      <div style="font-size:18px;font-weight:800">مؤسسة الرمز الذهبي الراقي</div>
      <div style="margin-top:8px;font-size:16px">${success ? (en ? "Payment approved" : "تم تنفيذ الدفع") : (en ? "Payment was not completed" : "لم تكتمل عملية الدفع")}</div>
    </div>
    <div style="padding:8px 24px 20px"><table style="width:100%;border-collapse:collapse;font-size:14px">${htmlRows}</table></div>
  </div></body></html>`;
  return { subject, text, html };
}

async function sendEmails(data: Notice, status: "SUCCESS" | "FAILED") {
  const transport = mailer();
  if (!transport) {
    console.error("[notify] SMTP is not configured");
    return;
  }
  const column = status === "SUCCESS" ? "notify_success" : "notify_failed";
  const recipients = await dbQuery(
    `SELECT email, language FROM notification_recipients WHERE is_active = true AND ${column} = true`
  );
  await Promise.allSettled(
    recipients.rows.map(async (row: { email: string; language: string }) => {
      const lang = row.language === "en" ? "en" : "ar";
      const { subject, text, html } = message({ ...data, status }, lang);
      await transport.sendMail({
        from: FROM,
        replyTo: "alramzgold@naderalufuq.com",
        to: row.email,
        subject,
        text,
        html,
      });
    })
  );
}

/** Same Expo channel the PayOps app uses. Expo delivers it through FCM on Android and APNs on iPhone. */
async function sendPush(data: Notice, status: "SUCCESS" | "FAILED") {
  const column = status === "SUCCESS" ? "notify_success" : "notify_failed";
  const registered = await dbQuery(
    `SELECT expo_push_token FROM device_push_tokens WHERE is_active = true AND ${column} = true`
  );
  const tokens = registered.rows
    .map((row: { expo_push_token?: string }) => row.expo_push_token || "")
    .filter((token: string) => token.startsWith("ExponentPushToken"));
  if (!tokens.length) return;

  const amount = money(data.amount);
  const success = status === "SUCCESS";
  const title = success ? "عملية سداد ناجحة" : "عملية سداد فاشلة";
  const body = success
    ? `تم استلام ${amount} ر.س${data.customerName ? ` من ${data.customerName}` : ""} — الرمز الذهبي`
    : `فشلت عملية بمبلغ ${amount} ر.س${data.orderId ? ` — ${data.orderId}` : ""}`;
  const messages = tokens.map((to: string) => ({
    to,
    sound: "default",
    title,
    body,
    priority: "high",
    channelId: "payments",
    data: {
      type: "transaction",
      status,
      orderId: data.orderId,
      amount: Number(data.amount) || 0,
      currency: "SAR",
      orgId: "alramz-aldhahabi",
    },
  }));

  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    const pushRes = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(chunk),
    });
    if (!pushRes.ok) {
      console.error("[notify] push HTTP", pushRes.status, await pushRes.text().catch(() => ""));
      continue;
    }
    const json = await pushRes.json().catch(() => null);
    const tickets = Array.isArray(json?.data) ? json.data : [];
    for (const ticket of tickets) {
      if (ticket?.status === "error") console.error("[notify] push ticket", ticket.message, ticket.details);
    }
  }
}

export async function dispatchTransactionNotifications(data: Notice) {
  const status = String(data.status || "").toUpperCase();
  if (status !== "SUCCESS" && status !== "FAILED") return;
  const notice = { ...data, status };
  await Promise.allSettled([sendEmails(notice, status), sendPush(notice, status)]);
}
