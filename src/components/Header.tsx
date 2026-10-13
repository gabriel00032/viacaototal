"use client";
import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/", label: "Início" },
  { href: "/passagens", label: "Passagens" },
  { href: "/destinos", label: "Destinos atendidos" },
  { href: "/horarios", label: "Horários" },
  { href: "/pontos-de-venda", label: "Pontos de venda" },
  { href: "/quem-somos", label: "Quem Somos" },
  { href: "/duvidas-frequentes", label: "Dúvidas frequentes" },
  { href: "/contato", label: "Contato" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-total-blue text-white sticky top-0 z-50">
      <div className="container-vt flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-2" aria-label="Viação Total - Início">
          <span className="bg-white text-total-blue font-black text-xl px-2 py-1 rounded">TOTAL</span>
          <span className="hidden sm:block text-sm text-white/80">Viação Total</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-5 text-sm">
          {links.slice(1).map(l => <Link key={l.href} href={l.href} className="hover:text-orange-300">{l.label}</Link>)}
          <Link href="/contato" className="bg-green-600 hover:bg-green-500 rounded-lg px-4 py-2 font-semibold">Compre pelo WhatsApp</Link>
        </nav>
        <button className="lg:hidden border border-white/40 rounded px-3 py-1" onClick={() => setOpen(!open)} aria-label="Abrir menu">☰</button>
      </div>
      {open && (
        <nav className="lg:hidden bg-total-dark px-4 pb-4 flex flex-col gap-2 text-sm">
          {links.map(l => <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-1 border-b border-white/10">{l.label}</Link>)}
          <Link href="/contato" onClick={() => setOpen(false)} className="bg-green-600 rounded-lg px-4 py-2 font-semibold text-center mt-2">Compre pelo WhatsApp</Link>
        </nav>
      )}
    </header>
  );
}
