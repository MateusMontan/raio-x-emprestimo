# Arquitetura

## Visão geral

Um único **Cloudflare Worker** serve a API (Hono) e os arquivos estáticos do front (Vue 3, via Workers Static Assets).
Banco: **D1** (SQLite), usado só para links compartilhados.

```
Browser ──► Worker (raiox)
             ├── /api/*      → Hono → casos de uso → @raiox/finance
             │                                  └──► SimulationRepository (D1)
             └── /*          → Static Assets (SPA Vue, fallback index.html)
```

## Monorepo (pnpm workspaces)

```
packages/
  finance/     # Domínio puro: Price, SAC, IOF, CET, datas. Zero dependências, zero I/O.
  contracts/   # Schemas Zod compartilhados (API ↔ Web). Única fonte da verdade dos DTOs.
apps/
  api/         # Hono no Worker. Camadas: http → application → infrastructure.
  web/         # Vue 3 + Vite + TS. Consome contracts; nenhum cálculo financeiro no front.
docs/          # SPEC, ARCHITECTURE, ADRs
```

## Camadas (Clean / Hexagonal)

| Camada | Pacote | Depende de | Regra |
|--------|--------|------------|-------|
| Domínio | `@raiox/finance` | nada | Funções puras e value objects (`Money`, `Rate`, `IsoDate`). Toda regra financeira mora aqui. |
| Contratos | `@raiox/contracts` | zod | Schemas de entrada e saída, com validação dos limites da R7. |
| Aplicação | `apps/api/src/application` | finance, contracts | Casos de uso: `CalculateSimulation`, `AnalyzeOffer`, `ShareSimulation`, `GetSharedSimulation`. Dependem de **ports** (interfaces), nunca de D1 ou Hono. |
| Infraestrutura | `apps/api/src/infrastructure` | application | `D1SimulationRepository`, `CryptoIdGenerator`, `SystemClock`. |
| HTTP | `apps/api/src/http` | application, contracts | Rotas Hono com `@hono/zod-openapi`, tratamento de erros (RFC 9457 Problem Details), OpenAPI e Scalar em `/api/docs`. |
| Composição | `apps/api/src/index.ts` | tudo | **Composition root**: o único lugar que instancia as implementações concretas. |

### SOLID na prática
- **S:** cada sistema de amortização é uma classe com uma responsabilidade (`PriceSchedule`, `SacSchedule`).
- **O/L:** `AmortizationStrategy` é uma interface; um novo sistema (ex.: SACRE) entra sem alterar o código existente, e qualquer estratégia funciona no lugar de outra.
- **I:** ports pequenos e separados (`SimulationWriter`, `SimulationReader`, `IdGenerator`, `Clock`).
- **D:** os casos de uso recebem os ports pelo construtor; os testes usam fakes em memória.
- **TaxPolicy versionada:** as alíquotas de IOF são dados com vigência e fonte, não constantes espalhadas pelo código.

## API (v1)

| Método | Rota | Caso de uso | Persistência |
|--------|------|-------------|--------------|
| POST | `/api/v1/simulations/calculate` | CalculateSimulation | não |
| POST | `/api/v1/offers/analyze` | AnalyzeOffer | não |
| POST | `/api/v1/simulations` | ShareSimulation → `{ id, url }` | D1 |
| GET | `/api/v1/simulations/:id` | GetSharedSimulation (recalcula) | D1 |
| GET | `/api/health` | — | — |
| GET | `/api/docs` | Scalar UI + `/api/openapi.json` | — |

Erros: `application/problem+json` com `type`, `title`, `status`, `detail` e `errors[]` por campo.

## Banco (D1)

```sql
CREATE TABLE shared_simulations (
  id          TEXT PRIMARY KEY,          -- 10 chars, base62, gerado com crypto.getRandomValues
  input_json  TEXT NOT NULL,             -- só as entradas validadas, nunca o resultado
  schema_ver  INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL,             -- ISO-8601
  expires_at  TEXT NOT NULL
);
CREATE INDEX idx_shared_expires ON shared_simulations(expires_at);
```
A limpeza dos links expirados roda em um **Cron Trigger** diário (incluído no plano gratuito).

## Front-end

- Vue 3 com `<script setup>` e TypeScript strict, Vue Router e sem store global: o estado fica em composables por feature.
- Pastas por feature: `features/simulate`, `features/analyze`, `features/compare`, `features/share`.
- Design system próprio em `apps/web/src/design` (tokens CSS e componentes base). Sem biblioteca de UI pronta, para não ter visual de template.
- Formatação `pt-BR` centralizada (`Intl.NumberFormat`, `Intl.DateTimeFormat`).

## Qualidade e CI

- **Testes:** Vitest no `finance` (unitários com tabelas de referência), na `api` (casos de uso com fakes e rotas via `app.request`) e na `web` (componentes críticos).
- **Lint e formatação:** ESLint (flat config) e Prettier.
- **GitHub Actions:** `ci.yml` (install → lint → typecheck → test → build) em todo PR; `deploy.yml` na `main` (migrations do D1 → `wrangler deploy`).
- **Commits:** Conventional Commits.
