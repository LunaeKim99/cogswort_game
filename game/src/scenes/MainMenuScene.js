// MainMenuScene - game title screen
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        this.cameras.main.fadeIn(500);
        this.cameras.main.setBackgroundColor('#1a1a2e');

        // Background
        this.add.rectangle(400, 225, 800, 450, 0x1a1a2e);

        // ── Visual polish: ambient floating particles (steampunk dust) ──
        for (let i = 0; i < 20; i++) {
            const px = Phaser.Math.Between(0, 800);
            const py = Phaser.Math.Between(0, 450);
            const size = Phaser.Math.Between(1, 3);
            const dust = this.add.rectangle(px, py, size, size, 0xFFD700, Phaser.Math.FloatBetween(0.1, 0.4));
            this.tweens.add({
                targets: dust,
                y: py - Phaser.Math.Between(50, 150),
                x: px + Phaser.Math.Between(-40, 40),
                alpha: 0,
                duration: Phaser.Math.Between(3000, 6000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 4000),
                onRepeat: () => {
                    dust.x = Phaser.Math.Between(0, 800);
                    dust.y = Phaser.Math.Between(300, 450);
                    dust.alpha = Phaser.Math.FloatBetween(0.1, 0.4);
                }
            });
        }

        // Decorative gears
        this._drawGear(120, 200, 30, 8, 0x4a4a6e, 0.5);
        this._drawGear(680, 250, 22, 6, 0x3a3a5e, 0.4);
        this._drawGear(650, 380, 16, 5, 0x2a2a4e, 0.3);

        // Platform silhouette
        const gfx = this.add.graphics();
        gfx.fillStyle(0x2a2a4e, 0.6);
        gfx.fillRect(0, 430, 800, 20);
        gfx.fillStyle(0x3a3a5e, 0.4);
        gfx.fillRect(50, 420, 200, 10);
        gfx.fillRect(550, 420, 200, 10);

        // Title
        const title = this.add.text(400, 100, 'COGSWORTH: LAST WIND', {
            fontSize: '36px', fontFamily: 'monospace', color: '#FFD700', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: title, y: 105, duration: 2500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        // Subtitle
        this.add.text(400, 150, 'A Steampunk Platformer', {
            fontSize: '16px', fontFamily: 'monospace', color: '#FFFFFF'
        }).setOrigin(0.5);

        // ── Visual polish: start button with hover effects ──
        const makeButton = (x, y, text, callback) => {
            const bg = this.add.rectangle(x, y, 300, 50, 0x444466, 0.9)
                .setStrokeStyle(2, 0x8888AA)
                .setInteractive({ useHandCursor: true });

            const label = this.add.text(x, y, text, {
                fontSize: '18px', fontFamily: 'monospace', color: '#FFFFFF', fontStyle: 'bold'
            }).setOrigin(0.5);

            bg.on('pointerover', () => {
                this.tweens.add({ targets: [bg, label], scaleX: 1.06, scaleY: 1.06, duration: 100 });
                bg.setFillStyle(0x6666AA);
                bg.setStrokeStyle(2, 0xFFD700);
                label.setColor('#FFD700');
            });
            bg.on('pointerout', () => {
                this.tweens.add({ targets: [bg, label], scaleX: 1, scaleY: 1, duration: 100 });
                bg.setFillStyle(0x444466);
                bg.setStrokeStyle(2, 0x8888AA);
                label.setColor('#FFFFFF');
            });
            bg.on('pointerdown', () => {
                this.tweens.add({ targets: [bg, label], scaleX: 0.95, scaleY: 0.95, duration: 50 });
            });
            bg.on('pointerup', () => callback());
            return { bg, label };
        };

        // Start button
        const startGame = () => {
            try { this.sound.play('sfx-tap'); } catch(e) {}
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene', { level: 0, score: 0, lives: INITIAL_LIVES });
            });
        };
        makeButton(400, 260, '▶  START GAME', startGame);

        // Keyboard shortcuts
        this.input.keyboard.on('keydown-SPACE', startGame);
        this.input.keyboard.on('keydown-ENTER', startGame);

        // Controls info
        this.add.text(400, 320, 'ARROW KEYS / WASD - MOVE & JUMP', {
            fontSize: '12px', fontFamily: 'monospace', color: '#888888'
        }).setOrigin(0.5);

        this.add.text(400, 338, 'STOMP ENEMIES FROM ABOVE!', {
            fontSize: '12px', fontFamily: 'monospace', color: '#FFD700'
        }).setOrigin(0.5);

        this.add.text(400, 400, 'TOUCH BUTTONS ON MOBILE', {
            fontSize: '12px', fontFamily: 'monospace', color: '#888888'
        }).setOrigin(0.5);
    }

    _drawGear(cx, cy, radius, teeth, color, alpha) {
        const g = this.add.graphics();
        g.fillStyle(color, alpha);
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
        g.fillStyle(0x1a1a2e, 0.8);
        g.fillCircle(cx, cy, radius * 0.35);
        g.fillStyle(color, alpha * 1.2);
        g.fillCircle(cx, cy, radius * 0.18);
    }
}
