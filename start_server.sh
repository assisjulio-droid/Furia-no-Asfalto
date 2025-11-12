#!/usr/bin/env bash
# Inicia o servidor estático em background e grava log em server.log
set -euo pipefail
cd "$(dirname "$0")"
nohup python3 -m http.server 8000 --directory "$(pwd)" > server.log 2>&1 &
echo "Servidor iniciado em http://localhost:8000 (log: server.log)"
