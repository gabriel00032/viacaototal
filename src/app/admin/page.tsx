"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user, pass }) });
      if (r.ok) router.push("/admin/dashboard");
      else setErr("Usuário ou senha incorretos. Tente novamente.");
    } catch {
      setErr("Não foi possível conectar. Verifique sua internet e tente de novo.");
    } finally { setLoading(false); }
  }
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Painel da marca */}
      <div className="hero-gradient text-white hidden lg:flex flex-col justify-between p-10">
        <p className="font-display text-2xl font-extrabold">VIAÇÃO <span className="text-accent">TOTAL</span></p>
        <div>
          <h1 className="font-display text-4xl font-extrabold leading-tight">Painel da<br />agência.</h1>
          <p className="text-white/80 mt-4 max-w-md">Gerencie passagens, destinos, horários, conteúdo do site e o WhatsApp comercial — tudo refletindo na hora, sem mexer no código.</p>
          <ul className="mt-6 space-y-2 text-sm text-white/85">
            <li>✓ Passagens mais buscadas e ordem de exibição</li>
            <li>✓ Horários ao vivo + cadastrados</li>
            <li>✓ Logo, fundo da busca, textos e rodapé</li>
          </ul>
        </div>
        <p className="text-xs text-white/50">Acesso restrito · sessão protegida de 12h</p>
      </div>
      {/* Formulário */}
      <div className="flex items-center justify-center bg-[#eef2f7] p-6">
        <div className="w-full max-w-sm">
          <p className="font-display text-xl font-extrabold text-navy lg:hidden">VIAÇÃO <span className="text-accent">TOTAL</span></p>
          <h2 className="font-display text-2xl font-extrabold text-navy mt-2">Entrar no painel</h2>
          <p className="text-sm text-slate-500 mt-1">Use suas credenciais de administrador.</p>
          <form onSubmit={submit} className="card p-6 mt-5 grid gap-4">
            <div>
              <label className="label" htmlFor="admin-user">Usuário</label>
              <input id="admin-user" className="input mt-1" value={user} onChange={e => setUser(e.target.value)} autoComplete="username" placeholder="Ex: admin" />
            </div>
            <div>
              <label className="label" htmlFor="admin-pass">Senha</label>
              <div className="relative mt-1">
                <input id="admin-pass" type={show ? "text" : "password"} className="input pr-12" value={pass} onChange={e => setPass(e.target.value)} autoComplete="current-password" placeholder="••••••••" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-primary px-2 py-1" aria-label={show ? "Ocultar senha" : "Mostrar senha"}>
                  {show ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>
            {err && <p className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg p-3" role="alert">{err}</p>}
            <button className="btn-navy justify-center !py-3" disabled={loading}>
              {loading ? "Entrando…" : "Entrar →"}
            </button>
          </form>
          <Link href="/" className="block text-center text-sm text-slate-500 hover:text-navy mt-4">← Voltar ao site</Link>
        </div>
      </div>
    </div>
  );
}
