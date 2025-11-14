// ========================================
// FÚRIA NO ASFALTO - Endless Runner 2D
// Estilo: Neón/Retrowave - VERSÃO MELHORADA
// ========================================

// Configuração do Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Variáveis Globais do Jogo
let gameRunning = false;
let assetsLoaded = false;
let score = 0;
let coins = 0;
let distance = 0;
// Modos e jogador 2
let mode = 'single'; // 'single' | 'two' | 'champ'
const player2 = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 300,
    width: 80,
    height: 120,
    currentLane: 1,
    speed: 10,
    alive: true,
    currentSkin: 'default'
};
let coinsP2 = 0;
let distanceP2 = 0;
const DEBUG = false; // set to true to enable debug logs and the on-screen debug overlay

// Debug helper: escreve no painel `#debugOverlay` e no console quando DEBUG=true
function debugLog(...args) {
    try {
        if (DEBUG) {
            console.log(...args);
            const panel = document.getElementById('debugOverlay');
            if (panel) {
                panel.style.display = 'block';
                const text = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
                const line = document.createElement('div');
                line.textContent = text;
                panel.appendChild(line);
                // keep last 12 lines
                while (panel.children.length > 12) panel.removeChild(panel.children[0]);
                panel.scrollTop = panel.scrollHeight;
            }
        }
    } catch (e) {
        // não quebrar o jogo por causa do debug
        try { console.log('debugLog error', e); } catch(_) {}
    }
}

// Helper de colisão (AABB)
function rectsOverlap(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
let baseSpeed = 4;
let currentSpeed = baseSpeed;
let animationId;
let frameCount = 0;

// Sistema de Recordes
let highScore = localStorage.getItem('highScore') || 0;
let highCoins = localStorage.getItem('highCoins') || 0;
let totalGamesPlayed = localStorage.getItem('totalGamesPlayed') || 0;

// Sistema de Power-ups
let activePowerUps = {
    shield: { active: false, duration: 0 },
    magnet: { active: false, duration: 0 },
    turbo: { active: false, duration: 0 }
};

// Arrays de elementos
let powerUpsList = [];
let particles = [];

// Sistema de Ciclo Dia/Noite/Tarde
const timeOfDay = {
    current: 'day', // 'day', 'afternoon', 'night'
    transitionDistance: 500, // metros para mudar de período
    colors: {
        day: {
            sky: ['#4a90e2', '#87ceeb'],
            road: '#2a2a3e',
            lines: '#ffff00'
        },
        afternoon: {
            sky: ['#ff6b35', '#f7931e'],
            road: '#2a2a3e',
            lines: '#ff9500'
        },
        night: {
            sky: ['#0a0a1f', '#1a1a3e'],
            road: '#1a1a2e',
            lines: '#00ffff'
        }
    }
};

// Configuração da Pista
const roadConfig = {
    lanes: 3,
    laneWidth: canvas.width / 3,
    lineHeight: 40,
    lineGap: 20,
    lineOffset: 0,
    grassWidth: 50
};

// Objeto do Jogador (Carro) - Visão Top-Down
const player = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 160,
    width: 80,
    height: 120,
    currentLane: 1, // 0 = esquerda, 1 = centro, 2 = direita
    speed: 10,
    currentSkin: 'default'
};

// Arrays de Elementos do Jogo
let obstacles = [];
let coinsList = [];
let trees = [];
let clouds = [];

// Configuração de Obstáculos (dinâmica)
const obstacleConfig = {
    width: 70,
    height: 100,
    baseSpawnRate: 90, // frames entre spawns (inicial)
    spawnRate: 90,
    frameCounter: 0,
    minGap: 150
};

// Configuração de Moedas
const coinConfig = {
    width: 30,
    height: 30,
    spawnRate: 60,
    frameCounter: 0,
    value: 1
};

// Configuração de Árvores
const treeConfig = {
    width: 40,
    height: 60,
    spacing: 100
};

// Configuração de Power-ups (dinâmica com upgrades)
const powerUpConfig = {
    width: 40,
    height: 40,
    baseSpawnRate: 400, // frames entre spawns (mais raro)
    spawnRate: 400,
    frameCounter: 0,
    baseShieldDuration: 300, // 5 segundos a 60fps
    shieldDuration: 300,
    baseMagnetDuration: 360, // 6 segundos
    magnetDuration: 360,
    baseMagnetRadius: 150,
    magnetRadius: 150,
    turboDuration: 180  // 3 segundos
};

