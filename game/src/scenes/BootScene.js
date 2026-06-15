// BootScene - generates all textures programmatically
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.add.text(w / 2, h / 2, 'GENERATING ASSETS...', {
            fontSize: '20px', fontFamily: 'monospace', color: '#ffffff'
        }).setOrigin(0.5);
    }

    create() {
        this.generatePlayerTextures();
        this.generateCoinTexture();
        this.generateHeartTextures();
        this.generateParticleTexture();
        this.generateButtonTextures();
        this.generatePauseButtonTexture();
        this.generateGateTextures();
        this.generateObstacleTextures();
        this._generateDroneTexture();
        this._generateWalkerTextures();
        this._generateLaserTexture();
        this.generateGroundTile();
        this.generateBackgroundTextures();

        // Generate 16-bit pixel art textures
        this.generatePixelArtTextures();

        // Always register animations
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

        // IDLE
        let g = this.add.graphics();
        this._drawChar(g, 0, 0);
        g.generateTexture('player-idle', 32, 32);
        g.destroy();

        // RUN (legs apart, arms swinging)
        g = this.add.graphics();
        this._drawChar(g, -1, 2);
        g.generateTexture('player-run', 32, 32);
        g.destroy();

        // JUMP (arms up, legs tucked)
        g = this.add.graphics();
        this._drawChar(g, -2, -1);
        g.generateTexture('player-jump', 32, 32);
        g.destroy();

        // FALL (arms down, legs spread)
        g = this.add.graphics();
        this._drawChar(g, 1, 1);
        g.generateTexture('player-fall', 32, 32);
        g.destroy();

        // HURT (red-tinted)
        g = this.add.graphics();
        this._drawChar(g, 0, 0, (gfx) => {
            gfx.fillStyle(0xFF0000, 0.3);
            gfx.fillRect(0, 0, 32, 32);
        });
        g.generateTexture('player-hurt', 32, 32);
        g.destroy();
    }

    // ── COIN texture (16x16) ──
    generateCoinTexture() {
        const g = this.add.graphics();
        // Outer ring (gold gradient)
        g.fillStyle(0xFFD700);
        g.fillCircle(8, 8, 7);
        g.fillStyle(0xEEC900);
        g.fillCircle(8, 8, 6);
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
        // Inner gear detail
        g.fillStyle(0xDAA520);
        g.fillCircle(8, 8, 3);
        g.fillStyle(0xFFD700, 0.6);
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 - Math.PI / 4;
            const gx = 8 + Math.cos(angle) * 2.5;
            const gy = 8 + Math.sin(angle) * 2.5;
            g.fillRect(gx - 0.5, gy - 0.5, 1, 1);
        }
        // Center hole
        g.fillStyle(0x1A1A2E);
        g.fillCircle(8, 8, 2);
        // Highlight
        g.fillStyle(0xFFFFAA, 0.5);
        g.fillCircle(7, 6, 2);
        g.fillStyle(0xFFFFFF, 0.3);
        g.fillCircle(7, 5, 1);
        g.generateTexture('coin', 16, 16);
        g.destroy();
    }

    // ── HEART textures (20x20) ──
    generateHeartTextures() {
        // FULL
        let g = this.add.graphics();
        // Base red
        g.fillStyle(0xFF3333);
        g.fillCircle(7,  7, 5);
        g.fillCircle(13, 7, 5);
        g.fillRect(5,  7, 10, 3);
        g.fillTriangle(5,  10, 15, 10, 10, 18);
        // Darker edge (depth)
        g.fillStyle(0xCC2222, 0.5);
        g.fillCircle(7,  8, 4);
        g.fillCircle(13, 8, 4);
        // Shine highlight
        g.fillStyle(0xFF7777, 0.6);
        g.fillCircle(7,  6, 2);
        g.fillStyle(0xFFAAAA, 0.4);
        g.fillCircle(7,  5, 1);
        g.generateTexture('heart-full', 20, 20);
        g.destroy();

        // EMPTY
        g = this.add.graphics();
        // Dark gray base
        g.fillStyle(0x555555);
        g.fillCircle(7,  7, 5);
        g.fillCircle(13, 7, 5);
        g.fillRect(5,  7, 10, 3);
        g.fillTriangle(5,  10, 15, 10, 10, 18);
        // Inner shadow
        g.fillStyle(0x444444, 0.6);
        g.fillCircle(7,  8, 4);
        g.fillCircle(13, 8, 4);
        // Light edge
        g.fillStyle(0x777777, 0.3);
        g.fillCircle(7,  6, 2);
        g.fillStyle(0x888888, 0.2);
        g.fillCircle(7,  5, 1);
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

    // ── GATE texture (48x64) — always open ──
    generateGateTextures() {
        let g = this.add.graphics();
        // Frame (outer)
        g.fillStyle(0x4A3E2E);
        g.fillRect(0, 0, 48, 64);
        // Frame bevel (lighter top-left edge)
        g.fillStyle(0x6B5A42, 0.6);
        g.fillRect(0, 0, 48, 2);
        g.fillRect(0, 0, 2, 64);
        // Frame inner
        g.fillStyle(0x5D4E37);
        g.fillRect(2, 2, 44, 60);
        // Arch top
        g.fillStyle(0x4A3E2E);
        g.fillRect(0, 0, 48, 4);
        g.fillTriangle(0, 4, 24, 0, 48, 4);
        // Arch highlight
        g.fillStyle(0x7A6B55, 0.4);
        g.fillTriangle(2, 4, 24, 1, 46, 4);
        // Glowing inner panels (with bevel effect)
        g.fillStyle(0xCC9900, 0.9);
        g.fillRect(6, 8, 14, 20);
        g.fillRect(28, 8, 14, 20);
        g.fillRect(6, 34, 14, 24);
        g.fillRect(28, 34, 14, 24);
        // Panel bevel (lighter top)
        g.fillStyle(0xFFDD44, 0.5);
        g.fillRect(6, 8, 14, 2);
        g.fillRect(28, 8, 14, 2);
        g.fillRect(6, 34, 14, 2);
        g.fillRect(28, 34, 14, 2);
        // Inner glow
        g.fillStyle(0xFFFFAA, 0.5);
        g.fillRect(8, 10, 10, 16);
        g.fillRect(30, 10, 10, 16);
        g.fillRect(8, 36, 10, 20);
        g.fillRect(30, 36, 10, 20);
        // Panel center shine
        g.fillStyle(0xFFFFFF, 0.15);
        g.fillRect(10, 14, 6, 8);
        g.fillRect(32, 14, 6, 8);
        g.fillRect(10, 40, 6, 10);
        g.fillRect(32, 40, 6, 10);
        // Rivets
        g.fillStyle(0xFFD700);
        [[8,10],[20,10],[28,10],[40,10],[8,36],[20,36],[28,36],[40,36],[8,54],[40,54]]
            .forEach(([x,y]) => { g.fillCircle(x, y, 2); });
        // Rivet highlights
        g.fillStyle(0xFFFFAA, 0.4);
        [[8,9],[20,9],[28,9],[40,9],[8,35],[20,35],[28,35],[40,35],[8,53],[40,53]]
            .forEach(([x,y]) => { g.fillRect(x - 1, y - 1, 2, 1); });
        // Open indicator (green)
        g.fillStyle(0x44FF88);
        g.fillCircle(24, 48, 6);
        g.fillStyle(0x88FFBB);
        g.fillCircle(24, 48, 4);
        g.fillStyle(0xFFFFFF);
        g.fillCircle(24, 48, 2);
        // Green glow pulse ring
        g.fillStyle(0x44FF88, 0.2);
        g.fillCircle(24, 48, 9);
        // Outer gold glow
        g.fillStyle(0xFFD700, 0.2);
        g.fillRect(0, 0, 48, 64);
        g.generateTexture('gate-open', 48, 64);
        g.destroy();
    }

    // ── OBSTACLE texture (saw blade, 28x28) ──
    generateObstacleTextures() {
        // SAW BLADE
        let g = this.add.graphics();
        // Outer ring (metallic gradient)
        g.fillStyle(0x999999);
        g.fillCircle(14, 14, 13);
        g.fillStyle(0x777777);
        g.fillCircle(14, 14, 12);
        g.fillStyle(0x666666);
        g.fillCircle(14, 14, 11);
        // Metallic highlight (top-left shine)
        g.fillStyle(0xBBBBBB, 0.4);
        g.fillCircle(10, 10, 6);
        // Teeth with bright tip
        g.fillStyle(0xBBBBBB);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const tx = 14 + Math.cos(angle) * 11;
            const ty = 14 + Math.sin(angle) * 11;
            g.fillTriangle(
                tx, ty,
                14 + Math.cos(angle - 0.3) * 14, 14 + Math.sin(angle - 0.3) * 14,
                14 + Math.cos(angle + 0.3) * 14, 14 + Math.sin(angle + 0.3) * 14
            );
            // Tooth tip highlight
            g.fillStyle(0xDDDDDD, 0.6);
            const tipX = 14 + Math.cos(angle) * 13;
            const tipY = 14 + Math.sin(angle) * 13;
            g.fillCircle(tipX, tipY, 1);
            g.fillStyle(0xBBBBBB);
        }
        // Center hub
        g.fillStyle(0x444444);
        g.fillCircle(14, 14, 5);
        g.fillStyle(0x555555);
        g.fillCircle(14, 14, 4);
        // Red danger center
        g.fillStyle(0xFF4444);
        g.fillCircle(14, 14, 3);
        g.fillStyle(0xFF8888);
        g.fillCircle(14, 14, 1);
        // Hub highlight
        g.fillStyle(0xFFFFFF, 0.2);
        g.fillCircle(13, 12, 2);
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

    _generateDroneTexture() {
        // DRONE (28x28) — steampunk mechanical flying drone
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

        // DRONE DEATH (X eye, dark)
        g = this.add.graphics();
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

    _generateWalkerTextures() {
        // WALKER WALK (32x32) — steampunk mechanical automaton
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

        // WALKER DEATH
        g = this.add.graphics();
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
        // Base fill
        g.fillStyle(0x5D4E37);
        g.fillRect(0, 0, 32, 32);
        // Top highlight
        g.fillStyle(0x6B5B45);
        g.fillRect(1, 1, 30, 6);
        g.fillStyle(0x7D6B53);
        g.fillRect(1, 1, 30, 2);
        // Brick color variation (subtle per-brick shading)
        // Row 1 bricks
        g.fillStyle(0x6A5A42, 0.3);
        g.fillRect(2, 2, 5, 4);
        g.fillRect(10, 2, 5, 4);
        g.fillStyle(0x524431, 0.3);
        g.fillRect(18, 2, 5, 4);
        g.fillRect(26, 2, 5, 4);
        // Row 2 bricks
        g.fillStyle(0x524431, 0.3);
        g.fillRect(1, 9, 6, 5);
        g.fillRect(9, 9, 6, 5);
        g.fillStyle(0x6A5A42, 0.3);
        g.fillRect(17, 9, 6, 5);
        g.fillRect(25, 9, 6, 5);
        // Row 3 bricks
        g.fillStyle(0x6A5A42, 0.3);
        g.fillRect(4, 17, 6, 5);
        g.fillRect(12, 17, 6, 5);
        g.fillStyle(0x524431, 0.3);
        g.fillRect(20, 17, 6, 5);
        g.fillRect(28, 17, 6, 5);
        // Row 4 bricks
        g.fillStyle(0x524431, 0.3);
        g.fillRect(1, 25, 6, 5);
        g.fillRect(9, 25, 6, 5);
        g.fillStyle(0x6A5A42, 0.3);
        g.fillRect(17, 25, 6, 5);
        g.fillRect(25, 25, 6, 5);
        // Mortar / brick lines
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
        // Mortar line shadow
        g.fillStyle(0x3E3328, 0.3);
        g.fillRect(0, 8, 32, 1);
        g.fillRect(0, 16, 32, 1);
        g.fillRect(0, 24, 32, 1);
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
        // ── Gradient sky (deep navy to midnight purple) ──
        for (let i = 0; i < h; i++) {
            const t = i / h;
            const r = Math.floor(0x0A + (0x2E - 0x0A) * t);
            const gr = Math.floor(0x0A + (0x2E - 0x0A) * t);
            const b = Math.floor(0x2E + (0x48 - 0x2E) * t);
            const color = (r << 16) | (gr << 8) | b;
            g.fillStyle(color);
            g.fillRect(0, i, w, 1);
        }
        // ── Moon ──
        g.fillStyle(0xEEEEFF, 0.15);
        g.fillCircle(650, 60, 40); // outer glow
        g.fillStyle(0xEEEEFF, 0.25);
        g.fillCircle(650, 60, 30);
        g.fillStyle(0xDDDDFF, 0.9);
        g.fillCircle(650, 60, 22);
        g.fillStyle(0xFFFFFF, 0.4);
        g.fillCircle(655, 55, 18);
        g.fillStyle(0xCCCCDD, 0.3);
        g.fillCircle(642, 65, 5); // crater
        g.fillCircle(658, 58, 3);
        g.fillCircle(648, 55, 4);
        // ── Stars (varied sizes and brightness) ──
        const starField = [
            [50,40,1,0.6],[120,80,1,0.5],[200,25,2,0.9],[310,55,1,0.7],[400,30,1,0.4],
            [520,70,2,0.8],[610,20,1,0.5],[700,50,1,0.6],[80,130,1,0.3],[180,110,2,0.7],
            [280,90,1,0.5],[350,120,1,0.4],[470,100,1,0.6],[560,95,2,0.9],[640,110,1,0.5],
            [720,85,1,0.3],[150,60,1,0.4],[420,50,2,0.8],[590,40,1,0.5],[30,100,1,0.3],
            [680,140,1,0.4],[760,45,1,0.5],[100,160,1,0.3],[500,140,1,0.4],[330,30,1,0.6]
        ];
        starField.forEach(([x,y,size,alpha]) => {
            g.fillStyle(0xFFFFFF, alpha);
            g.fillCircle(x, y, size);
        });
        // ── Distant building layer (lighter, farther) ──
        g.fillStyle(0x181838);
        const farBld = [
            [10,50,100],[70,35,140],[115,55,80],[175,45,110],[220,60,65],
            [300,40,130],[340,65,85],[410,50,100],[460,45,70],[510,55,120],
            [565,35,140],[600,50,95],[660,60,85],[710,40,130],[760,55,100]
        ];
        farBld.forEach(([x, ww, bh]) => g.fillRect(x, h - bh - 30, ww, bh + 30));
        // ── Front building layer (darker, closer) ──
        g.fillStyle(0x121226);
        const frontBld = [
            [0,60,110],[60,30,150],[90,50,80],[140,40,130],[180,60,90],
            [240,35,160],[275,70,110],[345,45,80],[390,55,130],[445,40,95],
            [485,60,115],[545,30,160],[575,50,105],[625,65,120],[690,35,90],[725,75,130]
        ];
        frontBld.forEach(([x, ww, bh]) => g.fillRect(x, h - bh, ww, bh));
        // ── Window lights (warm glow) ──
        g.fillStyle(0xFFDD77, 0.5);
        [[30,380],[45,390],[100,360],[200,400],[260,340],[290,370],[400,370],
         [500,380],[640,370],[740,370],[160,320],[340,330],[460,340],[580,350]]
            .forEach(([x,y]) => {
                g.fillRect(x, y, 4, 5);
                g.fillStyle(0xFFEEAA, 0.2);
                g.fillRect(x - 2, y - 2, 8, 9);
                g.fillStyle(0xFFDD77, 0.5);
            });
        // ── Atmospheric haze at bottom ──
        for (let i = 0; i < 40; i++) {
            const t = i / 40;
            g.fillStyle(0x222244, (1 - t) * 0.3);
            g.fillRect(0, h - 40 + i, w, 1);
        }
        g.generateTexture('bg-level1', w, h);
        g.destroy();
    }

    _genBgLevel2() {
        const g = this.add.graphics();
        const w = 800, h = 450;
        // ── Gradient sky (deep indigo to purple-black) ──
        for (let i = 0; i < h; i++) {
            const t = i / h;
            const r = Math.floor(0x12 + (0x32 - 0x12) * t);
            const gr = Math.floor(0x0E + (0x20 - 0x0E) * t);
            const b = Math.floor(0x3E + (0x50 - 0x3E) * t);
            const color = (r << 16) | (gr << 8) | b;
            g.fillStyle(color);
            g.fillRect(0, i, w, 1);
        }
        // ── Distant fog layers ──
        g.fillStyle(0x334466, 0.15);
        g.fillEllipse(500, 200, 400, 40);
        g.fillEllipse(200, 180, 350, 35);
        g.fillStyle(0x445577, 0.1);
        g.fillEllipse(700, 220, 300, 30);
        g.fillEllipse(100, 240, 250, 25);
        // ── Distant buildings (lighter) ──
        g.fillStyle(0x151540);
        const farB = [[0,65,160],[50,50,200],[95,70,140],[160,45,230],[200,85,170],
            [280,55,210],[325,80,155],[395,60,190],[445,70,165],[505,50,240],
            [555,75,180],[620,55,220],[670,85,150],[745,50,200],[785,55,170]];
        farB.forEach(([x, ww, bh]) => g.fillRect(x, h - bh - 20, ww, bh + 20));
        // ── Front buildings (darker) ──
        g.fillStyle(0x111130);
        const frontB = [[-10,70,190],[55,45,230],[100,60,170],[155,40,260],[195,80,200],
            [270,50,240],[315,75,185],[385,55,220],[435,65,195],[495,45,270],
            [540,70,210],[605,50,250],[650,80,180],[725,45,230],[770,50,200]];
        frontB.forEach(([x, ww, bh]) => g.fillRect(x, h - bh, ww, bh));
        // ── Industrial pipes with steam glow ──
        const pipes = [
            [70,230,8,220,0x0E0E2E],[170,200,10,250,0x0E0E2E],[320,215,7,235,0x0E0E2E],
            [450,190,9,260,0x0E0E2E],[560,210,8,240,0x0E0E2E],[700,225,10,225,0x0E0E2E]
        ];
        pipes.forEach(([x,y,ww,bh,color]) => {
            g.fillStyle(color);
            g.fillRect(x, y, ww, bh);
            // Pipe highlight
            g.fillStyle(0x222244, 0.3);
            g.fillRect(x + 1, y, 2, bh);
        });
        // ── Steam vents / glow points ──
        const vents = [[70,450],[170,450],[320,450],[450,450],[560,450],[700,450]];
        vents.forEach(([vx,vy]) => {
            g.fillStyle(0xFF8800, 0.08);
            g.fillCircle(vx + 4, vy - 30, 25);
            g.fillStyle(0xFF6600, 0.05);
            g.fillCircle(vx + 4, vy - 30, 40);
        });
        // ── Bottom ambient glow ──
        for (let i = 0; i < 40; i++) {
            const t = i / 40;
            g.fillStyle(0xFF6600, (1 - t) * 0.08);
            g.fillRect(0, h - 40 + i, w, 1);
        }
        // ── Fog overlay at bottom ──
        g.fillStyle(0x222244, 0.2);
        g.fillEllipse(200, h - 20, 500, 40);
        g.fillEllipse(600, h - 30, 400, 50);
        g.generateTexture('bg-level2', w, h);
        g.destroy();
    }

    _genBgLevel3() {
        const g = this.add.graphics();
        const w = 800, h = 450;
        // ── Gradient sky (dark red-violet to near black) ──
        for (let i = 0; i < h; i++) {
            const t = i / h;
            const r = Math.floor(0x22 + (0x44 - 0x22) * t * 0.5);
            const gr = Math.floor(0x06 + (0x12 - 0x06) * t * 0.3);
            const b = Math.floor(0x1E + (0x2E - 0x1E) * t * 0.5);
            const color = (r << 16) | (gr << 8) | b;
            g.fillStyle(color);
            g.fillRect(0, i, w, 1);
        }
        // ── Large forge glow at bottom ──
        for (let i = 0; i < 180; i++) {
            const t = i / 180;
            const r = Math.floor(0xFF * (1 - t * 0.3));
            const gr = Math.floor(0x66 * (1 - t * 0.6));
            const color = (r << 16) | (gr << 8);
            g.fillStyle(color, (1 - t) * 0.35);
            g.fillRect(0, h - 180 + i, w, 1);
        }
        // ── Hot spot in center ──
        g.fillStyle(0xFFAA33, 0.2);
        g.fillCircle(400, h - 30, 120);
        g.fillStyle(0xFF6600, 0.15);
        g.fillCircle(400, h - 30, 180);
        // ── Ember glow particles ──
        const embers = [[120,380],[250,350],[350,370],[500,360],[620,340],[740,370],
            [180,320],[420,390],[550,350],[680,380],[80,340],[300,330],[470,370],[600,320]];
        embers.forEach(([ex, ey]) => {
            g.fillStyle(0xFF8800, Math.random() * 0.3 + 0.1);
            g.fillCircle(ex, ey, Math.random() * 2 + 1);
            g.fillStyle(0xFFCC44, Math.random() * 0.2);
            g.fillCircle(ex, ey, Math.random() * 3 + 2);
        });
        // ── Distant silhouettes (factory / smokestacks) ──
        g.fillStyle(0x0E0510);
        g.fillRect(0, h - 220, 100, 220);
        g.fillRect(60, h - 260, 30, 260);
        g.fillRect(140, h - 180, 80, 180);
        g.fillStyle(0x120618);
        g.fillRect(180, h - 120, 40, 120);
        g.fillRect(220, h - 160, 60, 160);
        // ── Right side structures ──
        g.fillStyle(0x0E0510);
        g.fillRect(600, h - 240, 200, 240);
        g.fillRect(620, h - 290, 40, 290);
        g.fillRect(700, h - 270, 50, 270);
        g.fillStyle(0x100412);
        g.fillRect(720, h - 200, 80, 200);
        // ── Cross beams / scaffolding ──
        g.fillStyle(0x0E0510);
        g.fillRect(120, h - 80, 520, 6);
        g.fillRect(100, h - 140, 6, 70);
        g.fillRect(120, h - 160, 8, 90);
        g.fillRect(380, h - 140, 8, 80);
        g.fillRect(520, h - 120, 6, 60);
        // ── Glowing windows ──
        const windows = [
            [30,260,6,8],[42,260,6,8],[30,278,6,8],[42,278,6,8],
            [70,230,8,10],[70,250,8,10],[160,310,6,8],[160,326,6,8],
            [230,320,8,10],[230,340,8,10],[640,240,8,10],[656,240,8,10],
            [640,260,8,10],[656,260,8,10],[700,220,6,8],[700,236,6,8]
        ];
        windows.forEach(([wx, wy, ww, wh]) => {
            g.fillStyle(0xFF6611, 0.6);
            g.fillRect(wx, wy, ww, wh);
            g.fillStyle(0xFFAA44, 0.3);
            g.fillRect(wx - 1, wy - 1, ww + 2, wh + 2);
        });
        // ── Smoke / haze overlay ──
        for (let i = 0; i < 60; i++) {
            const t = i / 60;
            g.fillStyle(0xFF4400, (1 - t) * 0.04);
            g.fillRect(0, h - 60 + i, w, 1);
        }
        // Ember glow at top (reflection)
        g.fillStyle(0xFF4400, 0.03);
        g.fillRect(300, 0, 200, h);
        g.generateTexture('bg-level3', w, h);
        g.destroy();
    }

    // ── Character drawing helper (extracted from generatePlayerTextures) ──
    _drawChar(g, armY, legOffset, extra) {
        // Boots
        g.fillStyle(0x654321);
        g.fillRect(9,  24, 5, 6);
        g.fillRect(18, 24, 5, 6);
        g.fillStyle(0x7A5A3A, 0.5);
        g.fillRect(9,  24, 5, 1); // boot highlight
        g.fillRect(18, 24, 5, 1);
        // Legs
        g.fillStyle(0x5C4033);
        g.fillRect(9,  20, 5, 4 + legOffset);
        g.fillRect(18, 20, 5, 4 - legOffset);
        // Body
        g.fillStyle(0x8B4513);
        g.fillRect(8,  12, 16, 10);
        // Body highlight (gradient effect)
        g.fillStyle(0xA06830, 0.4);
        g.fillRect(8,  12, 4, 10);
        // Belt
        g.fillStyle(0x654321);
        g.fillRect(8,  18, 16, 2);
        g.fillStyle(0xFFD700);
        g.fillRect(14, 18, 4, 2);
        // Belt buckle shine
        g.fillStyle(0xFFFFAA, 0.5);
        g.fillRect(15, 18, 1, 1);
        // Arms
        g.fillStyle(0x8B4513);
        g.fillRect(4,  12 + armY, 4, 10);
        g.fillRect(24, 12 - armY, 4, 10);
        // Arm highlight
        g.fillStyle(0xA06830, 0.3);
        g.fillRect(4,  12 + armY, 1, 10);
        g.fillRect(24, 12 - armY, 1, 10);
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
        // Hat gradient highlight
        g.fillStyle(0x5A4033, 0.5);
        g.fillRect(8,  1, 16, 1);
        g.fillRect(6,  4, 20, 1);
        // Goggles
        g.fillStyle(0xFFD700);
        g.fillCircle(12, 8, 3);
        g.fillCircle(20, 8, 3);
        g.fillStyle(0x87CEEB);
        g.fillCircle(12, 8, 2);
        g.fillCircle(20, 8, 2);
        // Goggle shine
        g.fillStyle(0xFFFFFF, 0.4);
        g.fillRect(11, 7, 1, 1);
        g.fillRect(19, 7, 1, 1);
        g.fillStyle(0x3E2723);
        g.fillRect(10, 7, 12, 1);
        // Scarf
        g.fillStyle(0xCC3333);
        g.fillRect(8,  10, 16, 3);
        g.fillRect(24, 11, 4, 4);
        // Scarf highlight
        g.fillStyle(0xEE5555, 0.4);
        g.fillRect(8,  10, 16, 1);
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

    // ── 16-bit pixel art helper ──
    drawPixelArt(key, pixelMap, pixelSize) {
        const rows = pixelMap.length;
        const cols = pixelMap[0].length;
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const hex = pixelMap[r][c];
                if (!hex) continue;
                g.fillStyle(parseInt(hex.replace('#',''), 16), 1);
                g.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
            }
        }
        g.generateTexture(key, cols * pixelSize, rows * pixelSize);
        g.destroy();
    }

    // ── Generate 16-bit pixel art textures ──
    generatePixelArtTextures() {
        // ── Player (16x16, pixelSize: 2) ──
        this.drawPixelArt('player', [
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#FFD7','#FFD7','#FFD7','#FFD7','#FFD7','#FFD7','#222','#222','#FFD7','#FFD7','#FFD7','#FFD7','#FFD7','#FFD7','#222'],
            ['#222','#FFD7','#FFD7','#FFD7','#222','#FFD7','#FFD7','#222','#222','#FFD7','#FFD7','#222','#FFD7','#FFD7','#FFD7','#222'],
            ['#d4a7','#d4a7','#d4a7','#d4a7','#222','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#222','#d4a7','#d4a7','#d4a7','#d4a7'],
            ['#d4a7','#d4a7','#d4a7','#d4a7','#222','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#222','#d4a7','#d4a7','#d4a7','#d4a7'],
            ['#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7'],
            ['#5c3d','#5c3d','#5c3d','#222','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#222','#5c3d','#5c3d','#5c3d'],
            ['#5c3d','#5c3d','#222','#FFD7','#FFD7','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#FFD7','#FFD7','#222','#5c3d','#5c3d'],
            ['#5c3d','#5c3d','#222','#FFD7','#FFD7','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#FFD7','#FFD7','#222','#5c3d','#5c3d'],
            ['#5c3d','#5c3d','#5c3d','#222','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#222','#5c3d','#5c3d','#5c3d'],
            ['#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d'],
            ['#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#222','#222','#222','#222','#222','#222','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d'],
            ['#8B5E','#8B5E','#8B5E','#222','#8B5E','#8B5E','#8B5E','#222','#222','#8B5E','#8B5E','#8B5E','#222','#8B5E','#8B5E','#8B5E'],
            ['#8B5E','#8B5E','#8B5E','#222','#8B5E','#8B5E','#8B5E','#222','#222','#8B5E','#8B5E','#8B5E','#222','#8B5E','#8B5E','#8B5E'],
            ['#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#222','#222','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
        ], 2);

        // ── Player Walk Frame 2 ('player-walk') — 16x16, pixelSize: 2 ──
        this.drawPixelArt('player-walk', [
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#FFD7','#FFD7','#FFD7','#FFD7','#FFD7','#FFD7','#222','#222','#FFD7','#FFD7','#FFD7','#FFD7','#FFD7','#FFD7','#222'],
            ['#222','#FFD7','#FFD7','#FFD7','#222','#FFD7','#FFD7','#222','#222','#FFD7','#FFD7','#222','#FFD7','#FFD7','#FFD7','#222'],
            ['#d4a7','#d4a7','#d4a7','#d4a7','#222','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#222','#d4a7','#d4a7','#d4a7','#d4a7'],
            ['#d4a7','#d4a7','#d4a7','#d4a7','#222','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#222','#d4a7','#d4a7','#d4a7','#d4a7'],
            ['#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7'],
            ['#5c3d','#5c3d','#5c3d','#222','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#222','#5c3d','#5c3d','#5c3d'],
            ['#5c3d','#5c3d','#222','#FFD7','#FFD7','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#FFD7','#FFD7','#222','#5c3d','#5c3d'],
            ['#5c3d','#5c3d','#222','#FFD7','#FFD7','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#FFD7','#FFD7','#222','#5c3d','#5c3d'],
            ['#5c3d','#5c3d','#5c3d','#222','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#222','#5c3d','#5c3d','#5c3d'],
            ['#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d'],
            ['#5c3d','#5c3d','#5c3d','#5c3d','#222','#222','#222','#222','#222','#222','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d'],
            ['#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#222','#222','#222','#222','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E'],
            ['#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#222','#222','#222','#222','#222','#222','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E'],
            ['#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#222','#222','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
        ], 2);

        // ── Enemy Walker (16x16) — clockwork spider, 4 legs per side, gear eye ──
        this.drawPixelArt('enemy-walker', [
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#333','#222','#222','#222','#333','#222','#222','#222','#222','#333','#222','#222','#222','#333','#222'],
            ['#333','#555','#333','#222','#555','#AAA','#222','#222','#222','#222','#AAA','#555','#222','#333','#555','#333'],
            ['#333','#555','#555','#333','#AAA','#AAA','#555','#222','#222','#555','#AAA','#AAA','#333','#555','#555','#333'],
            ['#222','#555','#AAA','#AAA','#AAA','#AAA','#555','#222','#222','#555','#AAA','#AAA','#AAA','#AAA','#555','#222'],
            ['#222','#555','#AAA','#AAA','#AAA','#555','#222','#222','#222','#222','#555','#AAA','#AAA','#AAA','#555','#222'],
            ['#222','#333','#555','#AAA','#AAA','#555','#333','#222','#222','#333','#555','#AAA','#AAA','#555','#333','#222'],
            ['#222','#222','#555','#FFD7','#FFD7','#555','#222','#222','#222','#222','#555','#FFD7','#FFD7','#555','#222','#222'],
            ['#222','#222','#555','#FFD7','#FFD7','#555','#222','#222','#222','#222','#555','#FFD7','#FFD7','#555','#222','#222'],
            ['#222','#333','#555','#AAA','#AAA','#555','#333','#222','#222','#333','#555','#AAA','#AAA','#555','#333','#222'],
            ['#222','#555','#AAA','#AAA','#AAA','#555','#222','#222','#222','#222','#555','#AAA','#AAA','#AAA','#555','#222'],
            ['#222','#555','#AAA','#AAA','#AAA','#AAA','#555','#222','#222','#555','#AAA','#AAA','#AAA','#AAA','#555','#222'],
            ['#333','#555','#555','#333','#AAA','#AAA','#555','#333','#333','#555','#AAA','#AAA','#333','#555','#555','#333'],
            ['#333','#555','#333','#222','#555','#AAA','#222','#222','#222','#222','#AAA','#555','#222','#333','#555','#333'],
            ['#222','#333','#222','#222','#222','#333','#222','#222','#222','#222','#333','#222','#222','#222','#333','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
        ], 2);

        // ── Enemy Drone (16x16) — flying cog drone, rotor blades, red eye ──
        this.drawPixelArt('enemy-drone', [
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#888','#888','#888','#888','#888','#888','#888','#888','#888','#888','#888','#888','#888','#888','#222'],
            ['#222','#888','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#888','#222'],
            ['#222','#444','#444','#AA3','#AA3','#AA3','#AA3','#444','#444','#AA3','#AA3','#AA3','#AA3','#444','#444','#222'],
            ['#222','#444','#444','#AA3','#AA3','#AA3','#AA3','#444','#444','#AA3','#AA3','#AA3','#AA3','#444','#444','#222'],
            ['#222','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#222'],
            ['#222','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#222'],
            ['#222','#444','#444','#444','#444','#555','#555','#555','#555','#555','#555','#444','#444','#444','#444','#222'],
            ['#222','#444','#444','#444','#555','#FF3','#FF3','#FF3','#FF3','#FF3','#FF3','#555','#444','#444','#444','#222'],
            ['#222','#444','#444','#444','#555','#FF3','#333','#333','#333','#333','#FF3','#555','#444','#444','#444','#222'],
            ['#222','#444','#444','#444','#444','#555','#555','#555','#555','#555','#555','#444','#444','#444','#444','#222'],
            ['#222','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#222'],
            ['#222','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#222'],
            ['#222','#444','#444','#AA3','#AA3','#444','#444','#444','#444','#444','#444','#AA3','#AA3','#444','#444','#222'],
            ['#222','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#444','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
        ], 2);

        // ── Coin (12x12) — hexagonal gear shape gold ──
        this.drawPixelArt('coin', [
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#CC8','#FFD7','#FFD7','#FFD7','#FFD7','#CC8','#222','#222','#222'],
            ['#222','#222','#CC8','#FFD7','#FFD7','#FFD7','#FFD7','#FFD7','#FFD7','#CC8','#222','#222'],
            ['#222','#CC8','#FFD7','#FFD7','#FF8','#FF8','#FF8','#FF8','#FFD7','#FFD7','#CC8','#222'],
            ['#222','#FFD7','#FFD7','#FF8','#CC8','#CC8','#CC8','#CC8','#FF8','#FFD7','#FFD7','#222'],
            ['#222','#FFD7','#FFD7','#FF8','#CC8','#222','#222','#CC8','#FF8','#FFD7','#FFD7','#222'],
            ['#222','#FFD7','#FFD7','#FF8','#CC8','#222','#222','#CC8','#FF8','#FFD7','#FFD7','#222'],
            ['#222','#FFD7','#FFD7','#FF8','#CC8','#CC8','#CC8','#CC8','#FF8','#FFD7','#FFD7','#222'],
            ['#222','#CC8','#FFD7','#FFD7','#FF8','#FF8','#FF8','#FF8','#FFD7','#FFD7','#CC8','#222'],
            ['#222','#222','#CC8','#FFD7','#FFD7','#FFD7','#FFD7','#FFD7','#FFD7','#CC8','#222','#222'],
            ['#222','#222','#222','#CC8','#FFD7','#FFD7','#FFD7','#FFD7','#CC8','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
        ], 2);

        // ── Heart Full (12x12) — red heart with pink highlight ──
        this.drawPixelArt('heart-full', [
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#FF3','#FF3','#222','#222','#FF3','#FF3','#222','#222','#222'],
            ['#222','#222','#FF3','#FF3','#FF3','#FF3','#FF3','#FF3','#FF3','#FF3','#222','#222'],
            ['#222','#FF3','#FF3','#F66','#F66','#FF3','#FF3','#F66','#F66','#FF3','#FF3','#222'],
            ['#222','#FF3','#FF3','#FF3','#F66','#F66','#F66','#F66','#FF3','#FF3','#FF3','#222'],
            ['#222','#FF3','#FF3','#FF3','#FF3','#F66','#F66','#FF3','#FF3','#FF3','#FF3','#222'],
            ['#222','#FF3','#FF3','#FF3','#FF3','#FF3','#FF3','#FF3','#FF3','#FF3','#FF3','#222'],
            ['#222','#FF3','#FF3','#FF3','#FF3','#FF3','#FF3','#FF3','#FF3','#FF3','#FF3','#222'],
            ['#222','#222','#FF3','#FF3','#FF3','#FF3','#FF3','#FF3','#FF3','#FF3','#222','#222'],
            ['#222','#222','#222','#FF3','#FF3','#FF3','#FF3','#FF3','#FF3','#222','#222','#222'],
            ['#222','#222','#222','#222','#FF3','#FF3','#FF3','#FF3','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
        ], 2);

        // ── Heart Empty (12x12) — dark gray heart shape ──
        this.drawPixelArt('heart-empty', [
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#555','#555','#222','#222','#555','#555','#222','#222','#222'],
            ['#222','#222','#555','#555','#555','#555','#555','#555','#555','#555','#222','#222'],
            ['#222','#555','#555','#555','#555','#555','#555','#555','#555','#555','#555','#222'],
            ['#222','#555','#555','#555','#555','#555','#555','#555','#555','#555','#555','#222'],
            ['#222','#555','#555','#555','#555','#555','#555','#555','#555','#555','#555','#222'],
            ['#222','#555','#555','#555','#555','#555','#555','#555','#555','#555','#555','#222'],
            ['#222','#555','#555','#555','#555','#555','#555','#555','#555','#555','#555','#222'],
            ['#222','#222','#555','#555','#555','#555','#555','#555','#555','#555','#222','#222'],
            ['#222','#222','#222','#555','#555','#555','#555','#555','#555','#222','#222','#222'],
            ['#222','#222','#222','#222','#555','#555','#555','#555','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
        ], 2);

        // ── Platform (16x8) — steel plate with rivets, rust stripe ──
        this.drawPixelArt('platform', [
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#556','#556','#556','#556','#556','#556','#556','#556','#556','#556','#556','#556','#556','#556','#222'],
            ['#222','#556','#778','#556','#556','#778','#556','#556','#556','#556','#778','#556','#556','#778','#556','#222'],
            ['#222','#556','#556','#8B6','#8B6','#556','#556','#556','#556','#556','#556','#8B6','#8B6','#556','#556','#222'],
            ['#222','#556','#556','#8B6','#8B6','#556','#556','#556','#556','#556','#556','#8B6','#8B6','#556','#556','#222'],
            ['#222','#556','#778','#556','#556','#778','#556','#556','#556','#556','#778','#556','#556','#778','#556','#222'],
            ['#222','#556','#556','#556','#556','#556','#556','#556','#556','#556','#556','#556','#556','#556','#556','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
        ], 2);

        // ── Ground (16x8) — dark cobblestone with cracked lines ──
        this.drawPixelArt('ground', [
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#556','#556','#556','#222','#556','#556','#556','#556','#556','#556','#222','#556','#556','#556','#222'],
            ['#222','#556','#556','#222','#222','#556','#556','#334','#334','#556','#556','#222','#222','#556','#556','#222'],
            ['#222','#222','#222','#556','#556','#556','#556','#334','#334','#556','#556','#556','#556','#222','#222','#222'],
            ['#222','#556','#556','#556','#556','#222','#222','#556','#556','#222','#222','#556','#556','#556','#556','#222'],
            ['#222','#556','#556','#556','#222','#222','#556','#556','#556','#556','#222','#222','#556','#556','#556','#222'],
            ['#222','#556','#556','#222','#556','#556','#556','#556','#556','#556','#556','#556','#222','#556','#556','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
        ], 2);

        // ── Merchant NPC (16x24) — top hat, monocle, brown coat, satchel ──
        this.drawPixelArt('merchant-npc', [
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#FFD7','#FFD7','#FFD7','#FFD7','#222','#222','#FFD7','#FFD7','#FFD7','#FFD7','#222','#222','#222'],
            ['#222','#222','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#222','#222'],
            ['#222','#222','#d4a7','#d4a7','#d4a7','#d4a7','#FFD7','#FFD7','#FFD7','#FFD7','#d4a7','#d4a7','#d4a7','#d4a7','#222','#222'],
            ['#222','#222','#d4a7','#d4a7','#d4a7','#d4a7','#FFD7','#222','#222','#FFD7','#d4a7','#d4a7','#d4a7','#d4a7','#222','#222'],
            ['#222','#222','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#222','#222'],
            ['#222','#222','#222','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#d4a7','#222','#222','#222'],
            ['#222','#222','#222','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#222','#222','#222'],
            ['#222','#222','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#222','#222'],
            ['#222','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#222'],
            ['#222','#5c3d','#5c3d','#5c3d','#5c3d','#FFD7','#5c3d','#5c3d','#5c3d','#5c3d','#FFD7','#5c3d','#5c3d','#5c3d','#5c3d','#222'],
            ['#222','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#5c3d','#5c3d','#222'],
            ['#222','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#8B5E','#8B5E','#AAA','#AAA','#8B5E','#8B5E','#8B5E','#5c3d','#5c3d','#222'],
            ['#222','#5c3d','#5c3d','#5c3d','#5c3d','#8B5E','#8B5E','#AAA','#8B5E','#8B5E','#AAA','#8B5E','#8B5E','#5c3d','#5c3d','#222'],
            ['#222','#5c3d','#5c3d','#5c3d','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#5c3d','#5c3d','#5c3d','#222'],
            ['#222','#222','#5c3d','#5c3d','#5c3d','#222','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#5c3d','#222','#5c3d','#5c3d','#222'],
            ['#222','#222','#222','#5c3d','#5c3d','#222','#222','#5c3d','#5c3d','#5c3d','#5c3d','#222','#222','#5c3d','#5c3d','#222'],
            ['#222','#222','#222','#5c3d','#5c3d','#222','#222','#5c3d','#5c3d','#5c3d','#5c3d','#222','#222','#5c3d','#5c3d','#222'],
            ['#222','#222','#222','#8B5E','#8B5E','#222','#222','#8B5E','#8B5E','#8B5E','#8B5E','#222','#222','#8B5E','#8B5E','#222'],
            ['#222','#222','#222','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
        ], 2);

        // ── Boss Bellows (24x32, pixelSize: 3) — hulking steampunk brute ──
        this.drawPixelArt('boss-bellows', [
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#663','#663','#663','#663','#663','#663','#663','#663','#663','#663','#663','#663','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#663','#663','#663','#663','#663','#663','#663','#663','#663','#663','#663','#663','#663','#663','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#663','#663','#663','#556','#556','#556','#556','#556','#556','#556','#556','#556','#556','#663','#663','#663','#222','#222','#222','#222'],
            ['#222','#222','#222','#663','#663','#663','#556','#F00','#F00','#556','#556','#556','#556','#556','#556','#F00','#F00','#556','#663','#663','#663','#222','#222','#222'],
            ['#222','#222','#222','#663','#663','#663','#556','#F00','#F00','#556','#556','#556','#556','#556','#556','#F00','#F00','#556','#663','#663','#663','#222','#222','#222'],
            ['#222','#222','#222','#222','#663','#663','#663','#556','#556','#556','#556','#556','#556','#556','#556','#556','#556','#663','#663','#663','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#663','#663','#663','#663','#663','#663','#663','#663','#663','#663','#663','#663','#663','#663','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#663','#663','#663','#663','#663','#663','#663','#663','#663','#663','#663','#663','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#663','#663','#663','#663','#663','#663','#663','#663','#663','#663','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#AAA','#AAA','#222','#222','#663','#663','#663','#663','#663','#663','#663','#663','#663','#663','#222','#222','#AAA','#AAA','#222','#222','#222'],
            ['#222','#222','#556','#556','#556','#222','#222','#222','#663','#663','#663','#663','#663','#663','#663','#663','#222','#222','#222','#556','#556','#556','#222','#222'],
            ['#222','#556','#556','#556','#556','#556','#222','#222','#222','#222','#663','#663','#663','#663','#222','#222','#222','#222','#556','#556','#556','#556','#556','#222'],
            ['#222','#556','#556','#556','#556','#556','#556','#222','#222','#222','#990','#990','#990','#990','#222','#222','#222','#556','#556','#556','#556','#556','#556','#222'],
            ['#222','#222','#556','#556','#556','#556','#556','#222','#222','#990','#990','#990','#990','#990','#990','#222','#222','#556','#556','#556','#556','#556','#222','#222'],
            ['#222','#222','#222','#556','#556','#556','#222','#222','#990','#990','#FF4','#FF4','#FF4','#FF4','#990','#990','#222','#222','#556','#556','#556','#222','#222','#222'],
            ['#222','#222','#222','#222','#556','#222','#222','#990','#990','#FF4','#FF6','#FF6','#FF6','#FF6','#FF4','#990','#990','#222','#222','#556','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#990','#990','#FF4','#FF6','#FF6','#FF6','#FF6','#FF6','#FF6','#FF4','#990','#990','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#990','#990','#FF4','#FF6','#FF6','#FF6','#FF6','#FF6','#FF6','#FF6','#FF6','#FF4','#990','#990','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#990','#990','#FF4','#FF6','#FF6','#FF6','#FF4','#FF4','#FF4','#FF4','#FF6','#FF6','#FF6','#FF4','#990','#990','#222','#222','#222','#222'],
            ['#222','#222','#222','#990','#990','#FF4','#FF6','#FF6','#FF6','#FF4','#990','#990','#990','#990','#FF4','#FF6','#FF6','#FF6','#FF4','#990','#990','#222','#222','#222'],
            ['#222','#222','#990','#990','#FF4','#FF6','#FF6','#FF6','#FF4','#990','#990','#222','#222','#990','#990','#FF4','#FF6','#FF6','#FF6','#FF4','#990','#990','#222','#222'],
            ['#222','#990','#990','#FF4','#FF6','#FF6','#FF6','#FF4','#990','#990','#222','#222','#222','#222','#990','#990','#FF4','#FF6','#FF6','#FF6','#FF4','#990','#990','#222'],
            ['#222','#990','#990','#990','#990','#990','#990','#990','#990','#222','#222','#222','#222','#222','#222','#990','#990','#990','#990','#990','#990','#990','#990','#222'],
            ['#222','#222','#990','#990','#990','#990','#990','#990','#222','#222','#222','#222','#222','#222','#222','#222','#990','#990','#990','#990','#990','#990','#222','#222'],
            ['#222','#222','#222','#990','#990','#990','#990','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#990','#990','#990','#990','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
        ], 3);

        // ── Boss Sentinel (24x24, pixelSize: 3) — floating hexagonal drone ──
        this.drawPixelArt('boss-sentinel', [
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#0FF','#0FF','#0FF','#0FF','#222','#222','#0FF','#0FF','#0FF','#0FF','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#0FF','#0FF','#334','#334','#0FF','#0FF','#0FF','#0FF','#334','#334','#0FF','#0FF','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#0FF','#0FF','#334','#334','#334','#334','#0FF','#0FF','#334','#334','#334','#334','#0FF','#0FF','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#0FF','#0FF','#334','#334','#334','#334','#334','#334','#334','#334','#334','#334','#334','#334','#0FF','#0FF','#222','#222','#222','#222'],
            ['#222','#222','#222','#0FF','#0FF','#334','#334','#334','#334','#334','#334','#F00','#F00','#334','#334','#334','#334','#334','#334','#0FF','#0FF','#222','#222','#222'],
            ['#222','#222','#222','#0FF','#0FF','#334','#334','#334','#334','#334','#F00','#F00','#F00','#F00','#334','#334','#334','#334','#334','#0FF','#0FF','#222','#222','#222'],
            ['#222','#222','#0FF','#0FF','#334','#334','#334','#334','#334','#F00','#F00','#F00','#F00','#F00','#F00','#334','#334','#334','#334','#334','#0FF','#0FF','#222','#222'],
            ['#222','#222','#0FF','#0FF','#334','#334','#334','#334','#F00','#F00','#F00','#F00','#F00','#F00','#F00','#F00','#334','#334','#334','#334','#0FF','#0FF','#222','#222'],
            ['#222','#222','#0FF','#0FF','#334','#334','#334','#334','#F00','#F00','#F00','#F00','#F00','#F00','#F00','#F00','#334','#334','#334','#334','#0FF','#0FF','#222','#222'],
            ['#222','#222','#0FF','#0FF','#334','#334','#334','#334','#334','#F00','#F00','#F00','#F00','#F00','#F00','#334','#334','#334','#334','#334','#0FF','#0FF','#222','#222'],
            ['#222','#222','#222','#0FF','#0FF','#334','#334','#334','#334','#334','#F00','#F00','#F00','#F00','#334','#334','#334','#334','#334','#0FF','#0FF','#222','#222','#222'],
            ['#222','#222','#222','#0FF','#0FF','#334','#334','#334','#334','#334','#334','#F00','#F00','#334','#334','#334','#334','#334','#334','#0FF','#0FF','#222','#222','#222'],
            ['#222','#222','#222','#222','#0FF','#0FF','#334','#334','#334','#334','#334','#334','#334','#334','#334','#334','#334','#334','#0FF','#0FF','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#0FF','#0FF','#334','#334','#334','#334','#0FF','#0FF','#334','#334','#334','#334','#0FF','#0FF','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#0FF','#0FF','#334','#334','#0FF','#0FF','#0FF','#0FF','#334','#334','#0FF','#0FF','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#0FF','#0FF','#0FF','#0FF','#222','#222','#0FF','#0FF','#0FF','#0FF','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#0FF','#0FF','#222','#222','#222','#222','#0FF','#0FF','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
        ], 3);

        // ── Boss Tyrant (32x40, pixelSize: 3) — massive mechanical titan ──
        this.drawPixelArt('boss-tyrant', [
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#663','#663','#663','#663','#663','#663','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#663','#663','#663','#663','#663','#663','#663','#663','#663','#663','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#663','#663','#663','#663','#556','#556','#556','#556','#663','#663','#663','#663','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#663','#663','#663','#663','#556','#F00','#F00','#F00','#F00','#556','#663','#663','#663','#663','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#663','#663','#663','#663','#556','#F00','#F00','#F00','#F00','#F00','#F00','#556','#663','#663','#663','#663','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#663','#663','#663','#663','#556','#F00','#F00','#F00','#F00','#F00','#F00','#F00','#F00','#556','#663','#663','#663','#663','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#663','#663','#663','#556','#F00','#F00','#F00','#F00','#F00','#F00','#F00','#F00','#F00','#F00','#556','#663','#663','#663','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#663','#663','#556','#F00','#F00','#F00','#F00','#FF6','#FF6','#FF6','#FF6','#F00','#F00','#F00','#F00','#556','#663','#663','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#663','#663','#556','#F00','#F00','#F00','#FF6','#FF6','#FF6','#FF6','#FF6','#FF6','#F00','#F00','#F00','#556','#663','#663','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#663','#556','#F00','#F00','#FF6','#FF6','#FF6','#FF6','#FF6','#FF6','#FF6','#FF6','#F00','#F00','#556','#663','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#663','#556','#F00','#F00','#FF6','#FF6','#FF6','#FF6','#FF6','#FF6','#FF6','#FF6','#F00','#F00','#556','#663','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#556','#F00','#F00','#FF6','#FF6','#FF6','#FF6','#FF6','#FF6','#FF6','#FF6','#F00','#F00','#556','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#556','#F00','#F00','#F00','#FF6','#FF6','#FF6','#FF6','#FF6','#FF6','#F00','#F00','#F00','#556','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#556','#F00','#F00','#F00','#F00','#FF6','#FF6','#FF6','#FF6','#F00','#F00','#F00','#F00','#556','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#556','#556','#F00','#F00','#F00','#F00','#F00','#F00','#F00','#F00','#F00','#F00','#F00','#F00','#556','#556','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#556','#556','#556','#556','#F00','#F00','#F00','#F00','#F00','#F00','#F00','#F00','#F00','#F00','#556','#556','#556','#556','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#556','#556','#556','#556','#556','#556','#990','#990','#990','#990','#990','#990','#990','#990','#556','#556','#556','#556','#556','#556','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#556','#556','#556','#556','#556','#556','#990','#990','#990','#990','#FF4','#FF4','#990','#990','#990','#990','#556','#556','#556','#556','#556','#556','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#556','#556','#556','#556','#556','#990','#990','#990','#990','#FF4','#FF6','#FF6','#FF4','#990','#990','#990','#990','#556','#556','#556','#556','#556','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#556','#556','#556','#556','#990','#990','#990','#990','#FF4','#FF6','#FF6','#FF6','#FF6','#FF4','#990','#990','#990','#990','#556','#556','#556','#556','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#556','#556','#990','#990','#990','#990','#FF4','#FF6','#FF6','#FF6','#FF6','#FF6','#FF6','#FF4','#990','#990','#990','#990','#556','#556','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#990','#990','#990','#990','#FF4','#FF6','#FF6','#FF6','#FF6','#FF6','#FF6','#FF6','#FF6','#FF4','#990','#990','#990','#990','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#990','#990','#990','#990','#FF4','#FF6','#FF6','#FF4','#FF4','#FF4','#FF4','#FF6','#FF6','#FF4','#990','#990','#990','#990','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#990','#990','#990','#990','#FF4','#FF4','#990','#990','#990','#990','#FF4','#FF4','#990','#990','#990','#990','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#990','#990','#990','#990','#990','#990','#990','#990','#990','#990','#990','#990','#990','#990','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#990','#990','#990','#990','#990','#990','#990','#990','#990','#990','#990','#990','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#556','#556','#556','#556','#556','#556','#556','#556','#556','#556','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#556','#556','#556','#556','#556','#556','#556','#556','#556','#556','#556','#556','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#556','#556','#556','#556','#556','#222','#222','#222','#222','#556','#556','#556','#556','#556','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#556','#556','#556','#556','#556','#222','#222','#222','#222','#222','#222','#556','#556','#556','#556','#556','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#556','#556','#556','#556','#556','#222','#8B5E','#8B5E','#222','#222','#8B5E','#8B5E','#222','#556','#556','#556','#556','#556','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#556','#556','#556','#556','#556','#222','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#222','#556','#556','#556','#556','#556','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#556','#556','#556','#556','#556','#222','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#222','#556','#556','#556','#556','#556','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#556','#556','#556','#556','#556','#222','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#222','#556','#556','#556','#556','#556','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#556','#556','#556','#222','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#8B5E','#222','#556','#556','#556','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
            ['#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222','#222'],
        ], 3);
    }
}
