// Obstacle - a moving hazard (saw blade or spike) that damages the player
class Obstacle extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, config) {
        const texture = config.type === 'spike' ? 'spike' : 'saw-blade';
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(false);
        this.body.setImmovable(true);

        // Movement config
        this.axis = config.axis || 'x';
        this.speed = config.speed || 60;
        this.minX = config.patrolLeft  !== undefined ? config.patrolLeft  : x;
        this.maxX = config.patrolRight !== undefined ? config.patrolRight : x;
        this.minY = config.patrolUp    !== undefined ? config.patrolUp    : y;
        this.maxY = config.patrolDown  !== undefined ? config.patrolDown  : y;

        // Static obstacle (no patrol range) or moving
        if (config.patrolLeft !== undefined || config.patrolRight !== undefined ||
            config.patrolUp !== undefined || config.patrolDown !== undefined) {
            this.body.setVelocity(
                this.axis === 'x' ? this.speed : 0,
                this.axis === 'y' ? this.speed : 0
            );
        }

        // Spin animation for saw blades
        if (config.type !== 'spike') {
            scene.tweens.add({
                targets: this,
                angle: 360,
                duration: 600,
                repeat: -1,
                ease: 'Linear'
            });
        }
    }

    update() {
        // Reverse direction at patrol bounds
        if (this.body.velocity.x !== 0) {
            if (this.x >= this.maxX) {
                this.x = this.maxX;
                this.body.setVelocityX(-this.speed);
            } else if (this.x <= this.minX) {
                this.x = this.minX;
                this.body.setVelocityX(this.speed);
            }
        }
        if (this.body.velocity.y !== 0) {
            if (this.y >= this.maxY) {
                this.y = this.maxY;
                this.body.setVelocityY(-this.speed);
            } else if (this.y <= this.minY) {
                this.y = this.minY;
                this.body.setVelocityY(this.speed);
            }
        }
    }
}
