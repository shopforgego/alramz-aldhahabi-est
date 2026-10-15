export function clientIp(req: any): string {
  const xf = req.headers?.["x-forwarded-for"] || req.headers?.["x-real-ip"];
  const raw = Array.isArray(xf) ? xf[0] : xf || req.socket?.remoteAddress || "";
  return String(raw).split(",")[0].trim() || "0.0.0.0";
}

export function readJson(req: any): any {
  if (!req) return {};
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string" && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

export function sendJson(res: any, status: number, body: unknown) {
  res.status(status).json(body);
}

export function requestHost(req: any): string {
  const raw = req.headers?.["x-forwarded-host"] || req.headers?.host || "";
  const host = String(Array.isArray(raw) ? raw[0] : raw).split(",")[0].trim().toLowerCase();
  return host.replace(/:\d+$/, "");
}
