import { NextResponse } from "next/server";
import { mergeMapa } from "@/lib/schedules";

const GATEWAY = "https://prod-motta-proxy-api-smartbus.smarttravelit.com";
const CREDS: Record<string, { token: string; workstation: string; idUser: string }> = {
  total: {
    token: process.env.VIAJETOTAL_API_TOKEN || "",
    workstation: "306C3125-CF50-40BA-AB8B-C2C2736E1629",
    idUser: "2514",
  },
  motta: {
    token: process.env.VIAJETOTAL_API_TOKEN_MOTTA || "",
    workstation: "C1DBA2D5-A6EC-43C4-9ED2-CD5AD765C798",
    idUser: "1302",
  },
};

// GET /api/poltronas?rota=&parceiro=&veiculo=&cred=total
// Mapa de poltronas ao vivo (layout + ocupação). Somente leitura.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const rota = Number(url.searchParams.get("rota")) || 0;
  const parceiro = Number(url.searchParams.get("parceiro")) || 0;
  const veiculo = Number(url.searchParams.get("veiculo")) || 0;
  const cred = CREDS[url.searchParams.get("cred") || ""] || CREDS.total;
  if (!rota || !veiculo || !cred.token)
    return NextResponse.json({ ok: false, error: "Parâmetros inválidos.", rows: [] }, { status: 400 });
  const H = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cred.token}`,
    IdentifierWorkstation: cred.workstation,
    ProductId: "487a774c-0485-401f-84d2-61ed508becc3",
    IdUser: cred.idUser,
  };
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const [lay, occ] = await Promise.all([
        fetch(`${GATEWAY}/app/schedule/vehicle/configuration`, {
          method: "POST", headers: H, body: JSON.stringify({ id: veiculo }), signal: ctrl.signal,
        }).then(r => (r.ok ? r.json() : null)),
        fetch(`${GATEWAY}/app/sale/seats/map`, {
          method: "POST", headers: H,
          body: JSON.stringify({ IdDailyScheduleRoute: rota, IdPartnerDailyScheduleRoute: parceiro, IdPassengerType: 1, IdPassengerTypeConfiguration: 1, IdSeatMapCellSelecteds: [] }),
          signal: ctrl.signal,
        }).then(r => (r.ok ? r.json() : null)),
      ]);
      if (!lay) return NextResponse.json({ ok: false, error: "Mapa indisponível.", rows: [] }, { status: 502 });
      return NextResponse.json({ ok: true, rows: mergeMapa(lay, occ), nome: lay?.vehicleConfiguration?.name || null });
    } finally { clearTimeout(timer); }
  } catch {
    return NextResponse.json({ ok: false, error: "Falha ao carregar poltronas.", rows: [] }, { status: 502 });
  }
}
