import fs from "fs";
import https from "https";
import path from "path";
import { ALLOWED_HOSTS, config } from "./config.js";

function readFirst(paths: string[]) {
  for (const file of paths) {
    if (fs.existsSync(file)) return fs.readFileSync(file);
  }
  return null;
}

export function appleIdentity() {
  const root = process.cwd();
  const cert = readFirst([
    path.join(root, "certs/alramz_merchant_identity.pem"),
    path.join(root, "certs/merchant_id.pem"),
  ]);
  const key = readFirst([
    path.join(root, "certs/apple_pay_merchant_identity.key"),
  ]);
  if (!cert || !key) throw new Error("Apple Pay merchant identity certificate is missing.");
  return { cert, key };
}

export function assertAppleHost(host: string) {
  const clean = (host || "").toLowerCase().replace(/:\d+$/, "");
  if (!ALLOWED_HOSTS.has(clean)) {
    throw new Error("This domain is not enabled for Apple Pay.");
  }
  return clean;
}

export function validateAppleMerchant(validationUrl: string, domain: string) {
  const parsed = new URL(validationUrl);
  if (!parsed.hostname.endsWith(".apple.com")) {
    throw new Error("Invalid Apple Pay validation URL.");
  }
  const { cert, key } = appleIdentity();
  const payload = JSON.stringify({
    merchantIdentifier: config.appleMerchantId,
    displayName: config.appleDisplayName,
    initiative: "web",
    initiativeContext: domain,
  });
  return new Promise((resolve, reject) => {
    const req = https.request(
      validationUrl,
      {
        method: "POST",
        agent: new https.Agent({ cert, key }),
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsedBody = JSON.parse(data);
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) resolve(parsedBody);
            else reject(new Error(parsedBody?.statusMessage || `Apple returned status ${res.statusCode}`));
          } catch (err: any) {
            reject(new Error(err?.message || "Invalid Apple response"));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}
