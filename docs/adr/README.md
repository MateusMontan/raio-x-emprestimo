# Architecture Decision Records

| # | Decisão | Status |
|---|---------|--------|
| 001 | Cloudflare Workers + D1 (custo zero, sem cold start relevante) em vez de Laravel em host gratuito | Aceita |
| 002 | Dinheiro em centavos inteiros; taxas em `number` com solver numérico; arredondamento por parcela com resíduo na última | Aceita |
| 003 | Um Worker servindo API e front (Static Assets) em vez de Pages + Worker separados: um deploy, sem CORS | Aceita |
| 004 | Schemas Zod em `@raiox/contracts` compartilhados entre API e Web: o contrato é uma única fonte da verdade | Aceita |
| 005 | Design system próprio, sem kit de UI pronto, para ter identidade visual e não cara de template | Aceita |
| 006 | Link compartilhado guarda só as entradas; o resultado é recalculado, então correções de regra valem retroativamente | Aceita |

## ADR-001 — Plataforma
**Contexto:** o projeto precisa ficar em produção com custo zero e de forma permanente. Hosts gratuitos de PHP ou Docker dormem (Render: 15 min) ou expiram o banco (30 dias).
**Decisão:** TypeScript em Cloudflare Workers, com D1 e Cron Triggers.
**Consequências:** limite de 10 ms de CPU por requisição. Os algoritmos precisam ser O(n) com n ≤ 420; o desempenho é coberto por um teste de benchmark.

## ADR-002 — Precisão monetária
**Contexto:** ponto flutuante acumula erro, e bibliotecas decimais aumentam o bundle e o custo de CPU.
**Decisão:** `Money` guarda centavos inteiros (`number`, seguro até 2^53). O cálculo intermediário usa `number`, e o arredondamento (half-even) acontece só na fronteira de cada parcela; a última parcela fecha o saldo em 0.
**Consequências:** os resultados batem ao centavo com as planilhas de referência dos testes.
