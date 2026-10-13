import fs from "fs";
import path from "path";
import { loadDB } from "@/lib/store";
import { buildWhatsMessage, whatsappLink } from "@/lib/trip";

export const metadata = { title: "Destinos atendidos — Viação Total" };

function locaisOficiais(): string[] {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "data", "locations-official.json"), "utf-8");
    return (JSON.parse(raw).locations as { name: string }[]).map(l => l.name);
  } catch { return []; }
}

export default function Page({ searchParams }: { searchParams?: { q?: string } }) {
  const db = loadDB();
  const q = (searchParams?.q || "").toUpperCase();
  const today = new Date().toISOString().slice(0, 10);
  const todos = locaisOficiais();
  const lista = todos.filter(n => !q || n.toUpperCase().includes(q));
  return (
    <div className="container-vt py-8">
      <h1 className="text-2xl font-black text-total-blue">Destinos atendidos</h1>
      <p className="text-sm text-slate-500 mt-1">{todos.length} localidades oficiais extraídas de viajetotal.com.br em 13/10/2026 (endpoint GetLocations). Horários ao vivo na busca da página inicial.</p>
      <form className="flex gap-2 mt-4" method="get">
        <input name="q" placeholder="Pesquisar cidade ou ponto" defaultValue={searchParams?.q || ""} className="input !w-64" aria-label="Pesquisar cidade" />
        <button className="btn-primary">Pesquisar</button>
      </form>
      <p className="text-xs text-slate-500 mt-2">{lista.length} resultado(s).</p>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {lista.slice(0, 120).map(n => {
          const url = whatsappLink(db.settings.salesWhatsapp, buildWhatsMessage({ origem: "A combinar", destino: n, dataIda: today, tipo: "ida" }));
          return (
            <li key={n} className="card p-4 flex justify-between items-center gap-2">
              <span className="text-sm"><strong>{n}</strong></span>
              {url ? <a className="text-sm underline shrink-0" target="_blank" href={url}>Consultar</a> : <span className="text-xs">WhatsApp em configuração</span>}
            </li>
          );
        })}
      </ul>
      {lista.length > 120 && <p className="text-xs text-slate-500 mt-3">Mostrando 120 de {lista.length} — refine a pesquisa.</p>}
    </div>
  );
}
