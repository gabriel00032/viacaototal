import { loadDB } from "@/lib/store";
import { buildWhatsMessage, whatsappLink } from "@/lib/trip";

export const metadata = { title: "Destinos atendidos — Viação Total" };

export default function Page({ searchParams }: { searchParams?: { q?: string } }) {
  const db = loadDB();
  const q = (searchParams?.q || "").toLowerCase();
  const dests = db.destinations.filter(d => d.ativo && (!q || d.cidade.toLowerCase().includes(q)));
  return (
    <div className="container-vt py-8">
      <h1 className="text-2xl font-black text-total-blue">Destinos atendidos</h1>
      <p className="text-sm text-slate-500">Cidades confirmadas pela auditoria de viajetotal.com.br (13/10/2026). Horários: consulte pelo WhatsApp.</p>
      <form className="flex gap-2 mt-4" method="get">
        <input name="q" placeholder="Pesquisar cidade" defaultValue={searchParams?.q || ""} className="input !w-64" aria-label="Pesquisar cidade" />
        <button className="btn-primary">Pesquisar</button>
      </form>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
        {dests.map(d => {
          const url = whatsappLink(db.settings.salesWhatsapp, buildWhatsMessage({ origem: "A combinar", destino: `${d.cidade} - ${d.uf}`, dataIda: new Date().toISOString().slice(0, 10), tipo: "ida" }));
          return (
            <li key={d.id} className="card p-4 flex justify-between items-center">
              <span><strong>{d.cidade}</strong> <span className="text-slate-500 text-sm">- {d.uf}</span></span>
              {url ? <a className="text-sm underline" target="_blank" href={url}>Consultar pelo WhatsApp</a> : <span className="text-xs">Consulte os horários pelo WhatsApp</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
