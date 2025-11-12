// ========================================
// SISTEMA DE ÁUDIO - FÚRIA NO ASFALTO
// Efeitos sonoros e música usando Web Audio API
// ========================================

const AudioSystem = {
    context: null,
    sounds: {},
    musicPlaying: false,
    musicEnabled: true,
    sfxEnabled: true,
    masterVolume: 0.5,
    
    // ========================================
    // INICIALIZAR SISTEMA DE ÁUDIO
    // ========================================
    init() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (e) {
            console.warn('Web Audio API não suportada:', e);
        }
    },
    
    // ========================================
    // CRIAR SONS PROCEDURAIS
    // ========================================
    createSounds() {
        // Sons serão criados proceduralmente usando osciladores
        this.sounds = {
            coin: this.createCoinSound,
            crash: this.createCrashSound,
            powerup: this.createPowerUpSound,
            shield: this.createShieldSound,
            turbo: this.createTurboSound,
            engine: this.createEngineSound
        };
    },
    
    // ========================================
    // SOM DE MOEDA
    // ========================================
    createCoinSound() {
        if (!AudioSystem.context || !AudioSystem.sfxEnabled) return;
        
        const oscillator = AudioSystem.context.createOscillator();
        const gainNode = AudioSystem.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(AudioSystem.context.destination);
        
        oscillator.frequency.setValueAtTime(800, AudioSystem.context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, AudioSystem.context.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3 * AudioSystem.masterVolume, AudioSystem.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, AudioSystem.context.currentTime + 0.2);
        
        oscillator.start(AudioSystem.context.currentTime);
        oscillator.stop(AudioSystem.context.currentTime + 0.2);
    },
    
    // ========================================
    // SOM DE COLISÃO
    // ========================================
    createCrashSound() {
        if (!AudioSystem.context || !AudioSystem.sfxEnabled) return;
        
        const oscillator = AudioSystem.context.createOscillator();
        const gainNode = AudioSystem.context.createGain();
        const filter = AudioSystem.context.createBiquadFilter();
        
        oscillator.type = 'sawtooth';
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(AudioSystem.context.destination);
        
        oscillator.frequency.setValueAtTime(200, AudioSystem.context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, AudioSystem.context.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.5 * AudioSystem.masterVolume, AudioSystem.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, AudioSystem.context.currentTime + 0.5);
        
        oscillator.start(AudioSystem.context.currentTime);
        oscillator.stop(AudioSystem.context.currentTime + 0.5);
    },
    
    // ========================================
    // SOM DE POWER-UP
    // ========================================
    createPowerUpSound() {
        if (!AudioSystem.context || !AudioSystem.sfxEnabled) return;
        
        const oscillator = AudioSystem.context.createOscillator();
        const gainNode = AudioSystem.context.createGain();
        
        oscillator.type = 'square';
        oscillator.connect(gainNode);
        gainNode.connect(AudioSystem.context.destination);
        
        oscillator.frequency.setValueAtTime(400, AudioSystem.context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, AudioSystem.context.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(1200, AudioSystem.context.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.2 * AudioSystem.masterVolume, AudioSystem.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, AudioSystem.context.currentTime + 0.3);
        
        oscillator.start(AudioSystem.context.currentTime);
        oscillator.stop(AudioSystem.context.currentTime + 0.3);
    },
    
    // ========================================
    // SOM DE ESCUDO
    // ========================================
    createShieldSound() {
        if (!AudioSystem.context || !AudioSystem.sfxEnabled) return;
        
        const oscillator = AudioSystem.context.createOscillator();
        const gainNode = AudioSystem.context.createGain();
        
        oscillator.type = 'sine';
        oscillator.connect(gainNode);
        gainNode.connect(AudioSystem.context.destination);
        
        oscillator.frequency.setValueAtTime(300, AudioSystem.context.currentTime);
        oscillator.frequency.setValueAtTime(350, AudioSystem.context.currentTime + 0.05);
        oscillator.frequency.setValueAtTime(300, AudioSystem.context.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.15 * AudioSystem.masterVolume, AudioSystem.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, AudioSystem.context.currentTime + 0.2);
        
        oscillator.start(AudioSystem.context.currentTime);
        oscillator.stop(AudioSystem.context.currentTime + 0.2);
    },
    
    // ========================================
    // SOM DE TURBO
    // ========================================
    createTurboSound() {
        if (!AudioSystem.context || !AudioSystem.sfxEnabled) return;
        
        const oscillator = AudioSystem.context.createOscillator();
        const gainNode = AudioSystem.context.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.connect(gainNode);
        gainNode.connect(AudioSystem.context.destination);
        
        oscillator.frequency.setValueAtTime(100, AudioSystem.context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, AudioSystem.context.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.25 * AudioSystem.masterVolume, AudioSystem.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, AudioSystem.context.currentTime + 0.3);
        
        oscillator.start(AudioSystem.context.currentTime);
        oscillator.stop(AudioSystem.context.currentTime + 0.3);
    },
    
    // ========================================
    // SOM DE MOTOR (LOOP)
    // ========================================
    createEngineSound() {
        if (!AudioSystem.context || !AudioSystem.sfxEnabled) return;
        
        const oscillator = AudioSystem.context.createOscillator();
        const gainNode = AudioSystem.context.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.connect(gainNode);
        gainNode.connect(AudioSystem.context.destination);
        
        oscillator.frequency.value = 80;
        gainNode.gain.value = 0.05 * AudioSystem.masterVolume;
        
        oscillator.start();
        
        return { oscillator, gainNode };
    },
    
    // ========================================
    // TOCAR SOM
    // ========================================
    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    },
    
    // ========================================
    // MÚSICA DE FUNDO (SYNTHWAVE PROCEDURAL)
    // ========================================
    playBackgroundMusic() {
        if (!this.context || !this.musicEnabled || this.musicPlaying) return;
        
        this.musicPlaying = true;
        
        // Criar uma melodia synthwave simples
        const notes = [
            { freq: 261.63, time: 0 },    // C
            { freq: 293.66, time: 0.5 },  // D
            { freq: 329.63, time: 1 },    // E
            { freq: 392.00, time: 1.5 },  // G
            { freq: 329.63, time: 2 },    // E
            { freq: 293.66, time: 2.5 },  // D
            { freq: 261.63, time: 3 },    // C
            { freq: 246.94, time: 3.5 }   // B
        ];
        
        const playMelody = () => {
            if (!this.musicPlaying) return;
            
            notes.forEach(note => {
                setTimeout(() => {
                    if (!this.musicPlaying) return;
                    
                    const osc = this.context.createOscillator();
                    const gain = this.context.createGain();
                    
                    osc.type = 'square';
                    osc.frequency.value = note.freq;
                    
                    gain.gain.setValueAtTime(0.05 * this.masterVolume, this.context.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.4);
                    
                    osc.connect(gain);
                    gain.connect(this.context.destination);
                    
                    osc.start();
                    osc.stop(this.context.currentTime + 0.4);
                }, note.time * 1000);
            });
            
            setTimeout(playMelody, 4000);
        };
        
        playMelody();
    },
    
    // ========================================
    // PARAR MÚSICA
    // ========================================
    stopBackgroundMusic() {
        this.musicPlaying = false;
    },
    
    // ========================================
    // TOGGLE MÚSICA
    // ========================================
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (!this.musicEnabled) {
            this.stopBackgroundMusic();
        } else {
            this.playBackgroundMusic();
        }
        return this.musicEnabled;
    },
    
    // ========================================
    // TOGGLE SFX
    // ========================================
    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        return this.sfxEnabled;
    }
};

// Alguns navegadores exigem uma interação do usuário para ativar o AudioContext.
// Garantir que o contexto seja resumido no primeiro clique/touch do usuário.
document.addEventListener('pointerdown', function resumeAudioOnce() {
    try {
        if (AudioSystem.context && AudioSystem.context.state === 'suspended') {
            AudioSystem.context.resume();
        }
    } catch (e) {
        // ignore
    }
    document.removeEventListener('pointerdown', resumeAudioOnce);
}, { once: true });

