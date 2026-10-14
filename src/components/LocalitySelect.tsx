"use client";
import { useEffect, useRef, useState } from "react";
import { filtrarLocais } from "@/lib/schedules";

// Pontos principais (cidades das rotas mais buscadas) — aparecem primeiro,
// antes de qualquer digitação, para não ofuscar com 469 opções de uma vez.
export const POPULARES = [
  "BELO HORIZONTE - MG ( TERMINAL RODOVIARIO )",
  "SAO JOSE DO RIO PRETO - SP ( TERMINAL RODOVIARIO )",
  "CUIABA - MT ( TERMINAL RODOVIARIO )",
  "CAMPO GRANDE - MS ( TERMINAL RODOVIARIO )",
  "BRASILIA - DF ( TERMINAL RODOVIARIO )",
  "GOIANIA - GO ( TERMINAL RODOVIARIO )",
  "SAO PAULO-SP (TERMINAL RODOVIARIO BARRA FUNDA)",
  "LONDRINA - PR ( TERMINAL RODOVIARIO )",
  "RECIFE - PE",
  "JOAO PESSOA - PB",
];

export default function LocalitySelect({ id, label, value, onChange, locais, placeholder }: {
  id: string; label: string; value: string; onChange: (v: string) => void; locais: string[]; placeholder?: string;
}) {
  const [texto, setTexto] = useState(value);
  const [aberto, setAberto] = useState(false);
  const [destaque, setDestaque] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  // Evita que a sincronização com o valor confirmado apague o que o usuário
  // está digitando: só sincroniza quando a mudança veio de fora (escolha).
  const digitando = useRef(false);

  useEffect(() => { if (!digitando.current) setTexto(value); }, [value]);
  useEffect(() => {
    function fora(e: MouseEvent) { if (!boxRef.current?.contains(e.target as Node)) setAberto(false); }
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, []);

  const buscando = texto !== "" && texto !== value;
  const lista = buscando ? filtrarLocais(texto, locais, POPULARES) : filtrarLocais("", locais, POPULARES);

  function escolher(v: string) { digitando.current = false; onChange(v); setTexto(v); setAberto(false); setDestaque(0); }

  function tecla(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setDestaque(d => Math.min(d + 1, lista.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setDestaque(d => Math.max(d - 1, 0)); }
    else if (e.key === "Enter" && aberto && lista[destaque]) { e.preventDefault(); escolher(lista[destaque]); }
    else if (e.key === "Escape") setAberto(false);
  }

  return (
    <div ref={boxRef} className="relative">
      <label className="label" htmlFor={id}>{label}</label>
      <input id={id} role="combobox" aria-expanded={aberto} aria-autocomplete="list" autoComplete="off"
        className="input mt-1" placeholder={placeholder || "Digite para buscar…"}
        value={texto}
        onChange={e => { digitando.current = true; setTexto(e.target.value); onChange(""); setAberto(true); setDestaque(0); }}
        onFocus={() => setAberto(true)}
        onKeyDown={tecla} />
      {aberto && lista.length > 0 && (
        <ul role="listbox" aria-label={label} className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-card">
          {buscando && (
            <li className="px-3 py-1.5 text-[11px] text-slate-400 border-b">{lista.length} resultado(s) — use ↑↓ + Enter</li>
          )}
          {lista.map((o, i) => (
            <li key={o} role="option" aria-selected={o === value}
              onMouseDown={e => { e.preventDefault(); escolher(o); }}
              className={`px-3 py-2 text-sm cursor-pointer ${i === destaque ? "bg-navy text-white" : o === value ? "bg-slate-100 font-semibold" : "hover:bg-slate-50"}`}>
              {o}
            </li>
          ))}
        </ul>
      )}
      {aberto && buscando && lista.length === 0 && (
        <p className="absolute z-20 mt-1 w-full rounded-lg border bg-white p-3 text-sm text-slate-500">Nenhuma localidade encontrada. Tente outra grafia.</p>
      )}
    </div>
  );
}
