// Obstacle classes
// ============================================================
// BuriedSaw  - half-buried saw blade, pops up when player nears
// SurpriseSaw - patrolling saw that emerges from void
// SpikeTrap   - periodic spike that extends/retracts

// ────────────────────────────────────────────────────────────
// BuriedSaw - Hidden in ground, pops up on proximity
// ────────────────────────────────────────────────────────────
class BuriedSaw extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, config) {
        super(scene, x, y, 'saw-blade');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(false);
        this.body.setImmovable(true);

        // Positioning: half-buried at ground level
        this._groundY = y;
        this._hiddenY = y + 12;       // mostly below ground
        this._activeY = y - 10;       // fully exposed above ground
        this._triggerDistance = config.triggerDistance || 150;
        this._activeDuration = config.activeDuration || 2000;  // ms before retracting
        this._cooldownDuration = config.cooldownDuration || 1500;

        // State
        this._isRising = false;
        this._isActive = false;
        this._isFalling = false;
        this._stateTimer = 0;
        this._startHidden = true;

        // Spin animation (always spinning, even when hidden)
        scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 600,
            repeat: -1,
            ease: 'Linear'
        });

        // Start hidden
        this.y = this._hiddenY;
        this.setAlpha(0.3);
        this.body.enable = false;
    }

    // ── Check player proximity ──
    _checkProximity(player) {
        if (!player || !player.body) return false;
        const dx = Math.abs(player.x - this.x);
        const dy = player.y - this._groundY;
        return dx < this._triggerDistance && dy > -50 && dy < 100;
    }

    // ── Rise up ──
    _rise() {
        this._isRising = true;
        this._isActive = false;
        this._isFalling = false;
        this.body.enable = true;
        this.setAlpha(1);

        this.scene.tweens.add({
            targets: this,
            y: this._activeY,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                this._isRising = false;
                this._isActive = true;
                this._stateTimer = this.scene.time.now;
            }
        });
    }

    // ── Fall back down ──
    _fall() {
        this._isActive = false;
        this._isFalling = true;

        this.scene.tweens.add({
            targets: this,
            y: this._hiddenY,
            alpha: 0.3,
            duration: 400,
            ease: 'Quad.easeIn',
            onComplete: () => {
                this._isFalling = false;
                this._startHidden = true;
                this.body.enable = false;
                this._stateTimer = this.scene.time.now;
            }
        });
    }

    update(player) {
        const now = this.scene.time.now;

        if (this._startHidden && this._checkProximity(player)) {
            // Player nearby → rise up
            this._rise();
            this._startHidden = false;
        }

        if (this._isActive) {
            // Check if player left range or active time expired
            if (!this._checkProximity(player) || (now - this._stateTimer >= this._activeDuration)) {
                this._fall();
            }
        }

        if (this._isFalling && !this._startHidden) {
            // Cooldown after fully retracted
            if (this.y >= this._hiddenY && this.alpha <= 0.4) {
                this._startHidden = true;
                this._stateTimer = now;
            }
        }

        // Prevent re-trigger during cooldown
        if (this._startHidden && !this._isRising && !this._isFalling) {
            // Wait for cooldown
            if (now - this._stateTimer >= this._cooldownDuration) {
                // Ready to be triggered again
            } else {
                // Still in cooldown, don't rise
                this._startHidden = false;
                this.scene.time.delayedCall(50, () => {
                    this._startHidden = true;
                });
            }
        }
    }

    destroy(fromScene) {
        this.scene.tweens.killTweensOf(this);
        super.destroy(fromScene);
    }
}

// ────────────────────────────────────────────────────────────
// SurpriseSaw - Patrolling saw that emerges from void
// ────────────────────────────────────────────────────────────
class SurpriseSaw extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, config) {
        super(scene, x, y, 'saw-blade');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(false);
        this.body.setImmovable(true);

        // Patrol config
        this.patrolLeft = config.patrolLeft || x - 100;
        this.patrolRight = config.patrolRight || x + 100;
        this.speed = config.speed || 60;
        this.direction = 1;

        // Emerge config
        this._emergeY = y;                    // final visible Y
        this._voidY = config.voidY || (y + 120); // hidden below
        this._triggerDistance = config.triggerDistance || 130;
        this._visibleDuration = config.visibleDuration || 2500;
        this._cooldownDuration = config.cooldownDuration || 3000;

        // State
        this._state = 'hidden';  // hidden | emerging | active | submerging
        this._stateTimer = 0;
        this._triggered = false;

