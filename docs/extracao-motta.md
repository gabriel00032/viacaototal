# Extração oficial — www.motta.com.br (13/10/2026)

Método: mesmo da Viação Total (bundle Angular SMARTBUS + endpoints públicos com o
token público do próprio site `sitemotta1`). Somente leitura.

## Plataforma e config (`/config/config.json` + `/config/motta.json`)

- Mesma plataforma e gateway da Viação Total:
  `https://prod-motta-proxy-api-smartbus.smarttravelit.com`
  (o nome do proxy indica grupo compartilhado).
- `company: "motta"`, `productId: 487a774c-0485-401f-84d2-61ed508becc3` (igual).
- `locationsCompanies: "1"`, `idTenant: 6`, `origin: 6`, `idPointOfSale: 613`,
  `idUser: 1302`, `outletIdUser: 0`,
  `identifierWorkstation: C1DBA2D5-A6EC-43C4-9ED2-CD5AD765C798`,
  `userAuthBearer: sitemotta1`.
- **WhatsApp oficial: `phone=551833559843`**, texto "Compre pelo Whatsapp",
  `showWhatsApp: true`. Links: `https://wa.me/551833559843` e
  `api.whatsapp.com/send?phone=551833559843`.
- Token público (`SITEMOTTA1`, IdUser 1302, escopo `1|w,3|w,2|w,5|w`).

## Localidades — as mesmas 469 da Viação Total

- `POST {gateway}/app/schedule/location/GetLocations`
  `{Type:"all",SearchTerm:"",companies:[1],DepartureLocationName:"",Range:1000}`
  → **469 registros, nomes idênticos** (conferidos início/meio/fim).
- Reutilizar `data/locations-official.json` — não duplicado aqui.

## Passagens mais buscadas (home, ordem original)

1. DOURADOS → Sao Paulo — a partir de R$ 627,38
2. LONDRINA → Campo Grande — a partir de R$ 447,64
3. SAO PAULO → Ponta Pora — a partir de R$ 494,32
4. SAO PAULO → Bataguassu — a partir de R$ 288,87
5. NOVA ALVORADA DO SUL → Sao Paulo — a partir de R$ 590,04

## Diferenciais

- Faixa: Custo Benefício, Embarque Digital, 100% Seguro, Ônibus Sanitizado,
  Remarcação Fácil. Seção: "Diferenciais Viação Motta".

## Institucional (`/institucional`)

- Fundada em **31/03/1967** em Presidente Prudente-SP; 57 anos; **61 linhas**,
  **79 municípios** (SP, MT, MS, PR, MG, GO, DF); **20 milhões de km/ano**;
  **200+ agências**; canais internet + SAC.
- Missão: "Transportar pessoas com regularidade, segurança, conforto e
  cordialidade..." + Objetivos (4 itens) — texto integral auditado em 13/10/2026.
- Slogan: "Viação Motta, missão de transportar pessoas com segurança e qualidade."

## Contato (`/contato`)

- Suporte online **0800 728 9898**, telefone 24h; e-mail seg–sex 08:00–18:00
  (endereço de e-mail via formulário).

## Guichês (`/horarios-de-agencias`) — 54 cidades

AGUA CLARA, AMANDINA, AMERICANA, ANAURILANDIA, ARARAQUARA, ASSIS, BANDEIRANTES,
BARRETOS, BATAGUASSU, BATAYPORA, BAURU, BELO HORIZONTE, BRASILIA, CAMPINAS,
CAMPO GRANDE, COXIM, CUIABA, DEODAPOLIS, DOURADOS, FATIMA DO SUL,
GLORIA DE DOURADOS, GOIANIA, IVINHEMA, JARAGUARI, JATAI, JAU, LONDRINA, NAVIRAI,
NOVA ALVORADA DO SUL, NOVA ANDRADINA, OSASCO, OURINHOS, PEDRO GOMES, PIRACICABA,
PONTA PORA, PRESIDENTE BERNARDES, PRESIDENTE EPITACIO, PRESIDENTE PRUDENTE,
PRESIDENTE VENCESLAU, RIBAS DO RIO PARDO, RIBEIRÃO PRETO, RIO BRILHANTE,
RIO VERDE DE MATO GROSSO, ROLANDIA, RONDONOPOLIS, SAO CARLOS,
SAO GABRIEL DO OESTE, SAO JOSE DO RIO PRETO, SAO PAULO, SONORA, TRES LAGOAS,
UBERABA, UBERLÂNDIA.

Exemplo — CAMPO GRANDE (9 guichês): AVENIDA NELLY MARTINS 467 (seg–sáb 08–18);
AVENIDA BANDEIRANTES 1135 (seg–sex 08–18, sáb 08–16); RUA 13 DE MAIO 1349
(seg–sex 08–18, sáb 08–16); AV CORONEL ANTONINO 1812, RUA DOS CITRINOS 60,
AV GURY MARQUES 1215, AV. GURY MARQUES 1215, AV. PRES. TANCREDO NEVES 1000,
RUA 26 DE AGOSTO 577 (estes: sáb 00h–23h59). Domingo: fechado em todos.

## Links e redes

- Rotas: `/onibus` (destinos), `/institucional`, `/horarios-de-agencias`,
  `/contato`, `/meuspedidos/busca`, `/privacidade`, `/termos`.
- Redes: instagram.com/viacaomotta, linkedin/company/viacaomotta,
  facebook/viacaomottaoficial, twitter/viacaomotta_ofc, tiktok/@viacaomotta.
- Institucional: Quem Somos, Nossa Frota, Trabalhe conosco, Fale Conosco,
  Dúvidas frequentes, Relatórios Lei 14611/23. Vendas: Passagens, Meus pedidos,
  Transporte de Animais, Aluguel de ônibus, Regulamentos, Guia de Orientação.
  Úteis: Rastreamento de Carga, 2ª Via de Fatura.

## Observações de API

- `GetLocationsRanking` com token Motta → 401 (escopo); usar ranking da Total
  como referência de demanda do grupo.
- Buscas `sale/trips` testadas (PP→SP, DOURADOS→SP, 20–22/10) retornaram `[]` —
  o próprio site oficial exibe "Nenhuma viagem encontrada nesse trecho/data"
  para PP→SP em 20/10. Resultado genuíno, não falha de parâmetro.
- Horários de viagem: somente via busca com data (sem horários publicados
  estaticamente); preços dos cartões são "a partir de".
