// Validação + mensagem WhatsApp (testado em tests/whatsapp.test.ts)
export interface SearchInput {
  origem: string;
  destino: string;
  dataIda: string; // YYYY-MM-DD
  horario?: string;
  passageiros?: number;
  tipo?: "ida" | "ida_volta";
  dataVolta?: string;
}

export function validateSearch(s: SearchInput): string[] {
  const errors: string[] = [];
  if (!s.origem?.trim()) errors.push("Selecione a origem.");
  if (!s.destino?.trim()) errors.push("Selecione o destino.");
  if (s.origem?.trim() && s.destino?.trim() &&
      s.origem.trim().toLowerCase() === s.destino.trim().toLowerCase())
    errors.push("Origem e destino não podem ser iguais.");
  if (!s.dataIda) errors.push("Escolha a data da viagem.");
  else {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const d = new Date(s.dataIda + "T12:00:00");
    if (isNaN(d.getTime())) errors.push("Data inválida.");
    else if (d < hoje) errors.push("A data não pode estar no passado.");
  }
  if (s.tipo === "ida_volta") {
    if (!s.dataVolta) errors.push("Escolha a data de volta.");
    else if (s.dataIda && s.dataVolta < s.dataIda) errors.push("Volta anterior à ida.");
  }
  if (s.passageiros !== undefined && (s.passageiros < 1 || s.passageiros > 10))
    errors.push("Passageiros deve ser de 1 a 10.");
  return errors;
}

export function formatBRDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function buildWhatsMessage(s: SearchInput): string {
  const lines = [
    "Olá! Gostaria de consultar e comprar uma passagem da Viação Total.",
    "",
    `Origem: ${s.origem}`,
    `Destino: ${s.destino}`,
    `Data da viagem: ${formatBRDate(s.dataIda)}`,
  ];
  if (s.horario) lines.push(`Horário desejado: ${s.horario}`);
  if (s.passageiros) lines.push(`Passageiros: ${s.passageiros}`);
  if (s.tipo === "ida_volta" && s.dataVolta)
    lines.push(`Volta: ${formatBRDate(s.dataVolta)}`);
  lines.push("", "Poderiam confirmar a disponibilidade, o valor atualizado e as condições da viagem?");
  return lines.join("\n");
}

export function whatsappLink(phone: string, message: string): string | null {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
