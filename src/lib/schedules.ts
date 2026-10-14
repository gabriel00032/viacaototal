// Integração de horários em tempo real (API pública do site oficial).
// Somente leitura. Nenhum dado é inventado: o que aparece veio da API.

export interface Trecho {
  origem: string | null;
  destino: string | null;
  partida: string | null;  // "07:00"
  chegada: string | null;
  linha: string | null;    // ex: "CAMPO GRANDE(MS) - SAO PAULO(SP)"
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
  plataforma: string | null; // ex: "03 à 06" (boardingPlatform da API)
  empresa: string | null;    // ex: "VIACAO TOTAL" (companyName da API)
  diasDepois: number;        // 0 = chega no mesmo dia; 1+ = chega dia(s) depois
  partiu: boolean;           // true quando a partida já ocorreu (exibida desabilitada)
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

// Horário a partir de string ISO ou do objeto {hour, minute} da API
// (usa os campos de parede hour/minute, sem conversão de fuso).
export function horaDe(v: any): string | null {
  if (typeof v === "string") {
    const d = new Date(v);
    if (isNaN(d.getTime())) return null;
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  if (v && typeof v.hour === "number" && typeof v.minute === "number")
    return `${String(v.hour).padStart(2, "0")}:${String(v.minute).padStart(2, "0")}`;
  return null;
}

function fmtHora(iso: string): string {
  return horaDe(iso) || "--:--";
}

// Nome curto (cidade) para o percurso: "RONDONOPOLIS - MT ( TERMINAL RODOVIARIO )"
// -> "Rondonopolis"; "SAO PAULO-SP (TERMINAL RODOVIARIO BARRA FUNDA)" -> "Sao Paulo".
export function curto(nome: string | null): string {
  if (!nome) return "?";
  let base = nome.split(" (")[0].split(" - ")[0].trim().replace(/-[A-Z]{2}$/, "");
  base = base.toLowerCase().replace(/(?:^|\s)\S/g, c => c.toUpperCase());
  return base || "?";
}

// Linha de percurso encadeada: "Rondonopolis (11:05) → Campo Grande (19:15) → São Paulo (12:35)"
export function linhaPercurso(trechos: Trecho[]): string {
  if (!trechos.length) return "";
  const partes: string[] = [];
  const first = trechos[0];
  partes.push(`${curto(first.origem)}${first.partida ? ` (${first.partida})` : ""}`);
  for (const s of trechos)
    partes.push(`${curto(s.destino)}${s.chegada ? ` (${s.chegada})` : ""}`);
  return partes.join(" → ");
}
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
    const dt = horaDe(leg?.departureDateTime ?? leg?.departure ?? null);
    const at = horaDe(leg?.arrivalDateTime ?? leg?.arrival ?? null);
    const linha = typeof leg?.scheduleName === "string" ? leg.scheduleName.trim() || null : null;
    if (o || d) {
      out.push({
        origem: typeof o === "string" ? o : null,
        destino: typeof d === "string" ? d : null,
        partida: dt,
        chegada: at,
        linha,
      });
    }
  }
  return out;
}

export function shapeTrips(raw: any, dataISO: string): TripOption[] {
  const list: TripOption[] = [];
  const hoje = new Date().toISOString().slice(0, 10);
  const agora = new Date();
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
      plataforma: typeof t.boardingPlatform === "string" && t.boardingPlatform.trim() ? t.boardingPlatform.trim() : null,
      empresa: typeof t.companyName === "string" && t.companyName.trim() ? t.companyName.trim() : null,
      diasDepois: Number(t.departureArrivalDiffDays ?? 0) || 0,
      partiu: false,
    };
    if (dataISO === hoje) {
      const [h, m] = out.partida.split(":").map(Number);
      const d = new Date(); d.setHours(h, m, 0, 0);
      out.partiu = d.getTime() <= agora.getTime();
    }
    list.push(out);
  }
  // Partidas de hoje já ocorridas são mantidas com flag `partiu` (exibidas
  // desabilitadas, como referência) — nunca vendidas pelo WhatsApp.
  return list.sort((a, b) => a.partida.localeCompare(b.partida));
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
