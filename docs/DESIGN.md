# Design system: "Carnê"

## Conceito

O assunto é o **carnê de pagamento**, o bloco de boletos destacáveis que o brasileiro conhece desde a loja de móveis. Cada parcela vira uma **lâmina picotada**. O "raio-x" acontece dentro de cada lâmina: uma barra mostra quanto daquela parcela é **juros**, **amortização** e **encargos**.

A ousadia fica em um só elemento: o **carnê** na área de resultado. O resto (formulário, navegação, rodapé) é quieto, alinhado à esquerda, sem cards nem sombras decorativas.

## Revisão contra os padrões genéricos (o que mudei e por quê)

- Primeira ideia: fundo escuro, tipo chapa de raio-x, com destaque ciano. **Descartada**, porque é o padrão "fundo quase preto com um acento vivo" e lembra uma tela médica, não dinheiro.
- Segunda ideia: um número enorme do CET com um rótulo pequeno. **Descartada**, porque é o hero padrão. O resultado principal agora é uma **frase**: "Você recebe R$ 5.000,00 e devolve R$ 6.000,00".
- O fundo não é creme: é o **papel de segurança** verde-acinzentado de cheques e boletos.
- Sem rótulos em caixa alta, sem metadados separados por ponto médio, sem fonte mono para dados (os números usam algarismos tabulares da própria família) e sem "→" nos botões.

## Cores

| Token         | Hex       | Uso                                                     |
| ------------- | --------- | ------------------------------------------------------- |
| `--paper`     | `#E9F0EC` | Fundo da página (papel de segurança)                    |
| `--slip`      | `#F8FBF9` | Lâminas do carnê e campos                               |
| `--ink`       | `#1B2A41` | Texto e traços principais (tinta de caneta azul-escura) |
| `--interest`  | `#B1123B` | Juros (vermelho de carimbo)                             |
| `--principal` | `#2E6A57` | Amortização (verde cédula)                              |
| `--charges`   | `#6A4C9C` | IOF, tarifas e seguro (violeta de autenticação)         |
| `--rule`      | `#A9BDB4` | Picote, bordas e divisórias                             |

Contraste: `--ink` sobre `--paper` dá 12,4:1. As três cores semânticas passam de 4,5:1 sobre `--slip`, e nunca são a única pista: a barra sempre tem legenda com valores.

## Tipografia

- **Atkinson Hyperlegible Next** (Google Fonts), uma única família. Foi desenhada para legibilidade, o que combina com uma ferramenta de defesa do consumidor, e seus algarismos são inconfundíveis (`font-variant-numeric: tabular-nums` em todo valor).
- Escala modular de 1,25: 14 / 16 (base) / 20 / 25 / 31 / 39 px. Pesos 400 e 700; 800 só na frase de resultado.
- Medida: no máximo 68ch para o texto corrido.

## Layout

```
Desktop (≥ 960px)                         Mobile
┌───────────────┬──────────────────────┐  ┌──────────────┐
│ Formulário    │ Frase-resultado      │  │ Formulário   │
│ (colunas 1-4) │ CET mensal | anual   │  │ Frase        │
│ sticky        │ ┌─ lâmina 1 ──────┐  │  │ Carnê        │
│               │ ├╌╌╌╌picote╌╌╌╌╌╌╌┤  │  │ (lâminas)    │
│               │ │ lâmina 2        │  │  └──────────────┘
│               │ └─────────────────┘  │
└───────────────┴──────────────────────┘
```

- Grid de 12 colunas, gutter de 24px e alinhamento à esquerda.
- Lâmina do carnê: nº da parcela | vencimento | valor; abaixo, a barra de composição. O picote entre lâminas é uma borda tracejada com dois semicírculos recortados (`mask`).
- Com mais de 24 parcelas, mostra as 6 primeiras, um "… N parcelas …" e as 3 últimas, além do botão "Ver todas as parcelas", que abre a tabela completa.

## Raios e elevação

Os raios seguem a hierarquia, não são um valor só:

- Lâmina: 2px (papel).
- Campos e botões: 6px.
- Nenhuma sombra decorativa. A única elevação é o carnê, com `0 1px 0 var(--rule)` em cada lâmina, como folhas empilhadas.

## Movimento

Só um momento: quando um resultado novo chega, as lâminas "descem do bloco" (60ms de atraso entre elas, 240ms de duração, só as 6 primeiras). Com `prefers-reduced-motion`, nada se move. Nos recálculos ao digitar, os números mudam sem animação.

## Voz

Frases curtas, em segunda pessoa, sem jargão sem explicação. "CET" sempre vem com uma dica: "Custo Efetivo Total: o custo real, com juros, IOF e tarifas".
Botões dizem a ação: "Calcular", "Comparar com outra oferta", "Copiar link".
Erros dizem o que corrigir: "O prazo vai de 1 a 420 meses."
