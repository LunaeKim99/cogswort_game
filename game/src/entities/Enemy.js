// Enemy entity classes
// ============================================================
// PatrolDrone - airborne drone with laser scanner
// Walker - ground patrol robot

// ── Laser State Constants ──
const DRONE_STATE = {
    IDLE:     'idle',
    WARNING:  'warning',   // player detected, about to fire
    FIRING:   'firing',    // laser active
    COOLDOWN: 'cooldown'
};

// ────────────────────────────────────────────────────────────
// PatrolDrone - Airborne patrol with laser sensor
// ────────────────────────────────────────────────────────────
class PatrolDrone extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, patrolLeft, patrolRight) {
        super(scene, x, y, 'drone');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.patrolLeft = patrolLeft;
        this.patrolRight = patrolRight;
        this.direction = 1;
        this.isDead = false;
        this.deathTimer = 0;
        this._droneY = y;  // base Y for bobbing

        // Airborne: no gravity
        this.body.setAllowGravity(false);
        this.body.setCollideWorldBounds(true);
        this.body.setSize(24, 24);
        this.setScale(1.35);
        this.setDepth(10);
        this.body.setVelocityX(50); // slightly slower than walker

        // ── Laser state machine ──
        this._state = DRONE_STATE.IDLE;
        this._stateTimer = 0;
        this._laserBeam = null;       // visual beam sprite
        this._warningDot = null;      // ground warning indicator
        this._sensorCone = null;      // visual cone

        // Laser config
        this._warningDuration = 600;    // ms from warning to fire
        this._fireDuration = 600;       // ms laser stays active
        this._cooldownDuration = 2000;  // ms before can detect again
        this._scanRange = 120;          // how far down the sensor reaches
        this._detectRadiusX = 60;       // horizontal detection width

        // ── Aggressive mode (forward-facing sensor) ──
        this._aggroMode = false;
        this._recovering = false;
        this._recoveryTimer = 0;
        this._originalY = y;
        this._aggroY = y;
        this._debugRect = null;
        this._bobTween = null;

        // ── Weak point (stomp on top only) ──
        this._weakPoint = new Phaser.Geom.Rectangle(0, 0, 1, DRONE_WEAK_POINT_HEIGHT);

