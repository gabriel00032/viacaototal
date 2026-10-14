import { describe, it, expect } from "vitest";
import { validateSearch, validateEncomenda, buildWhatsMessage, buildEncomendaMessage, whatsappLink } from "../src/lib/trip";
import { candidatosOficiais, shapeTrips, brl, pontoDe, filtrarLocais, extrairTrechos, curto, linhaPercurso } from "../src/lib/schedules";
import { loadDB } from "../src/lib/store";

describe("pesquisa de viagens", () => {
  it("aceita origem/destino/data válidos", () => {
    expect(validateSearch({ origem: "Cuiabá", destino: "Campo Grande", dataIda: "2026-12-01" })).toEqual([]);
  });
  it("bloqueia origem igual ao destino", () => {
    expect(validateSearch({ origem: "Cuiabá", destino: "cuiabá", dataIda: "2026-12-01" }).join()).toMatch(/iguais/);
  });
  it("bloqueia data inválida e campos vazios", () => {
    expect(validateSearch({ origem: "", destino: "", dataIda: "" }).length).toBeGreaterThan(0);
    expect(validateSearch({ origem: "A", destino: "B", dataIda: "invalida" }).join()).toMatch(/inválida/);
  });
  it("permite data passada para consulta de referência (exemplo oficial)", () => {
    expect(validateSearch({ origem: "A", destino: "B", dataIda: "2020-01-01" })).toEqual([]);
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
      departureDateTime: "2027-03-10T11:05:00", arrivalDateTime: "2027-03-11T12:35:00",
      duration: { hours: 25, minutes: 30 }, classOfServiceName: "EXECUTIVO",
      availableSeats: 25, price: 380, originalPrice: 726.19,
      departureLocationName: "RONDONOPOLIS - MT ( TERMINAL RODOVIARIO )",
      arrivalLocationName: "SAO PAULO-SP (TERMINAL RODOVIARIO BARRA FUNDA)",
      boardingPlatform: "03 à 06", companyName: "VIACAO TOTAL", departureArrivalDiffDays: 1,
      tripKey: { tripType: 2 },
      routes: [
        { departureLocationName: "RONDONOPOLIS - MT ( TERMINAL RODOVIARIO )", arrivalLocationName: "CAMPO GRANDE - MS ( TERMINAL RODOVIARIO )", departureDateTime: { hour: 11, minute: 5 }, arrivalDateTime: { hour: 19, minute: 15 }, scheduleName: "CUIABA(MT) - LONDRINA(PR) " },
        { departureLocationName: "CAMPO GRANDE - MS ( TERMINAL RODOVIARIO )", arrivalLocationName: "SAO PAULO-SP (TERMINAL RODOVIARIO BARRA FUNDA)", departureDateTime: { hour: 20, minute: 30 }, arrivalDateTime: { hour: 12, minute: 35 }, scheduleName: "CAMPO GRANDE(MS) - SAO PAULO(SP) " },
      ],
    };
    const [c] = shapeTrips({ trips: [conn] }, "2027-03-10");
    expect(c.conexao).toBe(true);
    expect(c.diasDepois).toBe(1);
    expect(c.plataforma).toBe("03 à 06");
    expect(c.empresa).toBe("VIACAO TOTAL");
    expect(c.trechos.length).toBe(2);
    expect(c.trechos[0]).toMatchObject({ partida: "11:05", chegada: "19:15", linha: "CUIABA(MT) - LONDRINA(PR)" });
    expect(c.trechos[1]).toMatchObject({ partida: "20:30", chegada: "12:35", linha: "CAMPO GRANDE(MS) - SAO PAULO(SP)" });
    expect(extrairTrechos({ routes: [{ tripKey: {} }] })).toEqual([]);
    const msg = buildWhatsMessage({ origem: "A", destino: "C", dataIda: "2026-12-01", horario: "08:00", tipo: "ida", detalhes: ["Viagem COM CONEXÃO (troca de ônibus no trajeto)"] });
    expect(msg).toMatch(/COM CONEXÃO/);
  });
  it("monta a linha de percurso encadeada como no original", () => {    expect(curto("RONDONOPOLIS - MT ( TERMINAL RODOVIARIO )")).toBe("Rondonopolis");
    expect(curto("SAO PAULO-SP (TERMINAL RODOVIARIO BARRA FUNDA)")).toBe("Sao Paulo");
    expect(curto("CUIABA (COXIPO) - MT")).toBe("Cuiaba");
    const linha = linhaPercurso([
      { origem: "RONDONOPOLIS - MT ( TERMINAL RODOVIARIO )", destino: "CAMPO GRANDE - MS ( TERMINAL RODOVIARIO )", partida: "11:05", chegada: "19:15", linha: null },
      { origem: "CAMPO GRANDE - MS ( TERMINAL RODOVIARIO )", destino: "SAO PAULO-SP (TERMINAL RODOVIARIO BARRA FUNDA)", partida: "20:30", chegada: "12:35", linha: null },
    ]);
    expect(linha).toBe("Rondonopolis (11:05) → Campo Grande (19:15) → Sao Paulo (12:35)");
  });
  it("marca partidas de hoje já ocorridas como 'partiu' em vez de ocultar", () => {    const hoje = new Date().toISOString().slice(0, 10);
    const raw = { trips: [
      { departureDateTime: `${hoje}T00:01:00`, arrivalDateTime: `${hoje}T12:00:00`, duration: { hours: 11, minutes: 59 }, classOfServiceName: "EXECUTIVO", availableSeats: 1, price: 100, departureLocationName: "A", arrivalLocationName: "B" },
    ]};
    const [t] = shapeTrips(raw, hoje);
    expect(t.partiu).toBe(true);
  });
  it("banco possui todas as seções editáveis pelo admin", () => {
    const db = loadDB();
    expect(db.hero.tituloDestaque).toBeTruthy();
    expect(db.hero.fundoUrl).toBeDefined();
    expect(db.marca.nomeB).toBeTruthy();
    expect(db.rodape.sobre).toBeDefined();
    expect(db.rodape.notaEsquerda).toMatch(/Viação Total/);
    expect(db.rodape.notaDireita).toBeDefined();
    expect(db.minis.length).toBeGreaterThan(0);
    expect(db.difCards.length).toBeGreaterThan(0);
    expect(db.cta.titulo).toBeTruthy();
    expect(db.pontos.length).toBeGreaterThan(0);
    expect(db.quemSomos.texto).toBeTruthy();
    expect(db.faqs.length).toBeGreaterThan(0);
    expect(Array.isArray(db.schedules)).toBe(true);
  });
});
