# Extração oficial — www.viajetotal.com.br (13/10/2026)

Método: inspeção do bundle Angular (SMARTBUS) + chamadas aos endpoints públicos
usando o token público do próprio site (`sitetotal`). Somente leitura, sem
autenticação privada, sem escrita, sem contorno de proteção.

## Plataforma e hosts

- Site: SPA Angular, `main.*.js` — dados 100% dinâmicos via API.
- `GET /config/config.json` → hosts:
  - schedule: `https://prod-schedule-api-smartbus.smarttravelit.com`
  - sale: `https://prod-sale-api-smartbus.smarttravelit.com`
  - core: `https://prod-core-api-smartbus.smarttravelit.com`
  - pricing: `https://prod-pricing-api-smartbus.smarttravelit.com`
  - customer: `https://prod-customer-api-smartbus.smarttravelit.com`
  - gateway (proxy usado pelo site): `https://prod-motta-proxy-api-smartbus.smarttravelit.com`
  - `productId: 487a774c-0485-401f-84d2-61ed508becc3`
- `GET /config/vtr.json` (config da empresa no site):
  - `locationsCompanies: "1,2,3,4,5"`, `idTenant: 8`, `origin: 8`
  - `idPointOfSale: 1031`, `idUser: 2514`, `outletIdUser: 3508`
  - `identifierWorkstation: 306C3125-CF50-40BA-AB8B-C2C2736E1629`
  - **`whatsAppLink: phone=5511992414101`**, `whatsAppText: Compre pelo whatsapp`, `showWhatsApp: true`
  - Headers exigidos no gateway: `Authorization: Bearer <token sitetotal>`,
    `IdentifierWorkstation`, `ProductId`, `IdUser`, `Content-Type: application/json`.
  - Padrão de URL no gateway: `{gateway}/app/{controller}/{action}`.

## WhatsApp oficial

`5511992414101` (texto "Compre pelo whatsapp") — cadastrado como padrão em
`data/db.json → settings.salesWhatsapp`. A agência pode trocar pelo número
comercial próprio em `/admin/configuracoes`. SAC 0800 085 8080 NÃO é WhatsApp.

## Localidades — 469 registros

- Endpoint: `POST {gateway}/app/schedule/location/GetLocations`
- Body: `{"Type":"all","SearchTerm":"","companies":[1,2,3,4,5],"DepartureLocationName":"","Range":1000}`
- Resultado: 469 localidades com `idDepartureLocation` + nome oficial.
- Arquivo: `data/locations-official.json` (id + nome, sem duplicatas).
- Cobertura: MS, MT, CE, SP, GO, MG, PR, RJ, RO, PE, PB, DF, SC, RS, ES, AC e outros.

## Ranking real de procura (GetLocationsRanking)

- Endpoint: `POST {gateway}/app/schedule/location/GetLocationsRanking`
- Body: `{"LocationName":"<nome oficial>","Companies":[1,2,3,4,5]}`
- Retorna origens que buscam aquele destino + `quantity` (buscas reais):

| Destino | Top origens (buscas) |
|---|---|
| CAMPO GRANDE (id 50) | Uberlândia 535, Assis 217, Bandeirantes-Posto 184, Bandeirantes 134, Serraria 82, São Gabriel do Oeste 63 |
| SÃO JOSÉ DO RIO PRETO (id 183) | Araguari 201, Dourados 201, Presidente Prudente 186, Anápolis 177, Figueira/Naviraí 79, Xavantes 79 |
| BELO HORIZONTE (id 13) | Divinópolis 373, Anaurilândia 122, AC Faz Someco 79, Estrada Nova 79, Rolândia 61, Anhanduí 9 |
| BRASÍLIA (id 3) | Itumbiara 387, Jataí 363, Presidente Prudente 274, Cuiabá 16, São Gabriel do Oeste 16, Piracicaba 9 |
| GOIÂNIA (id 5) | Uberlândia 396, Bandeirantes-Posto 183, Assis 27, Piracicaba 18, Bandeirantes 8, Rondonópolis 8 |
| SÃO PAULO Barra Funda (id 184) | Amandina 229, Bandeirantes 167, Jundiaí 27, Bataguassu 26, Cascavel-PR 24, Serraria 9 |
| LONDRINA (id 149) | Amandina 132, Deodápolis 114, Nova Andradina-Posto 31, Ponte Rio Guiraí 18, Bernardes 18, Jaciara 13 |
| JOÃO PESSOA (id 288) | Recife 322, Recife (Caxanga) 322 |
| RECIFE (id 287) | João Pessoa 322 |

IDs úteis: BH 13, Brasília 3, Campo Grande 50 (+Sagitarius 333), Cuiabá 141 (+Coxipó 388),
Goiânia 5 (+Campinas 396), Londrina 149, Rio Preto 183, Recife 287 (+Caxanga 286, AB 293, DT 294),
João Pessoa 288 (+Gauchinha 448), São Paulo Barra Funda 184.

## Preços mínimos (cache vazio)

- `POST {gateway}/app/sale/GetCachedMinimumPrices` `{IdDepartureLocation, IdArrivalLocation, StartingDate}`
  e `POST {gateway}/app/sale/trips/prices/minimumPricesByLocationsName`
  `{departureLocationName, arrivalLocationName, startingDate}` retornaram `[]`
  para os pares testados → cache sem dados no momento. Por isso a home mantém os
  preços "a partir de" dos cartões estáticos auditados, com aviso de confirmação
  comercial. Não inventar preços.

## Tipos de passageiro (localStorage `passengerTypes`)

NORMAL (padrão), BILHETE DE VIAGEM IDOSO 100% e demais regras da empresa.

## Horários em tempo real (fluxo origem → data → horário → WhatsApp)

- Endpoint: `POST {gateway}/app/sale/trips` (serviço `getTrips`, `searchType: 2`).
- Nosso backend: `GET /api/horarios?origem=&destino=&data=` (rota em
  `src/app/api/horarios/route.ts`) — mapeia a cidade simplificada para os nomes
  oficiais (`src/lib/schedules.ts`, até 2 pontos por lado), consulta os pares em
  paralelo e devolve partidas ordenadas (hora, chegada, duração, classe,
  assentos, preço ao vivo). Partidas passadas do dia são filtradas.
- Front: `SearchForm` → "Buscar horários" → lista clicável → "Selecionar" abre o
  WhatsApp com origem, destino, data, horário, chegada e valor visto (sempre com
  pedido de confirmação comercial). Sem resultados ou falha → mensagem honesta +
  botão genérico de consulta. Nada é exibido sem vir da API.
- Contrato fiel ao site oficial (capturado via instrumentação da busca real):
  `searchType: 2`, `passengers: [{idPassengerClassification: 1, quantity: N}]`
  (com `null` a API devolve menos viagens ou nenhuma — ex.: Cuiabá→Campo Grande
  com nomes formatados: `null` → 0, array → 2), `seats` = nº de passageiros.
  Viagens com `isConnection: true` exibem selo "COM CONEXÃO" e linha na mensagem.
- Token: `VIAJETOTAL_API_TOKEN` (`.env.local`, fora do git) — token público do
  site oficial, só leitura, expira ~10/2027. Renovação: abrir viajetotal.com.br
  e copiar `access_token` de `localStorage AuthService_TOKEN_INFO_KEY`.

## Pendente (não exposto publicamente)

- Horários por rota/dia (só via busca com data — exige fluxo de compra).
- Imagens oficiais dos cartões "mais buscadas" (estáticas no CMS).
- Pontos de venda/guichês com endereço e horário.
