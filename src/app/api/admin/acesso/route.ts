import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkSession, COOKIE, sha256 } from "@/lib/auth";
import { loadDB, saveDB } from "@/lib/store";

function current() {
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

// GET: usuário atual (sem hash). PUT: trocar usuário/senha (exige senha atual).
export async function GET() {
  if (!checkSession(cookies().get(COOKIE)?.value))
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  return NextResponse.json({ user: current().user });
}

export async function PUT(req: Request) {
  if (!checkSession(cookies().get(COOKIE)?.value))
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { currentPass, newUser, newPass } = await req.json().catch(() => ({}));
  const cur = current();
  if (sha256(String(currentPass || "")) !== cur.hash)
    return NextResponse.json({ ok: false, error: "Senha atual incorreta." }, { status: 403 });
  const user = String(newUser || "").trim();
  const pass = String(newPass || "");
  if (user && !/^[a-zA-Z0-9._-]{3,30}$/.test(user))
    return NextResponse.json({ ok: false, error: "Usuário: 3–30 caracteres (letras, números, . _ -)." }, { status: 400 });
  if (pass && pass.length < 6)
    return NextResponse.json({ ok: false, error: "Nova senha: mínimo 6 caracteres." }, { status: 400 });
  if (!user && !pass)
    return NextResponse.json({ ok: false, error: "Informe o novo usuário e/ou a nova senha." }, { status: 400 });
  const db = loadDB();
  db.adminCreds = {
    user: user || cur.user,
    passHash: pass ? sha256(pass) : cur.hash,
    updatedAt: new Date().toISOString(),
  };
  saveDB(db);
  return NextResponse.json({ ok: true, user: db.adminCreds.user });
}
