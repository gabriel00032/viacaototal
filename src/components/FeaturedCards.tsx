"use client";
import { buildWhatsMessage, whatsappLink } from "@/lib/trip";

export interface CardTrip { origem: string; destino: string; preco?: string; }

export default function FeaturedCards({ trips, whatsapp, dataIda }: { trips: CardTrip[]; whatsapp: string; dataIda?: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map(t => {
        const msg = buildWhatsMessage({ origem: t.origem, destino: t.destino, dataIda: dataIda || new Date().toISOString().slice(0, 10), tipo: "ida" });
        const url = whatsappLink(whatsapp, msg);
        return (
          <article key={`${t.origem}-${t.destino}`} className="card">
            <div className="h-36 bg-gradient-to-br from-total-blue to-sky-600 flex flex-col justify-end p-4 text-white">
              <span className="text-xs uppercase opacity-80">De {t.origem} para</span>
              <strong className="text-xl">{t.destino}</strong>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="bg-total-orange text-white text-sm font-bold px-3 py-1 rounded">
                {t.preco ? `A partir de ${t.preco}` : "Consulte o valor"}
              </span>
              {url
                ? <a className="btn-whats !py-2 !px-3 text-sm" target="_blank" href={url} onClick={() => fetch("/api/metrics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rota: `${t.origem} → ${t.destino}` }) }).catch(() => {})}>Consultar</a>
                : <span className="text-xs text-slate-500">WhatsApp em configuração</span>}
            </div>
          </article>
        );
      })}
    </div>
  );
}
