# Fúria no Asfalto — Endless Runner

Repositório local do jogo "Fúria no Asfalto" (HTML5 + Canvas + JS). Este repositório contém os arquivos fonte do jogo: `index.html`, `style.css`, `script.js`, `shop.js`, `audio.js`, `assets.js` e demais recursos.

## Objetivos
- Rodar o jogo localmente com um servidor estático.
- Facilitar a criação de um repositório GitHub e enviar o projeto.

## Como rodar localmente
1. Abra um terminal na pasta do projeto:
```bash
cd "/home/alunodev/Meu jogo"
```
2. Inicie um servidor HTTP simples (Python 3):
```bash
python3 -m http.server 8000 --directory "/home/alunodev/Meu jogo"
```
3. Abra no navegador: `http://localhost:8000`

## Scripts úteis
- `start_server.sh` — inicia o servidor em background (cria `server.log`).
- `init_repo.sh` — inicializa um repositório git local, cria um commit inicial e sugere como criar um remote.
- `push_to_github.sh` — script que tenta criar o repo remoto usando `gh` (GitHub CLI) e dá instruções alternativas se `gh` não estiver disponível.

## Como subir para o GitHub (opções)
Opção A — usando GitHub CLI (`gh`) (recomendado):
```bash
# instalar gh e autenticar (uma vez)
# https://cli.github.com/
gh auth login

# criar repo público e empurrar (a partir da pasta do projeto)
gh repo create <seu-usuario>/<nome-do-repo> --public --source=. --remote=origin --push
```

Opção B — sem `gh` (usando a API e um token):
1. Crie um token no GitHub com escopo `repo` e exporte:
```bash
export GITHUB_TOKEN=ghp_...   # NÃO compartilhe este token
```
2. Crie o repo via API (substitua `<nome-do-repo>` e `<seu-usuario>`):
```bash
curl -H "Authorization: token $GITHUB_TOKEN" \
  -d '{"name":"<nome-do-repo>", "private":false}' \
  https://api.github.com/user/repos
```
3. Adicione remote e empurre:
```bash
git remote add origin https://github.com/<seu-usuario>/<nome-do-repo>.git
git branch -M main
git push -u origin main
```

## Observações de segurança
- Nunca compartilhe o seu `GITHUB_TOKEN` publicamente.
- Prefira usar `gh auth login` para autenticar localmente e o script `push_to_github.sh` criado.

## Próximos passos
Se quiser, eu posso:
- Gerar automaticamente o repositório remoto (não tenho credenciais) — eu posso gerar o comando que você executa localmente (com `gh` ou com `curl`).
- Adicionar um arquivo LICENSE (me diga qual licença prefere).
- Criar uma branch `dev` e configurar um workflow de CI (ex.: GitHub Actions) para checar que o site abre.

---
Feito por automação local. Boa sorte com o push! :rocket:
