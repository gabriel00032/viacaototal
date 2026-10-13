import Link from "next/link";
import { loadDB } from "@/lib/store";

export default function Footer() {
  let s;
  try { s = loadDB().settings; } catch {
    s = { endereco: "Rua Santa Clara, Nº 1007, Sala 01, Mário Andreazza, Bayeux - PB, CEP 58.309-614", sac: "0800 085 8080", email: "sac@viajetotal.com.br", atendimento: "SAC 24h | Comercial 08h às 18h, segunda a sexta" };
  }
  const wa = (s as any).salesWhatsapp as string | undefined;
  return (
    <footer className="bg-navy text-white mt-12">
      <div className="container-vt py-10 grid gap-8 md:grid-cols-4 text-sm">
        <div>
          <p className="font-display text-lg font-extrabold">VIAÇÃO <span className="text-accent">TOTAL</span></p>
          <p className="mt-1 text-white/70 text-xs">Televendas autorizado Viação Total</p>
          <p className="mt-3 text-white/80">{s.endereco}.</p>
          {wa
            ? <a className="btn-whats !py-2 !px-4 text-sm mt-4" target="_blank" href={`https://wa.me/${wa.replace(/\D/g, "")}`}>WhatsApp comercial</a>
            : <Link href="/contato" className="btn-whats !py-2 !px-4 text-sm mt-4">WhatsApp comercial</Link>}
        </div>
        <nav aria-label="Institucional">
          <h3 className="font-bold mb-2">INSTITUCIONAL</h3>
          <ul className="space-y-1 text-white/80">
            <li><Link href="/quem-somos">Quem Somos</Link></li>
            <li><Link href="/contato">Contato</Link></li>
            <li><Link href="/duvidas-frequentes">Dúvidas frequentes</Link></li>
            <li><Link href="/contato">Trabalhe conosco</Link></li>
            <li><Link href="/duvidas-frequentes">Lei 14.611/2023</Link></li>
          </ul>
        </nav>
        <nav aria-label="Serviços">
          <h3 className="font-bold mb-2">SERVIÇOS</h3>
          <ul className="space-y-1 text-white/80">
            <li><Link href="/destinos">Destinos</Link></li>
            <li><Link href="/horarios">Horários de guichês</Link></li>
            <li><Link href="/contato">Compre pelo WhatsApp</Link></li>
            <li><Link href="/pontos-de-venda">Pontos de venda</Link></li>
          </ul>
        </nav>
        <div>
          <h3 className="font-bold mb-2">SAC (ATENDIMENTO AO CONSUMIDOR)</h3>
          <p className="text-white/80">{s.sac}</p>
          <p className="text-white/80">Atendimento 24h</p>
          <p className="text-white/80">{s.email}</p>
          <p className="mt-2 text-white/80">Horário de atendimento: {s.atendimento}.</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-vt py-4 flex flex-col sm:flex-row justify-between text-xs text-white/60">
          <span>© 2026 Viação Total — dados operacionais sujeitos a confirmação comercial.</span>
          <span>Fonte prioritária: viajetotal.com.br</span>
        </div>
      </div>
    </footer>
  );
}
