// HUDScene - runs in parallel with GameScene, displays UI
class HUDScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HUDScene' });
    }

    init(data) {
        this.score = data.score || 0;
        this.lives = data.lives || 3;
        this.levelName = data.levelName || '';
    }

    create() {
        // Hearts (top-left)
        this.hearts = [];
        for (let i = 0; i < 3; i++) {
            const heart = this.add.image(24 + i * 34, 24, 'heart-full');
            heart.setScrollFactor(0);
            heart.setDepth(200);
            this.hearts.push(heart);
        }

        // Score text (top-right)
        this.scoreText = this.add.text(GAME_WIDTH - 20, 20, 'SCORE: ' + this.score, {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.scoreText.setOrigin(1, 0);
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(200);

        // Level name (top-center)
        this.levelText = this.add.text(GAME_WIDTH / 2, 20, this.levelName, {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#ffcc00',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.levelText.setOrigin(0.5, 0);
        this.levelText.setScrollFactor(0);
        this.levelText.setDepth(200);

        // Coin counter (below level name)
        this.totalCoins = data.totalCoins || 0;
        this.coinText = this.add.text(GAME_WIDTH / 2, 42, 'GEARS: 0/' + this.totalCoins, {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.coinText.setOrigin(0.5, 0);
        this.coinText.setScrollFactor(0);
        this.coinText.setDepth(200);

        // Listen for events from GameScene
        const gameScene = this.scene.get('GameScene');
        gameScene.events.on('updateScore', (score) => {
            this.score = score;
            this.scoreText.setText('SCORE: ' + score);
        });

        gameScene.events.on('updateLives', (lives) => {
            this.lives = lives;
            this._updateHearts(lives);
        });

        gameScene.events.on('updateCoins', ({ collected, total }) => {
            this.coinText.setText('GEARS: ' + collected + '/' + total);
        });
    }

    _updateHearts(lives) {
        for (let i = 0; i < 3; i++) {
            this.hearts[i].setTexture(i < lives ? 'heart-full' : 'heart-empty');
        }
    }
}
