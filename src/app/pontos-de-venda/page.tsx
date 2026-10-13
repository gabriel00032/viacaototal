export const metadata = { title: "Pontos de venda — Viação Total" };
const pontos = [
  { nome: "Matriz — Bayeux/PB (endereço institucional, confirmar se é guichê)", end: "Rua Santa Clara, Nº 1007, Sala 01, Mário Andreazza, Bayeux - PB, CEP 58.309-614", tel: "SAC 0800 085 8080" }
];
export default function Page() {
  return (
    <div className="container-vt py-8">
      <h1 className="text-2xl font-black text-total-blue">Pontos de venda</h1>
      <p className="text-sm text-slate-500 mt-1">Somente pontos confirmados. O endereço abaixo é institucional — confirmar atualidade e finalidade antes de tratá-lo como guichê.</p>
      <div className="grid gap-3 mt-4">{pontos.map(p => <div key={p.nome} className="card p-4"><strong>{p.nome}</strong><p className="text-sm text-slate-600">{p.end}</p><p className="text-sm">{p.tel}</p><a className="text-sm underline" target="_blank" href="https://www.google.com/maps/search/?api=1&query=Rua+Santa+Clara+1007+Bayeux+PB">Ver no mapa</a></div>)}</div>
    </div>
  );
}
