import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkSession, COOKIE } from "@/lib/auth";
import { loadDB } from "@/lib/store";
import Link from "next/link";

export default function Dashboard() {
  if (!checkSession(cookies().get(COOKIE)?.value)) redirect("/admin");
  const db = loadDB();
  const cards = [
    ["Rotas/destaques", db.featured.length],
    ["Destinos", db.destinations.length],
    ["Horários", db.schedules.length],
    ["Cliques WhatsApp", db.clicks.reduce((a, c) => a + c.total, 0)],
  ];
  const top = [...db.clicks].sort((a, b) => b.total - a.total).slice(0, 5);
  return (
    <div className="container-vt py-8">
      <h1 className="text-2xl font-black text-total-blue">Dashboard</h1>
      <div className="grid sm:grid-cols-4 gap-3 mt-4">
        {cards.map(([t, v]) => <div key={t as string} className="card p-4"><div className="text-2xl font-black">{v}</div><div className="text-sm text-slate-500">{t}</div></div>)}
      </div>
      <div className="flex gap-3 mt-6 flex-wrap text-sm">
        <Link className="btn-primary" href="/admin/passagens">Gerenciar passagens</Link>
        <Link className="btn-primary" href="/admin/destinos">Gerenciar destinos</Link>
        <Link className="btn-primary" href="/admin/configuracoes">Configurações / WhatsApp</Link>
      </div>
      <h2 className="font-bold mt-8">Rotas que mais geram interesse (cliques)</h2>
      <ul className="text-sm mt-2">{top.map(c => <li key={c.rota}>{c.rota} — {c.total}</li>)}{top.length === 0 && <li className="text-slate-500">Sem dados ainda.</li>}</ul>
      {!db.settings.salesWhatsapp && <p className="mt-4 text-amber-700 text-sm bg-amber-50 border p-3 rounded">Pendente: configure o WhatsApp comercial em Configurações.</p>}
    </div>
  );
}
