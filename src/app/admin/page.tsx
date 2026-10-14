"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const FALLBACK = {
  marca: { nomeA: "VIAÇÃO", nomeB: "TOTAL", subtitulo: "", logoUrl: "" },
  telaLogin: {
    titulo: "Painel da agência.",
    subtitulo: "Gerencie passagens, destinos, horários, conteúdo do site e o WhatsApp comercial — tudo refletindo na hora, sem mexer no código.",
    dica: "Acesso restrito · sessão protegida de 12h",
    fundoUrl: "",
  },
};

export default function AdminLogin() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [ap, setAp] = useState(FALLBACK);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/aparencia-login").then(r => r.json()).then(j => {
      if (j?.marca || j?.telaLogin) setAp({ marca: { ...FALLBACK.marca, ...(j.marca || {}) }, telaLogin: { ...FALLBACK.telaLogin, ...(j.telaLogin || {}) } });
    }).catch(() => {});
  }, []);

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

  const fundo = ap.telaLogin.fundoUrl;
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Painel da marca */}
      <div className="hero-gradient text-white hidden lg:flex flex-col justify-between p-10 relative overflow-hidden">
        {fundo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fundo} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-navy/70" />
          </>
        ) : null}
        <div className="relative">
          {ap.marca.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ap.marca.logoUrl} alt={`${ap.marca.nomeA} ${ap.marca.nomeB}`} className="h-12 w-auto" />
          ) : (
            <p className="font-display text-2xl font-extrabold">{ap.marca.nomeA} <span className="text-accent">{ap.marca.nomeB}</span></p>
          )}
        </div>
        <div className="relative">
          <h1 className="font-display text-4xl font-extrabold leading-tight whitespace-pre-line">{ap.telaLogin.titulo}</h1>
          <p className="text-white/80 mt-4 max-w-md">{ap.telaLogin.subtitulo}</p>
          <ul className="mt-6 space-y-2 text-sm text-white/85">
            <li>✓ Passagens mais buscadas e ordem de exibição</li>
            <li>✓ Horários ao vivo + cadastrados</li>
            <li>✓ Logo, fundo da busca, textos e rodapé</li>
          </ul>
        </div>
        <p className="text-xs text-white/50 relative">{ap.telaLogin.dica}</p>
      </div>
      {/* Formulário */}
      <div className="flex items-center justify-center bg-[#eef2f7] p-6">
        <div className="w-full max-w-sm">
          <p className="font-display text-xl font-extrabold text-navy lg:hidden">{ap.marca.nomeA} <span className="text-accent">{ap.marca.nomeB}</span></p>
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