// ========================================
// INICIALIZAÇÃO DO JOGO
// ========================================
async function initGame(selectedMode = 'single') {
    // Carregar assets se ainda não foram carregados
    if (!assetsLoaded) {
        await Assets.loadAll();
        AudioSystem.init();
        assetsLoaded = true;
    }

    // modo selecionado (single | two | champ)
    mode = selectedMode || 'single';

    score = 0;
    coins = 0;
    distance = 0;
    currentSpeed = baseSpeed;
    frameCount = 0;
    obstacles = [];
    coinsList = [];
    trees = [];
    clouds = [];
    powerUpsList = [];
    particles = [];
    obstacleConfig.frameCounter = 0;
    coinConfig.frameCounter = 0;
    powerUpConfig.frameCounter = 0;
    roadConfig.lineOffset = 0;
    player.currentLane = 1;
    player.x = canvas.width / 2 - player.width / 2;
    // reset player2
    coinsP2 = 0;
    distanceP2 = 0;
    player2.currentLane = 1;
    player2.x = canvas.width / 2 - player2.width / 2;
    player2.y = canvas.height - 300;
    player2.alive = true;
    timeOfDay.current = 'day';

    // Aplicar upgrades
    applyUpgrades();

    // Aplicar skin atual
    updatePlayerSkin();

    // Resetar power-ups
    activePowerUps.shield.active = false;
    activePowerUps.magnet.active = false;
    activePowerUps.turbo.active = false;

    // Inicializar árvores nas laterais
    initTrees();

    // Inicializar nuvens
    initClouds();

    // Esconder tela de Game Over e loja
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('shopMenu').classList.add('hidden');

    // esconder menu de modo
    const modeMenu = document.getElementById('modeMenu');
    if (modeMenu) modeMenu.classList.add('hidden');

    // Mostrar HUD do player2 quando em modo dois jogadores
    const p2hud = document.querySelector('.p2-display');
    if (p2hud) {
        if (mode === 'two') p2hud.classList.remove('hidden');
        else p2hud.classList.add('hidden');
    }

    // Se for modo dois jogadores, tentar entrar em fullscreen para melhor experiência
    if (mode === 'two') {
        try {
            const el = document.documentElement;
            if (el.requestFullscreen) {
                el.requestFullscreen();
            } else if (el.webkitRequestFullscreen) { /* Safari */
                el.webkitRequestFullscreen();
            } else if (el.msRequestFullscreen) { /* IE11 */
                el.msRequestFullscreen();
            }
        } catch (err) {
            // fullscreen pode ser bloqueado pelo navegador; não é crítico
            if (DEBUG) console.warn('Falha ao solicitar fullscreen:', err);
        }
    }

    // Atualizar displays
    updateScoreDisplay();
    updateCoinsDisplay();
    updateSpeedDisplay();
    updateTotalCoinsDisplay();

    // Iniciar música
    AudioSystem.playBackgroundMusic();

    gameRunning = true;
    updateGame();
}

// ========================================
// APLICAR UPGRADES AO JOGO
// ========================================
function applyUpgrades() {
    // Velocidade máxima aumentada
    const maxSpeedBonus = ShopSystem.getUpgradeEffect('maxSpeed');

    // Aceleração aumentada
    const accelerationBonus = ShopSystem.getUpgradeEffect('acceleration');

    // Raio do ímã aumentado
    powerUpConfig.magnetRadius = powerUpConfig.baseMagnetRadius + ShopSystem.getUpgradeEffect('magnetRadius');

    // Duração do escudo aumentada
    powerUpConfig.shieldDuration = powerUpConfig.baseShieldDuration + ShopSystem.getUpgradeEffect('shieldDuration');

    // Valor das moedas aumentado
    coinConfig.value = 1 + ShopSystem.getUpgradeEffect('coinValue');

    // Armazenar bônus para uso posterior
    player.maxSpeedBonus = maxSpeedBonus;
    player.accelerationBonus = accelerationBonus;
}

// ========================================
// INICIALIZAR ÁRVORES
// ========================================
function initTrees() {
    for (let i = 0; i < 15; i++) {
        // Árvores do lado esquerdo
        trees.push({
            x: -35,
            y: i * treeConfig.spacing - 100,
            width: treeConfig.width,
            height: treeConfig.height,
            side: 'left'
        });

        // Árvores do lado direito
        trees.push({
            x: canvas.width + 5,
            y: i * treeConfig.spacing - 100,
            width: treeConfig.width,
            height: treeConfig.height,
            side: 'right'
        });
    }
}

// ========================================
// INICIALIZAR NUVENS
// ========================================
function initClouds() {
    for (let i = 0; i < 5; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * 200,
            width: 80,
            height: 40,
            speed: 0.3 + Math.random() * 0.5
        });
    }
}

// ========================================
// ATUALIZAR CICLO DIA/NOITE
// ========================================
function updateTimeOfDay() {
    const distanceInMeters = Math.floor(distance / 10);

    if (distanceInMeters < timeOfDay.transitionDistance) {
        timeOfDay.current = 'day';
    } else if (distanceInMeters < timeOfDay.transitionDistance * 2) {
        timeOfDay.current = 'afternoon';
    } else {
        timeOfDay.current = 'night';
    }
}

// ========================================
// DESENHAR CÉU E FUNDO
// ========================================
function drawSky() {
    const colors = timeOfDay.colors[timeOfDay.current];

    // Gradiente do céu
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height / 2);
    gradient.addColorStop(0, colors.sky[0]);
    gradient.addColorStop(1, colors.sky[1]);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
}

// ========================================
// DESENHAR E ATUALIZAR NUVENS
// ========================================
function drawClouds() {
    if (timeOfDay.current === 'night') return; // Sem nuvens à noite

    for (let cloud of clouds) {
        ctx.drawImage(Assets.images.cloud, cloud.x, cloud.y, cloud.width, cloud.height);

        // Mover nuvem
        cloud.x -= cloud.speed;

        // Reposicionar quando sair da tela
        if (cloud.x + cloud.width < 0) {
            cloud.x = canvas.width;
            cloud.y = Math.random() * 200;
        }
    }
}

// ========================================
// DESENHAR JOGADOR
// ========================================
function drawPlayer() {
    if (assetsLoaded && Assets.images.playerCar) {
        // Desenhar escudo se ativo
        if (activePowerUps.shield.active) {
            ctx.save();
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00ffff';

            // Efeito pulsante
            const pulseSize = 5 + Math.sin(frameCount * 0.2) * 3;
            ctx.globalAlpha = 0.6 + Math.sin(frameCount * 0.2) * 0.2;

            ctx.beginPath();
            ctx.arc(
                player.x + player.width / 2,
                player.y + player.height / 2,
                player.width / 2 + pulseSize,
                0,
                Math.PI * 2
            );
            ctx.stroke();
            ctx.restore();
        }

        // Efeito de brilho
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ffff';

        // Efeito turbo - rastro
        if (activePowerUps.turbo.active) {
            ctx.globalAlpha = 0.3;
            ctx.drawImage(Assets.images.playerCar, player.x, player.y + 10, player.width, player.height);
            ctx.globalAlpha = 0.5;
            ctx.drawImage(Assets.images.playerCar, player.x, player.y + 5, player.width, player.height);
            ctx.globalAlpha = 1;
        }

        ctx.drawImage(Assets.images.playerCar, player.x, player.y, player.width, player.height);
        ctx.shadowBlur = 0;
    }

    // Desenhar segundo jogador se no modo de 2 jogadores
    if (mode === 'two' && player2.alive) {
        if (assetsLoaded && Assets.images.playerCar) {
            // desenhar uma versão deslocada para o P2 (pode usar mesma imagem por enquanto)
            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff00ff';
            ctx.drawImage(Assets.images.playerCar, player2.x, player2.y, player2.width, player2.height);
            ctx.restore();
        }
    }
}

