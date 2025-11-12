# 🚗 Fúria no Asfalto - Changelog

## Versão 2.0 - Visão Top-Down (07/11/2025)

### 🎨 Mudanças Visuais Principais

#### ✅ Nova Perspectiva de Câmera
- **Visão Top-Down (Bird's Eye View)**: O jogo agora usa uma perspectiva de cima para baixo, similar a jogos clássicos de corrida arcade
- Todos os sprites foram redesenhados para a nova perspectiva
- Melhor visualização da pista e dos obstáculos

#### 🚙 Novo Sprite do Carro do Jogador
- Carro esportivo estilo supercar em visão de cima
- Dimensões: 80x120 pixels
- Cor: Ciano/Turquesa (#00ffff) com efeitos Neón
- Detalhes realistas:
  - Capô com entradas de ar
  - Para-brisa com transparência
  - Spoiler traseiro com luz Neón
  - Lanternas traseiras vermelhas
  - Faróis dianteiros amarelos
  - Detalhes laterais com linhas Neón
  - Linha central decorativa

#### 🚗 Novos Sprites de Carros Inimigos
- 4 variações de cores:
  - Rosa/Magenta (#ff0066)
  - Laranja (#ff6600)
  - Roxo (#9900ff)
  - Verde (#00ff00)
- Dimensões: 70x100 pixels
- Design top-down com detalhes realistas
- Cada carro tem gradientes e efeitos de brilho únicos

### 🎮 Melhorias de Gameplay

#### 🎯 Sistema de Colisão Aprimorado
- Hitboxes mais precisas para a visão top-down
- Margem de tolerância ajustada para melhor jogabilidade
- Colisões mais justas e previsíveis

#### 📏 Proporções Ajustadas
- Tamanho do jogador aumentado para melhor visibilidade
- Obstáculos redimensionados proporcionalmente
- Espaçamento entre elementos otimizado

### 🛠️ Arquivos Modificados

1. **assets.js**
   - Função `createPlayerCar()` completamente redesenhada
   - Função `createEnemyCar()` atualizada com novos parâmetros
   - Adicionado 4º carro inimigo (verde)
   - Sprites SVG otimizados para visão top-down

2. **script.js**
   - Dimensões do jogador: 80x120 (antes: 50x80)
   - Dimensões dos obstáculos: 70x100 (antes: 50x80)
   - Sistema de hitbox melhorado com margens precisas
   - Posicionamento ajustado para nova perspectiva

3. **car-sprite.svg** (NOVO)
   - Arquivo SVG standalone do carro principal
   - Pode ser usado para referência ou edição externa

### 🎨 Características Visuais Mantidas

- ✅ Sistema de ciclo dia/noite/tarde
- ✅ Árvores laterais animadas
- ✅ Nuvens no céu
- ✅ Moedas coletáveis com rotação
- ✅ Efeitos Neón e brilho
- ✅ Pista com linhas animadas
- ✅ HUD completo (Distância, Moedas, Velocidade)

### 🚀 Como Jogar

1. Abra o jogo no navegador
2. Use **← →** para trocar de faixa
3. Desvie dos carros inimigos
4. Colete moedas 💰
5. Observe a mudança de cenário (Dia → Tarde → Noite)

### 📊 Estatísticas

- **Velocidade inicial**: 80 km/h
- **Velocidade máxima**: 240 km/h
- **Aceleração**: +6 km/h a cada 5 segundos
- **Transição de cenário**: A cada 500 metros

---

## Versão 1.0 - Lançamento Inicial

- Jogo endless runner 2D
- Tema Neón/Retrowave
- Sistema básico de pontuação
- Obstáculos e moedas
- Ciclo dia/noite

