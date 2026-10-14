// Gera os ícones PWA (PNG puro via zlib, sem dependências).
// npm run icons  ->  public/icons/*.png
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

function crc(buf) {
  if (!crc.t) {
    crc.t = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crc.t[n] = c;
    }
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = crc.t[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const cs = Buffer.alloc(4); cs.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, cs]);
}
// Tile navy com "T" (barra vertical + horizontal), faixa laranja na base.
function draw(size, pad) {
  const S = size, buf = Buffer.alloc(S * S * 4);
  const navy = [12, 30, 70, 255], orange = [242, 147, 13, 255], white = [255, 255, 255, 255];
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = (y * S + x) * 4;
    let c = navy;
    if (y >= S - Math.floor(S * 0.12)) c = orange; // faixa base
    else {
      const t = pad, bw = Math.floor(S * 0.16), top = pad + Math.floor(S * 0.06), th = Math.floor(S * 0.14);
      const cx0 = Math.floor(S / 2 - bw / 2), cx1 = Math.floor(S / 2 + bw / 2);
      const tx0 = pad, tx1 = S - pad;
      if ((x >= cx0 && x < cx1 && y >= top) || (y >= top && y < top + th && x >= tx0 && x < tx1)) c = white;
    }
    buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = c[3];
  }
  return buf;
}
function png(size, pad) {
  const raw = draw(size, pad);
  const scan = [];
  for (let y = 0; y < size; y++) scan.push(Buffer.concat([Buffer.from([0]), raw.subarray(y * size * 4, (y + 1) * size * 4)]));
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(Buffer.concat(scan))), chunk("IEND", Buffer.alloc(0))]);
}
const dir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(dir, { recursive: true });
const files = [
  ["icon-192.png", png(192, 24)],
  ["icon-512.png", png(512, 64)],
  ["maskable-512.png", png(512, 110)],
  ["apple-touch-icon.png", png(180, 22)],
];
for (const [n, b] of files) { fs.writeFileSync(path.join(dir, n), b); console.log(n, b.length, "bytes"); }
