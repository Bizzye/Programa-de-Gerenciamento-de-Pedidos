# Hakuna — Plano de Construção (V1)

> **Para quem é este documento:** um agente de IA (ou dev) que vai implementar o sistema do zero, tarefa por tarefa, sem precisar tomar decisões de arquitetura.
> **Como ler:** as seções 0–9 são referência (decisões, arquitetura, regras). A seção 10 é a lista de tarefas executáveis, em ordem. Quando uma tarefa citar "ver §X", leia a seção X antes de começar.
> **O projeto antigo** (`Programa-de-Gerenciamento-de-Pedidos`, Angular + Firebase) é **apenas inspiração**. Não copie código dele nem migre dados dele.

---

## Sumário

0. [Regras para o executor (LEIA PRIMEIRO)](#0-regras-para-o-executor-leia-primeiro)
1. [Produto](#1-produto)
2. [Decisões técnicas fixas](#2-decisões-técnicas-fixas)
3. [Arquitetura de código](#3-arquitetura-de-código)
4. [Infraestrutura](#4-infraestrutura)
5. [Modelo de dados (hakuna-loja)](#5-modelo-de-dados-hakuna-loja)
6. [Regras de negócio](#6-regras-de-negócio)
7. [APIs HTTP](#7-apis-http)
8. [Frontends](#8-frontends)
9. [Estratégia de testes](#9-estratégia-de-testes)
10. [Plano de execução (fases e tarefas)](#10-plano-de-execução-fases-e-tarefas)
11. [Definição de pronto global](#11-definição-de-pronto-global)
12. [Backlog futuro](#12-backlog-futuro)

---

## 0. Regras para o executor (LEIA PRIMEIRO)

As regras abaixo valem para **todas** as tarefas. Violar qualquer uma é erro.

### 0.1 Fluxo de trabalho por tarefa

1. Leia a tarefa inteira e as seções referenciadas. Confirme **em qual projeto** ela acontece: `hakuna-loja` ou `hakuna-cardapio`.
2. **Escreva os testes primeiro**, a partir das matrizes da §9 e da própria tarefa. Rode e veja falhar.
3. Implemente o mínimo para os testes passarem.
4. Rode `npm run check` no projeto (lint + typecheck + testes unit/integration/web). **Só avance com tudo verde.**
5. Se a tarefa tiver E2E, rode `npm run test:e2e`.
6. **Um commit por tarefa**, em Conventional Commits, em inglês. Ex.: `feat(catalog): add pause product use case`.
7. Marque a tarefa como concluída no checklist da §10.

### 0.2 Proibições

- ❌ **Monorepo.** São **dois repositórios Git independentes**, cada um com **um único `package.json`**. Nada de workspaces, Turborepo, Nx, Lerna ou pacotes compartilhados por link. O que os dois compartilham é o **contrato OpenAPI** (§3.7).
- ❌ Usar `zustand`, `redux`, `mobx`, `jotai` ou qualquer store global. Estado de servidor = TanStack Query. Estado local = `useState`/`useReducer`/Context.
- ❌ Usar ícones que não sejam de `react-icons/md`. Não instalar `lucide-react` (o shadcn instala por padrão: remova e troque os ícones).
- ❌ Usar `number` com casas decimais para dinheiro. Dinheiro é **sempre inteiro em centavos** (`priceCents: 1250` = R$ 12,50).
- ❌ Confiar em preço vindo do cliente. O servidor sempre recalcula.
- ❌ **Confiar em dado externo sem validar com Zod.** Isso inclui corpo, query, params e headers HTTP; JSON lido do banco; `localStorage`; eventos SSE; KV; variáveis de ambiente; argumentos de CLI; arquivos de configuração. Nunca use `as` para "converter" dado externo (§3.6).
- ❌ Dentro de `src/core` (hakuna-loja), importar de `src/infra`, `src/web`, `src/desktop`, `hono`, `drizzle-orm`, `@libsql/*`, `electron`, `react` ou `node:*`. **Permitido:** `zod` e `@contracts/*`.
- ❌ Dentro de `src/web` (hakuna-loja), importar de `src/core`, `src/infra` ou `src/desktop`. O web só conhece `src/contracts` e HTTP.
- ❌ Usar `any`. Use `unknown` e valide com Zod.
- ❌ Adicionar biblioteca fora da §2 sem registrar ADR em `docs/adr/`.
- ❌ No **hakuna-loja**, usar CDN em runtime (fontes, scripts, imagens). O sistema da loja precisa funcionar sem internet.
- ❌ Usar `moment`. Datas: `Date` + `Intl`.
- ❌ Pular testes "porque é simples". Todo caso de uso tem testes de sucesso **e** de erro.

### 0.3 Convenções

| Item | Regra |
|---|---|
| Idioma do código e commits | Inglês |
| Idioma da UI | Português do Brasil |
| Idioma dos testes (`describe`/`it`) | Português (lê como especificação) |
| Arquivos | `kebab-case.ts`; componentes React `PascalCase.tsx` |
| Schemas Zod | `PascalCase` terminando em `Schema` (`CreateProductInputSchema`); tipo derivado com o mesmo nome sem sufixo (`type CreateProductInput = z.infer<typeof CreateProductInputSchema>`) |
| Casos de uso | Classe `PascalCase` com método único `execute(ctx, input)` |
| IDs | UUID v7 (string) via port `IdGenerator` |
| Datas no banco | `integer` epoch ms |
| Dia de negócio | string `YYYY-MM-DD` (§6.6) |
| Telefone | string só com dígitos, com DDD, sem +55 (`11987654321`) |
| Erros | Sempre `AppError` com `kind` + `code` (§3.5.1) |
| Slug da loja | `^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$` (3–40 caracteres). Ex.: `lojaxpto` |

### 0.4 Em caso de dúvida

- Tarefa ambígua: **pare e pergunte** ao humano.
- Decisão inviável (lib quebrada, API mudou): crie uma ADR `docs/adr/NNNN-titulo.md` com contexto, decisão e consequências, e siga.

### 0.5 Glossário (PT → código)

| Negócio | Código |
|---|---|
| Loja (dados do estabelecimento) | `Store` (linha única) |
| Funcionário | `Staff` (papéis `OWNER`, `MANAGER`, `CASHIER`, `WAITER`, `KITCHEN`) |
| Cardápio (admin) / público | `Catalog` / `PublicMenu` |
| Categoria | `Category` |
| Produto | `Product` |
| Grupo de complementos ("Adicionais", "Monte seu sabor", "Remover") | `ModifierGroup` |
| Complemento/opção | `ModifierOption` |
| Mesa | `DiningTable` |
| Conta da mesa | `TableSession` |
| Pedido / item | `Order` / `OrderItem` |
| Balcão / Delivery / Mesa | `OrderType`: `COUNTER` / `DELIVERY` / `TABLE` |
| Feito pelo funcionário / pelo cliente | `OrderChannel`: `STAFF` / `CUSTOMER` |
| Cliente cadastrado (delivery) | `Customer` / `CustomerAddress` |
| Bairro com taxa | `DeliveryZone` |
| Entregador | `Courier` |
| Pagamento | `Payment` (`CASH`, `CREDIT_CARD`, `DEBIT_CARD`, `PIX`, `VOUCHER`, `OTHER`) |
| Caixa / Sangria / Suprimento | `CashSession` / `CashMovement` `WITHDRAWAL` / `DEPOSIT` |
| Impressão / via | `PrintJob` / `ReceiptKind`: `KITCHEN`, `CUSTOMER`, `DELIVERY`, `TABLE_BILL`, `CASH_CLOSING` |
| Túnel de acesso pela internet | `Tunnel` (Cloudflare Tunnel) |
| Roteador do domínio | `Edge` (Cloudflare Worker do hakuna-cardapio) |

---

## 1. Produto

### 1.1 Visão

**Hakuna** é um sistema de gestão de pedidos para restaurantes e lanchonetes, com duas faces:

1. **Sistema da loja (hakuna-loja):** aplicativo **Windows (.exe)** instalado no PC do balcão. É o servidor da loja: guarda os dados localmente e **funciona sem internet**. Tablets do garçom e a TV da cozinha acessam pelo navegador na rede Wi-Fi da loja.
2. **Cardápio do cliente (hakuna-cardapio):** site em **`cardapioX.com/<slug-da-loja>`** (ex.: `cardapioX.com/lojaxpto`). O cliente abre pelo QR da mesa, informa a mesa (sem login), escolhe os itens e pede. O pedido chega em tempo real no PC da loja. O dono pode pausar, editar e adicionar itens, e o cardápio atualiza na hora.

**Single-tenant.** Cada instalação é **uma loja**, com banco próprio. Não existe `store_id` nas tabelas. Várias lojas usam o produto, cada uma com a sua instalação. O `cardapioX.com` não guarda dados das lojas: ele só **roteia** `/<slug>` até o PC da loja certa por um túnel seguro (§4.6).

### 1.2 Escopo V1

**hakuna-loja**
- Onboarding: cadastrar a loja (nome, slug público, fuso) e o dono.
- Funcionários com PIN e papéis.
- Cardápio: categorias, produtos (foto, preço, estoque opcional), grupos de complementos com mín/máx, pausar/retomar, visível ou não para o cliente.
- Mesas e impressão de QR codes (apontando para `cardapioX.com/<slug>/mesa/<n>`).
- PDV: o funcionário cria pedidos de **balcão, delivery e mesa**.
- Recebimento de pedidos do cliente, com aceite opcional.
- KDS (tela da cozinha).
- Clientes, endereços, bairros com taxa, entregadores.
- Pagamentos (vários métodos, troco), conta da mesa com taxa de serviço, caixa (abertura, sangria, suprimento, fechamento).
- Impressão em impressora térmica **USB** (driver do Windows): vias de cozinha, cliente, entrega, conta da mesa e fechamento de caixa.
- Relatórios: dia/mês/ano, por método, por modalidade, top produtos, por hora, por entregador.
- Backup automático, logs, auto-update, instalador e **túnel de acesso pela internet** gerenciado pelo app.

**hakuna-cardapio**
- App web mobile-first do cliente: entrada da loja, número da mesa, cardápio, complementos, carrinho, confirmação e acompanhamento do pedido ao vivo.
- **Edge router** (Cloudflare Worker): encaminha `/<slug>/api/*` e `/<slug>/uploads/*` para o túnel da loja; mostra "loja offline" quando o PC não responde.
- Script de **provisionamento** de lojas (túnel, DNS e registro do slug).

### 1.3 Fora de escopo

NFC-e/fiscal, iFood e marketplaces, login de cliente, pagamento online, painel remoto na nuvem, e delivery pedido pelo próprio cliente (na V1, o cliente pede **da mesa**).

---

## 2. Decisões técnicas fixas

### 2.1 Por que dois projetos (e não um ou três)

| Projeto | Conteúdo | Motivo |
|---|---|---|
| **hakuna-loja** | Electron + servidor Hono embutido (domínio, casos de uso, SQLite) + app React da equipe (PDV, admin, KDS) | O servidor **roda dentro** do Electron, e a UI da equipe é servida por ele e empacotada no mesmo `.exe`. Separar backend e UI da equipe obrigaria a sincronizar versões a cada release, sem ganho. |
| **hakuna-cardapio** | App React do cliente + Cloudflare Worker (roteador) + scripts de provisionamento | Ciclo de vida próprio: publicado **uma vez para todas as lojas** num CDN, otimizado para celular em 4G, atualizado sem reinstalar nada nas lojas. |

**Contrato entre os dois:** a **API pública v1** da loja, descrita em **OpenAPI** (`openapi/public-v1.json`), gerada a partir dos schemas Zod do hakuna-loja. O hakuna-cardapio gera seus tipos a partir desse arquivo. O contrato independe de linguagem: um backend reescrito em outra linguagem só precisa respeitar o mesmo OpenAPI.

### 2.2 hakuna-loja

| Camada | Tecnologia | Observação |
|---|---|---|
| Linguagem | TypeScript strict | `strict`, `noUncheckedIndexedAccess` |
| Runtime | Node.js 22 LTS | `.nvmrc` = `22` |
| Pacotes | npm | um `package.json` |
| UI | React 19 + Vite | SPA |
| Rotas UI | React Router v7 (`createBrowserRouter`) | pacote `react-router` |
| Dados UI | TanStack Query v5 | |
| Estado local | `useState` / `useReducer` / Context | **sem Zustand** |
| Formulários | React Hook Form + `@hookform/resolvers/zod` | schemas de `src/contracts` |
| **Validação** | **Zod v4** | em toda fronteira (§3.6); mensagens em pt-BR |
| Estilo | Tailwind CSS v4 (`@tailwindcss/vite`) | |
| Componentes | shadcn/ui (Radix) | ícones trocados por `react-icons/md` |
| Ícones | `react-icons/md` | lint bloqueia outros |
| Animações | React Bits (reactbits.dev) + `motion` | uso moderado (§8.4) |
| Toasts | `sonner` | |
| Gráficos | `recharts` | só em Relatórios |
| QR | `qrcode` | |
| Fonte | `@fontsource-variable/inter` | empacotada |
| HTTP | Hono + `@hono/node-server` + `@hono/zod-validator` | |
| API pública documentada | `@hono/zod-openapi` (**só** nas rotas públicas) | exporta `openapi/public-v1.json` |
| Tempo real | SSE (`hono/streaming`) | |
| Banco | SQLite via libSQL (`@libsql/client`) | arquivo local |
| ORM/migrações | Drizzle ORM + drizzle-kit | SQL versionado em `drizzle/` |
| Hash de PIN | `bcryptjs` | JS puro |
| IDs | `uuid` v7 | |
| Logs | `pino` + `pino-roll` | |
| Desktop | Electron (estável atual) | `contextIsolation`, `sandbox`, sem `nodeIntegration` |
| Túnel | `cloudflared.exe` (binário oficial, empacotado) | gerenciado pelo app (§4.6) |
| Build Node | tsup | |
| Instalador | electron-builder (NSIS) | |
| Auto-update | electron-updater | |
| Testes | Vitest, Testing Library, MSW, Playwright | |
| Lint | ESLint flat + typescript-eslint + Prettier | |
| CI | GitHub Actions | |

**Por que Electron:** o servidor (Hono + SQLite + impressão + túnel) roda no processo principal, em TypeScript. Com Tauri, seria preciso Rust ou um sidecar. Uma troca futura afeta só `src/desktop`.

**Por que libSQL:** binários N-API, que não precisam ser recompilados para o Electron. Também permite réplica futura na nuvem (Turso) com o mesmo dialeto.

### 2.3 hakuna-cardapio

| Camada | Tecnologia | Observação |
|---|---|---|
| UI | React 19 + Vite + TypeScript strict | SPA mobile-first |
| Rotas | React Router v7 | |
| Dados | TanStack Query v5 | |
| Cliente HTTP tipado | `openapi-fetch` + tipos do `openapi-typescript` | gerados de `openapi/public-v1.json` |
| **Validação em runtime** | **Zod v4** | respostas críticas, SSE, `localStorage`, KV, env do Worker, CLI dos scripts (§3.6) |
| Estilo/UI | Tailwind v4 + shadcn/ui + `react-icons/md` + React Bits | |
| Hospedagem | **Cloudflare Workers com Static Assets** | um Worker serve o SPA **e** faz o roteamento |
| Integração Vite ↔ Worker | `@cloudflare/vite-plugin` + `wrangler` | |
| Diretório de lojas | **Cloudflare KV** (`slug → { origin, edgeSecret }`) | |
| Testes | Vitest (unit/web/worker), MSW, Playwright | |
| CI/CD | GitHub Actions → `wrangler deploy` | |

---

## 3. Arquitetura de código

### 3.1 Visão geral

```
┌─────────────────────── hakuna-cardapio (Cloudflare) ───────────────────────┐
│ cardapioX.com                                                               │
│  ├─ /<slug>, /<slug>/mesa/<n>, /<slug>/pedido/<id> → SPA do cliente (assets)│
│  ├─ /<slug>/api/*     → Worker → https://<slug>.origin.cardapioX.com/api/v1/public/*
│  └─ /<slug>/uploads/* → Worker → https://<slug>.origin.cardapioX.com/uploads/*  (cache CDN)
└────────────────────────────────────────┬────────────────────────────────────┘
                                         │ Cloudflare Tunnel (conexão de saída do PC; nenhuma porta aberta no roteador)
┌───────────────────────────── hakuna-loja (PC da loja) ──────────────────────┐
│ Electron                                                                     │
│  ├─ servidor "staff"   0.0.0.0:3210   → /api/* (staff), /api/v1/public/*,    │
│  │                                      /uploads/*, SPA da equipe            │
│  ├─ servidor "público" 127.0.0.1:3211 → SOMENTE /api/v1/public/* e /uploads/*│
│  ├─ cloudflared (processo filho)      → expõe só 127.0.0.1:3211              │
│  ├─ SQLite (arquivo local), impressora USB                                   │
│  └─ janela → http://127.0.0.1:3210                                           │
└──────────────────────────────────────────────────────────────────────────────┘
      ▲ LAN: tablets (garçom) e TV (cozinha) → http://<ip-do-pc>:3210
```

### 3.2 hakuna-loja: Ports & Adapters (hexagonal), sem exagero

```
  src/contracts  schemas Zod: entradas/saídas/eventos. Só depende de zod.
      ▲ usado por core (validação de entrada), infra (HTTP/OpenAPI) e web (forms/tipos)
  src/core       domínio + casos de uso + ports (interfaces). Sem framework nem IO.
      ▲ implementa ports
  src/infra      adapters: Drizzle/libSQL, Hono (staff + público), SSE, impressão,
                 backup, logs, imagens, conectividade. container.ts = composition root.
      ▲ inicia
  src/desktop    Electron: janela, bandeja, impressora, túnel, updater.

  src/web        React da equipe. Fala com o servidor SÓ por HTTP/SSE.
```

**Regra de dependência (verificada pelo lint):**

- `contracts` → só `zod`.
- `core` → `zod`, `contracts`.
- `infra` → `core`, `contracts`, libs de infra.
- `desktop` → `infra`, `electron`.
- `web` → `contracts`, libs de frontend.

**Artefatos portáveis** (sobrevivem a uma troca de linguagem ou estrutura):
- `openapi/public-v1.json`;
- migrações SQL em `drizzle/`;
- suítes E2E (Playwright testa pelo navegador);
- matrizes de teste deste plano.

**Evitar overengineering:**
- Sem CQRS nem event sourcing.
- Sem classe para cada value object.
- Sem `BaseRepository` genérico.
- Sem container de DI com decorators; a composição é manual em `container.ts`.
- Sem outbox/sincronização, porque não há nuvem de dados na V1 (§12).

### 3.3 Estrutura: hakuna-loja

```
hakuna-loja/
├─ package.json
├─ .nvmrc
├─ tsconfig.json / tsconfig.base.json / tsconfig.node.json / tsconfig.web.json
├─ vite.config.ts  vitest.config.ts  playwright.config.ts  tsup.config.ts
├─ drizzle.config.ts  electron-builder.yml  eslint.config.js  .prettierrc  components.json
├─ index.html
├─ .github/workflows/ci.yml, release.yml
├─ build/                 # icon.ico, installer.nsh
├─ resources/bin/         # cloudflared.exe (baixado no CI; NÃO commitado)
├─ drizzle/               # migrações SQL geradas (commitadas)
├─ openapi/public-v1.json # contrato público GERADO (commitado)
├─ CHANGELOG-API.md
├─ docs/  PLANO.md  INFRA.md  OPERACAO.md  adr/
├─ scripts/  seed.ts  start-e2e.ts  export-openapi.ts  fetch-cloudflared.ts  cloudflared.lock.json
├─ src/
│  ├─ contracts/
│  │  ├─ zod-setup.ts     # locale pt-BR + helpers (money, uuid, phone, slug)
│  │  ├─ common.ts        # ErrorResponseSchema, paginação, IdParamSchema, IdempotencyKeySchema
│  │  ├─ error-codes.ts
│  │  ├─ <modulo>.ts      # schemas de entrada/saída por módulo (staff)
│  │  ├─ events.ts        # StaffEventSchema (união discriminada)
│  │  └─ public/          # schemas da API pública v1 (fonte do OpenAPI)
│  ├─ core/
│  │  ├─ shared/   errors.ts validation.ts money.ts text.ts business-date.ts context.ts ports.ts events.ts unit-of-work.ts
│  │  ├─ store/       # dados da loja (linha única) + slug
│  │  ├─ staff/       # funcionários, sessão, PIN, permissions.ts
│  │  ├─ settings/    # settings.schema.ts (Zod + defaults)
│  │  ├─ catalog/
│  │  ├─ tables/
│  │  ├─ customers/   # clientes, endereços, bairros, entregadores
│  │  ├─ orders/
│  │  ├─ payments/    # pagamentos + caixa
│  │  ├─ printing/
│  │  └─ reports/
│  │     (cada módulo: <m>.types.ts  <m>.rules.ts  <m>.errors.ts  <m>.ports.ts  use-cases/<verbo-substantivo>.ts)
│  ├─ infra/
│  │  ├─ config/env.ts
│  │  ├─ logging/logger.ts
│  │  ├─ system/      # clock.ts ids.ts network.ts connectivity.ts
│  │  ├─ db/          # client.ts migrate.ts schema/ repositories/ json-columns.ts unit-of-work.ts
│  │  ├─ http/
│  │  │  ├─ staff-app.ts      # app completo (porta 3210)
│  │  │  ├─ public-app.ts     # app só público (porta 3211)
│  │  │  ├─ error-handler.ts
│  │  │  ├─ validate.ts       # wrapper do zValidator → AppError
│  │  │  ├─ middlewares/      # request-id, session, rate-limit, edge-guard, secure-headers
│  │  │  ├─ routes/           # <modulo>.routes.ts (staff)
│  │  │  ├─ public-routes/    # rotas OpenAPI v1 públicas
│  │  │  ├─ presenters/
│  │  │  └─ sse-hub.ts
│  │  ├─ printing/    # receipt-html.ts auto-print.ts null-printer.ts
│  │  ├─ storage/     # local-image-storage.ts
│  │  ├─ backup/      # backup-service.ts
│  │  ├─ jobs/        # scheduler.ts
│  │  ├─ container.ts
│  │  ├─ server.ts    # startServer(options) → { staffUrl, publicPort, stop() }
│  │  └─ standalone.ts
│  ├─ desktop/
│  │  ├─ main.ts preload.ts tray.ts updater.ts paths.ts
│  │  ├─ electron-printer.ts
│  │  └─ tunnel/      # tunnel-manager.ts process-runner.ts secret-store.ts reachability-probe.ts
│  └─ web/
│     ├─ main.tsx router.tsx providers.tsx index.css
│     ├─ shared/  api/ components/ui/ components/reactbits/ components/ hooks/ lib/
│     └─ features/
│        onboarding/ auth/ pdv/ orders/ tables/ kitchen/ catalog-admin/
│        customers/ cash/ reports/ settings/ cart/
│        (cada feature: api.ts hooks.ts schemas.ts components/ pages/)
└─ tests/
   ├─ support/   fakes/ builders/ fixtures/ test-context.ts test-db.ts test-server.ts msw/ web-setup.ts
   ├─ unit/        # espelha src/core, src/contracts, src/desktop/tunnel e a lógica pura de src/web
   ├─ integration/ # repositórios, rotas, SSE, backup, impressão (templates), OpenAPI
   ├─ web/         # componentes/páginas React
   ├─ e2e/         # Playwright (navegador)
   └─ e2e-desktop/ # Playwright Electron
```

### 3.4 Estrutura: hakuna-cardapio

```
hakuna-cardapio/
├─ package.json  .nvmrc  tsconfig.json  vite.config.ts  vitest.config.ts  playwright.config.ts
├─ wrangler.jsonc  eslint.config.js  .prettierrc  components.json  index.html
├─ .hakuna-loja-version           # tag do hakuna-loja cujo contrato está fixado
├─ .github/workflows/ci.yml, deploy.yml
├─ openapi/public-v1.json         # cópia fixada do contrato
├─ docs/  PLANO.md  PLATAFORMA.md  adr/
├─ scripts/
│  ├─ sync-openapi.ts             # baixa o contrato de uma versão do hakuna-loja
│  ├─ provision-store.ts          # cria túnel + DNS + KV para uma loja
│  └─ deprovision-store.ts
├─ worker/
│  ├─ index.ts                    # export default { fetch } → createEdgeHandler(...)
│  ├─ env.ts                      # EnvSchema (Zod) do Worker
│  ├─ edge-handler.ts             # lógica testável (recebe deps)
│  ├─ route-parser.ts             # "/lojaxpto/api/menu" → { slug, kind:'api', path:'/menu' }
│  ├─ store-directory.ts          # port + adapter KV (entrada validada com Zod)
│  └─ responses.ts                # JSON de erro
├─ src/                           # SPA do cliente
│  ├─ main.tsx router.tsx providers.tsx index.css
│  ├─ shared/
│  │  ├─ api/  generated.ts (openapi-typescript)  client.ts (openapi-fetch)  runtime-schemas.ts (Zod)  errors.ts
│  │  ├─ components/ui/  components/reactbits/  components/
│  │  ├─ hooks/  useStoreSlug.ts useStoreInfo.ts useConnectionStatus.ts usePublicEvents.ts
│  │  └─ lib/    format.ts idempotency.ts storage.ts error-messages.ts zod-setup.ts semver.ts
│  └─ features/
│     landing/ store-entry/ menu/ cart/ checkout/ order-status/
└─ tests/
   ├─ support/ msw/ builders/ web-setup.ts
   ├─ unit/    # cart-reducer, format, route-parser, runtime-schemas, semver, regras de mín/máx
   ├─ worker/  # edge-handler e store-directory com fakes
   ├─ web/     # páginas
   └─ e2e/     # mock/ (MSW) e integrated/ (com o hakuna-loja real)
```

### 3.5 Padrões obrigatórios (hakuna-loja), com código modelo

#### 3.5.1 Erros: `src/core/shared/errors.ts`

```ts
export type ErrorKind =
  | 'validation'     // 400
  | 'unauthorized'   // 401
  | 'forbidden'      // 403
  | 'not_found'      // 404
  | 'conflict'       // 409
  | 'business_rule'  // 422
  | 'rate_limited'   // 429
  | 'unavailable'    // 503 – dependência indisponível (impressora, túnel)
  | 'infra';         // 500

export class AppError extends Error {
  constructor(
    public readonly kind: ErrorKind,
    public readonly code: ErrorCode,          // de src/contracts/error-codes.ts
    message: string,
    public readonly details: Record<string, unknown> = {},
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = 'AppError';
  }
}
export const isAppError = (e: unknown): e is AppError => e instanceof AppError;

export const CommonErrors = {
  unauthorized: () => new AppError('unauthorized', 'UNAUTHORIZED', 'Sessão inválida ou expirada'),
  forbidden: () => new AppError('forbidden', 'FORBIDDEN', 'Sem permissão para esta ação'),
};
```

- `src/contracts/error-codes.ts` exporta `export const ERROR_CODES = [...] as const; export type ErrorCode = (typeof ERROR_CODES)[number];`.
- Cada módulo tem um `<m>.errors.ts` com fábricas:

```ts
export const CatalogErrors = {
  productNotFound: (productId: string) =>
    new AppError('not_found', 'PRODUCT_NOT_FOUND', 'Produto não encontrado', { productId }),
  productArchived: (productId: string) =>
    new AppError('business_rule', 'PRODUCT_ARCHIVED', 'Produto arquivado', { productId }),
};
```

- Casos de uso **lançam** `AppError`, sem `Result<T,E>`. Os testes verificam com `rejects.toMatchObject({ code })`.

#### 3.5.2 Contexto: `src/core/shared/context.ts`

```ts
export type StaffRole = 'OWNER' | 'MANAGER' | 'CASHIER' | 'WAITER' | 'KITCHEN';
export type Actor =
  | { kind: 'staff'; staffId: string; role: StaffRole }
  | { kind: 'customer' }     // cliente anônimo (API pública)
  | { kind: 'system' };      // jobs internos
export interface RequestContext { actor: Actor }
```

Todo caso de uso recebe `ctx` como primeiro argumento. A permissão é checada **dentro do caso de uso**, com `assertCan(ctx, 'acao')`.

#### 3.5.3 Ports base: `src/core/shared/ports.ts`

```ts
export interface Clock { now(): Date }
export interface IdGenerator { newId(): string; newToken(): string } // v7 / 32 bytes base64url
export interface EventPublisher { publish(event: DomainEvent): void }  // nunca lança
export interface Logger {
  info(o: object, m?: string): void; warn(o: object, m?: string): void; error(o: object, m?: string): void;
}
```

#### 3.5.4 Unit of Work: `src/core/shared/unit-of-work.ts`

```ts
export interface Repositories {
  store: StoreRepository;              staff: StaffRepository;
  sessions: StaffSessionRepository;    authAttempts: AuthAttemptRepository;
  settings: SettingsRepository;        categories: CategoryRepository;
  products: ProductRepository;         modifierGroups: ModifierGroupRepository;
  tables: DiningTableRepository;       tableSessions: TableSessionRepository;
  customers: CustomerRepository;       deliveryZones: DeliveryZoneRepository;
  couriers: CourierRepository;         orders: OrderRepository;
  orderSequences: OrderSequenceRepository; payments: PaymentRepository;
  cashSessions: CashSessionRepository; printJobs: PrintJobRepository;
}
export interface UnitOfWork {
  /** Executa `work` numa transação. Se lançar, NADA é persistido. */
  run<T>(work: (repos: Repositories) => Promise<T>): Promise<T>;
}
```

`Repositories` cresce a cada fase. Todo acesso a dados passa por `uow.run`, e os eventos são publicados **depois** que `run` termina com sucesso.

#### 3.5.5 Caso de uso modelo (com validação Zod da entrada)

```ts
// src/contracts/catalog.ts
export const PauseProductInputSchema = z.object({ productId: zId() });
export type PauseProductInput = z.infer<typeof PauseProductInputSchema>;

// src/core/catalog/use-cases/pause-product.ts
export class PauseProduct {
  constructor(private readonly deps: { uow: UnitOfWork; clock: Clock; events: EventPublisher }) {}

  async execute(ctx: RequestContext, rawInput: unknown): Promise<Product> {
    assertCan(ctx, 'catalog.pause');
    const input = parseInput(PauseProductInputSchema, rawInput);   // lança VALIDATION_ERROR

    const { product, changed } = await this.deps.uow.run(async (repos) => {
      const found = await repos.products.findById(input.productId);
      if (!found) throw CatalogErrors.productNotFound(input.productId);
      if (found.archivedAt) throw CatalogErrors.productArchived(input.productId);
      if (found.status === 'PAUSED') return { product: found, changed: false }; // idempotente

      const updated: Product = { ...found, status: 'PAUSED', updatedAt: this.deps.clock.now() };
      await repos.products.update(updated);
      return { product: updated, changed: true };
    });

    if (changed) this.deps.events.publish({ type: 'catalog.changed' });
    return product;
  }
}
```

**Ordem padrão dentro de `execute`:** 1) `assertCan`; 2) `parseInput`; 3) `uow.run` com regras de negócio; 4) publicar eventos.

#### 3.5.6 Repositório (port e adapter)

```ts
// src/core/catalog/catalog.ports.ts
export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findManyByIds(ids: readonly string[]): Promise<Product[]>;
  list(opts?: { includeArchived?: boolean }): Promise<Product[]>;
  insert(p: Product): Promise<void>;
  update(p: Product): Promise<void>;
  decrementStock(productId: string, qty: number): Promise<void>;
  incrementStock(productId: string, qty: number): Promise<void>;
}
```

```ts
// src/infra/db/client.ts
export type Db = LibSQLDatabase<typeof schema>;
export type DbTx = Parameters<Parameters<Db['transaction']>[0]>[0];
export type DbExecutor = Db | DbTx;

// src/infra/db/repositories/drizzle-product-repository.ts
export class DrizzleProductRepository implements ProductRepository {
  constructor(private readonly db: DbExecutor) {}
  async findById(id: string) {
    const row = await this.db.query.products.findFirst({ where: eq(products.id, id) });
    return row ? toProduct(row) : null;   // mapper local e explícito
  }
  // …
}

// src/infra/db/unit-of-work.ts
export class DrizzleUnitOfWork implements UnitOfWork {
  constructor(private readonly db: Db) {}
  run<T>(work: (repos: Repositories) => Promise<T>) {
    return this.db.transaction((tx) => work(createRepositories(tx)));
  }
}
```

Violações conhecidas de UNIQUE são traduzidas no repositório para `AppError('conflict', ...)`. Colunas JSON são lidas com Zod (§3.6, item 4).

#### 3.5.7 Composition root: `src/infra/container.ts`

```ts
export interface ContainerDeps {
  db: Db; clock: Clock; ids: IdGenerator; events: EventPublisher;
  printer: PrinterPort; imageStorage: ImageStoragePort; hasher: PinHasher;
  connectivity: ConnectivityPort; logger: Logger;
}
export function createContainer(deps: ContainerDeps) {
  const uow = new DrizzleUnitOfWork(deps.db);
  const base = { uow, clock: deps.clock, ids: deps.ids, events: deps.events };
  return {
    deps,
    useCases: {
      pauseProduct: new PauseProduct(base),
      placeStaffOrder: new PlaceStaffOrder(base),
      placeCustomerTableOrder: new PlaceCustomerTableOrder(base),
      printOrder: new PrintOrder({ ...base, printer: deps.printer, logger: deps.logger }),
      // … todos
    },
  };
}
export type Container = ReturnType<typeof createContainer>;
```

#### 3.5.8 Rotas HTTP

Rotas de **staff** usam `@hono/zod-validator` via o wrapper `validate()`:

```ts
export function catalogRoutes(c: Container) {
  const r = new Hono<AppEnv>();
  r.post('/products/:id/pause', requireStaff(), validate('param', IdParamSchema), async (ctx) => {
    const p = await c.useCases.pauseProduct.execute(ctx.get('reqCtx'), { productId: ctx.req.valid('param').id });
    return ctx.json(presentProduct(p));
  });
  r.post('/products', requireStaff(), validate('json', CreateProductInputSchema), async (ctx) => {
    const p = await c.useCases.createProduct.execute(ctx.get('reqCtx'), ctx.req.valid('json'));
    return ctx.json(presentProduct(p), 201);
  });
  return r;
}
```

- `validate(target, schema)` envolve o `zValidator` e, na falha, lança `toValidationError(zodError)` (400 com `details.issues`).
- A HTTP valida para rejeitar cedo e documentar. O caso de uso **valida de novo** com o mesmo schema, para que as regras de validação fiquem cobertas por testes unitários e valham para qualquer entrada, não só HTTP.
- Rotas **públicas** usam `@hono/zod-openapi` (`createRoute`) com os schemas de `src/contracts/public/*`. São registradas **nos dois apps** (staff e público) pela mesma função `registerPublicRoutes(app, container)`.
- Presenters convertem entidade → DTO. Em **teste de integração**, a resposta é validada com o schema de saída (`ResponseSchema.parse(body)`).

#### 3.5.9 Error handler

```ts
const STATUS: Record<ErrorKind, ContentfulStatusCode> = {
  validation: 400, unauthorized: 401, forbidden: 403, not_found: 404, conflict: 409,
  business_rule: 422, rate_limited: 429, unavailable: 503, infra: 500,
};
app.onError((err, c) => {
  if (isAppError(err)) {
    if (err.kind === 'infra') logger.error({ err, requestId: c.get('requestId') }, 'infra error');
    return c.json({ error: { code: err.code, message: err.message, details: err.details } }, STATUS[err.kind]);
  }
  if (err instanceof ZodError) {            // segurança: um ZodError que escapou vira 400
    const v = toValidationError(err);
    return c.json({ error: { code: v.code, message: v.message, details: v.details } }, 400);
  }
  logger.error({ err, requestId: c.get('requestId') }, 'unhandled');
  return c.json({ error: { code: 'INTERNAL', message: 'Erro interno', details: {} } }, 500);
});
```

O formato de erro é **único**, `{ "error": { "code", "message", "details" } }`, nas duas APIs e no Worker. Ele é definido em `ErrorResponseSchema` (Zod).

### 3.6 Validação com Zod (onde e como)

**Regra geral:** todo dado que **atravessa uma fronteira** entra no sistema por `schema.parse`/`safeParse`. Dentro das fronteiras, os tipos TypeScript derivados (`z.infer`) garantem a forma.

#### 3.6.1 Configuração comum

- Zod v4 importado como `import { z } from 'zod'`.
- `src/contracts/zod-setup.ts` (loja) e `src/shared/lib/zod-setup.ts` (cardápio): ativam o locale português (`z.config(z.locales.pt())`, se disponível na versão instalada; senão, mensagens customizadas nos helpers) e exportam **helpers reutilizáveis**:

```ts
export const zId = () => z.string().min(1).max(64);
export const zUuid = () => z.uuid();
export const zCents = () => z.number().int().nonnegative().max(100_000_000);   // até R$ 1.000.000,00
export const zPercent = () => z.number().min(0).max(100);
export const zSlug = () => z.string().regex(/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/, 'Slug inválido');
export const zPhone = () => z.string().transform((s) => s.replace(/\D/g, '')).pipe(z.string().regex(/^\d{10,11}$/, 'Telefone inválido'));
export const zPin = () => z.string().regex(/^\d{4,6}$/, 'PIN deve ter de 4 a 6 dígitos');
export const zTrimmed = (min: number, max: number) => z.string().trim().min(min).max(max);
export const zBusinessDate = () => z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
```

- `src/core/shared/validation.ts`:

```ts
export function toValidationError(err: z.ZodError): AppError {
  return new AppError('validation', 'VALIDATION_ERROR', 'Dados inválidos', {
    issues: err.issues.map((i) => ({ path: i.path.join('.'), code: i.code, message: i.message })),
  });
}
export function parseInput<S extends z.ZodType>(schema: S, input: unknown): z.infer<S> {
  const r = schema.safeParse(input);
  if (!r.success) throw toValidationError(r.error);
  return r.data;
}
```

#### 3.6.2 Onde usar (checklist obrigatório)

| # | Fronteira | hakuna-loja | hakuna-cardapio |
|---|---|---|---|
| 1 | **Variáveis de ambiente/config** | `infra/config/env.ts` (`EnvSchema.parse(process.env)`) | `worker/env.ts` (bindings e vars do Worker) |
| 2 | **Entrada HTTP** (body, params, query, headers como `Idempotency-Key`) | `validate()` (staff) e `createRoute` (públicas) | Worker: `slug` e métodos via `route-parser` + Zod |
| 3 | **Entrada de caso de uso** | `parseInput(Schema, raw)` no início de `execute` | — |
| 4 | **JSON persistido no banco** (`settings.data`, `orders.delivery_address`) | `infra/db/json-columns.ts`: leitura com `Schema.parse`. `settings` usa `SettingsSchema` com `.default()` em todos os campos, e JSON antigo ganha os novos campos ao ser lido | — |
| 5 | **Saída HTTP** | presenters tipados; testes de integração fazem `ResponseSchema.parse(body)` | respostas críticas (`/info`, `POST /orders`) validadas com `runtime-schemas.ts` (tolerando campos extras); falha → `ApiError('INVALID_RESPONSE')` |
| 6 | **Eventos SSE** | web: `StaffEventSchema.safeParse(JSON.parse(e.data))`; evento inválido/desconhecido é **ignorado** e logado como `warn` | `PublicEventSchema.safeParse(...)`, mesma política |
| 7 | **Formulários** | RHF + `zodResolver(Schema)`, reutilizando o schema de `contracts` e estendendo regras só de UI (ex.: confirmação de PIN) em `features/<f>/schemas.ts` | idem (mesa, nome, observação) |
| 8 | **`localStorage`** | preferências do tablet (ex.: som ligado) | carrinho: `CartStorageSchema.safeParse`; inválido → descarta e começa vazio |
| 9 | **KV / diretório de lojas** | — | `StoreEntrySchema` (`origin` hostname, `edgeSecret` ≥ 32); inválido → trata como inexistente e loga |
| 10 | **Arquivos e CLIs** | `cloudflared.lock.json`, backups (metadados), `scripts/*` (args) | `scripts/provision-store.ts` (args e respostas da API Cloudflare) |
| 11 | **Upload** | metadados do multipart (mime, tamanho) via Zod + checagem de magic bytes | — |
| 12 | **Contrato público** | schemas em `contracts/public/*` → OpenAPI | `runtime-schemas.ts` + teste de compatibilidade de tipos com `generated.ts` |

#### 3.6.3 Regras

- **Um schema, um lugar.** Schemas de entrada/saída ficam em `src/contracts` (loja). Não duplique o mesmo schema em `core` ou `web`: importe de `contracts`.
- Regras de **negócio** que dependem do banco (produto pausado, estoque, mesa existente) **não** vão no schema. Elas ficam no caso de uso e lançam o erro de negócio correspondente. O schema cuida só de **forma e limites** (tipos, tamanhos, formatos, faixas).
- Use `z.strictObject` nas entradas públicas (campo desconhecido → erro; ex.: `priceCents` enviado pelo cliente). Use `z.object` (que remove extras) nas entradas de staff. Nas **leituras** de respostas no cardápio, use `z.looseObject`/`.passthrough()` para tolerar campos novos de lojas mais recentes.
- Números vindos de query string: `z.coerce.number()`.
- Datas em query: `zBusinessDate()`.
- Uniões por tipo (`OrderType`, eventos SSE): `z.discriminatedUnion`.
- Refinos entre campos (`max >= min`, "`DELIVERY` exige endereço"): `.superRefine` com `path` correto, para o erro cair no campo certo do formulário.
- **Testes de schema:** cada arquivo de `src/contracts` tem teste em `tests/unit/contracts/` com `it.each` de entradas válidas e inválidas (limites exatos: tamanho mínimo/máximo, zero, negativo, decimal, string vazia, espaços, campo extra).

### 3.7 Contrato público (OpenAPI) e versionamento

- **Fonte da verdade:** schemas Zod em `hakuna-loja/src/contracts/public/*.ts` + rotas `@hono/zod-openapi`.
- **Geração:** `npm run openapi:export` (`scripts/export-openapi.ts`) instancia o app público com deps fake e grava `openapi/public-v1.json` (formatado, chaves ordenadas).
- **CI do hakuna-loja** roda o export e falha se houver diff (`git diff --exit-code openapi/`).
- **Release** do hakuna-loja anexa o `public-v1.json` aos assets.
- **hakuna-cardapio:** `npm run api:sync -- v1.3.0` baixa o arquivo daquela release (ou copia com `--local ../hakuna-loja/openapi/public-v1.json`) e roda o `openapi-typescript` → `src/shared/api/generated.ts`. Commitar os dois arquivos e atualizar `.hakuna-loja-version`.
- **Compatibilidade** (cada loja atualiza num momento diferente; o cardápio é um só):
  - dentro de `v1`, **só mudanças aditivas** (campos opcionais novos, endpoints novos);
  - remover ou renomear campo exige `/api/v2/public`, e as duas versões convivem;
  - `GET /api/v1/public/info` retorna `apiVersion` (SemVer da API pública, **independente** da versão do app);
  - o cardápio tem `MIN_STORE_API_VERSION`; loja abaixo disso mostra "O sistema desta loja precisa ser atualizado para receber pedidos pelo celular";
  - o cardápio trata **campo ausente** (loja antiga) como `undefined`, com fallback de UI (os `runtime-schemas` marcam campos novos como `.optional()`).
- Qualquer mudança na API pública exige: export atualizado, bump minor em `apiVersion` e entrada em `CHANGELOG-API.md`.

---

## 4. Infraestrutura

### 4.1 Topologia completa

```
 Celular do cliente (Wi-Fi da loja ou 4G)
        │ https://cardapioX.com/lojaxpto/mesa/12
        ▼
 ┌────────────────────── Cloudflare (conta da plataforma) ──────────────────────┐
 │ Worker "hakuna-cardapio" (domínio cardapioX.com)                             │
 │   • Static Assets: SPA do cliente (mesmo build para todas as lojas)          │
 │   • /<slug>/api/*, /<slug>/uploads/* → KV STORES[slug]                       │
 │        → fetch https://lojaxpto.origin.cardapioX.com/...                     │
 │          + X-Hakuna-Edge-Secret + X-Hakuna-Slug + X-Client-IP                │
 │ KV STORES: "lojaxpto" → { origin: "lojaxpto.origin.cardapioX.com", edgeSecret }
 │ Tunnel "hakuna-lojaxpto" → hostname lojaxpto.origin.cardapioX.com            │
 │                          → service http://127.0.0.1:3211                     │
 └───────────────────────────────────────▲──────────────────────────────────────┘
                                         │ conexão de SAÍDA iniciada pelo cloudflared
 ┌──────────── PC da loja (Windows), IP fixo na LAN, ex. 192.168.0.50 ────────────┐
 │ Hakuna.exe                                                                      │
 │  • staff-app   0.0.0.0:3210  (LAN)                                              │
 │  • public-app  127.0.0.1:3211 (só loopback, só rotas públicas)                  │
 │  • cloudflared tunnel run --token … (processo filho)                            │
 │  • %APPDATA%\Hakuna\data\hakuna.db                                              │
 │  • Impressora USB (driver Windows)                                              │
 └─────────────────────────────────────────────────────────────────────────────────┘
   Tablet garçom → http://192.168.0.50:3210        TV cozinha → http://192.168.0.50:3210/cozinha
```

**Por que túnel:**
- Não é preciso abrir porta no roteador nem ter IP público fixo.
- Funciona atrás de CGNAT, comum em internet residencial e 4G.
- O TLS é gerenciado pela Cloudflare.
- O PC expõe só a porta 3211, que tem apenas as rotas públicas.

### 4.2 Rede local e portas

| Porta | Bind | Conteúdo | Quem acessa |
|---|---|---|---|
| **3210** | `0.0.0.0` | app staff completo (UI da equipe, `/api/*`, `/api/v1/public/*`, `/uploads/*`, SSE) | janela do Electron, tablets e TV na LAN |
| **3211** | `127.0.0.1` | **somente** `/api/v1/public/*` e `/uploads/*` (+ `edge-guard`) | apenas o `cloudflared` local |

- O instalador cria a regra de firewall **só para a 3210** (a 3211 é loopback):

```nsis
; build/installer.nsh
!macro customInstall
  nsExec::ExecToLog 'netsh advfirewall firewall add rule name="Hakuna" dir=in action=allow protocol=TCP localport=3210 profile=private'
!macroend
!macro customUnInstall
  nsExec::ExecToLog 'netsh advfirewall firewall delete rule name="Hakuna"'
!macroend
```

- A rede do PC precisa estar como **"Rede privada"** no Windows.
- IP fixo por **reserva DHCP** no roteador. A tela Configurações → Rede mostra os IPs (IPv4 não-internos de `os.networkInterfaces()`).
- HTTP sem TLS na LAN é aceitável, porque só a equipe usa. Service Worker/PWA não funciona nos tablets, então não dependa disso.

### 4.3 Diretórios no PC

Tudo é derivado de `app.getPath('userData')` (normalmente `%APPDATA%\Hakuna`):

| Caminho | Conteúdo |
|---|---|
| `data\hakuna.db` | SQLite (+ `-wal`, `-shm`) |
| `data\uploads\` | imagens (`<uuid>.webp`) |
| `data\secrets.bin` | token do túnel + edge secret, criptografados com `safeStorage` do Electron |
| `backups\` | `hakuna-YYYYMMDD-HHmmss.db` |
| `logs\` | `app.log`, `cloudflared.log` (rotativos) |

⚠️ Os repositórios ficam em `C:\dev\`, **nunca dentro do OneDrive**. A sincronização corrompe o SQLite e trava o `node_modules`.

### 4.4 Configuração: `src/infra/config/env.ts`

```ts
const EnvSchema = z.object({
  HAKUNA_MODE: z.enum(['desktop', 'server', 'test']).default('server'),
  HAKUNA_HOST: z.string().default('0.0.0.0'),
  HAKUNA_PORT: z.coerce.number().int().min(0).max(65535).default(3210),
  HAKUNA_PUBLIC_PORT: z.coerce.number().int().min(0).max(65535).default(3211), // 0 = aleatória (testes)
  HAKUNA_DATA_DIR: z.string().min(1).default('./.data'),
  HAKUNA_WEB_DIR: z.string().min(1).default('./dist/web'),
  HAKUNA_MIGRATIONS_DIR: z.string().min(1).default('./drizzle'),
  HAKUNA_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'silent']).default('info'),
  HAKUNA_EDGE_SECRET: z.string().min(32).optional(), // só modo server/test; no desktop vem do secrets.bin
});
export type Env = z.infer<typeof EnvSchema>;
export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  const r = EnvSchema.safeParse(source);
  if (!r.success) throw new Error(`Configuração inválida:\n${z.prettifyError(r.error)}`);
  return r.data;
}
```

No modo desktop, o `main.ts` monta as opções diretamente e valida com `ServerOptionsSchema`.

### 4.5 Processo desktop: `src/desktop/main.ts`

Ordem obrigatória:

1. `app.requestSingleInstanceLock()`. Se falhar, `app.quit()`. Na segunda instância, focar a janela existente.
2. Resolver os caminhos (`paths.ts`) e criar os diretórios.
3. Fazer backup **pré-migração** se o banco existir e houver migração pendente.
4. `startServer({ mode:'desktop', host:'0.0.0.0', port:3210, publicPort:3211, dataDir, webDir, migrationsDir, printer: new ElectronHtmlPrinter(), edgeSecret })`.
5. Porta ocupada: diálogo "A porta 3210 está em uso por outro programa." e encerrar.
6. `BrowserWindow` com `webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, preload }`, carregando `http://127.0.0.1:3210/`.
7. Bloquear navegação externa (`will-navigate`; `setWindowOpenHandler` → `shell.openExternal`).
8. Bandeja: Abrir · Copiar endereço da rede · Status do acesso pela internet · Reiniciar servidor · Sair.
9. Fechar a janela **minimiza para a bandeja**, porque o servidor continua atendendo tablets e clientes.
10. `TunnelManager.start()` se houver token configurado (§4.6.4).
11. Opções dos settings: iniciar com o Windows (`app.setLoginItemSettings`) e impedir suspensão (`powerSaveBlocker.start('prevent-app-suspension')`).
12. Auto-update depois que a janela abrir. **Sem internet, ignorar em silêncio.**
13. `before-quit`: `tunnel.stop()` → `server.stop()` (fecha HTTP, jobs e DB).

O `preload.ts` expõe **apenas** `window.hakunaDesktop = { version, isDesktop: true }`. Impressão, túnel e backup passam por **HTTP**, para funcionar igual nos tablets. As rotas que só fazem sentido no desktop respondem `501 DESKTOP_ONLY` no modo server.

### 4.6 Acesso pela internet (Worker + Tunnel)

#### 4.6.1 Provisionamento de uma loja (feito pelo operador da plataforma)

O script `hakuna-cardapio/scripts/provision-store.ts --slug lojaxpto` usa a API da Cloudflare com o `CF_API_TOKEN` do operador. Args e respostas da API são validados com Zod.

1. Validar o slug (regex da §0.3 + lista reservada: `api`, `assets`, `uploads`, `app`, `admin`, `www`, `static`, `health`, `favicon.ico`, `robots.txt`) e verificar que **não existe** no KV.
2. Criar o Tunnel `hakuna-lojaxpto` (gerenciado remotamente).
3. Configurar o ingress: hostname `lojaxpto.origin.cardapioX.com` → `http://127.0.0.1:3211`, com fallback `http_status:404`.
4. Criar o DNS CNAME `lojaxpto.origin` → `<tunnel-id>.cfargotunnel.com` (proxied).
5. Gerar o `edgeSecret` (32 bytes aleatórios, base64url).
6. Gravar no KV `STORES`: `lojaxpto` → `{"origin":"lojaxpto.origin.cardapioX.com","edgeSecret":"…","createdAt":…}`.
7. Imprimir **Token do túnel**, **Edge secret** e a URL `https://cardapioX.com/lojaxpto`. O operador entrega os dois primeiros para a loja colar em Configurações → Acesso pela internet.

O script usa o port `CloudflareApi` (adapter HTTP real; fake nos testes). O `deprovision-store.ts` desfaz tudo.

#### 4.6.2 Worker (edge): regras

O `route-parser.ts` é uma função pura:

| Caminho | Ação |
|---|---|
| `/` | landing do SPA (assets) |
| `/<slug>`, `/<slug>/mesa/<n>`, `/<slug>/pedido/<id>` | SPA (assets com fallback SPA) |
| `/<slug>/api/<resto>` | **proxy** → `https://<origin>/api/v1/public/<resto>` |
| `/<slug>/uploads/<arquivo>` | **proxy** → `https://<origin>/uploads/<arquivo>`, com cache CDN de 1 ano |
| qualquer outro | assets / 404 |

Configuração: `wrangler.jsonc` com `assets.not_found_handling = "single-page-application"` e `assets.run_worker_first = ["/*/api/*", "/*/uploads/*"]`. Se a versão do wrangler não aceitar padrões em `run_worker_first`, use `true` e sirva os assets pelo binding `env.ASSETS.fetch` no handler (registre uma ADR).

Proxy (`edge-handler.ts`):
- Slug inválido ou inexistente no KV → `404 { error: { code: 'STORE_NOT_FOUND' } }`.
- Métodos permitidos: `GET`, `POST`, `HEAD`. Outros → `405 METHOD_NOT_ALLOWED`.
- Corpo acima de 64 KB → `413 PAYLOAD_TOO_LARGE`.
- Remove os headers `cookie` e `authorization`. Adiciona `X-Hakuna-Edge-Secret: <edgeSecret>`, `X-Hakuna-Slug: <slug>` e `X-Client-IP: <CF-Connecting-IP>`.
- Timeout de **10s**, exceto no SSE `/events`, que não tem timeout.
- Falha de rede, timeout, `502`/`503` **sem** corpo de erro Hakuna, ou `530` (túnel desconectado) → `503 { error: { code: 'STORE_OFFLINE', message: 'A loja está offline no momento' } }`.
- Respostas de erro da própria loja (JSON `{error:{code}}`) passam **inalteradas**.
- SSE: repassa o `Response` com o corpo em stream (`text/event-stream`), sem bufferizar.
- KV indisponível → `503 EDGE_UNAVAILABLE`.
- Cache só em `/uploads/*` (`cf: { cacheEverything: true, cacheTtl: 31536000 }`). **Nunca** cachear `/api/*`.

#### 4.6.3 Lado da loja (public-app, porta 3211)

O middleware `edge-guard` roda em **todas** as rotas do public-app:
- Se houver `edgeSecret` configurado, o header `X-Hakuna-Edge-Secret` precisa bater (comparação em tempo constante com `crypto.timingSafeEqual`). Senão, `401 EDGE_UNAUTHORIZED`. Isso impede o acesso direto a `lojaxpto.origin.cardapioX.com` sem passar pelo Worker.
- `X-Hakuna-Slug` precisa ser igual ao slug da loja. Senão, `404 STORE_NOT_FOUND` (proteção contra roteamento trocado).
- O IP do cliente (para rate limit) vem de `X-Client-IP` (validado com `z.ipv4().or(z.ipv6())`) **somente depois** de validar o secret. Caso contrário, usa o IP da conexão.
- O public-app **não monta** rotas de staff, SSE de staff nem o SPA (testado, §9.7).

#### 4.6.4 TunnelManager (`src/desktop/tunnel/`)

- O `cloudflared.exe` fica em `resources/bin/`. O `scripts/fetch-cloudflared.ts` baixa uma versão **fixada** do GitHub oficial `cloudflare/cloudflared` e confere o SHA-256 contra `cloudflared.lock.json` (validado com Zod). Roda no CI antes do build; o binário vai para `extraResources`.
- Port `ProcessRunner` (`spawn(cmd, args, onExit, onOutput)`), com adapter real (`child_process`) e fake nos testes.
- `TunnelManager`:
  - estados: `NOT_CONFIGURED | STARTING | CONNECTED | RECONNECTING | STOPPED | ERROR`;
  - comando: `cloudflared tunnel --no-autoupdate run --token <token>`, com saída em `logs/cloudflared.log`;
  - `CONNECTED` quando o log contém `Registered tunnel connection` **ou** quando o auto-teste de alcance passa;
  - se o processo sair sem `stop()`: `RECONNECTING`, com restart em backoff `5s, 10s, 20s, …` até no máximo 5 min;
  - **auto-teste de alcance** a cada 60s (só se `connectivity.isOnline()`): `GET https://cardapioX.com/<slug>/api/info` deve responder 200 com o mesmo slug (resposta validada com Zod) → `publicReachable: true/false`;
  - sem internet: continua tentando em backoff **sem travar nada**, e o sistema da loja segue 100% funcional;
  - token e edge secret ficam em `secrets.bin` via `safeStorage.encryptString`. Nunca em texto puro, nunca em log.
- Tela **Configurações → Acesso pela internet** (OWNER):
  - colar token e edge secret (form com Zod);
  - ligar/desligar;
  - status (`MdCloudDone`/`MdCloudOff`) e último erro;
  - URL pública com botão copiar;
  - botão "Testar agora".

#### 4.6.5 Custos de referência (verificar antes de contratar)

- Domínio: ~R$ 40–80 por ano.
- Cloudflare Tunnel: gratuito.
- Workers + KV: plano gratuito até 100 mil requisições/dia. Ao crescer, Workers Paid (~US$ 5/mês).

### 4.7 Offline-first

**Princípio:** o PC da loja é a fonte da verdade. A falta de internet **nunca** impede vender, imprimir, fechar conta ou gerar relatório.

| Situação | Comportamento | Garantia |
|---|---|---|
| PC sem internet | Tudo que é da equipe funciona. A topbar mostra "Internet offline" e o cardápio público mostra "Loja offline" (via Worker) | Nenhum caso de uso depende de rede externa; E2E com túnel desligado |
| Túnel cai com internet ok | Reconexão em backoff; status na topbar | `TunnelManager` + testes |
| Celular do cliente perde conexão no envio | "Não foi possível enviar. Tentar novamente", com carrinho preservado; reenvio com a **mesma** `Idempotency-Key` | idempotência + testes web/E2E |
| Pedido chega duas vezes | Um único pedido | UNIQUE `orders.idempotency_key` + caso de uso |
| SSE do cliente cai | Polling a cada 5s até o SSE voltar | `usePublicEvents` |
| Tablet perde o Wi-Fi | Banner "Sem conexão com o servidor da loja"; ao voltar, invalida as queries | `useConnectionStatus` |
| Impressora desligada ou sem papel | Pedido criado; job `FAILED`; toast "Reimprimir" | impressão fora da transação + `PrintJob` |
| PC reinicia | Dados e jobs pendentes preservados | SQLite WAL |
| Auto-update sem internet | Ignorado silenciosamente | `try/catch` + teste |

Port `ConnectivityPort { isOnline(): Promise<boolean> }`. Adapter `HttpConnectivity`: HEAD em `https://www.cloudflare.com/cdn-cgi/trace`, timeout de 2s, cache de 10s. Nos testes, `FakeConnectivity`.

### 4.8 Build, instalador, deploy

**hakuna-loja**

- `vite build` → `dist/web/`.
- `tsup` → `dist/node/desktop/main.js`, `dist/node/desktop/preload.js`, `dist/node/server/standalone.js`:

```ts
// tsup.config.ts
export default defineConfig({
  entry: {
    'desktop/main': 'src/desktop/main.ts',
    'desktop/preload': 'src/desktop/preload.ts',
    'server/standalone': 'src/infra/standalone.ts',
  },
  outDir: 'dist/node', format: ['cjs'], platform: 'node', target: 'node22',
  sourcemap: true, clean: true, tsconfig: 'tsconfig.node.json',
  external: ['electron', '@libsql/client', 'libsql'],
});
```

```yaml
# electron-builder.yml
appId: app.hakuna.loja
productName: Hakuna
directories: { output: release, buildResources: build }
files: [dist/**, drizzle/**, package.json]
extraResources:
  - from: resources/bin
    to: bin
asarUnpack: [node_modules/@libsql/**, node_modules/libsql/**]
win: { target: nsis, icon: build/icon.ico }
nsis:
  oneClick: false
  perMachine: true
  allowToChangeInstallationDirectory: true
  include: build/installer.nsh
publish: { provider: github, owner: <DONO>, repo: hakuna-loja-releases }
```

- `package.json` → `"main": "dist/node/desktop/main.js"`.
- Migrações: `path.join(app.getAppPath(), 'drizzle')`.
- cloudflared: `path.join(process.resourcesPath, 'bin', 'cloudflared.exe')`.
- **Auto-update:** o electron-updater lê de um repositório **público só de releases** (`hakuna-loja-releases`), para não embutir token. O código-fonte continua privado.
- Sem assinatura de código, o Windows SmartScreen avisa na instalação. Aceitável na V1 (está no backlog).

**hakuna-cardapio**

- `vite build` (com `@cloudflare/vite-plugin`) gera o client e o Worker.
- `wrangler deploy` em dois ambientes, cada um com seu namespace KV: `staging` (`staging.cardapioX.com`) e `production` (`cardapioX.com`).

### 4.9 CI/CD

**hakuna-loja**

`ci.yml` (push/PR, `ubuntu-latest`):
1. `npm ci`
2. `lint`
3. `typecheck`
4. `test:coverage`
5. `openapi:export` + `git diff --exit-code openapi/`
6. `playwright install chromium`
7. `build:web`
8. `build:node`
9. `test:e2e`
10. Upload do relatório em caso de falha.

`release.yml` (tag `v*`, `windows-latest`):
1. `npm ci`
2. `fetch-cloudflared`
3. `check`
4. `build`
5. `test:e2e-desktop`
6. `electron-builder --win --publish always`
7. Anexar `openapi/public-v1.json` à release.

**hakuna-cardapio**

`ci.yml`:
1. `npm ci`
2. `lint`
3. `typecheck`
4. `test`
5. `build`
6. `test:e2e` (mock)
7. Job **`e2e-integrado`**:
   - checkout do hakuna-loja na tag de `.hakuna-loja-version`;
   - `npm ci && npm run build:web && npm run build:node`;
   - subir `start:e2e` (portas 3299/3300);
   - `wrangler dev` com KV local `lojateste → http://127.0.0.1:3300` (origem HTTP permitida **apenas** com `ENVIRONMENT=dev`);
   - rodar `tests/e2e/integrated/*.spec.ts`.

`deploy.yml`: `main` → staging; tag `v*` → production, com aprovação manual via GitHub Environments.

### 4.10 Segurança

| Tema | Regra |
|---|---|
| Sessão da equipe | Cookie `hk_session` (`HttpOnly`, `SameSite=Strict`, `Path=/`); token de 32 bytes com **hash SHA-256** no banco; expira em 12h, renovável |
| PIN | 4–6 dígitos, `bcryptjs` custo 10, único na loja |
| Força bruta | 5 PINs errados por IP em 5 min → bloqueio de 5 min (`AUTH_LOCKED`, 429) |
| Superfície pública | Só pela porta 3211 (loopback) via túnel, com `edge-guard`. A 3210 também serve `/api/v1/public/*`, para testes na LAN |
| Validação | Zod em toda fronteira (§3.6). Entradas públicas com `z.strictObject` |
| Rate limit público | 60 req/min por IP; em `POST /orders`, 5/min por IP e 30/min por mesa |
| Pedido público | Só com `customerMenu.enabled` e mesa ativa; preço recalculado; qtd 1–20 por linha; até 30 linhas; observação ≤ 140 |
| Consulta de pedido público | Exige `publicToken`; errado ou ausente → 404 |
| SSE público | Só `catalog.changed` e o status do pedido do token |
| Worker | Remove cookie e authorization; só GET/POST/HEAD; limite de 64 KB; não cacheia API |
| Cabeçalhos | `hono/secure-headers`; CSP do staff: `default-src 'self'; img-src 'self' data: blob:` |
| Upload | Só webp/jpeg/png ≤ 1 MB, conferido por magic bytes; nome gerado pelo servidor |
| Electron | `contextIsolation`, `sandbox`, sem `nodeIntegration`, navegação externa bloqueada |
| Segredos | Token do túnel e edge secret via `safeStorage`; nunca em log |
| LGPD | Clientes: nome, telefone e endereço. "Anonimizar cliente" remove a PII e mantém os pedidos |
| Logs | Nunca logar PIN, tokens, secrets nem telefone completo (`11*****4321`) |

### 4.11 Backup e restauração

- **Quando:** ao iniciar, a cada 24h, antes de migrações e manualmente.
- **Como:** `VACUUM INTO '<backups>/hakuna-YYYYMMDD-HHmmss.db'`.
- **Retenção:** 30 arquivos.
- **Restaurar** (OWNER, desktop): `PRAGMA integrity_check` no arquivo → backup do banco atual → parar o servidor → substituir → reiniciar.
- **"Salvar backup em…":** diálogo do Electron (pendrive ou pasta de nuvem pessoal).

### 4.12 Logs e diagnóstico

- `pino` → `logs/app.log` (`pino-roll`, rotação diária, 14 arquivos).
- `requestId` em cada requisição.
- `GET /api/health` (público): `{ status, version, uptimeSec }`.
- `GET /api/system/status` (staff): versão, IPs da LAN, internet, impressora (última falha), túnel (estado, `publicReachable`, URL pública), caixa, último backup, tamanho do banco.
- "Exportar diagnóstico" (OWNER): zip com logs + status, **sem o banco**.

---

## 5. Modelo de dados (hakuna-loja)

Single-tenant: **não existe `store_id`**. Datas em epoch ms. Dinheiro em centavos (`INTEGER`). Booleanos como `INTEGER` (`mode: 'boolean'`). PRAGMAs ao conectar: `journal_mode=WAL`, `foreign_keys=ON`, `busy_timeout=5000`, `synchronous=NORMAL`.

### 5.1 Tabelas

**store** (linha única, `id = 1`): name (2–80), slug (regex da §0.3), timezone (padrão `America/Sao_Paulo`), business_day_starts_at_hour (0–23, padrão 4), logo_path, phone, address, created_at, updated_at.

**settings** (linha única, `id = 1`): data (JSON **validado por `SettingsSchema` na leitura e na escrita**), updated_at. O `SettingsSchema` tem `.default()` em todos os campos:

```ts
{
  customerMenu: { enabled: true, requireStaffAcceptance: true, welcomeMessage: '' },
  tableService: { serviceFeePercent: 10 },             // 0–30
  delivery: { enabled: true, minimumOrderCents: 0 },
  printing: {
    printerName: null as string | null,
    paperWidthMm: 80 as 58 | 80,
    autoPrint: { staffOrderKitchen: true, staffOrderCustomer: false, acceptedCustomerOrderKitchen: true, deliveryVia: true },
    copies: { KITCHEN: 1, CUSTOMER: 1, DELIVERY: 1, TABLE_BILL: 1, CASH_CLOSING: 1 },
    header: '', footer: 'Obrigado pela preferência!',
  },
  kitchen: { warnAfterMinutes: 10, lateAfterMinutes: 20, hideReadyAfterMinutes: 15 },
  publicAccess: { baseUrl: 'https://cardapioX.com', enabled: false },
  desktop: { openAtLogin: true, preventSleep: true },
}
```

**staff**: id, name, role, pin_hash, active, created_at, updated_at. UNIQUE(name).
**staff_sessions**: id, staff_id, token_hash UNIQUE, expires_at, created_at, last_seen_at.
**auth_attempts**: ip PK, failed_count, window_started_at, locked_until.

**categories**: id, name, sort_order, archived_at, created_at, updated_at. Nome único entre as não arquivadas (validado no caso de uso).
**products**: id, category_id FK, name, description, price_cents, image_path, status (`ACTIVE|PAUSED`), stock_qty (null = ilimitado), visible_to_customers (padrão true), sort_order, archived_at, created_at, updated_at.
**modifier_groups**: id, name, min_select ≥ 0, max_select ≥ 1 e ≥ min, archived_at, created_at, updated_at.
**modifier_options**: id, group_id FK, name, price_cents ≥ 0, status (`ACTIVE|PAUSED`), sort_order.
**product_modifier_groups**: product_id, group_id, sort_order. PK(product_id, group_id).

**dining_tables**: id, number UNIQUE (1–999), label, active, created_at, updated_at.
**table_sessions**: id, table_id, status (`OPEN|CLOSED`), opened_at, closed_at, service_fee_cents, closed_by_staff_id. Índice único parcial `(table_id) WHERE status='OPEN'`.

**customers**: id, name, name_normalized, phone (nullable; UNIQUE quando não nulo), notes, anonymized_at, created_at, updated_at.
**customer_addresses**: id, customer_id, street, number, complement, neighborhood, reference, zone_id, created_at.
**delivery_zones**: id, name UNIQUE, fee_cents, active.
**couriers**: id, name, phone, active.

**orders**

| coluna | regra |
|---|---|
| id | PK |
| number | sequencial por dia de negócio |
| business_date | `YYYY-MM-DD` |
| type | `COUNTER\|DELIVERY\|TABLE` |
| channel | `STAFF\|CUSTOMER` |
| status | §6.3 |
| table_id, table_session_id | obrigatórios se `TABLE` |
| customer_id, delivery_address (JSON snapshot, `DeliveryAddressSnapshotSchema`), courier_id | delivery |
| customer_name | nome livre (balcão/mesa) |
| change_for_cents | "troco para" (delivery em dinheiro) |
| subtotal_cents, discount_cents, delivery_fee_cents, total_cents | |
| notes | ≤ 280 |
| idempotency_key | UNIQUE |
| public_token | só canal `CUSTOMER` |
| rejection_reason | quando `REJECTED` |
| created_by_staff_id, created_at, updated_at | |

**order_items**: id, order_id, product_id, product_name, unit_price_cents, quantity (1–99), modifiers_total_cents, line_total_cents, notes (≤ 140), sort_order.
**order_item_modifiers**: id, order_item_id, option_id, group_name, option_name, price_cents (tudo snapshot).
**order_events**: id, order_id, type (`CREATED|STATUS_CHANGED|CANCELED|REJECTED|PRINTED|PRINT_FAILED|PAYMENT_ADDED|PAYMENT_VOIDED|COURIER_ASSIGNED`), from_status, to_status, reason, staff_id, created_at.
**order_sequences**: business_date PK, last_number.

**payments**: id, order_id **ou** table_session_id (**exatamente um**), cash_session_id, method, amount_cents > 0, tendered_cents (CASH), change_cents, created_by_staff_id, created_at, voided_at, void_reason, voided_by.
**cash_sessions**: id, status (`OPEN|CLOSED`, no máximo uma OPEN), opened_by, opened_at, opening_cents, closed_by, closed_at, counted_cents, expected_cents, difference_cents, notes.
**cash_movements**: id, cash_session_id, type (`WITHDRAWAL|DEPOSIT`), amount_cents, reason, staff_id, created_at.

**print_jobs**: id, ref_type (`ORDER|TABLE_SESSION|CASH_SESSION|TEST`), ref_id, kind, status (`PENDING|PRINTED|FAILED`), attempts, last_error, created_at, updated_at.

### 5.2 Migrações

- Fonte da verdade: `src/infra/db/schema/*.ts`.
- `npm run db:generate` gera o SQL em `drizzle/`. **Sempre commitar.**
- As migrações são aplicadas automaticamente no `startServer`.
- **Nunca editar** migração já commitada.
- Teste obrigatório: aplicar todas num banco vazio e reaplicar sem erro.
- Colunas JSON: toda leitura passa por `json-columns.ts` (Zod). Dado inválido → `AppError('infra', 'CORRUPTED_DATA')` com log (exceto `settings`, que se recupera com os defaults e loga `warn`).

---

## 6. Regras de negócio

Todas vivem em `src/core/**/<m>.rules.ts` como **funções puras**, testadas com `it.each`. Validação de **forma** fica nos schemas Zod (§3.6); regras que dependem de **estado** ficam aqui e nos casos de uso.

### 6.1 Dinheiro

```ts
export type Cents = number;
export function assertCents(value: number, field: string): Cents; // inteiro seguro ≥ 0, senão INVALID_MONEY
export function sumCents(values: readonly Cents[]): Cents;
export function percentOf(base: Cents, percent: number): Cents;   // Math.round(base*percent/100)
```

Nos frontends: `formatBRL(cents)` (Intl pt-BR/BRL) e `parseBRL('12,50') → 1250 | null`. O `MoneyInput` usa `parseBRL` + `zCents()`.

### 6.2 Disponibilidade

```ts
export function isProductOrderable(p: Product, channel: OrderChannel): boolean {
  if (p.archivedAt || p.status !== 'ACTIVE') return false;
  if (p.stockQty !== null && p.stockQty <= 0) return false;
  if (channel === 'CUSTOMER' && !p.visibleToCustomers) return false;
  return true;
}
```

- O estoque decrementa na criação do pedido e volta no cancelamento/rejeição. Nunca fica negativo: `INSUFFICIENT_STOCK { productId, available }`. A checagem soma as quantidades de **todas as linhas** do mesmo produto.
- Produtos de categoria arquivada não aparecem no cardápio público.

### 6.3 Máquina de estados do pedido

```
 PENDING_ACCEPTANCE ──accept──► ACCEPTED ◄── (criação: canal STAFF ou aceite desligado)
        └─reject─► REJECTED       ├─► PREPARING ─► READY ─► COMPLETED
                                  └──────┴───────────┴──cancel──► CANCELED
```

```ts
export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING_ACCEPTANCE: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: ['PREPARING', 'READY', 'CANCELED'],
  PREPARING: ['READY', 'CANCELED'],
  READY: ['COMPLETED', 'CANCELED'],
  COMPLETED: [], REJECTED: [], CANCELED: [],
};
```

- `COMPLETED` significa entregue ao cliente (retirado, entregue ou servido).
- Cancelar exige motivo (3–140 caracteres, validado no schema). Com pagamento ativo → `ORDER_HAS_PAYMENTS`.
- Rejeitar exige motivo; o cliente vê "Pedido não aceito pela loja" + o motivo.
- Cancelar ou rejeitar devolve o estoque e gera `order_events`.
- Pedido de sessão de mesa `CLOSED` não muda de status (`TABLE_SESSION_CLOSED`).

### 6.4 Complementos

`validateModifierSelection(product, selectedOptionIds)` retorna as seleções resolvidas, ou lança `MODIFIER_SELECTION_INVALID { groupId, reason }`, com `reason` ∈ `BELOW_MIN | ABOVE_MAX | OPTION_NOT_IN_PRODUCT | OPTION_PAUSED | DUPLICATE_OPTION`.

O hakuna-cardapio reimplementa **só** a checagem de mín/máx, para a UX. O servidor é a autoridade.

### 6.5 Totais

```
lineTotal   = (unitPrice + Σ modifier.price) × quantity
subtotal    = Σ lineTotal
discount    ≤ subtotal                        (senão DISCOUNT_EXCEEDS_SUBTOTAL)
deliveryFee = 0 se type ≠ DELIVERY
total       = subtotal − discount + deliveryFee
```

- Desconto: só no canal STAFF (permissão `order.discount`), em valor ou em % (0–100; o schema usa `z.discriminatedUnion('kind', [{kind:'amount', cents}, {kind:'percent', percent}])`).
- Taxa de entrega: vem do bairro. `OWNER|MANAGER` podem sobrescrever.
- Mínimo de delivery: `subtotal − discount < minimumOrderCents` → `DELIVERY_MINIMUM_NOT_MET`.
- **Taxa de serviço (mesa)** é calculada **na conta**, não no pedido: `percentOf(Σ total dos pedidos válidos, serviceFeePercent)`. Pode ser removida no fechamento.

### 6.6 Dia de negócio e numeração

- `toBusinessDate(instant, timezone, startsAtHour)`: pega a hora local com `Intl.DateTimeFormat('en-CA', { timeZone, year, month, day, hour, hourCycle: 'h23' })`. Se `hour < startsAtHour`, volta um dia. Retorna `YYYY-MM-DD`.
- Número do pedido = `order_sequences.last_number + 1` para o `business_date`, **dentro da transação**. Reinicia a cada dia de negócio.
- Relatórios filtram por `business_date`.

### 6.7 Conta da mesa

- O primeiro pedido numa mesa sem sessão `OPEN` abre uma sessão.
- `GetTableBill`: pedidos válidos, subtotal, taxa sugerida, pagamentos, saldo.
- `CloseTableBill` exige nenhum pedido em `PENDING_ACCEPTANCE` (senão `TABLE_HAS_PENDING_ORDERS`) e saldo 0 (senão `TABLE_BILL_NOT_PAID { remainingCents }`). Ao fechar: grava a taxa, marca `CLOSED`, conclui os pedidos restantes (com evento) e publica `table.updated`.

### 6.8 Pagamentos e caixa

- Todo pagamento exige **caixa aberto** (`CASH_SESSION_NOT_OPEN`).
- `amount` > 0 (schema) e ≤ saldo (`PAYMENT_EXCEEDS_BALANCE`).
- `CASH`: `tendered ≥ amount` (schema com `.superRefine`); `change = tendered − amount`.
- Pedido `TABLE` se paga na conta da mesa (`USE_TABLE_BILL`).
- Pedido cancelado ou rejeitado → `ORDER_NOT_PAYABLE`.
- Estorno (`VoidPayment`): permissão `payment.void`, com motivo.
- O status de pagamento é **derivado**: `UNPAID | PARTIAL | PAID`.
- Caixa:
  - `expected = opening + Σ CASH válidos + Σ DEPOSIT − Σ WITHDRAWAL`;
  - `difference = counted − expected`;
  - abrir com um caixa já aberto → `CASH_SESSION_ALREADY_OPEN`;
  - sangria maior que `expected` → `INSUFFICIENT_CASH`.

### 6.9 Clientes

- `zPhone()` normaliza `(11) 98765-4321` → `11987654321` e aceita 10–11 dígitos. Senão, `VALIDATION_ERROR` no campo `phone`.
- `normalizeText('José da Silva') → 'jose da silva'`.
- Busca:
  - com ≥ 3 dígitos, procura telefones que contenham os dígitos;
  - sem dígitos suficientes, todas as palavras (AND) precisam estar contidas em `name_normalized`;
  - limite de 20, ordenado pelo pedido mais recente;
  - termo com menos de 2 caracteres → lista vazia.
- Telefone duplicado → `CUSTOMER_PHONE_TAKEN { customerId }`.

### 6.10 Permissões (`core/staff/permissions.ts`)

| Ação (`chave`) | OWNER | MANAGER | CASHIER | WAITER | KITCHEN |
|---|:-:|:-:|:-:|:-:|:-:|
| `store.manage` (loja, settings, funcionários, backup, túnel) | ✅ | ❌ | ❌ | ❌ | ❌ |
| `catalog.edit` (criar/editar/arquivar) | ✅ | ✅ | ❌ | ❌ | ❌ |
| `catalog.pause` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `tables.edit` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `order.create` (COUNTER/TABLE) | ✅ | ✅ | ✅ | ✅ | ❌ |
| `order.create_delivery` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `order.accept` / `order.status` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `order.cancel` / `order.discount` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `order.override_delivery_fee` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `payment.create` / `table.close` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `payment.void` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `cash.operate` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `reports.view` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `customers.manage` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `customers.anonymize` | ✅ | ✅ | ❌ | ❌ | ❌ |

`assertCan(ctx, action)`: `actor.kind === 'customer'` só passa nas ações públicas explícitas (`public.*`); `system` passa em todas.

---

## 7. APIs HTTP

Erros sempre no formato da §3.5.9. Schemas Zod em `src/contracts`.

### 7.1 API pública v1 (hakuna-loja; contrato OpenAPI)

Base na loja: `/api/v1/public`. Base vista pelo cliente: `https://cardapioX.com/<slug>/api`.

| Método | Rota (loja) | Descrição |
|---|---|---|
| GET | `/info` | `{ apiVersion, store: { name, slug, logoUrl }, customerMenu: { enabled, welcomeMessage }, serverTime }` |
| GET | `/menu` | categorias → produtos (`id, name, description, priceCents, imageUrl, available`) → grupos (`min, max, options[{id,name,priceCents,available}]`). Sem estoque exato |
| GET | `/tables/:number` | `{ number, label }` ou `404 TABLE_NOT_FOUND` |
| POST | `/orders` | header **obrigatório** `Idempotency-Key` (UUID, validado com Zod). Corpo (`z.strictObject`): `{ tableNumber, customerName?, notes?, items: [{ productId, quantity, optionIds[], notes? }] }` → `201 { orderId, number, status, publicToken, totalCents }`. Repetição → `200` com o mesmo corpo |
| GET | `/orders/:id?token=` | `{ orderId, number, status, rejectionReason?, items[], totalCents, createdAt }` |
| GET | `/events?orderId=&token=` | SSE: `catalog.changed`, `order.status_changed` (do pedido), `ping` |

`imageUrl` é **relativa** (`uploads/<arquivo>`); o cliente monta `https://cardapioX.com/<slug>/uploads/<arquivo>`.

### 7.2 API da equipe (hakuna-loja, porta 3210, cookie)

| Módulo | Rotas |
|---|---|
| Bootstrap/Auth | `GET /api/bootstrap` (`{ hasStore }`), `POST /api/setup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Loja/Config | `GET/PATCH /api/store`, `GET/PUT /api/settings` |
| Funcionários | `GET/POST /api/staff`, `PATCH /api/staff/:id`, `POST /api/staff/:id/deactivate` |
| Cardápio | `GET /api/catalog`; `POST /api/categories`, `PATCH /api/categories/:id`, `POST /api/categories/:id/archive`, `POST /api/categories/reorder`; `POST /api/products`, `PATCH /api/products/:id`, `POST /api/products/:id/{pause,resume,archive}`, `PUT /api/products/:id/stock`, `PUT /api/products/:id/modifier-groups`, `POST /api/products/:id/image`, `POST /api/products/reorder`; `POST /api/modifier-groups`, `PATCH /api/modifier-groups/:id`, `POST /api/modifier-options/:id/{pause,resume}` |
| Mesas | `GET/POST /api/tables`, `POST /api/tables/batch`, `PATCH /api/tables/:id`, `GET /api/tables/qr-codes`, `GET /api/tables/:id/bill`, `POST /api/tables/:id/bill/{payments,close,print}` |
| Pedidos | `GET /api/orders?date=&status=&type=&channel=&q=`, `POST /api/orders` (`Idempotency-Key`), `GET /api/orders/:id`, `POST /api/orders/:id/{accept,reject,status,cancel,courier,print,payments}` |
| Cozinha | `GET /api/kitchen/queue` |
| Clientes | `GET /api/customers?q=`, `POST /api/customers`, `GET/PATCH /api/customers/:id`, `POST /api/customers/:id/addresses`, `POST /api/customers/:id/anonymize` |
| Delivery | `GET/POST /api/delivery-zones`, `PATCH /api/delivery-zones/:id`, `GET/POST /api/couriers`, `PATCH /api/couriers/:id` |
| Pagamentos | `POST /api/payments/:id/void` |
| Caixa | `GET /api/cash/current`, `POST /api/cash/{open,movements,close}` |
| Impressão | `GET /api/printers`, `POST /api/printers/test`, `GET /api/print-jobs?status=`, `POST /api/print-jobs/:id/retry` |
| Relatórios | `GET /api/reports/{summary,top-products,by-hour,by-courier}?from=&to=`, `GET /api/reports/export.csv` |
| Sistema | `GET /api/system/status`, `GET/POST /api/backups`, `POST /api/backups/:id/restore`, `GET/PUT /api/public-access`, `POST /api/public-access/test` |
| Tempo real | `GET /api/events` (SSE) |

### 7.3 Eventos SSE da equipe (`src/contracts/events.ts`)

```ts
export const StaffEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('order.created'), orderId: zId(), number: z.number().int(),
             channel: z.enum(['STAFF', 'CUSTOMER']), status: OrderStatusSchema, tableNumber: z.number().int().optional() }),
  z.object({ type: z.literal('order.status_changed'), orderId: zId(), from: OrderStatusSchema, to: OrderStatusSchema }),
  z.object({ type: z.literal('catalog.changed') }),
  z.object({ type: z.literal('table.updated'), tableId: zId() }),
  z.object({ type: z.literal('print.failed'), printJobId: zId(), orderId: zId().optional(), error: z.string() }),
  z.object({ type: z.literal('cash.updated') }),
  z.object({ type: z.literal('system.updated') }),   // túnel/impressora/internet mudou
  z.object({ type: z.literal('ping') }),             // a cada 25s
]);
export type StaffEvent = z.infer<typeof StaffEventSchema>;
```

O `sse-hub` valida o evento com o schema **antes de enviar** (em teste, falha alto; em produção, loga `error` e não envia).

---

## 8. Frontends

### 8.1 hakuna-loja: rotas da equipe

| Rota | Permissão mínima | Tela |
|---|---|---|
| `/setup` | — (só sem loja) | cadastro da loja + dono |
| `/login` | — | teclado numérico de PIN |
| `/pdv` | `order.create` | novo pedido (balcão/delivery/mesa) |
| `/pedidos` | todos | lista + detalhe |
| `/mesas`, `/mesas/:id/conta` | todos / `payment.create` | mapa e conta |
| `/cozinha` | todos | KDS |
| `/cardapio` | `catalog.edit` (pausa: todos) | administração |
| `/clientes` | `customers.manage` | clientes |
| `/caixa` | `cash.operate` | caixa |
| `/relatorios` | `reports.view` | relatórios |
| `/configuracoes/*` | `store.manage` | loja, funcionários, mesas & QR, impressora, delivery, cardápio do cliente, acesso pela internet, rede, backup |

- `RequireAuth` (`GET /api/auth/me`) + `RequireCan(action)`.
- Cada feature se organiza em:
  - `api.ts`: única camada que conhece URLs;
  - `hooks.ts`: TanStack Query;
  - `schemas.ts`: extensões de UI dos schemas de `contracts`;
  - `components/` e `pages/`.
- **Componentes nunca chamam `fetch`.**
- Formulários: `useForm({ resolver: zodResolver(Schema) })`. Erros `VALIDATION_ERROR` do servidor com `details.issues[].path` são aplicados nos campos via `setError`, com um helper `applyServerIssues(form, error)` testado.
- `useServerEvents()` no AppShell: SSE → `StaffEventSchema.safeParse` → `invalidateQueries`, toasts e beep.
- TanStack Query: `networkMode: 'always'` (a rede que importa é a LAN), `retry: 1`.
- **Layout:**
  - sidebar colapsável com ícones Md;
  - topbar com loja, relógio e indicadores (servidor, internet, túnel, impressora, caixa), funcionário e "Sair";
  - PDV: à esquerda busca, abas de categoria e grade; à direita carrinho fixo com modalidade, dados de cliente/mesa, totais e "Finalizar (F4)".
- Atalhos do PDV: `F2` produto, `F3` cliente, `F4` finalizar, `Esc` fechar, `+`/`-` quantidade.

### 8.2 hakuna-cardapio: rotas do cliente

| Rota | Tela |
|---|---|
| `/` | landing simples do produto (o que é, contato) |
| `/:slug` | entrada: logo/nome da loja, boas-vindas (`BlurText`), "Qual o número da sua mesa?" (input numérico grande, validado com Zod) |
| `/:slug/mesa/:number` | cardápio + carrinho |
| `/:slug/mesa/:number/confirmar` | revisão, nome opcional, observação, total **estimado** ("valor final confirmado pela loja"), botão com `ClickSpark` |
| `/:slug/pedido/:orderId?t=token` | acompanhamento ao vivo (Recebido → Aceito → Preparando → Pronto), com "Fazer outro pedido" |

Os params de rota (`slug`, `number`, `orderId`, `t`) são validados com Zod em `useRouteParams(Schema)`. Param inválido → tela "Link inválido".

Estados especiais (componentes dedicados):

| Situação | Tela |
|---|---|
| `STORE_NOT_FOUND` | "Loja não encontrada" |
| `STORE_OFFLINE` | "A loja está offline no momento. Chame um atendente." + "Tentar novamente" (retry automático a cada 15s) |
| `CUSTOMER_MENU_DISABLED` | "Pedidos pelo celular estão pausados. Chame um atendente." |
| API < `MIN_STORE_API_VERSION` | "O sistema desta loja precisa ser atualizado." |
| `TABLE_NOT_FOUND` | erro no input da mesa |
| `INVALID_RESPONSE` | "Algo deu errado ao falar com a loja. Tente novamente." |

UX do cardápio:
- abas de categoria fixas no topo, com scroll-spy;
- cards com foto (`loading="lazy"`), nome, descrição curta e preço;
- indisponível = cinza + badge "Indisponível", sem botão;
- bottom sheet de complementos com contadores ("Escolha até 3" / "Obrigatório");
- botão flutuante do carrinho com quantidade e total;
- carrinho persistido em `localStorage` (`hakuna.cart.<slug>.<mesa>`), lido com `CartStorageSchema.safeParse` e try/catch.

Tempo real: `usePublicEvents` (EventSource em `/<slug>/api/events`, eventos validados com `PublicEventSchema`). Em `catalog.changed`, refaz o menu e aplica `markUnavailable` no carrinho. Se o SSE falhar, **polling a cada 5s**.

Envio: a `Idempotency-Key` é gerada quando o carrinho nasce e **só muda após sucesso**. `NetworkError`/`STORE_OFFLINE` → "Tentar novamente" com a mesma key, com no máximo 2 retries automáticos com backoff.

Performance: JS inicial < 150 KB gzip; imagens WebP de 800px vindas da loja, com cache de CDN; Lighthouse mobile ≥ 90.

Cliente HTTP: `openapi-fetch` com `baseUrl = /${slug}/api` e tipos do `generated.ts`, encapsulado em `src/shared/api/client.ts`, que:
- converte erros em `ApiError(code)`/`NetworkError`, lendo o corpo de erro com `ErrorResponseSchema.safeParse`;
- valida as respostas críticas com `runtime-schemas.ts`.

### 8.3 Carrinho (reducer; cada projeto tem sua cópia)

```ts
export interface CartLine {
  lineId: string; productId: string; name: string;
  unitPriceCents: number;            // só exibição
  quantity: number;
  modifiers: { optionId: string; groupName: string; name: string; priceCents: number }[];
  notes: string;
  unavailable?: boolean;
}
export interface CartState { lines: CartLine[]; idempotencyKey: string }
export type CartAction =
  | { type: 'add'; line: CartLine }                 // mescla se produto+modificadores+notas forem iguais
  | { type: 'increment' | 'decrement' | 'remove'; lineId: string }  // decrement até 0 remove
  | { type: 'setNotes'; lineId: string; notes: string }
  | { type: 'markUnavailable'; productIds: string[] }
  | { type: 'clear'; newIdempotencyKey: string };
export function cartReducer(state: CartState, action: CartAction): CartState;
export function cartTotals(state: CartState): { itemsCount: number; subtotalCents: number; hasUnavailable: boolean };
export const CartStorageSchema = z.object({ version: z.literal(1), state: /* espelha CartState */ });
```

Provider com `useReducer` + Context. **Sem Zustand.** A duplicação entre os dois repositórios é intencional, pequena e testada nos dois.

### 8.4 Visual, ícones, React Bits

- Tokens (Tailwind v4 `@theme`): primária âmbar/laranja, neutros slate, success/warning/danger, raio de 12px, modo escuro (o KDS é sempre escuro).
- Fonte Inter; números com `tabular-nums`.
- Alvos de toque ≥ 44px.
- Estados de carregando (skeleton), vazio e erro em **todas** as telas.

Ícones, **apenas `react-icons/md`**:

| Uso | Ícone |
|---|---|
| PDV | `MdPointOfSale` |
| Pedidos | `MdReceiptLong` |
| Mesas | `MdTableRestaurant` |
| Cozinha | `MdSoupKitchen` |
| Cardápio | `MdRestaurantMenu` |
| Clientes | `MdPeople` |
| Caixa | `MdAccountBalanceWallet` |
| Relatórios | `MdBarChart` |
| Configurações | `MdSettings` |
| Delivery / Balcão | `MdDeliveryDining` / `MdStorefront` |
| Pausar / Retomar | `MdPauseCircle` / `MdPlayCircle` |
| Editar / Adicionar / Excluir | `MdEdit` / `MdAdd` / `MdDelete` |
| Carrinho | `MdShoppingCart` |
| Imprimir | `MdPrint` |
| QR | `MdQrCode2` |
| Wi-Fi | `MdWifi` / `MdWifiOff` |
| Túnel | `MdCloudDone` / `MdCloudOff` |
| Status | `MdCheckCircle` / `MdError` / `MdWarning` |
| Buscar / Sair | `MdSearch` / `MdLogout` |
| Mais / Menos | `MdAdd` / `MdRemove` |
| Fechar / Expandir | `MdClose` / `MdExpandMore` |

Ao adicionar componentes shadcn, troque os ícones do lucide pelos equivalentes `Md*` e desinstale `lucide-react`.

**React Bits** (variante TS + Tailwind):
- Instale pelo comando indicado na página do componente. Se falhar, **copie o fonte** para `src/**/components/reactbits/<Nome>.tsx` e instale as dependências que ele pedir (normalmente `motion`).
- Use **somente** nestes pontos:

| Componente | hakuna-loja | hakuna-cardapio |
|---|---|---|
| `CountUp` | KPIs de Relatórios e totais do Caixa | — |
| `AnimatedList` | coluna "Novos" do KDS e fila "Aguardando aceite" | — |
| `SpotlightCard` | cards de KPI | — |
| `FadeContent` / `AnimatedContent` | entrada das páginas | entrada das telas e confirmação do pedido |
| `BlurText` ou `ShinyText` | — | boas-vindas da loja |
| `ClickSpark` | — | botão "Confirmar pedido" |

- **Proibido** no caminho crítico do PDV (grade e carrinho).
- Todos os efeitos respeitam `prefers-reduced-motion`.

Som de novo pedido (loja): beep pela Web Audio API. O navegador exige interação antes de tocar som, então mostre o botão "Ativar som de pedidos" até o primeiro clique.

---

## 9. Estratégia de testes

### 9.1 Pirâmide

**hakuna-loja**

| Camada | Pasta | Ferramenta | O que cobre | Banco |
|---|---|---|---|---|
| Unit (maioria) | `tests/unit/` | Vitest node | schemas Zod, regras puras, casos de uso com fakes, TunnelManager, reducers e utils do web | fakes |
| Integração | `tests/integration/` | Vitest node | repositórios, UoW (rollback), migrações, colunas JSON, rotas (staff e pública), edge-guard, SSE, rate limit, backup, templates de impressão, OpenAPI | **SQLite em arquivo temporário** |
| Web | `tests/web/` | Vitest jsdom + Testing Library + MSW | páginas e componentes | MSW |
| E2E | `tests/e2e/` | Playwright | fluxos completos da equipe e API pública | arquivo temporário + seed |
| E2E desktop | `tests/e2e-desktop/` | Playwright `_electron` | smoke | temporário |

**hakuna-cardapio**

| Camada | Pasta | O que cobre |
|---|---|---|
| Unit | `tests/unit/` | cart reducer, format, regras de mín/máx, `route-parser`, `runtime-schemas`, semver, `CartStorageSchema` |
| Worker | `tests/worker/` | `edge-handler` com `FakeStoreDirectory` + `fetch` falso; `StoreEntrySchema`; `EnvSchema` |
| Web | `tests/web/` | páginas com MSW (handlers tipados por `generated.ts`) |
| E2E mock | `tests/e2e/mock/` | Playwright contra `vite preview` com rotas mockadas |
| E2E integrado | `tests/e2e/integrated/` | Playwright contra `wrangler dev` + hakuna-loja real |
| Scripts | `tests/unit/scripts/` | `provision-store` com `FakeCloudflareApi` |

⚠️ **Não use `:memory:` com libSQL na integração**, porque transações podem abrir outra conexão. Use `file:<tmpdir>/hakuna-test-<uuid>.db` e apague no `afterEach`.

### 9.2 Vitest (hakuna-loja)

```ts
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    projects: [
      { extends: true, test: { name: 'unit', include: ['tests/unit/**/*.test.{ts,tsx}'], environment: 'node' } },
      { extends: true, test: { name: 'integration', include: ['tests/integration/**/*.test.ts'], environment: 'node', pool: 'forks' } },
      { extends: true, plugins: [react()], test: { name: 'web', include: ['tests/web/**/*.test.tsx'], environment: 'jsdom', setupFiles: ['tests/support/web-setup.ts'] } },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/web/shared/components/ui/**', 'src/web/shared/components/reactbits/**', 'src/infra/db/schema/**', 'src/desktop/main.ts', 'src/desktop/electron-printer.ts'],
      thresholds: {
        'src/core/**': { lines: 95, branches: 90, functions: 95, statements: 95 },
        'src/contracts/**': { lines: 95, branches: 90, functions: 95, statements: 95 },
        'src/infra/**': { lines: 80, branches: 70, functions: 80, statements: 80 },
        'src/desktop/tunnel/**': { lines: 90, branches: 85, functions: 90, statements: 90 },
        'src/web/**': { lines: 70, branches: 60, functions: 70, statements: 70 },
      },
    },
  },
});
```

No hakuna-cardapio, a mesma ideia com os projetos `unit`, `worker` (node) e `web` (jsdom). Thresholds: `worker/**` 95/90; `src/**` 75/65.

### 9.3 Convenções

- Um arquivo de teste por caso de uso, espelhando o caminho em `tests/unit/`.
- **Estrutura obrigatória** (omitir um bloco só com comentário explicando o motivo):

```ts
describe('PlaceStaffOrder', () => {
  describe('sucesso', () => {});
  describe('validação', () => {});            // parseInput → VALIDATION_ERROR com issues[].path corretos
  describe('regras de negócio', () => {});    // BUSINESS_RULE / NOT_FOUND / CONFLICT
  describe('permissões', () => {});           // FORBIDDEN por papel
  describe('falhas de infraestrutura', () => {}); // repositório lança → erro propagado, nada persistido/publicado
  describe('offline', () => {});              // internet/túnel/impressora fora → comportamento definido
});
```

- No bloco **validação**, verifique `code` **e** o `path` do issue: `rejects.toMatchObject({ code: 'VALIDATION_ERROR', details: { issues: [expect.objectContaining({ path: 'items.0.quantity' })] } })`.
- Padrão AAA, com linha em branco entre as fases.
- Nome no formato `it('rejeita pedido quando produto está pausado')`.
- Erros de negócio: `await expect(p).rejects.toMatchObject({ kind: 'business_rule', code: 'PRODUCT_UNAVAILABLE', details: { productIds: [id] } })`.
- **Sem sleeps.** Use `FakeClock.advance()` no servidor e `vi.useFakeTimers()` no web.
- Muitos casos: `it.each` tabular.
- Testes independentes entre si.

### 9.4 Testes de schemas Zod (`tests/unit/contracts/`)

Para **cada** schema exportado de `src/contracts`:
- ✅ um exemplo mínimo válido e um completo válido;
- ❌ cada campo obrigatório ausente;
- ❌ limites exatos: `min − 1`, `max + 1` (strings e números), zero, negativo, decimal onde deve ser inteiro, string vazia, só espaços (quando usa `trim`);
- ❌ campo extra em schemas `strictObject` (públicos);
- ✅ transformações (`zPhone` normaliza, `trim` remove espaços, `coerce` converte);
- ✅ refinos entre campos com o `path` correto;
- ✅ `SettingsSchema.parse({})` retorna todos os defaults, e um JSON antigo sem campos novos recebe os defaults.

### 9.5 Fakes (hakuna-loja, `tests/support/fakes/`)

| Fake | Comportamento |
|---|---|
| `InMemory<X>Repository` | `Map`; `seed()`, `all()`, `failNextWith(err)` |
| `InMemoryUnitOfWork` | snapshot/rollback dos Maps se `work` lançar |
| `FakeClock` | `set()`, `advance(ms)` |
| `SequentialIds` | `id-1`… / `token-1`… (**formato UUID** quando o schema exigir `zUuid`: `00000000-0000-7000-8000-000000000001`) |
| `RecordingEventPublisher` | `published[]` (valida com `StaffEventSchema`) |
| `FakePrinter` | `printed[]`, `failWith()`, `failTimes(n)`, `hang()`, `printers` |
| `FakeConnectivity` | `setOnline(bool)` |
| `FakePinHasher` | `hash(pin)='hashed:'+pin` |
| `FakeImageStorage` | buffers em memória, `failWith()` |
| `FakeProcessRunner` | registra spawns; `emitOutput(line)`, `exit(code)` |
| `FakeSecretStore` | memória |
| `FakeReachabilityProbe` | `setReachable(bool)` |

`tests/support/test-context.ts`:

```ts
export function createTestContext() {
  const repos = createInMemoryRepositories();
  const uow = new InMemoryUnitOfWork(repos);
  const clock = new FakeClock(new Date('2026-01-15T15:00:00Z')); // 12:00 em São Paulo
  const ids = new SequentialIds();
  const events = new RecordingEventPublisher();
  repos.store.seed(aStore().build());
  repos.settings.seed(SettingsSchema.parse({}));
  return {
    repos, uow, clock, ids, events,
    printer: new FakePrinter(), connectivity: new FakeConnectivity(true),
    deps: { uow, clock, ids, events },
    as: (role: StaffRole): RequestContext => ({ actor: { kind: 'staff', staffId: `staff-${role}`, role } }),
    asCustomer: (): RequestContext => ({ actor: { kind: 'customer' } }),
    asSystem: (): RequestContext => ({ actor: { kind: 'system' } }),
  };
}
```

### 9.6 Builders

Fluentes, com defaults **válidos segundo os schemas**:

```ts
aProduct().named('Batata Cheddar').priced(2990).paused().withStock(3).inCategory(cat.id).build();
anOrder().ofType('TABLE').withStatus('ACCEPTED').build();
aPlaceOrderInput().withItem({ productId, quantity: 2, optionIds: [opt.id] }).build(); // entrada de caso de uso
```

Builders:
- `aStore`, `aStaff`, `aCategory`, `aProduct`;
- `aModifierGroup` (com `.withOptions()` e `.min().max()`);
- `aTable`, `aTableSession`, `aCustomer`, `anAddress`, `aZone`, `aCourier`, `anOrder`, `aPayment`, `aCashSession`;
- builders de **input**: `aPlaceOrderInput`, `aCreateProductInput`, … (testados: `Schema.parse(builder.build())` não lança).

### 9.7 Integração: helpers e obrigatórios

```ts
// tests/support/test-db.ts
export async function createTestDb(): Promise<{ db: Db; path: string; cleanup(): Promise<void> }>;
// tests/support/test-server.ts
export async function createTestApps(overrides?: Partial<ContainerDeps> & { edgeSecret?: string }): Promise<{
  staffApp: Hono; publicApp: Hono; container: Container; db: Db;
  loginAs(role: StaffRole): Promise<string>;   // cookie
  seed: Seeder; cleanup(): Promise<void>;
}>;
// Chamadas via app.request(...), sem abrir porta.
```

**Por repositório:**
1. mapeamento ida e volta;
2. UNIQUE/FK → erro esperado;
3. rollback do UoW;
4. coluna JSON corrompida (inserida por SQL cru) → `CORRUPTED_DATA` (ou defaults, no caso de `settings`).

**Por rota de staff:**
1. sem cookie → 401;
2. papel sem permissão → 403;
3. corpo/params/query inválidos → 400 com `details.issues` no formato do contrato;
4. sucesso com a resposta validada pelo schema de saída (`Schema.parse(body)`);
5. erro de regra → status + `code`.

**Por rota pública:** o mesmo, validando a resposta contra o schema Zod que gera o OpenAPI.

**Segurança e superfície pública:**

| # | Cenário | Esperado |
|---|---|---|
| SEC-1 | `publicApp` com `/api/auth/login`, `/api/orders`, `/api/events`, `/`, `/pdv` | 404 em todos |
| SEC-2 | secret configurado, sem header ou com header errado | 401 `EDGE_UNAUTHORIZED` |
| SEC-3 | `X-Hakuna-Slug` diferente do slug da loja | 404 `STORE_NOT_FOUND` |
| SEC-4 | `X-Client-IP` com secret válido | rate limit usa esse IP |
| SEC-5 | `X-Client-IP` sem secret válido, ou IP malformado | ignorado |
| SEC-6 | `GET /orders/:id` sem token ou com token errado | 404 |
| SEC-7 | SSE público com token de outro pedido | não recebe o status desse pedido |
| SEC-8 | menu público | não contém `stockQty`, custos nem dados de staff |
| SEC-9 | pedido com campo extra `priceCents` | 400 `VALIDATION_ERROR` (`strictObject`) |
| SEC-10 | rate limit em `POST /orders` | 6º pedido/min do mesmo IP → 429 com `Retry-After` |
| SEC-11 | cookie de sessão | `HttpOnly`, `SameSite=Strict` |
| SEC-12 | `.exe` renomeado para `.png` | `INVALID_IMAGE` |
| SEC-13 | nome de produto com `<script>` | escapado no recibo; retornado como texto na API |
| SEC-14 | `Idempotency-Key` ausente ou não-UUID | 400 `IDEMPOTENCY_KEY_REQUIRED` / `VALIDATION_ERROR` |

### 9.8 Testes de offline (obrigatórios)

| # | Projeto/camada | Cenário | Esperado |
|---|---|---|---|
| OFF-1 | loja unit | `PlaceStaffOrder` com `FakeConnectivity(false)` | pedido criado normalmente |
| OFF-2 | loja unit | `PrintOrder` com impressora falhando | job `FAILED` com `lastError`; evento `print.failed`; **pedido intacto** |
| OFF-3 | loja unit | `PrintOrder` com impressora travada (hang) | timeout de 15s (`FakeClock`) → `FAILED` |
| OFF-4 | loja unit | mesma `idempotencyKey` duas vezes (staff e cliente) | um pedido só; a segunda chamada devolve o mesmo; sem evento duplicado; estoque decrementado uma vez |
| OFF-5 | loja unit | `TunnelManager` sem token | `NOT_CONFIGURED`, sem spawn |
| OFF-6 | loja unit | cloudflared sai inesperadamente | `RECONNECTING`; respawn em 5s, 10s, 20s… até 5 min |
| OFF-7 | loja unit | internet offline | o probe não roda; `publicReachable=false`; nada lança |
| OFF-8 | loja unit | `stop()` | mata o processo e não reinicia |
| OFF-9 | loja unit | log "Registered tunnel connection" | `CONNECTED` + evento `system.updated` |
| OFF-10 | loja unit | updater lança sem internet | erro engolido e logado como `warn` |
| OFF-11 | loja integração | reiniciar o servidor sobre o mesmo arquivo | pedidos, caixa e jobs preservados |
| OFF-12 | loja web | `ConnectionBanner` com SSE caído / `navigator.onLine=false` | banner visível; ao voltar, invalida as queries |
| OFF-13 | loja e2e | fluxo completo de venda em `HAKUNA_MODE=test`, **sem** túnel nem internet | funciona |
| OFF-14 | cardápio worker | origem lança erro de rede | 503 `STORE_OFFLINE` |
| OFF-15 | cardápio worker | origem responde 530/502 sem JSON Hakuna | 503 `STORE_OFFLINE` |
| OFF-16 | cardápio worker | origem demora mais de 10s (não-SSE) | 503 `STORE_OFFLINE` |
| OFF-17 | cardápio worker | origem responde 422 `PRODUCT_UNAVAILABLE` | repassado inalterado |
| OFF-18 | cardápio web | envio lança `NetworkError` | "Tentar novamente"; o 2º envio usa **a mesma** `Idempotency-Key` |
| OFF-19 | cardápio web | `STORE_OFFLINE` ao abrir | tela de loja offline + retry automático (fake timers) |
| OFF-20 | cardápio web | SSE falha | polling a cada 5s; status novo atualiza a UI |
| OFF-21 | cardápio web | reload da página | carrinho preservado; `localStorage` corrompido → carrinho vazio, sem crash |
| OFF-22 | cardápio e2e integrado | `context.setOffline(true)` → confirmar → erro → `setOffline(false)` → tentar de novo | exatamente 1 pedido na loja |
| OFF-23 | cardápio e2e integrado | parar o servidor da loja com o cliente na página | "Loja offline"; ao subir de novo, volta sozinho |

### 9.9 Matrizes por caso de uso (hakuna-loja)

Legenda: ✅ sucesso · ❌ erro (code) · 🔒 permissão · 💥 infra · 📴 offline.
**Todos** os casos de uso também têm: ❌ entrada inválida → `VALIDATION_ERROR` (pelo menos um caso por campo, verificando o `path`); 🔒 papel sem permissão → `FORBIDDEN`; 💥 repositório lança → erro propagado, nada persistido, nenhum evento.

#### Loja / Staff / Auth

| Caso de uso | Casos |
|---|---|
| `SetupStore` | ✅ cria store + OWNER + settings default · ❌ já existe → `STORE_ALREADY_EXISTS` · ❌ slug inválido/reservado → `VALIDATION_ERROR` (path `slug`) · ❌ PIN fora de 4–6 dígitos (path `ownerPin`) |
| `UpdateStore` | ✅ nome/fuso/virada/logo · ✅ mudar o slug retorna `details.qrCodesInvalidated=true` · ❌ slug inválido/reservado |
| `CreateStaff` | ✅ PIN hasheado · ❌ PIN em uso → `PIN_TAKEN` · ❌ nome em uso → `STAFF_NAME_TAKEN` · 🔒 só OWNER |
| `DeactivateStaff` | ✅ desativa e revoga as sessões · ❌ último OWNER ativo → `LAST_OWNER` · ❌ a si mesmo → `CANNOT_DEACTIVATE_SELF` |
| `Login` | ✅ sessão de 12h · ❌ PIN errado → `INVALID_PIN`, e a tentativa é contada · ❌ 5 erros em 5 min → `AUTH_LOCKED` (mesmo com o PIN certo) · ✅ aceita de novo quando o bloqueio expira · ❌ funcionário inativo → `INVALID_PIN` |
| `ResolveSession` | ✅ sessão válida renova `last_seen_at` · ❌ expirada, inexistente ou staff inativo → `UNAUTHORIZED` |
| `Logout` | ✅ remove · ✅ idempotente |
| `GetSettings` / `UpdateSettings` | ✅ defaults mesclados (campos novos aparecem) · ✅ merge parcial · ❌ `serviceFeePercent` 31 (path `tableService.serviceFeePercent`) · ❌ `paperWidthMm` 70 · ✅ mudança em `customerMenu` publica `catalog.changed` |

#### Catálogo

| Caso de uso | Casos |
|---|---|
| `CreateCategory` | ✅ `sort_order` = último + 1 · ❌ nome vazio ou > 60 · ❌ duplicado (case-insensitive, ignorando arquivadas) → `CATEGORY_NAME_TAKEN` |
| `ArchiveCategory` | ✅ · ❌ com produtos ativos → `CATEGORY_HAS_PRODUCTS` |
| `ReorderCategories` / `ReorderProducts` | ✅ · ❌ ids duplicados (schema) · ❌ ids faltando ou sobrando → `REORDER_MISMATCH` |
| `CreateProduct` | ✅ ACTIVE, visível, estoque null · ✅ com estoque · ❌ preço negativo ou decimal (path `priceCents`) · ❌ categoria inexistente ou arquivada → `CATEGORY_NOT_FOUND` · ❌ nome > 80 · ✅ publica `catalog.changed` |
| `UpdateProduct` | ✅ altera os campos · ❌ arquivado → `PRODUCT_ARCHIVED` · ✅ não altera pedidos antigos (snapshot) |
| `PauseProduct` / `ResumeProduct` | ✅ muda + evento · ✅ idempotente, sem evento · ❌ inexistente ou arquivado · ✅ KITCHEN e WAITER podem |
| `ArchiveProduct` | ✅ some do menu público; pedidos antigos continuam legíveis |
| `SetProductStock` | ✅ ≥ 0 · ✅ null · ❌ negativo (schema) |
| `CreateModifierGroup` / `UpdateModifierGroup` | ✅ · ❌ max < min (`superRefine`, path `maxSelect`) · ❌ max = 0 · ❌ sem opções · ❌ min maior que o nº de opções |
| `SetProductModifierGroups` | ✅ mantém a ordem · ❌ grupo inexistente → `MODIFIER_GROUP_NOT_FOUND` · ❌ duplicados (schema) |
| `PauseModifierOption` / `Resume` | ✅ · ❌ inexistente |
| `UploadProductImage` | ✅ salva e remove a anterior · ❌ tipo inválido → `INVALID_IMAGE` · ❌ > 1 MB → `IMAGE_TOO_LARGE` · 💥 storage falha → produto inalterado |
| `GetAdminCatalog` | ✅ tudo, com pausados, sem arquivados, ordenado |
| `GetPublicMenu` | ✅ só categorias com ≥ 1 produto visível · ✅ pausado ou sem estoque → `available:false` · ✅ `visibleToCustomers=false` não aparece · ✅ opção pausada → `available:false` · ❌ `customerMenu.enabled=false` → `CUSTOMER_MENU_DISABLED` |

#### Mesas

| Caso de uso | Casos |
|---|---|
| `CreateTable` | ✅ · ❌ número em uso → `TABLE_NUMBER_TAKEN` · ❌ fora de 1–999 (schema) |
| `CreateTablesBatch` | ✅ cria de 1 a N, pulando as existentes · ❌ N > 200 (schema) |
| `DeactivateTable` | ✅ · ❌ sessão aberta → `TABLE_HAS_OPEN_SESSION` |
| `ListTables` | ✅ `FREE`/`OCCUPIED`, total parcial, pendentes, minutos aberta |
| `GetPublicTable` | ✅ ativa · ❌ inexistente ou inativa → `TABLE_NOT_FOUND` |
| `GetTableQrCodes` | ✅ URLs `publicAccess.baseUrl + '/' + slug + '/mesa/' + n` · ✅ `details.publicAccessConfigured=false` sem túnel configurado |

#### Pedidos

**`PlaceStaffOrder`**
- ✅ `COUNTER` → `ACCEPTED`, número 1 do dia, totais corretos.
- ✅ segundo pedido → número 2.
- ✅ às 04:00 local → novo dia, número 1.
- ✅ às 01:30 local com virada às 04h → `business_date` do dia anterior.
- ✅ `TABLE` sem sessão → abre sessão; `TABLE` com sessão → reutiliza.
- ✅ `DELIVERY` com cliente/endereço/bairro → taxa do bairro + snapshot do endereço.
- ✅ taxa manual com `order.override_delivery_fee`.
- ✅ complementos somam no preço.
- ✅ desconto em valor e em %.
- ✅ decrementa o estoque.
- ✅ grava `order_events CREATED` e publica `order.created`.
- ✅ impressão automática conforme settings (job criado).
- ✅ idempotência (OFF-4).
- ❌ carrinho vazio (path `items`) · ❌ quantidade 0 ou 100 (path `items.N.quantity`) · ❌ `DELIVERY` sem cliente/endereço (`superRefine`, path `customerId`/`addressId`) · ❌ desconto em % > 100.
- ❌ produto inexistente → `PRODUCT_NOT_FOUND`.
- ❌ pausado ou arquivado → `PRODUCT_UNAVAILABLE {productIds}`.
- ❌ estoque insuficiente (inclusive somando linhas) → `INSUFFICIENT_STOCK`.
- ❌ complementos inválidos → um teste por `reason`.
- ❌ desconto > subtotal → `DISCOUNT_EXCEEDS_SUBTOTAL`.
- ❌ mesa inexistente ou inativa → `TABLE_NOT_FOUND`.
- ❌ delivery desabilitado → `DELIVERY_DISABLED`.
- ❌ abaixo do mínimo → `DELIVERY_MINIMUM_NOT_MET`.
- 🔒 WAITER com `DELIVERY` ou com desconto · 🔒 KITCHEN.
- 💥 falha no insert de um item → nada persistido (pedido, sequência, estoque). Teste de **integração**.

**`PlaceCustomerTableOrder`**
- ✅ aceite ligado → `PENDING_ACCEPTANCE` + `publicToken`.
- ✅ aceite desligado → `ACCEPTED` + impressão da cozinha.
- ✅ total calculado a partir do banco.
- ✅ nome opcional (≤ 40, com `trim`).
- ✅ idempotência.
- ✅ evento `order.created` com `channel: CUSTOMER`.
- ❌ cardápio desabilitado → `CUSTOMER_MENU_DISABLED`.
- ❌ mesa inexistente ou inativa → `TABLE_NOT_FOUND`.
- ❌ > 30 linhas / qtd > 20 / observação > 140 / campo extra (schema estrito).
- ❌ `visibleToCustomers=false` → `PRODUCT_UNAVAILABLE`.
- ❌ demais erros de produto, complemento e estoque iguais aos do staff.

**`AcceptOrder`**: ✅ `PENDING_ACCEPTANCE` → `ACCEPTED` + evento + impressão da cozinha (se configurado) · ❌ outro status → `INVALID_STATUS_TRANSITION` · ✅ KITCHEN pode.

**`RejectOrder`**: ✅ → `REJECTED`, devolve o estoque, grava `rejection_reason` · ❌ outro status · ❌ motivo vazio ou curto (schema).

**`ChangeOrderStatus`**: `it.each` com **todas** as combinações de `ORDER_TRANSITIONS` (✅ válidas / ❌ `INVALID_STATUS_TRANSITION`) · ❌ `to` fora do enum (schema) · ❌ sessão fechada → `TABLE_SESSION_CLOSED` · ✅ grava evento com `staff_id`.

**`CancelOrder`**: ✅ devolve o estoque + evento · ❌ com pagamento ativo → `ORDER_HAS_PAYMENTS` · ❌ status final → `INVALID_STATUS_TRANSITION` · ❌ motivo inválido (schema) · 🔒 WAITER/KITCHEN.

**`AssignCourier`**: ✅ · ❌ pedido não é delivery → `NOT_A_DELIVERY_ORDER` · ❌ entregador inativo ou inexistente → `COURIER_NOT_FOUND`.

**`ListOrders`**: ✅ filtros (dia de negócio padrão = hoje, status, tipo, canal, busca por número ou nome) · ✅ mais recentes primeiro · ❌ `date` malformada (schema).

**`GetPublicOrderStatus`**: ✅ com token · ❌ sem token ou com token errado → `ORDER_NOT_FOUND` · ✅ `rejectionReason` só quando `REJECTED`.

**`ListKitchenQueue`**: ✅ só `ACCEPTED`/`PREPARING`/`READY` do dia · ✅ `READY` some após `hideReadyAfterMinutes` · ✅ ordem de criação.

#### Clientes / Delivery

| Caso de uso | Casos |
|---|---|
| `CreateCustomer` | ✅ normaliza · ✅ sem telefone · ❌ telefone inválido (path `phone`) · ❌ duplicado → `CUSTOMER_PHONE_TAKEN {customerId}` |
| `SearchCustomers` | ✅ dígitos parciais · ✅ nome sem acento e sem diferença de maiúsculas · ✅ várias palavras (AND) · ✅ limite 20 · ✅ termo < 2 → [] · ✅ exclui anonimizados |
| `AddCustomerAddress` | ✅ associa ao bairro pelo nome normalizado · ❌ rua, número e bairro obrigatórios (schema) |
| `AnonymizeCustomer` | ✅ remove a PII e mantém os pedidos · 🔒 |
| `CreateDeliveryZone` / `Update` | ✅ · ❌ nome duplicado · ❌ taxa inválida (schema) |
| `CreateCourier` / `Update` | ✅ · ❌ nome vazio (schema) |

#### Pagamentos / Conta / Caixa

| Caso de uso | Casos |
|---|---|
| `OpenCashSession` | ✅ · ❌ já aberto → `CASH_SESSION_ALREADY_OPEN` · ❌ valor inválido (schema) |
| `AddCashMovement` | ✅ sangria e suprimento · ❌ sem caixa → `CASH_SESSION_NOT_OPEN` · ❌ motivo vazio (schema) · ❌ sangria > esperado → `INSUFFICIENT_CASH` |
| `CloseCashSession` | ✅ esperado e diferença exatos com dataset fixo (estornos ignorados) · ✅ job `CASH_CLOSING` · ❌ sem caixa |
| `AddOrderPayment` | ✅ parcial → `PARTIAL` · ✅ total → `PAID` · ✅ troco · ✅ vários métodos · ❌ sem caixa · ❌ > saldo → `PAYMENT_EXCEEDS_BALANCE` · ❌ `tendered < amount` (`superRefine`, path `tenderedCents`) · ❌ pedido `TABLE` → `USE_TABLE_BILL` · ❌ cancelado/rejeitado → `ORDER_NOT_PAYABLE` |
| `VoidPayment` | ✅ saldo volta · ❌ já estornado → `PAYMENT_ALREADY_VOIDED` · 🔒 CASHIER |
| `GetTableBill` | ✅ soma dos válidos + taxa sugerida + pagamentos + saldo · ❌ sem sessão → `TABLE_HAS_NO_OPEN_SESSION` |
| `AddTableBillPayment` | idem ao `AddOrderPayment`, sobre a sessão, considerando `includeServiceFee` |
| `CloseTableBill` | ✅ saldo 0 fecha e conclui os pedidos · ✅ sem taxa · ❌ pedido pendente de aceite → `TABLE_HAS_PENDING_ORDERS` · ❌ saldo > 0 → `TABLE_BILL_NOT_PAID {remainingCents}` |

#### Impressão

| Caso de uso | Casos |
|---|---|
| `PrintOrder` | ✅ um job por via, cópias conforme settings · ✅ sucesso → `PRINTED` + `order_events PRINTED` · ❌ sem impressora → job `FAILED` `PRINTER_NOT_CONFIGURED` (não lança) · 📴 OFF-2, OFF-3 |
| `RetryPrintJob` | ✅ `FAILED` → reimprime · ❌ `PRINTED` → `PRINT_JOB_NOT_RETRYABLE` |
| `PrintTestPage` | ✅ · ❌ sem impressora |
| `renderReceipt` (puro) | snapshot por via × largura 58/80 · ✅ escapa HTML · ✅ complementos, observações, mesa/cliente/endereço/referência, troco, "PAGO" |

#### Relatórios (integração, dataset fixo `tests/support/fixtures/sales-dataset.ts`)

| Caso de uso | Casos |
|---|---|
| `GetSalesSummary` | ✅ números exatos (pedidos, bruto, descontos, taxas de entrega, taxa de serviço, líquido, ticket médio, por método com estornos, por tipo, por canal) · ✅ exclui cancelados e rejeitados · ❌ `from > to` (`superRefine`) · ❌ intervalo > 366 dias |
| `GetTopProducts` | ✅ quantidade e receita, top N, empate ordenado por nome |
| `GetSalesByHour` | ✅ 24 buckets no fuso da loja |
| `GetCourierReport` | ✅ entregas e taxas por entregador |
| Performance | ✅ 20 mil pedidos → resumo de 1 ano em < 500 ms |

#### Sistema

| Caso de uso | Casos |
|---|---|
| `CreateBackup` | ✅ arquivo íntegro · ✅ retenção de 30 · 💥 falha → `BACKUP_FAILED` logado |
| `RestoreBackup` | ✅ faz backup do atual antes · ❌ arquivo corrompido → `INVALID_BACKUP`, e nada muda |
| `ConfigurePublicAccess` | ✅ salva token/secret criptografados e inicia o túnel · ❌ token vazio (schema) · ❌ secret < 32 (schema) · 🔒 OWNER |
| `GetSystemStatus` | ✅ agrega todos os indicadores |

### 9.10 Matriz do Worker (hakuna-cardapio)

| Cenário | Esperado |
|---|---|
| `GET /lojaxpto/api/menu` | fetch para `https://<origin>/api/v1/public/menu` com secret, slug e IP; sem cookie nem authorization |
| `POST /lojaxpto/api/orders` | corpo e `Idempotency-Key` repassados |
| query string | preservada |
| `GET /lojaxpto/uploads/a.webp` | proxy com cache de 1 ano |
| `GET /lojaxpto/api/events` | stream repassado, sem timeout |
| slug inexistente | 404 `STORE_NOT_FOUND` |
| slug inválido (`/LOJA!/api/x`) | 404 `STORE_NOT_FOUND`, sem consultar o KV |
| entrada do KV malformada (JSON inválido ou sem `edgeSecret`) | 404 `STORE_NOT_FOUND` + log |
| `PUT` / `DELETE` | 405 |
| corpo > 64 KB | 413 |
| OFF-14 a OFF-17 | ver §9.8 |
| KV lança erro | 503 `EDGE_UNAVAILABLE` |
| rota `/lojaxpto/mesa/3` | **não** passa pelo proxy (asset/SPA) |
| `EnvSchema` inválido (sem binding `STORES`) | o Worker responde 500 `EDGE_MISCONFIGURED` e loga |

`route-parser` com `it.each`: `/`, `/lojaxpto`, `/lojaxpto/`, `/lojaxpto/mesa/3`, `/lojaxpto/api/menu`, `/lojaxpto/api/orders/abc?token=x`, `/lojaxpto/uploads/x.webp`, `/api/menu` (reservado), `/assets/x.js`.

### 9.11 Testes web obrigatórios

**hakuna-loja**
- `cart-reducer`, `format`, `applyServerIssues` (unit).
- `LoginPage`: erro, bloqueio, sucesso.
- `SetupPage`: PINs diferentes; slug gerado a partir do nome e editável; slug reservado mostra erro no campo.
- `PdvPage`: item simples; complemento obrigatório bloqueia até cumprir o mínimo; payload correto (MSW); `PRODUCT_UNAVAILABLE` marca a linha.
- `CatalogAdminPage`: pausa otimista revertida em caso de erro (com toast); erros de validação do servidor aparecem nos campos certos.
- `KitchenPage`: pedidos novos aparecem; botões chamam a API; cores do cronômetro com fake timers.
- `IncomingOrderToast`: aceitar/recusar.
- `PublicAccessSettingsPage`: estados do túnel; validação de token/secret.
- `ConnectionBanner`.
- `useServerEvents`: evento inválido é ignorado sem quebrar.

**hakuna-cardapio**
- `StoreEntryPage`: mesa válida navega; mesa inválida mostra erro; loja offline; loja inexistente; API antiga.
- `MenuPage`: item indisponível sem botão; bottom sheet com mín/máx; `catalog.changed` refaz a busca e marca o carrinho.
- `CheckoutPage`: OFF-18; bloqueia com item indisponível; sucesso navega com o token.
- `OrderStatusPage`: steps via SSE mock; fallback de polling (OFF-20); rejeitado mostra o motivo.
- Resposta da loja fora do schema → tela `INVALID_RESPONSE`.
- Acessibilidade: inputs e botões com `name` acessível (`getByRole`).

### 9.12 E2E obrigatórios

**hakuna-loja**

`npm run start:e2e` sobe as portas 3299 (staff) e 3300 (público) com o seed "Hakuna Teste": slug `lojateste`; OWNER `1234`, CASHIER `2222`, WAITER `4444`, KITCHEN `3333`; produtos com complementos; mesas 1–10; 3 bairros; 2 entregadores; edge secret de 32+ caracteres.

1. Onboarding em banco vazio (servidor iniciado com `--empty`).
2. Balcão: abrir caixa → PDV com complemento → finalizar → dinheiro com troco → pago.
3. Delivery: busca por telefone → novo cliente → endereço → taxa do bairro → entregador → concluir.
4. Mesa pela equipe: WAITER cria pedido na mesa 2 → KITCHEN avança → CASHIER fecha a conta com taxa e pagamento misto.
5. Pedido de cliente via **API pública** (request direto na porta 3300, com o secret): aparece para a equipe → aceitar → status muda.
6. Cancelamento devolve o estoque.
7. O relatório do dia bate com os fluxos acima.
8. Permissões: KITCHEN em `/relatorios` é redirecionado.
9. OFF-13.

`tests/e2e-desktop/smoke.spec.ts`: lança o Electron com `HAKUNA_DATA_DIR` temporário → `/api/health` responde → fechar a janela mantém o servidor → o `cloudflared` não inicia sem token → `app.quit()` encerra.

**hakuna-cardapio integrado** (`tests/e2e/integrated/`, contextos mobile + staff)

1. O celular abre `/lojateste` → mesa 5 → itens com complemento → confirma → "Aguardando confirmação" → a equipe (outro contexto, em `http://127.0.0.1:3299`) aceita → o celular vê "Aceito" sem recarregar → KITCHEN marca pronto → o celular vê "Pronto".
2. Cardápio ao vivo: item no carrinho → OWNER pausa → o celular vê "Indisponível" → confirmar fica bloqueado → remover → confirmar.
3. OFF-22 e OFF-23.
4. Rejeição: a equipe recusa com motivo → o celular vê o motivo.
5. `/naoexiste` → "Loja não encontrada".

---

## 10. Plano de execução (fases e tarefas)

> **L** = tarefa no `hakuna-loja`. **C** = tarefa no `hakuna-cardapio`. Cada tarefa segue objetivo → passos → DoD. Não comece uma fase sem a anterior verde.

### FASE L0: Fundação do hakuna-loja

- [ ] **L0.1 Repositório.** Criar `C:\dev\hakuna-loja` (fora do OneDrive), `git init`, `npm init -y`, `.nvmrc` (`22`), `.gitignore` (node_modules, dist, release, .data, coverage, playwright-report, test-results, `*.db*`, `resources/bin/*.exe`) e `.editorconfig`. Copiar este plano para `docs/PLANO.md`. Criar as ADRs `0001-stack.md` (§2), `0002-dois-repositorios.md` (§2.1) e `0003-zod-em-fronteiras.md` (§3.6). Criar o repositório privado no GitHub.
  - DoD: primeiro commit no GitHub.
- [ ] **L0.2 Dependências.**
  ```bash
  npm i react react-dom react-router @tanstack/react-query react-hook-form @hookform/resolvers zod \
    react-icons hono @hono/node-server @hono/zod-validator @hono/zod-openapi drizzle-orm @libsql/client \
    pino pino-roll uuid bcryptjs qrcode recharts motion sonner clsx tailwind-merge \
    class-variance-authority @fontsource-variable/inter electron-updater
  npm i -D typescript vite @vitejs/plugin-react @tailwindcss/vite tailwindcss vite-tsconfig-paths \
    tsup tsx electron electron-builder drizzle-kit vitest @vitest/coverage-v8 jsdom \
    @testing-library/react @testing-library/user-event @testing-library/jest-dom msw \
    @playwright/test eslint @eslint/js typescript-eslint eslint-plugin-react-hooks \
    eslint-plugin-react-refresh prettier concurrently cross-env \
    @types/node @types/react @types/react-dom @types/qrcode
  ```
  - Confirme que `zod` instalado é v4 (`npm ls zod`) e que `@hono/zod-validator`, `@hono/zod-openapi` e `@hookform/resolvers` são compatíveis com ele. Se algum não for, registre uma ADR com a versão escolhida.
  - DoD: `npm ls` sem erros críticos.
- [ ] **L0.3 TypeScript.**
  - `tsconfig.base.json`: strict + paths `@core/*`, `@contracts/*`, `@infra/*`, `@desktop/*`, `@web/*`, `@tests/*`.
  - `tsconfig.node.json`: contracts, core, infra, desktop, tests (exceto web), scripts e configs.
  - `tsconfig.web.json`: DOM + `jsx: react-jsx`; web, contracts, tests/web, tests/unit/web.
  - `tsconfig.json` com `references` para os dois.
- [ ] **L0.4 Pastas** da §3.3 (com `.gitkeep`).
- [ ] **L0.5 Scripts** no `package.json`:
  ```json
  {
    "main": "dist/node/desktop/main.js",
    "scripts": {
      "dev": "concurrently -k -n server,web \"tsx watch src/infra/standalone.ts\" \"vite\"",
      "dev:desktop": "npm run build:node && cross-env HAKUNA_DEV_URL=http://localhost:5173 electron .",
      "build:web": "vite build",
      "build:node": "tsup",
      "build": "npm run build:web && npm run build:node",
      "start:server": "node dist/node/server/standalone.js",
      "start:e2e": "tsx scripts/start-e2e.ts",
      "dist:win": "npm run build && electron-builder --win",
      "fetch-cloudflared": "tsx scripts/fetch-cloudflared.ts",
      "openapi:export": "tsx scripts/export-openapi.ts",
      "typecheck": "tsc -p tsconfig.node.json --noEmit && tsc -p tsconfig.web.json --noEmit",
      "lint": "eslint .",
      "format": "prettier --write .",
      "test": "vitest run",
      "test:unit": "vitest run --project unit",
      "test:integration": "vitest run --project integration",
      "test:web": "vitest run --project web",
      "test:coverage": "vitest run --coverage",
      "test:e2e": "playwright test --project=chromium",
      "test:e2e-desktop": "playwright test --project=desktop",
      "check": "npm run lint && npm run typecheck && npm run test",
      "db:generate": "drizzle-kit generate",
      "db:seed": "tsx scripts/seed.ts"
    }
  }
  ```
  - `vite.config.ts`: proxy de `/api` e `/uploads` para `http://127.0.0.1:3210`; `build.outDir = 'dist/web'`.
- [ ] **L0.6 ESLint e fronteiras.** Flat config com `@eslint/js`, `typescript-eslint` (recommended-type-checked), react-hooks, react-refresh e:
  ```js
  { files: ['src/core/**/*.ts'], rules: { 'no-restricted-imports': ['error', { patterns: [{
      group: ['@infra/*','@web/*','@desktop/*','hono','hono/*','@hono/*','drizzle-orm','drizzle-orm/*','@libsql/*','electron','react','react-dom','pino','node:*','fs','path','child_process'],
      message: 'src/core deve ser puro (permitido: zod e @contracts/*).' }] }] } },
  { files: ['src/contracts/**/*.ts'], rules: { 'no-restricted-imports': ['error', { patterns: [{
      group: ['@core/*','@infra/*','@web/*','@desktop/*','hono','hono/*','react'], message: 'contracts só depende de zod.' }] }] } },
  { files: ['src/web/**/*.{ts,tsx}'], rules: { 'no-restricted-imports': ['error', {
      patterns: [
        { group: ['@core/*','@infra/*','@desktop/*'], message: 'web fala com o servidor só via HTTP.' },
        { group: ['react-icons/*','!react-icons/md'], message: 'Use apenas react-icons/md.' } ],
      paths: [
        { name: 'zustand', message: 'Proibido.' }, { name: 'lucide-react', message: 'Use react-icons/md.' },
        { name: 'moment', message: 'Proibido.' } ] }] } },
  ```
  - Regras extras:
    - `@typescript-eslint/no-explicit-any: error`;
    - `no-console: ['error', { allow: ['warn','error'] }]` (exceto em `scripts/`);
    - `@typescript-eslint/consistent-type-assertions: ['error', { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }]`, que desencoraja `as` em objetos. Revise todo `as` em code review: dado externo **sempre** passa por Zod.
  - DoD: importar `hono` em `src/core` de propósito faz o lint falhar (teste e depois reverta).
- [ ] **L0.7 Vitest e Playwright.**
  - `vitest.config.ts` (§9.2) e `tests/support/web-setup.ts` (jest-dom + MSW).
  - `playwright.config.ts`: projetos `chromium` e `desktop`; `webServer: { command: 'npm run build:web && npm run start:e2e', url: 'http://127.0.0.1:3299/api/health', reuseExistingServer: !process.env.CI }`; `baseURL` na 3299; `trace: 'retain-on-failure'`.
  - Um teste trivial por projeto.
- [ ] **L0.8 CI.** `ci.yml` (§4.9), ainda sem e2e.
  - DoD: CI verde.

### FASE L1: Esqueleto andante

- [ ] **L1.1 `contracts` base + `core/shared`.**
  - `contracts`: `zod-setup.ts` (locale pt + helpers da §3.6.1), `common.ts` (`ErrorResponseSchema`, `IdParamSchema`, `IdempotencyKeySchema`), `error-codes.ts`.
  - `core/shared`: `errors.ts`, `validation.ts` (`parseInput`, `toValidationError`), `money.ts`, `text.ts`, `business-date.ts`, `context.ts`, `ports.ts`, `events.ts`, `unit-of-work.ts`.
  - Testes:
    - **cada helper Zod** (§9.4);
    - `parseInput`: sucesso retorna os dados transformados; falha gera `VALIDATION_ERROR` com `issues[].path` em notação de ponto (`items.0.quantity`);
    - `money`: inteiros, negativos, decimais, `NaN`, `MAX_SAFE_INTEGER + 1`, arredondamento de `percentOf`;
    - `text`: acentos e espaços;
    - `business-date` (`it.each`): 03:59 vs 04:00, virada de mês e de ano, `America/Sao_Paulo` e `America/Manaus`, `startsAtHour=0`.
  - DoD: cobertura ≥ 95%.
- [ ] **L1.2 `tests/support` base.** `FakeClock`, `SequentialIds`, `RecordingEventPublisher`, `InMemoryUnitOfWork` (com teste de rollback) e `createTestContext` inicial.
- [ ] **L1.3 Config e logger.** `env.ts` (§4.4) + testes (defaults, porta inválida, secret curto, mensagem de erro legível) e `logger.ts` (redaction de `pin`, `token`, `cookie`, `phone`, `secret`).
- [ ] **L1.4 Banco.**
  - `client.ts` (PRAGMAs), `migrate.ts`, `drizzle.config.ts`, schemas `store` e `settings`, `json-columns.ts`, `db:generate`, `test-db.ts`.
  - Integração: migrações num banco vazio e reaplicadas; `foreign_keys = 1`; `journal_mode = wal`; `settings` com JSON inválido → defaults + `warn`.
- [ ] **L1.5 HTTP base.**
  - `staff-app.ts`: request-id, secure-headers, log de requisição, error handler (§3.5.9), `validate.ts`, `GET /api/health`, SPA estática com fallback (todo GET fora de `/api` e `/uploads` → `index.html`), 404 JSON para `/api/*` desconhecido.
  - `public-app.ts`: só o health, por enquanto.
  - Integração:
    - health nos dois apps;
    - 404 JSON;
    - cada `ErrorKind` → status certo;
    - rota de teste com `validate('json', Schema)` e corpo inválido → 400 com `details.issues`;
    - `ZodError` lançado cru → 400;
    - erro desconhecido → 500 `INTERNAL` sem stack;
    - `GET /pedidos` → `index.html` no staff e 404 no público.
- [ ] **L1.6 Servidor.**
  - `startServer(opts)`, com opts validadas por `ServerOptionsSchema`: sobe os **dois** apps (staff em `host:port`, público em `127.0.0.1:publicPort`) e retorna `{ staffUrl, publicPort, stop() }`. Criar também o `standalone.ts`.
  - Integração: subir nas portas 0/0 e checar o health dos dois; `stop()` libera as portas; porta ocupada → `PORT_IN_USE`.
- [ ] **L1.7 Web base.**
  - `index.html`, `main.tsx`, `providers.tsx`, `router.tsx` (placeholders) e `index.css` (Tailwind v4 + tokens + Inter).
  - `npx shadcn@latest init` com aliases `@web/shared/components`, `@web/shared/components/ui` e `@web/shared/lib/utils`.
  - Adicionar `button input dialog sheet card badge switch tabs select sonner skeleton table dropdown-menu tooltip label form separator scroll-area alert`.
  - **Trocar lucide por Md e desinstalar `lucide-react`.**
  - `shared/api/http-client.ts`: `ApiError`/`NetworkError`; corpo de erro lido com `ErrorResponseSchema.safeParse`. Testes: sucesso, 204, erro com corpo válido, erro com corpo inválido → `UNKNOWN`, falha de rede.
  - `shared/lib/apply-server-issues.ts` + teste.
  - Página temporária "Servidor online".
- [ ] **L1.8 Desktop.**
  - `paths.ts`, `main.ts` (§4.5, itens 1–9 e 13), `preload.ts`, `tray.ts` e `tsup.config.ts`. Por enquanto, `NullPrinter`. Em dev (`HAKUNA_DEV_URL`), a janela carrega o Vite.
  - DoD: `npm run dev:desktop` abre a janela; fechar mantém a bandeja; um celular na LAN acessa `http://<ip>:3210/api/health`.
- [ ] **L1.9 Instalador.** `icon.ico` placeholder, `installer.nsh` e `electron-builder.yml` (ainda sem cloudflared).
  - DoD: `npm run dist:win` gera o instalador; instalar numa VM ou PC limpo e abrir; a regra de firewall existe.
- [ ] **L1.10 E2E inicial.**
  - `scripts/start-e2e.ts` (apaga `.data/e2e`, roda o seed, sobe 3299/3300) e `scripts/seed.ts` vazio.
  - `tests/e2e/smoke.spec.ts` e `tests/e2e-desktop/smoke.spec.ts`.
  - Ativar e2e no CI.

### FASE L2: Loja, funcionários, autenticação, configurações

- [ ] **L2.1 Contratos e domínio.**
  - Contratos: `contracts/store.ts`, `staff.ts`, `auth.ts`, `settings.ts` (`SettingsSchema` com defaults) + testes de schema (§9.4).
  - Domínio: `store` (slug + lista reservada), `staff` (`permissions.ts` com `assertCan`), `settings` (`mergeSettings`) e o port `PinHasher`.
  - Testes: tabela **completa** de permissões (`it.each` ação × papel), slug e merge.
- [ ] **L2.2 Casos de uso.** `SetupStore`, `UpdateStore`, `CreateStaff`, `UpdateStaff`, `DeactivateStaff`, `Login`, `ResolveSession`, `Logout`, `GetSettings`, `UpdateSettings` (matriz da §9.9) + fakes.
- [ ] **L2.3 Infra.** Schemas `staff`, `staff_sessions` e `auth_attempts` + repositórios + `BcryptPinHasher` + testes de integração.
- [ ] **L2.4 HTTP.** Middlewares `session` e `requireStaff`; rotas bootstrap, setup, auth, staff, store e settings.
  - Integração: setup → login → me → logout; flags do cookie; força bruta → 429; corpos inválidos → 400 com `path`.
- [ ] **L2.5 Web.**
  - `RequireAuth` e `RequireCan`.
  - `SetupPage` (RHF + zod): nome → slug sugerido e editável, com prévia `cardapioX.com/<slug>`; fuso; virada do dia; nome do dono; PIN duas vezes (refine de UI).
  - `LoginPage` com teclado numérico grande.
  - `AppShell` (sidebar Md, topbar).
  - `/configuracoes/funcionarios` e `/configuracoes/loja`.
  - Testes web (§9.11).
- [ ] **L2.6 E2E.** Cenário 1 + login/logout + cenário 8 (parcial).

### FASE L3: Cardápio (administração)

- [ ] **L3.1 Contratos e domínio.** `contracts/catalog.ts` + testes de schema. Domínio `catalog`: tipos, `isProductOrderable`, `validateModifierSelection`, errors e ports. Regras testadas em tabela (uma linha por `reason`).
- [ ] **L3.2 Casos de uso** do catálogo (§9.9), exceto upload e menu público.
- [ ] **L3.3 Infra DB.** Schemas + repositórios + testes de integração.
- [ ] **L3.4 Imagens.**
  - `ImageStoragePort` (`save(bytes, mime) → fileName`, `delete`) + `LocalImageStorage` (`<dataDir>/uploads/<uuid>.<ext>`, com validação por magic bytes).
  - `UploadProductImage`: metadados validados com Zod; rota multipart; `/uploads/*` com `Cache-Control: public, max-age=31536000, immutable`.
  - No web, `resize-image.ts` (canvas → WebP, lado maior 800px, qualidade 0.8) + teste com canvas mockado.
- [ ] **L3.5 HTTP** de staff do catálogo + presenters + testes de integração (§9.7).
- [ ] **L3.6 Web `/cardapio`.**
  - Categorias: criar, renomear, arquivar e reordenar (`MdArrowUpward`/`MdArrowDownward`).
  - Produtos em cards: foto, nome, preço, badges Pausado/Sem estoque/Oculto, `Switch` de pausa **otimista**.
  - `ProductFormDialog` (RHF + `zodResolver(CreateProductInputSchema)`): nome, descrição, `MoneyInput`, categoria, estoque, visível para o cliente, grupos, foto.
  - Aba Complementos (`ModifierGroupEditor`, com o `superRefine` de mín/máx aparecendo no campo).
  - Busca; estados vazio, carregando e erro.
- [ ] **L3.7 E2E.** Criar categoria + produto com "Adicionais" (0–3) → pausar → editar preço.

### FASE L4: Mesas

- [ ] **L4.1** Contratos + domínio + casos de uso de mesas (§9.9) + tipos e repositório de `TableSession`.
- [ ] **L4.2** Infra (índice único parcial) + testes de integração.
- [ ] **L4.3** HTTP de staff.
- [ ] **L4.4 Rede.** `infra/system/network.ts` (`listLanAddresses`, testado com `os.networkInterfaces` mockado) + `GET /api/system/status` inicial.
- [ ] **L4.5 Web.**
  - `/mesas`: cards com Livre/Ocupada, total, tempo e pendentes.
  - `/configuracoes/mesas`: criar individual ou em lote, ativar/desativar e **Imprimir QR codes** — página A4 em grade, QR em SVG via `qrcode` com a URL de `GetTableQrCodes`, número grande e o texto "Aponte a câmera para pedir". Se o acesso pela internet não estiver configurado, mostrar alerta.

### FASE L5: Pedidos + PDV

- [ ] **L5.1 Contratos e domínio.**
  - `contracts/orders.ts`: `PlaceStaffOrderInputSchema` como `discriminatedUnion` por `type`, com `superRefine`s; desconto como união discriminada; testes de schema.
  - Domínio `orders`: tipos, `ORDER_TRANSITIONS`, `assertTransition`, `calculateOrderTotals`, `buildOrderLines(items, productsWithGroups, channel)` (disponibilidade, estoque agregado, complementos, snapshots) e errors.
  - Testes tabulares exaustivos.
- [ ] **L5.2 Casos de uso.** `PlaceStaffOrder` (sem DELIVERY, que fica como `it.todo` até a L9.3), `ChangeOrderStatus`, `CancelOrder`, `GetOrder` e `ListOrders`. Usar `OrderSequenceRepository.next(businessDate)`.
- [ ] **L5.3 Infra.** Schemas de pedidos + repositórios (`findByIdempotencyKey`; `delivery_address` via `json-columns`).
  - Integração: rollback total quando falha um item; dois pedidos em `Promise.all` ficam com os números 1 e 2.
- [ ] **L5.4 SSE staff.** `sse-hub.ts` implementa `EventPublisher`: guarda um Set de clientes staff e um de clientes públicos (com filtro por pedido) e valida cada evento com o schema antes de enviar. `GET /api/events` com ping a cada 25s.
  - Integração: o cliente recebe o evento; desconectar limpa o Set.
- [ ] **L5.5 HTTP de pedidos.** `Idempotency-Key` obrigatório no POST, validado com `IdempotencyKeySchema` → `400 IDEMPOTENCY_KEY_REQUIRED`.
- [ ] **L5.6 Web base.**
  - `features/cart` (§8.3 + testes).
  - `ProductPicker`.
  - `ModifierDialog`.
  - `useServerEvents` (com `StaffEventSchema`).
  - `useConnectionStatus` + `ConnectionBanner`.
- [ ] **L5.7 Web `/pdv`.**
  - Modalidade: Balcão e Mesa (Delivery desabilitado até a L9).
  - Mesa, nome do cliente, carrinho e desconto conforme permissão.
  - "Finalizar (F4)" → toast com o número do pedido.
  - Atalhos de teclado; linhas com erro ficam marcadas.
- [ ] **L5.8 Web `/pedidos`.**
  - Filtros (validados com o schema da query).
  - Tabela com badges.
  - Drawer com itens, complementos, observações e timeline de `order_events`.
  - Ações: mudar status; cancelar com motivo.
- [ ] **L5.9 E2E.** Pedidos de balcão e de mesa feitos pela equipe.

### FASE L6: API pública v1 + recebimento de pedidos do cliente

- [ ] **L6.1 Contratos públicos.** `src/contracts/public/*.ts`: entradas com `z.strictObject`, respostas e `PublicEventSchema`. Testes de schema.
- [ ] **L6.2 Casos de uso.** `GetPublicInfo`, `GetPublicMenu`, `GetPublicTable`, `PlaceCustomerTableOrder`, `AcceptOrder`, `RejectOrder` e `GetPublicOrderStatus` (§9.9).
- [ ] **L6.3 Middlewares.**
  - `rateLimit({ windowMs, max, key })` em memória, com limpeza (unit com `FakeClock`).
  - `edge-guard` (§4.6.3).
- [ ] **L6.4 Rotas públicas OpenAPI** (`public-routes/`), registradas nos dois apps, + SSE público filtrado.
  - Integração: todas as rotas + **SEC-1 a SEC-10** e **SEC-14**.
- [ ] **L6.5 OpenAPI.**
  - `scripts/export-openapi.ts` gera `openapi/public-v1.json` (`info.version` = `apiVersion` = `1.0.0`).
  - Criar `CHANGELOG-API.md` e o passo de CI com `git diff --exit-code`.
  - Integração: o documento gerado é um OpenAPI 3.1 válido e contém todas as rotas da §7.1.
- [ ] **L6.6 Web staff.**
  - Novo pedido do cliente → toast persistente com Aceitar/Recusar (motivo validado) + beep + badge em Pedidos/Mesas.
  - Seção "Aguardando aceite" no topo de `/pedidos` (`AnimatedList`).
  - `/configuracoes/cardapio-cliente`.
  - **Pausa rápida** no AppShell (busca de produto + toggle).
- [ ] **L6.7 E2E.** Cenário 5 da §9.12.
- [ ] **L6.8 Release interna `v0.1.0`** (tag), para publicar o `public-v1.json` como asset.

### FASE C0: Fundação do hakuna-cardapio

- [ ] **C0.1 Repositório.** Criar `C:\dev\hakuna-cardapio` com git, `.nvmrc` e `.gitignore`; `docs/PLANO.md` (cópia deste arquivo) e as ADRs `0001-stack.md` e `0002-zod-em-fronteiras.md`. Repositório privado no GitHub.
- [ ] **C0.2 Dependências.**
  ```bash
  npm i react react-dom react-router @tanstack/react-query openapi-fetch zod react-icons motion sonner \
    clsx tailwind-merge class-variance-authority @fontsource-variable/inter
  npm i -D typescript vite @vitejs/plugin-react @tailwindcss/vite tailwindcss vite-tsconfig-paths \
    @cloudflare/vite-plugin wrangler @cloudflare/workers-types openapi-typescript tsx \
    vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/user-event \
    @testing-library/jest-dom msw @playwright/test eslint @eslint/js typescript-eslint \
    eslint-plugin-react-hooks eslint-plugin-react-refresh prettier @types/react @types/react-dom
  ```
- [ ] **C0.3 Configs.**
  - tsconfig para web e para worker (com `@cloudflare/workers-types`).
  - `vite.config.ts` com `cloudflare()` e `react()`.
  - `wrangler.jsonc`: `name`, `main: worker/index.ts`, `assets` (§4.6.2), `kv_namespaces: [{ binding: 'STORES', id }]`, `env.staging`, `env.production`, `vars.ENVIRONMENT`.
  - ESLint com as mesmas regras de ícones, zustand, lucide e `as`.
  - Vitest com os projetos `unit`, `worker` e `web`; Playwright com `mock` e `integrated`.
  - Scripts: `dev`, `build`, `preview`, `deploy:staging`, `deploy:production`, `api:sync`, `typecheck`, `lint`, `test`, `test:e2e`, `test:e2e-integrated`, `check`.
- [ ] **C0.4 Contrato.**
  - `scripts/sync-openapi.ts <tag> | --local <caminho>` (args validados com Zod) → `openapi/public-v1.json` + `openapi-typescript` → `src/shared/api/generated.ts`.
  - Criar `.hakuna-loja-version` e rodar o sync com `v0.1.0`.
- [ ] **C0.5 Zod e UI base.** `src/shared/lib/zod-setup.ts` (locale + helpers usados no cliente); shadcn com ícones Md; tokens; Inter.
- [ ] **C0.6 CI.** `ci.yml`, ainda sem o job integrado.

### FASE C1: Edge router (Worker)

- [ ] **C1.1 `worker/env.ts`** (`EnvSchema`: binding `STORES`, `ENVIRONMENT`, `ASSETS`) + testes.
- [ ] **C1.2 `route-parser.ts`** + testes (§9.10).
- [ ] **C1.3 `store-directory.ts`.** Port `StoreDirectory.get(slug) → { origin, edgeSecret } | null`; adapter KV com `StoreEntrySchema` (entrada inválida → `null` + log); `FakeStoreDirectory`. Testes.
- [ ] **C1.4 `edge-handler.ts`.** `createEdgeHandler({ directory, fetchOrigin, assets, env })` implementando a §4.6.2; `worker/index.ts` só faz a ligação.
  - Testes: matriz da §9.10 + OFF-14 a OFF-17 (timeout com `vi.useFakeTimers` e `AbortSignal`).
- [ ] **C1.5 `responses.ts`.** Erros JSON no formato `ErrorResponseSchema`.
- [ ] **C1.6 Deploy de staging** manual (`wrangler deploy --env staging`) com um slug de teste apontando para um túnel temporário numa máquina de dev.
  - DoD: `https://staging.cardapioX.com/<slug>/api/info` responde, vindo do PC.

### FASE C2: App do cliente

- [ ] **C2.1 Base.**
  - `providers.tsx` e `router.tsx` (§8.2); `useStoreSlug` e `useRouteParams(Schema)`.
  - `shared/api/client.ts` (openapi-fetch + erros + `ErrorResponseSchema`) e `runtime-schemas.ts` (Zod para `info`, resposta do `POST /orders` e eventos públicos). Incluir um teste de tipos: `expectTypeOf<z.infer<typeof InfoSchema>>().toMatchTypeOf<components['schemas']['PublicInfo']>()`.
  - `error-messages.ts`, `format.ts`, `idempotency.ts` (`crypto.randomUUID`), `storage.ts` (localStorage + Zod) e `semver.ts`.
  - Testes unit.
- [ ] **C2.2 Compatibilidade.** `useStoreInfo()` + comparação com `MIN_STORE_API_VERSION` + as telas especiais da §8.2.
- [ ] **C2.3 `/`**: landing simples.
- [ ] **C2.4 `/:slug`**: entrada com o número da mesa (form com Zod).
- [ ] **C2.5 `/:slug/mesa/:number`**: menu, abas com scroll-spy, cards, bottom sheet de complementos (mín/máx), carrinho (`cart` + provider + persistência com `CartStorageSchema`) e botão flutuante.
- [ ] **C2.6 Tempo real.** `usePublicEvents` (SSE validado + fallback de polling) + `markUnavailable`.
- [ ] **C2.7 Confirmação e envio.** Idempotência, retries, OFF-18.
- [ ] **C2.8 `/:slug/pedido/:id`**: steps, rejeição com motivo e "Fazer outro pedido".
- [ ] **C2.9 React Bits** (`BlurText`, `FadeContent`, `ClickSpark`), respeitando `prefers-reduced-motion`.
- [ ] **C2.10 Testes.** Testes web (§9.11) + **E2E mock** (fluxo feliz, offline, loja inexistente, resposta inválida).
- [ ] **C2.11 Performance.** Bundle inicial < 150 KB gzip; Lighthouse mobile ≥ 90.

### FASE C3: E2E integrado

- [ ] **C3.1** Job `e2e-integrado` no CI (§4.9) + `tests/e2e/integrated/*` (§9.12).
  - DoD: verde contra a tag atual do hakuna-loja.

### FASE L7: Cozinha (KDS)

- [ ] **L7.1** `ListKitchenQueue` + rota.
- [ ] **L7.2 `/cozinha`.**
  - Tela cheia, escura, com 3 colunas.
  - Cards com número grande, tipo/mesa, itens, complementos e observações **destacadas**.
  - Cronômetro com as cores de `settings.kitchen`.
  - Botões grandes: Iniciar → Pronto → Entregue.
  - `AnimatedList` na coluna Novos; som; Fullscreen API.
  - Atualização por SSE, com polling de 30s como reserva.
  - Testes web.
- [ ] **L7.3 E2E.** Parte da cozinha no cenário 4.

### FASE L8: Impressão USB

- [ ] **L8.1 Domínio `printing`.** `PrintJob`, `ReceiptKind` e `PrinterPort` (`listPrinters`, `print({ html, deviceName, copies, paperWidthMm })`). Casos de uso `PrintOrder`, `PrintTableBill`, `PrintCashClosing`, `RetryPrintJob`, `ListPrintJobs` e `PrintTestPage`. Matriz + OFF-2 e OFF-3.
- [ ] **L8.2 Templates.** `renderReceipt` (§9.9): HTML com CSS inline, largura 58/80mm, fonte monoespaçada, logo opcional em data URI e **escape obrigatório**. Conteúdo de cada via:
  - **KITCHEN:** número grande, tipo, mesa, hora, itens, complementos e observações, **sem preços**.
  - **CUSTOMER:** loja, número, data, itens com preço, subtotal, desconto, taxa, total, pagamentos, troco e rodapé.
  - **DELIVERY:** cliente, telefone, endereço, referência, bairro, itens, total, pagamento, "troco para" e entregador.
  - **TABLE_BILL:** mesa, pedidos, subtotal, taxa de serviço, total e pagamentos.
  - **CASH_CLOSING:** abertura, entradas por método, sangrias, suprimentos, esperado, contado e diferença.

  Testes de snapshot.
- [ ] **L8.3 Adapters.**
  - `ElectronHtmlPrinter`:
    - cria uma `BrowserWindow` oculta (`show:false`, `sandbox:true`, `javascript:false`);
    - carrega o HTML com `loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))`;
    - imprime com `webContents.print({ silent: true, deviceName, copies, margins: { marginType: 'none' }, pageSize: { width: paperWidthMm * 1000, height: 297000 } }, cb)`;
    - timeout de 15s e `destroy()` no `finally`;
    - `listPrinters` via `getPrintersAsync()`.
  - `NullPrinter` para os modos server e test.
- [ ] **L8.4 Auto-print.** Escuta `order.created`/`order.status_changed` e chama `PrintOrder` conforme `settings.printing.autoPrint`, sempre fora da transação e capturando erros. Testes unit.
- [ ] **L8.5 Web.**
  - `/configuracoes/impressora`: select de impressora, largura, cópias, cabeçalho/rodapé, logo, auto-print e "Imprimir teste".
  - Indicador na topbar.
  - Toast `print.failed` com "Reimprimir".
  - Reimpressão no detalhe do pedido.
- [ ] **L8.6 Docs.** Em `docs/INFRA.md`: instalar o driver da térmica USB (do fabricante; se não houver, "Generic / Text Only") e testar. **Checklist manual** com a impressora real.

### FASE L9: Clientes, delivery e entregadores

- [ ] **L9.1** Contratos + domínio + casos de uso (§9.9).
- [ ] **L9.2** Infra + HTTP.
- [ ] **L9.3** `PlaceStaffOrder` com DELIVERY (ativar os `it.todo`) + `AssignCourier`.
- [ ] **L9.4 Web.**
  - `/clientes`: busca, detalhe com histórico, edição, anonimização.
  - PDV Delivery: busca F3 com debounce de 250ms, novo cliente inline, endereço, taxa automática (editável com permissão), "troco para".
  - `/configuracoes/delivery` e `/configuracoes/entregadores`.
  - `/pedidos`: filtro Delivery + atribuir entregador.
- [ ] **L9.5 E2E.** Cenário 3.

### FASE L10: Pagamentos, conta e caixa

- [ ] **L10.1** Contratos + casos de uso (§6.7, §6.8, §9.9).
- [ ] **L10.2** Infra + HTTP.
- [ ] **L10.3 Web.**
  - `PaymentDialog`: saldo, métodos em botões grandes, valor pré-preenchido, "valor recebido" → troco ao vivo, múltiplos pagamentos.
  - `/mesas/:id/conta`: itens por pedido, taxa com toggle, total, pagar, imprimir conta; o botão fechar só fica habilitado com saldo 0.
  - `/caixa`: abrir com valor inicial, resumo com `CountUp`, sangria/suprimento, fechar informando o contado → diferença → imprime.
  - Aviso no PDV quando não há caixa aberto.
- [ ] **L10.4 E2E.** Cenários 2, 4 (fechamento) e 6.

### FASE L11: Relatórios

- [ ] **L11.1** Contratos (query `from`/`to` com `superRefine`) + port `ReportsQuery` (SQL direto permitido no adapter) + casos de uso + dataset fixo + testes de integração com números exatos + teste de performance.
- [ ] **L11.2 Web `/relatorios`.**
  - Presets: Hoje, Ontem, 7 dias, Este mês, Mês passado, Este ano, Personalizado.
  - KPIs com `CountUp` + `SpotlightCard`.
  - Gráficos `recharts`: por dia, por hora, por método, por tipo.
  - Top produtos, entregadores e exportação CSV.
- [ ] **L11.3 E2E.** Cenário 7.

### FASE L12: Operação e acesso pela internet

- [ ] **L12.1 TunnelManager** (§4.6.4): `ProcessRunner`, `SecretStore` (`safeStorage`), `ReachabilityProbe` (resposta validada com Zod), estados, backoff e logs. Unit OFF-5 a OFF-9.
- [ ] **L12.2 `scripts/fetch-cloudflared.ts`.** Versão e SHA-256 fixados em `scripts/cloudflared.lock.json` (validado com Zod). Integrado ao `release.yml` e aos `extraResources`.
- [ ] **L12.3 Tela Acesso pela internet** + rotas `/api/public-access*` + `ConfigurePublicAccess` + indicador na topbar + e2e-desktop (sem token, o túnel não inicia).
- [ ] **L12.4 Backup e restore** (§4.11) + telas + testes.
- [ ] **L12.5 Auto-update** (§4.8).
  - Checar ao iniciar e a cada 6h; baixar em segundo plano.
  - Aplicar ao sair ou por "Reiniciar agora"; nunca forçado com caixa aberto.
  - ADR sobre o repositório de releases; `release.yml`; OFF-10.
- [ ] **L12.6 Desktop final.** Iniciar com o Windows, impedir suspensão, bandeja completa e "Exportar diagnóstico".
- [ ] **L12.7 Status final.** `/api/system/status` e topbar completa.
- [ ] **L12.8 Seed de demonstração** "Hakuna Batatas", passando pelos casos de uso (que validam com Zod):
  - categorias Batatas, Bebidas e Porções;
  - grupos "Monte seu sabor" (1–2), "Adicionais" (0–5) e "Remover" (0–3);
  - 10 mesas, 3 bairros, 2 entregadores e 4 funcionários.
- [ ] **L12.9 Documentação.**
  - `README.md`.
  - `docs/INFRA.md`: requisitos do PC (Windows 10/11 64-bit, 4 GB RAM, SSD), roteador (reserva DHCP), rede privada, firewall, impressora, acesso pela internet (colar token e secret), backup externo, atualização e **solução de problemas**.
  - `docs/OPERACAO.md`: manual do dono.

### FASE C4: Plataforma (provisionamento e produção)

- [ ] **C4.1 `provision-store.ts` / `deprovision-store.ts`** (§4.6.1), com o port `CloudflareApi` (respostas validadas com Zod).
  - Testes unit com fake: sucesso; slug já existe; slug reservado; falha no meio → rollback do que já foi criado.
- [ ] **C4.2 `docs/PLATAFORMA.md`.**
  - Registrar o domínio e colocá-lo na Cloudflare.
  - Criar o token de API com o mínimo de permissões (Tunnel edit, DNS edit, Workers KV edit).
  - Criar os namespaces KV de staging e produção.
  - Rodar o provisionamento e entregar token e secret à loja.
  - Rotacionar o secret.
  - Desativar uma loja.
- [ ] **C4.3 `deploy.yml`.** `main` → staging; tag → produção (com aprovação). Secrets `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`.
- [ ] **C4.4 Produção.** Apontar o domínio `cardapioX.com` para o Worker; smoke manual com uma loja piloto.

### FASE R: Release V1

- [ ] **R.1 Hardening.**
  - Suítes completas verdes nos dois repositórios, com a cobertura nos thresholds.
  - Performance dos relatórios e Lighthouse do cardápio.
  - Checklist de segurança da §4.10.
  - Teste manual num PC real com a impressora USB real, 2 tablets e 3 celulares (Wi-Fi e 4G), incluindo derrubar a internet do PC no meio do movimento.
- [ ] **R.2** Publicar o hakuna-loja `v1.0.0` (instalador) e o hakuna-cardapio `v1.0.0` (produção).
- [ ] **R.3** Instalar na loja piloto seguindo o `docs/INFRA.md`; provisionar o slug; imprimir os QR codes; treinar a equipe com o `docs/OPERACAO.md`.

---

## 11. Definição de pronto global

- [ ] `npm run check` verde localmente e no CI, no projeto da tarefa.
- [ ] Testes com a estrutura da §9.3 (sucesso, validação, regras, permissões, infra, offline).
- [ ] Todo schema novo em `contracts` testado conforme a §9.4.
- [ ] Nenhum dado externo entra sem Zod (§3.6), e nenhum `as` foi usado para "converter" dado externo.
- [ ] Cobertura dentro dos thresholds.
- [ ] Nenhum `any`, `console.log`, `TODO` sem issue, ícone fora de `react-icons/md` ou import proibido.
- [ ] Textos em pt-BR. Todo `code` de erro novo tem mensagem em `error-messages.ts` (**nos dois** projetos, se for público).
- [ ] Toda tela tem estados de carregando, vazio e erro.
- [ ] hakuna-loja: nenhuma dependência de internet em runtime. As exceções (túnel e updater) são opcionais e tolerantes a falha.
- [ ] Se o schema do banco mudou: migração gerada e commitada.
- [ ] Se a API pública mudou: OpenAPI exportado, bump em `apiVersion`, `CHANGELOG-API.md` atualizado e o hakuna-cardapio sincronizado (`api:sync`) quando for usar o recurso novo.
- [ ] Commits em Conventional Commits.

---

## 12. Backlog futuro (não fazer agora)

- Cardápio do cliente servido **também pela LAN**, como fallback quando a internet da loja cair (o hakuna-loja empacotaria o build do hakuna-cardapio).
- Pedido de delivery ou retirada feito pelo próprio cliente via `cardapioX.com/<slug>` (fora da loja).
- Chamar garçom / pedir a conta pelo celular.
- Pix com QR dinâmico e baixa automática.
- Painel remoto do dono e backup na nuvem. Isso exigiria outbox transacional e sincronização; desenhar em ADR antes de começar.
- Vários PCs servidores na mesma loja.
- iFood, marketplaces e NFC-e.
- Fidelidade/cashback, cupons e status por WhatsApp.
- Ficha técnica e estoque de insumos.
- Impressão ESC/POS direta (gaveta de dinheiro, corte de papel).
- Assinatura de código (Azure Trusted Signing).
