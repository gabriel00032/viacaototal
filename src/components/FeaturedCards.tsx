"use client";
import { buildWhatsMessage, whatsappLink } from "@/lib/trip";

export interface CardTrip { origem: string; destino: string; preco?: string; }

// Lista de linhas no padrão "Principais linhas": botão por rota
// "Origem → Destino · A partir de R$ X · Consulte horários".
// Não exibe contagem de horários/dia (dado não publicado) — sem dados inventados.
export default function FeaturedCards({ trips, whatsapp, dataIda }: { trips: CardTrip[]; whatsapp: string; dataIda?: string }) {
  return (
    <div className="grid gap-3">
      {trips.map(t => {
        const msg = buildWhatsMessage({ origem: t.origem, destino: t.destino, dataIda: dataIda || new Date().toISOString().slice(0, 10), tipo: "ida" });
        const url = whatsappLink(whatsapp, msg);
        const inner = (
          <>
            <span className="text-left">
              <span className="block font-display font-bold text-navy">{t.origem} <span className="text-accent">→</span> {t.destino}</span>
              <span className="block text-xs text-slate-500 mt-0.5">Consulte horários · {t.preco ? `a partir de ${t.preco}` : "valor a confirmar"}</span>
            </span>
            <span className={`shrink-0 rounded-lg px-4 py-2 text-sm font-bold ${url ? "bg-whatsapp text-white" : "bg-slate-100 text-slate-500"}`}>
              {url ? "Consultar" : "Em configuração"}
            </span>
          </>
        );
        const cls = "w-full flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3.5 shadow-sm hover:shadow-card hover:border-primary transition text-left";
        return url ? (
          <a key={`${t.origem}-${t.destino}`} className={cls} target="_blank" href={url}
            onClick={() => fetch("/api/metrics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rota: `${t.origem} → ${t.destino}` }) }).catch(() => {})}>{inner}</a>
        ) : (
          <div key={`${t.origem}-${t.destino}`} className={cls}>{inner}</div>
        );
      })}
    </div>
  );
}
