"use client";
import { useEffect, useState } from "react";

export function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}

export function InstallApp() {
  const [evt, setEvt] = useState<any>(null);
  const [ios, setIos] = useState(false);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const onPrompt = (e: any) => { e.preventDefault(); setEvt(e); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    const ua = navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua) && !(window as any).MSStream;
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;
    // Somente mobile: no computador o banner nunca aparece.
    setMobile(/android|iphone|ipad|ipod|mobile/i.test(ua) || (navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) < 820));
    setIos(isIos && !standalone);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);
  async function instalar() {
    if (!evt) return;
    evt.prompt();
    await evt.userChoice.catch(() => {});
    setEvt(null);
  }
  if (!mobile) return null;
  if (!evt && !ios) return null;
  return (
    <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-accent/60 bg-accent/10 px-4 py-3 text-sm">
      <span className="text-navy"><strong>📲 Instale o app</strong> para buscar viagens mais rápido, direto da tela inicial.</span>
      {evt
        ? <button onClick={instalar} className="btn-primary !py-2 !px-4 text-sm shrink-0">Instalar</button>
        : <span className="text-xs text-slate-600 shrink-0">No iPhone: Compartilhar → “Adicionar à Tela de Início”.</span>}
    </div>
  );
}
