"use client";
import { useState } from "react";
import { validateSearch, buildWhatsMessage, whatsappLink } from "@/lib/trip";

export default function SearchForm({ origens, destinos, whatsapp }: { origens: string[]; destinos: string[]; whatsapp: string }) {
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [dataIda, setDataIda] = useState("");
  const [horario, setHorario] = useState("");
  const [passageiros, setPassageiros] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [link, setLink] = useState<string | null>(null);

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateSearch({ origem, destino, dataIda, horario, passageiros, tipo: "ida" });
    setErrors(errs);
    if (errs.length) { setLink(null); return; }
    const msg = buildWhatsMessage({ origem, destino, dataIda, horario, passageiros, tipo: "ida" });
    const url = whatsappLink(whatsapp, msg);
    setLink(url);
    if (url) {
      fetch("/api/metrics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rota: `${origem} → ${destino}` }) }).catch(() => {});
      window.open(url, "_blank");
    }
  }

  return (
    <form onSubmit={buscar} className="card p-5 grid gap-4 md:grid-cols-3" aria-label="Consultar passagens">
      <div className="md:col-span-3 font-bold text-total-blue">Compre sua passagem de ônibus</div>
      <div>
        <label className="label" htmlFor="origem">Origem</label>
        <select id="origem" className="input" value={origem} onChange={e => setOrigem(e.target.value)}>
          <option value="">Selecione</option>
          {origens.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="destino">Destino</label>
        <select id="destino" className="input" value={destino} onChange={e => setDestino(e.target.value)}>
          <option value="">Selecione</option>
          {destinos.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="data">Data de ida</label>
        <input id="data" type="date" className="input" value={dataIda} onChange={e => setDataIda(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="hor">Horário desejado (opcional)</label>
        <input id="hor" className="input" placeholder="Ex: 08:00" value={horario} onChange={e => setHorario(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="pax">Passageiros</label>
        <input id="pax" type="number" min={1} max={10} className="input" value={passageiros} onChange={e => setPassageiros(Number(e.target.value))} />
      </div>
      <div className="flex items-end">
        <button type="submit" className="btn-primary w-full justify-center">🔍 Buscar passagens</button>
      </div>
      {errors.length > 0 && (
        <ul className="md:col-span-3 text-red-700 text-sm bg-red-50 border border-red-200 rounded p-3" role="alert">
          {errors.map(e => <li key={e}>• {e}</li>)}
        </ul>
      )}
      {!whatsapp && <p className="md:col-span-3 text-amber-700 text-sm">WhatsApp comercial ainda não configurado. Consulte o atendimento pelo SAC 0800 085 8080.</p>}
      {link && <p className="md:col-span-3 text-green-700 text-sm">Abrindo o WhatsApp com sua mensagem pronta. Se não abrir, <a className="underline" href={link} target="_blank">clique aqui</a>.</p>}
    </form>
  );
}
