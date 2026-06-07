// LevelSelectScene — pick any unlocked level grouped by district
class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    create() {
        this.cameras.main.fadeIn(500);
        this.cameras.main.setBackgroundColor('#1a1a2e');

        // Scan all save slots and use the one with the most progress
        let save = null;
        let maxUnlocked = 0;
        for (let i = 0; i < 5; i++) {
            const s = SaveManager.load(i);
            if (s && s.unlockedLevels && s.unlockedLevels.length > maxUnlocked) {
                save = s;
                maxUnlocked = s.unlockedLevels.length;
            }
        }
        const unlocked = save ? save.unlockedLevels : [0];

        // ── Title ──
        this.add.text(400, 30, '— LEVEL SELECT —', {
            fontSize: '26px', fontFamily: 'monospace', color: '#FFD700', fontStyle: 'bold'
        }).setOrigin(0.5);

        // ── District columns ──
        const districtColors = [0x2d1b2e, 0x1a1a3e, 0x1a0a1e];
        const districtTextColors = ['#8B5A2B', '#4A6FA5', '#6B2FA5'];
        const colW = 240;
        const startX = 60;

        for (let d = 0; d < 3; d++) {
            const colX = startX + d * colW + colW / 2;

            // District header
            const distInfo = DISTRICTS[d];
            const header = this.add.rectangle(colX, 75, 220, 36, districtColors[d], 0.9)
                .setStrokeStyle(1, 0xFFD700, 0.5);
            this.add.text(colX, 75, distInfo.name, {
                fontSize: '13px', fontFamily: 'monospace', color: '#FFD700', fontStyle: 'bold'
            }).setOrigin(0.5);

            // 5 levels per district
            for (let lv = 0; lv < 5; lv++) {
                const levelIndex = d * 5 + lv;
                const levelData = levels[levelIndex];
                const isUnlocked = unlocked.includes(levelIndex);
                const yPos = 120 + lv * 54;

                // Level card
                const card = this.add.rectangle(colX, yPos, 210, 46, isUnlocked ? 0x333355 : 0x222233, 0.8)
                    .setStrokeStyle(1, isUnlocked ? 0x8888AA : 0x444444);

                if (!isUnlocked) {
                    card.setAlpha(0.5);
                }

                // Level number circle
                const circle = this.add.graphics();
                if (isUnlocked) {
                    circle.fillStyle(0xFFD700);
                } else {
                    circle.fillStyle(0x555555);
                }
                circle.fillCircle(colX - 85, yPos, 8);

                if (isUnlocked) {
                    this.add.text(colX - 85, yPos, '' + (lv + 1), {
                        fontSize: '10px', fontFamily: 'monospace', color: '#000000', fontStyle: 'bold'
                    }).setOrigin(0.5);
                } else {
                    this.add.text(colX - 85, yPos, '🔒', {
                        fontSize: '10px'
                    }).setOrigin(0.5);
                }

                // Level name
                this.add.text(colX + 2, yPos - 8, levelData.subName, {
                    fontSize: '12px', fontFamily: 'monospace', color: isUnlocked ? '#FFFFFF' : '#555555', fontStyle: 'bold'
                }).setOrigin(0, 0.5);

                // Difficulty label
                const diffLabel = levelData.districtLevel <= 2 ? 'Easy' :
                    levelData.districtLevel <= 4 ? 'Medium' : 'Hard';
                this.add.text(colX + 2, yPos + 10, diffLabel, {
                    fontSize: '9px', fontFamily: 'monospace', color: isUnlocked ? '#888888' : '#444444'
                }).setOrigin(0, 0.5);

                // Make interactive if unlocked
                if (isUnlocked) {
                    card.setInteractive({ useHandCursor: true });
                    card.on('pointerover', () => {
                        this.tweens.add({ targets: card, scaleX: 1.04, scaleY: 1.04, duration: 60 });
                        card.setFillStyle(0x555588);
                        card.setStrokeStyle(1, 0xFFD700);
                    });
                    card.on('pointerout', () => {
                        this.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 60 });
                        card.setFillStyle(0x333355);
                        card.setStrokeStyle(1, 0x8888AA);
                    });
                    card.on('pointerup', () => {
                        try { this.sound.play('sfx-tap'); } catch(e) {}
                        this.cameras.main.fadeOut(400, 0, 0, 0);
                        this.cameras.main.once('camerafadeoutcomplete', () => {
                            this.scene.start('GameScene', { level: levelIndex, score: 0, lives: INITIAL_LIVES });
                        });
                    });
                }
            }
        }

        // ── Bottom bar: progress info ──
        const unlockedCount = unlocked.length;
        this.add.text(400, 430, `Progress: ${unlockedCount} / ${levels.length} levels unlocked`, {
            fontSize: '12px', fontFamily: 'monospace', color: '#888888'
        }).setOrigin(0.5);

        // ── Back button ──
        const backBg = this.add.rectangle(60, 30, 100, 28, 0x333344, 0.8)
            .setStrokeStyle(1, 0x666688)
            .setInteractive({ useHandCursor: true });
        const backLabel = this.add.text(60, 30, '◀  BACK', {
            fontSize: '11px', fontFamily: 'monospace', color: '#AAAAAA'
        }).setOrigin(0.5);

        backBg.on('pointerover', () => { backLabel.setColor('#FFD700'); backBg.setStrokeStyle(1, 0xFFD700); });
        backBg.on('pointerout', () => { backLabel.setColor('#AAAAAA'); backBg.setStrokeStyle(1, 0x666688); });
        backBg.on('pointerup', () => {
            try { this.sound.play('sfx-tap'); } catch(e) {}
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('ModeSelectScene');
            });
        });

        // Keyboard shortcuts
        this.input.keyboard.on('keydown-ESC', () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('ModeSelectScene');
            });
        });
    }
}
