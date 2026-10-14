"use client";
import { useEffect, useState } from "react";

export type Campo = "featured" | "destinations" | "schedules" | "settings" | "hero" | "minis" | "difcards" | "cta" | "pontos" | "quemsomos" | "faqs" | "marca" | "rodape";

const TITULOS: Record<Campo, string> = {
  featured: "Passagens mais buscadas", destinations: "Destinos (curadoria)", schedules: "Horários cadastrados",
  settings: "Configurações e WhatsApp", hero: "Topo da página inicial", minis: "Diferenciais (faixa de ícones)",
  difcards: "Diferenciais (cartões)", cta: "Chamada para WhatsApp", pontos: "Pontos de venda",
  quemsomos: "Quem Somos", faqs: "Dúvidas frequentes", marca: "Marca e logo", rodape: "Rodapé",
};

function Upload({ label, value, onDone }: { label: string; value: string; onDone: (url: string) => void }) {
  const [st, setSt] = useState("");
  async function send(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setSt("Enviando…");
    const form = new FormData();
    form.append("file", f);
    const r = await fetch("/api/admin/upload", { method: "POST", body: form });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.url) { onDone(j.url); setSt("Enviado!"); }
    else setSt(j.error || "Falha no envio.");
  }
  return (
    <div className="border rounded-lg p-3 bg-slate-50 text-sm">
      <p className="label">{label} (PNG/JPG/WEBP/SVG, até 2 MB)</p>
      <div className="flex items-center gap-3 mt-2 flex-wrap">
        <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={send} className="text-sm" />
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="pré-visualização" className="h-12 w-auto rounded border bg-white" />
        ) : null}
        <span className="text-xs text-slate-500">{st}</span>
      </div>
    </div>
  );
}

function Txt({ label, value, onChange, placeholder }: any) {
  return (
    <label className="label block">{label}
      <input className="input mt-1 font-normal normal-case tracking-normal text-slate-800" value={value || ""} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
    </label>
  );
}
function Area({ label, value, onChange, rows = 4 }: any) {
  return (
    <label className="label block">{label}
      <textarea className="input mt-1 font-normal normal-case tracking-normal text-slate-800" rows={rows} value={value || ""} onChange={e => onChange(e.target.value)} />
    </label>
  );
}

