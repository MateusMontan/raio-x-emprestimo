#!/usr/bin/env bash
# Roda um comando e repassa a saída. Se ele falhar, publica as últimas linhas como
# anotação de erro do run, para a causa aparecer no resumo sem abrir o log completo.
# Uso: bash .github/scripts/run-and-annotate.sh "Título" comando [args...]
set -uo pipefail

title="$1"
shift

log="$(mktemp)"
"$@" 2>&1 | tee "$log"
status="${PIPESTATUS[0]}"

if [ "$status" -ne 0 ]; then
  # Tira cores ANSI e codifica % e quebras de linha no formato dos comandos do Actions.
  message="$(
    tail -n 25 "$log" |
      sed -e 's/\x1b\[[0-9;]*[A-Za-z]//g' -e 's/\r$//' -e 's/%/%25/g' |
      sed -e ':a' -e 'N' -e '$!ba' -e 's/\n/%0A/g'
  )"
  echo "::error title=${title}::${message}"
fi

exit "$status"
