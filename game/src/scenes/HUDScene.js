// HUDScene - runs in parallel with GameScene, displays polished UI overlay
class HUDScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HUDScene' });
    }

    init(data) {
        this.score = data.score || 0;
        this.lives = data.lives || 3;
        this.levelName = data.levelName || '';
        this.totalCoins = data.totalCoins || 0;
        this.districtIdx = data.districtIdx !== undefined ? data.districtIdx : 0;
    }

    create() {
        const W = GAME_WIDTH;
        const H = GAME_HEIGHT;

        // ── Semi-transparent HUD panel (top area) ──
        const panel = this.add.graphics();
        panel.setScrollFactor(0).setDepth(190);
        panel.fillStyle(HUD.PANEL_COLOR, HUD.PANEL_ALPHA);
        panel.fillRoundedRect(4, 36, W - 8, 52, HUD.CORNER_RADIUS);
        // Bottom border line
        panel.lineStyle(1, 0xFFD700, 0.2);
        panel.lineBetween(10, 86, W - 10, 86);

        // ── Hearts (top-left area) ──
        this.hearts = [];
        for (let i = 0; i < INITIAL_LIVES; i++) {
            const hx = HUD.HEART_OFFSET_X + i * HUD.HEART_SPACING;
            const h = this.add.image(hx, HUD.HEART_OFFSET_Y, 'heart-full');
            h.setScrollFactor(0);
            h.setDepth(200);
            this.hearts.push(h);

            // Gentle idle pulse
            this.tweens.add({
                targets: h,
                scaleX: 1.08,
                scaleY: 1.08,
                duration: 600 + i * 150,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: i * 200
            });
        }

        // ── Score text (top-right) ──
        this.scoreText = this.add.text(W - HUD.SCORE_OFFSET_X, HUD.SCORE_OFFSET_Y, 'SCORE: ' + this.score, {
            fontFamily: HUD.FONT_FAMILY,
            fontSize: HUD.FONT_SCORE,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.scoreText.setOrigin(1, 0);
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(200);
        this.scoreText._baseText = 'SCORE: ' + this.score;

        // ── Timer (top area, center-right) ──
        this.timerText = this.add.text(W - HUD.TIMER_OFFSET_X, HUD.TIMER_OFFSET_Y, 'TIME: 00:00', {
            fontFamily: HUD.FONT_FAMILY,
            fontSize: HUD.FONT_TIMER,
            color: '#4ade80',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(200);

        this._okThreshold = TIME_THRESHOLDS[this.districtIdx].ok;
        this._fastThreshold = TIME_THRESHOLDS[this.districtIdx].fast;
        this._goodThreshold = TIME_THRESHOLDS[this.districtIdx].good;

        // ── Level name (top-center) ──
        this.levelText = this.add.text(W / 2, HUD.LEVEL_OFFSET_Y, this.levelName, {
            fontFamily: HUD.FONT_FAMILY,
            fontSize: HUD.FONT_LEVEL,
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.levelText.setOrigin(0.5, 0);
        this.levelText.setScrollFactor(0);
        this.levelText.setDepth(200);

        // ── Coin counter with mini gear icon ──
        // Draw a small gear icon
        const coinIcon = this.add.graphics().setScrollFactor(0).setDepth(200);
        drawMiniGear(coinIcon, W / 2 - 52, HUD.COIN_OFFSET_Y - 1, 6, 5, 0xFFD700);

        this.coinText = this.add.text(W / 2 - 36, HUD.COIN_OFFSET_Y, '0/' + this.totalCoins, {
            fontFamily: HUD.FONT_FAMILY,
            fontSize: HUD.FONT_COIN,
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.coinText.setOrigin(0, 0.3);
        this.coinText.setScrollFactor(0);
        this.coinText.setDepth(200);

        // "GEARS" label next to counter
        this.coinLabel = this.add.text(W / 2 + 20, HUD.COIN_OFFSET_Y, 'GEARS', {
            fontFamily: HUD.FONT_FAMILY,
            fontSize: '10px',
            color: '#AA8800',
            stroke: '#000000',
            strokeThickness: 1
        });
        this.coinLabel.setOrigin(0, 0.4);
        this.coinLabel.setScrollFactor(0);
        this.coinLabel.setDepth(200);

        // ── Coin progress bar ──
        const barX = W / 2 - HUD.PROGRESS_BAR_W / 2;
        const barY = HUD.PROGRESS_BAR_Y;
        // Background bar
        this.progressBarBg = this.add.graphics().setScrollFactor(0).setDepth(200);
        this.progressBarBg.fillStyle(0x333333, 0.6);
        this.progressBarBg.fillRoundedRect(barX, barY, HUD.PROGRESS_BAR_W, HUD.PROGRESS_BAR_H, 2);
        // Fill bar (starts at 0)
        this.progressBarFill = this.add.graphics().setScrollFactor(0).setDepth(201);
        this._updateProgressBar(0);

        // ── Listen for events from GameScene ──
        const gameScene = this.scene.get('GameScene');

        gameScene.events.on('updateScore', (score) => {
            const oldScore = this.score;
            this.score = score;
            this.scoreText._baseText = 'SCORE: ' + score;
            this.scoreText.setText(this.scoreText._baseText);

            // Score pop animation
            this.tweens.add({
                targets: this.scoreText,
                scaleX: SPECTACLE.SCORE_POP_SCALE,
                scaleY: SPECTACLE.SCORE_POP_SCALE,
                duration: SPECTACLE.SCORE_POP_DURATION / 2,
                yoyo: true,
                ease: 'Quad.easeOut'
            });
        });

        gameScene.events.on('updateLives', (lives) => {
            this.lives = lives;
            this._updateHearts(lives);
        });

        gameScene.events.on('updateCoins', ({ collected, total }) => {
            this.coinText.setText(collected + '/' + total);
            this._updateProgressBar(collected / total);
        });

        gameScene.events.on('updateTimer', ({ elapsed }) => {
            const mins = Math.floor(elapsed / 60);
            const secs = Math.floor(elapsed % 60);
            const timeStr = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
            this.timerText.setText('TIME: ' + timeStr);

            // Color based on pace
            let color;
            if (elapsed <= this._fastThreshold) color = '#4ade80';      // green — ⭐⭐⭐ pace
            else if (elapsed <= this._goodThreshold) color = '#fbbf24';  // yellow — ⭐⭐ pace
            else if (elapsed <= this._okThreshold) color = '#f87171';    // red — ⭐ pace
            else color = '#ef4444';                                       // dark red — out of time
            this.timerText.setColor(color);

            // Urgency pulse when past ok threshold
            if (elapsed > this._okThreshold) {
                if (!this._timerUrgencyTween) {
                    this._timerUrgencyTween = this.tweens.add({
                        targets: this.timerText,
                        alpha: 0.5,
                        duration: 500,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                }
            } else if (this._timerUrgencyTween) {
                this._timerUrgencyTween.destroy();
                this._timerUrgencyTween = null;
                this.timerText.setAlpha(1);
            }
        });

        // ── Screen vignette overlay (dark edges for atmosphere) ──
        const vignette = this.add.graphics().setScrollFactor(0).setDepth(300);
        vignette.fillStyle(0x000000, 0.2);
        vignette.fillRect(0, 0, W, 20);             // top
        vignette.fillRect(0, H - 15, W, 15);         // bottom
        vignette.fillRect(0, 0, 12, H);              // left
        vignette.fillRect(W - 12, 0, 12, H);          // right
    }

    // ── Progress bar update ──
    _updateProgressBar(ratio) {
        const barX = GAME_WIDTH / 2 - HUD.PROGRESS_BAR_W / 2;
        const barY = HUD.PROGRESS_BAR_Y;
        const fillW = Math.max(0, Math.min(HUD.PROGRESS_BAR_W, Math.round(ratio * HUD.PROGRESS_BAR_W)));

        this.progressBarFill.clear();
        if (fillW > 0) {
            this.progressBarFill.fillStyle(0xFFD700, 0.9);
            this.progressBarFill.fillRoundedRect(barX, barY, fillW, HUD.PROGRESS_BAR_H, 2);
            // Subtle inner glow
            this.progressBarFill.fillStyle(0xFFFF88, 0.3);
            this.progressBarFill.fillRoundedRect(barX + 1, barY + 1, Math.max(0, fillW - 2), 1, 1);
        }
    }

    // ── Hearts update ──
    _updateHearts(lives) {
        for (let i = 0; i < INITIAL_LIVES; i++) {
            const wasFull = this.hearts[i].texture.key === 'heart-full';
            this.hearts[i].setTexture(i < lives ? 'heart-full' : 'heart-empty');

            // Brief flash animation on change
            if (wasFull !== (i < lives)) {
                this.tweens.add({
                    targets: this.hearts[i],
                    scaleX: SPECTACLE.HEART_PULSE_SCALE,
                    scaleY: SPECTACLE.HEART_PULSE_SCALE,
                    duration: SPECTACLE.HEART_PULSE_DURATION / 2,
                    yoyo: true,
                    ease: 'Quad.easeOut'
                });
            }
        }
    }
}
