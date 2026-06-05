// MovingPlatform - a platform that patrols horizontally or vertically
class MovingPlatform extends Phaser.GameObjects.TileSprite {
    constructor(scene, x, y, config) {
        const width = config.width || 96;
        super(scene, x, y, width, 32, 'ground-tile');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Configure physics: dynamic + immovable = moves but won't be pushed
        this.body.setImmovable(true);
        this.body.setAllowGravity(false);

        // Movement config
        this.axis = config.axis || 'x';
        this.speed = config.speed || 60;
        this.minX = config.patrolLeft  !== undefined ? config.patrolLeft  : x;
        this.maxX = config.patrolRight !== undefined ? config.patrolRight : x;
        this.minY = config.patrolUp    !== undefined ? config.patrolUp    : y;
        this.maxY = config.patrolDown  !== undefined ? config.patrolDown  : y;
        this.startX = x;
        this.startY = y;

        // Start moving
        this.body.setVelocity(
            this.axis === 'x' ? this.speed : 0,
            this.axis === 'y' ? this.speed : 0
        );
    }

    update() {
        // Reverse direction at patrol bounds
        if (this.axis === 'x') {
            if (this.x >= this.maxX) {
                this.x = this.maxX;
                this.body.setVelocityX(-this.speed);
            } else if (this.x <= this.minX) {
                this.x = this.minX;
                this.body.setVelocityX(this.speed);
            }
        } else {
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
