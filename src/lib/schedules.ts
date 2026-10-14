// Integração de horários em tempo real (API pública do site oficial).
// Somente leitura. Nenhum dado é inventado: o que aparece veio da API.

export interface Trecho {
  origem: string | null;
  destino: string | null;
  partida: string | null;  // "07:00"
  chegada: string | null;
}

export interface TripOption {
  partida: string;   // "07:00"
  chegada: string;   // "19:15"
  duracao: string;   // "12h15"
  classe: string;    // "CONVENCIONAL"
  assentos: number;
  preco: number | null;
  precoOriginal: number | null;
  origem: string;
  destino: string;
  pontoOrigem: string;  // rótulo curto do ponto (ex: "Terminal Rodoviário", "Coxipó")
  pontoDestino: string;
  conexao: boolean;  // true quando a API indica trecho com conexão/troca de ônibus
  trechos: Trecho[]; // percurso trecho a trecho até o destino final (quando informado)
}

// Candidatos oficiais (nomes exatos da API) por cidade simplificada.
const CANDIDATOS: Record<string, string[]> = {
  "BELO HORIZONTE - MG": ["BELO HORIZONTE - MG ( TERMINAL RODOVIARIO )"],
  "SAO JOSE DO RIO PRETO - SP": ["SAO JOSE DO RIO PRETO - SP ( TERMINAL RODOVIARIO )"],
  "CUIABA - MT": ["CUIABA - MT ( TERMINAL RODOVIARIO )", "CUIABA (COXIPO) - MT"],
  "CAMPO GRANDE - MS": ["CAMPO GRANDE - MS ( TERMINAL RODOVIARIO )", "CAMPO GRANDE - MS (SAGITARIUS)"],
  "BRASILIA - DF": ["BRASILIA - DF ( TERMINAL RODOVIARIO )"],
  "GOIANIA - GO": ["GOIANIA - GO ( TERMINAL RODOVIARIO )", "GOIANIA - GO (TERMINAL CAMPINAS)"],
  "SAO PAULO - SP": ["SAO PAULO-SP (TERMINAL RODOVIARIO BARRA FUNDA)"],
  "LONDRINA - PR": ["LONDRINA - PR ( TERMINAL RODOVIARIO )"],
  "RECIFE - PE": ["RECIFE - PE", "RECIFE (CAXANGA) - PE"],
  "JOAO PESSOA - PB": ["JOAO PESSOA - PB", "JOAO PESSOA (GAUCHINHA) - PB"],
};

export function norm(s: string): string {
  return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
}

export function candidatosOficiais(cidadeSimplificada: string): string[] {
  const key = norm(cidadeSimplificada);
  return CANDIDATOS[key] || [];
}

function fmtHora(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Rótulo curto do ponto a partir do nome oficial:
// "CAMPO GRANDE - MS (SAGITARIUS)" -> "Sagitarius"
// "CUIABA - MT ( TERMINAL RODOVIARIO )" -> "Terminal Rodoviário"
// "RECIFE - PE" -> "Ponto principal"
export function pontoDe(nomeOficial: string): string {
  const m = (nomeOficial || "").match(/\(([^)]+)\)/);
  if (m) {
    const p = m[1].trim().toLowerCase();
    if (p.includes("terminal rodoviario")) return "Terminal Rodoviário";
    return p.replace(/\b\w/g, c => c.toUpperCase());
  }
  return "Ponto principal";
}

// Extrai o percurso trecho a trecho de `routes[]` (viagens com conexão).
// Só usa campos efetivamente presentes — nunca inventa nomes ou horários.
export function extrairTrechos(t: any): Trecho[] {
  const legs = Array.isArray(t?.routes) ? t.routes : [];
  const out: Trecho[] = [];
  for (const leg of legs) {
    const o = leg?.departureLocationName ?? leg?.departureName ?? leg?.origin ?? null;
    const d = leg?.arrivalLocationName ?? leg?.arrivalName ?? leg?.destination ?? null;
    const dt = leg?.departureDateTime ?? leg?.departure ?? null;
    const at = leg?.arrivalDateTime ?? leg?.arrival ?? null;
    if (o || d) {
      out.push({
        origem: typeof o === "string" ? o : null,
        destino: typeof d === "string" ? d : null,
        partida: typeof dt === "string" ? fmtHora(dt) : null,
        chegada: typeof at === "string" ? fmtHora(at) : null,
      });
    }
  }
  return out;
}

export function shapeTrips(raw: any, dataISO: string): TripOption[] {
  const list: TripOption[] = [];
  for (const t of raw?.trips || []) {
    if (!t?.departureDateTime) continue;
    const conexao = t.tripKey?.tripType === 2 || Boolean(t.isConnection);
    const out: TripOption = {
      partida: fmtHora(t.departureDateTime),
      chegada: t.arrivalDateTime ? fmtHora(t.arrivalDateTime) : "--:--",
      duracao: t.duration
        ? `${t.duration.hours}h${String(t.duration.minutes).padStart(2, "0")}`.replace("h00", "h")
        : "--",
      classe: t.classOfServiceName || "Convencional",
      assentos: Number(t.availableSeats ?? 0),
      preco: typeof t.price === "number" ? t.price : null,
      precoOriginal: typeof t.originalPrice === "number" ? t.originalPrice : null,
      origem: t.departureLocationName || "",
      destino: t.arrivalLocationName || "",
      pontoOrigem: pontoDe(t.departureLocationName || ""),
      pontoDestino: pontoDe(t.arrivalLocationName || ""),
      conexao,
      trechos: extrairTrechos(t),
    };
    list.push(out);
  }
  // Remove partidas já passadas (somente para a data de hoje)
  const hoje = new Date().toISOString().slice(0, 10);
  const agora = new Date();
  const filtrados = dataISO === hoje
    ? list.filter(o => {
        const [h, m] = o.partida.split(":").map(Number);
        const d = new Date(); d.setHours(h, m, 0, 0);
        return d.getTime() > agora.getTime();
      })
    : list;
  return filtrados.sort((a, b) => a.partida.localeCompare(b.partida));
}

export function brl(v: number | null): string {
  if (v === null) return "a confirmar";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Busca de localidades: ignora acentos/maiúsculas, prioriza os pontos
// populares e depois prefixos; limita para não ofuscar a tela.
export function filtrarLocais(query: string, todas: string[], populares: string[], limite = 30): string[] {
  const q = norm(query);
  if (!q) return populares.filter(p => todas.includes(p));
  const starts: string[] = [];
  const contains: string[] = [];
  for (const n of todas) {
    const nn = norm(n);
    if (nn === q || nn.startsWith(q)) starts.push(n);
    else if (nn.includes(q)) contains.push(n);
    if (starts.length >= limite) break;
  }
  const popFirst = (a: string, b: string) => {
    const ia = populares.indexOf(a), ib = populares.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  };
  starts.sort(popFirst);
  contains.sort(popFirst);
  return [...starts, ...contains].slice(0, limite);
}
