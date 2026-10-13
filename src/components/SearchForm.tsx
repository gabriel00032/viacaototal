"use client";
import { useState } from "react";
import { validateSearch, validateEncomenda, buildWhatsMessage, buildEncomendaMessage, whatsappLink } from "@/lib/trip";

export default function SearchForm({ origens, destinos, whatsapp }: { origens: string[]; destinos: string[]; whatsapp: string }) {
  const [tab, setTab] = useState<"passagem" | "encomenda">("passagem");
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [dataIda, setDataIda] = useState("");
  const [horario, setHorario] = useState("");
  const [passageiros, setPassageiros] = useState(1);
  const [descricao, setDescricao] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [link, setLink] = useState<string | null>(null);

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    let msg: string;
    if (tab === "passagem") {
      const errs = validateSearch({ origem, destino, dataIda, horario, passageiros, tipo: "ida" });
      setErrors(errs);
      if (errs.length) { setLink(null); return; }
      msg = buildWhatsMessage({ origem, destino, dataIda, horario, passageiros, tipo: "ida" });
    } else {
      const errs = validateEncomenda({ origem, destino, data: dataIda, descricao });
      setErrors(errs);
      if (errs.length) { setLink(null); return; }
      msg = buildEncomendaMessage({ origem, destino, data: dataIda, descricao });
    }
    const url = whatsappLink(whatsapp, msg);
    setLink(url);
    if (url) {
      fetch("/api/metrics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rota: `${origem} → ${destino}` }) }).catch(() => {});
      window.open(url, "_blank");
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-4 sm:p-6 text-slate-800">
      <div className="flex gap-2 mb-4" role="tablist" aria-label="Tipo de atendimento">
        {(["passagem", "encomenda"] as const).map(t => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => { setTab(t); setErrors([]); setLink(null); }}
            className={`flex-1 rounded-lg px-4 py-2.5 font-display font-bold text-sm capitalize transition ${tab === t ? "tab-active" : "tab-idle"}`}>
            {t}
          </button>
        ))}
      </div>
      <form onSubmit={buscar} className="grid gap-4 md:grid-cols-4" aria-label={tab === "passagem" ? "Consultar passagens" : "Orçamento de encomenda"}>
        <div className="md:col-span-1">
          <label className="label" htmlFor="origem">Origem</label>
          <select id="origem" className="input mt-1" value={origem} onChange={e => setOrigem(e.target.value)}>
            <option value="">Selecione</option>
            {origens.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="md:col-span-1">
          <label className="label" htmlFor="destino">Destino</label>
          <select id="destino" className="input mt-1" value={destino} onChange={e => setDestino(e.target.value)}>
            <option value="">Selecione</option>
            {destinos.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="md:col-span-1">
          <label className="label" htmlFor="data">{tab === "passagem" ? "Data" : "Data de envio"}</label>
          <input id="data" type="date" className="input mt-1" value={dataIda} onChange={e => setDataIda(e.target.value)} />
        </div>
        {tab === "passagem" ? (
          <div className="md:col-span-1">
            <label className="label" htmlFor="hor">Horário (opcional)</label>
            <input id="hor" className="input mt-1" placeholder="Ex: 08:00" value={horario} onChange={e => setHorario(e.target.value)} />
          </div>
        ) : (
          <div className="md:col-span-1">
            <label className="label" htmlFor="desc">Conteúdo (opcional)</label>
            <input id="desc" className="input mt-1" placeholder="O que vai enviar?" value={descricao} onChange={e => setDescricao(e.target.value)} />
          </div>
        )}
        {tab === "passagem" && (
          <div className="md:col-span-1">
            <label className="label" htmlFor="pax">Passageiros</label>
            <input id="pax" type="number" min={1} max={10} className="input mt-1" value={passageiros} onChange={e => setPassageiros(Number(e.target.value))} />
          </div>
        )}
        <div className={`flex items-end ${tab === "passagem" ? "md:col-span-3" : "md:col-span-4"}`}>
          <button type="submit" className="btn-whats w-full justify-center !py-3">
            {tab === "passagem" ? "Consultar passagem no WhatsApp" : "Orçar encomenda no WhatsApp"}
          </button>
        </div>
        {errors.length > 0 && (
          <ul className="md:col-span-4 text-red-700 text-sm bg-red-50 border border-red-200 rounded p-3" role="alert">
            {errors.map(e => <li key={e}>• {e}</li>)}
          </ul>
        )}
        {!whatsapp && <p className="md:col-span-4 text-amber-700 text-sm">WhatsApp comercial ainda não configurado. Consulte o atendimento pelo SAC 0800 085 8080.</p>}
        {link && <p className="md:col-span-4 text-green-700 text-sm">Abrindo o WhatsApp com sua mensagem pronta. Se não abrir, <a className="underline" href={link} target="_blank">clique aqui</a>.</p>}
      </form>
    </div>
  );
}
