import Link from "next/link";
export const metadata = { title: "Sem conexão — Viação Total" };
export default function Page() {
  return (
    <div className="container-vt py-16 text-center max-w-md">
      <p className="text-5xl">🚌</p>
      <h1 className="font-display text-2xl font-extrabold text-navy mt-4">Você está offline</h1>
      <p className="text-sm text-slate-600 mt-2">Horários e preços exigem internet, pois são consultados ao vivo. Verifique sua conexão e tente de novo — ou chame no WhatsApp.</p>
      <div className="flex gap-2 justify-center mt-6">
        <Link href="/" className="btn-navy">Tentar de novo</Link>
        <Link href="/contato" className="btn-whats">WhatsApp</Link>
      </div>
    </div>
  );
}
