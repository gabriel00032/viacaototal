"use client";
import { useEffect, useState } from "react";

export default function AdminEditor({ campo }: { campo: "featured" | "destinations" | "settings" }) {
  const [db, setDb] = useState<any>(null);
  const [msg, setMsg] = useState("");
  useEffect(() => { fetch("/api/admin/data").then(r => { if (!r.ok) location.href = "/admin"; return r.json(); }).then(setDb).catch(() => location.href = "/admin"); }, []);
  async function save() {
    const r = await fetch("/api/admin/data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(db) });
    setMsg(r.ok ? "Salvo com sucesso." : "Erro ao salvar.");
  }
  if (!db) return <div className="container-vt py-8">Carregando…</div>;
  return (
    <div className="container-vt py-8 max-w-4xl">
      <h1 className="text-xl font-black text-total-blue">Administrar: {campo}</h1>
      {campo === "settings" && (
        <div className="card p-4 mt-4 grid gap-3">
          <label className="label">WhatsApp comercial (somente dígitos, DDI+DDD)<input className="input mt-1" value={db.settings.salesWhatsapp} onChange={e => setDb({ ...db, settings: { ...db.settings, salesWhatsapp: e.target.value } })} placeholder="5583999990000" /></label>
          <label className="label">SAC<input className="input mt-1" value={db.settings.sac} onChange={e => setDb({ ...db, settings: { ...db.settings, sac: e.target.value } })} /></label>
          <label className="label">E-mail<input className="input mt-1" value={db.settings.email} onChange={e => setDb({ ...db, settings: { ...db.settings, email: e.target.value } })} /></label>
          <label className="label">Atendimento<input className="input mt-1" value={db.settings.atendimento} onChange={e => setDb({ ...db, settings: { ...db.settings, atendimento: e.target.value } })} /></label>
          <label className="label">Endereço<input className="input mt-1" value={db.settings.endereco} onChange={e => setDb({ ...db, settings: { ...db.settings, endereco: e.target.value } })} /></label>
        </div>
      )}
      {campo === "featured" && (
        <div className="grid gap-2 mt-4">
          {db.featured.map((f: any, i: number) => (
            <div key={f.id} className="card p-3 grid sm:grid-cols-6 gap-2 text-sm">
              <input className="input" value={f.origem} onChange={e => { const a = [...db.featured]; a[i].origem = e.target.value; setDb({ ...db, featured: a }); }} placeholder="Origem" />
              <input className="input" value={f.destino} onChange={e => { const a = [...db.featured]; a[i].destino = e.target.value; setDb({ ...db, featured: a }); }} placeholder="Destino" />
              <input className="input" value={f.preco} onChange={e => { const a = [...db.featured]; a[i].preco = e.target.value; setDb({ ...db, featured: a }); }} placeholder="Preço" />
              <input className="input" type="number" value={f.posicao} onChange={e => { const a = [...db.featured]; a[i].posicao = Number(e.target.value); setDb({ ...db, featured: a }); }} placeholder="Pos" />
              <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={f.ativo} onChange={e => { const a = [...db.featured]; a[i].ativo = e.target.checked; setDb({ ...db, featured: a }); }} /> ativo</label>
              <button className="text-red-700 text-xs" onClick={() => setDb({ ...db, featured: db.featured.filter((_: any, j: number) => j !== i) })}>Remover</button>
            </div>
          ))}
          <button className="btn-primary w-fit" onClick={() => setDb({ ...db, featured: [...db.featured, { id: `f${Date.now()}`, origem: "", destino: "", preco: "", ativo: true, posicao: db.featured.length + 1, fonte: "cadastro manual", validadoEm: new Date().toISOString().slice(0, 10) }] })}>+ Adicionar cartão</button>
        </div>
      )}
      {campo === "destinations" && (
        <div className="grid gap-2 mt-4">
          {db.destinations.map((d: any, i: number) => (
            <div key={d.id} className="card p-3 grid sm:grid-cols-4 gap-2 text-sm">
              <input className="input" value={d.cidade} onChange={e => { const a = [...db.destinations]; a[i].cidade = e.target.value; setDb({ ...db, destinations: a }); }} placeholder="Cidade" />
              <input className="input" value={d.uf} onChange={e => { const a = [...db.destinations]; a[i].uf = e.target.value; setDb({ ...db, destinations: a }); }} placeholder="UF" />
              <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={d.ativo} onChange={e => { const a = [...db.destinations]; a[i].ativo = e.target.checked; setDb({ ...db, destinations: a }); }} /> ativo</label>
              <button className="text-red-700 text-xs" onClick={() => setDb({ ...db, destinations: db.destinations.filter((_: any, j: number) => j !== i) })}>Remover</button>
            </div>
          ))}
          <button className="btn-primary w-fit" onClick={() => setDb({ ...db, destinations: [...db.destinations, { id: `d${Date.now()}`, cidade: "", uf: "", ativo: true, fonte: "cadastro manual" }] })}>+ Adicionar destino</button>
        </div>
      )}
      <div className="mt-4 flex gap-3 items-center">
        <button onClick={save} className="btn-primary">Salvar alterações</button>
        {msg && <span className="text-sm">{msg}</span>}
      </div>
    </div>
  );
}
