import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkSession, COOKIE } from "@/lib/auth";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const MAX_BYTES = 2 * 1024 * 1024;
const OK_MIME: Record<string, string> = {
  "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp", "image/svg+xml": ".svg",
};

// POST /api/admin/upload (multipart, campo "file") — salva em /public/uploads.
export async function POST(req: Request) {
  if (!checkSession(cookies().get(COOKIE)?.value))
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
  } catch { /* noop */ }
  if (!file) return NextResponse.json({ error: "Arquivo ausente." }, { status: 400 });
  if (file.size <= 0 || file.size > MAX_BYTES)
    return NextResponse.json({ error: "Arquivo deve ter até 2 MB." }, { status: 400 });
  const ext = OK_MIME[file.type];
  if (!ext) return NextResponse.json({ error: "Somente PNG, JPG, WEBP ou SVG." }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  // Checagem de assinatura para PNG/JPG/WEBP (SVG é texto — validado pelo mime + tamanho)
  if (ext === ".png" && !buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return NextResponse.json({ error: "PNG inválido." }, { status: 400 });
  if (ext === ".jpg" && !(buf[0] === 0xff && buf[1] === 0xd8))
    return NextResponse.json({ error: "JPG inválido." }, { status: 400 });
  if (ext === ".webp" && !(buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP"))
    return NextResponse.json({ error: "WEBP inválido." }, { status: 400 });
  const dir = path.join(process.cwd(), "data", "uploads");
  fs.mkdirSync(dir, { recursive: true });
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  fs.writeFileSync(path.join(dir, name), buf);
  return NextResponse.json({ ok: true, url: `/api/arquivos/${name}` });
}
