import { loadDB } from "@/lib/store";

export const metadata = { title: "Horários — Viação Total" };

export default function Page() {
  const db = loadDB();
  const ativos = db.schedules.filter(s => s.status !== "inativo");
  return (
    <div className="container-vt py-8">
      <h1 className="text-2xl font-black text-total-blue">Horários e partidas</h1>
      <p className="mt-2 text-sm text-slate-600">Horários em tempo real na <a className="underline text-primary" href="/">busca da página inicial</a>. Abaixo, horários cadastrados pela equipe:</p>
      {ativos.length === 0 ? (
        <p className="mt-4 bg-amber-50 border p-4 rounded text-sm">Nenhum horário avulso cadastrado. Use a busca da página inicial para horários ao vivo.</p>
      ) : (
        <div className="grid gap-3 mt-4">
          {ativos.map(s => (
            <div key={s.id} className="card p-4 text-sm">
              <p><strong>{s.origem} → {s.destino}</strong> · {s.partida} · {s.dias}</p>
              <p className="text-slate-500 text-xs mt-1">{s.status === "confirmado" ? "Confirmado" : "Pendente de confirmação"}{s.validade ? ` · válido: ${s.validade}` : ""}{s.obs ? ` · ${s.obs}` : ""}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
