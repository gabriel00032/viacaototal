import fs from "fs";
import path from "path";

// Banco em JSON (dev/local). Para produção, migrar para PostgreSQL
// usando prisma/schema.prisma (mesmos campos/entidades).
export interface FeaturedTrip {
  id: string; origem: string; destino: string;
  preco?: string; imagem?: string; ativo: boolean; posicao: number;
  fonte: string; validadoEm: string;
}
export interface Destination { id: string; cidade: string; uf: string; ativo: boolean; fonte: string; }
export interface Schedule {
  id: string; origem: string; destino: string; partida: string;
  dias: string; validade?: string; status: "confirmado" | "pendente" | "inativo";
  obs?: string; atualizadoEm: string;
}
export interface Settings {
  salesWhatsapp: string; sac: string; email: string;
  atendimento: string; endereco: string;
}
export interface MiniDif { icone: string; titulo: string; }
export interface DifCard { titulo: string; destaque: string; texto: string; }
export interface Ponto { nome: string; endereco: string; horario: string; telefone: string; mapa: string; }
export interface Faq { q: string; a: string; }
export interface DB {
  featured: FeaturedTrip[]; destinations: Destination[];
  schedules: Schedule[]; settings: Settings; clicks: { rota: string; total: number }[];
  hero: { eyebrow: string; tituloA: string; tituloDestaque: string; tituloB: string; subtitulo: string };
  minis: MiniDif[];
  difCards: DifCard[];
  cta: { titulo: string; texto: string };
  pontos: Ponto[];
  quemSomos: { texto: string };
  faqs: Faq[];
}

const file = path.join(process.cwd(), "data", "db.json");

const DEFAULTS: Pick<DB, "hero" | "minis" | "difCards" | "cta" | "pontos" | "quemSomos" | "faqs"> = {
  hero: {
    eyebrow: "TELEVENDAS AUTORIZADO · VIAÇÃO TOTAL",
    tituloA: "Sua viagem com a",
    tituloDestaque: "Viação Total",
    tituloB: ", reservada em minutos.",
    subtitulo: "Escolha a origem, o destino e a data. Atendimento direto pelo WhatsApp, sem pagamento online.",
  },
  minis: [
    { icone: "💰", titulo: "Custo Benefício" },
    { icone: "📱", titulo: "Embarque Digital" },
    { icone: "🛡️", titulo: "100% Seguro" },
    { icone: "🔄", titulo: "Remarcação Fácil" },
    { icone: "🧼", titulo: "Ônibus Sanitizado" },
  ],
  difCards: [
    { titulo: "Conforto e", destaque: "Segurança", texto: "Viagens com foco em conforto, segurança e bons profissionais — conforme comunicação institucional oficial." },
    { titulo: "Qualidade nos serviços", destaque: "e bons profissionais", texto: "Atendimento comercial das 08h às 18h (seg–sex) e SAC 24h: 0800 085 8080." },
  ],
  cta: { titulo: "Atendimento pelo WhatsApp", texto: "Você pesquisa, escolhe e fala com um vendedor. Simples assim." },
  pontos: [
    { nome: "Matriz — Bayeux/PB (endereço institucional, confirmar se é guichê)", endereco: "Rua Santa Clara, Nº 1007, Sala 01, Mário Andreazza, Bayeux - PB, CEP 58.309-614", horario: "A confirmar", telefone: "SAC 0800 085 8080", mapa: "https://www.google.com/maps/search/?api=1&query=Rua+Santa+Clara+1007+Bayeux+PB" },
  ],
  quemSomos: { texto: "A Viação Total opera passagens de ônibus com foco em custo-benefício, embarque digital e atendimento comercial pelo WhatsApp. Textos institucionais completos (história, missão, frota) devem ser publicados a partir de material oficial aprovado pela empresa — nenhum dado foi inventado aqui." },
  faqs: [
    { q: "Como compro pelo WhatsApp?", a: "Pesquise a viagem no site, clique em Consultar e envie a mensagem pronta no WhatsApp. Um vendedor confirma disponibilidade, valor e condições." },
    { q: "Horários de guichês?", a: "Variam por ponto de venda. Consulte a página Horários ou fale com o comercial — não publicamos horários não confirmados." },
    { q: "Transporte de animais?", a: "Siga as regras oficiais da empresa e da ANTT. Confirme condições com a equipe comercial antes da viagem." },
    { q: "Remarcação e reembolso?", a: "Conforme regras da tarifa e legislação. Solicite pelo canal oficial; não garantimos condições sem confirmação." },
    { q: "Aluguel de ônibus?", a: "Solicite proposta pelo WhatsApp comercial informando data, trecho e número de passageiros." },
  ],
};

export function loadDB(): DB {
  const raw = fs.readFileSync(file, "utf-8").replace(/^\uFEFF/, "");
  return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<DB>) } as DB;
}

export function saveDB(db: DB) {
  fs.writeFileSync(file, JSON.stringify(db, null, 2), "utf-8");
}
