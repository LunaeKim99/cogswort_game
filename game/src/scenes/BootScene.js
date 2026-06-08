// BootScene - generates all textures programmatically
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        // Loading text
        this.add.text(w / 2, h / 2 - 40, 'LOADING...', {
            fontSize: '16px', fontFamily: 'monospace', color: '#aaaaaa'
        }).setOrigin(0.5);

        // Progress bar background
        const barBg = this.add.graphics();
        barBg.fillStyle(0x222222, 0.8);
        barBg.fillRect(w / 2 - 160, h / 2 - 10, 320, 20);
        barBg.lineStyle(1, 0x666666, 0.6);
        barBg.strokeRect(w / 2 - 160, h / 2 - 10, 320, 20);

        // Progress bar fill
        const progressBar = this.add.graphics();
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xFFD700, 1);
            progressBar.fillRect(w / 2 - 158, h / 2 - 8, 316 * value, 16);
        });

        // Handle load errors gracefully - procedural fallback handles missing PNGs
        this.load.on('loaderror', (fileObj) => {
            console.warn('Failed to load asset, using procedural fallback:', fileObj.key);
        });

        // Try loading all PNG textures from assets/images/
        const pngKeys = [
            'player-idle', 'player-run', 'player-jump', 'player-fall', 'player-hurt',
            'walker-walk', 'walker-death', 'drone', 'drone-death',
            'laser-beam', 'laser-cone', 'laser-warning',
            'coin', 'saw-blade', 'spike-trap',
            'gate-closed', 'gate-open',
            'heart-full', 'heart-empty', 'particle',
            'btn-left', 'btn-right', 'btn-jump', 'btn-pause', 'icon-play',
            'ground-tile',
            'bg-level1', 'bg-level2', 'bg-level3'
        ];
        pngKeys.forEach(key => {
            this.load.image(key, `assets/images/${key}.png`);
        });

        // Safety timeout: if loading hangs, proceed anyway
        this.time.delayedCall(5000, () => {
            if (this.scene.isActive('BootScene')) {
                console.warn('Boot load timeout - proceeding with procedural assets');
                this.load.removeAllListeners();
                this.scene.start('PreloadScene');
            }
        });
    }

    create() {
        // Show generating text
        this.add.text(400, 225, 'GENERATING ASSETS...', {
            fontSize: '20px', fontFamily: 'monospace', color: '#ffffff'
        }).setOrigin(0.5);

        // Generate procedural textures only for ones that didn't load from PNG
        this.generatePlayerTextures();
        if (!this.textures.exists('coin')) this.generateCoinTexture();
        if (!this.textures.exists('heart-full')) this.generateHeartTextures();
        if (!this.textures.exists('particle')) this.generateParticleTexture();
        if (!this.textures.exists('btn-left')) this.generateButtonTextures();
        if (!this.textures.exists('btn-pause')) this.generatePauseButtonTexture();
        if (!this.textures.exists('gate-closed')) this.generateGateTextures();
        if (!this.textures.exists('saw-blade')) this.generateObstacleTextures();
        if (!this.textures.exists('drone') || !this.textures.exists('walker-walk') || !this.textures.exists('laser-beam')) {
            this.generateNewEntityTextures();
        }
        if (!this.textures.exists('ground-tile')) this.generateGroundTile();
        if (!this.textures.exists('bg-level1')) this.generateBackgroundTextures();

        // Always register animations (they use procedural multi-frame textures)
        this.createAnimations();

        // Transition after short delay
        this.time.delayedCall(200, () => {
            this.scene.start('PreloadScene');
        });
    }

    // ── Helper: draw a simple gear ──
    _drawGear(g, cx, cy, radius, teeth, color) {
        g.fillStyle(color);
        g.fillCircle(cx, cy, radius);
        const tw = radius * 0.35;
        const th = radius * 0.25;
        const step = (Math.PI * 2) / teeth;
        for (let i = 0; i < teeth; i++) {
            const angle = i * step - Math.PI / 2;
            const tx = cx + Math.cos(angle) * radius;
            const ty = cy + Math.sin(angle) * radius;
            g.fillRect(tx - tw / 2, ty - th / 2, tw, th);
        }
    }

    // ── PLAYER animation textures (32x32 each) ──
    generatePlayerTextures() {
        // Base character builder (now uses _drawChar method)

        // IDLE — skip if loaded from PNG
        if (!this.textures.exists('player-idle')) {
            let g = this.add.graphics();
            this._drawChar(g, 0, 0);
            g.generateTexture('player-idle', 32, 32);
            g.destroy();
        }

        // RUN (legs apart, arms swinging) — skip if loaded from PNG
        if (!this.textures.exists('player-run')) {
            let g = this.add.graphics();
            this._drawChar(g, -1, 2);
            g.generateTexture('player-run', 32, 32);
            g.destroy();
        }

        // JUMP (arms up, legs tucked) — skip if loaded from PNG
        if (!this.textures.exists('player-jump')) {
            let g = this.add.graphics();
            this._drawChar(g, -2, -1);
            g.generateTexture('player-jump', 32, 32);
            g.destroy();
        }

        // FALL (arms down, legs spread) — skip if loaded from PNG
        if (!this.textures.exists('player-fall')) {
            let g = this.add.graphics();
            this._drawChar(g, 1, 1);
            g.generateTexture('player-fall', 32, 32);
            g.destroy();
        }

        // HURT (red-tinted) — skip if loaded from PNG
        if (!this.textures.exists('player-hurt')) {
            let g = this.add.graphics();
            this._drawChar(g, 0, 0, (gfx) => {
                gfx.fillStyle(0xFF0000, 0.3);
                gfx.fillRect(0, 0, 32, 32);
            });
            g.generateTexture('player-hurt', 32, 32);
            g.destroy();
        }
    }

    // ── COIN texture (16x16) ──
    generateCoinTexture() {
        const g = this.add.graphics();
        // Outer ring
        g.fillStyle(0xFFD700);
        g.fillCircle(8, 8, 7);
        g.fillStyle(0xDAA520);
        g.fillCircle(8, 8, 5);
        // Inner
        g.fillStyle(0xB8860B);
        g.fillCircle(8, 8, 4);
        // Notches
        g.fillStyle(0xFFD700);
        g.fillRect(6,  0,  4,  2);
        g.fillRect(6,  14, 4,  2);
        g.fillRect(0,  6,  2,  4);
        g.fillRect(14, 6,  2,  4);
        g.fillRect(1,  1,  2,  2);
        g.fillRect(13, 1,  2,  2);
        g.fillRect(1,  13, 2,  2);
        g.fillRect(13, 13, 2,  2);
        // Center hole
        g.fillStyle(0x1A1A2E);
        g.fillCircle(8, 8, 2);
        // Highlight
        g.fillStyle(0xFFFFAA, 0.4);
        g.fillCircle(7, 6, 2);
        g.generateTexture('coin', 16, 16);
        g.destroy();
    }

    // ── HEART textures (20x20) ──
    generateHeartTextures() {
        // FULL
        let g = this.add.graphics();
        g.fillStyle(0xFF3333);
        g.fillCircle(7,  7, 5);
        g.fillCircle(13, 7, 5);
        g.fillRect(5,  7, 10, 3);
        g.fillTriangle(5,  10, 15, 10, 10, 18);
        g.fillStyle(0xFF7777, 0.5);
        g.fillCircle(7,  6, 2);
        g.generateTexture('heart-full', 20, 20);
        g.destroy();

        // EMPTY
        g = this.add.graphics();
        g.fillStyle(0x555555);
        g.fillCircle(7,  7, 5);
        g.fillCircle(13, 7, 5);
        g.fillRect(5,  7, 10, 3);
        g.fillTriangle(5,  10, 15, 10, 10, 18);
        g.fillStyle(0x777777, 0.3);
        g.fillCircle(7,  6, 2);
        g.generateTexture('heart-empty', 20, 20);
        g.destroy();
    }

    // ── PARTICLE texture (4x4) ──
    generateParticleTexture() {
        const g = this.add.graphics();
        g.fillStyle(0xFFFFFF);
        g.fillRect(0, 0, 4, 4);
        g.fillStyle(0xFFFFFF, 0.5);
        g.fillRect(1, 1, 2, 2);
        g.generateTexture('particle', 4, 4);
        g.destroy();
    }

    // ── BUTTON textures (64x64) ──
    generateButtonTextures() {
        const drawBg = (g) => {
            g.fillStyle(0x000000, 0.3);
            g.fillCircle(32, 32, 32);
            g.fillStyle(0x333333, 0.5);
            g.fillCircle(32, 32, 30);
            g.lineStyle(2, 0x666666, 0.6);
            g.strokeCircle(32, 32, 29);
        };

        // LEFT
        let g = this.add.graphics();
        drawBg(g);
        g.fillStyle(0xFFFFFF, 0.8);
        g.fillTriangle(42, 17, 42, 47, 20, 32);
        g.generateTexture('btn-left', 64, 64);
        g.destroy();

        // RIGHT
        g = this.add.graphics();
        drawBg(g);
        g.fillStyle(0xFFFFFF, 0.8);
        g.fillTriangle(22, 17, 22, 47, 44, 32);
        g.generateTexture('btn-right', 64, 64);
        g.destroy();

        // JUMP
        g = this.add.graphics();
        drawBg(g);
        g.fillStyle(0xFFFFFF, 0.8);
        g.fillTriangle(17, 42, 47, 42, 32, 20);
        g.generateTexture('btn-jump', 64, 64);
        g.destroy();
    }

    // ── PAUSE BUTTON texture (32x32) ──
    generatePauseButtonTexture() {
        const g = this.add.graphics();
        // Circle bg
        g.fillStyle(0x000000, 0.4);
        g.fillCircle(16, 16, 14);
        g.lineStyle(2, 0xFFFFFF, 0.7);
        g.strokeCircle(16, 16, 14);
        // Two bars (pause icon)
        g.fillStyle(0xFFFFFF, 0.9);
        g.fillRect(10, 8,  4, 16);
        g.fillRect(18, 8,  4, 16);
        g.generateTexture('btn-pause', 32, 32);
        g.destroy();

        // RESUME / PLAY icon (triangle)
        const g2 = this.add.graphics();
        g2.fillStyle(0xFFFFFF, 0.9);
        g2.fillTriangle(10, 8,  10, 24,  26, 16);
        g2.generateTexture('icon-play', 32, 32);
        g2.destroy();
    }

    // ── GATE textures (48x64) ──
    generateGateTextures() {
        // CLOSED / LOCKED gate (darker, no glow)
        let g = this.add.graphics();
        // Frame
        g.fillStyle(0x4A3E2E);
        g.fillRect(0, 0, 48, 64);
        g.fillStyle(0x5D4E37);
        g.fillRect(2, 2, 44, 60);
        // Arch top
        g.fillStyle(0x4A3E2E);
        g.fillRect(0, 0, 48, 4);
        g.fillTriangle(0, 4, 24, 0, 48, 4);
        // Door panels
        g.fillStyle(0x3E3426);
        g.fillRect(6, 8, 14, 20);
        g.fillRect(28, 8, 14, 20);
        g.fillRect(6, 34, 14, 24);
        g.fillRect(28, 34, 14, 24);
        // Rivets
        g.fillStyle(0x888888);
        [[8,10],[20,10],[28,10],[40,10],[8,36],[20,36],[28,36],[40,36],[8,54],[40,54]]
            .forEach(([x,y]) => { g.fillCircle(x, y, 1); });
        // Lock indicator
        g.fillStyle(0xFF4444);
        g.fillCircle(24, 48, 4);
        g.fillStyle(0xCC3333);
        g.fillCircle(24, 48, 2);
        g.generateTexture('gate-closed', 48, 64);
        g.destroy();

        // OPEN / ACTIVE gate (golden glow)
        g = this.add.graphics();
        // Frame same
        g.fillStyle(0x4A3E2E);
        g.fillRect(0, 0, 48, 64);
        g.fillStyle(0x5D4E37);
        g.fillRect(2, 2, 44, 60);
        g.fillStyle(0x4A3E2E);
        g.fillRect(0, 0, 48, 4);
        g.fillTriangle(0, 4, 24, 0, 48, 4);
        // Glowing inner panels
        g.fillStyle(0xFFD700, 0.8);
        g.fillRect(6, 8, 14, 20);
        g.fillRect(28, 8, 14, 20);
        g.fillRect(6, 34, 14, 24);
        g.fillRect(28, 34, 14, 24);
        // Inner glow
        g.fillStyle(0xFFFFAA, 0.4);
        g.fillRect(8, 10, 10, 16);
        g.fillRect(30, 10, 10, 16);
        g.fillRect(8, 36, 10, 20);
        g.fillRect(30, 36, 10, 20);
        // Rivets
        g.fillStyle(0xFFD700);
        [[8,10],[20,10],[28,10],[40,10],[8,36],[20,36],[28,36],[40,36],[8,54],[40,54]]
            .forEach(([x,y]) => { g.fillCircle(x, y, 2); });
        // Open indicator (green)
        g.fillStyle(0x44FF88);
        g.fillCircle(24, 48, 6);
        g.fillStyle(0x88FFBB);
        g.fillCircle(24, 48, 4);
        g.fillStyle(0xFFFFFF);
        g.fillCircle(24, 48, 2);
        // Outer glow
        g.fillStyle(0xFFD700, 0.2);
        g.fillRect(0, 0, 48, 64);
        g.generateTexture('gate-open', 48, 64);
        g.destroy();
    }

    // ── OBSTACLE texture (saw blade, 28x28) ──
    generateObstacleTextures() {
        // SAW BLADE
        let g = this.add.graphics();
        // Outer ring
        g.fillStyle(0x888888);
        g.fillCircle(14, 14, 13);
        g.fillStyle(0x666666);
        g.fillCircle(14, 14, 11);
        // Teeth
        g.fillStyle(0xAAAAAA);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const tx = 14 + Math.cos(angle) * 11;
            const ty = 14 + Math.sin(angle) * 11;
            g.fillTriangle(
                tx, ty,
                14 + Math.cos(angle - 0.3) * 14, 14 + Math.sin(angle - 0.3) * 14,
                14 + Math.cos(angle + 0.3) * 14, 14 + Math.sin(angle + 0.3) * 14
            );
        }
        // Center
        g.fillStyle(0x444444);
        g.fillCircle(14, 14, 5);
        g.fillStyle(0xFF4444);
        g.fillCircle(14, 14, 3);
        g.fillStyle(0xFF8888);
        g.fillCircle(14, 14, 1);
        g.generateTexture('saw-blade', 28, 28);
        g.destroy();

        // SPIKE TRAP (48x32) — wide serrated trap plate
        g = this.add.graphics();
        // Base plate (iron)
        g.fillStyle(0x555555);
        g.fillRect(0, 24, 48, 8);
        g.fillStyle(0x666666);
        g.fillRect(0, 25, 48, 3);
        g.fillStyle(0x444444);
        g.fillRect(0, 29, 48, 3);
        // Rivets on base
        g.fillStyle(0x888888);
        g.fillRect(4,  26, 2, 2);
        g.fillRect(22, 26, 2, 2);
        g.fillRect(42, 26, 2, 2);
        // Serrated spikes (5 teeth)
        const spikeColors = [0xCC3333, 0xBB4444, 0xCC3333, 0xBB4444, 0xCC3333];
        for (let i = 0; i < 5; i++) {
            const sx = 2 + i * 10; // 2, 12, 22, 32, 42
            g.fillStyle(spikeColors[i]);
            g.fillTriangle(sx + 5, 0, sx, 24, sx + 10, 24);
            g.fillStyle(0xFF6666, 0.4);
            g.fillTriangle(sx + 5, 2, sx + 2, 24, sx + 8, 24);
            // Serrated edge: small zigzag on left side
            g.fillStyle(0xAA2222);
            g.fillTriangle(sx, 18, sx - 1, 22, sx + 2, 22);
            g.fillTriangle(sx, 12, sx - 1, 16, sx + 2, 16);
            g.fillTriangle(sx, 6,  sx - 1, 10, sx + 2, 10);
        }
        // Highlight line on spike tips
        g.fillStyle(0xFFAAAA, 0.3);
        g.fillRect(0, 0, 48, 1);
        g.generateTexture('spike-trap', 48, 32);
        g.destroy();
    }

    // ── NEW ENTITY textures (drone, walker, laser beam) ──
    generateNewEntityTextures() {
        this._generateDroneTexture();
        this._generateWalkerTextures();
        this._generateLaserTexture();
    }

    _generateDroneTexture() {
        // DRONE (28x28) — steampunk mechanical flying drone
        if (!this.textures.exists('drone')) {
            let g = this.add.graphics();
            // Propeller shaft
            g.fillStyle(0x888888);
            g.fillRect(13, 0, 2, 4);
            // Propeller blades (brass)
            g.fillStyle(0xCD7F32);
            g.fillRect(2,  1, 10, 2);
            g.fillRect(16, 1, 10, 2);
            g.fillRect(12, 1, 4,  2);
            // Propeller blur
            g.fillStyle(0xAA6B2E, 0.4);
            g.fillRect(1,  1, 26, 2);
            // Upper dome (brass)
            g.fillStyle(0xB87333);
            g.fillRect(5,  4,  18, 4);
            g.fillStyle(0xCD7F32);
            g.fillRect(7,  5,  14, 2);
            // Body casing (copper)
            g.fillStyle(0x8B5A2B);
            g.fillRect(4,  8,  20, 12);
            g.fillStyle(0xA0714B);
            g.fillRect(6,  9,  16, 10);
            // Central gear
            g.fillStyle(0xFFD700);
            g.fillCircle(14, 14, 4);
            g.fillStyle(0xB8860B);
            g.fillCircle(14, 14, 3);
            // Gear teeth
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
                const tx = 14 + Math.cos(angle) * 4;
                const ty = 14 + Math.sin(angle) * 4;
                g.fillStyle(0xFFD700);
                g.fillRect(tx - 1, ty - 1, 2, 2);
            }
            // Mechanical eye (amber glow)
            g.fillStyle(0xFFAA00);
            g.fillCircle(14, 14, 2);
            g.fillStyle(0xFFDD44);
            g.fillCircle(14, 14, 1);
            // Steam pipes (sides)
            g.fillStyle(0x6B4226);
            g.fillRect(2,  10, 2, 6);
            g.fillRect(24, 10, 2, 6);
            // Pipe rivets
            g.fillStyle(0x999999);
            g.fillRect(2, 10, 2, 1);
            g.fillRect(2, 15, 2, 1);
            g.fillRect(24,10, 2, 1);
            g.fillRect(24,15, 2, 1);
            // Steam vent (bottom)
            g.fillStyle(0x6B4226);
            g.fillRect(10, 20, 8, 3);
            g.fillStyle(0x8B5A2B);
            g.fillRect(11, 21, 6, 1);
            // Rivets on body
            g.fillStyle(0xBBBBBB);
            g.fillRect(8,  10, 1, 1);
            g.fillRect(19, 10, 1, 1);
            g.fillRect(8,  18, 1, 1);
            g.fillRect(19, 18, 1, 1);
            // Bottom fin
            g.fillStyle(0x8B5A2B);
            g.fillRect(6,  23, 16, 2);
            g.fillStyle(0xA0714B);
            g.fillRect(8,  23, 12, 1);
            g.generateTexture('drone', 28, 28);
            g.destroy();
        }

        // DRONE DEATH (X eye, dark)
        if (!this.textures.exists('drone-death')) {
            let g = this.add.graphics();
            g.fillStyle(0x888888);
            g.fillRect(13, 0, 2, 4);
            g.fillStyle(0xAA6B2E);
            g.fillRect(2,  1, 10, 2);
            g.fillRect(16, 1, 10, 2);
            g.fillRect(12, 1, 4,  2);
            g.fillStyle(0x8B5A2B);
            g.fillRect(4,  8,  20, 12);
            g.fillStyle(0x7A4A2B);
            g.fillRect(6,  9,  16, 10);
            g.fillStyle(0x666666);
            g.fillCircle(14, 14, 4);
            // X eye
            g.lineStyle(2, 0xFF0000);
            g.beginPath();
            g.moveTo(11, 11); g.lineTo(17, 17);
            g.moveTo(17, 11); g.lineTo(11, 17);
            g.strokePath();
            g.fillStyle(0x6B4226);
            g.fillRect(2,  10, 2, 6);
            g.fillRect(24, 10, 2, 6);
            g.fillStyle(0x6B4226);
            g.fillRect(10, 20, 8, 3);
            g.fillStyle(0x6B4226);
            g.fillRect(6,  23, 16, 2);
            g.fillStyle(0x000000, 0.4);
            g.fillRect(0, 0, 28, 28);
            g.generateTexture('drone-death', 28, 28);
            g.destroy();
        }
    }

    _generateWalkerTextures() {
        // WALKER WALK (32x32) — steampunk mechanical automaton
        if (!this.textures.exists('walker-walk')) {
            let g = this.add.graphics();
            // ── Head (brass dome) ──
            g.fillStyle(0xCD7F32);
            g.fillRect(8,  1,  16, 2);
            g.fillStyle(0xB87333);
            g.fillCircle(16, 6, 7);
            // Head rivets
            g.fillStyle(0xDDDDDD);
            g.fillRect(10, 3, 1, 1);
            g.fillRect(21, 3, 1, 1);
            g.fillRect(15, 1, 1, 1);
            // ── Goggles (brass) ──
            g.fillStyle(0xDAA520);
            g.fillCircle(12, 7, 3);
            g.fillCircle(20, 7, 3);
            g.fillStyle(0x87CEEB);
            g.fillCircle(12, 7, 2);
            g.fillCircle(20, 7, 2);
            g.fillStyle(0x8B6914);
            g.fillRect(9,  7, 14, 1);
            // Glowing mechanical eyes
            g.fillStyle(0xFFAA00);
            g.fillRect(11, 6, 1, 1);
            g.fillRect(19, 6, 1, 1);
            // ── Jaw / ventilator grill ──
            g.fillStyle(0x8B5A2B);
            g.fillRect(8,  9,  3, 4);
            g.fillRect(21, 9,  3, 4);
            g.fillStyle(0x6B4226);
            g.fillRect(11, 9,  10, 4);
            // Vent slots
            g.fillStyle(0x4A2E1A);
            g.fillRect(12, 10, 2, 1);
            g.fillRect(15, 10, 2, 1);
            g.fillRect(18, 10, 2, 1);
            g.fillRect(12, 12, 2, 1);
            g.fillRect(15, 12, 2, 1);
            g.fillRect(18, 12, 2, 1);
            // ── Neck / joint ──
            g.fillStyle(0x888888);
            g.fillRect(14, 13, 4, 2);
            g.fillStyle(0x666666);
            g.fillRect(15, 13, 2, 2);
            // ── Torso (copper body) ──
            g.fillStyle(0xA0714B);
            g.fillRect(6,  15, 20, 12);
            g.fillStyle(0x8B5A2B);
            g.fillRect(8,  16, 16, 10);
            // Chest plate
            g.fillStyle(0xCD7F32);
            g.fillRect(10, 17, 12, 4);
            g.fillStyle(0xB87333);
            g.fillRect(12, 18, 8, 2);
            // Chest gear
            g.fillStyle(0xFFD700);
            g.fillCircle(16, 21, 3);
            g.fillStyle(0xB8860B);
            g.fillCircle(16, 21, 2);
            g.fillStyle(0x8B6914);
            g.fillCircle(16, 21, 1);
            // Gears on left side
            g.fillStyle(0xCD7F32);
            g.fillCircle(7, 19, 2);
            g.fillStyle(0xB87333);
            g.fillCircle(7, 19, 1);
            // Steam pipe (right side)
            g.fillStyle(0x6B4226);
            g.fillRect(24, 16, 3, 8);
            g.fillStyle(0x8B5A2B);
            g.fillRect(25, 16, 1, 8);
            // ── Arms (mechanical) ──
            g.fillStyle(0x8B5A2B);
            g.fillRect(2,  16, 4, 3);
            g.fillRect(26, 16, 4, 3);
            // Upper arms
            g.fillStyle(0xA0714B);
            g.fillRect(3,  19, 2, 5);
            g.fillRect(27, 19, 2, 5);
            // Elbow joints
            g.fillStyle(0x888888);
            g.fillCircle(4, 24, 2);
            g.fillCircle(28, 24, 2);
            // Forearms
            g.fillStyle(0x8B5A2B);
            g.fillRect(2,  25, 3, 3);
            g.fillRect(27, 25, 3, 3);
            // Pincer claws
            g.fillStyle(0x666666);
            g.fillRect(1,  28, 2, 2);
            g.fillRect(4,  28, 2, 2);
            g.fillRect(26, 28, 2, 2);
            g.fillRect(29, 28, 2, 2);
            // ── Legs (piston/mechanical) ──
            g.fillStyle(0x6B4226);
            g.fillRect(10, 27, 4, 2);
            g.fillRect(18, 27, 4, 2);
            // Upper legs
            g.fillStyle(0x8B5A2B);
            g.fillRect(9,  29, 4, 3);
            g.fillRect(19, 29, 4, 3);
            // Knee joints
            g.fillStyle(0x888888);
            g.fillCircle(11, 29, 1);
            g.fillCircle(21, 29, 1);
            // Lower legs
            g.fillStyle(0x6B4226);
            g.fillRect(9,  27, 4, 2);
            g.fillRect(19, 27, 4, 2);
            // Metal boots
            g.fillStyle(0x4A3E2E);
            g.fillRect(8,  29, 6, 3);
            g.fillRect(18, 29, 6, 3);
            g.fillStyle(0x5D4E37);
            g.fillRect(9,  30, 4, 1);
            g.fillRect(19, 30, 4, 1);
            // ── Body rivets ──
            g.fillStyle(0xBBBBBB);
            g.fillRect(8,  17, 1, 1);
            g.fillRect(23, 17, 1, 1);
            g.fillRect(8,  24, 1, 1);
            g.fillRect(23, 24, 1, 1);
            g.generateTexture('walker-walk', 32, 32);
            g.destroy();
        }

        // WALKER DEATH
        if (!this.textures.exists('walker-death')) {
            let g = this.add.graphics();
            // Head (darkened)
            g.fillStyle(0x8B6914);
            g.fillRect(8,  1,  16, 2);
            g.fillStyle(0x8B5A2B);
            g.fillCircle(16, 6, 7);
            g.fillStyle(0x888888);
            g.fillCircle(12, 7, 3);
            g.fillCircle(20, 7, 3);
            g.fillStyle(0x666666);
            g.fillCircle(12, 7, 2);
            g.fillCircle(20, 7, 2);
            g.fillStyle(0x8B6914);
            g.fillRect(9,  7, 14, 1);
            // X eyes
            g.lineStyle(2, 0xFF0000);
            g.beginPath();
            g.moveTo(10, 5); g.lineTo(14, 8);
            g.moveTo(14, 5); g.lineTo(10, 8);
            g.strokePath();
            g.beginPath();
            g.moveTo(18, 5); g.lineTo(22, 8);
            g.moveTo(22, 5); g.lineTo(18, 8);
            g.strokePath();
            g.fillStyle(0x6B4226);
            g.fillRect(8,  9,  3, 4);
            g.fillRect(21, 9,  3, 4);
            g.fillStyle(0x4A2E1A);
            g.fillRect(11, 9,  10, 4);
            g.fillStyle(0x666666);
            g.fillRect(14, 13, 4, 2);
            // Torso (darkened)
            g.fillStyle(0x7A4A2B);
            g.fillRect(6,  15, 20, 12);
            g.fillStyle(0x6B3A1B);
            g.fillRect(8,  16, 16, 10);
            g.fillStyle(0x8B6914);
            g.fillRect(10, 17, 12, 4);
            g.fillStyle(0x8B5A2B);
            g.fillCircle(7, 19, 2);
            g.fillStyle(0x4A2E1A);
            g.fillRect(24, 16, 3, 8);
            // Arms
            g.fillStyle(0x6B3A1B);
            g.fillRect(2,  16, 4, 3);
            g.fillRect(26, 16, 4, 3);
            g.fillStyle(0x7A4A2B);
            g.fillRect(3,  19, 2, 5);
            g.fillRect(27, 19, 2, 5);
            g.fillStyle(0x666666);
            g.fillCircle(4, 24, 2);
            g.fillCircle(28, 24, 2);
            g.fillStyle(0x6B3A1B);
            g.fillRect(2,  25, 3, 3);
            g.fillRect(27, 25, 3, 3);
            // Legs
            g.fillStyle(0x4A2E1A);
            g.fillRect(10, 27, 4, 2);
            g.fillRect(18, 27, 4, 2);
            g.fillStyle(0x6B3A1B);
            g.fillRect(9,  29, 4, 3);
            g.fillRect(19, 29, 4, 3);
            g.fillStyle(0x3E2A1A);
            g.fillRect(8,  29, 6, 3);
            g.fillRect(18, 29, 6, 3);
            // Dark overlay
            g.fillStyle(0x000000, 0.4);
            g.fillRect(0, 0, 32, 32);
            g.generateTexture('walker-death', 32, 32);
            g.destroy();
        }
    }

    _generateLaserTexture() {
        // Laser beam (8x80) — vertical glowing beam
        if (!this.textures.exists('laser-beam')) {
            let g = this.add.graphics();
            // Core beam
            g.fillStyle(0xFF4444, 0.9);
            g.fillRect(2, 0, 4, 80);
            // Inner glow (white)
            g.fillStyle(0xFFFFFF, 0.6);
            g.fillRect(3, 0, 2, 80);
            // Outer glow (red, wide)
            g.fillStyle(0xFF0000, 0.15);
            g.fillRect(0, 0, 8, 80);
            g.generateTexture('laser-beam', 8, 80);
            g.destroy();
        }

        // Laser glow ring / sensor cone (16x12) — small radar pulse
        if (!this.textures.exists('laser-cone')) {
            let g = this.add.graphics();
            g.fillStyle(0xFF0000, 0.3);
            g.fillTriangle(8, 0, 0, 12, 16, 12);
            g.fillStyle(0xFF4444, 0.2);
            g.fillTriangle(8, 2, 2, 12, 14, 12);
            g.fillStyle(0xFF8888, 0.1);
            g.fillTriangle(8, 4, 4, 12, 12, 12);
            g.generateTexture('laser-cone', 16, 12);
            g.destroy();
        }

        // Laser warning marker (8x8) — pulsing red dot
        if (!this.textures.exists('laser-warning')) {
            let g = this.add.graphics();
            g.fillStyle(0xFF0000, 0.8);
            g.fillCircle(4, 4, 4);
            g.fillStyle(0xFF6666, 0.6);
            g.fillCircle(4, 4, 2);
            g.fillStyle(0xFFFFFF, 0.4);
            g.fillCircle(4, 4, 1);
            g.generateTexture('laser-warning', 8, 8);
            g.destroy();
        }
    }

    // ── GROUND TILE (32x32) ──
    generateGroundTile() {
        const g = this.add.graphics();
        g.fillStyle(0x5D4E37);
        g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x6B5B45);
        g.fillRect(1, 1, 30, 6);
        g.fillStyle(0x7D6B53);
        g.fillRect(1, 1, 30, 2);
        // Brick lines
        g.fillStyle(0x4A3E2E);
        g.fillRect(0, 7,  32, 1);
        g.fillRect(0, 15, 32, 1);
        g.fillRect(0, 23, 32, 1);
        g.fillRect(7,  7,  1, 8);
        g.fillRect(15, 7,  1, 8);
        g.fillRect(23, 7,  1, 8);
        g.fillRect(3,  15, 1, 8);
        g.fillRect(11, 15, 1, 8);
        g.fillRect(19, 15, 1, 8);
        g.fillRect(27, 15, 1, 8);
        g.fillRect(7,  23, 1, 8);
        g.fillRect(15, 23, 1, 8);
        g.fillRect(23, 23, 1, 8);
        // Rivets
        g.fillStyle(0x999999);
        g.fillCircle(3,  3,  2);
        g.fillCircle(29, 3,  2);
        g.fillCircle(3,  29, 2);
        g.fillCircle(29, 29, 2);
        g.fillStyle(0xBBBBBB);
        g.fillCircle(3,  2,  1);
        g.fillCircle(29, 2,  1);
        g.fillCircle(3,  28, 1);
        g.fillCircle(29, 28, 1);
        g.generateTexture('ground-tile', 32, 32);
        g.destroy();
    }

    // ── BACKGROUND textures (800x450 each) ──
    generateBackgroundTextures() {
        this._genBgLevel1();
        this._genBgLevel2();
        this._genBgLevel3();
    }

    _genBgLevel1() {
        const g = this.add.graphics();
        const w = 800, h = 450;
        // Sky
        g.fillStyle(0x1A1A2E);
        g.fillRect(0, 0, w, h);
        // Stars
        g.fillStyle(0xFFFFFF, 0.6);
        const stars = [[50,40],[120,80],[200,25],[310,55],[400,30],[520,70],[610,20],[700,50]];
        stars.forEach(([x,y]) => g.fillRect(x, y, 1, 1));
        g.fillStyle(0xFFFFFF, 0.9);
        [[250,40],[550,30],[680,65]].forEach(([x,y]) => g.fillRect(x, y, 2, 2));
        // Building silhouettes
        g.fillStyle(0x121226);
        const buildings = [
            [0,60,80],[60,30,120],[90,50,60],[140,40,100],[180,60,70],
            [240,35,130],[275,70,90],[345,45,60],[390,55,110],[445,40,75],
            [485,60,95],[545,30,130],[575,50,85],[625,65,100],[690,35,70],[725,75,110]
        ];
        buildings.forEach(([x, ww, bh]) => g.fillRect(x, h - bh, ww, bh));
        // Window lights
        g.fillStyle(0xFFDD77, 0.3);
        [[30,400],[45,410],[100,370],[200,410],[260,360],[290,380],[400,380],[500,390],[640,380],[740,380]]
            .forEach(([x,y]) => g.fillRect(x, y, 3, 3));
        g.generateTexture('bg-level1', w, h);
        g.destroy();
    }

    _genBgLevel2() {
        const g = this.add.graphics();
        const w = 800, h = 450;
        g.fillStyle(0x1A1A3E);
        g.fillRect(0, 0, w, h);
        // Fog
        g.fillStyle(0x222244, 0.3);
        g.fillEllipse(100, 300, 120, 30);
        g.fillEllipse(300, 280, 160, 25);
        g.fillEllipse(550, 310, 140, 35);
        // Buildings
        g.fillStyle(0x111130);
        const b = [[-10,70,180],[55,45,220],[100,60,160],[155,40,250],[195,80,190],
            [270,50,230],[315,75,175],[385,55,210],[435,65,185],[495,45,260],
            [540,70,200],[605,50,240],[650,80,170],[725,45,220],[770,50,190]];
        b.forEach(([x, ww, bh]) => g.fillRect(x, h - bh, ww, bh));
        // Pipes
        g.fillStyle(0x0E0E2E);
        [[70,230,6,220],[170,200,8,250],[320,215,5,235],[450,190,7,260],[560,210,6,240],[700,225,8,225]]
            .forEach(([x,y,ww,bh]) => g.fillRect(x, y, ww, bh));
        // Glow
        g.fillStyle(0xFF6600, 0.1);
        g.fillRect(0, h - 20, w, 20);
        g.generateTexture('bg-level2', w, h);
        g.destroy();
    }

    _genBgLevel3() {
        const g = this.add.graphics();
        const w = 800, h = 450;
        g.fillStyle(0x1A0A1E);
        g.fillRect(0, 0, w, h);
        // Orange glow at bottom
        for (let i = 0; i < 120; i++) {
            const t = i / 120;
            const r = Math.floor(0xFF * (1 - t * 0.5));
            const gr = Math.floor(0x44 * (1 - t));
            const color = (r << 16) | (gr << 8);
            g.fillStyle(color, (1 - t) * 0.4);
            g.fillRect(0, h - 120 + i, w, 1);
        }
        // Silhouettes
        g.fillStyle(0x0E0510);
        g.fillRect(0, h - 200, 120, 200);
        g.fillRect(600, h - 220, 200, 220);
        g.fillStyle(0x100412);
        g.fillRect(120, h - 60, 520, 8);
        g.fillRect(240, h - 130, 8, 80);
        g.fillRect(380, h - 110, 6, 60);
        // Windows
        g.fillStyle(0xFF6611, 0.5);
        [[40,270,8,10],[60,270,8,10],[40,295,8,10],[650,250,10,12],[680,250,10,12],[710,250,10,12]]
            .forEach(([x,y,ww,bh]) => g.fillRect(x, y, ww, bh));
        g.generateTexture('bg-level3', w, h);
        g.destroy();
    }

    // ── Character drawing helper (extracted from generatePlayerTextures) ──
    _drawChar(g, armY, legOffset, extra) {
        // Boots
        g.fillStyle(0x654321);
        g.fillRect(9,  24, 5, 6);
        g.fillRect(18, 24, 5, 6);
        // Legs
        g.fillStyle(0x5C4033);
        g.fillRect(9,  20, 5, 4 + legOffset);
        g.fillRect(18, 20, 5, 4 - legOffset);
        // Body
        g.fillStyle(0x8B4513);
        g.fillRect(8,  12, 16, 10);
        // Belt
        g.fillStyle(0x654321);
        g.fillRect(8,  18, 16, 2);
        g.fillStyle(0xFFD700);
        g.fillRect(14, 18, 4, 2);
        // Arms
        g.fillStyle(0x8B4513);
        g.fillRect(4,  12 + armY, 4, 10);
        g.fillRect(24, 12 - armY, 4, 10);
        // Hands
        g.fillStyle(0xFFDBB4);
        g.fillRect(4,  20 + armY, 4, 3);
        g.fillRect(24, 20 - armY, 4, 3);
        // Head
        g.fillStyle(0xFFDBB4);
        g.fillCircle(16, 8, 6);
        // Hat
        g.fillStyle(0x3E2723);
        g.fillRect(8,  1, 16, 4);
        g.fillRect(6,  4, 20, 2);
        // Goggles
        g.fillStyle(0xFFD700);
        g.fillCircle(12, 8, 3);
        g.fillCircle(20, 8, 3);
        g.fillStyle(0x87CEEB);
        g.fillCircle(12, 8, 2);
        g.fillCircle(20, 8, 2);
        g.fillStyle(0x3E2723);
        g.fillRect(10, 7, 12, 1);
        // Scarf
        g.fillStyle(0xCC3333);
        g.fillRect(8,  10, 16, 3);
        g.fillRect(24, 11, 4, 4);
        // Eyes
        g.fillStyle(0x000000);
        g.fillRect(11, 7, 1, 1);
        g.fillRect(19, 7, 1, 1);
        // Mouth
        g.fillStyle(0xCC6666);
        g.fillRect(14, 11, 4, 1);
        // Extra features (for hurt state, etc.)
        if (extra) extra(g);
    }

    // ── Generate individual frame textures from draw callbacks ──
    _generateAnimationFrames(baseKey, frameWidth, frameHeight, drawFns) {
        const frames = [];
        drawFns.forEach((drawFn, i) => {
            const g = this.add.graphics();
            drawFn(g);
            const key = `${baseKey}-${i}`;
            g.generateTexture(key, frameWidth, frameHeight);
            g.destroy();
            frames.push({ key });
        });
        return frames;
    }

    // ── Safe animation creation (removes existing key first) ──
    _createAnim(key, config) {
        if (this.anims.exists(key)) this.anims.remove(key);
        this.anims.create({ key, ...config });
    }

    // ── Walker body drawing with per-frame leg/arm offsets ──
    _drawWalkerBody(g, legLeftDx, legRightDx, armLeftDx, armRightDx) {
        // ── Head (brass dome) ──
        g.fillStyle(0xCD7F32);
        g.fillRect(8,  1,  16, 2);
        g.fillStyle(0xB87333);
        g.fillCircle(16, 6, 7);
        // Head rivets
        g.fillStyle(0xDDDDDD);
        g.fillRect(10, 3, 1, 1);
        g.fillRect(21, 3, 1, 1);
        g.fillRect(15, 1, 1, 1);
        // ── Goggles (brass) ──
        g.fillStyle(0xDAA520);
        g.fillCircle(12, 7, 3);
        g.fillCircle(20, 7, 3);
        g.fillStyle(0x87CEEB);
        g.fillCircle(12, 7, 2);
        g.fillCircle(20, 7, 2);
        g.fillStyle(0x8B6914);
        g.fillRect(9,  7, 14, 1);
        // Glowing mechanical eyes
        g.fillStyle(0xFFAA00);
        g.fillRect(11, 6, 1, 1);
        g.fillRect(19, 6, 1, 1);
        // ── Jaw / ventilator grill ──
        g.fillStyle(0x8B5A2B);
        g.fillRect(8,  9,  3, 4);
        g.fillRect(21, 9,  3, 4);
        g.fillStyle(0x6B4226);
        g.fillRect(11, 9,  10, 4);
        // Vent slots
        g.fillStyle(0x4A2E1A);
        g.fillRect(12, 10, 2, 1);
        g.fillRect(15, 10, 2, 1);
        g.fillRect(18, 10, 2, 1);
        g.fillRect(12, 12, 2, 1);
        g.fillRect(15, 12, 2, 1);
        g.fillRect(18, 12, 2, 1);
        // ── Neck / joint ──
        g.fillStyle(0x888888);
        g.fillRect(14, 13, 4, 2);
        g.fillStyle(0x666666);
        g.fillRect(15, 13, 2, 2);
        // ── Torso (copper body) ──
        g.fillStyle(0xA0714B);
        g.fillRect(6,  15, 20, 12);
        g.fillStyle(0x8B5A2B);
        g.fillRect(8,  16, 16, 10);
        // Chest plate
        g.fillStyle(0xCD7F32);
        g.fillRect(10, 17, 12, 4);
        g.fillStyle(0xB87333);
        g.fillRect(12, 18, 8, 2);
        // Chest gear
        g.fillStyle(0xFFD700);
        g.fillCircle(16, 21, 3);
        g.fillStyle(0xB8860B);
        g.fillCircle(16, 21, 2);
        g.fillStyle(0x8B6914);
        g.fillCircle(16, 21, 1);
        // Gears on left side
        g.fillStyle(0xCD7F32);
        g.fillCircle(7, 19, 2);
        g.fillStyle(0xB87333);
        g.fillCircle(7, 19, 1);
        // Steam pipe (right side)
        g.fillStyle(0x6B4226);
        g.fillRect(24, 16, 3, 8);
        g.fillStyle(0x8B5A2B);
        g.fillRect(25, 16, 1, 8);
        // ── Arms (mechanical) ──
        g.fillStyle(0x8B5A2B);
        g.fillRect(2 + armLeftDx,  16, 4, 3);
        g.fillRect(26 + armRightDx, 16, 4, 3);
        // Upper arms
        g.fillStyle(0xA0714B);
        g.fillRect(3 + armLeftDx,  19, 2, 5);
        g.fillRect(27 + armRightDx, 19, 2, 5);
        // Elbow joints
        g.fillStyle(0x888888);
        g.fillCircle(4 + armLeftDx, 24, 2);
        g.fillCircle(28 + armRightDx, 24, 2);
        // Forearms
        g.fillStyle(0x8B5A2B);
        g.fillRect(2 + armLeftDx,  25, 3, 3);
        g.fillRect(27 + armRightDx, 25, 3, 3);
        // Pincer claws
        g.fillStyle(0x666666);
        g.fillRect(1 + armLeftDx,  28, 2, 2);
        g.fillRect(4 + armLeftDx,  28, 2, 2);
        g.fillRect(26 + armRightDx, 28, 2, 2);
        g.fillRect(29 + armRightDx, 28, 2, 2);
        // ── Legs (piston/mechanical) ──
        g.fillStyle(0x6B4226);
        g.fillRect(10 + legLeftDx, 27, 4, 2);
        g.fillRect(18 + legRightDx, 27, 4, 2);
        // Upper legs
        g.fillStyle(0x8B5A2B);
        g.fillRect(9 + legLeftDx,  29, 4, 3);
        g.fillRect(19 + legRightDx, 29, 4, 3);
        // Knee joints
        g.fillStyle(0x888888);
        g.fillCircle(11 + legLeftDx, 29, 1);
        g.fillCircle(21 + legRightDx, 29, 1);
        // Lower legs
        g.fillStyle(0x6B4226);
        g.fillRect(9 + legLeftDx,  27, 4, 2);
        g.fillRect(19 + legRightDx, 27, 4, 2);
        // Metal boots
        g.fillStyle(0x4A3E2E);
        g.fillRect(8 + legLeftDx,  29, 6, 3);
        g.fillRect(18 + legRightDx, 29, 6, 3);
        g.fillStyle(0x5D4E37);
        g.fillRect(9 + legLeftDx,  30, 4, 1);
        g.fillRect(19 + legRightDx, 30, 4, 1);
        // ── Body rivets ──
        g.fillStyle(0xBBBBBB);
        g.fillRect(8,  17, 1, 1);
        g.fillRect(23, 17, 1, 1);
        g.fillRect(8,  24, 1, 1);
        g.fillRect(23, 24, 1, 1);
    }

    // ── Drone frame drawing (0=normal, 1=blur prop) ──
    _drawDroneFrame(g, frameIndex) {
        // Propeller shaft
        g.fillStyle(0x888888);
        g.fillRect(13, 0, 2, 4);
        // Propeller blades (brass)
        g.fillStyle(0xCD7F32);
        g.fillRect(2,  1, 10, 2);
        g.fillRect(16, 1, 10, 2);
        g.fillRect(12, 1, 4,  2);
        // Propeller blur (wider for frame 1)
        if (frameIndex === 0) {
            g.fillStyle(0xAA6B2E, 0.4);
            g.fillRect(1,  1, 26, 2);
        } else {
            g.fillStyle(0xAA6B2E, 0.5);
            g.fillRect(0,  0, 28, 3);
            g.fillStyle(0xFFFFFF, 0.15);
            g.fillRect(0,  1, 28, 2);
        }
        // Upper dome (brass)
        g.fillStyle(0xB87333);
        g.fillRect(5,  4,  18, 4);
        g.fillStyle(0xCD7F32);
        g.fillRect(7,  5,  14, 2);
        // Body casing (copper)
        g.fillStyle(0x8B5A2B);
        g.fillRect(4,  8,  20, 12);
        g.fillStyle(0xA0714B);
        g.fillRect(6,  9,  16, 10);
        // Central gear
        g.fillStyle(0xFFD700);
        g.fillCircle(14, 14, 4);
        g.fillStyle(0xB8860B);
        g.fillCircle(14, 14, 3);
        // Gear teeth
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
            const tx = 14 + Math.cos(angle) * 4;
            const ty = 14 + Math.sin(angle) * 4;
            g.fillStyle(0xFFD700);
            g.fillRect(tx - 1, ty - 1, 2, 2);
        }
        // Mechanical eye (amber glow)
        g.fillStyle(0xFFAA00);
        g.fillCircle(14, 14, 2);
        g.fillStyle(0xFFDD44);
        g.fillCircle(14, 14, 1);
        // Steam pipes (sides)
        g.fillStyle(0x6B4226);
        g.fillRect(2,  10, 2, 6);
        g.fillRect(24, 10, 2, 6);
        // Pipe rivets
        g.fillStyle(0x999999);
        g.fillRect(2, 10, 2, 1);
        g.fillRect(2, 15, 2, 1);
        g.fillRect(24,10, 2, 1);
        g.fillRect(24,15, 2, 1);
        // Steam vent (bottom)
        g.fillStyle(0x6B4226);
        g.fillRect(10, 20, 8, 3);
        g.fillStyle(0x8B5A2B);
        g.fillRect(11, 21, 6, 1);
        // Rivets on body
        g.fillStyle(0xBBBBBB);
        g.fillRect(8,  10, 1, 1);
        g.fillRect(19, 10, 1, 1);
        g.fillRect(8,  18, 1, 1);
        g.fillRect(19, 18, 1, 1);
        // Bottom fin
        g.fillStyle(0x8B5A2B);
        g.fillRect(6,  23, 16, 2);
        g.fillStyle(0xA0714B);
        g.fillRect(8,  23, 12, 1);
    }

    // ── Coin frame drawing with rotated notch positions ──
    _drawCoinFrame(g, angleIndex) {
        // Outer ring
        g.fillStyle(0xFFD700);
        g.fillCircle(8, 8, 7);
        g.fillStyle(0xDAA520);
        g.fillCircle(8, 8, 5);
        // Inner
        g.fillStyle(0xB8860B);
        g.fillCircle(8, 8, 4);
        // Notches (varies per angle to suggest rotation)
        g.fillStyle(0xFFD700);
        const notchSets = [
            // angle 0: cardinal directions
            [[6,0,4,2],[6,14,4,2],[0,6,2,4],[14,6,2,4],[1,1,2,2],[13,1,2,2],[1,13,2,2],[13,13,2,2]],
            // angle 1: ~22deg rotated
            [[5,1,6,1],[5,14,6,1],[1,5,1,6],[14,5,1,6],[0,2,2,2],[14,2,2,2],[0,12,2,2],[14,12,2,2]],
            // angle 2: ~45deg rotated
            [[7,0,2,4],[7,12,2,4],[0,7,4,2],[12,7,4,2],[2,2,2,2],[12,2,2,2],[2,12,2,2],[12,12,2,2]],
            // angle 3: ~67deg rotated
            [[7,1,6,1],[7,14,6,1],[1,7,1,6],[14,7,1,6],[0,2,2,2],[14,2,2,2],[0,12,2,2],[14,12,2,2]],
        ];
        notchSets[angleIndex % 4].forEach(([x,y,w,h]) => g.fillRect(x, y, w, h));
        // Center hole
        g.fillStyle(0x1A1A2E);
        g.fillCircle(8, 8, 2);
        // Highlight (moves around to suggest rotation)
        const highlights = [[7,6],[10,6],[9,10],[6,9]];
        g.fillStyle(0xFFFFAA, 0.4);
        g.fillCircle(highlights[angleIndex % 4][0], highlights[angleIndex % 4][1], 2);
    }

    // ── Register all animations ──
    createAnimations() {
        // ── Player Animations ──
        // Idle (2 frames: slight breathing)
        this._generateAnimationFrames('player-idle-anim', 32, 32, [
            (g) => this._drawChar(g, 0, 0),
            (g) => this._drawChar(g, 0, 1),
        ]);
        this._createAnim('player-idle-anim', {
            frames: [
                { key: 'player-idle-anim-0' },
                { key: 'player-idle-anim-1' },
            ],
            frameRate: 4, repeat: -1
        });

        // Run (4 frames: walk cycle)
        this._generateAnimationFrames('player-run-anim', 32, 32, [
            (g) => this._drawChar(g, -1, 2),
            (g) => this._drawChar(g, 0, 0),
            (g) => this._drawChar(g, 1, -2),
            (g) => this._drawChar(g, 0, 0),
        ]);
        this._createAnim('player-run-anim', {
            frames: [
                { key: 'player-run-anim-0' },
                { key: 'player-run-anim-1' },
                { key: 'player-run-anim-2' },
                { key: 'player-run-anim-3' },
            ],
            frameRate: 8, repeat: -1
        });

        // Jump (2 frames)
        this._generateAnimationFrames('player-jump-anim', 32, 32, [
            (g) => this._drawChar(g, -2, -1),
            (g) => this._drawChar(g, -1, 0),
        ]);
        this._createAnim('player-jump-anim', {
            frames: [
                { key: 'player-jump-anim-0' },
                { key: 'player-jump-anim-1' },
            ],
            frameRate: 6, repeat: -1
        });

        // Fall (1 frame — reuse existing 'player-fall' texture)
        this._createAnim('player-fall-anim', {
            frames: [{ key: 'player-fall' }],
            frameRate: 1, repeat: -1
        });

        // Hurt (1 frame — reuse existing 'player-hurt' texture)
        this._createAnim('player-hurt-anim', {
            frames: [{ key: 'player-hurt' }],
            frameRate: 1, repeat: -1
        });

        // ── Walker Animations ──
        // Walk (4 frames with leg/arm offsets)
        this._generateAnimationFrames('walker-walk-anim', 32, 32, [
            (g) => this._drawWalkerBody(g, -1, 1, 1, -1),
            (g) => this._drawWalkerBody(g, 0, 0, 0, 0),
            (g) => this._drawWalkerBody(g, 1, -1, -1, 1),
            (g) => this._drawWalkerBody(g, 0, 0, 0, 0),
        ]);
        this._createAnim('walker-walk-anim', {
            frames: [
                { key: 'walker-walk-anim-0' },
                { key: 'walker-walk-anim-1' },
                { key: 'walker-walk-anim-2' },
                { key: 'walker-walk-anim-3' },
            ],
            frameRate: 6, repeat: -1
        });

        // Death (1 frame — reuse existing 'walker-death' texture)
        this._createAnim('walker-death-anim', {
            frames: [{ key: 'walker-death' }],
            frameRate: 1, repeat: -1
        });

        // ── Drone Animations ──
        // Fly (2 frames: propeller blur variation)
        this._generateAnimationFrames('drone-fly-anim', 28, 28, [
            (g) => this._drawDroneFrame(g, 0),
            (g) => this._drawDroneFrame(g, 1),
        ]);
        this._createAnim('drone-fly-anim', {
            frames: [
                { key: 'drone-fly-anim-0' },
                { key: 'drone-fly-anim-1' },
            ],
            frameRate: 6, repeat: -1
        });

        // Death (1 frame — reuse existing 'drone-death' texture)
        this._createAnim('drone-death-anim', {
            frames: [{ key: 'drone-death' }],
            frameRate: 1, repeat: -1
        });

        // ── Coin Animations ──
        // Spin (4 frames)
        this._generateAnimationFrames('coin-spin-anim', 16, 16, [
            (g) => this._drawCoinFrame(g, 0),
            (g) => this._drawCoinFrame(g, 1),
            (g) => this._drawCoinFrame(g, 2),
            (g) => this._drawCoinFrame(g, 3),
        ]);
        this._createAnim('coin-spin-anim', {
            frames: [
                { key: 'coin-spin-anim-0' },
                { key: 'coin-spin-anim-1' },
                { key: 'coin-spin-anim-2' },
                { key: 'coin-spin-anim-3' },
            ],
            frameRate: 8, repeat: -1
        });
    }
}
