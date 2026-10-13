import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET || "dev-secret-trocar-em-producao-123456";
export const COOKIE = "vt_admin";

export function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}
export function makeSession(user: string): string {
  const exp = Date.now() + 1000 * 60 * 60 * 12;
  const payload = `${user}.${exp}`;
  return `${payload}.${sign(payload)}`;
}
export function checkSession(cookie: string | undefined): string | null {
  if (!cookie) return null;
  const parts = cookie.split(".");
  if (parts.length !== 3) return null;
  const [user, exp, sig] = parts;
  if (sign(`${user}.${exp}`) !== sig) return null;
  if (Number(exp) < Date.now()) return null;
  return user;
}
export function sha256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}