// ========================================
// DESENHAR PISTA (Estrada Infinita)
// ========================================
function drawRoad() {
    const colors = timeOfDay.colors[timeOfDay.current];

    // Fundo da estrada
    ctx.fillStyle = colors.road;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Acostamento/Grama (laterais)
    const grassColor = timeOfDay.current === 'night' ? '#1a3d1a' : '#2d5016';
    ctx.fillStyle = grassColor;
    ctx.fillRect(0, 0, 5, canvas.height); // Esquerda
    ctx.fillRect(canvas.width - 5, 0, 5, canvas.height); // Direita

    // Linhas laterais da pista (bordas)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    // Borda esquerda
    ctx.beginPath();
    ctx.moveTo(5, 0);
    ctx.lineTo(5, canvas.height);
    ctx.stroke();

    // Borda direita
    ctx.beginPath();
    ctx.moveTo(canvas.width - 5, 0);
    ctx.lineTo(canvas.width - 5, canvas.height);
    ctx.stroke();

    // Linhas divisórias das faixas (efeito de movimento)
    ctx.strokeStyle = colors.lines;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 8;
    ctx.shadowColor = colors.lines;

    const totalLineHeight = roadConfig.lineHeight + roadConfig.lineGap;

    // Linha divisória 1 (entre faixa 0 e 1)
    for (let y = roadConfig.lineOffset; y < canvas.height; y += totalLineHeight) {
        ctx.beginPath();
        ctx.moveTo(roadConfig.laneWidth, y);
        ctx.lineTo(roadConfig.laneWidth, y + roadConfig.lineHeight);
        ctx.stroke();
    }

    // Linha divisória 2 (entre faixa 1 e 2)
    for (let y = roadConfig.lineOffset; y < canvas.height; y += totalLineHeight) {
        ctx.beginPath();
        ctx.moveTo(roadConfig.laneWidth * 2, y);
        ctx.lineTo(roadConfig.laneWidth * 2, y + roadConfig.lineHeight);
        ctx.stroke();
    }

    ctx.shadowBlur = 0;

    // Atualizar offset para criar movimento
    roadConfig.lineOffset += currentSpeed;
    if (roadConfig.lineOffset >= totalLineHeight) {
        roadConfig.lineOffset = 0;
    }
}

// ========================================
// DESENHAR E ATUALIZAR ÁRVORES
// ========================================
function drawTrees() {
    const treeImage = timeOfDay.current === 'night' ? Assets.images.treeNight : Assets.images.treeDay;

    for (let tree of trees) {
        if (assetsLoaded && treeImage) {
            ctx.drawImage(treeImage, tree.x, tree.y, tree.width, tree.height);
        }

        // Mover árvore para baixo
        tree.y += currentSpeed;

        // Reposicionar quando sair da tela
        if (tree.y > canvas.height) {
            tree.y = -tree.height;
        }
    }
}

// ========================================
// SPAWNAR OBSTÁCULOS
// ========================================
function spawnObstacles() {
    obstacleConfig.frameCounter++;

    if (obstacleConfig.frameCounter >= obstacleConfig.spawnRate) {
        obstacleConfig.frameCounter = 0;

        // Escolher faixa aleatória
        const randomLane = Math.floor(Math.random() * roadConfig.lanes);
        let obstacleX = randomLane * roadConfig.laneWidth + (roadConfig.laneWidth / 2);

        // Decidir tipo de obstáculo (70% carros, 20% caminhões, 10% motos)
        const rand = Math.random();
        let obstacleType, obstacleImage, obstacleWidth, obstacleHeight, obstacleSpeed;

        if (rand < 0.7) {
            // Carro normal
            const carImages = [
                Assets.images.enemyCar1,
                Assets.images.enemyCar2,
                Assets.images.enemyCar3,
                Assets.images.enemyCar4
            ];
            obstacleType = 'car';
            obstacleImage = carImages[Math.floor(Math.random() * carImages.length)];
            obstacleWidth = 70;
            obstacleHeight = 100;
            obstacleSpeed = 0;
        } else if (rand < 0.9) {
            // Caminhão (mais lento, maior)
            obstacleType = 'truck';
            obstacleImage = Assets.images.truck;
            obstacleWidth = 80;
            obstacleHeight = 140;
            obstacleSpeed = -1; // Mais lento que o jogador
        } else {
            // Moto (mais rápida, menor)
            obstacleType = 'motorcycle';
            obstacleImage = Assets.images.motorcycle;
            obstacleWidth = 40;
            obstacleHeight = 70;
            obstacleSpeed = 2; // Mais rápida
        }

        obstacleX -= obstacleWidth / 2;

        // Verificar se há espaço suficiente
        let canSpawn = true;
        for (let obs of obstacles) {
            if (obs.y < obstacleConfig.minGap && Math.abs(obs.x - obstacleX) < obstacleWidth + 20) {
                canSpawn = false;
                break;
            }
        }

        if (canSpawn) {
            obstacles.push({
                x: obstacleX,
                y: -obstacleHeight,
                width: obstacleWidth,
                height: obstacleHeight,
                image: obstacleImage,
                type: obstacleType,
                speedModifier: obstacleSpeed
            });
        }
    }
}

