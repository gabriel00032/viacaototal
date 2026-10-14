import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { candidatosOficiais, shapeTrips, TripOption } from "@/lib/schedules";

const GATEWAY = "https://prod-motta-proxy-api-smartbus.smarttravelit.com";

// Credenciais públicas de leitura (tokens dos próprios sites oficiais):
// Total e Motta — a busca consulta ambas e mescla as viagens.
const CREDS = [
  {
    token: process.env.VIAJETOTAL_API_TOKEN || "",
    workstation: "306C3125-CF50-40BA-AB8B-C2C2736E1629",
    idUser: "2514",
  },
  {
    token: process.env.VIAJETOTAL_API_TOKEN_MOTTA || "",
    workstation: "C1DBA2D5-A6EC-43C4-9ED2-CD5AD765C798",
    idUser: "1302",
  },
];

function nomesOficiais(): Set<string> {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "data", "locations-official.json"), "utf-8");
    return new Set((JSON.parse(raw).locations as { name: string }[]).map(l => l.name));
  } catch { return new Set(); }
}

// Resolve o valor do select: se já é nome oficial, usa direto;
// senão, mapeia a cidade simplificada para os pontos oficiais.
function resolver(valor: string, oficiais: Set<string>): string[] {
  if (oficiais.has(valor)) return [valor];
  return candidatosOficiais(valor).slice(0, 2);
}

// GET /api/horarios?origem=&destino=&data=YYYY-MM-DD&pax=1
// Retorna horários REAIS da API oficial. Sem fallback inventado.
// O corpo replica o contrato do site oficial (passengers é obrigatório:
// com null a API retorna menos viagens ou nenhuma).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const origem = url.searchParams.get("origem") || "";
  const destino = url.searchParams.get("destino") || "";
  const data = url.searchParams.get("data") || ""; // YYYY-MM-DD
  const pax = Math.min(10, Math.max(1, Number(url.searchParams.get("pax")) || 1));
  const oficiais = nomesOficiais();

  const dep = resolver(origem, oficiais);
  const arr = resolver(destino, oficiais);
  if (!dep.length || !arr.length || !/^\d{4}-\d{2}-\d{2}$/.test(data))
    return NextResponse.json({ ok: false, error: "Origem, destino ou data inválidos.", trips: [] }, { status: 400 });
  const ativas = CREDS.filter(c => c.token);
  if (!ativas.length)
    return NextResponse.json({ ok: false, error: "Consulta de horários indisponível no momento.", trips: [] }, { status: 503 });

  try {
    const jobs: { d: string; a: string; c: (typeof CREDS)[number] }[] = [];
    for (const d of dep) for (const a of arr) for (const c of ativas) jobs.push({ d, a, c });
    const results = await Promise.all(jobs.slice(0, 8).map(async ({ d, a, c }) => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);
      try {
        const r = await fetch(`${GATEWAY}/app/sale/trips`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${c.token}`,
            IdentifierWorkstation: c.workstation,
            ProductId: "487a774c-0485-401f-84d2-61ed508becc3",
            IdUser: c.idUser,
          },
          body: JSON.stringify({
            departureLocationName: d, arrivalLocationName: a, isReturn: false,
            departureDate: `${data}T12:00:00`, promoCode: null, seats: pax,
            idBookingCouponRevalidation: null, returnDate: null,
            searchType: 2, discountType: null, isOpen: false,
            idPassengerType: 1,
            passengers: [{ idPassengerClassification: 1, quantity: pax }],
          }),
          signal: ctrl.signal,
        });
        if (!r.ok) return [];
        const batch = shapeTrips(await r.json(), data);
        batch.forEach(t => { t.cred = (c.workstation.startsWith("C1DBA") ? "motta" : "total") as "total" | "motta"; });
        return batch;
      } catch { return []; }
      finally { clearTimeout(timer); }
    }));
    // Deduplica por partida + pontos + classe + empresa (o mesmo horário pode
    // ter EXECUTIVO, LEITO etc. e ser operado por empresas diferentes).
    const seen = new Set<string>();
    const trips: TripOption[] = [];
    for (const t of results.flat()) {
      const k = `${t.partida}|${t.origem}|${t.destino}|${t.classe}|${t.preco}|${t.empresa}`;
      if (!seen.has(k)) { seen.add(k); trips.push(t); }
    }
    trips.sort((a, b) => a.partida.localeCompare(b.partida) || a.classe.localeCompare(b.classe));
    return NextResponse.json({ ok: true, trips });
  } catch {
    return NextResponse.json({ ok: false, error: "Falha ao consultar horários.", trips: [] }, { status: 502 });
  }
}
