import { loadDB } from "@/lib/store";
export const metadata = { title: "Dúvidas frequentes — Viação Total" };
export default function Page() {
  const db = loadDB();
  return (
    <div className="container-vt py-8 max-w-3xl">
      <h1 className="text-2xl font-black text-total-blue">Dúvidas frequentes</h1>
      <div className="mt-4 space-y-3">{db.faqs.map(f => <details key={f.q} className="card p-4"><summary className="font-semibold cursor-pointer">{f.q}</summary><p className="text-sm text-slate-600 mt-2 whitespace-pre-line">{f.a}</p></details>)}</div>
      {db.faqs.length === 0 && <p className="text-sm text-slate-500 mt-4">Nenhuma pergunta cadastrada.</p>}
    </div>
  );
}
