// TouchControls - virtual buttons for mobile play
class TouchControls extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene);
        scene.add.existing(this);
        scene.input.addPointer(3);

        this.leftPressed = false;
        this.rightPressed = false;
        this.jumpPressed = false;
        this.jumpJustPressed = false;
        this.throwPressed = false;
        this.throwJustPressed = false;

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

        // Throw button (wrench)
        this.btnThrow = scene.add.image(150, GAME_HEIGHT - 130, 'btn-throw');
        this.btnThrow.setInteractive();
        this.btnThrow.setAlpha(BTN_ALPHA);
        this.btnThrow.setScale(1.2);
        this.btnThrow.setScrollFactor(0);
        this.btnThrow.setDepth(100);
        this.add(this.btnThrow);

        // Wire up events
        this._addHandlers(this.btnLeft, 'left');
        this._addHandlers(this.btnRight, 'right');
        this._addHandlers(this.btnJump, 'jump');
        this._addHandlers(this.btnThrow, 'throw');
    }

    _addHandlers(btn, type) {
        btn._activePointerId = null;

        btn.on('pointerdown', (pointer) => {
            btn._activePointerId = pointer.id;
            if (type === 'left') this.leftPressed = true;
            if (type === 'right') this.rightPressed = true;
            if (type === 'jump') {
                this.jumpPressed = true;
                this.jumpJustPressed = true;
            }
            if (type === 'throw') {
                this.throwPressed = true;
                this.throwJustPressed = true;
            }
            this.scene.tweens.add({ targets: btn, alpha: 0.8, duration: 80 });
        });

        const release = (pointer) => {
            if (pointer && btn._activePointerId !== null &&
                btn._activePointerId !== pointer.id) return;
            btn._activePointerId = null;
            if (type === 'left') this.leftPressed = false;
            if (type === 'right') this.rightPressed = false;
            if (type === 'jump') this.jumpPressed = false;
            if (type === 'throw') this.throwPressed = false;
            this.scene.tweens.add({ targets: btn, alpha: BTN_ALPHA, duration: 80 });
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

    getThrow() {
        return this.throwPressed;
    }

    consumeThrow() {
        const val = this.throwJustPressed;
        this.throwJustPressed = false;
        return val;
    }
}
