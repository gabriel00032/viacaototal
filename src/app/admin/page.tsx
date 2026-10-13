"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user, pass }) });
    if (r.ok) router.push("/admin/dashboard");
    else setErr("Credenciais inválidas.");
  }
  return (
    <div className="container-vt py-12 max-w-sm">
      <h1 className="text-xl font-black text-total-blue">Acesso administrativo</h1>
      <form onSubmit={submit} className="card p-5 mt-4 grid gap-3">
        <label className="label">Usuário<input className="input mt-1" value={user} onChange={e => setUser(e.target.value)} autoComplete="username" /></label>
        <label className="label">Senha<input type="password" className="input mt-1" value={pass} onChange={e => setPass(e.target.value)} autoComplete="current-password" /></label>
        {err && <p className="text-red-700 text-sm">{err}</p>}
        <button className="btn-primary justify-center">Entrar</button>
      </form>
    </div>
  );
}
