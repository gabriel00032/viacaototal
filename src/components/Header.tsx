"use client";
import Link from "next/link";
import { useState } from "react";

export interface MarcaProps { nomeA: string; nomeB: string; subtitulo: string; logoUrl: string; }

const links = [
  { href: "/passagens", label: "Passagens" },
  { href: "/destinos", label: "Destinos" },
  { href: "/horarios", label: "Horários" },
  { href: "/pontos-de-venda", label: "Pontos de venda" },
  { href: "/quem-somos", label: "Quem Somos" },
  { href: "/duvidas-frequentes", label: "Dúvidas" },
  { href: "/contato", label: "Contato" },
];

export function MarcaBloco({ marca, claro = false, logoClass = "h-10 w-auto" }: { marca: MarcaProps; claro?: boolean; logoClass?: string }) {
  if (marca.logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={marca.logoUrl} alt={`${marca.nomeA} ${marca.nomeB}`} className={logoClass} />;
  }
  return (
    <span className="leading-tight">
      <span className={`font-display text-xl font-extrabold ${claro ? "text-white" : "text-navy"}`}>{marca.nomeA} <span className="text-accent">{marca.nomeB}</span></span>
      {marca.subtitulo ? <span className={`block text-xs ${claro ? "text-white/70" : "text-slate-500"}`}>{marca.subtitulo}</span> : null}
    </span>
  );
}

export default function Header({ marca }: { marca: MarcaProps }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container-vt flex items-center justify-between py-3 gap-3">
        <Link href="/" className="leading-tight" aria-label="Viação Total - Início">
          <MarcaBloco marca={marca} />
        </Link>
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-navy">
          {links.map(l => <Link key={l.href} href={l.href} className="hover:text-primary">{l.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/contato" className="btn-whats !py-2 !px-4 text-sm">WhatsApp</Link>
          <button className="lg:hidden border border-slate-300 rounded px-3 py-1 text-navy" onClick={() => setOpen(!open)} aria-label="Abrir menu">☰</button>
        </div>
      </div>
      {open && (
        <nav className="lg:hidden px-4 pb-4 flex flex-col gap-1 text-sm font-medium text-navy border-t">
          <Link href="/" onClick={() => setOpen(false)} className="py-2 border-b border-slate-100">Início</Link>
          {links.map(l => <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-2 border-b border-slate-100">{l.label}</Link>)}
        </nav>
      )}
    </header>
  );
}
