#!/bin/bash
# ═══════════════════════════════════════════
#  Game Worms · Army Commander · Dev Runner
# ═══════════════════════════════════════════
# Ejecuta el juego y muestra errores al salir.
# Uso: bash dev-run.sh
#   -d  Modo debug (LOG_LEVEL=debug)
#   -w  Watch mode (reinicia al detectar cambios)

set -e

cd "$(dirname "$0")"

DEBUG_FLAG=""
WATCH=false

while getopts "dw" opt; do
  case $opt in
    d) DEBUG_FLAG="DEBUG=true" ;;
    w) WATCH=true ;;
  esac
done

echo ""
echo "  ╔══════════════════════════════════════╗"
echo "  ║   🪱 Game Worms · Dev Runner         ║"
echo "  ╠══════════════════════════════════════╣"
echo "  ║   Ejecutando Army Commander...       ║"
echo "  ╚══════════════════════════════════════╝"
echo ""

if [ "$WATCH" = true ]; then
  echo "[watch] Reinicio automático al guardar archivos..."
  while true; do
    echo "[$(date +%H:%M:%S)] Iniciando..."
    env $DEBUG_FLAG node main.js || true
    echo ""
    echo "[$(date +%H:%M:%S)] Juego cerrado. Esperando cambios (Ctrl+C para salir)..."
    # Wait for any .js file to change
    inotifywait -r -e modify --include '\.js$' src/ main.js 2>/dev/null || sleep 2
  done
else
  env $DEBUG_FLAG node main.js
  EXIT_CODE=$?
  echo ""
  if [ $EXIT_CODE -ne 0 ]; then
    echo "  [!] El juego salió con código: $EXIT_CODE"
    echo "  [!] Revisa army-commander.log para detalles"
  else
    echo "  Sesión terminada correctamente."
  fi
  if [ -f army-commander.log ]; then
    echo ""
    echo "  === Últimas 10 líneas del log ==="
    tail -10 army-commander.log
  fi
fi
