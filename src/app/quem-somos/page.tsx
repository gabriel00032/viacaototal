import { loadDB } from "@/lib/store";
export const metadata = { title: "Quem Somos — Viação Total" };
export default function Page() {
  const db = loadDB();
  return (
    <div className="container-vt py-8 max-w-3xl">
      <h1 className="text-2xl font-black text-total-blue">Quem Somos</h1>
      <p className="mt-3 text-slate-700 whitespace-pre-line">{db.quemSomos.texto}</p>
    </div>
  );
}
