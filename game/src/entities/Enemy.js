// Enemy entity class - steampunk patrol drone
class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, patrolLeft, patrolRight) {
        super(scene, x, y, 'enemy-walk');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.patrolLeft = patrolLeft;
        this.patrolRight = patrolRight;
        this.direction = 1; // 1 = right, -1 = left
        this.isDead = false;
        this.deathTimer = 0;

        this.body.setSize(24, 24);
        this.body.setCollideWorldBounds(true);
        this.body.setVelocityX(60);
    }

    update(time, delta) {
        if (this.isDead) {
            this.deathTimer += delta;
            if (this.deathTimer >= ENEMY_DEATH_DELAY) {
                this.destroy();
            }
            return;
        }

        // Patrol logic
        if (this.x >= this.patrolRight) {
            this.direction = -1;
            this.setFlipX(true);
        } else if (this.x <= this.patrolLeft) {
            this.direction = 1;
            this.setFlipX(false);
        }

        this.setVelocityX(60 * this.direction);
        this.setTexture('enemy-walk');
    }

    // Called when player stomps this enemy
    stomp() {
        this.isDead = true;
        this.body.enable = false;
        this.setTexture('enemy-death');
    }
}
