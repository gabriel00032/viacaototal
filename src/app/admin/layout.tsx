"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const items = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/passagens", label: "Passagens" },
  { href: "/admin/destinos", label: "Destinos" },
  { href: "/admin/horarios", label: "Horários" },
  { href: "/admin/pontos", label: "Pontos de venda" },
  { href: "/admin/conteudo", label: "Conteúdo do site" },
  { href: "/admin/faq", label: "Dúvidas frequentes" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  if (path === "/admin") return <>{children}</>;
  async function sair() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin");
  }
  return (
    <div className="min-h-screen bg-[#eef2f7]">
      <div className="bg-navy text-white">
        <div className="container-vt flex items-center justify-between py-3">
          <p className="font-display font-extrabold">VIAÇÃO <span className="text-accent">TOTAL</span> <span className="font-sans font-normal text-white/60 text-sm">· Painel admin</span></p>
          <div className="flex gap-2 text-sm">
            <Link href="/" className="border border-white/30 rounded-lg px-3 py-1.5 hover:bg-white/10">Ver site</Link>
            <button onClick={sair} className="border border-white/30 rounded-lg px-3 py-1.5 hover:bg-white/10">Sair</button>
          </div>
        </div>
      </div>
      <div className="container-vt py-6 grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 h-fit lg:sticky lg:top-20">
          {items.map(i => (
            <Link key={i.href} href={i.href}
              className={`block rounded-lg px-3 py-2.5 text-sm font-semibold ${path === i.href ? "bg-navy text-white" : "text-navy hover:bg-slate-100"}`}>
              {i.label}
            </Link>
          ))}
        </aside>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 min-w-0">{children}</div>
      </div>
    </div>
  );
}
