// Player entity class
// Uses setTexture() for animation states since we have single-frame textures
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player-idle');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // State
        this.isInvincible = false;
        this.isDead = false;

        // Hitbox (slightly smaller than sprite)
        this.body.setSize(20, 28);
        this.body.setCollideWorldBounds(true);
        this.body.setMaxVelocityY(PLAYER_MAX_FALL);
        this.body.setDragX(600);

        // Invincibility flash tween reference
        this._flashTween = null;
    }

    // Called each frame from GameScene - handles movement there, animation here
    updateAnimation() {
        if (this.isInvincible) {
            this.play('player-hurt-anim', true);
        } else if (!this.body.blocked.down) {
            if (this.body.velocity.y < 0) {
                this.play('player-jump-anim', true);
            } else {
                this.play('player-fall-anim', true);
            }
        } else if (Math.abs(this.body.velocity.x) > 10) {
            this.play('player-run-anim', true);
        } else {
            this.play('player-idle-anim', true);
        }
    }

    makeInvincible() {
        if (this.isInvincible) return;
        this.isInvincible = true;

        // Flash effect using alpha tween
        this._flashTween = this.scene.tweens.add({
            targets: this,
            alpha: { from: 1, to: 0.3 },
            duration: 100,
            yoyo: true,
            repeat: 9, // ~2 seconds total (100ms * 2 * 10 = 2000ms)
            onComplete: () => {
                this.isInvincible = false;
                this.alpha = 1;
            }
        });
    }

    // Bounce upward after a successful stomp
    bounce() {
        this.body.setVelocityY(PLAYER_BOUNCE_STOMP);
    }

    // Player death
    die() {
        this.isDead = true;
        this.setTexture('player-hurt');
        this.body.enable = false;

        return new Promise((resolve) => {
            this.scene.time.delayedCall(1000, resolve);
        });
    }

    // Freeze/unfreeze physics
    freeze() {
        this.body.moves = false;
        this.body.allowGravity = false;
        this.body.setVelocity(0, 0);
    }

    unfreeze() {
        this.body.moves = true;
        this.body.allowGravity = true;
        this.isDead = false;
    }
}
