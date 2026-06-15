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
        const MAX_HEART_SLOTS = 6;
        for (let i = 0; i < MAX_HEART_SLOTS; i++) {
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
            if (i >= this.lives) h.setVisible(false);
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

        // ── Persistent gear count ──
        this.gearText = this.add.text(W - 50, HUD.HEART_OFFSET_Y + 8, '\u2699 0', {
            fontFamily: HUD.FONT_FAMILY,
            fontSize: '12px',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(200);

        // ── Persistent coin count ──
        this.coinCountText = this.add.text(W - 50, HUD.HEART_OFFSET_Y + 26, '\u25B6 0', {
            fontFamily: HUD.FONT_FAMILY,
            fontSize: '12px',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(200);

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

        // ── Listen for gear updates from GameScene ──
        gameScene.events.on('updateGear', (gear) => {
            if (this.gearText) {
                this.gearText.setText('\u2699 ' + gear);
                // Pop animation
                this.tweens.add({
                    targets: this.gearText,
                    scaleX: 1.3, scaleY: 1.3,
                    duration: 100, yoyo: true, ease: 'Quad.easeOut'
                });
            }
        });

        // ── Listen for coin count updates from GameScene ──
        gameScene.events.on('updateCoinsCount', (coins) => {
            if (this.coinCountText) {
                this.coinCountText.setText('\u25B6 ' + coins);
                this.tweens.add({
                    targets: this.coinCountText,
                    scaleX: 1.3, scaleY: 1.3,
                    duration: 100, yoyo: true, ease: 'Quad.easeOut'
                });
            }
        });

        // ── Mute button (bottom-right, above touch controls) ──
        const MUTE_X = GAME_WIDTH - 28;
        const MUTE_Y = GAME_HEIGHT - 90;
        let muted = false;
        try { muted = localStorage.getItem('cogsworth_muted') === '1'; } catch(e) {}
        try { this.scene.systems.game.sound.mute = muted; } catch(e) {}

        const muteBtn = this.add.graphics()
            .setScrollFactor(0).setDepth(500).setInteractive(
                new Phaser.Geom.Rectangle(MUTE_X - 14, MUTE_Y - 14, 28, 28),
                Phaser.Geom.Rectangle.Contains
            );

        const drawMuteIcon = (g, x, y, isMuted) => {
            g.clear();
            g.fillStyle(0x000000, 0.4);
            g.fillRoundedRect(x - 14, y - 14, 28, 28, 4);
            g.fillStyle(0xFFFFFF, isMuted ? 0.4 : 0.9);
            g.fillRect(x - 8, y - 4, 6, 8);    // speaker body
            g.fillTriangle(x - 2, y - 7, x + 5, y - 12, x + 5, y + 12, x - 2, y + 7); // cone
            if (!isMuted) {
                g.lineStyle(2, 0xFFFFFF, 0.9);
                g.strokeCircle(x + 7, y, 4);
                g.strokeCircle(x + 7, y, 8);
            } else {
                g.lineStyle(2, 0xFF4444, 0.9);
                g.lineBetween(x + 4, y - 6, x + 12, y + 6);
                g.lineBetween(x + 12, y - 6, x + 4, y + 6);
            }
        };

        drawMuteIcon(muteBtn, MUTE_X, MUTE_Y, muted);

        muteBtn.on('pointerdown', () => {
            muted = !muted;
            try {
                this.scene.systems.game.sound.mute = muted;
                localStorage.setItem('cogsworth_muted', muted ? '1' : '0');
            } catch(e) {}
            drawMuteIcon(muteBtn, MUTE_X, MUTE_Y, muted);
            this.tweens.add({ targets: muteBtn, alpha: 0.5, duration: 80, yoyo: true });
        });

        // ── Wrench cooldown indicator (above mute button) ──
        const WRENCH_X = GAME_WIDTH - 28;
        const WRENCH_Y = GAME_HEIGHT - 120;
        const barW = 22;
        const barH = 3;

        // Wrench icon
        this.wrenchIcon = this.add.text(WRENCH_X, WRENCH_Y, '\u2699', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(500);

        // Cooldown bar background
        this.wrenchCooldownBg = this.add.graphics().setScrollFactor(0).setDepth(500);
        this.wrenchCooldownBg.fillStyle(0x333333, 0.8);
        this.wrenchCooldownBg.fillRoundedRect(WRENCH_X - barW / 2, WRENCH_Y + 10, barW, barH, 1);

        // Cooldown bar fill (starts full)
        this.wrenchCooldownFill = this.add.graphics().setScrollFactor(0).setDepth(501);
        this.wrenchCooldownFill.fillStyle(0xFFD700, 0.9);
        this.wrenchCooldownFill.fillRoundedRect(WRENCH_X - barW / 2, WRENCH_Y + 10, barW, barH, 1);

        // Listen for cooldown events
        this._wrenchReady = true;
        gameScene.events.on('wrenchReady', () => {
            this._wrenchReady = true;
            if (this.wrenchIcon) this.wrenchIcon.setColor('#FFD700');
            this.wrenchCooldownFill.clear();
            this.wrenchCooldownFill.fillStyle(0xFFD700, 0.9);
            this.wrenchCooldownFill.fillRoundedRect(WRENCH_X - barW / 2, WRENCH_Y + 10, barW, barH, 1);
        });

        gameScene.events.on('wrenchThrown', () => {
            this._wrenchReady = false;
            if (this.wrenchIcon) this.wrenchIcon.setColor('#666666');
            // Animate cooldown bar shrinking over WRENCH_COOLDOWN ms
            this.wrenchCooldownFill.clear();
            this.wrenchCooldownFill.fillStyle(0xFFD700, 0.9);
            this.wrenchCooldownFill.fillRoundedRect(WRENCH_X - barW / 2, WRENCH_Y + 10, barW, barH, 1);

            // Use a tween to animate the bar
            const tempRect = { w: barW };
            this.tweens.add({
                targets: tempRect,
                w: 0,
                duration: WRENCH_COOLDOWN,
                ease: 'Linear',
                onUpdate: () => {
                    if (this.wrenchCooldownFill && this.wrenchCooldownFill.active) {
                        this.wrenchCooldownFill.clear();
                        this.wrenchCooldownFill.fillStyle(0xFFD700, 0.9);
                        this.wrenchCooldownFill.fillRoundedRect(
                            WRENCH_X - barW / 2, WRENCH_Y + 10,
                            tempRect.w, barH, 1
                        );
                    }
                }
            });
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
        const MAX_HEART_SLOTS = 6;
        for (let i = 0; i < MAX_HEART_SLOTS; i++) {
            if (!this.hearts[i]) continue;
            const shouldFill = i < lives;
            const wasFull = this.hearts[i].texture.key === 'heart-full';
            this.hearts[i].setTexture(shouldFill ? 'heart-full' : 'heart-empty');
            this.hearts[i].setVisible(true);

            if (!wasFull && shouldFill) {
                // Power-up gained — golden flash
                this.tweens.add({
                    targets: this.hearts[i],
                    scaleX: 1.5, scaleY: 1.5,
                    duration: 200, yoyo: true, ease: 'Quad.easeOut',
                    onComplete: () => this.hearts[i].setTint(0xFFD700),
                });
            } else if (wasFull && !shouldFill) {
                this.tweens.add({
                    targets: this.hearts[i],
                    scaleX: SPECTACLE.HEART_PULSE_SCALE,
                    scaleY: SPECTACLE.HEART_PULSE_SCALE,
                    duration: SPECTACLE.HEART_PULSE_DURATION / 2,
                    yoyo: true, ease: 'Quad.easeOut'
                });
            }
        }
    }
}
