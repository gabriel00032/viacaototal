export const metadata = { title: "Dúvidas frequentes — Viação Total" };
const faqs = [
  { q: "Como compro pelo WhatsApp?", a: "Pesquise a viagem no site, clique em Consultar e envie a mensagem pronta no WhatsApp. Um vendedor confirma disponibilidade, valor e condições." },
  { q: "Horários de guichês?", a: "Variam por ponto de venda. Consulte a página Horários ou fale com o comercial — não publicamos horários não confirmados." },
  { q: "Transporte de animais?", a: "Siga as regras oficiais da empresa e da ANTT. Confirme condições com a equipe comercial antes da viagem." },
  { q: "Remarcação e reembolso?", a: "Conforme regras da tarifa e legislação. Solicite pelo canal oficial; não garantimos condições sem confirmação." },
  { q: "Aluguel de ônibus?", a: "Solicite proposta pelo WhatsApp comercial informando data, trecho e número de passageiros." },
];
export default function Page() {
  return (
    <div className="container-vt py-8 max-w-3xl">
      <h1 className="text-2xl font-black text-total-blue">Dúvidas frequentes</h1>
      <div className="mt-4 space-y-3">{faqs.map(f => <details key={f.q} className="card p-4"><summary className="font-semibold cursor-pointer">{f.q}</summary><p className="text-sm text-slate-600 mt-2">{f.a}</p></details>)}</div>
    </div>
  );
}