// ========================================
// ATUALIZAR E DESENHAR OBSTÁCULOS
// ========================================
function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];

        // Mover obstáculo para baixo com velocidade modificada
        obstacle.y += currentSpeed + obstacle.speedModifier;

        // Desenhar obstáculo
        if (assetsLoaded && obstacle.image) {
            ctx.shadowBlur = 10;

            // Cor da sombra baseada no tipo
            if (obstacle.type === 'truck') {
                ctx.shadowColor = '#666666';
            } else if (obstacle.type === 'motorcycle') {
                ctx.shadowColor = '#ff0000';
            } else {
                ctx.shadowColor = '#ff0066';
            }

            ctx.drawImage(obstacle.image, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            ctx.shadowBlur = 0;
        }

        // Remover obstáculos que saíram da tela
        if (obstacle.y > canvas.height) {
            obstacles.splice(i, 1);
        }
    }
}

// ========================================
// SPAWNAR MOEDAS
// ========================================
function spawnCoins() {
    coinConfig.frameCounter++;

    if (coinConfig.frameCounter >= coinConfig.spawnRate) {
        coinConfig.frameCounter = 0;

        // Escolher faixa aleatória
        const randomLane = Math.floor(Math.random() * roadConfig.lanes);
        const coinX = randomLane * roadConfig.laneWidth + (roadConfig.laneWidth / 2) - (coinConfig.width / 2);

        // Verificar se não está muito perto de um obstáculo
        let canSpawn = true;
        for (let obs of obstacles) {
            if (Math.abs(obs.y - (-coinConfig.height)) < 100 && Math.abs(obs.x - coinX) < 60) {
                canSpawn = false;
                break;
            }
        }

        if (canSpawn) {
            coinsList.push({
                x: coinX,
                y: -coinConfig.height,
                width: coinConfig.width,
                height: coinConfig.height,
                collected: false,
                rotation: 0
            });
        }
    }
}

// ========================================
// ATUALIZAR E DESENHAR MOEDAS
// ========================================
function updateCoins() {
    for (let i = coinsList.length - 1; i >= 0; i--) {
        const coin = coinsList[i];

        if (coin.collected) continue;

        // Mover moeda para baixo
        coin.y += currentSpeed;

        // Rotação para efeito visual
        coin.rotation += 0.1;

        // Desenhar moeda
        if (assetsLoaded && Assets.images.coin) {
            ctx.save();
            ctx.translate(coin.x + coin.width / 2, coin.y + coin.height / 2);
            ctx.rotate(coin.rotation);
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ffff00';
            ctx.drawImage(Assets.images.coin, -coin.width / 2, -coin.height / 2, coin.width, coin.height);
            ctx.shadowBlur = 0;
            ctx.restore();
        }

        // Remover moedas que saíram da tela
        if (coin.y > canvas.height) {
            coinsList.splice(i, 1);
        }
    }
}

// ========================================
// SISTEMA DE PARTÍCULAS
// ========================================
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Atualizar posição
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        // Desenhar partícula
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.globalAlpha = p.life / 30;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Remover partículas mortas
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// ========================================
// CRIAR EXPLOSÃO
// ========================================
function createExplosion(x, y, color = '#ff6600') {
    AudioSystem.play('crash');

    // Criar muitas partículas
    for (let i = 0; i < 30; i++) {
        const angle = (Math.PI * 2 * i) / 30;
        const speed = 2 + Math.random() * 4;

        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 40 + Math.random() * 20,
            color: i % 2 === 0 ? color : '#ffff00',
            size: 2 + Math.random() * 3
        });
    }
}

