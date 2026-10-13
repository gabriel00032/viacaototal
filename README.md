# Viação Total — Site + Painel Admin

Canal de consulta de viagens com finalização pelo WhatsApp. Sem pagamento online.

## Referências
- Conteúdo/dados: https://www.viajetotal.com.br/ (auditoria 13/10/2026 — seção "Passagens mais buscadas", diferenciais, rodapé).
- Padrão visual e estrutura (modelo televendas): https://logtrans.app/ — cabeçalho com agência + WhatsApp, hero em gradiente com busca por abas Passagem/Encomenda, lista "Principais linhas" em botões por rota. Cores navy/azul/laranja/verde e fontes Sora + Manrope inspiradas na referência. Nenhum dado operacional da Logtrans foi copiado: rotas, preços e contatos são os da Viação Total.

## Auditoria viajetotal.com.br (13/10/2026)
- Diferenciais mini: Custo Benefício, Embarque Digital, 100% Seguro, Remarcação Fácil, Ônibus Sanitizado.
- Seção "Diferenciais Viação Total" + cards "Conforto e Segurança" e "Qualidade nos serviços e bons profissionais".
- "Passagens mais buscadas" (ordem preservada em `data/db.json`):
  1. Belo Horizonte → São José do Rio Preto R$ 305,77
  2. Cuiabá → Campo Grande R$ 173,90
  3. Brasília → Belo Horizonte R$ 199,00
  4. Campo Grande → Brasília R$ 399,00
  5. Campo Grande → Goiânia R$ 380,00
  6. Campo Grande → São José do Rio Preto R$ 351,44
  7. Campo Grande → São Paulo R$ 328,41
  8. Campo Grande → Londrina R$ 329,60
  9. Recife → João Pessoa R$ 27,00
- Rodapé: Rua Santa Clara 1007 Sala 01, Bayeux-PB; SAC 0800 085 8080 (24h); sac@viajetotal.com.br; comercial 08–18h seg–sex.
- Site oficial é SPA Angular (conteúdo dinâmico via API); preços acima são "a partir de", sujeitos a confirmação comercial.

## Pendente de validação
- Número do WhatsApp comercial (configurar em /admin/configuracoes ou SALES_WHATSAPP).
- Horários/partidas (nenhum confirmado ainda — página /horarios exibe estado vazio correto).
- Se o endereço da matriz é guichê; fotos oficiais dos cartões; textos de Missão/frota.

## Rodar local
```
npm install
npm run dev   # http://localhost:3000
npm test      # vitest
npm run build && npm start
```
Admin: `/admin` (usuário `ADMIN_USER`, senha com hash `ADMIN_PASS_HASH`; padrão dev admin/admin123 — trocar em produção).
Gerar hash: `node -e "console.log(require('crypto').createHash('sha256').update('SUA-SENHA').digest('hex'))"`

## Produção (PostgreSQL + Prisma)
O modelo oficial está em `prisma/schema.prisma`. Troque o datasource para `postgresql`, configure `DATABASE_URL`, rode `npx prisma migrate dev` e aponte `SITE_URL`, `SALES_WHATSAPP`, `SESSION_SECRET` (≥32 chars, HTTPS, cookies seguros).

## Checklist de publicação
- [ ] WhatsApp comercial configurado e testado (mensagem com acentos)
- [ ] Preços/horários revalidados contra o site oficial
- [ ] ADMIN_PASS_HASH + SESSION_SECRET definidos
- [ ] Sem links quebrados (`/passagens /destinos /horarios /pontos-de-venda /quem-somos /duvidas-frequentes /contato`)
- [ ] Responsivo + build + testes verdes
