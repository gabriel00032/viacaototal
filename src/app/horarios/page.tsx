import { loadDB } from "@/lib/store";

export const metadata = { title: "Horários — Viação Total" };

export default function Page() {
  const db = loadDB();
  return (
    <div className="container-vt py-8">
      <h1 className="text-2xl font-black text-total-blue">Horários e partidas</h1>
      <p className="mt-2 text-sm text-slate-600">Consulte horários em tempo real na <a className="underline text-primary" href="/">busca da página inicial</a>: escolha origem, destino e data para ver as partidas do dia e seguir ao WhatsApp.</p>
      {db.schedules.length === 0 ? (
        <p className="mt-4 bg-amber-50 border p-4 rounded text-sm">Nenhum horário avulso cadastrado pelo administrador. Use a busca da página inicial para horários ao vivo.</p>
      ) : (
        <table className="mt-4 w-full text-sm card"><thead><tr className="text-left border-b"><th className="p-3">Origem</th><th className="p-3">Destino</th><th className="p-3">Partida</th><th className="p-3">Status</th></tr></thead>
        <tbody>{db.schedules.map(s => <tr key={s.id} className="border-b"><td className="p-3">{s.origem}</td><td className="p-3">{s.destino}</td><td className="p-3">{s.partida}</td><td className="p-3">{s.status}</td></tr>)}</tbody></table>
      )}
    </div>
  );
}
