#!/usr/bin/env bash
# Inicializa um repositório git local e cria o commit inicial.
set -euo pipefail
cd "$(dirname "$0")"

if [ -d .git ]; then
  echo "Já existe um repositório git nesta pasta."
  exit 0
fi

git init
git add .
git commit -m "Initial commit: Fúria no Asfalto"

echo "Repositório git inicializado e commit criado."

echo "Para criar o repositório remoto no GitHub, execute uma das opções a seguir:" 
echo "1) Com GitHub CLI (recomendado):\n   gh repo create <usuario>/<nome-do-repo> --public --source=. --remote=origin --push"
echo "2) Sem gh (use um token):\n   curl -H \"Authorization: token $GITHUB_TOKEN\" -d '{\"name\":\"<nome-do-repo>\", \"private\":false}' https://api.github.com/user/repos"

echo "Depois, ajuste remote se necessário e faça push:\n   git remote add origin https://github.com/<usuario>/<nome-do-repo>.git\n   git branch -M main\n   git push -u origin main"
