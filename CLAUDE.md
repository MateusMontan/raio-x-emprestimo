# Raio-X do Empréstimo — instruções para o Claude

Leia antes de qualquer tarefa: `docs/SPEC.md`, `docs/ARCHITECTURE.md`, `docs/CONVENTIONS.md`, `docs/adr/README.md`.
Front-end: leia também `docs/DESIGN.md` e use a skill `frontend-design`.

## Estado atual
- [x] Scaffold do monorepo (pnpm) e `@raiox/finance` (117 testes, cobertura de 99%)
- [x] `packages/contracts`: schemas Zod (R7) compartilhados
- [x] `apps/api`: Hono + D1, casos de uso, OpenAPI e Scalar, Cron de limpeza
- [x] `apps/web`: Vue 3 com o design system "Carnê"
- [x] CI/CD: `.github/workflows/ci.yml` e `deploy.yml`. O `verify` passa no GitHub.
- [ ] Primeiro deploy: o job falha porque o secret `CLOUDFLARE_API_TOKEN` chega vazio. Criar `CLOUDFLARE_API_TOKEN` (Workers Scripts: Edit e D1: Edit) e `CLOUDFLARE_ACCOUNT_ID` como _repository secrets_ do Actions e rodar o deploy de novo.
- [x] README de portfólio e `docs/SDD.md`. Falta só trocar o aviso do topo do README pela URL da demo depois do primeiro deploy.

## Infra já criada
- Banco D1 `raiox-db`, id `5832dfed-df38-4666-8082-f7f67f555446` (região ENAM). Use esse id no `wrangler.jsonc`.

## Fluxo de trabalho com subagentes (obrigatório)
1. O agente principal planeja e quebra o trabalho em módulos pequenos. Não implementa código grande sozinho.
2. Cada módulo vai para o subagente **`implementer`** (Haiku), com um briefing curto: o escopo, os arquivos de docs relevantes e o critério de pronto.
3. No fim, o subagente **`reviewer`** (Sonnet) recebe **apenas** a SPEC e o diff (`git diff <base>..HEAD`). Não repasse histórico de conversa para ele.
4. O agente principal aplica as correções da revisão, delegando de novo ao `implementer` quando forem grandes.

## Regras
- Nada de cálculo financeiro fora de `@raiox/finance`.
- `pnpm -r lint && pnpm -r typecheck && pnpm -r test` precisa passar antes de cada commit.
- Conventional Commits, pequenos. Não use force push.
