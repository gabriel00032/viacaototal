import SearchForm from "@/components/SearchForm";
import FeaturedCards from "@/components/FeaturedCards";
import Link from "next/link";
import { loadDB } from "@/lib/store";

const DIFERENCIAIS = [
  { t: "Custo Benefício", d: "Tarifas competitivas nas rotas atendidas.", i: "💰" },
  { t: "Embarque Digital", d: "Embarque com bilhete digital, sem fila de guichê.", i: "📱" },
  { t: "100% Seguro", d: "Conteúdo institucional oficial — condições confirmadas com a equipe comercial.", i: "🛡️" },
  { t: "Remarcação Fácil", d: "Solicite remarcação pelos canais oficiais, conforme regras da tarifa.", i: "🔄" },
  { t: "Ônibus Sanitizado", d: "Procedimentos de higienização da frota.", i: "🧼" },
];

export default function Home() {
  const db = loadDB();
  const cities = db.destinations.filter(d => d.ativo).map(d => `${d.cidade} - ${d.uf}`);
  const trips = db.featured.filter(f => f.ativo).sort((a, b) => a.posicao - b.posicao);
  return (
    <div>
      <section className="bg-gradient-to-b from-total-blue to-total-dark text-white">
        <div className="container-vt py-10">
          <p className="text-orange-300 text-sm font-semibold">Conheça nosso aplicativo • Embarque digital</p>
          <h1 className="text-3xl md:text-4xl font-black mt-1">Passagens de ônibus da Viação Total</h1>
          <p className="text-white/80 mt-2">Pesquise a viagem e finalize pelo WhatsApp com um vendedor.</p>
          <div className="mt-6 bg-white rounded-xl p-2 text-slate-800">
            <SearchForm origens={cities} destinos={cities} whatsapp={db.settings.salesWhatsapp || process.env.SALES_WHATSAPP || ""} />
          </div>
        </div>
      </section>

      <section className="container-vt mt-8">
        <div className="flex justify-center gap-6 flex-wrap text-center text-sm">
          {DIFERENCIAIS.map(d => <div key={d.t} className="w-28"><div className="text-2xl">{d.i}</div><div className="font-semibold">{d.t}</div></div>)}
        </div>
      </section>

      <section className="bg-total-light mt-8 py-10">
        <div className="container-vt">
          <h2 className="text-2xl font-black text-total-blue text-center">Diferenciais Viação Total</h2>
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="card p-6"><h3 className="font-bold text-total-blue">Conforto e <span className="text-total-orange">Segurança</span></h3><p className="text-sm text-slate-600 mt-2">Viagens com foco em conforto, segurança e bons profissionais — conforme comunicação institucional oficial.</p></div>
            <div className="card p-6"><h3 className="font-bold text-total-blue">Qualidade nos serviços <span className="text-total-orange">e bons profissionais</span></h3><p className="text-sm text-slate-600 mt-2">Atendimento comercial das 08h às 18h (seg–sex) e SAC 24h: 0800 085 8080.</p></div>
          </div>
        </div>
      </section>

      <section className="container-vt mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-total-blue">Passagens de ônibus mais buscadas</h2>
          <Link href="/passagens" className="text-sm border rounded-lg px-3 py-1.5 hover:bg-slate-100">Ver todas</Link>
        </div>
        <p className="text-xs text-slate-500 mt-1">Ordem e valores conforme auditoria de viajetotal.com.br em 13/10/2026. Preços “a partir de”, sujeitos a confirmação.</p>
        <div className="mt-4"><FeaturedCards trips={trips} whatsapp={db.settings.salesWhatsapp || process.env.SALES_WHATSAPP || ""} /></div>
      </section>

      <section className="container-vt mt-10 grid md:grid-cols-2 gap-4">
        <div className="card p-6"><h3 className="font-bold">Atendimento pelo WhatsApp</h3><p className="text-sm text-slate-600 mt-1">Sem pagamento online nesta versão: você pesquisa, escolhe e fala com um vendedor.</p><Link href="/contato" className="btn-whats mt-4">Compre pelo WhatsApp</Link></div>
        <div className="card p-6"><h3 className="font-bold">Informações institucionais</h3><p className="text-sm text-slate-600 mt-1">{db.settings.endereco}. E-mail {db.settings.email}.</p><Link href="/quem-somos" className="underline text-sm mt-3 inline-block">Quem Somos</Link></div>
      </section>
    </div>
  );
}
