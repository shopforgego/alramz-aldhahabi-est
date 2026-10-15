import crypto from "crypto";
import { config } from "./config.js";

export interface CheckoutPayload {
  orderId: string;
  amount: string;
  name?: string;
  email?: string;
  phone?: string;
  lang?: string;
  description?: string;
  shortCode?: string;
  createdAt: number;
  expiresAt: number;
}

function key(): Buffer {
  const secret = config.tokenSecret || config.apiPassword;
  if (!secret) throw new Error("Checkout encryption secret is not configured");
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptCheckoutToken(payload: Omit<CheckoutPayload, "createdAt" | "expiresAt"> & { ttlMs?: number }): string {
  const now = Date.now();
  const full: CheckoutPayload = {
    ...payload,
    createdAt: now,
    expiresAt: now + (payload.ttlMs || 30 * 60 * 1000),
  };
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(full), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function decryptCheckoutToken(token: string): { valid: boolean; data?: CheckoutPayload; error?: string } {
  try {
    if (!token) return { valid: false, error: "Missing payment token" };
    const combined = Buffer.from(token, "base64url");
    if (combined.length < 28) return { valid: false, error: "Invalid payment token" };
    const iv = combined.subarray(0, 12);
    const tag = combined.subarray(12, 28);
    const encrypted = combined.subarray(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", key(), iv);
    decipher.setAuthTag(tag);
    const payload = JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8")) as CheckoutPayload;
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return { valid: false, error: "Payment session expired. Please start again." };
    }
    return { valid: true, data: payload };
  } catch {
    return { valid: false, error: "Payment session is invalid." };
  }
}
