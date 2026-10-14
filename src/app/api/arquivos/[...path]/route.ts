import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MIME: Record<string, string> = {
  png: "image/png", jpg: "image/jpeg", webp: "image/webp", svg: "image/svg+xml",
};

// GET /api/arquivos/<nome> — serve uploads do disco a cada acesso
// (sem depender de restart do servidor).
export async function GET(_req: Request, { params }: { params: { path: string[] } }) {
  const name = (params.path || []).join("/");
  if (!/^[a-z0-9-]+\.(png|jpg|webp|svg)$/i.test(name))
    return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 });
  const file = path.join(process.cwd(), "data", "uploads", name);
  if (!file.startsWith(path.join(process.cwd(), "data", "uploads")))
    return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 });
  if (!fs.existsSync(file)) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  const ext = name.split(".").pop()!.toLowerCase();
  const buf = fs.readFileSync(file);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
