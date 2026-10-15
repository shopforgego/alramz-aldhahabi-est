export const config = {
  gatewayUrl: (process.env.MASTERCARD_GATEWAY_URL || "https://ksa.gateway.mastercard.com").replace(/\/$/, ""),
  merchantId: process.env.MASTERCARD_MERCHANT_ID || "602379206",
  apiPassword: process.env.MASTERCARD_API_PASSWORD || "",
  apiVersion: process.env.MASTERCARD_API_VERSION || "72",
  currency: process.env.MASTERCARD_CURRENCY || "SAR",
  appUrl: (process.env.APP_URL || "https://www.alramzgold.com").replace(/\/$/, ""),
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://postgres:localdev_rehlaty_2026@187.77.98.125:5433/alramz_aldhahabi_db",
  hcaptchaSecret: process.env.HCAPTCHA_SECRET_KEY || "",
  hcaptchaSiteKey:
    process.env.HCAPTCHA_SITE_KEY ||
    process.env.VITE_HCAPTCHA_SITE_KEY ||
    "70fa0926-a8de-4128-a366-7ab806446be4",
  appleMerchantId: process.env.APPLE_PAY_MERCHANT_IDENTIFIER || "merchant.com.alramzgold",
  appleDisplayName: process.env.APPLE_PAY_DISPLAY_NAME || "مؤسسة الرمز الذهبي الراقي",
  appleInitiativeContext: process.env.APPLE_PAY_INITIATIVE_CONTEXT || "www.alramzgold.com",
  tokenSecret: process.env.CHECKOUT_ENCRYPTION_SECRET || process.env.MASTERCARD_API_PASSWORD || "",
};

export const ALLOWED_HOSTS = new Set([
  "www.alramzgold.com",
  "alramzgold.com",
  "alramz.shopforgego.com",
  "alramz.protosoft.cloud",
  "alramz-aldhahabi-est.vercel.app",
  "localhost",
  "127.0.0.1",
]);
