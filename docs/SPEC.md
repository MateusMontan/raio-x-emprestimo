# Raio-X do Empréstimo — Especificação

> Ferramenta pública e gratuita para o **consumidor** entender quanto um empréstimo realmente custa.
> Todas as regras de cálculo vêm de fontes públicas (citadas em cada regra). Nenhuma regra de negócio
> de instituição financeira específica é usada.

## 1. Problema

Ofertas de crédito costumam destacar a **parcela** e a **taxa nominal**, mas o custo real inclui IOF,
tarifas e seguros. O consumidor raramente consegue calcular o **CET (Custo Efetivo Total)** sozinho.

## 2. Público

Pessoa física que recebeu uma ou mais ofertas de empréstimo e quer comparar.

## 3. Funcionalidades (escopo v1)

| ID | Funcionalidade | Descrição |
|----|----------------|-----------|
| F1 | **Simular** | A partir de valor, taxa mensal, prazo e sistema (Price ou SAC), gera o cronograma completo, IOF e CET. |
| F2 | **Raio-X de oferta** | A partir de *valor liberado*, *parcela* e *prazo* informados pelo banco, descobre a taxa implícita e o CET. |
| F3 | **Comparar** | Até 3 cenários lado a lado, destacando o mais barato pelo CET e pelo total pago. |
| F4 | **Compartilhar** | Salva a simulação e devolve um link curto (`/s/:id`). O link guarda só as **entradas**; o resultado é sempre recalculado. |
| F5 | **API pública** | Os mesmos cálculos via API REST documentada (OpenAPI 3.1 em `/api/docs`). |

**Fora do escopo v1:** login, histórico por usuário, carência, taxas pós-fixadas, financiamento imobiliário
(SFH/SFI), consignado com margem.

## 4. Regras de cálculo

Todas as regras ficam no pacote `@raiox/finance` (TypeScript puro, sem I/O) e têm testes com casos conferidos à mão.

### R1. Tabela Price (parcelas fixas)
`PMT = PV · i / (1 − (1 + i)^−n)`
- Juros do período = saldo devedor × i; amortização = PMT − juros.
- Arredondamento ao centavo por parcela; a **última parcela absorve o resíduo** para o saldo fechar em 0,00.
- Fonte: matemática financeira clássica (sistema francês de amortização).

### R2. SAC (amortização constante)
`A = PV / n`; juros_k = saldo_{k−1} × i; parcela_k = A + juros_k.
- Mesma regra de resíduo da R1.

### R3. IOF — operações de crédito, pessoa física
- **Diário:** 0,0082% ao dia sobre **cada amortização**, contando os dias entre a liberação e o vencimento de cada parcela, limitado a 365 dias.
- **Adicional:** 0,38% sobre o valor do principal, uma única vez.
- Pode ser **financiado** (somado ao principal) ou **pago à vista** (descontado do valor liberado). Padrão: financiado.
- Quando financiado, o valor do IOF depende do principal, que depende do IOF; resolve-se por iteração de ponto fixo até a diferença ficar abaixo de R$ 0,01.
- Fonte: Decreto nº 6.306/2007, art. 7º, com as alíquotas vigentes. As alíquotas ficam em uma **política de tributos versionada** (`TaxPolicy`), com data de vigência e link da norma, para que uma mudança de alíquota seja só uma nova versão, sem mexer no algoritmo.

### R4. CET — Custo Efetivo Total
Taxa `CET` (anual) que satisfaz:

`FC0 = Σ_{j=1..n} FC_j / (1 + CET)^((d_j − d_0) / 365)`

- `FC0` = valor efetivamente **liberado** ao cliente (principal − encargos pagos à vista).
- `FC_j` = cada parcela paga pelo cliente.
- `d_j − d_0` = dias corridos entre a liberação e o vencimento j.
- Resolver com Newton-Raphson e cair para bisseção se não convergir. Tolerância de 1e-10 e no máximo 100 iterações.
- CET mensal exibido = `(1 + CET_anual)^(1/12) − 1`.
- Fonte: Resolução CMN nº 3.517/2007 (fórmula do anexo).

### R5. Taxa implícita (Raio-X, F2)
Dado PV, PMT e n, encontra o `i` mensal que satisfaz a R1 (TIR da série uniforme). Mesmo solver da R4.

### R6. Datas
- 1º vencimento: padrão = data de contratação + 30 dias; pode ser informado.
- Vencimentos seguintes: mesmo dia nos meses subsequentes. Se o mês não tiver esse dia, usa o último dia do mês.
- Fuso: datas sem hora (ISO `YYYY-MM-DD`). Nada depende do fuso do servidor.

### R7. Limites de entrada (validação)
| Campo | Mínimo | Máximo |
|-------|--------|--------|
| Valor | R$ 100,00 | R$ 10.000.000,00 |
| Prazo | 1 | 420 meses |
| Taxa mensal | 0% | 30% |
| Tarifas e seguro (somados) | 0 | 50% do valor |

## 5. Requisitos não funcionais

- **Custo zero:** roda inteiro no plano gratuito da Cloudflare (Workers, Static Assets e D1).
- **Desempenho:** cálculo de 420 parcelas em menos de 5 ms de CPU (o limite gratuito é 10 ms por requisição).
- **Acessibilidade:** WCAG 2.1 AA, navegação por teclado e números com `aria-live` nas atualizações.
- **Privacidade:** nenhum dado pessoal. Simulações compartilhadas guardam só números e expiram em 180 dias.
- **Precisão:** valores monetários em **centavos inteiros** (`bigint`-safe até 10^13); taxas em `number`. Detalhes no ADR-002.
- **Qualidade:** cobertura mínima de 95% no `@raiox/finance`; lint, typecheck e testes obrigatórios no CI.

## 6. Critérios de aceite (amostra)

1. Price, R$ 10.000,00, 2% a.m., 12 meses → PMT = R$ 945,60; total = R$ 11.347,20 (antes de IOF e tarifas).
2. SAC, R$ 12.000,00, 1% a.m., 12 meses → 1ª parcela R$ 1.120,00; última R$ 1.010,00.
3. Raio-X: liberado R$ 5.000,00, parcela R$ 500,00, 12 meses → taxa implícita ≈ 2,92% a.m.
4. Sem IOF, sem tarifas e com parcelas a cada 30 dias exatos, o CET mensal fica dentro de ±0,01 p.p. da taxa nominal.
5. `GET /s/:id` de um link expirado → página 404 amigável, com botão "Nova simulação".
