import { describe, it, expect } from "vitest";
import { validateSearch, buildWhatsMessage, whatsappLink } from "../src/lib/trip";

describe("pesquisa de viagens", () => {
  it("aceita origem/destino/data válidos", () => {
    expect(validateSearch({ origem: "Cuiabá", destino: "Campo Grande", dataIda: "2026-12-01" })).toEqual([]);
  });
  it("bloqueia origem igual ao destino", () => {
    expect(validateSearch({ origem: "Cuiabá", destino: "cuiabá", dataIda: "2026-12-01" }).join()).toMatch(/iguais/);
  });
  it("bloqueia data no passado e campos vazios", () => {
    expect(validateSearch({ origem: "", destino: "", dataIda: "" }).length).toBeGreaterThan(0);
    expect(validateSearch({ origem: "A", destino: "B", dataIda: "2020-01-01" }).join()).toMatch(/passado/);
  });
  it("monta mensagem WhatsApp com codificação correta", () => {
    const msg = buildWhatsMessage({ origem: "Cuiabá", destino: "Campo Grande", dataIda: "2026-12-01", horario: "08:00", passageiros: 2, tipo: "ida" });
    expect(msg).toMatch(/Origem: Cuiabá/);
    const url = whatsappLink("5583999990000", msg)!;
    expect(url).toMatch(/^https:\/\/wa\.me\/5583999990000\?text=/);
    expect(decodeURIComponent(url.split("text=")[1])).toMatch(/Poderiam confirmar/);
  });
  it("retorna null sem número comercial configurado", () => {
    expect(whatsappLink("", "oi")).toBeNull();
  });
});