// ========================================
// DETECTAR COLISÕES COM OBSTÁCULOS
// ========================================
function checkCollisions() {
    // Trabalhar com um array de jogadores (suporta 1 ou 2)
    const players = [player];
    if (mode === 'two') players.push(player2);

    // Colisão com obstáculos (para cada jogador)
    for (let p of players) {
        if (!p.alive) continue;

        const pHitbox = {
            x: p.x + 15,
            y: p.y + 20,
            width: p.width - 30,
            height: p.height - 40
        };

        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obstacle = obstacles[i];
            const obstacleHitbox = {
                x: obstacle.x + 12,
                y: obstacle.y + 15,
                width: obstacle.width - 24,
                height: obstacle.height - 30
            };

                if (rectsOverlap(pHitbox, obstacleHitbox)) {

                // Se escudo global ativo, destrói obstáculo
                if (activePowerUps.shield.active) {
                    createExplosion(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, '#00ffff');
                    obstacles.splice(i, 1);
                    activePowerUps.shield.active = false;
                    activePowerUps.shield.duration = 0;
                    continue;
                }

                // Caso contrário, o jogador perde uma vida
                createExplosion(p.x + p.width / 2, p.y + p.height / 2, '#ff0000');
                p.alive = false;

                // Se modo single, fim de jogo imediato
                if (mode !== 'two') {
                    gameOver();
                    return;
                }

                // Em modo two, verificar se ambos morreram
                if (mode === 'two') {
                    if (!player.alive && !player2.alive) {
                        gameOver();
                        return;
                    }
                }
            }
        }
    }

    // Colisão com moedas e power-ups - verificar por jogador usando o mesmo hitbox
    for (let p of players) {
        if (!p.alive) continue;

        const pHitbox = {
            x: p.x + 15,
            y: p.y + 20,
            width: p.width - 30,
            height: p.height - 40
        };

        // Moedas (iterar de trás para frente para permitir splice)
        for (let i = coinsList.length - 1; i >= 0; i--) {
            const coin = coinsList[i];
            if (!coin) continue;
            const coinHit = { x: coin.x, y: coin.y, width: coin.width, height: coin.height };
            if (rectsOverlap(pHitbox, coinHit)) {
                // Remover a moeda da lista
                coinsList.splice(i, 1);

                if (p === player) {
                    coins += coinConfig.value;
                } else if (p === player2) {
                    coinsP2 += coinConfig.value;
                }
                if (DEBUG) debugLog('Moeda coletada por', p === player ? 'Player1' : 'Player2', 'total now', p === player ? coins : coinsP2);
                updateCoinsDisplay();
                AudioSystem.play('coin');
                playCollectEffect(coin.x, coin.y);
            }
        }

        // Power-ups (iterar de trás para frente)
        for (let i = powerUpsList.length - 1; i >= 0; i--) {
            const powerUp = powerUpsList[i];
            if (!powerUp) continue;
            const puHit = { x: powerUp.x, y: powerUp.y, width: powerUp.width, height: powerUp.height };
            if (rectsOverlap(pHitbox, puHit)) {
                // Remover o power-up da lista
                powerUpsList.splice(i, 1);
                if (DEBUG) debugLog('Power-up', powerUp.type, 'coletado por', p === player ? 'Player1' : 'Player2');
                activatePowerUp(powerUp.type);

                for (let j = 0; j < 15; j++) {
                    particles.push({
                        x: powerUp.x + powerUp.width / 2,
                        y: powerUp.y + powerUp.height / 2,
                        vx: (Math.random() - 0.5) * 6,
                        vy: (Math.random() - 0.5) * 6,
                        life: 40,
                        color: powerUp.type === 'shield' ? '#00ffff' : powerUp.type === 'magnet' ? '#ff00ff' : '#ff6600',
                        size: 4
                    });
                }
            }
        }
    }
}

// ========================================
// EFEITO VISUAL DE COLETA DE MOEDA
// ========================================
function playCollectEffect(x, y) {
    // Criar partículas douradas
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 30,
            color: '#ffff00',
            size: 3
        });
    }
}

// ========================================
// SPAWNAR POWER-UPS
// ========================================
function spawnPowerUps() {
    powerUpConfig.frameCounter++;

    if (powerUpConfig.frameCounter >= powerUpConfig.spawnRate) {
        powerUpConfig.frameCounter = 0;

        // Escolher tipo aleatório de power-up
        const types = ['shield', 'magnet', 'turbo'];
        const randomType = types[Math.floor(Math.random() * types.length)];

        // Escolher faixa aleatória
        const randomLane = Math.floor(Math.random() * roadConfig.lanes);
        const powerUpX = randomLane * roadConfig.laneWidth + (roadConfig.laneWidth / 2) - (powerUpConfig.width / 2);

        let image;
        switch(randomType) {
            case 'shield':
                image = Assets.images.shieldPowerUp;
                break;
            case 'magnet':
                image = Assets.images.magnetPowerUp;
                break;
            case 'turbo':
                image = Assets.images.turboPowerUp;
                break;
        }

        powerUpsList.push({
            x: powerUpX,
            y: -powerUpConfig.height,
            width: powerUpConfig.width,
            height: powerUpConfig.height,
            type: randomType,
            image: image,
            collected: false,
            rotation: 0
        });
    }
}

