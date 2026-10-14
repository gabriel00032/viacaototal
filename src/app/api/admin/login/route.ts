import { NextResponse } from "next/server";
import { makeSession, sha256, COOKIE } from "@/lib/auth";
import { loadDB } from "@/lib/store";

// Anti força-bruta: 10 tentativas erradas / 10 min por IP.
const fails = new Map<string, { n: number; reset: number }>();
function limited(ip: string): boolean {
  const now = Date.now();
  const f = fails.get(ip);
  if (f && f.reset < now) fails.delete(ip);
  const cur = fails.get(ip);
  return !!cur && cur.n >= 10;
}
function registerFail(ip: string) {
  const now = Date.now();
  const cur = fails.get(ip);
  if (!cur || cur.reset < now) fails.set(ip, { n: 1, reset: now + 10 * 60 * 1000 });
  else cur.n += 1;
}

function expected() {
  let dbUser = "", dbHash = "";
  try {
    const db = loadDB();
    dbUser = db.adminCreds?.user || "";
    dbHash = db.adminCreds?.passHash || "";
  } catch { /* usa env */ }
  return {
    user: dbUser || process.env.ADMIN_USER || "admin",
    hash: dbHash || process.env.ADMIN_PASS_HASH || sha256("admin123"),
  };
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (limited(ip)) return NextResponse.json({ ok: false, error: "Muitas tentativas. Aguarde 10 minutos." }, { status: 429 });
  const { user, pass } = await req.json().catch(() => ({}));
  const exp = expected();
  if (user !== exp.user || sha256(String(pass || "")) !== exp.hash) {
    registerFail(ip);
    return NextResponse.json({ ok: false, error: "Credenciais inválidas." }, { status: 401 });
  }
  fails.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, makeSession(user), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" });
  return res;
}
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE);
  return res;
}
