// MovingPlatform - a platform that patrols horizontally or vertically
// Uses TileSprite for the ground texture, with physics body synced properly.
class MovingPlatform extends Phaser.GameObjects.TileSprite {
    constructor(scene, x, y, config) {
        const w = config.width || 96;
        // x, y = center position (like all other entities)
        super(scene, x, y, w, 32, 'ground-tile');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Physics: dynamic + immovable = moves but player can't push it
        this.body.setImmovable(true);
        this.body.setAllowGravity(false);
        // Explicit body size matching display (centered by default)
        this.body.setSize(w, 32);

        // Movement config
        this.pWidth = w;
        this.axis = config.axis || 'x';
        this.speed = config.speed || 60;
        // Patrol bounds are for the CENTER of the platform
        this.minX = config.patrolLeft  !== undefined ? config.patrolLeft  : x;
        this.maxX = config.patrolRight !== undefined ? config.patrolRight : x;
        this.minY = config.patrolUp    !== undefined ? config.patrolUp    : y;
        this.maxY = config.patrolDown  !== undefined ? config.patrolDown  : y;

        // Align texture with world coordinates so moving platforms visually
        // match static ground tiles (static ground uses tilePositionX = 0).
        this.tilePositionX = x - w / 2;   // left edge in world coords
        this.tilePositionY = y - 16;      // top edge in world coords (height=32)

        // Start moving
        this.body.setVelocity(
            this.axis === 'x' ? this.speed : 0,
            this.axis === 'y' ? this.speed : 0
        );
    }

    update() {
        // Scroll texture relative to world position (avoids wrapping
        // artifacts from using large absolute coords like this.x = 2300+)
        if (this.axis === 'x') {
            // Horizontal: scroll texture as platform moves sideways
            this.tilePositionX = this.x - this.pWidth / 2;
        } else {
            // Vertical: scroll texture as platform moves up/down
            // Keep horizontal tile fixed at initial world position
            this.tilePositionY = this.y - 16;   // top edge in world coords
        }

        // Reverse direction at patrol bounds
        if (this.axis === 'x') {
            if (this.x >= this.maxX) {
                this.body.setVelocityX(-this.speed);
            } else if (this.x <= this.minX) {
                this.body.setVelocityX(this.speed);
            }
        } else {
            if (this.y >= this.maxY) {
                this.body.setVelocityY(-this.speed);
            } else if (this.y <= this.minY) {
                this.body.setVelocityY(this.speed);
            }
        }
    }
}