        // ── Bobbing animation (stored as _bobTween so we can pause/resume) ──
        this._startBobTween();
    }

    // ── Check if player is in forward-facing sensor cone ──
    _isPlayerInSensor(player) {
        if (!player || !player.body || this.isDead) return false;

        // Forward-facing detection zone based on patrol direction
        const halfW = this.displayWidth / 2;
        const frontEdgeX = this.x + (this.direction * halfW);

        let sensorLeft, sensorRight;
        if (this.direction === 1) { // facing right
            sensorLeft = frontEdgeX;
            sensorRight = frontEdgeX + DRONE_SENSOR_WIDTH;
        } else { // facing left
            sensorLeft = frontEdgeX - DRONE_SENSOR_WIDTH;
            sensorRight = frontEdgeX;
        }
        const sensorTop = this.y - DRONE_SENSOR_HEIGHT / 2;
        const sensorBottom = this.y + DRONE_SENSOR_HEIGHT / 2;

        const px = player.x;
        const py = player.y + player.body.height / 2;

        return px >= sensorLeft && px <= sensorRight && py >= sensorTop && py <= sensorBottom;
    }

    // ── Update aggressive chase mode ──
    _updateAggression(delta, player) {
        const playerInSensor = player && this._isPlayerInSensor(player);

        if (playerInSensor && !this.isDead) {
            this._aggroMode = true;
            this._recovering = false;
            this._recoveryTimer = 0;
            // Kill bobbing tween while in aggro mode (visual-only Y movement conflicts with manual Y)
            if (this._bobTween) {
                this._bobTween.destroy();
                this._bobTween = null;
            }
        } else if (this._aggroMode && !playerInSensor) {
            if (!this._recovering) {
                this._recovering = true;
                this._recoveryTimer = 0;
            }
        }

        if (this._recovering) {
            this._recoveryTimer += delta;
            if (this._recoveryTimer >= DRONE_RECOVERY_DURATION) {
                this._aggroMode = false;
                this._recovering = false;
                this._recoveryTimer = 0;
                this.body.setVelocityY(0);
                // Tween back to original Y, then restart bob
                this.scene.tweens.add({
                    targets: this,
                    y: this._originalY,
                    duration: 300,
                    ease: 'Sine.easeOut',
                    onComplete: () => this._startBobTween()
                });
            }
        }
    }

    // ── Draw sensor cone visual (below drone, pointing down) ──
    _showSensorCone() {
        if (this._sensorCone) return;
        this._sensorCone = this.scene.add.image(this.x, this.y + 14, 'laser-cone')
            .setOrigin(0.5, 0)  // top-center: cone extends downward from drone bottom
            .setAlpha(0.4)
            .setScale(1, this._scanRange / 12)
            .setDepth(5);
    }
    _hideSensorCone() {
        if (this._sensorCone) {
            this._sensorCone.destroy();
            this._sensorCone = null;
        }
    }

    // ── Show warning dot on ground ──
    _showWarning(player) {
        if (!this._warningDot) {
            // Find ground Y below drone
            const groundY = GROUND_Y;
            this._warningDot = this.scene.add.image(this.x, groundY, 'laser-warning')
                .setDepth(15).setAlpha(0);

            // Pulsing animation
            this.scene.tweens.add({
                targets: this._warningDot,
                scaleX: 1.8,
                scaleY: 1.8,
                alpha: 0.8,
                duration: this._warningDuration / 3,
                yoyo: true,
                repeat: 1,
                ease: 'Sine.easeInOut'
            });
        }
        // Follow player X
        if (this._warningDot) {
            this._warningDot.x = player.x;
        }
    }

    _hideWarning() {
        if (this._warningDot) {
            this._warningDot.destroy();
            this._warningDot = null;
        }
    }

    // ── Fire laser beam ──
    _fireLaser() {
        const groundY = GROUND_Y;
        const beamY = this.y + 14;
        const beamH = groundY - beamY;

        // Create laser beam sprite
        this._laserBeam = this.scene.add.image(this.x, beamY + beamH / 2, 'laser-beam')
            .setDisplaySize(8, beamH)
            .setOrigin(0.5, 0.5)
            .setAlpha(0)
            .setDepth(15);

        // Flash in
        this.scene.tweens.add({
            targets: this._laserBeam,
            alpha: 1,
            duration: 80,
            ease: 'Quad.easeIn'
        });

        // Screen shake
        this.scene.cameras.main.shake(80, 0.003);

        // Brief hold then fade
        this.scene.time.delayedCall(this._fireDuration - 100, () => {
            if (this._laserBeam) {
                this.scene.tweens.add({
                    targets: this._laserBeam,
                    alpha: 0,
                    duration: 100,
                    onComplete: () => {
                        if (this._laserBeam) {
                            this._laserBeam.destroy();
                            this._laserBeam = null;
                        }
                    }
                });
            }
        });
    }

    _isLaserActive() {
        return this._state === DRONE_STATE.FIRING && this._laserBeam && this._laserBeam.active && this._laserBeam.alpha > 0.5;
    }

    // ── Check laser hit on player ──
    _checkLaserHit(player) {
        if (!this._isLaserActive() || !player || !player.body || player.isInvincible || player.isDead) return false;

        // Laser hitbox: thin vertical column from drone bottom to ground
        const laserX = this.x;
        const halfW = 6; // half width of laser hitbox
        const droneBottom = this.y + 14; // bottom of 28px drone sprite
        const px = player.x;
        const py = player.y + player.body.height / 2;

        return px > laserX - halfW && px < laserX + halfW && py > droneBottom && py < GROUND_Y;
    }

    // ── Stomp ──
    stomp() {
        if (this.isDead) return;
        this.isDead = true;
        this.body.enable = false;
        this.play('drone-death-anim');

        // Hit flash
        this.setTint(0xFFFFFF);
        this.scene.time.delayedCall(200, () => {
            if (this.active) this.clearTint();
        });

        // Clean up laser visuals
        this._hideSensorCone();
        this._hideWarning();
        if (this._laserBeam) {
            this._laserBeam.destroy();
            this._laserBeam = null;
        }
        // Stop bobbing tween
        if (this._bobTween) {
            this._bobTween.destroy();
            this._bobTween = null;
        }
        this.scene.tweens.killTweensOf(this);
    }

    _startBobTween() {
        if (this._bobTween) return;
        this._bobTween = this.scene.tweens.add({
            targets: this,
            y: this._originalY - 4,
            duration: 1200 + Math.random() * 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // ── Update weak point hitbox (top of drone, for precise stomp) ──
    updateWeakPoint(hasWrenchStrike) {
        const frac = hasWrenchStrike ? 0.8 : 0.4;
        const wpWidth = this.displayWidth * frac;
        const wpX = this.x - wpWidth / 2;
        const wpY = this.y - this.displayHeight / 2;
        this._weakPoint.setTo(wpX, wpY, wpWidth, DRONE_WEAK_POINT_HEIGHT);
    }

    // ── Check if player overlaps weak point ──
    isWeakPointHit(player) {
        if (!player || !player.body) return false;
        const playerRect = new Phaser.Geom.Rectangle(
            player.body.x, player.body.y,
            player.body.width, player.body.height
        );
        return Phaser.Geom.Rectangle.Overlaps(this._weakPoint, playerRect);
    }

    // ── Update ──
    update(time, delta, player) {
        if (this.isDead) {
            this.deathTimer += delta;
            if (this.deathTimer >= ENEMY_DEATH_DELAY) {
                this.destroy();
            }
            return;
        }

        // ── Animation ──
        this.play('drone-fly-anim', true);

        // ── Update weak point hitbox (for precise stomp) ──
        this.updateWeakPoint(this.scene._hasWrenchStrike || false);

        // ── Patrol / Aggressive movement ──
        if (this._aggroMode && player && player.body) {
            // Chase player horizontally
            const chaseSpeed = 50 * DRONE_AGGRO_SPEED_MULT;
            const dx = player.x - this.x;
            if (dx > 5) {
                this.direction = 1;
                this.setFlipX(false);
                this.setVelocityX(chaseSpeed);
            } else if (dx < -5) {
                this.direction = -1;
                this.setFlipX(true);
                this.setVelocityX(-chaseSpeed);
            } else {
                this.setVelocityX(0);
            }
            // Descend toward player Y (clamped to not go above original spawn Y)
            const targetY = Math.min(player.y - 20, this._originalY);
            const dy = targetY - this.y;
            if (Math.abs(dy) > 5) {
                this.body.setVelocityY(Math.sign(dy) * 80);
            } else {
                this.body.setVelocityY(0);
            }
        } else {
            // Normal patrol
            if (this.x >= this.patrolRight) {
                this.direction = -1;
                this.setFlipX(true);
            } else if (this.x <= this.patrolLeft) {
                this.direction = 1;
                this.setFlipX(false);
            }
            this.setVelocityX(50 * this.direction);
            this.body.setVelocityY(0);
        }

        // ── Sensor cone follow body (extends downward from drone bottom) ──
        if (this._sensorCone) {
            this._sensorCone.x = this.x;
            this._sensorCone.y = this.y + 14;
        }

        // ── Laser state machine ──
        const now = this.scene.time.now;

        switch (this._state) {
            case DRONE_STATE.IDLE:
                this._hideSensorCone();
                this._updateAggression(delta, player);
                if (player && this._isPlayerInSensor(player)) {
                    this._state = DRONE_STATE.WARNING;
                    this._stateTimer = now;
                    this._showSensorCone();
                    this._showWarning(player);
                }
                break;

            case DRONE_STATE.WARNING:
                // Update warning dot position
                if (player) this._showWarning(player);
                // Keep sensor cone visible
                this._showSensorCone();

                if (!player || !this._isPlayerInSensor(player)) {
                    // Player left sensor → abort
                    this._state = DRONE_STATE.IDLE;
                    this._hideSensorCone();
                    this._hideWarning();
                } else if (now - this._stateTimer >= this._warningDuration) {
                    // Warning time elapsed → FIRE!
                    this._state = DRONE_STATE.FIRING;
                    this._stateTimer = now;
                    this._hideWarning();
                    this._fireLaser();
                }
                break;

            case DRONE_STATE.FIRING:
                if (now - this._stateTimer >= this._fireDuration) {
                    // Laser done → cooldown
                    this._state = DRONE_STATE.COOLDOWN;
                    this._stateTimer = now;
                    this._hideSensorCone();
                }
                break;

            case DRONE_STATE.COOLDOWN:
                if (now - this._stateTimer >= this._cooldownDuration) {
                    this._state = DRONE_STATE.IDLE;
                    this._stateTimer = 0;
                }
                break;
        }

        // ── Debug sensor visualization ──
        this._drawDebugSensor();
    }

    _drawDebugSensor() {
        if (!DEBUG_DRONE) {
            if (this._debugRect) {
                this._debugRect.destroy();
                this._debugRect = null;
            }
            return;
        }
        const halfW = this.displayWidth / 2;
        const frontEdgeX = this.x + (this.direction * halfW);
        let sensorLeft, sensorRight;
        if (this.direction === 1) {
            sensorLeft = frontEdgeX;
            sensorRight = frontEdgeX + DRONE_SENSOR_WIDTH;
        } else {
            sensorLeft = frontEdgeX - DRONE_SENSOR_WIDTH;
            sensorRight = frontEdgeX;
        }
        const sensorTop = this.y - DRONE_SENSOR_HEIGHT / 2;
        const sensorW = sensorRight - sensorLeft;
        const sensorH = DRONE_SENSOR_HEIGHT;
        const sensorCX = (sensorLeft + sensorRight) / 2;
        const sensorCY = sensorTop + sensorH / 2;

        if (!this._debugRect) {
            this._debugRect = this.scene.add.rectangle(sensorCX, sensorCY, sensorW, sensorH, 0xFF0000, 0.2)
                .setDepth(50);
        } else {
            this._debugRect.setPosition(sensorCX, sensorCY);
            this._debugRect.setSize(sensorW, sensorH);
        }
    }

    // ── Cleanup on destroy ──
    destroy(fromScene) {
        this._hideSensorCone();
        this._hideWarning();
        if (this._laserBeam) {
            this._laserBeam.destroy();
            this._laserBeam = null;
        }
        if (this._debugRect) { this._debugRect.destroy(); this._debugRect = null; }
        if (this._bobTween) { this._bobTween.destroy(); this._bobTween = null; }
        this.scene.tweens.killTweensOf(this);
        super.destroy(fromScene);
    }
}

// ────────────────────────────────────────────────────────────
// Walker - Ground patrol robot
// ────────────────────────────────────────────────────────────
class Walker extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, patrolLeft, patrolRight) {
        super(scene, x, y, 'walker-walk');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.patrolLeft = patrolLeft;
        this.patrolRight = patrolRight;
        this.direction = 1;
        this.isDead = false;
        this.deathTimer = 0;

        // Ground-based: gravity affects it
        this.body.setCollideWorldBounds(true);
        this.body.setSize(24, 24);
        this.setScale(1.35);
        this.setDepth(10);
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

        // ── Animation ──
        this.play('walker-walk-anim', true);

        // Only patrol when standing on ground/platform
        if (this.body.blocked.down) {
            // Patrol logic
            if (this.x >= this.patrolRight) {
                this.direction = -1;
                this.setFlipX(true);
            } else if (this.x <= this.patrolLeft) {
                this.direction = 1;
                this.setFlipX(false);
            }
            this.setVelocityX(60 * this.direction);
        } else {
            // In air — don't apply horizontal velocity, just let gravity work
            this.setVelocityX(0);
        }
    }

    stomp() {
        this.isDead = true;
        this.body.enable = false;
        this.play('walker-death-anim');
    }
}
