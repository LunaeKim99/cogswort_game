// TouchControls - virtual buttons for mobile play
class TouchControls extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene);
        scene.add.existing(this);

        this.leftPressed = false;
        this.rightPressed = false;
        this.jumpPressed = false;
        this.jumpJustPressed = false;

        // Left button
        this.btnLeft = scene.add.image(100, GAME_HEIGHT - 60, 'btn-left');
        this.btnLeft.setInteractive();
        this.btnLeft.setAlpha(BTN_ALPHA);
        this.btnLeft.setScale(1.2);
        this.btnLeft.setScrollFactor(0);
        this.btnLeft.setDepth(100);
        this.add(this.btnLeft);

        // Right button
        this.btnRight = scene.add.image(200, GAME_HEIGHT - 60, 'btn-right');
        this.btnRight.setInteractive();
        this.btnRight.setAlpha(BTN_ALPHA);
        this.btnRight.setScale(1.2);
        this.btnRight.setScrollFactor(0);
        this.btnRight.setDepth(100);
        this.add(this.btnRight);

        // Jump button
        this.btnJump = scene.add.image(GAME_WIDTH - 100, GAME_HEIGHT - 60, 'btn-jump');
        this.btnJump.setInteractive();
        this.btnJump.setAlpha(BTN_ALPHA);
        this.btnJump.setScale(1.2);
        this.btnJump.setScrollFactor(0);
        this.btnJump.setDepth(100);
        this.add(this.btnJump);

        // Wire up events
        this._addHandlers(this.btnLeft, 'left');
        this._addHandlers(this.btnRight, 'right');
        this._addHandlers(this.btnJump, 'jump');
    }

    _addHandlers(btn, type) {
        btn.on('pointerdown', () => {
            if (type === 'left') this.leftPressed = true;
            if (type === 'right') this.rightPressed = true;
            if (type === 'jump') {
                this.jumpPressed = true;
                this.jumpJustPressed = true;
            }
            this.scene.tweens.add({
                targets: btn,
                alpha: 0.8,
                duration: 80
            });
        });

        const release = () => {
            if (type === 'left') this.leftPressed = false;
            if (type === 'right') this.rightPressed = false;
            if (type === 'jump') this.jumpPressed = false;
            this.scene.tweens.add({
                targets: btn,
                alpha: BTN_ALPHA,
                duration: 80
            });
        };

        btn.on('pointerup', release);
        btn.on('pointerout', release);
        btn.on('pointerleave', release);
    }

    getLeft() {
        return this.leftPressed;
    }

    getRight() {
        return this.rightPressed;
    }

    getJump() {
        return this.jumpPressed;
    }

    // Returns true only once per press, then resets (edge trigger)
    consumeJump() {
        const val = this.jumpJustPressed;
        this.jumpJustPressed = false;
        return val;
    }
}
