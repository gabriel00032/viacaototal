import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Viação Total — Passagens de ônibus",
  description: "Consulte passagens da Viação Total e finalize pelo WhatsApp. Destinos, horários, pontos de venda e diferenciais.",
  openGraph: { title: "Viação Total", description: "Consulte sua passagem e compre pelo WhatsApp.", type: "website" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Header />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