        // Spin animation
        scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 500,
            repeat: -1,
            ease: 'Linear'
        });

        // Start in void
        this.y = this._voidY;
        this.setAlpha(0);
        this.body.enable = false;
    }

    _checkProximity(player) {
        if (!player || !player.body) return false;
        const dx = Math.abs(player.x - this.x);
        return dx < this._triggerDistance;
    }

    _emerge() {
        this._state = 'emerging';
        this.body.enable = true;
        this.setAlpha(1);

        this.scene.tweens.add({
            targets: this,
            y: this._emergeY,
            duration: 350,
            ease: 'Back.easeOut',
            onComplete: () => {
                this._state = 'active';
                this._stateTimer = this.scene.time.now;
            }
        });
    }

    _submerge() {
        this._state = 'submerging';

        this.scene.tweens.add({
            targets: this,
            y: this._voidY,
            alpha: 0,
            duration: 300,
            ease: 'Quad.easeIn',
            onComplete: () => {
                this._state = 'hidden';
                this._stateTimer = this.scene.time.now;
                this.body.enable = false;
            }
        });
    }

    update(player) {
        const now = this.scene.time.now;

        switch (this._state) {
            case 'hidden':
                // Patrol in void
                if (this.x >= this.patrolRight) {
                    this.direction = -1;
                    this.setFlipX(true);
                } else if (this.x <= this.patrolLeft) {
                    this.direction = 1;
                    this.setFlipX(false);
                }
                // Still move in void (for positional surprise)
                // Actually, let's not move while hidden to avoid issues
                // Instead, teleport to a position near player
                if (player && this._checkProximity(player)) {
                    // Align X with patrol area near player
                    const patrolCenter = (this.patrolLeft + this.patrolRight) / 2;
                    this.x = Phaser.Math.Clamp(player.x, this.patrolLeft + 20, this.patrolRight - 20);
                    this._emerge();
                }
                break;

            case 'active':
                // Patrol while visible
                if (this.x >= this.patrolRight) {
                    this.direction = -1;
                    this.setFlipX(true);
                } else if (this.x <= this.patrolLeft) {
                    this.direction = 1;
                    this.setFlipX(false);
                }
                this.setVelocityX(this.speed * this.direction);

                // Check if time to submerge
                if (now - this._stateTimer >= this._visibleDuration) {
                    this.setVelocityX(0);
                    this._submerge();
                }
                break;

            case 'emerging':
            case 'submerging':
                // During transitions, no patrol movement
                this.setVelocityX(0);
                break;
        }
    }

    destroy(fromScene) {
        this.scene.tweens.killTweensOf(this);
        super.destroy(fromScene);
    }
}

// ────────────────────────────────────────────────────────────
// SpikeTrap - Periodic retracting/extending spike
// ────────────────────────────────────────────────────────────
class SpikeTrap extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, config) {
        super(scene, x, y, 'spike');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(false);
        this.body.setImmovable(true);

        // Config
        this._extendDelay = config.extendDelay || 1500;   // time retracted before extending
        this._retractDelay = config.retractDelay || 2000;  // time extended before retracting
        this._isInverted = config.inverted || false;       // if on ceiling, inverted

        // For ground spikes: retracted = below surface, extended = visible
        // For ceiling spikes (below floating platform): retracted = above surface
        this._surfaceY = y;                  // the surface it sits on
        this._extendedY = this._isInverted ? y - 20 : y;      // visible position
        this._retractedY = this._isInverted ? y + 12 : y + 14; // hidden position

        // State
        this._extended = false;
        this._stateTimer = 0;
        this._ready = false;

        // Start retracted
        this.y = this._retractedY;
        this.setAlpha(0.3);
        this.body.enable = false;

        // Initial delay before first extension
        this.scene.time.delayedCall(config.initialDelay || 1000, () => {
            this._ready = true;
            this._stateTimer = scene.time.now;
        });
    }

    update() {
        if (!this._ready) return;

        const now = this.scene.time.now;

        if (!this._extended) {
            // Currently retracted
            if (now - this._stateTimer >= this._extendDelay) {
                // Extend!
                this._extended = true;
                this.body.enable = true;
                this.setAlpha(1);

                this.scene.tweens.add({
                    targets: this,
                    y: this._extendedY,
                    duration: 150,
                    ease: 'Quad.easeOut',
                    onComplete: () => {
                        this._stateTimer = this.scene.time.now;
                    }
                });
            }
        } else {
            // Currently extended
            if (now - this._stateTimer >= this._retractDelay) {
                // Retract!
                this._extended = false;
                this.body.enable = false;
                this.setAlpha(0.3);

                this.scene.tweens.add({
                    targets: this,
                    y: this._retractedY,
                    duration: 200,
                    ease: 'Quad.easeIn',
                    onComplete: () => {
                        this._stateTimer = this.scene.time.now;
                    }
                });
            }
        }
    }

    isExtended() {
        return this._extended && this.body && this.body.enable;
    }

    destroy(fromScene) {
        this.scene.tweens.killTweensOf(this);
        super.destroy(fromScene);
    }
}
