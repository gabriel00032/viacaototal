import SearchForm from "@/components/SearchForm";
import FeaturedCards from "@/components/FeaturedCards";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { loadDB } from "@/lib/store";

function locaisOficiais(): string[] {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "data", "locations-official.json"), "utf-8");
    return (JSON.parse(raw).locations as { name: string }[]).map(l => l.name);
  } catch { return []; }
}

export default function Home() {
  const db = loadDB();
  const locais = locaisOficiais();
  const trips = db.featured.filter(f => f.ativo).sort((a, b) => a.posicao - b.posicao);
  const wa = db.settings.salesWhatsapp || process.env.SALES_WHATSAPP || "";
  const hero = db.hero, minis = db.minis, difCards = db.difCards, cta = db.cta;
  return (
    <div>
      {/* Hero padrão televendas */}
      <section className="hero-gradient text-white">
        <div className="container-vt pt-10 pb-16">
          <p className="text-xs font-bold tracking-[0.2em] text-white/70">{hero.eyebrow}</p>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold mt-2 leading-tight">
            {hero.tituloA} <span className="text-accent">{hero.tituloDestaque}</span>{hero.tituloB}
          </h1>
          <p className="text-white/80 mt-3 max-w-2xl">{hero.subtitulo}</p>
          <div className="mt-6"><SearchForm locais={locais} whatsapp={wa} /></div>
          <div className="flex justify-center gap-6 flex-wrap text-center text-xs mt-6 text-white/90">
            {minis.map(d => <div key={d.titulo} className="w-24"><div className="text-2xl">{d.icone}</div><div className="font-semibold mt-1">{d.titulo}</div></div>)}
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
          {difCards.map(k => <div key={k.titulo} className="card p-6"><h3 className="font-display font-bold text-navy">{k.titulo} <span className="text-accent">{k.destaque}</span></h3><p className="text-sm text-slate-600 mt-2">{k.texto}</p></div>)}
        </div>
      </section>

      <section className="container-vt mt-10 grid md:grid-cols-2 gap-4 pb-4">
        <div className="hero-gradient rounded-2xl p-6 text-white"><h3 className="font-display font-bold text-lg">{cta.titulo}</h3><p className="text-sm text-white/80 mt-1">{cta.texto}</p><Link href="/contato" className="btn-whats mt-4">Compre pelo WhatsApp</Link></div>
        <div className="card p-6"><h3 className="font-display font-bold text-navy">Informações institucionais</h3><p className="text-sm text-slate-600 mt-1">{db.settings.endereco}. E-mail {db.settings.email}.</p><Link href="/quem-somos" className="underline text-sm mt-3 inline-block text-primary">Quem Somos</Link></div>
      </section>
    </div>
  );
}
