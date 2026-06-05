// SlotSelectScene — pick a save slot for New Game or Load Game
// mode = 'new' | 'load'
class SlotSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SlotSelectScene' });
    }

    init(data) {
        this.mode = data.mode || 'load';
    }

    create() {
        this.cameras.main.fadeIn(500);
        this.cameras.main.setBackgroundColor('#1a1a2e');

        // Background
        this.add.rectangle(400, 225, 800, 450, 0x1a1a2e);

        // ── Title ──
        const modeLabel = this.mode === 'new' ? 'NEW GAME — SELECT SLOT' : 'LOAD GAME — SELECT SLOT';
        this.add.text(400, 35, modeLabel, {
            fontSize: '22px', fontFamily: 'monospace', color: '#FFD700', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Subtitle
        const subText = this.mode === 'new'
            ? 'Choose an empty slot to start a new adventure'
            : 'Choose a saved game to continue';
        this.add.text(400, 60, subText, {
            fontSize: '11px', fontFamily: 'monospace', color: '#AAAAAA'
        }).setOrigin(0.5);

        // ── Slots ──
        const slots = SaveManager.listSlots();

        slots.forEach((slot, i) => {
            const yPos = 100 + i * 64;
            const hasData = slot.hasData;
            const info = slot.info;

            // Slot card background
            const card = this.add.rectangle(400, yPos, 600, 56, hasData ? 0x333355 : 0x222233, 0.85)
                .setStrokeStyle(1, hasData ? 0x8888AA : 0x444444);

            // Slot number badge
            const badge = this.add.graphics();
            if (hasData) {
                badge.fillStyle(this.mode === 'new' ? 0xFF4444 : 0x44FF44);
            } else {
                badge.fillStyle(0x555555);
            }
            badge.fillRoundedRect(115, yPos - 18, 32, 36, 4);

            this.add.text(131, yPos, 'S' + (i + 1), {
                fontSize: '13px', fontFamily: 'monospace', color: '#FFFFFF', fontStyle: 'bold'
            }).setOrigin(0.5);

            if (hasData) {
                // ── Slot with data ──
                // Level info
                this.add.text(165, yPos - 12, (info.district || 'Unknown') + ' • ' + (info.subName || 'Unknown'), {
                    fontSize: '14px', fontFamily: 'monospace', color: '#FFFFFF', fontStyle: 'bold'
                }).setOrigin(0, 0.5);

                // Score + Lives
                this.add.text(165, yPos + 10, 'Score: ' + info.score + '  •  Lives: ' + info.lives + '  •  Progress: ' + info.unlockedCount + '/' + info.totalLevels, {
                    fontSize: '10px', fontFamily: 'monospace', color: '#AAAAAA'
                }).setOrigin(0, 0.5);

                // Date
                this.add.text(165, yPos + 22, info.date || '', {
                    fontSize: '9px', fontFamily: 'monospace', color: '#666666'
                }).setOrigin(0, 0.5);

                // Delete button (X) in 'load' mode
                if (this.mode === 'load') {
                    const delBg = this.add.rectangle(670, yPos, 40, 30, 0x663333, 0.9)
                        .setStrokeStyle(1, 0xAA4444)
                        .setInteractive({ useHandCursor: true });
                    const delLabel = this.add.text(670, yPos, 'DEL', {
                        fontSize: '10px', fontFamily: 'monospace', color: '#FF6666', fontStyle: 'bold'
                    }).setOrigin(0.5);

                    delBg.on('pointerover', () => {
                        delBg.setFillStyle(0x994444);
                        delBg.setStrokeStyle(1, 0xFF6666);
                    });
                    delBg.on('pointerout', () => {
                        delBg.setFillStyle(0x663333);
                        delBg.setStrokeStyle(1, 0xAA4444);
                    });
                    delBg.on('pointerup', (pointer) => {
                        pointer.event.stopPropagation();
                        try { this.sound.play('sfx-tap'); } catch(e) {}
                        SaveManager.deleteSlot(i);
                        // Refresh scene
                        this.cameras.main.fadeOut(200, 0, 0, 0);
                        this.cameras.main.once('camerafadeoutcomplete', () => {
                            this.scene.start('SlotSelectScene', { mode: this.mode });
                        });
                    });
                }

                // Make clickable
                card.setInteractive({ useHandCursor: true });
                card.on('pointerover', () => {
                    this.tweens.add({ targets: card, scaleX: 1.02, scaleY: 1.02, duration: 60 });
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
                    if (this.mode === 'new') {
                        // Overwrite — clear slot first then start fresh
                        SaveManager.deleteSlot(i);
                        this.cameras.main.fadeOut(400, 0, 0, 0);
                        this.cameras.main.once('camerafadeoutcomplete', () => {
                            this.scene.start('GameScene', { level: 0, score: 0, lives: INITIAL_LIVES, saveSlot: i });
                        });
                    } else {
                        // Load
                        const data = SaveManager.load(i);
                        if (data) {
                            this.cameras.main.fadeOut(400, 0, 0, 0);
                            this.cameras.main.once('camerafadeoutcomplete', () => {
                                this.scene.start('GameScene', {
                                    level: data.currentLevel,
                                    score: data.score,
                                    lives: data.lives,
                                    saveSlot: i
                                });
                            });
                        }
                    }
                });
            } else {
                // ── Empty slot ──
                const emptyIcon = this.mode === 'new' ? '+' : '—';
                const emptyText = this.mode === 'new' ? 'Empty Slot — Click to Start' : 'Empty Slot';
                this.add.text(165, yPos, emptyIcon + '  ' + emptyText, {
                    fontSize: '14px', fontFamily: 'monospace', color: '#666666', fontStyle: 'bold'
                }).setOrigin(0, 0.5);

                // In 'new' mode, empty slots are clickable
                if (this.mode === 'new') {
                    card.setInteractive({ useHandCursor: true });
                    card.on('pointerover', () => {
                        this.tweens.add({ targets: card, scaleX: 1.02, scaleY: 1.02, duration: 60 });
                        card.setFillStyle(0x444466);
                        card.setStrokeStyle(1, 0xFFD700);
                    });
                    card.on('pointerout', () => {
                        this.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 60 });
                        card.setFillStyle(0x222233);
                        card.setStrokeStyle(1, 0x444444);
                    });
                    card.on('pointerup', () => {
                        try { this.sound.play('sfx-tap'); } catch(e) {}
                        SaveManager.deleteSlot(i);
                        this.cameras.main.fadeOut(400, 0, 0, 0);
                        this.cameras.main.once('camerafadeoutcomplete', () => {
                            this.scene.start('GameScene', { level: 0, score: 0, lives: INITIAL_LIVES, saveSlot: i });
                        });
                    });
                }
            }
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
                this.scene.start('ModeSelectScene');
            });
        });

        // Keyboard shortcut: ESC to go back
        this.input.keyboard.on('keydown-ESC', () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('ModeSelectScene');
            });
        });
    }
}
