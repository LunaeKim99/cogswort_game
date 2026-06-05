// WinScene - shown when all levels are completed
class WinScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WinScene' });
    }

    create() {
        const data = this.scene.settings.data || {};
        const score = data.score ?? 0;

        // Stop bgm if playing
        try {
            const bgm = this.sound.get('bgm-main');
            if (bgm && bgm.isPlaying) bgm.fadeOut(800);
        } catch(e) {}

        this.cameras.main.fadeIn(500);
        this.cameras.main.setBackgroundColor('#2a1a0e');

        // Background
        this.add.rectangle(400, 225, 800, 450, 0x2a1a0e);

        // Gold decorations
        const deco = this.add.graphics();
        deco.fillStyle(0xFFD700, 0.08);
        deco.fillRect(100, 60, 600, 1);
        deco.fillRect(100, 390, 600, 1);

        // Decorative gears
        this._drawSmallGear(100, 180, 10, 6, 0x8B6914, 0.3);
        this._drawSmallGear(700, 280, 8, 5, 0x8B6914, 0.25);
        this._drawSmallGear(660, 160, 7, 4, 0x6B4914, 0.2);

        // "VICTORY!" title with scale-in
        const victoryText = this.add.text(400, 80, 'VICTORY!', {
            fontSize: '52px', fontFamily: 'monospace', color: '#FFD700', fontStyle: 'bold',
            stroke: '#8B6914', strokeThickness: 6
        }).setOrigin(0.5);
        victoryText.setScale(0);

        this.tweens.add({
            targets: victoryText, scale: 1, duration: 800, ease: 'Back.easeOut'
        });

        // Subtitle
        const subtitle = this.add.text(400, 130, 'COGSWORTH LIVES ANOTHER DAY...', {
            fontSize: '18px', fontFamily: 'monospace', color: '#FFFFFF'
        }).setOrigin(0.5);
        subtitle.setAlpha(0);

        this.tweens.add({
            targets: subtitle, alpha: 1, duration: 1200, delay: 500, ease: 'Sine.easeIn'
        });

        // Final score
        this.add.text(400, 210, 'FINAL SCORE: ' + score, {
            fontSize: '28px', fontFamily: 'monospace', color: '#FFD700', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Congratulations
        this.add.text(400, 260, 'CONGRATULATIONS!', {
            fontSize: '18px', fontFamily: 'monospace', color: '#FFFFFF'
        }).setOrigin(0.5);

        // Thanks
        this.add.text(400, 310, 'THANKS FOR PLAYING!', {
            fontSize: '16px', fontFamily: 'monospace', color: '#CCCCCC'
        }).setOrigin(0.5);

        // Blinking replay text
        const replayText = this.add.text(400, 380, 'PRESS SPACE OR TAP TO PLAY AGAIN', {
            fontSize: '16px', fontFamily: 'monospace', color: '#FFFFFF', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: replayText, alpha: 0.2, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        // Menu hint
        this.add.text(400, 415, 'PRESS M FOR MENU', {
            fontSize: '12px', fontFamily: 'monospace', color: '#888888'
        }).setOrigin(0.5);

        // Input: Play again
        const playAgain = () => {
            this.scene.start('GameScene', { level: 0, score: 0, lives: INITIAL_LIVES });
        };

        this.input.keyboard.on('keydown-SPACE', playAgain);
        this.input.keyboard.on('keydown-ENTER', playAgain);
        this.input.on('pointerdown', playAgain);

        // Input: Main menu
        this.input.keyboard.on('keydown-M', () => {
            this.scene.start('MainMenuScene');
        });
    }

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
        g.fillStyle(0x2a1a0e, 0.8);
        g.fillCircle(cx, cy, radius * 0.35);
        g.fillStyle(color, alpha * 1.2);
        g.fillCircle(cx, cy, radius * 0.15);
    }
}
