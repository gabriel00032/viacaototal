"use client";
import { useEffect, useState } from "react";

export default function AcessoEditor() {
  const [atual, setAtual] = useState("");
  const [newUser, setNewUser] = useState("");
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    fetch("/api/admin/acesso").then(r => { if (!r.ok) location.href = "/admin"; return r.json(); })
      .then(j => setAtual(j.user || "")).catch(() => location.href = "/admin");
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setMsg(""); setOk(false);
    if (newPass && newPass !== confirm) { setMsg("A nova senha e a confirmação não coincidem."); return; }
    const r = await fetch("/api/admin/acesso", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPass, newUser, newPass }),
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok) {
      setOk(true); setAtual(j.user || atual);
      setMsg(`Acesso atualizado. Usuário atual: ${j.user}. Use as novas credenciais no próximo login.`);
      setNewUser(""); setCurrentPass(""); setNewPass(""); setConfirm("");
    } else setMsg(j.error || "Erro ao salvar.");
  }

  return (
    <form onSubmit={salvar} className="grid gap-3 max-w-md">
      <p className="text-sm text-slate-600">Usuário atual: <strong>{atual || "…"}</strong></p>
      <label className="label">Novo usuário (opcional)
        <input className="input mt-1 font-normal" value={newUser} onChange={e => setNewUser(e.target.value)} placeholder="Deixe em branco para manter" autoComplete="username" />
      </label>
      <label className="label">Senha atual (obrigatória)
        <input type="password" className="input mt-1 font-normal" value={currentPass} onChange={e => setCurrentPass(e.target.value)} autoComplete="current-password" />
      </label>
      <label className="label">Nova senha (opcional, mín. 6 caracteres)
        <input type="password" className="input mt-1 font-normal" value={newPass} onChange={e => setNewPass(e.target.value)} autoComplete="new-password" />
      </label>
      <label className="label">Confirmar nova senha
        <input type="password" className="input mt-1 font-normal" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" />
      </label>
      {msg && <p className={`text-sm rounded-lg p-3 border ${ok ? "text-green-700 bg-green-50 border-green-200" : "text-red-700 bg-red-50 border-red-200"}`} role="alert">{msg}</p>}
      <button className="btn-primary w-fit">Salvar acesso</button>
    </form>
  );
}
