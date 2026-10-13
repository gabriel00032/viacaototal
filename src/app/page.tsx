import SearchForm from "@/components/SearchForm";
import FeaturedCards from "@/components/FeaturedCards";
import Link from "next/link";
import { loadDB } from "@/lib/store";

const DIFERENCIAIS = [
  { t: "Custo Benefício", i: "💰" },
  { t: "Embarque Digital", i: "📱" },
  { t: "100% Seguro", i: "🛡️" },
  { t: "Remarcação Fácil", i: "🔄" },
  { t: "Ônibus Sanitizado", i: "🧼" },
];

export default function Home() {
  const db = loadDB();
  const cities = db.destinations.filter(d => d.ativo).map(d => `${d.cidade} - ${d.uf}`);
  const trips = db.featured.filter(f => f.ativo).sort((a, b) => a.posicao - b.posicao);
  const wa = db.settings.salesWhatsapp || process.env.SALES_WHATSAPP || "";
  return (
    <div>
      {/* Hero padrão televendas */}
      <section className="hero-gradient text-white">
        <div className="container-vt pt-10 pb-16">
          <p className="text-xs font-bold tracking-[0.2em] text-white/70">TELEVENDAS AUTORIZADO · VIAÇÃO TOTAL</p>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold mt-2 leading-tight">
            Sua viagem com a <span className="text-accent">Viação Total</span>, reservada em minutos.
          </h1>
          <p className="text-white/80 mt-3 max-w-2xl">Escolha a origem, o destino e a data. Atendimento direto pelo WhatsApp, sem pagamento online.</p>
          <div className="mt-6"><SearchForm origens={cities} destinos={cities} whatsapp={wa} /></div>
          <div className="flex justify-center gap-6 flex-wrap text-center text-xs mt-6 text-white/90">
            {DIFERENCIAIS.map(d => <div key={d.t} className="w-24"><div className="text-2xl">{d.i}</div><div className="font-semibold mt-1">{d.t}</div></div>)}
          </div>
        </div>
      </section>

      {/* Principais linhas */}
      <section className="container-vt -mt-8 relative">
        <div className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl md:text-2xl font-extrabold text-navy">Principais linhas</h2>
            <Link href="/passagens" className="text-sm font-semibold border border-slate-300 rounded-lg px-3 py-1.5 hover:bg-slate-50 text-navy">Ver todas</Link>
          </div>
          <FeaturedCards trips={trips} whatsapp={wa} />
          <p className="text-xs text-slate-500 mt-3">Ordem e valores conforme auditoria de viajetotal.com.br em 13/10/2026. Preços “a partir de”, horários sujeitos a confirmação comercial.</p>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="container-vt mt-10">
        <h2 className="font-display text-2xl font-extrabold text-navy text-center">Diferenciais Viação Total</h2>
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="card p-6"><h3 className="font-display font-bold text-navy">Conforto e <span className="text-accent">Segurança</span></h3><p className="text-sm text-slate-600 mt-2">Viagens com foco em conforto, segurança e bons profissionais — conforme comunicação institucional oficial.</p></div>
          <div className="card p-6"><h3 className="font-display font-bold text-navy">Qualidade nos serviços <span className="text-accent">e bons profissionais</span></h3><p className="text-sm text-slate-600 mt-2">Atendimento comercial das 08h às 18h (seg–sex) e SAC 24h: 0800 085 8080.</p></div>
        </div>
      </section>

      <section className="container-vt mt-10 grid md:grid-cols-2 gap-4 pb-4">
        <div className="hero-gradient rounded-2xl p-6 text-white"><h3 className="font-display font-bold text-lg">Atendimento pelo WhatsApp</h3><p className="text-sm text-white/80 mt-1">Você pesquisa, escolhe e fala com um vendedor. Simples assim.</p><Link href="/contato" className="btn-whats mt-4">Compre pelo WhatsApp</Link></div>
        <div className="card p-6"><h3 className="font-display font-bold text-navy">Informações institucionais</h3><p className="text-sm text-slate-600 mt-1">{db.settings.endereco}. E-mail {db.settings.email}.</p><Link href="/quem-somos" className="underline text-sm mt-3 inline-block text-primary">Quem Somos</Link></div>
      </section>
    </div>
  );
}
