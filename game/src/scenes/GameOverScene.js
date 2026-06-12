// GameOverScene - shown when player loses all lives
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this._transitioning = false;
        this._score = data.score ?? 0;
        this._level = (data.level ?? 0) + 1;
        this._saveSlot = data.saveSlot !== undefined ? data.saveSlot : null;
        this._coinsCollected = data.coinsCollected ?? 0;
        this._totalCoins = data.totalCoins ?? 0;
        this._timeSeconds = data.timeSeconds ?? 0;
        console.log('[GOS] init() — score:', this._score, 'level:', this._level,
            'saveSlot:', this._saveSlot, 'coins:', this._coinsCollected + '/' + this._totalCoins);
    }

    create() {
        const score = this._score;
        const level = this._level;
        const coinsCollected = this._coinsCollected;
        const totalCoins = this._totalCoins;
        const timeSeconds = this._timeSeconds;

        // Load best score from save for display
        let bestScore = score;
        if (this._saveSlot !== null) {
            const saveData = SaveManager.load(this._saveSlot);
            if (saveData && saveData.score > bestScore) {
                bestScore = saveData.score;
            }
        }

        this.cameras.main.fadeIn(500);
        this.cameras.main.setBackgroundColor('#0d0d0d');

        // ── Background layers ──
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0d0d0d).setDepth(-10);
        this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a0000, 0.6).setDepth(-10);
        // Dark gradient rising from bottom
        const gradOverlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT, GAME_WIDTH, 200, 0x330000, 0.3);
        gradOverlay.setOrigin(0.5, 1);

        // ── Decorative top/bottom borders ──
        const deco = this.add.graphics();
        deco.fillStyle(0xFF3333, 0.15);
        deco.fillRect(0, 0, GAME_WIDTH, 3);
        deco.fillRect(0, GAME_HEIGHT - 3, GAME_WIDTH, 3);
        deco.fillStyle(0xFF3333, 0.08);
        deco.fillRect(0, 50, GAME_WIDTH, 1);
        deco.fillRect(0, GAME_HEIGHT - 50, GAME_WIDTH, 1);

        // ── Small decorative gear icons ──
        this._drawSmallGear(80, 360, 8, 5, 0x8B0000, 0.25);
        this._drawSmallGear(720, 100, 6, 4, 0x8B0000, 0.2);
        this._drawSmallGear(700, 380, 7, 4, 0x6B0000, 0.15);

        // ── "GAME OVER" title with scale-in ──
        const gameOverText = this.add.text(GAME_WIDTH / 2, 80, 'GAME OVER', {
            fontSize: '48px', fontFamily: 'monospace', color: '#FF3333', fontStyle: 'bold',
            stroke: '#440000', strokeThickness: 4
        }).setOrigin(0.5);
        gameOverText.setScale(0);

        this.tweens.add({
            targets: gameOverText, scale: 1, duration: 600, ease: 'Back.easeOut'
        });

        // Camera shake on appear
        this.cameras.main.shake(300, 0.01);

        // ── Stats panel ──
        const panelY = 145;
        const panelX = GAME_WIDTH / 2;
        const panelW = 340;
        const panelH = 130;

        // Panel background
        const panel = this.add.graphics();
        panel.fillStyle(0x1a0a0a, 0.7);
        panel.fillRoundedRect(panelX - panelW/2, panelY - panelH/2, panelW, panelH, 8);
        panel.lineStyle(1, 0x553333, 0.5);
        panel.strokeRoundedRect(panelX - panelW/2, panelY - panelH/2, panelW, panelH, 8);

        // Panel: Level
        this.add.text(panelX - 120, panelY - 45, 'LEVEL', {
            fontSize: '11px', fontFamily: 'monospace', color: '#AAAAAA'
        });
        this.add.text(panelX + 120, panelY - 45, '' + level, {
            fontSize: '16px', fontFamily: 'monospace', color: '#FFD700', fontStyle: 'bold'
        }).setOrigin(1, 0);

        // Panel: Score
        this.add.text(panelX - 120, panelY - 15, 'SCORE', {
            fontSize: '11px', fontFamily: 'monospace', color: '#AAAAAA'
        });
        const scoreText = this.add.text(panelX + 120, panelY - 15, '' + score, {
            fontSize: '20px', fontFamily: 'monospace', color: '#FFFFFF', fontStyle: 'bold'
        }).setOrigin(1, 0);

        // Score pop-in animation
        scoreText.setScale(0);
        this.tweens.add({
            targets: scoreText, scale: 1, duration: 500, delay: 300, ease: 'Back.easeOut'
        });

        // Panel: Coins
        const coinColor = coinsCollected >= totalCoins && totalCoins > 0 ? '#FFD700' : '#88FF88';
        this.add.text(panelX - 120, panelY + 15, 'COINS', {
            fontSize: '11px', fontFamily: 'monospace', color: '#AAAAAA'
        });
        this.add.text(panelX + 120, panelY + 15, coinsCollected + ' / ' + totalCoins, {
            fontSize: '16px', fontFamily: 'monospace', color: coinColor, fontStyle: 'bold'
        }).setOrigin(1, 0);

        // Panel: Time survived
        const mins = Math.floor(timeSeconds / 60);
        const secs = timeSeconds % 60;
        const timeStr = mins + ':' + (secs < 10 ? '0' : '') + secs;
        this.add.text(panelX - 120, panelY + 45, 'TIME', {
            fontSize: '11px', fontFamily: 'monospace', color: '#AAAAAA'
        });
        this.add.text(panelX + 120, panelY + 45, timeStr, {
            fontSize: '16px', fontFamily: 'monospace', color: '#FF8888', fontStyle: 'bold'
        }).setOrigin(1, 0);

        // ── Best score hint ──
        if (bestScore > 0) {
            this.add.text(GAME_WIDTH / 2, panelY + panelH / 2 + 18, 'BEST: ' + bestScore, {
                fontSize: '13px', fontFamily: 'monospace', color: '#888888',
                fontStyle: 'italic'
            }).setOrigin(0.5);
        }

        // ── Interactive buttons with scale-in stagger ──
        const makeButton = (x, y, text, callback, delay) => {
            const bg = this.add.rectangle(x, y, 280, 50, 0x444444, 0.9)
                .setStrokeStyle(2, 0x888888)
                .setInteractive({ useHandCursor: true });

            const label = this.add.text(x, y, text, {
                fontSize: '18px', fontFamily: 'monospace', color: '#FFFFFF', fontStyle: 'bold'
            }).setOrigin(0.5);

            // Scale-in animation
            bg.setScale(0);
            label.setScale(0);
            this.tweens.add({
                targets: [bg, label], scale: 1, duration: 400, delay: delay || 0, ease: 'Back.easeOut'
            });

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
                callback();
            });
            return { bg, label };
        };

        // Retry button — passes saveSlot through
        makeButton(GAME_WIDTH / 2, 310, '▶  RETRY', () => {
            const retryLevel = this._level - 1;
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene', {
                    level: retryLevel,
                    score: 0,
                    lives: INITIAL_LIVES,
                    saveSlot: this._saveSlot
                });
            });
        }, 500);

        // Menu button — with fade transition
        makeButton(GAME_WIDTH / 2, 370, '☰  MAIN MENU', () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainMenuScene');
            });
        }, 650);

        // ── Keyboard shortcuts ──
        const restartGame = () => {
            const retryLevel = this._level - 1;
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene', {
                    level: retryLevel,
                    score: 0,
                    lives: INITIAL_LIVES,
                    saveSlot: this._saveSlot
                });
            });
        };
        this.input.keyboard.on('keydown-SPACE', restartGame);
        this.input.keyboard.on('keydown-ENTER', restartGame);

        this.input.keyboard.on('keydown-M', () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainMenuScene');
            });
        });

        // ── Tap anywhere to retry (mobile-friendly, ignores buttons) ──
        this.input.on('pointerdown', (pointer) => {
            if (this._transitioning) return;
            const hits = this.input.hitTestPointer(pointer);
            if (hits.length > 0) return;
            this._transitioning = true;
            restartGame();
        });

        // ── Blinking "press space" hint ──
        const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 20, 'PRESS SPACE TO RETRY  •  M FOR MENU', {
            fontSize: '11px', fontFamily: 'monospace', color: '#666666'
        }).setOrigin(0.5);
        this.tweens.add({
            targets: hint, alpha: 0.3, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
    }

    // ── Helper: draw a small decorative gear ──
    _drawSmallGear(cx, cy, radius, teeth, color, alpha) {
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
        g.fillStyle(0x0d0d0d, 0.7);
        g.fillCircle(cx, cy, radius * 0.35);
        g.fillStyle(color, alpha * 1.2);
        g.fillCircle(cx, cy, radius * 0.15);
    }
}
