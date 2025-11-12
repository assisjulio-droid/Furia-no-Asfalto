// ========================================
// SISTEMA DE ASSETS 2D - FÚRIA NO ASFALTO
// Geração de sprites SVG para carros, moedas e árvores
// ========================================

const Assets = {
    loaded: false,
    images: {},
    
    // ========================================
    // CRIAR SPRITE DE CARRO DO JOGADOR (TOP-DOWN)
    // ========================================
    createPlayerCar() {
        return this.createPlayerCarWithColor('#00ffff', '#0088ff');
    },

    createPlayerCarWithColor(mainColor, accentColor) {
        // Calcular cores derivadas
        const darkColor = this.darkenColor(accentColor, 0.5);
        const lightColor = this.lightenColor(mainColor, 0.3);

        const svg = `
            <svg width="80" height="120" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 120">
                <defs>
                    <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:${darkColor};stop-opacity:1" />
                        <stop offset="30%" style="stop-color:${accentColor};stop-opacity:1" />
                        <stop offset="50%" style="stop-color:${mainColor};stop-opacity:1" />
                        <stop offset="70%" style="stop-color:${accentColor};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${darkColor};stop-opacity:1" />
                    </linearGradient>
                    <radialGradient id="glowYellow">
                        <stop offset="0%" style="stop-color:#ffff00;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#ffaa00;stop-opacity:0.5" />
                    </radialGradient>
                    <filter id="neonGlow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                <!-- Corpo principal -->
                <path d="M 25 100 L 20 80 L 18 60 L 20 40 L 25 20 L 30 10 L 40 5 L 50 10 L 55 20 L 60 40 L 62 60 L 60 80 L 55 100 Z"
                      fill="url(#bodyGradient)" stroke="${darkColor}" stroke-width="1"/>

                <!-- Capô central -->
                <path d="M 35 95 L 32 75 L 30 55 L 32 35 L 35 20 L 40 15 L 45 20 L 48 35 L 50 55 L 48 75 L 45 95 Z"
                      fill="${accentColor}"/>

                <!-- Para-brisa -->
                <path d="M 30 70 L 28 55 L 30 50 L 40 48 L 50 50 L 52 55 L 50 70 Z"
                      fill="${lightColor}" opacity="0.6" stroke="${mainColor}" stroke-width="1"/>

                <!-- Spoiler traseiro -->
                <rect x="22" y="98" width="36" height="4" rx="1" fill="${darkColor}" stroke="${mainColor}" stroke-width="1"/>
                <rect x="24" y="100" width="32" height="2" fill="${mainColor}" filter="url(#neonGlow)"/>

                <!-- Lanternas traseiras -->
                <ellipse cx="26" cy="105" rx="3" ry="4" fill="#ff0000" opacity="0.9"/>
                <ellipse cx="54" cy="105" rx="3" ry="4" fill="#ff0000" opacity="0.9"/>

                <!-- Faróis dianteiros -->
                <ellipse cx="26" cy="8" rx="3" ry="3" fill="url(#glowYellow)" filter="url(#neonGlow)"/>
                <ellipse cx="54" cy="8" rx="3" ry="3" fill="url(#glowYellow)" filter="url(#neonGlow)"/>

                <!-- Linha central decorativa -->
                <line x1="40" y1="10" x2="40" y2="95" stroke="${mainColor}" stroke-width="1" opacity="0.8"/>

                <!-- Detalhes Neón nas laterais -->
                <path d="M 20 30 L 18 50 L 20 70" stroke="${mainColor}" stroke-width="1.5" fill="none" opacity="0.8" filter="url(#neonGlow)"/>
                <path d="M 60 30 L 62 50 L 60 70" stroke="${mainColor}" stroke-width="1.5" fill="none" opacity="0.8" filter="url(#neonGlow)"/>
            </svg>
        `;
        return this.svgToImage(svg, 80, 120);
    },

    // Funções auxiliares para manipulação de cores
    darkenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * factor);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * factor);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * factor);
        return `#${Math.floor(r).toString(16).padStart(2, '0')}${Math.floor(g).toString(16).padStart(2, '0')}${Math.floor(b).toString(16).padStart(2, '0')}`;
    },

    lightenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + (255 * factor));
        const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + (255 * factor));
        const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + (255 * factor));
        return `#${Math.floor(r).toString(16).padStart(2, '0')}${Math.floor(g).toString(16).padStart(2, '0')}${Math.floor(b).toString(16).padStart(2, '0')}`;
    },
    
    // ========================================
    // CRIAR SPRITE DE CARRO INIMIGO (TOP-DOWN)
    // ========================================
    createEnemyCar(color = '#ff0066', accentColor = '#cc0044') {
        const svg = `
            <svg width="70" height="100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 100">
                <defs>
                    <linearGradient id="enemyGradient${color}" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:${accentColor};stop-opacity:1" />
                        <stop offset="50%" style="stop-color:${color};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${accentColor};stop-opacity:1" />
                    </linearGradient>
                    <filter id="enemyGlow">
                        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                <!-- Corpo principal (visão de cima, frente para baixo) -->
                <path d="M 20 15 L 15 25 L 12 45 L 15 65 L 20 80 L 25 88 L 35 92 L 45 88 L 50 80 L 55 65 L 58 45 L 55 25 L 50 15 L 45 8 L 35 5 L 25 8 Z"
                      fill="url(#enemyGradient${color})" stroke="#000" stroke-width="0.8"/>

                <!-- Capô -->
                <path d="M 28 18 L 25 30 L 23 45 L 25 60 L 28 72 L 35 75 L 42 72 L 45 60 L 47 45 L 45 30 L 42 18 L 35 15 Z"
                      fill="${accentColor}"/>

                <!-- Para-brisa dianteiro -->
                <path d="M 30 75 L 28 65 L 30 60 L 35 58 L 40 60 L 42 65 L 40 75 Z"
                      fill="#ffffff" opacity="0.4" stroke="${color}" stroke-width="0.8"/>

                <!-- Vidro traseiro -->
                <path d="M 32 25 L 30 30 L 32 35 L 35 37 L 38 35 L 40 30 L 38 25 Z"
                      fill="#ffffff" opacity="0.3"/>

                <!-- Lanternas traseiras -->
                <ellipse cx="22" cy="10" rx="2.5" ry="3" fill="#ff0000" opacity="0.9"/>
                <ellipse cx="48" cy="10" rx="2.5" ry="3" fill="#ff0000" opacity="0.9"/>

                <!-- Faróis dianteiros -->
                <ellipse cx="22" cy="88" rx="2.5" ry="3" fill="#ffff00" opacity="0.8"/>
                <ellipse cx="48" cy="88" rx="2.5" ry="3" fill="#ffff00" opacity="0.8"/>

                <!-- Detalhes laterais -->
                <path d="M 15 35 L 12 45 L 15 55" stroke="${color}" stroke-width="1.5" fill="none" opacity="0.7"/>
                <path d="M 55 35 L 58 45 L 55 55" stroke="${color}" stroke-width="1.5" fill="none" opacity="0.7"/>
            </svg>
        `;
        return this.svgToImage(svg, 70, 100);
    },
    
    // ========================================
    // CRIAR SPRITE DE MOEDA
    // ========================================
    createCoin() {
        const svg = `
            <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="coinGradient">
                        <stop offset="0%" style="stop-color:#ffff00;stop-opacity:1" />
                        <stop offset="70%" style="stop-color:#ffcc00;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#ff9900;stop-opacity:1" />
                    </radialGradient>
                    <filter id="coinGlow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                
                <!-- Círculo externo -->
                <circle cx="15" cy="15" r="14" fill="url(#coinGradient)" filter="url(#coinGlow)"/>
                
                <!-- Borda interna -->
                <circle cx="15" cy="15" r="12" fill="none" stroke="#ffaa00" stroke-width="1"/>
                
                <!-- Símbolo $ -->
                <text x="15" y="21" font-family="Arial" font-size="18" font-weight="bold" 
                      fill="#ff6600" text-anchor="middle">$</text>
            </svg>
        `;
        return this.svgToImage(svg, 30, 30);
    },
    
    // ========================================
    // CRIAR SPRITE DE ÁRVORE
    // ========================================
    createTree(type = 'day') {
        const foliageColor = type === 'night' ? '#1a4d2e' : '#2d5016';
        const trunkColor = type === 'night' ? '#3d2817' : '#5c4033';
        
        const svg = `
            <svg width="40" height="60" xmlns="http://www.w3.org/2000/svg">
                <!-- Tronco -->
                <rect x="15" y="35" width="10" height="25" rx="2" fill="${trunkColor}"/>
                
                <!-- Copa (3 círculos) -->
                <circle cx="20" cy="25" r="12" fill="${foliageColor}"/>
                <circle cx="12" cy="30" r="10" fill="${foliageColor}"/>
                <circle cx="28" cy="30" r="10" fill="${foliageColor}"/>
                
                <!-- Detalhes da copa -->
                <circle cx="20" cy="20" r="8" fill="#3d7a1f" opacity="0.6"/>
            </svg>
        `;
        return this.svgToImage(svg, 40, 60);
    },
    
    // ========================================
    // CRIAR SPRITE DE NUVEM
    // ========================================
    createCloud() {
        const svg = `
            <svg width="80" height="40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="25" r="12" fill="#ffffff" opacity="0.7"/>
                <circle cx="35" cy="20" r="15" fill="#ffffff" opacity="0.7"/>
                <circle cx="50" cy="22" r="13" fill="#ffffff" opacity="0.7"/>
                <circle cx="60" cy="25" r="10" fill="#ffffff" opacity="0.7"/>
            </svg>
        `;
        return this.svgToImage(svg, 80, 40);
    },

    // ========================================
    // CRIAR SPRITE DE ESCUDO (POWER-UP)
    // ========================================
    createShieldPowerUp() {
        const svg = `
            <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="shieldGradient">
                        <stop offset="0%" style="stop-color:#00ffff;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#0088ff;stop-opacity:0.6" />
                    </radialGradient>
                    <filter id="shieldGlow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                <!-- Escudo -->
                <path d="M 20 5 L 35 10 L 35 20 Q 35 30 20 35 Q 5 30 5 20 L 5 10 Z"
                      fill="url(#shieldGradient)" stroke="#00ffff" stroke-width="2"
                      filter="url(#shieldGlow)" opacity="0.9"/>

                <!-- Símbolo -->
                <text x="20" y="25" font-family="Arial" font-size="20" font-weight="bold"
                      fill="#ffffff" text-anchor="middle">S</text>
            </svg>
        `;
        return this.svgToImage(svg, 40, 40);
    },

    // ========================================
    // CRIAR SPRITE DE ÍMÃ (POWER-UP)
    // ========================================
    createMagnetPowerUp() {
        const svg = `
            <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="magnetGradient">
                        <stop offset="0%" style="stop-color:#ff00ff;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#ff0088;stop-opacity:0.6" />
                    </radialGradient>
                    <filter id="magnetGlow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                <!-- Ímã em forma de U -->
                <path d="M 10 10 L 10 25 Q 10 30 15 30 L 25 30 Q 30 30 30 25 L 30 10"
                      fill="none" stroke="url(#magnetGradient)" stroke-width="6"
                      stroke-linecap="round" filter="url(#magnetGlow)"/>

                <!-- Polos -->
                <rect x="8" y="8" width="6" height="8" fill="#ff0000" rx="2"/>
                <rect x="26" y="8" width="6" height="8" fill="#0000ff" rx="2"/>
            </svg>
        `;
        return this.svgToImage(svg, 40, 40);
    },

    // ========================================
    // CRIAR SPRITE DE TURBO (POWER-UP)
    // ========================================
    createTurboPowerUp() {
        const svg = `
            <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="turboGradient">
                        <stop offset="0%" style="stop-color:#ff6600;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#ff0000;stop-opacity:0.6" />
                    </radialGradient>
                    <filter id="turboGlow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                <!-- Chama/Raio -->
                <path d="M 20 5 L 15 15 L 20 15 L 18 25 L 25 15 L 20 15 Z"
                      fill="url(#turboGradient)" stroke="#ffff00" stroke-width="1"
                      filter="url(#turboGlow)"/>

                <!-- Círculo externo -->
                <circle cx="20" cy="20" r="18" fill="none" stroke="#ff6600"
                        stroke-width="2" opacity="0.6" filter="url(#turboGlow)"/>
            </svg>
        `;
        return this.svgToImage(svg, 40, 40);
    },

    // ========================================
    // CRIAR SPRITE DE CAMINHÃO
    // ========================================
    createTruck() {
        const svg = `
            <svg width="80" height="140" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="truckGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#444444;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#666666;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#444444;stop-opacity:1" />
                    </linearGradient>
                </defs>

                <!-- Carroceria -->
                <rect x="15" y="20" width="50" height="80" rx="3" fill="url(#truckGradient)"
                      stroke="#333" stroke-width="1"/>

                <!-- Cabine -->
                <rect x="20" y="105" width="40" height="30" rx="3" fill="#555"
                      stroke="#333" stroke-width="1"/>

                <!-- Para-brisa -->
                <rect x="25" y="110" width="30" height="15" rx="2" fill="#88ccff" opacity="0.5"/>

                <!-- Lanternas traseiras -->
                <rect x="18" y="15" width="8" height="6" fill="#ff0000"/>
                <rect x="54" y="15" width="8" height="6" fill="#ff0000"/>

                <!-- Faróis -->
                <circle cx="25" cy="132" r="3" fill="#ffff00" opacity="0.8"/>
                <circle cx="55" cy="132" r="3" fill="#ffff00" opacity="0.8"/>
            </svg>
        `;
        return this.svgToImage(svg, 80, 140);
    },

    // ========================================
    // CRIAR SPRITE DE MOTO
    // ========================================
    createMotorcycle() {
        const svg = `
            <svg width="40" height="70" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="bikeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#cc0000;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#ff0000;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#cc0000;stop-opacity:1" />
                    </linearGradient>
                </defs>

                <!-- Corpo da moto -->
                <ellipse cx="20" cy="35" rx="8" ry="25" fill="url(#bikeGradient)"
                         stroke="#990000" stroke-width="1"/>

                <!-- Guidão -->
                <rect x="15" y="15" width="10" height="3" fill="#333"/>

                <!-- Rodas -->
                <circle cx="20" cy="20" r="4" fill="#222" stroke="#444" stroke-width="1"/>
                <circle cx="20" cy="55" r="4" fill="#222" stroke="#444" stroke-width="1"/>

                <!-- Farol -->
                <circle cx="20" cy="60" r="2" fill="#ffff00" opacity="0.9"/>

                <!-- Lanterna -->
                <rect x="17" y="12" width="6" height="2" fill="#ff0000"/>
            </svg>
        `;
        return this.svgToImage(svg, 40, 70);
    },
    
    // ========================================
    // CONVERTER SVG PARA IMAGEM
    // ========================================
    svgToImage(svgString, width, height) {
        const img = new Image();
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        img.src = url;
        img.width = width;
        img.height = height;

        // Revoke the object URL after the image loads to avoid leaking blob URLs
        img.addEventListener('load', () => {
            try { URL.revokeObjectURL(url); } catch (e) { /* ignore */ }
        }, { once: true });

        return img;
    },
    
    // ========================================
    // CARREGAR TODOS OS ASSETS
    // ========================================
    async loadAll() {
        return new Promise((resolve) => {
            // Criar todos os sprites
            this.images.playerCar = this.createPlayerCar();
            this.images.enemyCar1 = this.createEnemyCar('#ff0066', '#cc0044');
            this.images.enemyCar2 = this.createEnemyCar('#ff6600', '#cc4400');
            this.images.enemyCar3 = this.createEnemyCar('#9900ff', '#6600cc');
            this.images.enemyCar4 = this.createEnemyCar('#00ff00', '#00cc00');
            this.images.coin = this.createCoin();
            this.images.treeDay = this.createTree('day');
            this.images.treeNight = this.createTree('night');
            this.images.cloud = this.createCloud();

            // Power-ups
            this.images.shieldPowerUp = this.createShieldPowerUp();
            this.images.magnetPowerUp = this.createMagnetPowerUp();
            this.images.turboPowerUp = this.createTurboPowerUp();

            // Novos obstáculos
            this.images.truck = this.createTruck();
            this.images.motorcycle = this.createMotorcycle();

            // Aguardar carregamento
            setTimeout(() => {
                this.loaded = true;
                resolve();
            }, 100);
        });
    }
};

