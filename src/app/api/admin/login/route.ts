import { NextResponse } from "next/server";
import { makeSession, sha256, COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const { user, pass } = await req.json().catch(() => ({}));
  const expectedUser = process.env.ADMIN_USER || "admin";
  const expectedHash = process.env.ADMIN_PASS_HASH || sha256("admin123");
  if (user !== expectedUser || sha256(String(pass || "")) !== expectedHash)
    return NextResponse.json({ ok: false, error: "Credenciais inválidas." }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, makeSession(user), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" });
  return res;
}
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE);
  return res;
}
