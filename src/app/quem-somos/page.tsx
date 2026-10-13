export const metadata = { title: "Quem Somos — Viação Total" };
export default function Page() {
  return (
    <div className="container-vt py-8 max-w-3xl">
      <h1 className="text-2xl font-black text-total-blue">Quem Somos</h1>
      <p className="mt-3 text-slate-700">A Viação Total opera passagens de ônibus com foco em custo-benefício, embarque digital e atendimento comercial pelo WhatsApp. Textos institucionais completos (história, missão, frota) devem ser publicados a partir de material oficial aprovado pela empresa — nenhum dado foi inventado aqui.</p>
      <ul className="mt-4 text-sm list-disc ml-5 text-slate-600">
        <li>Ano de fundação: <em>pendente de confirmação oficial</em></li>
        <li>Tamanho da frota: <em>pendente de confirmação oficial</em></li>
        <li>Passageiros transportados: <em>pendente de confirmação oficial</em></li>
      </ul>
    </div>
  );
}
