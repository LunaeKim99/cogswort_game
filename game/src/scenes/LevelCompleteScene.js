// LevelCompleteScene - shown between levels with star rating
class LevelCompleteScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelCompleteScene' });
    }

    init(data) {
        this.score = data.score || 0;
        this.level = data.level || 0;
        this.nextLevel = data.nextLevel || 0;
        this.lives = data.lives || 3;
        this.saveSlot = data.saveSlot !== undefined ? data.saveSlot : null;
        this.stars = data.stars || { stars: 1, coinsCollected: 0, totalCoins: 0, timeSeconds: 0 };
    }

    create() {
        this.cameras.main.fadeIn(500);
        console.log('[LCS] create() - nextLevel:', this.nextLevel, 'score:', this.score, 'lives:', this.lives, 'saveSlot:', this.saveSlot);
        this.cameras.main.setBackgroundColor('#1a2a1a');

        // Background
        this.add.rectangle(400, 225, 800, 450, 0x1a2a1a);

        // Decorative borders
        const deco = this.add.graphics();
        deco.fillStyle(0x2a4a2a, 0.5);
        deco.fillRect(0, 0, 800, 4);
        deco.fillRect(0, 446, 800, 4);
        deco.fillStyle(0x3a5a3a, 0.3);
        deco.fillRect(0, 60, 800, 1);
        deco.fillRect(0, 360, 800, 1);

        // ── "LEVEL COMPLETE!" with scale-in ──
        const completeText = this.add.text(400, 45, 'LEVEL COMPLETE!', {
            fontSize: '36px', fontFamily: 'monospace', color: '#44FF44', fontStyle: 'bold',
            stroke: '#004400', strokeThickness: 4
        }).setOrigin(0.5);
        completeText.setScale(0);

        this.tweens.add({
            targets: completeText, scale: 1, duration: 600, ease: 'Back.easeOut'
        });

        // ── Level info ──
        const lvl = levels[this.level];
        const district = lvl ? lvl.district : ('Level ' + (this.level + 1));
        const subName = lvl ? lvl.subName : '';
        const districtLevel = lvl ? lvl.districtLevel : (this.level + 1);
        const globalLevel = this.level + 1;
        const totalLevels = levels.length;

        this.add.text(400, 78, district, {
            fontSize: '14px', fontFamily: 'monospace', color: '#FFD700'
        }).setOrigin(0.5);

        this.add.text(400, 98, subName + ' — CLEARED', {
            fontSize: '18px', fontFamily: 'monospace', color: '#88FF88'
        }).setOrigin(0.5);

        this.add.text(400, 118, 'DISTRICT LEVEL ' + districtLevel + '/5  •  OVERALL ' + globalLevel + '/' + totalLevels, {
            fontSize: '11px', fontFamily: 'monospace', color: '#AAAAAA'
        }).setOrigin(0.5);

        // ── Star rating ──
        const starCount = this.stars.stars;
        const starY = 165;
        const starSpacing = 50;
        const starStartX = 400 - (starSpacing * 1); // 2 stars spacing for 3 stars centered

        // Draw each star (filled or empty) with sequential pop-in
        for (let i = 0; i < 3; i++) {
            const x = starStartX + i * starSpacing;
            const filled = i < starCount;
            const starSize = 22;

            // Draw star shape using graphics
            const g = this.add.graphics();
            const color = filled ? 0xFFD700 : 0x555555;
            const alpha = filled ? 1.0 : 0.3;
            this._drawStar(g, x, starY, 5, starSize, starSize * 0.4, color, alpha);

            // Pop-in animation with stagger
            g.setScale(0);
            this.tweens.add({
                targets: g,
                scale: 1,
                duration: 400,
                delay: 200 + i * 200,
                ease: 'Back.easeOut'
            });

            // For filled stars, add a glow pulse
            if (filled) {
                this.tweens.add({
                    targets: g,
                    alpha: 0.7,
                    duration: 800,
                    delay: 600 + i * 200,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        }

        // ── Stats panel ──
        const panelY = 210;
        const panelX = 400;
        const panelW = 320;
        const panelH = 120;

        // Panel background
        const panel = this.add.graphics();
        panel.fillStyle(0x0a1a0a, 0.6);
        panel.fillRoundedRect(panelX - panelW/2, panelY - panelH/2, panelW, panelH, 8);
        panel.lineStyle(1, 0x3a6a3a, 0.6);
        panel.strokeRoundedRect(panelX - panelW/2, panelY - panelH/2, panelW, panelH, 8);

        // Stats: coins
        const cCollected = this.stars.coinsCollected;
        const cTotal = this.stars.totalCoins;
        const coinColor = cCollected >= cTotal ? '#FFD700' : '#88FF88';
        this.add.text(panelX - 120, panelY - 40, 'COINS', {
            fontSize: '11px', fontFamily: 'monospace', color: '#AAAAAA'
        });
        this.add.text(panelX + 120, panelY - 40, cCollected + ' / ' + cTotal, {
            fontSize: '16px', fontFamily: 'monospace', color: coinColor, fontStyle: 'bold'
        }).setOrigin(1, 0);

        // Stats: time
        const mins = Math.floor(this.stars.timeSeconds / 60);
        const secs = this.stars.timeSeconds % 60;
        const timeStr = mins + ':' + (secs < 10 ? '0' : '') + secs;
        const timeColor = this.stars.timeSeconds <= 30 ? '#44FF44' :
                          this.stars.timeSeconds <= 60 ? '#FFD700' : '#FF6666';
        this.add.text(panelX - 120, panelY - 10, 'TIME', {
            fontSize: '11px', fontFamily: 'monospace', color: '#AAAAAA'
        });
        this.add.text(panelX + 120, panelY - 10, timeStr, {
            fontSize: '16px', fontFamily: 'monospace', color: timeColor, fontStyle: 'bold'
        }).setOrigin(1, 0);

        // Stats: lives
        let livesStr = '';
        for (let i = 0; i < this.lives; i++) livesStr += '\u2764 ';
        const livesColor = this.lives === 3 ? '#44FF44' :
                           this.lives === 2 ? '#FFD700' : '#FF6666';
        this.add.text(panelX - 120, panelY + 20, 'LIVES', {
            fontSize: '11px', fontFamily: 'monospace', color: '#AAAAAA'
        });
        this.add.text(panelX + 120, panelY + 20, livesStr.trim(), {
            fontSize: '16px', fontFamily: 'monospace', color: livesColor
        }).setOrigin(1, 0);

        // Stats: score
        this.add.text(panelX - 120, panelY + 50, 'SCORE', {
            fontSize: '11px', fontFamily: 'monospace', color: '#AAAAAA'
        });
        this.add.text(panelX + 120, panelY + 50, '' + this.score, {
            fontSize: '16px', fontFamily: 'monospace', color: '#FFD700', fontStyle: 'bold'
        }).setOrigin(1, 0);

        // ── Next level prompt (blinking) ──
        const nextText = this.add.text(400, 385, 'PRESS SPACE OR TAP TO CONTINUE', {
            fontSize: '14px', fontFamily: 'monospace', color: '#FFFFFF', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: nextText, alpha: 0.2, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        // ── Input: Continue to next level ──
        const continueGame = () => {
            console.log('[LCS] continueGame() called - transitioning to level', this.nextLevel);
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                console.log('[LCS] camerafadeoutcomplete FIRED - starting GameScene with level:', this.nextLevel);
                this.scene.start('GameScene', {
                    level: this.nextLevel,
                    score: this.score,
                    lives: this.lives,
                    saveSlot: this.saveSlot
                });
            });
        };

        this.input.keyboard.on('keydown-SPACE', continueGame);
        this.input.keyboard.on('keydown-ENTER', continueGame);
        this.input.on('pointerdown', continueGame);

        // M for menu
        this.input.keyboard.on('keydown-M', () => {
            this.scene.start('MainMenuScene');
        });
    }

    // ── Draw a star polygon ──
    _drawStar(graphics, cx, cy, points, outerR, innerR, color, alpha) {
        const step = Math.PI / points;
        graphics.fillStyle(color, alpha || 1);
        graphics.beginPath();
        for (let i = 0; i < 2 * points; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = i * step - Math.PI / 2;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            if (i === 0) graphics.moveTo(x, y);
            else graphics.lineTo(x, y);
        }
        graphics.closePath();
        graphics.fillPath();
    }
}
