import { NextResponse } from "next/server";
import { loadDB, saveDB } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const { rota } = await req.json();
    if (!rota || typeof rota !== "string") return NextResponse.json({ ok: false }, { status: 400 });
    const db = loadDB();
    const found = db.clicks.find(c => c.rota === rota);
    if (found) found.total += 1; else db.clicks.push({ rota, total: 1 });
    saveDB(db);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ ok: false }, { status: 500 }); }
}
