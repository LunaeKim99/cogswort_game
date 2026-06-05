// BootScene - generates all textures programmatically
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    create() {
        // Show loading text
        this.add.text(400, 225, 'GENERATING ASSETS...', {
            fontSize: '20px', fontFamily: 'monospace', color: '#ffffff'
        }).setOrigin(0.5);

        // Generate all procedural textures
        this.generatePlayerTextures();
        this.generateEnemyTextures();
        this.generateCoinTexture();
        this.generateHeartTextures();
        this.generateParticleTexture();
        this.generateButtonTextures();
        this.generatePauseButtonTexture();
        this.generateGateTextures();
        this.generateObstacleTextures();
        this.generateNewEntityTextures();
        this.generateGroundTile();
        this.generateBackgroundTextures();

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
        // Base character builder
        const drawChar = (g, armY, legOffset, extra) => {
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
        };

        // IDLE
        let g = this.add.graphics();
        drawChar(g, 0, 0);
        g.generateTexture('player-idle', 32, 32);
        g.destroy();

        // RUN (legs apart, arms swinging)
        g = this.add.graphics();
        drawChar(g, -1, 2);
        g.generateTexture('player-run', 32, 32);
        g.destroy();

        // JUMP (arms up, legs tucked)
        g = this.add.graphics();
        drawChar(g, -2, -1);
        g.generateTexture('player-jump', 32, 32);
        g.destroy();

        // FALL (arms down, legs spread)
        g = this.add.graphics();
        drawChar(g, 1, 1);
        g.generateTexture('player-fall', 32, 32);
        g.destroy();

        // HURT (red-tinted)
        g = this.add.graphics();
        drawChar(g, 0, 0, (gfx) => {
            gfx.fillStyle(0xFF0000, 0.3);
            gfx.fillRect(0, 0, 32, 32);
        });
        g.generateTexture('player-hurt', 32, 32);
        g.destroy();
    }

    // ── ENEMY textures (28x28 each) ──
    generateEnemyTextures() {
        // WALK
        let g = this.add.graphics();
        // Antenna
        g.fillStyle(0x888888);
        g.fillRect(13, 1, 2, 5);
        g.fillStyle(0xFFD700);
        g.fillCircle(14, 1, 2);
        // Propeller
        g.fillStyle(0x777777);
        g.fillRect(12, 4, 4, 3);
        g.fillStyle(0xAAAAAA);
        g.fillRect(4,  4, 8,  1);
        g.fillRect(16, 4, 8,  1);
        g.fillRect(12, 2, 4,  1);
        g.fillRect(12, 6, 4,  1);
        // Body
        g.fillStyle(0x555555);
        g.fillRect(6,  8,  16, 12);
        g.fillStyle(0x444444);
        g.fillRect(6,  11, 16, 1);
        g.fillRect(6,  15, 16, 1);
        // Side panels
        g.fillStyle(0x666666);
        g.fillRect(4,  10, 2,  6);
        g.fillRect(22, 10, 2,  6);
        // Eye
        g.fillStyle(0xFF0000);
        g.fillCircle(14, 13, 3);
        g.fillStyle(0xFF4444);
        g.fillCircle(14, 13, 2);
        g.fillStyle(0xFF8888);
        g.fillCircle(14, 13, 1);
        // Propeller blur
        g.fillStyle(0xCCCCCC);
        g.fillRect(2,  5, 24, 1);
        // Fins
        g.fillStyle(0x666666);
        g.fillRect(9,  20, 2,  4);
        g.fillRect(17, 20, 2,  4);
        // Rivets
        g.fillStyle(0x999999);
        g.fillRect(8,  9,  1,  1);
        g.fillRect(19, 9,  1,  1);
        g.fillRect(8,  17, 1,  1);
        g.fillRect(19, 17, 1,  1);
        g.generateTexture('enemy-walk', 28, 28);
        g.destroy();

        // DEATH (X eyes, dark)
        g = this.add.graphics();
        // Same body
        g.fillStyle(0x888888);
        g.fillRect(13, 1, 2, 5);
        g.fillStyle(0x777777);
        g.fillRect(12, 4, 4, 3);
        g.fillStyle(0xAAAAAA);
        g.fillRect(4,  4, 8,  1);
        g.fillRect(16, 4, 8,  1);
        g.fillStyle(0x555555);
        g.fillRect(6,  8,  16, 12);
        g.fillStyle(0x444444);
        g.fillRect(6,  11, 16, 1);
        g.fillRect(6,  15, 16, 1);
        g.fillStyle(0x666666);
        g.fillRect(4,  10, 2,  6);
        g.fillRect(22, 10, 2,  6);
        // X eyes
        g.lineStyle(2, 0xFF0000);
        g.beginPath();
        g.moveTo(11, 11); g.lineTo(17, 15);
        g.moveTo(17, 11); g.lineTo(11, 15);
        g.strokePath();
        // Dark overlay
        g.fillStyle(0x000000, 0.4);
        g.fillRect(0, 0, 28, 28);
        g.generateTexture('enemy-death', 28, 28);
        g.destroy();
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

        // SPIKE (static hazard, 20x24)
        g = this.add.graphics();
        g.fillStyle(0xCC3333);
        g.fillTriangle(10, 0, 0, 24, 20, 24);
        g.fillStyle(0xFF5555);
        g.fillTriangle(10, 4, 4, 24, 16, 24);
        g.fillStyle(0xAA2222);
        g.fillRect(0, 22, 20, 2);
        g.generateTexture('spike', 20, 24);
        g.destroy();
    }

    // ── NEW ENTITY textures (drone, walker, laser beam) ──
    generateNewEntityTextures() {
        this._generateDroneTexture();
        this._generateWalkerTextures();
        this._generateLaserTexture();
    }

    _generateDroneTexture() {
        // DRONE (28x28) — flying scanner drone with sensor ring
        let g = this.add.graphics();
        // Antenna / sensor mast
        g.fillStyle(0x888888);
        g.fillRect(13, 0, 2, 6);
        // Sensor disc (top)
        g.fillStyle(0xFFD700);
        g.fillCircle(14, 2, 4);
        g.fillStyle(0xFFAA00);
        g.fillCircle(14, 2, 2);
        g.fillStyle(0xFFFFFF);
        g.fillCircle(14, 2, 1);
        // Rotor disc
        g.fillStyle(0x666666);
        g.fillRect(4,  4,  20, 3);
        g.fillStyle(0x888888);
        g.fillRect(6,  5,  16, 1);
        // Body (angular, disc-like)
        g.fillStyle(0x444466);
        g.fillRect(5,  7,  18, 14);
        g.fillStyle(0x555577);
        g.fillRect(7,  8,  14, 12);
        // Sensor ring (glowing)
        g.lineStyle(2, 0xFF4444);
        g.strokeCircle(14, 14, 6);
        g.lineStyle(1, 0xFF8888);
        g.strokeCircle(14, 14, 7);
        // Central eye
        g.fillStyle(0xFF0000);
        g.fillCircle(14, 14, 4);
        g.fillStyle(0xFF4444);
        g.fillCircle(14, 14, 2);
        g.fillStyle(0xFF8888);
        g.fillCircle(14, 14, 1);
        // Thruster glow (bottom)
        g.fillStyle(0xFF6600, 0.6);
        g.fillRect(10, 22, 8, 3);
        g.fillStyle(0xFFAA00, 0.3);
        g.fillRect(8,  23, 12, 2);
        // Side fins
        g.fillStyle(0x555577);
        g.fillRect(2,  10, 3,  6);
        g.fillRect(23, 10, 3,  6);
        g.generateTexture('drone', 28, 28);
        g.destroy();

        // DRONE DEATH (X eye, dark)
        g = this.add.graphics();
        g.fillStyle(0x888888);
        g.fillRect(13, 0, 2, 6);
        g.fillStyle(0x666666);
        g.fillRect(4,  4,  20, 3);
        g.fillStyle(0x444466);
        g.fillRect(5,  7,  18, 14);
        g.fillStyle(0x555577);
        g.fillRect(7,  8,  14, 12);
        g.lineStyle(2, 0x660000);
        g.strokeCircle(14, 14, 6);
        g.fillStyle(0x333333);
        g.fillCircle(14, 14, 4);
        // X eye
        g.lineStyle(2, 0xFF0000);
        g.beginPath();
        g.moveTo(11, 11); g.lineTo(17, 17);
        g.moveTo(17, 11); g.lineTo(11, 17);
        g.strokePath();
        g.fillStyle(0x000000, 0.4);
        g.fillRect(0, 0, 28, 28);
        g.generateTexture('drone-death', 28, 28);
        g.destroy();
    }

    _generateWalkerTextures() {
        // WALKER WALK (32x32) — humanoid steampunk robot
        let g = this.add.graphics();
        // ── Hat ──
        g.fillStyle(0x3E2723);
        g.fillRect(8,  0,  16, 4);
        g.fillRect(6,  3,  20, 2);
        // ── Head ──
        g.fillStyle(0xFFDBB4);  // skin tone face
        g.fillCircle(16, 9, 6);
        // Goggles
        g.fillStyle(0xFFD700);
        g.fillCircle(12, 8, 3);
        g.fillCircle(20, 8, 3);
        g.fillStyle(0x87CEEB);
        g.fillCircle(12, 8, 2);
        g.fillCircle(20, 8, 2);
        g.fillStyle(0x3E2723);
        g.fillRect(10, 7, 12, 1);
        // Eyes (angry red)
        g.fillStyle(0xFF0000);
        g.fillRect(11, 7, 1, 1);
        g.fillRect(19, 7, 1, 1);
        // ── Scarf ──
        g.fillStyle(0xCC3333);
        g.fillRect(8,  11, 16, 2);
        g.fillRect(22, 12, 3, 4);
        // ── Body / Torso ──
        g.fillStyle(0x5C4033);
        g.fillRect(8,  13, 16, 10);
        // Belt
        g.fillStyle(0x654321);
        g.fillRect(8,  19, 16, 2);
        g.fillStyle(0xFFD700);
        g.fillRect(14, 19, 4, 2);
        // Coat
        g.fillStyle(0x4A3E2E);
        g.fillRect(6,  13, 2,  8);
        g.fillRect(24, 13, 2,  8);
        // ── Arms ──
        g.fillStyle(0x5C4033);
        g.fillRect(4,  13, 2,  8);
        g.fillRect(26, 13, 2,  8);
        // Hands
        g.fillStyle(0xFFDBB4);
        g.fillRect(4,  19, 2, 3);
        g.fillRect(26, 19, 2, 3);
        // ── Legs ──
        g.fillStyle(0x3E2723);
        g.fillRect(10, 23, 4, 6);
        g.fillRect(18, 23, 4, 6);
        // Boots
        g.fillStyle(0x654321);
        g.fillRect(9,  27, 6, 4);
        g.fillRect(17, 27, 6, 4);
        // ── Gear decoration ──
        g.fillStyle(0xFFD700, 0.3);
        g.fillCircle(16, 16, 3);
        g.fillStyle(0xFFD700, 0.5);
        g.fillCircle(16, 16, 1);
        // Rivets on coat
        g.fillStyle(0x999999);
        g.fillRect(8,  15, 1, 1);
        g.fillRect(23, 15, 1, 1);
        g.generateTexture('walker-walk', 32, 32);
        g.destroy();

        // WALKER DEATH
        g = this.add.graphics();
        g.fillStyle(0x3E2723);
        g.fillRect(8,  0,  16, 4);
        g.fillRect(6,  3,  20, 2);
        g.fillStyle(0xCC9988);
        g.fillCircle(16, 9, 6);
        g.fillStyle(0x888888);
        g.fillCircle(12, 8, 3);
        g.fillCircle(20, 8, 3);
        g.fillStyle(0x666666);
        g.fillCircle(12, 8, 2);
        g.fillCircle(20, 8, 2);
        g.fillStyle(0x3E2723);
        g.fillRect(10, 7, 12, 1);
        // X eyes
        g.lineStyle(2, 0xFF0000);
        g.beginPath();
        g.moveTo(11, 6);  g.lineTo(17, 10);
        g.moveTo(17, 6);  g.lineTo(11, 10);
        g.strokePath();
        g.fillStyle(0xCC3333);
        g.fillRect(8,  11, 16, 2);
        g.fillRect(22, 12, 3, 4);
        g.fillStyle(0x5C4033);
        g.fillRect(8,  13, 16, 10);
        g.fillStyle(0x654321);
        g.fillRect(8,  19, 16, 2);
        g.fillStyle(0x4A3E2E);
        g.fillRect(6,  13, 2,  8);
        g.fillRect(24, 13, 2,  8);
        g.fillStyle(0x5C4033);
        g.fillRect(4,  13, 2,  8);
        g.fillRect(26, 13, 2,  8);
        g.fillStyle(0x3E2723);
        g.fillRect(10, 23, 4, 6);
        g.fillRect(18, 23, 4, 6);
        g.fillStyle(0x654321);
        g.fillRect(9,  27, 6, 4);
        g.fillRect(17, 27, 6, 4);
        // Dark overlay
        g.fillStyle(0x000000, 0.4);
        g.fillRect(0, 0, 32, 32);
        g.generateTexture('walker-death', 32, 32);
        g.destroy();
    }

    _generateLaserTexture() {
        // Laser beam (8x80) — vertical glowing beam
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

        // Laser glow ring / sensor cone (16x12) — small radar pulse
        g = this.add.graphics();
        g.fillStyle(0xFF0000, 0.3);
        g.fillTriangle(8, 0, 0, 12, 16, 12);
        g.fillStyle(0xFF4444, 0.2);
        g.fillTriangle(8, 2, 2, 12, 14, 12);
        g.fillStyle(0xFF8888, 0.1);
        g.fillTriangle(8, 4, 4, 12, 12, 12);
        g.generateTexture('laser-cone', 16, 12);
        g.destroy();

        // Laser warning marker (8x8) — pulsing red dot
        g = this.add.graphics();
        g.fillStyle(0xFF0000, 0.8);
        g.fillCircle(4, 4, 4);
        g.fillStyle(0xFF6666, 0.6);
        g.fillCircle(4, 4, 2);
        g.fillStyle(0xFFFFFF, 0.4);
        g.fillCircle(4, 4, 1);
        g.generateTexture('laser-warning', 8, 8);
        g.destroy();
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
}
