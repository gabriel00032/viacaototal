import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkSession, COOKIE } from "@/lib/auth";
import { loadDB, saveDB } from "@/lib/store";

function auth() { return checkSession(cookies().get(COOKIE)?.value); }
const str = (v: any, n = 300) => String(v || "").slice(0, n);

export async function GET() {
  if (!auth()) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  return NextResponse.json(loadDB());
}

export async function PUT(req: Request) {
  if (!auth()) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const body = await req.json();
  const db = loadDB();
  if (body.settings) {
    const s = body.settings;
    db.settings.salesWhatsapp = String(s.salesWhatsapp || "").replace(/[^\d]/g, "").slice(0, 13);
    if (s.sac) db.settings.sac = str(s.sac, 30);
    if (s.email && /.+@.+\..+/.test(s.email)) db.settings.email = s.email;
    if (s.atendimento) db.settings.atendimento = str(s.atendimento, 200);
    if (s.endereco) db.settings.endereco = str(s.endereco, 300);
  }
  if (Array.isArray(body.featured)) {
    db.featured = body.featured.slice(0, 100).map((f: any, i: number) => ({
      id: str(f.id || `f${Date.now()}-${i}`, 40),
      origem: str(f.origem, 80),
      destino: str(f.destino, 80),
      preco: str(f.preco, 30),
      ativo: Boolean(f.ativo),
      posicao: Number(f.posicao || i + 1),
      fonte: str(f.fonte || "cadastro manual", 200),
      validadoEm: str(f.validadoEm || new Date().toISOString().slice(0, 10), 10),
    })).filter((f: any) => f.origem && f.destino);
  }
  if (Array.isArray(body.destinations)) {
    db.destinations = body.destinations.slice(0, 500).map((d: any) => ({
      id: str(d.id || `d${Date.now()}`, 40),
      cidade: str(d.cidade, 80),
      uf: str(d.uf, 2).toUpperCase(),
      ativo: Boolean(d.ativo),
      fonte: str(d.fonte || "cadastro manual", 200),
    })).filter((d: any) => d.cidade && d.uf);
  }
  if (Array.isArray(body.schedules)) {
    const ok = ["confirmado", "pendente", "inativo"];
    db.schedules = body.schedules.slice(0, 500).map((s: any) => ({
      id: str(s.id || `s${Date.now()}`, 40),
      origem: str(s.origem, 80),
      destino: str(s.destino, 80),
      partida: str(s.partida, 10),
      dias: str(s.dias, 80),
      validade: str(s.validade, 30),
      status: ok.includes(s.status) ? s.status : "pendente",
      obs: str(s.obs, 300),
      atualizadoEm: str(s.atualizadoEm || new Date().toISOString().slice(0, 10), 10),
    })).filter((s: any) => s.origem && s.destino && s.partida);
  }
  if (body.hero) {
    db.hero = {
      eyebrow: str(body.hero.eyebrow, 120),
      tituloA: str(body.hero.tituloA, 120),
      tituloDestaque: str(body.hero.tituloDestaque, 120),
      tituloB: str(body.hero.tituloB, 120),
      subtitulo: str(body.hero.subtitulo, 300),
    };
  }
  if (Array.isArray(body.minis)) {
    db.minis = body.minis.slice(0, 12).map((m: any) => ({ icone: str(m.icone, 8), titulo: str(m.titulo, 60) })).filter((m: any) => m.titulo);
  }
  if (Array.isArray(body.difCards)) {
    db.difCards = body.difCards.slice(0, 8).map((c: any) => ({ titulo: str(c.titulo, 120), destaque: str(c.destaque, 120), texto: str(c.texto, 500) })).filter((c: any) => c.titulo);
  }
  if (body.cta) db.cta = { titulo: str(body.cta.titulo, 120), texto: str(body.cta.texto, 300) };
  if (Array.isArray(body.pontos)) {
    db.pontos = body.pontos.slice(0, 100).map((p: any) => ({
      nome: str(p.nome, 150), endereco: str(p.endereco, 300), horario: str(p.horario, 150),
      telefone: str(p.telefone, 80), mapa: str(p.mapa, 500),
    })).filter((p: any) => p.nome);
  }
  if (body.quemSomos) db.quemSomos = { texto: str(body.quemSomos.texto, 5000) };
  if (Array.isArray(body.faqs)) {
    db.faqs = body.faqs.slice(0, 100).map((f: any) => ({ q: str(f.q, 200), a: str(f.a, 2000) })).filter((f: any) => f.q && f.a);
  }
  saveDB(db);
  return NextResponse.json({ ok: true });
}