// ========================================
// ATUALIZAR E DESENHAR POWER-UPS
// ========================================
function updatePowerUps() {
    for (let i = powerUpsList.length - 1; i >= 0; i--) {
        const powerUp = powerUpsList[i];

        if (powerUp.collected) continue;

        // Mover power-up para baixo
        powerUp.y += currentSpeed;

        // Rotação para efeito visual
        powerUp.rotation += 0.05;

        // Desenhar power-up
        if (assetsLoaded && powerUp.image) {
            ctx.save();
            ctx.translate(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
            ctx.rotate(powerUp.rotation);

            // Efeito pulsante
            const scale = 1 + Math.sin(frameCount * 0.1) * 0.1;
            ctx.scale(scale, scale);

            ctx.drawImage(powerUp.image, -powerUp.width / 2, -powerUp.height / 2, powerUp.width, powerUp.height);
            ctx.restore();
        }

        // Remover power-ups que saíram da tela
        if (powerUp.y > canvas.height) {
            powerUpsList.splice(i, 1);
        }
    }
}

// ========================================
// ATIVAR POWER-UP
// ========================================
function activatePowerUp(type) {
    switch(type) {
        case 'shield':
            activePowerUps.shield.active = true;
            activePowerUps.shield.duration = powerUpConfig.shieldDuration;
            AudioSystem.play('shield');
            break;
        case 'magnet':
            activePowerUps.magnet.active = true;
            activePowerUps.magnet.duration = powerUpConfig.magnetDuration;
            AudioSystem.play('powerup');
            break;
        case 'turbo':
            activePowerUps.turbo.active = true;
            activePowerUps.turbo.duration = powerUpConfig.turboDuration;
            AudioSystem.play('turbo');
            break;
    }
}

// ========================================
// ATUALIZAR POWER-UPS ATIVOS
// ========================================
function updateActivePowerUps() {
    // Atualizar duração dos power-ups
    for (let key in activePowerUps) {
        if (activePowerUps[key].active) {
            activePowerUps[key].duration--;
            if (activePowerUps[key].duration <= 0) {
                activePowerUps[key].active = false;
            }
        }
    }

    // Efeito do ímã - atrair moedas (com raio do upgrade)
    if (activePowerUps.magnet.active) {
        for (let coin of coinsList) {
            if (!coin.collected) {
                const dx = player.x + player.width / 2 - (coin.x + coin.width / 2);
                const dy = player.y + player.height / 2 - (coin.y + coin.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < powerUpConfig.magnetRadius) {
                    coin.x += dx * 0.1;
                    coin.y += dy * 0.1;
                }
            }
        }
    }
}

// ========================================
// ATUALIZAR PONTUAÇÃO E VELOCIDADE
// ========================================
function updateScore() {
    score++;
    distance++;
    if (mode === 'two') distanceP2++;
    frameCount++;

    // Sistema de aceleração progressiva melhorado
    // A cada 300 frames (aproximadamente 5 segundos), aumenta a velocidade
    if (frameCount % 300 === 0) {
        const baseAcceleration = 0.3;
        const accelerationBonus = player.accelerationBonus || 0;
        currentSpeed += baseAcceleration + accelerationBonus;

        // Limitar velocidade máxima (com bônus de upgrade)
        const maxSpeed = 12 + (player.maxSpeedBonus || 0);
        if (!activePowerUps.turbo.active && currentSpeed > maxSpeed) {
            currentSpeed = maxSpeed;
        }

        // Aumentar dificuldade progressivamente
        increaseDifficulty();
    }

    // Efeito turbo - velocidade extra
    let effectiveSpeed = currentSpeed;
    if (activePowerUps.turbo.active) {
        effectiveSpeed = currentSpeed * 1.5;
    }

    // Atualizar displays
    if (frameCount % 5 === 0) { // Atualizar a cada 5 frames para performance
        updateScoreDisplay();
        updateSpeedDisplay();
    }

    // Verificar alvo do campeonato (modo champ)
    if (mode === 'champ' && Championship.currentTarget) {
        const currentMeters = Math.floor(distance / 10);
        if (currentMeters >= Championship.currentTarget) {
            // encerrar corrida e registrar vencedor
            gameRunning = false;
            cancelAnimationFrame(animationId);
            endChampRace('Player 1', currentMeters);
        }
    }
}

// ========================================
// AUMENTAR DIFICULDADE PROGRESSIVAMENTE
// ========================================
function increaseDifficulty() {
    // A cada 500 metros, aumentar dificuldade
    const difficultyLevel = Math.floor(distance / 500);

    // Reduzir tempo entre obstáculos (mais obstáculos)
    obstacleConfig.spawnRate = Math.max(40, obstacleConfig.baseSpawnRate - (difficultyLevel * 5));

    // Reduzir tempo entre power-ups (mais raro)
    powerUpConfig.spawnRate = Math.min(600, powerUpConfig.baseSpawnRate + (difficultyLevel * 20));

    // A cada 1000 metros, aumentar ainda mais
    if (distance % 1000 === 0 && distance > 0) {
        // Aumentar velocidade base
        baseSpeed += 0.5;

        // Feedback visual
        for (let i = 0; i < 20; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 60,
                color: '#ffff00',
                size: 4
            });
        }
    }
}

function updateScoreDisplay() {
    document.getElementById('scoreValue').textContent = Math.floor(distance / 10);
    if (mode === 'two') {
        const el = document.getElementById('scoreValueP2');
        if (el) el.textContent = Math.floor(distanceP2 / 10);
    }
}

function updateCoinsDisplay() {
    document.getElementById('coinsValue').textContent = coins;
    if (mode === 'two') {
        const el = document.getElementById('coinsValueP2');
        if (el) el.textContent = coinsP2;
    }
}

function updateSpeedDisplay() {
    // Converter velocidade do jogo para km/h (valor fictício para gameplay)
    const speedKmh = Math.floor(currentSpeed * 20);
    document.getElementById('speedValue').textContent = speedKmh;
}

// ========================================
// GAME LOOP PRINCIPAL
// ========================================
function updateGame() {
    if (!gameRunning) return;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Atualizar ciclo dia/noite
    updateTimeOfDay();

    // Desenhar elementos na ordem correta (do fundo para frente)
    drawSky();
    drawClouds();
    drawRoad();
    drawTrees();

    // Spawnar e atualizar elementos do jogo
    spawnObstacles();
    updateObstacles();

    spawnCoins();
    updateCoins();

    spawnPowerUps();
    updatePowerUps();

    // Atualizar power-ups ativos
    updateActivePowerUps();

    // Partículas
    updateParticles();

    drawPlayer();

    // Verificar colisões
    checkCollisions();

    // Atualizar pontuação e velocidade
    updateScore();

    // Continuar loop
    animationId = requestAnimationFrame(updateGame);
}

