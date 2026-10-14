"use client";
import { useEffect, useState } from "react";
import type { SeatRow } from "@/lib/schedules";

export default function SeatMap({ rotaId, parceiroId, veiculoId, cred, max, titulo, onConfirm, onVoltar }: {
  rotaId: number; parceiroId: number; veiculoId: number; cred: string;
  max: number; titulo: string;
  onConfirm: (poltronas: string[]) => void; onVoltar: () => void;
}) {
  const [rows, setRows] = useState<SeatRow[] | null>(null);
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [sel, setSel] = useState<string[]>([]);

  useEffect(() => {
    setRows(null); setErro(""); setSel([]);
    fetch(`/api/poltronas?rota=${rotaId}&parceiro=${parceiroId}&veiculo=${veiculoId}&cred=${cred}`)
      .then(r => r.json())
      .then(j => {
        if (j.ok && j.rows?.length) { setRows(j.rows); setNome(j.nome || ""); }
        else setErro("Mapa de poltronas indisponível para este horário. Siga ao WhatsApp e confirme com o vendedor.");
      })
      .catch(() => setErro("Falha ao carregar poltronas."));
  }, [rotaId, parceiroId, veiculoId, cred]);

  function toggle(numero: string, livre: boolean) {
    if (!livre) return;
    setSel(s => s.includes(numero) ? s.filter(x => x !== numero) : (s.length < max ? [...s, numero] : s));
  }

  if (erro) {
    return (
      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm" aria-live="polite">
        <p>{erro}</p>
        <div className="flex gap-2 mt-3">
          <button onClick={onVoltar} className="border border-slate-300 rounded-lg px-4 py-2 text-sm font-semibold">← Voltar</button>
          <button onClick={() => onConfirm([])} className="btn-whats !py-2 !px-4 text-sm">Continuar sem escolher</button>
        </div>
      </div>
    );
  }
  if (!rows) return <p className="mt-4 text-sm text-slate-500" aria-live="polite">Carregando mapa de poltronas…</p>;

  return (
    <div className="mt-4 border border-slate-200 rounded-xl p-4 bg-slate-50" aria-live="polite">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="font-display font-bold text-navy text-sm">{titulo}{nome ? ` · ${nome}` : ""}</p>
        <p className="text-xs text-slate-500">Escolha até {max} poltrona(s): <strong>{sel.length === 0 ? "nenhuma" : sel.join(", ")}</strong></p>
      </div>
      <div className="flex gap-4 text-xs text-slate-500 mt-2">
        <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 rounded bg-whatsapp" /> Livre</span>
        <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 rounded bg-slate-300" /> Ocupada</span>
        <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 rounded bg-navy" /> Sua escolha</span>
      </div>
      <div className="mt-3 grid gap-1.5 max-w-xs mx-auto" role="group" aria-label="Poltronas">
        {rows.map((r, i) => (
          <div key={i} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${r.cells.length}, minmax(0,1fr))` }}>
            {r.cells.map((c, j) => c.vazio ? <span key={`v${j}`} /> : (
              <button key={c.id} disabled={!c.livre} onClick={() => toggle(c.numero, c.livre)} title={`Poltrona ${c.numero}${c.janela ? " (janela)" : ""}`}
                aria-pressed={sel.includes(c.numero)}
                className={`h-9 rounded-md text-xs font-bold border transition ${!c.livre ? "bg-slate-300 text-slate-500 cursor-not-allowed border-slate-300" : sel.includes(c.numero) ? "bg-navy text-white border-navy" : "bg-whatsapp text-white border-whatsapp hover:opacity-90"}`}>
                {c.numero}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={onVoltar} className="border border-slate-300 rounded-lg px-4 py-2 text-sm font-semibold">← Voltar</button>
        <button onClick={() => onConfirm(sel)} disabled={sel.length === 0} className="btn-whats !py-2 !px-4 text-sm disabled:opacity-50">
          Confirmar {sel.length > 0 ? `(${sel.join(", ")}) ` : ""}no WhatsApp
        </button>
      </div>
    </div>
  );
}
