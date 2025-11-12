// ========================================
// SISTEMA DE LOJA E CUSTOMIZAÇÃO
// ========================================

const ShopSystem = {
    // Moedas totais acumuladas (não resetam ao morrer)
    totalCoins: 0,
    
    // Upgrades disponíveis
    upgrades: {
        maxSpeed: {
            name: 'Velocidade Máxima',
            description: 'Aumenta a velocidade máxima do carro',
            icon: '🚀',
            level: 0,
            maxLevel: 5,
            baseCost: 50,
            costMultiplier: 1.5,
            effect: 2 // +2 de velocidade por nível
        },
        acceleration: {
            name: 'Aceleração',
            description: 'Acelera mais rápido',
            icon: '⚡',
            level: 0,
            maxLevel: 5,
            baseCost: 40,
            costMultiplier: 1.5,
            effect: 0.1 // +0.1 de aceleração por nível
        },
        magnetRadius: {
            name: 'Raio do Ímã',
            description: 'Aumenta o alcance do power-up ímã',
            icon: '🧲',
            level: 0,
            maxLevel: 3,
            baseCost: 80,
            costMultiplier: 2,
            effect: 50 // +50px de raio por nível
        },
        shieldDuration: {
            name: 'Duração do Escudo',
            description: 'Escudo dura mais tempo',
            icon: '🛡️',
            level: 0,
            maxLevel: 3,
            baseCost: 100,
            costMultiplier: 2,
            effect: 60 // +60 frames (1 segundo) por nível
        },
        coinValue: {
            name: 'Valor das Moedas',
            description: 'Cada moeda vale mais',
            icon: '💰',
            level: 0,
            maxLevel: 5,
            baseCost: 60,
            costMultiplier: 1.8,
            effect: 1 // +1 moeda por coleta
        }
    },
    
    // Skins disponíveis
    skins: {
        default: {
            name: 'Carro Padrão',
            description: 'Carro inicial ciano',
            icon: '🚗',
            color: '#00ffff',
            accentColor: '#0088ff',
            cost: 0,
            unlocked: true
        },
        red: {
            name: 'Fúria Vermelha',
            description: 'Carro vermelho agressivo',
            icon: '🏎️',
            color: '#ff0000',
            accentColor: '#cc0000',
            cost: 100,
            unlocked: false
        },
        gold: {
            name: 'Ouro Reluzente',
            description: 'Carro dourado luxuoso',
            icon: '✨',
            color: '#ffd700',
            accentColor: '#ffaa00',
            cost: 200,
            unlocked: false
        },
        purple: {
            name: 'Roxo Místico',
            description: 'Carro roxo misterioso',
            icon: '🔮',
            color: '#9900ff',
            accentColor: '#6600cc',
            cost: 150,
            unlocked: false
        },
        green: {
            name: 'Verde Neon',
            description: 'Carro verde radioativo',
            icon: '☢️',
            color: '#00ff00',
            accentColor: '#00cc00',
            cost: 150,
            unlocked: false
        },
        rainbow: {
            name: 'Arco-Íris',
            description: 'Carro com efeito arco-íris',
            icon: '🌈',
            color: '#ff00ff',
            accentColor: '#00ffff',
            cost: 500,
            unlocked: false,
            special: true
        },
        blue: {
            name: 'Azul Profundo',
            description: 'Carro azul oceânico',
            icon: '🚘',
            color: '#0044ff',
            accentColor: '#0066ff',
            cost: 120,
            unlocked: false
        },
        orange: {
            name: 'Laranja Selvagem',
            description: 'Carro laranja vibrante',
            icon: '🏁',
            color: '#ff8800',
            accentColor: '#ff4400',
            cost: 120,
            unlocked: false
        },
        silver: {
            name: 'Prata Rápida',
            description: 'Carro prata elegante',
            icon: '🚗',
            color: '#c0c0c0',
            accentColor: '#9e9e9e',
            cost: 180,
            unlocked: false
        }
        
    },
    
    currentSkin: 'default',
    
    // Calcular custo de upgrade
    getUpgradeCost(upgradeKey) {
        const upgrade = this.upgrades[upgradeKey];
        if (upgrade.level >= upgrade.maxLevel) return null;
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
    },
    
    // Comprar upgrade
    buyUpgrade(upgradeKey) {
        const upgrade = this.upgrades[upgradeKey];
        const cost = this.getUpgradeCost(upgradeKey);
        
        if (!cost || this.totalCoins < cost) {
            AudioSystem.play('crash'); // Som de erro
            return false;
        }
        
        this.totalCoins -= cost;
        upgrade.level++;
        this.save();
        AudioSystem.play('powerup');
        return true;
    },
    
    // Comprar skin
    buySkin(skinKey) {
        const skin = this.skins[skinKey];
        
        if (skin.unlocked || this.totalCoins < skin.cost) {
            AudioSystem.play('crash');
            return false;
        }
        
        this.totalCoins -= skin.cost;
        skin.unlocked = true;
        this.currentSkin = skinKey;
        this.save();
        AudioSystem.play('powerup');
        return true;
    },
    
    // Equipar skin
    equipSkin(skinKey) {
        const skin = this.skins[skinKey];
        
        if (!skin.unlocked) {
            AudioSystem.play('crash');
            return false;
        }
        
        this.currentSkin = skinKey;
        this.save();
        AudioSystem.play('coin');
        return true;
    },
    
    // Salvar dados
    save() {
        const data = {
            totalCoins: this.totalCoins,
            upgrades: {},
            skins: {},
            currentSkin: this.currentSkin
        };
        
        // Salvar níveis de upgrades
        for (let key in this.upgrades) {
            data.upgrades[key] = this.upgrades[key].level;
        }
        
        // Salvar skins desbloqueadas
        for (let key in this.skins) {
            data.skins[key] = this.skins[key].unlocked;
        }
        
        localStorage.setItem('shopData', JSON.stringify(data));
        localStorage.setItem('totalCoins', this.totalCoins);
    },
    
    // Carregar dados
    load() {
        const savedData = localStorage.getItem('shopData');
        
        if (savedData) {
            const data = JSON.parse(savedData);
            this.totalCoins = data.totalCoins || 0;
            this.currentSkin = data.currentSkin || 'default';
            
            // Carregar níveis de upgrades
            if (data.upgrades) {
                for (let key in data.upgrades) {
                    if (this.upgrades[key]) {
                        this.upgrades[key].level = data.upgrades[key];
                    }
                }
            }
            
            // Carregar skins desbloqueadas
            if (data.skins) {
                for (let key in data.skins) {
                    if (this.skins[key]) {
                        this.skins[key].unlocked = data.skins[key];
                    }
                }
            }
        }
        
        // Garantir que a skin padrão está desbloqueada
        this.skins.default.unlocked = true;
    },
    
    // Adicionar moedas ao total
    addCoins(amount) {
        this.totalCoins += amount;
        this.save();
    },
    
    // Obter efeito total de um upgrade
    getUpgradeEffect(upgradeKey) {
        const upgrade = this.upgrades[upgradeKey];
        return upgrade.level * upgrade.effect;
    },
    
    // Resetar tudo (para debug)
    reset() {
        this.totalCoins = 0;
        this.currentSkin = 'default';
        
        for (let key in this.upgrades) {
            this.upgrades[key].level = 0;
        }
        
        for (let key in this.skins) {
            this.skins[key].unlocked = (key === 'default');
        }
        
        this.save();
    }
};

// Inicializar ao carregar
ShopSystem.load();

