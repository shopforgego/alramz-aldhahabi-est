import { config } from "./config";

export async function verifyHcaptcha(token: string | undefined | null, remoteIp?: string) {
  const secret = config.hcaptchaSecret;
  if (!secret) {
    return { success: false, error: "hCaptcha is not configured on the server." };
  }
  if (!token || token.trim().length < 10) {
    return { success: false, error: "Please complete the security check before continuing." };
  }
  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token.trim());
  if (remoteIp) form.set("remoteip", remoteIp);
  if (config.hcaptchaSiteKey) form.set("sitekey", config.hcaptchaSiteKey);
  const res = await fetch("https://api.hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
  if (!data.success) {
    return { success: false, error: "Security verification failed. Please try again.", codes: data["error-codes"] || [] };
  }
  return { success: true };
}
