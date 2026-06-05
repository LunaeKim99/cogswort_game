// PreloadScene - loads audio assets with loading bar
class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    create() {
        const w = GAME_WIDTH;
        const h = GAME_HEIGHT;

        // Background
        this.cameras.main.setBackgroundColor('#000000');

        // Title
        this.add.text(w / 2, h * 0.18, 'COGSWORTH: LAST WIND', {
            fontSize: '36px', fontFamily: 'monospace', color: '#FFD700', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(w / 2, h * 0.28, 'A Steampunk Adventure', {
            fontSize: '14px', fontFamily: 'monospace', color: '#AAAAAA'
        }).setOrigin(0.5);

        // Loading bar
        const barX = w / 2 - 150;
        const barY = h * 0.45;
        const barWidth = 300;
        const barHeight = 22;

        const barBg = this.add.graphics();
        barBg.fillStyle(0x222222);
        barBg.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
        barBg.fillStyle(0x111111);
        barBg.fillRect(barX, barY, barWidth, barHeight);

        const barFill = this.add.graphics();

        // Loading label
        const loadingLabel = this.add.text(w / 2, barY + barHeight / 2, 'LOADING...', {
            fontSize: '11px', fontFamily: 'monospace', color: '#666666'
        }).setOrigin(0.5);

        // Tips
        const tips = [
            'Tip: Stomp enemies by landing on them!',
            'Tip: Collect gears for bonus points!',
            'Tip: Watch your step - the void is unforgiving!',
            'Tip: Time your jumps between platforms!',
            'Tip: Three hearts give you three chances!'
        ];
        const tipText = this.add.text(w / 2, h * 0.6, tips[0], {
            fontSize: '13px', fontFamily: 'monospace', color: '#888888', fontStyle: 'italic'
        }).setOrigin(0.5);

        let tipIndex = 0;
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                tipIndex = (tipIndex + 1) % tips.length;
                tipText.setText(tips[tipIndex]);
            },
            loop: true
        });

        // Queue audio assets
        this.load.audio('sfx-coin',   '../assets/sounds/coin.wav');
        this.load.audio('sfx-jump',   '../assets/sounds/jump.wav');
        this.load.audio('sfx-hurt',   '../assets/sounds/hurt.wav');
        this.load.audio('sfx-stomp',  '../assets/sounds/explosion.wav');
        this.load.audio('sfx-win',    '../assets/sounds/power_up.wav');
        this.load.audio('sfx-tap',    '../assets/sounds/tap.wav');
        this.load.audio('bgm-main',   '../assets/music/time_for_adventure.mp3');

        // Progress handling
        this.load.on('progress', (value) => {
            barFill.clear();
            barFill.fillStyle(0xFFD700);
            barFill.fillRect(barX, barY, barWidth * value, barHeight);
            barFill.fillStyle(0xFFAA00, 0.8);
            barFill.fillRect(barX, barY, barWidth * value, 2);
        });

        this.load.on('complete', () => {
            barFill.clear();
            barFill.fillStyle(0xFFD700);
            barFill.fillRect(barX, barY, barWidth, barHeight);
            barFill.fillStyle(0xFFAA00);
            barFill.fillRect(barX, barY, barWidth, 2);
            loadingLabel.setText('READY!');
            loadingLabel.setColor('#FFD700');

            this.time.delayedCall(500, () => {
                this.scene.start('MainMenuScene');
            });
        });

        this.load.on('fileprogress', (file) => {
            if (file.key.startsWith('sfx-')) {
                loadingLabel.setText('LOADING: ' + file.key.replace('sfx-', '').toUpperCase());
            } else if (file.key.startsWith('bgm-')) {
                loadingLabel.setText('LOADING: MUSIC');
            }
        });

        // Start loading
        this.load.start();
    }
}
