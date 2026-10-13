import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkSession, COOKIE } from "@/lib/auth";
import { loadDB, saveDB } from "@/lib/store";

function auth() { return checkSession(cookies().get(COOKIE)?.value); }

export async function GET() {
  if (!auth()) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  return NextResponse.json(loadDB());
}

export async function PUT(req: Request) {
  if (!auth()) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const body = await req.json();
  const db = loadDB();
  // Atualização parcial validada no servidor
  if (body.settings) {
    const s = body.settings;
    db.settings.salesWhatsapp = String(s.salesWhatsapp || "").replace(/[^\d]/g, "").slice(0, 13);
    if (s.sac) db.settings.sac = String(s.sac).slice(0, 30);
    if (s.email && /.+@.+\..+/.test(s.email)) db.settings.email = s.email;
    if (s.atendimento) db.settings.atendimento = String(s.atendimento).slice(0, 200);
    if (s.endereco) db.settings.endereco = String(s.endereco).slice(0, 300);
  }
  if (Array.isArray(body.featured)) {
    db.featured = body.featured.slice(0, 100).map((f: any, i: number) => ({
      id: String(f.id || `f${Date.now()}-${i}`),
      origem: String(f.origem || "").slice(0, 80),
      destino: String(f.destino || "").slice(0, 80),
      preco: String(f.preco || "").slice(0, 30),
      ativo: Boolean(f.ativo),
      posicao: Number(f.posicao || i + 1),
      fonte: String(f.fonte || "cadastro manual").slice(0, 200),
      validadoEm: String(f.validadoEm || new Date().toISOString().slice(0, 10)),
    })).filter((f: any) => f.origem && f.destino);
  }
  if (Array.isArray(body.destinations)) {
    db.destinations = body.destinations.slice(0, 500).map((d: any) => ({
      id: String(d.id || `d${Date.now()}`),
      cidade: String(d.cidade || "").slice(0, 80),
      uf: String(d.uf || "").toUpperCase().slice(0, 2),
      ativo: Boolean(d.ativo),
      fonte: String(d.fonte || "cadastro manual").slice(0, 200),
    })).filter((d: any) => d.cidade && d.uf);
  }
  saveDB(db);
  return NextResponse.json({ ok: true });
}
