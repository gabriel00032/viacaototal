import { NextResponse } from "next/server";
import { candidatosOficiais, shapeTrips, TripOption } from "@/lib/schedules";

const GATEWAY = "https://prod-motta-proxy-api-smartbus.smarttravelit.com";
const HEADERS = {
  "Content-Type": "application/json",
  "IdentifierWorkstation": "306C3125-CF50-40BA-AB8B-C2C2736E1629",
  "ProductId": "487a774c-0485-401f-84d2-61ed508becc3",
  "IdUser": "2514",
};

// GET /api/horarios?origem=Cuiabá - MT&destino=Campo Grande - MS&data=2026-10-20
// Retorna horários REAIS da API oficial. Sem fallback inventado.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const origem = url.searchParams.get("origem") || "";
  const destino = url.searchParams.get("destino") || "";
  const data = url.searchParams.get("data") || ""; // YYYY-MM-DD
  const token = process.env.VIAJETOTAL_API_TOKEN || "";

  const dep = candidatosOficiais(origem).slice(0, 2);
  const arr = candidatosOficiais(destino).slice(0, 2);
  if (!dep.length || !arr.length || !/^\d{4}-\d{2}-\d{2}$/.test(data))
    return NextResponse.json({ ok: false, error: "Origem, destino ou data inválidos.", trips: [] }, { status: 400 });
  if (!token)
    return NextResponse.json({ ok: false, error: "Consulta de horários indisponível no momento.", trips: [] }, { status: 503 });

  try {
    const pairs: [string, string][] = [];
    for (const d of dep) for (const a of arr) pairs.push([d, a]);
    const results = await Promise.all(pairs.slice(0, 4).map(async ([d, a]) => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);
      try {
        const r = await fetch(`${GATEWAY}/app/sale/trips`, {
          method: "POST",
          headers: { ...HEADERS, Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            departureLocationName: d, arrivalLocationName: a, isReturn: false,
            departureDate: `${data}T12:00:00`, promoCode: null, seats: 1,
            idBookingCouponRevalidation: null, returnDate: null,
            searchType: 2, discountType: null, isOpen: false,
            idPassengerType: 1, passengers: null,
          }),
          signal: ctrl.signal,
        });
        if (!r.ok) return [];
        return shapeTrips(await r.json(), data);
      } catch { return []; }
      finally { clearTimeout(timer); }
    }));
    const seen = new Set<string>();
    const trips: TripOption[] = [];
    for (const t of results.flat()) {
      const k = `${t.partida}|${t.origem}|${t.destino}`;
      if (!seen.has(k)) { seen.add(k); trips.push(t); }
    }
    trips.sort((a, b) => a.partida.localeCompare(b.partida));
    return NextResponse.json({ ok: true, trips });
  } catch {
    return NextResponse.json({ ok: false, error: "Falha ao consultar horários.", trips: [] }, { status: 502 });
  }
}
