import { NextResponse } from "next/server";
import { loadDB } from "@/lib/store";

// GET público: aparência da tela de login (textos, fundo e marca).
export async function GET() {
  const db = loadDB();
  return NextResponse.json({ marca: db.marca, telaLogin: db.telaLogin });
}
