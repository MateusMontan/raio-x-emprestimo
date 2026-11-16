# Convenções de código (leia antes de implementar)

- TypeScript `strict: true`, `noUncheckedIndexedAccess: true`, ESM, Node 22, pnpm workspaces.
- Nomes de código em **inglês**; textos de UI e docs em **pt-BR**.
- Funções puras no domínio; nada de `Date.now()`/`Math.random()` fora de adapters (`Clock`, `IdGenerator`).
- Sem `any`. Erros de domínio são classes que estendem `DomainError` com `code` estável.
- Um arquivo = uma responsabilidade. Arquivos > 200 linhas são sinal de quebrar.
- Testes ao lado do código (`*.test.ts`), Vitest. Nome do teste descreve comportamento em pt-BR.
- Imports entre pacotes só via nome do pacote (`@raiox/finance`), nunca caminho relativo cruzando pacotes.
- Commits: Conventional Commits (`feat(finance): ...`, `test(api): ...`, `chore: ...`), pequenos e atômicos.
- Antes de concluir: `pnpm -r lint && pnpm -r typecheck && pnpm -r test` devem passar.
