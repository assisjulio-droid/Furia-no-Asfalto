#!/usr/bin/env bash
# Script helper: cria o repositório remoto no GitHub usando 'gh' quando disponível e empurra o branch main.
set -euo pipefail
cd "$(dirname "$0")"

REPO_NAME="$1"
VISIBILITY="public"

if [ -z "$REPO_NAME" ]; then
  echo "Uso: ./push_to_github.sh <usuario>/<nome-do-repo>"
  exit 1
fi

if command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI encontrado. Criando repositório remoto..."
  gh repo create "$REPO_NAME" --${VISIBILITY} --source=. --remote=origin --push
  echo "Repositório criado e push realizado."
  exit 0
fi

# Se não houver gh, orientar o usuário a criar via web ou API
cat <<'MSG'
O GitHub CLI não foi encontrado.
Você pode:
1) Instalar e autenticar o 'gh' (recomendado): https://cli.github.com/

ou

2) Criar o repositório via API com um token (na sua máquina):
   export GITHUB_TOKEN=ghp_...
   curl -H "Authorization: token $GITHUB_TOKEN" -d '{"name":"<nome-do-repo>", "private":false}' https://api.github.com/user/repos

Em seguida, execute (substitua <seu-usuario> e <nome-do-repo>):
   git remote add origin https://github.com/<seu-usuario>/<nome-do-repo>.git
   git branch -M main
   git push -u origin main
MSG

exit 0
