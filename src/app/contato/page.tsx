import { loadDB } from "@/lib/store";
export const metadata = { title: "Contato — Viação Total" };
export default function Page() {
  const db = loadDB();
  const wa = db.settings.salesWhatsapp;
  return (
    <div className="container-vt py-8 max-w-2xl">
      <h1 className="text-2xl font-black text-total-blue">Contato e WhatsApp comercial</h1>
      <div className="card p-5 mt-4 text-sm space-y-2">
        <p><strong>SAC:</strong> {db.settings.sac} (24h)</p>
        <p><strong>E-mail:</strong> {db.settings.email}</p>
        <p><strong>Comercial:</strong> {db.settings.atendimento}</p>
        <p><strong>Endereço:</strong> {db.settings.endereco}</p>
        {wa
          ? <a className="btn-whats mt-2" target="_blank" href={`https://wa.me/${wa.replace(/\D/g, "")}?text=${encodeURIComponent("Olá! Gostaria de atendimento da Viação Total.")}`}>Compre pelo WhatsApp</a>
          : <p className="text-amber-700">WhatsApp comercial em configuração. Use o SAC ou e-mail acima.</p>}
      </div>
    </div>
  );
}
