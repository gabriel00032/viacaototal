import { loadDB } from "@/lib/store";
export const metadata = { title: "Pontos de venda — Viação Total" };
export default function Page() {
  const db = loadDB();
  return (
    <div className="container-vt py-8">
      <h1 className="text-2xl font-black text-total-blue">Pontos de venda</h1>
      <p className="text-sm text-slate-500 mt-1">Somente pontos confirmados. Gerenciável em /admin/pontos.</p>
      <div className="grid gap-3 mt-4">
        {db.pontos.map(p => (
          <div key={p.nome} className="card p-4">
            <strong>{p.nome}</strong>
            <p className="text-sm text-slate-600">{p.endereco}</p>
            <p className="text-sm text-slate-600">{p.horario} · {p.telefone}</p>
            {p.mapa ? <a className="text-sm underline text-primary" target="_blank" href={p.mapa}>Ver no mapa</a> : null}
          </div>
        ))}
        {db.pontos.length === 0 && <p className="text-sm text-slate-500">Nenhum ponto cadastrado.</p>}
      </div>
    </div>
  );
}
