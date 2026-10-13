import FeaturedCards from "@/components/FeaturedCards";
import { loadDB } from "@/lib/store";

export const metadata = { title: "Passagens — Viação Total" };

export default function Page({ searchParams }: { searchParams?: { origem?: string; destino?: string } }) {
  const db = loadDB();
  let trips = db.featured.filter(f => f.ativo).sort((a, b) => a.posicao - b.posicao);
  if (searchParams?.origem) trips = trips.filter(t => t.origem.toLowerCase().includes(searchParams.origem!.toLowerCase()));
  if (searchParams?.destino) trips = trips.filter(t => t.destino.toLowerCase().includes(searchParams.destino!.toLowerCase()));
  return (
    <div className="container-vt py-8">
      <h1 className="text-2xl font-black text-total-blue">Todas as passagens validadas</h1>
      <form className="flex gap-2 mt-4 flex-wrap" method="get">
        <input name="origem" placeholder="Filtrar origem" defaultValue={searchParams?.origem || ""} className="input !w-52" />
        <input name="destino" placeholder="Filtrar destino" defaultValue={searchParams?.destino || ""} className="input !w-52" />
        <button className="btn-primary">Filtrar</button>
      </form>
      <div className="mt-6">{trips.length ? <FeaturedCards trips={trips} whatsapp={db.settings.salesWhatsapp} /> : <p className="text-sm bg-amber-50 border p-4 rounded">Nenhuma passagem validada para este filtro. Consulte a equipe comercial pelo WhatsApp.</p>}</div>
    </div>
  );
}
