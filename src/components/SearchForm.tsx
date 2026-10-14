"use client";
import { useState } from "react";
import { validateSearch, validateEncomenda, buildWhatsMessage, buildEncomendaMessage, whatsappLink } from "@/lib/trip";
import { TripOption, brl } from "@/lib/schedules";
import LocalitySelect from "@/components/LocalitySelect";

export default function SearchForm({ locais, whatsapp }: { locais: string[]; whatsapp: string }) {
  const origens = locais, destinos = locais;
  const [tab, setTab] = useState<"passagem" | "encomenda">("passagem");
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [dataIda, setDataIda] = useState("");
  const [passageiros, setPassageiros] = useState(1);
  const [descricao, setDescricao] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [link, setLink] = useState<string | null>(null);
  // Etapa 2: horários reais
  const [trips, setTrips] = useState<TripOption[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [tripsError, setTripsError] = useState("");

  function resetTrips() { setTrips(null); setTripsError(""); setLink(null); }

  async function buscarHorarios(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateSearch({ origem, destino, dataIda, passageiros, tipo: "ida" });
    setErrors(errs);
    if (errs.length) { resetTrips(); return; }
    setLoading(true); setTripsError(""); setLink(null);
    try {
      const r = await fetch(`/api/horarios?origem=${encodeURIComponent(origem)}&destino=${encodeURIComponent(destino)}&data=${dataIda}&pax=${passageiros}`);
      const j = await r.json();
      setTrips(j.trips || []);
      if (!j.ok && !(j.trips || []).length) setTripsError(j.error || "Não foi possível consultar os horários.");
    } catch {
      setTrips(null); setTripsError("Não foi possível consultar os horários. Tente de novo ou fale no WhatsApp.");
    } finally { setLoading(false); }
  }

  function escolherHorario(t: TripOption) {
    const percurso = t.trechos.length
      ? t.trechos.map((s, i) =>
          `Trecho ${i + 1}: ${s.origem || "?"}${s.partida ? ` (${s.partida})` : ""} → ${s.destino || "?"}${s.chegada ? ` (${s.chegada})` : ""}`
        ).join("\n")
      : null;
    const detalhes = [
      `Horário: ${t.partida} (chegada prevista ${t.chegada}, ${t.classe})`,
      `Embarque: ${t.origem}`,
      `Desembarque: ${t.destino}`,
      ...(t.conexao ? ["Viagem COM CONEXÃO (troca de ônibus no trajeto)"] : []),
      ...(percurso ? [`Percurso até o destino final:\n${percurso}`] : []),
      ...(t.preco !== null ? [`Valor visto no site: ${brl(t.preco)} (sujeito a confirmação)`] : []),
    ];
    const msg = buildWhatsMessage({ origem, destino, dataIda, horario: t.partida, passageiros, tipo: "ida", detalhes });
    const url = whatsappLink(whatsapp, msg);
    setLink(url);
    if (url) {
      fetch("/api/metrics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rota: `${origem} → ${destino} ${t.partida}` }) }).catch(() => {});
      window.open(url, "_blank");
    }
  }

  function orcamentoEncomenda(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateEncomenda({ origem, destino, data: dataIda, descricao });
    setErrors(errs);
    if (errs.length) { setLink(null); return; }
    const url = whatsappLink(whatsapp, buildEncomendaMessage({ origem, destino, data: dataIda, descricao }));
    setLink(url);
    if (url) window.open(url, "_blank");
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-4 sm:p-6 text-slate-800">
      <div className="flex gap-2 mb-4" role="tablist" aria-label="Tipo de atendimento">
        {(["passagem", "encomenda"] as const).map(t => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => { setTab(t); setErrors([]); resetTrips(); }}
            className={`flex-1 rounded-lg px-4 py-2.5 font-display font-bold text-sm capitalize transition ${tab === t ? "tab-active" : "tab-idle"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "passagem" ? (
        <>
          <form onSubmit={buscarHorarios} className="grid gap-4 md:grid-cols-4" aria-label="Consultar passagens">
            <LocalitySelect id="origem" label="Origem" value={origem} locais={origens} onChange={v => { setOrigem(v); resetTrips(); }} />
            <LocalitySelect id="destino" label="Destino" value={destino} locais={destinos} onChange={v => { setDestino(v); resetTrips(); }} />
            <div><label className="label" htmlFor="data">Data</label>
              <input id="data" type="date" className="input mt-1" value={dataIda} onChange={e => { setDataIda(e.target.value); resetTrips(); }} /></div>
            <div><label className="label" htmlFor="pax">Passageiros</label>
              <input id="pax" type="number" min={1} max={10} className="input mt-1" value={passageiros} onChange={e => setPassageiros(Number(e.target.value))} /></div>
            <div className="md:col-span-4">
              <button type="submit" className="btn-whats w-full justify-center !py-3" disabled={loading}>
                {loading ? "Buscando horários…" : "🔍 Buscar horários"}
              </button></div>
          </form>

          {errors.length > 0 && (
            <ul className="mt-3 text-red-700 text-sm bg-red-50 border border-red-200 rounded p-3" role="alert">
              {errors.map(e => <li key={e}>• {e}</li>)}
            </ul>
          )}

          {trips !== null && trips.length > 0 && (
            <div className="mt-4" aria-live="polite">
              <p className="font-display font-bold text-navy text-sm mb-2">Horários disponíveis — escolha um para ir ao WhatsApp:</p>
              <div className="grid gap-2">
                {trips.map(t => (
                  <button key={`${t.partida}-${t.origem}-${t.classe}-${t.preco}`} onClick={() => escolherHorario(t)}
                    className="w-full flex items-center justify-between gap-3 border border-slate-200 rounded-xl px-4 py-3 hover:border-whatsapp hover:shadow text-left transition">
                    <span>
                      <span className="block font-display font-extrabold text-navy text-lg">{t.partida} <span className="text-slate-400 font-semibold text-sm">→ {t.chegada}</span>
                        {t.conexao && <span className="ml-2 align-middle text-[11px] font-bold bg-accent text-white rounded px-2 py-0.5">COM CONEXÃO</span>}</span>
                      <span className="block text-xs text-slate-500">{t.pontoOrigem} → {t.pontoDestino} · {t.classe} · {t.duracao} · {t.assentos} assentos · {brl(t.preco)}</span>
                      {t.conexao && (
                        <span className="block text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-1">
                          {t.trechos.length
                            ? `Percurso: ${t.trechos.map(s => [s.origem && s.partida ? `${s.origem} (${s.partida})` : s.origem, s.destino && s.chegada ? `${s.destino} (${s.chegada})` : s.destino].filter(Boolean).join(" → ")).join(" → ")}`
                            : `Com conexão até ${t.destino} — confirme os trechos e horários no WhatsApp`}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 bg-whatsapp text-white rounded-lg px-4 py-2 text-sm font-bold">Selecionar</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {trips !== null && trips.length === 0 && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm" aria-live="polite">
              <p><strong>Nenhum horário encontrado</strong> para {origem} → {destino} nesta data.</p>
              <GenericWhats origem={origem} destino={destino} dataIda={dataIda} passageiros={passageiros} whatsapp={whatsapp} setLink={setLink} />
            </div>
          )}
          {tripsError && trips === null && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
              <p>{tripsError}</p>
              <GenericWhats origem={origem} destino={destino} dataIda={dataIda} passageiros={passageiros} whatsapp={whatsapp} setLink={setLink} />
            </div>
          )}
        </>
      ) : (
        <form onSubmit={orcamentoEncomenda} className="grid gap-4 md:grid-cols-4" aria-label="Orçamento de encomenda">
          <LocalitySelect id="origem2" label="Origem" value={origem} locais={origens} onChange={setOrigem} />
          <LocalitySelect id="destino2" label="Destino" value={destino} locais={destinos} onChange={setDestino} />
          <div><label className="label" htmlFor="data2">Data de envio</label>
            <input id="data2" type="date" className="input mt-1" value={dataIda} onChange={e => setDataIda(e.target.value)} /></div>
          <div><label className="label" htmlFor="desc">Conteúdo (opcional)</label>
            <input id="desc" className="input mt-1" placeholder="O que vai enviar?" value={descricao} onChange={e => setDescricao(e.target.value)} /></div>
          <div className="md:col-span-4">
            <button type="submit" className="btn-whats w-full justify-center !py-3">Orçar encomenda no WhatsApp</button></div>
          {errors.length > 0 && (
            <ul className="md:col-span-4 text-red-700 text-sm bg-red-50 border border-red-200 rounded p-3" role="alert">
              {errors.map(e => <li key={e}>• {e}</li>)}
            </ul>
          )}
        </form>
      )}

      {!whatsapp && <p className="mt-3 text-amber-700 text-sm">WhatsApp comercial ainda não configurado. Consulte o atendimento pelo SAC 0800 085 8080.</p>}
      {link && <p className="mt-3 text-green-700 text-sm">Abrindo o WhatsApp com sua mensagem pronta. Se não abrir, <a className="underline" href={link} target="_blank">clique aqui</a>.</p>}
    </div>
  );
}

function GenericWhats({ origem, destino, dataIda, passageiros, whatsapp, setLink }: any) {
  if (!whatsapp) return <p className="mt-2">Fale com a equipe comercial pelo SAC 0800 085 8080.</p>;
  const msg = buildWhatsMessage({ origem, destino, dataIda, passageiros, tipo: "ida" });
  const url = whatsappLink(whatsapp, msg);
  if (!url) return null;
  return (
    <a className="btn-whats mt-3 !py-2 !px-4 text-sm" target="_blank" href={url}
      onClick={() => { setLink(url); fetch("/api/metrics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rota: `${origem} → ${destino}` }) }).catch(() => {}); }}>
      Consultar esta rota no WhatsApp
    </a>
  );
}
