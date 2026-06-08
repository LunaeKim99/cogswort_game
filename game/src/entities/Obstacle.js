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
        this.body.enable = false;  // keep disabled during rise
        this.setAlpha(1);

        this.scene.tweens.add({
            targets: this,
            y: this._activeY,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                this._isRising = false;
                this._isActive = true;
                this.body.enable = true;  // ONLY enable after fully emerged
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

        // Don't check proximity while animating
        if (this._isFalling || this._isRising) return;

        // ── Cooldown check: prevent re-triggering too soon ──
        if (this._startHidden) {
            if (now - this._stateTimer < this._cooldownDuration) {
                return;
            }
        }

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
        // Note: _startHidden & _stateTimer are reset in _fall()'s onComplete tween callback
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
        this.body.enable = false;  // keep disabled during emergence
        this.setAlpha(0);

        this.scene.tweens.add({
            targets: this,
            y: this._emergeY,
            alpha: 1,
            duration: 350,
            ease: 'Back.easeOut',
            onComplete: () => {
                this._state = 'active';
                this.body.enable = true;  // ONLY enable after fully emerged
                this._stateTimer = this.scene.time.now;
            }
        });
    }

    _submerge() {
        this._state = 'submerging';
        this.body.enable = false;  // disable immediately to prevent hits while submerging

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
// SpikeTrap - Periodic retracting/extending serrated spike
// ────────────────────────────────────────────────────────────
class SpikeTrap extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, config) {
        super(scene, x, y, 'spike-trap');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(false);
        this.body.setImmovable(true);

        // Bottom-center anchor: base plate sits at the surface, spikes extend upward
        this.setOrigin(0.5, 1);

        // Config
        this._extendDelay = config.extendDelay || 1500;
        this._retractDelay = config.retractDelay || 2000;
        this._isInverted = config.inverted || false;

        // Positioning:
        // - Ground spike (y ~ GROUND_Y - 12 = 406): retracted fully behind ground tile
        // - Inverted / floating: retracted above/below surface
        const groundSurface = GROUND_Y; // 418
        const isOnGround = Math.abs(y - (GROUND_Y - 12)) < 10;

        if (isOnGround) {
            // Ground spike: base plate sits at ground surface when extended
            // hidden one tile below when retracted
            this._extendedY = groundSurface;       // 386, spikes emerge above surface
            this._retractedY = GROUND_Y + 4;       // 422, fully behind ground tile
        } else {
            this._extendedY = y;
            this._retractedY = this._isInverted ? y - 24 : y + 24;
        }

        // Hitbox: damage zone is a wide rectangle at the surface
        // We'll resize the physics body for the active spike area
        this.body.setSize(40, 20);
        this.body.setOffset(4, 12); // center the hitbox

        // State
        this._extended = false;
        this._stateTimer = 0;
        this._ready = false;

        // Start retracted — hidden behind platform via depth (not just transparent)
        this.y = this._retractedY;
        this.setDepth(-5);  // behind platforms (depth 0) when retracted
        this.body.enable = false;

        // Initial delay before first extension
        this.scene.time.delayedCall(config.initialDelay !== undefined ? config.initialDelay : 1000, () => {
            this._ready = true;
            this._stateTimer = scene.time.now;
        });
    }

    update() {
        if (!this._ready) return;

        const now = this.scene.time.now;

        if (!this._extended) {
            // Currently retracted — waiting to extend
            if (now - this._stateTimer >= this._extendDelay) {
                // Extend upward from platform!
                this._extended = true;
                this.body.enable = true;
                this.setDepth(5);  // above platforms when extended

                this.scene.tweens.add({
                    targets: this,
                    y: this._extendedY,
                    duration: 180,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        this._stateTimer = this.scene.time.now;
                    }
                });
            }
        } else {
            // Currently extended — waiting to retract
            if (now - this._stateTimer >= this._retractDelay) {
                // Retract back into platform
                this._extended = false;
                this.body.enable = false;
                this.setDepth(-5);  // behind platforms when retracted

                this.scene.tweens.add({
                    targets: this,
                    y: this._retractedY,
                    duration: 250,
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
