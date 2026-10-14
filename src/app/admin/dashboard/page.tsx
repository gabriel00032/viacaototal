import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkSession, COOKIE } from "@/lib/auth";
import { loadDB } from "@/lib/store";
import Link from "next/link";

export default function Dashboard() {
  if (!checkSession(cookies().get(COOKIE)?.value)) redirect("/admin");
  const db = loadDB();
  const cards = [
    ["Passagens em destaque", db.featured.length, "/admin/passagens"],
    ["Destinos (curadoria)", db.destinations.length, "/admin/destinos"],
    ["Horários cadastrados", db.schedules.length, "/admin/horarios"],
    ["Pontos de venda", db.pontos.length, "/admin/pontos"],
    ["Perguntas frequentes", db.faqs.length, "/admin/faq"],
    ["Cliques WhatsApp", db.clicks.reduce((a, c) => a + c.total, 0), "/admin/dashboard"],
  ];
  const top = [...db.clicks].sort((a, b) => b.total - a.total).slice(0, 5);
  return (
    <div>
      <h1 className="text-xl font-black text-navy">Dashboard</h1>
      <div className="grid sm:grid-cols-3 gap-3 mt-4">
        {cards.map(([t, v, href]) => (
          <Link key={t as string} href={href as string} className="card p-4 hover:shadow-card transition">
            <div className="text-2xl font-black text-navy">{v}</div>
            <div className="text-sm text-slate-500">{t} →</div>
          </Link>
        ))}
      </div>
      <h2 className="font-bold mt-8 text-navy">Rotas que mais geram interesse (cliques)</h2>
      <ul className="text-sm mt-2">{top.map(c => <li key={c.rota}>{c.rota} — {c.total}</li>)}{top.length === 0 && <li className="text-slate-500">Sem dados ainda.</li>}</ul>
      {!db.settings.salesWhatsapp && <p className="mt-4 text-amber-700 text-sm bg-amber-50 border p-3 rounded">Pendente: configure o WhatsApp comercial em Configurações.</p>}
    </div>
  );
}
