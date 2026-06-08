// GameOverScene - shown when player loses all lives
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this._score = data.score ?? 0;
        this._level = (data.level ?? 0) + 1;
        console.log('[GOS] init() — score:', this._score, 'level:', this._level);
    }

    create() {
        const score = this._score;
        const level = this._level;

        this.cameras.main.fadeIn(500);
        this.cameras.main.setBackgroundColor('#0d0d0d');

        // Background gradient
        this.add.rectangle(400, 225, 800, 450, 0x0d0d0d);
        this.add.rectangle(400, 225, 800, 450, 0x1a0000, 0.6);
        const gradOverlay = this.add.rectangle(400, 450, 800, 200, 0x330000, 0.3);
        gradOverlay.setOrigin(0.5, 1);

        // "GAME OVER" title
        const gameOverText = this.add.text(400, 120, 'GAME OVER', {
            fontSize: '48px', fontFamily: 'monospace', color: '#FF3333', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Camera shake
        this.cameras.main.shake(300, 0.01);

        // Score
        this.add.text(400, 200, 'SCORE: ' + score, {
            fontSize: '24px', fontFamily: 'monospace', color: '#FFFFFF'
        }).setOrigin(0.5);

        // Level
        this.add.text(400, 240, 'LEVEL ' + level, {
            fontSize: '20px', fontFamily: 'monospace', color: '#AAAAAA'
        }).setOrigin(0.5);

        // ── Visual polish: interactive buttons ──
        const makeButton = (x, y, text, callback) => {
            const bg = this.add.rectangle(x, y, 280, 50, 0x444444, 0.9)
                .setStrokeStyle(2, 0x888888)
                .setInteractive({ useHandCursor: true });

            const label = this.add.text(x, y, text, {
                fontSize: '18px', fontFamily: 'monospace', color: '#FFFFFF', fontStyle: 'bold'
            }).setOrigin(0.5);

            // Hover effects
            bg.on('pointerover', () => {
                this.tweens.add({ targets: [bg, label], scaleX: 1.06, scaleY: 1.06, duration: 100, ease: 'Quad.easeOut' });
                bg.setFillStyle(0x666666);
                bg.setStrokeStyle(2, 0xFFFFFF);
                label.setColor('#FFD700');
            });
            bg.on('pointerout', () => {
                this.tweens.add({ targets: [bg, label], scaleX: 1, scaleY: 1, duration: 100, ease: 'Quad.easeOut' });
                bg.setFillStyle(0x444444);
                bg.setStrokeStyle(2, 0x888888);
                label.setColor('#FFFFFF');
            });
            bg.on('pointerdown', () => {
                this.tweens.add({ targets: [bg, label], scaleX: 0.95, scaleY: 0.95, duration: 50 });
            });
            bg.on('pointerup', () => {
                callback();
            });
            return { bg, label };
        };

        // Retry button
        makeButton(400, 320, '▶  RETRY', () => {
            const retryLevel = this._level - 1;
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene', {
                    level: retryLevel,
                    score: 0,
                    lives: INITIAL_LIVES
                });
            });
        });

        // Menu button
        makeButton(400, 380, '☰  MAIN MENU', () => {
            this.scene.start('MainMenuScene');
        });

        // Keyboard shortcuts (still work too)
        const restartGame = () => {
            const retryLevel = this._level - 1;
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene', {
                    level: retryLevel,
                    score: 0,
                    lives: INITIAL_LIVES
                });
            });
        };
        this.input.keyboard.on('keydown-SPACE', restartGame);
        this.input.keyboard.on('keydown-ENTER', restartGame);

        this.input.keyboard.on('keydown-M', () => {
            this.scene.start('MainMenuScene');
        });
    }
}