export default function AdminEditor({ campo, campos }: { campo: Campo; campos?: Campo[] }) {
  const lista: Campo[] = campos || [campo];
  const [db, setDb] = useState<any>(null);
  const [msg, setMsg] = useState("");
  useEffect(() => { fetch("/api/admin/data").then(r => { if (!r.ok) location.href = "/admin"; return r.json(); }).then(setDb).catch(() => location.href = "/admin"); }, []);
  async function save() {
    setMsg("Salvando…");
    const r = await fetch("/api/admin/data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(db) });
    setMsg(r.ok ? "Salvo com sucesso." : "Erro ao salvar.");
  }
  if (!db) return <div className="py-8 text-slate-500">Carregando…</div>;
  const set = (patch: any) => setDb({ ...db, ...patch });
  const setArr = (key: string, arr: any[]) => setDb({ ...db, [key]: arr });

  return (
    <div>
      {lista.map(c => (
        <section key={c} className="mb-8">
          <h2 className="font-display font-bold text-navy">{TITULOS[c]}</h2>
          <div className="mt-3 grid gap-3">
            {c === "settings" && (<>
              <Txt label="WhatsApp comercial (somente dígitos, DDI+DDD)" value={db.settings.salesWhatsapp} placeholder="5511992414101" onChange={(v: string) => set({ settings: { ...db.settings, salesWhatsapp: v } })} />
              <Txt label="SAC" value={db.settings.sac} onChange={(v: string) => set({ settings: { ...db.settings, sac: v } })} />
              <Txt label="E-mail" value={db.settings.email} onChange={(v: string) => set({ settings: { ...db.settings, email: v } })} />
              <Txt label="Atendimento" value={db.settings.atendimento} onChange={(v: string) => set({ settings: { ...db.settings, atendimento: v } })} />
              <Txt label="Endereço" value={db.settings.endereco} onChange={(v: string) => set({ settings: { ...db.settings, endereco: v } })} />
            </>)}
            {c === "hero" && (<>
              <Txt label="Linha superior (eyebrow)" value={db.hero.eyebrow} onChange={(v: string) => set({ hero: { ...db.hero, eyebrow: v } })} />
              <Txt label="Título (parte 1)" value={db.hero.tituloA} onChange={(v: string) => set({ hero: { ...db.hero, tituloA: v } })} />
              <Txt label="Título (destaque laranja)" value={db.hero.tituloDestaque} onChange={(v: string) => set({ hero: { ...db.hero, tituloDestaque: v } })} />
              <Txt label="Título (parte 2)" value={db.hero.tituloB} onChange={(v: string) => set({ hero: { ...db.hero, tituloB: v } })} />
              <Area label="Subtítulo" value={db.hero.subtitulo} onChange={(v: string) => set({ hero: { ...db.hero, subtitulo: v } })} />
              <Upload label="Imagem de fundo da busca" value={db.hero.fundoUrl} onDone={(url: string) => set({ hero: { ...db.hero, fundoUrl: url } })} />
              <Txt label="...ou URL da imagem" value={db.hero.fundoUrl} placeholder="/api/arquivos/… ou https://…" onChange={(v: string) => set({ hero: { ...db.hero, fundoUrl: v } })} />
              {db.hero.fundoUrl && !/\.(png|jpe?g|webp|svg)(\?|#|$)/i.test(db.hero.fundoUrl) && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">Esse endereço não parece ser uma imagem (use o botão de envio acima ou um link direto de imagem). O endereço do site (ex: viajetotal.com.br) não funciona como fundo.</p>
              )}
              {db.hero.fundoUrl && /\.(png|jpe?g|webp|svg)(\?|#|$)/i.test(db.hero.fundoUrl) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={db.hero.fundoUrl} alt="pré-visualização do fundo" className="h-24 w-full object-cover rounded border" />
              )}
            </>)}
            {c === "marca" && (<>
              <Upload label="Logotipo (troca a logo do cabeçalho e rodapé)" value={db.marca.logoUrl} onDone={(url: string) => set({ marca: { ...db.marca, logoUrl: url } })} />
              <Txt label="...ou URL do logotipo" value={db.marca.logoUrl} placeholder="https://… ou /uploads/…" onChange={(v: string) => set({ marca: { ...db.marca, logoUrl: v } })} />
              <div className="grid sm:grid-cols-2 gap-3">
                <Txt label="Nome (parte 1)" value={db.marca.nomeA} onChange={(v: string) => set({ marca: { ...db.marca, nomeA: v } })} />
                <Txt label="Nome (parte 2, laranja)" value={db.marca.nomeB} onChange={(v: string) => set({ marca: { ...db.marca, nomeB: v } })} />
              </div>
              <Txt label="Linha abaixo do nome" value={db.marca.subtitulo} onChange={(v: string) => set({ marca: { ...db.marca, subtitulo: v } })} />
              <p className="text-xs text-slate-500">Sem imagem, o site exibe o nome em texto. Com imagem, ela aparece no cabeçalho e no rodapé.</p>
            </>)}
            {c === "rodape" && (<>
              <Area label="Texto institucional do rodapé" value={db.rodape.sobre} rows={3} onChange={(v: string) => set({ rodape: { ...db.rodape, sobre: v } })} />
              <Txt label="Barra inferior — texto da esquerda" value={db.rodape.notaEsquerda} onChange={(v: string) => set({ rodape: { ...db.rodape, notaEsquerda: v } })} />
              <Txt label="Barra inferior — texto da direita" value={db.rodape.notaDireita} onChange={(v: string) => set({ rodape: { ...db.rodape, notaDireita: v } })} />
              <Txt label="Endereço" value={db.settings.endereco} onChange={(v: string) => set({ settings: { ...db.settings, endereco: v } })} />
              <div className="grid sm:grid-cols-3 gap-3">
                <Txt label="SAC" value={db.settings.sac} onChange={(v: string) => set({ settings: { ...db.settings, sac: v } })} />
                <Txt label="E-mail" value={db.settings.email} onChange={(v: string) => set({ settings: { ...db.settings, email: v } })} />
                <Txt label="WhatsApp comercial" value={db.settings.salesWhatsapp} onChange={(v: string) => set({ settings: { ...db.settings, salesWhatsapp: v } })} />
              </div>
              <Txt label="Horário de atendimento" value={db.settings.atendimento} onChange={(v: string) => set({ settings: { ...db.settings, atendimento: v } })} />
            </>)}
            {c === "cta" && (<>
              <Txt label="Título da chamada" value={db.cta.titulo} onChange={(v: string) => set({ cta: { ...db.cta, titulo: v } })} />
              <Area label="Texto" value={db.cta.texto} onChange={(v: string) => set({ cta: { ...db.cta, texto: v } })} rows={2} />
            </>)}
            {c === "quemsomos" && <Area label="Texto institucional" value={db.quemSomos.texto} onChange={(v: string) => set({ quemSomos: { texto: v } })} rows={8} />}
            {c === "featured" && (<>
              {db.featured.map((f: any, i: number) => (
                <div key={f.id} className="border rounded-lg p-3 grid sm:grid-cols-6 gap-2 text-sm bg-slate-50">
                  <input className="input" value={f.origem} placeholder="Origem" onChange={e => { const a = [...db.featured]; a[i].origem = e.target.value; setArr("featured", a); }} />
                  <input className="input" value={f.destino} placeholder="Destino" onChange={e => { const a = [...db.featured]; a[i].destino = e.target.value; setArr("featured", a); }} />
                  <input className="input" value={f.preco} placeholder="Preço" onChange={e => { const a = [...db.featured]; a[i].preco = e.target.value; setArr("featured", a); }} />
                  <input className="input" type="number" value={f.posicao} placeholder="Pos" onChange={e => { const a = [...db.featured]; a[i].posicao = Number(e.target.value); setArr("featured", a); }} />
                  <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={f.ativo} onChange={e => { const a = [...db.featured]; a[i].ativo = e.target.checked; setArr("featured", a); }} /> ativo</label>
                  <button className="text-red-700 text-xs text-left" onClick={() => setArr("featured", db.featured.filter((_: any, j: number) => j !== i))}>Remover</button>
                </div>
              ))}
              <button className="btn-primary w-fit text-sm" onClick={() => setArr("featured", [...db.featured, { id: `f${Date.now()}`, origem: "", destino: "", preco: "", ativo: true, posicao: db.featured.length + 1, fonte: "cadastro manual", validadoEm: new Date().toISOString().slice(0, 10) }])}>+ Adicionar cartão</button>
            </>)}
            {c === "destinations" && (<>
              {db.destinations.map((d: any, i: number) => (
                <div key={d.id} className="border rounded-lg p-3 grid sm:grid-cols-4 gap-2 text-sm bg-slate-50">
                  <input className="input" value={d.cidade} placeholder="Cidade" onChange={e => { const a = [...db.destinations]; a[i].cidade = e.target.value; setArr("destinations", a); }} />
                  <input className="input" value={d.uf} placeholder="UF" onChange={e => { const a = [...db.destinations]; a[i].uf = e.target.value; setArr("destinations", a); }} />
                  <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={d.ativo} onChange={e => { const a = [...db.destinations]; a[i].ativo = e.target.checked; setArr("destinations", a); }} /> ativo</label>
                  <button className="text-red-700 text-xs text-left" onClick={() => setArr("destinations", db.destinations.filter((_: any, j: number) => j !== i))}>Remover</button>
                </div>
              ))}
              <button className="btn-primary w-fit text-sm" onClick={() => setArr("destinations", [...db.destinations, { id: `d${Date.now()}`, cidade: "", uf: "", ativo: true, fonte: "cadastro manual" }])}>+ Adicionar destino</button>
            </>)}
            {c === "schedules" && (<>
              {db.schedules.map((s: any, i: number) => (
                <div key={s.id} className="border rounded-lg p-3 grid sm:grid-cols-3 gap-2 text-sm bg-slate-50">
                  <input className="input" value={s.origem} placeholder="Origem" onChange={e => { const a = [...db.schedules]; a[i].origem = e.target.value; setArr("schedules", a); }} />
                  <input className="input" value={s.destino} placeholder="Destino" onChange={e => { const a = [...db.schedules]; a[i].destino = e.target.value; setArr("schedules", a); }} />
                  <input className="input" value={s.partida} placeholder="Partida (HH:MM)" onChange={e => { const a = [...db.schedules]; a[i].partida = e.target.value; setArr("schedules", a); }} />
                  <input className="input" value={s.dias} placeholder="Dias (ex: seg–sex)" onChange={e => { const a = [...db.schedules]; a[i].dias = e.target.value; setArr("schedules", a); }} />
                  <select className="input" value={s.status} onChange={e => { const a = [...db.schedules]; a[i].status = e.target.value; setArr("schedules", a); }}>
                    <option value="confirmado">confirmado</option><option value="pendente">pendente</option><option value="inativo">inativo</option>
                  </select>
                  <button className="text-red-700 text-xs text-left" onClick={() => setArr("schedules", db.schedules.filter((_: any, j: number) => j !== i))}>Remover</button>
                  <input className="input sm:col-span-3" value={s.obs || ""} placeholder="Observações" onChange={e => { const a = [...db.schedules]; a[i].obs = e.target.value; setArr("schedules", a); }} />
                </div>
              ))}
              <button className="btn-primary w-fit text-sm" onClick={() => setArr("schedules", [...db.schedules, { id: `s${Date.now()}`, origem: "", destino: "", partida: "", dias: "", validade: "", status: "pendente", obs: "", atualizadoEm: new Date().toISOString().slice(0, 10) }])}>+ Adicionar horário</button>
            </>)}
            {c === "minis" && (<>
              {db.minis.map((m: any, i: number) => (
                <div key={i} className="border rounded-lg p-3 grid sm:grid-cols-3 gap-2 text-sm bg-slate-50">
                  <input className="input" value={m.icone} placeholder="Ícone (emoji)" onChange={e => { const a = [...db.minis]; a[i].icone = e.target.value; setArr("minis", a); }} />
                  <input className="input sm:col-span-2" value={m.titulo} placeholder="Título" onChange={e => { const a = [...db.minis]; a[i].titulo = e.target.value; setArr("minis", a); }} />
                  <button className="text-red-700 text-xs text-left sm:col-span-3" onClick={() => setArr("minis", db.minis.filter((_: any, j: number) => j !== i))}>Remover</button>
                </div>
              ))}
              <button className="btn-primary w-fit text-sm" onClick={() => setArr("minis", [...db.minis, { icone: "⭐", titulo: "" }])}>+ Adicionar diferencial</button>
            </>)}
            {c === "difcards" && (<>
              {db.difCards.map((k: any, i: number) => (
                <div key={i} className="border rounded-lg p-3 grid gap-2 text-sm bg-slate-50">
                  <div className="grid sm:grid-cols-2 gap-2">
                    <input className="input" value={k.titulo} placeholder="Título" onChange={e => { const a = [...db.difCards]; a[i].titulo = e.target.value; setArr("difcards", a); }} />
                    <input className="input" value={k.destaque} placeholder="Destaque (laranja)" onChange={e => { const a = [...db.difCards]; a[i].destaque = e.target.value; setArr("difcards", a); }} />
                  </div>
                  <textarea className="input" rows={2} value={k.texto} placeholder="Texto" onChange={e => { const a = [...db.difCards]; a[i].texto = e.target.value; setArr("difcards", a); }} />
                  <button className="text-red-700 text-xs text-left" onClick={() => setArr("difcards", db.difCards.filter((_: any, j: number) => j !== i))}>Remover</button>
                </div>
              ))}
              <button className="btn-primary w-fit text-sm" onClick={() => setArr("difcards", [...db.difCards, { titulo: "", destaque: "", texto: "" }])}>+ Adicionar cartão</button>
            </>)}
            {c === "pontos" && (<>
              {db.pontos.map((p: any, i: number) => (
                <div key={i} className="border rounded-lg p-3 grid gap-2 text-sm bg-slate-50">
                  <input className="input" value={p.nome} placeholder="Nome" onChange={e => { const a = [...db.pontos]; a[i].nome = e.target.value; setArr("pontos", a); }} />
                  <input className="input" value={p.endereco} placeholder="Endereço" onChange={e => { const a = [...db.pontos]; a[i].endereco = e.target.value; setArr("pontos", a); }} />
                  <div className="grid sm:grid-cols-3 gap-2">
                    <input className="input" value={p.horario} placeholder="Horário" onChange={e => { const a = [...db.pontos]; a[i].horario = e.target.value; setArr("pontos", a); }} />
                    <input className="input" value={p.telefone} placeholder="Telefone" onChange={e => { const a = [...db.pontos]; a[i].telefone = e.target.value; setArr("pontos", a); }} />
                    <input className="input" value={p.mapa} placeholder="Link do mapa" onChange={e => { const a = [...db.pontos]; a[i].mapa = e.target.value; setArr("pontos", a); }} />
                  </div>
                  <button className="text-red-700 text-xs text-left" onClick={() => setArr("pontos", db.pontos.filter((_: any, j: number) => j !== i))}>Remover</button>
                </div>
              ))}
              <button className="btn-primary w-fit text-sm" onClick={() => setArr("pontos", [...db.pontos, { nome: "", endereco: "", horario: "", telefone: "", mapa: "" }])}>+ Adicionar ponto</button>
            </>)}
            {c === "faqs" && (<>
              {db.faqs.map((f: any, i: number) => (
                <div key={i} className="border rounded-lg p-3 grid gap-2 text-sm bg-slate-50">
                  <input className="input font-semibold" value={f.q} placeholder="Pergunta" onChange={e => { const a = [...db.faqs]; a[i].q = e.target.value; setArr("faqs", a); }} />
                  <textarea className="input" rows={2} value={f.a} placeholder="Resposta" onChange={e => { const a = [...db.faqs]; a[i].a = e.target.value; setArr("faqs", a); }} />
                  <button className="text-red-700 text-xs text-left" onClick={() => setArr("faqs", db.faqs.filter((_: any, j: number) => j !== i))}>Remover</button>
                </div>
              ))}
              <button className="btn-primary w-fit text-sm" onClick={() => setArr("faqs", [...db.faqs, { q: "", a: "" }])}>+ Adicionar pergunta</button>
            </>)}
          </div>
        </section>
      ))}
      <div className="mt-2 flex gap-3 items-center sticky bottom-4 bg-white/95 border rounded-xl p-3 shadow">
        <button onClick={save} className="btn-primary">Salvar alterações</button>
        {msg && <span className="text-sm">{msg}</span>}
      </div>
    </div>
  );
}
