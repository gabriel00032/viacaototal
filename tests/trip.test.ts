import { describe, it, expect } from "vitest";
import { validateSearch, validateEncomenda, buildWhatsMessage, buildEncomendaMessage, whatsappLink } from "../src/lib/trip";
import { candidatosOficiais, shapeTrips, brl, pontoDe, filtrarLocais, extrairTrechos } from "../src/lib/schedules";

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
  it("valida e monta mensagem de encomenda", () => {
    expect(validateEncomenda({ origem: "Cuiabá", destino: "Cuiabá", data: "2026-12-01" }).join()).toMatch(/iguais/);
    const msg = buildEncomendaMessage({ origem: "Recife", destino: "João Pessoa", data: "2026-12-01", descricao: "Caixa 5kg" });
    expect(msg).toMatch(/orçamento de encomenda/);
    expect(msg).toMatch(/Caixa 5kg/);
  });
  it("mapeia cidades para nomes oficiais sem inventar", () => {
    expect(candidatosOficiais("Cuiabá - MT")).toContain("CUIABA - MT ( TERMINAL RODOVIARIO )");
    expect(candidatosOficiais("Cidade Inexistente - XX")).toEqual([]);
  });
  it("formata viagens reais da API e ordena por partida", () => {
    const raw = { trips: [
      { departureDateTime: "2026-12-01T19:15:00", arrivalDateTime: "2026-12-02T07:30:00", duration: { hours: 12, minutes: 15 }, classOfServiceName: "CONVENCIONAL", availableSeats: 5, price: 173.9, originalPrice: 332.98, departureLocationName: "A", arrivalLocationName: "B" },
      { departureDateTime: "2026-12-01T07:00:00", arrivalDateTime: "2026-12-01T19:15:00", duration: { hours: 12, minutes: 15 }, classOfServiceName: "EXECUTIVO", availableSeats: 10, price: null, originalPrice: null, departureLocationName: "A", arrivalLocationName: "B" },
    ]};
    const trips = shapeTrips(raw, "2026-12-01");
    expect(trips[0].partida).toBe("07:00");
    expect(trips[1].preco).toBe(173.9);
    expect(brl(173.9)).toMatch(/173,90/);
    expect(brl(null)).toBe("a confirmar");
  });
  it("inclui horário e detalhes na mensagem do WhatsApp", () => {
    const msg = buildWhatsMessage({ origem: "A", destino: "B", dataIda: "2026-12-01", horario: "07:00", passageiros: 2, tipo: "ida", detalhes: ["Horário: 07:00 (chegada prevista 19:15)"] });
    expect(msg).toMatch(/Horário desejado: 07:00/);
    expect(msg).toMatch(/chegada prevista/);
  });
  it("rotula pontos de embarque e não colapsa classes diferentes", () => {    expect(pontoDe("CAMPO GRANDE - MS (SAGITARIUS)")).toBe("Sagitarius");
    expect(pontoDe("CUIABA - MT ( TERMINAL RODOVIARIO )")).toBe("Terminal Rodoviário");
    expect(pontoDe("RECIFE - PE")).toBe("Ponto principal");
    const raw = { trips: [
      { departureDateTime: "2026-12-01T20:30:00", arrivalDateTime: "2026-12-01T23:00:00", duration: { hours: 2, minutes: 30 }, classOfServiceName: "EXECUTIVO", availableSeats: 44, price: 279.04, departureLocationName: "A", arrivalLocationName: "B" },
      { departureDateTime: "2026-12-01T20:30:00", arrivalDateTime: "2026-12-01T23:00:00", duration: { hours: 2, minutes: 30 }, classOfServiceName: "LEITO", availableSeats: 8, price: 381.6, departureLocationName: "A", arrivalLocationName: "B" },
    ]};
    const trips = shapeTrips(raw, "2026-12-01");
    expect(trips.length).toBe(2);
    expect(trips.map(t => t.classe).sort()).toEqual(["EXECUTIVO", "LEITO"]);
  });
  it("filtra localidades sem ofuscar: populares primeiro, limite respeitado", () => {
    const todas = ["CUIABA - MT ( TERMINAL RODOVIARIO )", "CUIABA (COXIPO) - MT", "CAMPO GRANDE - MS ( TERMINAL RODOVIARIO )", "RECIFE - PE"];
    const pop = ["CAMPO GRANDE - MS ( TERMINAL RODOVIARIO )"];
    expect(filtrarLocais("", todas, pop)).toEqual(["CAMPO GRANDE - MS ( TERMINAL RODOVIARIO )"]);
    const r = filtrarLocais("cuiaba", todas, pop);
    expect(r.length).toBe(2);
    expect(filtrarLocais("zzz", todas, pop)).toEqual([]);
    const muitas = Array.from({ length: 50 }, (_, i) => `CID${i} - MS`);
    expect(filtrarLocais("cid", muitas, []).length).toBeLessThanOrEqual(30);
  });
  it("detecta conexão (tripType 2) e extrai o percurso trecho a trecho", () => {
    const conn = {
      departureDateTime: "2026-12-01T08:00:00", arrivalDateTime: "2026-12-01T20:00:00",
      duration: { hours: 12, minutes: 0 }, classOfServiceName: "CONVENCIONAL",
      availableSeats: 10, price: 200, departureLocationName: "A", arrivalLocationName: "C",
      tripKey: { tripType: 2 },
      routes: [
        { departureLocationName: "A", arrivalLocationName: "B", departureDateTime: "2026-12-01T08:00:00", arrivalDateTime: "2026-12-01T12:00:00" },
        { departureLocationName: "B", arrivalLocationName: "C", departureDateTime: "2026-12-01T14:00:00", arrivalDateTime: "2026-12-01T20:00:00" },
      ],
    };
    const [c] = shapeTrips({ trips: [conn] }, "2026-12-01");
    expect(c.conexao).toBe(true);
    expect(c.trechos.length).toBe(2);
    expect(c.trechos[0]).toMatchObject({ origem: "A", destino: "B", partida: "08:00", chegada: "12:00" });
    expect(c.trechos[1]).toMatchObject({ origem: "B", destino: "C", partida: "14:00", chegada: "20:00" });
    expect(extrairTrechos({ routes: [{ tripKey: {} }] })).toEqual([]);
    const msg = buildWhatsMessage({ origem: "A", destino: "C", dataIda: "2026-12-01", horario: "08:00", tipo: "ida", detalhes: ["Viagem COM CONEXÃO (troca de ônibus no trajeto)"] });
    expect(msg).toMatch(/COM CONEXÃO/);
  });
});