// ========================================
// GAME OVER
// ========================================
function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);

    // Parar música
    AudioSystem.stopBackgroundMusic();

    // Adicionar moedas coletadas ao total
    ShopSystem.addCoins(coins + (mode === 'two' ? coinsP2 : 0));
    updateTotalCoinsDisplay();

    // Atualizar recordes
    const finalDistance = mode === 'two' ? Math.max(Math.floor(distance / 10), Math.floor(distanceP2 / 10)) : Math.floor(distance / 10);
    totalGamesPlayed++;

    if (finalDistance > highScore) {
        highScore = finalDistance;
        localStorage.setItem('highScore', highScore);
    }

    const totalCoinsThisRun = coins + (mode === 'two' ? coinsP2 : 0);
    if (totalCoinsThisRun > highCoins) {
        highCoins = totalCoinsThisRun;
        localStorage.setItem('highCoins', highCoins);
    }

    localStorage.setItem('totalGamesPlayed', totalGamesPlayed);

    // Mostrar tela de Game Over com estatísticas
    document.getElementById('finalScore').textContent = finalDistance;
    document.getElementById('finalCoins').textContent = totalCoinsThisRun;

    // Adicionar recordes na tela de game over
    const gameOverScreen = document.getElementById('gameOverScreen');
    let recordsDiv = document.getElementById('records');

    if (!recordsDiv) {
        recordsDiv = document.createElement('div');
        recordsDiv.id = 'records';
        recordsDiv.className = 'records';
            recordsDiv.innerHTML = `
            <p class="record-title">🏆 RECORDES 🏆</p>
            <p>Melhor Distância: <span class="record-value">${highScore} m</span></p>
            <p>Mais Moedas: <span class="record-value">${highCoins} 💰</span></p>
            <p>Partidas Jogadas: <span class="record-value">${totalGamesPlayed}</span></p>
            <p style="margin-top: 15px; color: #00ff00; text-shadow: 0 0 10px #00ff00;">
                +${totalCoinsThisRun} moedas adicionadas ao saldo!
            </p>
        `;
        gameOverScreen.insertBefore(recordsDiv, document.getElementById('restartBtn'));
    } else {
        recordsDiv.innerHTML = `
            <p class="record-title">🏆 RECORDES 🏆</p>
            <p>Melhor Distância: <span class="record-value">${highScore} m</span></p>
            <p>Mais Moedas: <span class="record-value">${highCoins} 💰</span></p>
            <p>Partidas Jogadas: <span class="record-value">${totalGamesPlayed}</span></p>
            <p style="margin-top: 15px; color: #00ff00; text-shadow: 0 0 10px #00ff00;">
                +${coins} moedas adicionadas ao saldo!
            </p>
        `;
    }

    document.getElementById('gameOverScreen').classList.remove('hidden');
}

// ========================================
// CONTROLES DO JOGADOR
// ========================================
function movePlayer(direction) {
    if (!gameRunning) return;
    
    if (direction === 'left' && player.currentLane > 0) {
        player.currentLane--;
    } else if (direction === 'right' && player.currentLane < roadConfig.lanes - 1) {
        player.currentLane++;
    }
    
    // Calcular nova posição X baseada na faixa
    const targetX = player.currentLane * roadConfig.laneWidth + (roadConfig.laneWidth / 2) - (player.width / 2);
    player.x = targetX;
}

// Event Listeners para Teclado
window.addEventListener('keydown', (e) => {
    if (DEBUG) debugLog('keydown:', e.key, 'gameRunning=', gameRunning, 'mode=', mode);

    // Player 1 (setas)
    if (e.key === 'ArrowLeft') {
        movePlayer('left');
    } else if (e.key === 'ArrowRight') {
        movePlayer('right');
    }

    // Player 2 (A / D) - apenas em modo two
    if (mode === 'two') {
        if (e.key === 'a' || e.key === 'A') {
            // mover player2 para a esquerda
            if (player2.currentLane > 0) player2.currentLane--;
            player2.x = player2.currentLane * roadConfig.laneWidth + (roadConfig.laneWidth / 2) - (player2.width / 2);
        } else if (e.key === 'd' || e.key === 'D') {
            if (player2.currentLane < roadConfig.lanes - 1) player2.currentLane++;
            player2.x = player2.currentLane * roadConfig.laneWidth + (roadConfig.laneWidth / 2) - (player2.width / 2);
        }
    }
});

// Event Listener para Botão de Restart
document.getElementById('restartBtn').addEventListener('click', () => {
    initGame();
});

// Event Listeners para Controles de Áudio
document.getElementById('toggleMusic').addEventListener('click', function() {
    const enabled = AudioSystem.toggleMusic();
    this.classList.toggle('disabled', !enabled);
});

document.getElementById('toggleSFX').addEventListener('click', function() {
    const enabled = AudioSystem.toggleSFX();
    this.classList.toggle('disabled', !enabled);
});

// ========================================
// SISTEMA DE LOJA - UI
// ========================================

// Atualizar display de moedas totais
function updateTotalCoinsDisplay() {
    document.getElementById('totalCoinsValue').textContent = ShopSystem.totalCoins;
    document.getElementById('shopCoinsValue').textContent = ShopSystem.totalCoins;
}

// Renderizar lista de upgrades
function renderUpgrades() {
    const container = document.getElementById('upgradesList');
    container.innerHTML = '';

    for (let key in ShopSystem.upgrades) {
        const upgrade = ShopSystem.upgrades[key];
        const cost = ShopSystem.getUpgradeCost(key);
        const isMaxLevel = upgrade.level >= upgrade.maxLevel;

        const item = document.createElement('div');
        item.className = 'shop-item';

        let buttonHTML = '';
        if (isMaxLevel) {
            buttonHTML = '<button class="shop-item-btn max-level" disabled>✨ NÍVEL MÁXIMO</button>';
        } else {
            const canAfford = ShopSystem.totalCoins >= cost;
            buttonHTML = `<button class="shop-item-btn" onclick="buyUpgrade('${key}')" ${!canAfford ? 'disabled' : ''}>
                ${canAfford ? '💰 COMPRAR' : '🔒 INSUFICIENTE'} - ${cost} moedas
            </button>`;
        }

        item.innerHTML = `
            <div class="shop-item-header">
                <div class="shop-item-icon">${upgrade.icon}</div>
                <div class="shop-item-info">
                    <h3>${upgrade.name}</h3>
                    <p>${upgrade.description}</p>
                </div>
            </div>
            <div class="shop-item-level">
                Nível: ${upgrade.level}/${upgrade.maxLevel}
                ${upgrade.level > 0 ? `<br>Bônus: +${ShopSystem.getUpgradeEffect(key)}` : ''}
            </div>
            ${buttonHTML}
        `;

        container.appendChild(item);
    }
}

