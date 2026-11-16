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

## Pendências (parou em 2026-11-16)
1. **Secrets do deploy** (só o dono do repo): criar `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` em Settings > Secrets and variables > Actions.
2. **Correções da revisão na web que faltam** (o `implementer` parou por limite de uso; itens 1, 2, 3 e 4a já estão commitados):
   - 4b: texto que não é número mostra erro de formato ("Use o formato 1.234,56.", "Use vírgula para os decimais, como em 2,5.", "Digite só números inteiros."), não "Informe o valor.".
   - 5: marcar o resultado como desatualizado quando o formulário fica inválido ou a API falha (`isStale` em `shared/useValidatedRequest.ts`).
   - 6: `features/compare/bestBy.ts` decide empate de "Menor CET" pelo valor exibido (2 casas), não por igualdade de float.
   - 7: HTTP 410 em `/s/:id` mostra a página amigável ("Este link não está mais disponível. Faça uma nova simulação.").
   - 8: `apps/web/public/_headers` ganha `Strict-Transport-Security` e `Permissions-Policy`.
3. Rodar `pnpm -r lint && pnpm -r typecheck && pnpm -r test` e `pnpm format:check` na raiz (os últimos commits foram verificados só por pacote).
4. Conferir `/api/docs` no navegador: a CSP nova e a versão fixa do Scalar ainda não foram vistas renderizando.
5. Registrar na SPEC e no `docs/SDD.md` as regras que mudaram: prazo inviável é rejeitado com 422 (R1/R2), IOF "não calcular" não consulta política de tributos (R3), ponto fixo do IOF fecha em 0 centavo, link em formato antigo responde 410.
6. `git push origin main` (há commits locais não enviados) e acompanhar o deploy até a URL responder.
7. Depois do deploy: trocar o aviso do topo do README pela URL da demo e o `{{DEMO_URL}}` do último slide.
8. Risco aceito na v1, só documentar: o limite de compartilhamento é por IP e por localização; não há teto diário de gravações no D1.

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
