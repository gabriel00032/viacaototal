import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SwRegister } from "@/components/Pwa";
import { loadDB } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Viação Total | Televendas — Passagens de ônibus",
  description: "Orçamento de passagens da Viação Total. Escolha origem, destino e data e fale direto no WhatsApp.",
  openGraph: { title: "Viação Total | Televendas", description: "Sua viagem reservada em minutos pelo WhatsApp.", type: "website" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  let marca = { nomeA: "VIAÇÃO", nomeB: "TOTAL", subtitulo: "Televendas autorizado Viação Total", logoUrl: "" };
  try { marca = loadDB().marca; } catch { /* padrão */ }
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0c1e46" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <SwRegister />
        <Header marca={marca} />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