// Renderizar lista de skins
function renderSkins() {
    const container = document.getElementById('skinsList');
    container.innerHTML = '';

    for (let key in ShopSystem.skins) {
        const skin = ShopSystem.skins[key];
        const isEquipped = ShopSystem.currentSkin === key;

        const item = document.createElement('div');
        item.className = 'shop-item';
        if (!skin.unlocked) item.classList.add('locked');
        if (isEquipped) item.classList.add('equipped');

        let buttonHTML = '';
        if (isEquipped) {
            buttonHTML = '<button class="shop-item-btn equipped-btn" disabled>✓ EQUIPADO</button>';
        } else if (skin.unlocked) {
            buttonHTML = `<button class="shop-item-btn" onclick="equipSkin('${key}')">EQUIPAR</button>`;
        } else {
            const canAfford = ShopSystem.totalCoins >= skin.cost;
            buttonHTML = `<button class="shop-item-btn" onclick="buySkin('${key}')" ${!canAfford ? 'disabled' : ''}>
                ${canAfford ? '💰 COMPRAR' : '🔒 INSUFICIENTE'} - ${skin.cost} moedas
            </button>`;
        }

        item.innerHTML = `
            <div class="shop-item-header">
                <div class="shop-item-icon">${skin.icon}</div>
                <div class="shop-item-info">
                    <h3>${skin.name}</h3>
                    <p>${skin.description}</p>
                </div>
            </div>
            ${skin.special ? '<div class="shop-item-level">⭐ SKIN ESPECIAL ⭐</div>' : ''}
            ${buttonHTML}
        `;

        container.appendChild(item);
    }
}

// Comprar upgrade
function buyUpgrade(key) {
    if (ShopSystem.buyUpgrade(key)) {
        renderUpgrades();
        updateTotalCoinsDisplay();
    }
}

// Comprar skin
function buySkin(key) {
    if (ShopSystem.buySkin(key)) {
        renderSkins();
        updateTotalCoinsDisplay();
        updatePlayerSkin();
    }
}

// Equipar skin
function equipSkin(key) {
    if (ShopSystem.equipSkin(key)) {
        renderSkins();
        updatePlayerSkin();
    }
}

// Atualizar skin do jogador
function updatePlayerSkin() {
    player.currentSkin = ShopSystem.currentSkin;
    const skin = ShopSystem.skins[ShopSystem.currentSkin];

    // Recriar sprite do jogador com nova cor
    if (skin && assetsLoaded) {
        Assets.images.playerCar = Assets.createPlayerCarWithColor(skin.color, skin.accentColor);
    }
}

// Abrir loja
function openShop() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    AudioSystem.stopBackgroundMusic();

    document.getElementById('shopMenu').classList.remove('hidden');
    renderUpgrades();
    renderSkins();
    updateTotalCoinsDisplay();
}

// Fechar loja
function closeShop() {
    document.getElementById('shopMenu').classList.add('hidden');

    // Não reiniciar o jogo automaticamente, apenas fechar a loja
    if (!document.getElementById('gameOverScreen').classList.contains('hidden')) {
        // Se está na tela de game over, não fazer nada
        return;
    }

    // Retomar o jogo
    gameRunning = true;
    AudioSystem.playBackgroundMusic();
    updateGame();
}

// Event Listeners da Loja
document.getElementById('openShop').addEventListener('click', openShop);
document.getElementById('closeShop').addEventListener('click', closeShop);

// Tabs da loja
document.querySelectorAll('.shop-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const tabName = this.dataset.tab;

        // Atualizar tabs
        document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        // Atualizar conteúdo
        document.querySelectorAll('.shop-content').forEach(c => c.classList.remove('active'));
        document.getElementById(tabName + 'Tab').classList.add('active');
    });
});

// Menu de modos (botões)
const startSingleBtn = document.getElementById('startSingle');
if (startSingleBtn) startSingleBtn.addEventListener('click', () => initGame('single'));
const startTwoBtn = document.getElementById('startTwo');
if (startTwoBtn) startTwoBtn.addEventListener('click', () => initGame('two'));
const startChampBtn = document.getElementById('startChamp');
if (startChampBtn) startChampBtn.addEventListener('click', () => startChampionship());

// ========================================
// INICIAR O JOGO
// ========================================
updateTotalCoinsDisplay();
initGame();

// ---------- Campeonato (simples) ----------
const Championship = {
    currentRace: 0,
    totalRaces: 3,
    targets: [100, 150, 200], // metros
    results: []
};

function startChampionship() {
    Championship.currentRace = 0;
    Championship.results = [];
    mode = 'champ';
    const modeMenuEl = document.getElementById('modeMenu');
    if (modeMenuEl) modeMenuEl.classList.add('hidden');
    startNextChampRace();
}

function startNextChampRace() {
    if (Championship.currentRace >= Championship.totalRaces) {
        finishChampionship();
        return;
    }

    const target = Championship.targets[Championship.currentRace] || 100;
    Championship.currentRace++;

    // iniciar uma corrida normal em modo single, mas com um alvo
    initGame('single');
    // armazenar alvo atual (em metros)
    Championship.currentTarget = target;
    // informar jogador
    if (DEBUG) debugLog(`Campeonato: corrida ${Championship.currentRace}/${Championship.totalRaces} alvo ${target}m`);
}

function endChampRace(winnerName, winnerDistance) {
    Championship.results.push({ race: Championship.currentRace, winner: winnerName, distance: winnerDistance });
    // esperar 1s e iniciar próxima
    setTimeout(() => startNextChampRace(), 1200);
}

function finishChampionship() {
    mode = 'single';
    // guardar vencedor do campeonato em localStorage (simples)
    const summary = Championship.results.map(r => `Corrida ${r.race}: ${r.winner} (${r.distance}m)`).join('\n');
    localStorage.setItem('lastChampionship', JSON.stringify(Championship.results));
    // Mostrar resultado simples na console e game over screen
    alert('Campeonato finalizado!\n' + summary);
}

