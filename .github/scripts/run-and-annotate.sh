#!/usr/bin/env bash
# Roda um comando e repassa a saída. Se ele falhar, publica como anotação de erro do run
# as linhas que apontam a causa (FAIL, Error, expected...) e as últimas linhas da saída,
# para o problema aparecer no resumo sem abrir o log completo (que exige login).
# Uso: bash .github/scripts/run-and-annotate.sh "Título" comando [args...]
set -uo pipefail

title="$1"
shift

log="$(mktemp)"
"$@" 2>&1 | tee "$log"
status="${PIPESTATUS[0]}"

if [ "$status" -ne 0 ]; then
  clean="$(mktemp)"
  # Tira cores ANSI e o retorno de carro.
  sed -e 's/\x1b\[[0-9;]*[A-Za-z]//g' -e 's/\r$//' "$log" >"$clean"

  causes="$(grep -E 'FAIL|AssertionError|Error:|expected|Expected|Received|timed out|×|✗' "$clean" | head -n 40 || true)"
  tail_lines="$(tail -n 15 "$clean")"
  body="${causes:+Causas prováveis:
$causes

}Fim da saída:
$tail_lines"

  # Codifica % e quebras de linha no formato dos comandos do Actions.
  message="$(printf '%s' "$body" | sed -e 's/%/%25/g' | sed -e ':a' -e 'N' -e '$!ba' -e 's/\n/%0A/g')"
  echo "::error title=${title}::${message}"
fi

exit "$status"
