// ModeSelectScene — choose New Game, Load Game, or Level Select
class ModeSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ModeSelectScene' });
    }

    create() {
        this.cameras.main.fadeIn(500);
        this.cameras.main.setBackgroundColor('#1a1a2e');

        // Background
        this.add.rectangle(400, 225, 800, 450, 0x1a1a2e);

        // ── Ambient dust particles ──
        for (let i = 0; i < 15; i++) {
            const px = Phaser.Math.Between(0, 800);
            const py = Phaser.Math.Between(0, 450);
            const size = Phaser.Math.Between(1, 3);
            const dust = this.add.rectangle(px, py, size, size, 0xFFD700, Phaser.Math.FloatBetween(0.1, 0.3));
            this.tweens.add({
                targets: dust,
                y: py - Phaser.Math.Between(50, 120),
                x: px + Phaser.Math.Between(-30, 30),
                alpha: 0,
                duration: Phaser.Math.Between(3000, 5000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 3000),
                onRepeat: () => {
                    dust.x = Phaser.Math.Between(0, 800);
                    dust.y = Phaser.Math.Between(300, 450);
                    dust.alpha = Phaser.Math.FloatBetween(0.1, 0.3);
                }
            });
        }

        // Title
        this.add.text(400, 60, 'SELECT MODE', {
            fontSize: '28px', fontFamily: 'monospace', color: '#FFD700', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Separator
        const sep = this.add.graphics();
        sep.lineStyle(1, 0xFFD700, 0.3);
        sep.lineBetween(200, 85, 600, 85);

        // ── Button factory ──
        const makeBtn = (x, y, text, desc, callback) => {
            const bg = this.add.rectangle(x, y, 340, 64, 0x444466, 0.9)
                .setStrokeStyle(2, 0x8888AA)
                .setInteractive({ useHandCursor: true });

            const label = this.add.text(x, y - 8, text, {
                fontSize: '18px', fontFamily: 'monospace', color: '#FFFFFF', fontStyle: 'bold'
            }).setOrigin(0.5);

            const sublabel = this.add.text(x, y + 16, desc, {
                fontSize: '10px', fontFamily: 'monospace', color: '#AAAAAA'
            }).setOrigin(0.5);

            bg.on('pointerover', () => {
                this.tweens.add({ targets: [bg, label, sublabel], scaleX: 1.04, scaleY: 1.04, duration: 80 });
                bg.setFillStyle(0x6666AA);
                bg.setStrokeStyle(2, 0xFFD700);
                label.setColor('#FFD700');
            });
            bg.on('pointerout', () => {
                this.tweens.add({ targets: [bg, label, sublabel], scaleX: 1, scaleY: 1, duration: 80 });
                bg.setFillStyle(0x444466);
                bg.setStrokeStyle(2, 0x8888AA);
                label.setColor('#FFFFFF');
            });
            bg.on('pointerdown', () => {
                this.tweens.add({ targets: [bg, label, sublabel], scaleX: 0.96, scaleY: 0.96, duration: 40 });
            });
            bg.on('pointerup', () => callback());
            return { bg, label, sublabel };
        };

        // ── NEW GAME — pick an empty slot ──
        makeBtn(400, 150, '★  NEW GAME', 'Start fresh in a new save slot', () => {
            try { this.sound.play('sfx-tap'); } catch(e) {}
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('SlotSelectScene', { mode: 'new' });
            });
        });

        // ── LOAD GAME — pick a saved slot ──
        makeBtn(400, 235, '📂  LOAD GAME', 'Continue from a saved slot', () => {
            try { this.sound.play('sfx-tap'); } catch(e) {}
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('SlotSelectScene', { mode: 'load' });
            });
        });

        // ── LEVEL SELECT ──
        makeBtn(400, 320, '🗺  LEVEL SELECT', 'Pick any unlocked level', () => {
            try { this.sound.play('sfx-tap'); } catch(e) {}
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('LevelSelectScene');
            });
        });

        // ── Back button ──
        const backBg = this.add.rectangle(60, 420, 100, 30, 0x333344, 0.8)
            .setStrokeStyle(1, 0x666688)
            .setInteractive({ useHandCursor: true });
        const backLabel = this.add.text(60, 420, '◀  BACK', {
            fontSize: '12px', fontFamily: 'monospace', color: '#AAAAAA'
        }).setOrigin(0.5);

        backBg.on('pointerover', () => { backLabel.setColor('#FFD700'); backBg.setStrokeStyle(1, 0xFFD700); });
        backBg.on('pointerout', () => { backLabel.setColor('#AAAAAA'); backBg.setStrokeStyle(1, 0x666688); });
        backBg.on('pointerup', () => {
            try { this.sound.play('sfx-tap'); } catch(e) {}
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainMenuScene');
            });
        });

        // Keyboard shortcuts
        this.input.keyboard.on('keydown-ESC', () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainMenuScene');
            });
        });
    }
}
