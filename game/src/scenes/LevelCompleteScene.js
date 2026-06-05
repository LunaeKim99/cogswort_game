// LevelCompleteScene - shown between levels
class LevelCompleteScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelCompleteScene' });
    }

    init(data) {
        this.score = data.score || 0;
        this.level = data.level || 0;
        this.nextLevel = data.nextLevel || 0;
        this.lives = data.lives || 3;
    }

    create() {
        this.cameras.main.fadeIn(500);
        this.cameras.main.setBackgroundColor('#1a2a1a');

        // Background
        this.add.rectangle(400, 225, 800, 450, 0x1a2a1a);

        // Decorative borders
        const deco = this.add.graphics();
        deco.fillStyle(0x2a4a2a, 0.5);
        deco.fillRect(0, 0, 800, 4);
        deco.fillRect(0, 446, 800, 4);

        // "LEVEL COMPLETE!" with scale-in
        const completeText = this.add.text(400, 100, 'LEVEL COMPLETE!', {
            fontSize: '36px', fontFamily: 'monospace', color: '#44FF44', fontStyle: 'bold',
            stroke: '#004400', strokeThickness: 4
        }).setOrigin(0.5);
        completeText.setScale(0);

        this.tweens.add({
            targets: completeText, scale: 1, duration: 600, ease: 'Back.easeOut'
        });

        // Level info
        const lvl = levels[this.level];
        const district = lvl ? lvl.district : ('Level ' + (this.level + 1));
        const subName = lvl ? lvl.subName : '';
        const districtLevel = lvl ? lvl.districtLevel : (this.level + 1);
        const globalLevel = this.level + 1;
        const totalLevels = levels.length;

        // District + level number
        this.add.text(400, 140, district, {
            fontSize: '14px', fontFamily: 'monospace', color: '#FFD700'
        }).setOrigin(0.5);

        // Sub-level name
        this.add.text(400, 165, subName + ' — CLEARED', {
            fontSize: '18px', fontFamily: 'monospace', color: '#88FF88'
        }).setOrigin(0.5);

        // Progress indicator
        this.add.text(400, 190, 'DISTRICT LEVEL ' + districtLevel + '/5  •  OVERALL ' + globalLevel + '/' + totalLevels, {
            fontSize: '11px', fontFamily: 'monospace', color: '#AAAAAA'
        }).setOrigin(0.5);

        // Score
        this.add.text(400, 220, 'SCORE: ' + this.score, {
            fontSize: '24px', fontFamily: 'monospace', color: '#FFD700'
        }).setOrigin(0.5);

        // Lives remaining
        this.add.text(400, 260, 'LIVES: ' + this.lives, {
            fontSize: '20px', fontFamily: 'monospace', color: '#FF6666'
        }).setOrigin(0.5);

        // Next level prompt (blinking)
        const nextText = this.add.text(400, 340, 'PRESS SPACE OR TAP TO CONTINUE', {
            fontSize: '16px', fontFamily: 'monospace', color: '#FFFFFF', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: nextText, alpha: 0.2, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        // Input: Continue to next level
        const continueGame = () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene', {
                    level: this.nextLevel,
                    score: this.score,
                    lives: this.lives
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
}
