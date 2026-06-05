// Coin collectible entity class
class Coin extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'coin');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Coins don't fall
        this.body.setAllowGravity(false);

        // Gentle floating animation
        scene.tweens.add({
            targets: this,
            y: y - 4,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // Called when player collects this coin
    collect() {
        // Prevent double-collect from rapid overlap triggers
        if (this._collected) return;
        this._collected = true;

        // Disable physics immediately to prevent re-triggering
        this.body.enable = false;
        // Mark inactive so countActive() doesn't count us anymore
        this.active = false;

        // Play sound
        try { this.scene.sound.play('sfx-coin'); } catch(e) {}

        // Scale down and fade out animation
        this.scene.tweens.add({
            targets: this,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                this.destroy();
            }
        });
    }
}
