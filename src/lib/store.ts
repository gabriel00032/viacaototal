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
export interface DB {
  featured: FeaturedTrip[]; destinations: Destination[];
  schedules: Schedule[]; settings: Settings; clicks: { rota: string; total: number }[];
}

const file = path.join(process.cwd(), "data", "db.json");

export function loadDB(): DB {
  const raw = fs.readFileSync(file, "utf-8").replace(/^\uFEFF/, "");
  return JSON.parse(raw) as DB;
}

export function saveDB(db: DB) {
  fs.writeFileSync(file, JSON.stringify(db, null, 2), "utf-8");
}
