// BossScene - single-screen boss arena battles
class BossScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BossScene' });
    }

    init(data) {
        this.slotIndex     = data.slotIndex;
        this.districtIndex = data.districtIndex;
        this.levelIndex    = data.levelIndex;
        this.score         = data.score || 0;
        this.lives         = data.lives || 3;
    }

    create() {
        // ── BG color per district ──
        const bgColors = ['#2a1a0a', '#0a1a2a', '#1a0a0a'];
        this.cameras.main.setBackgroundColor(bgColors[this.districtIndex] || '#2a1a0a');
        this.cameras.main.fadeIn(500);

        const levelData = levels[this.levelIndex];
        this.currentSlot = this.slotIndex;
        this._levelCompleteTriggered = false;
        this._gameOverTriggered = false;

        // ── Arena layout (single screen, fixed camera) ──
        this.physics.world.setBounds(0, 0, 800, 450);

        // Ground platform
        this.platforms = this.physics.add.staticGroup();
        const ground = this.add.tileSprite(400, GROUND_Y + 16, 800, 32, 'ground-tile');
        this.physics.add.existing(ground, true);
        this.platforms.add(ground);

        // Elevated platforms (2 platforms)
        const plat1 = this.add.tileSprite(200, 308, 120, 32, 'ground-tile');
        this.physics.add.existing(plat1, true);
        this.platforms.add(plat1);
        
        const plat2 = this.add.tileSprite(600, 308, 120, 32, 'ground-tile');
        this.physics.add.existing(plat2, true);
        this.platforms.add(plat2);

        // ── Player ──
        this.player = new Player(this, 100, 368);
        this.physics.add.collider(this.player, this.platforms);

        // ── Touch controls ──
        this.touchControls = new TouchControls(this);

        // ── Keyboard ──
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyW = this.input.keyboard.addKey('W');
        this.keyA = this.input.keyboard.addKey('A');
        this.keyD = this.input.keyboard.addKey('D');
        this.keySpace = this.input.keyboard.addKey('SPACE');
        this.keyShield = this.input.keyboard.addKey(SHIELD_KEY);

        // ── Boss setup ──
        this._bossHP = 0;
        this._bossMaxHP = 0;
        this._bossPhase = 1;
        this._bossName = '';
        this._bossState = 'spawning';
        this._bossTimer = 0;
        this._bossAttackTimer = 0;
        this._bossDead = false;
        this._projectiles = [];

        this._createBoss();

        // ── HP Bar ──
        this._createHPBar();

        // ── HUD Elements ──
        this._createBossHUD();

        // ── Boss Intel upgrade ──
        const saveData = SaveManager.load(this.currentSlot) || {};
        this._hasBossIntel = !!(saveData.upgrades && saveData.upgrades.boss_intel);

        // ── State flags ──
        this._lastGroundedTime = 0;
        this._jumpBufferTime = 0;
        this._coyoteTimeMs = 100;
        this._jumpBufferMs = 180;
        this._isJumping = false;
        this._jumpCount = 0;
        this._isPaused = false;
        this._shieldCharges = (saveData.inventory && saveData.inventory.shield) || 0;
        if (saveData.upgrades && saveData.upgrades.coat) this._shieldCharges = Math.max(this._shieldCharges, 1);

        // ── UI depth reference ──
        const B = 400;

        // HP bar labels
        this._hpLabel = this.add.text(400, 26, this._bossName, {
            fontSize: '14px', fontFamily: 'monospace', color: '#FFD700', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(B + 10);

        this._hpCountText = this.add.text(400, 42, this._bossHP + ' / ' + this._bossMaxHP, {
            fontSize: '11px', fontFamily: 'monospace', color: '#FFFFFF',
            stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(B + 10);

        // Stage info
        const districtNames = ['Bellows District', 'Clockwork Quarter', 'The Core'];
        this.add.text(400, 12, districtNames[this.districtIndex] + ' — BOSS', {
            fontSize: '10px', fontFamily: 'monospace', color: '#888888',
            stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(B + 10);

        // Lives display
        this._livesText = this.add.text(16, 70, '', {
            fontSize: '14px', fontFamily: 'monospace', color: '#FF4444'
        }).setScrollFactor(0).setDepth(B + 10);
        this._updateLivesDisplay();

        // Score display
        this._scoreText = this.add.text(784, 70, 'SCORE: ' + this.score, {
            fontSize: '12px', fontFamily: 'monospace', color: '#FFFFFF',
            stroke: '#000000', strokeThickness: 2
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(B + 10);

        // ── Entrance ──
        this.cameras.main.flash(300, 255, 255, 255);

        // Boss entrance after 500ms
        this.time.delayedCall(500, () => {
            if (this._bossSprite) {
                this.tweens.add({
                    targets: this._bossSprite,
                    alpha: { from: 0, to: 1 },
                    scale: { from: 0.5, to: 1 },
                    duration: 600,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        this._bossState = this.districtIndex === 1 ? 'hover' : 'idle';
                        this._bossTimer = this.time.now;
                    }
                });
            }
        });
    }

    // ── Create boss based on district ──
    _createBoss() {
        switch (this.districtIndex) {
            case 0: this._createBellowsBrute(); break;
            case 1: this._createClockworkSentinel(); break;
            case 2: this._createCoreTyrant(); break;
        }
    }

    // ═══════════════════════════════════════════
    // BOSS 0 — "Bellows Brute" (HP: 3)
    // ═══════════════════════════════════════════
    _createBellowsBrute() {
        this._bossName = 'BELLOWS BRUTE';
        this._bossHP = 3;
        this._bossMaxHP = 3;
        this._bossPhase = 1;

        this._bossSprite = this.physics.add.sprite(600, 320, 'boss-bellows');
        this._bossSprite.body.setAllowGravity(false);
        this._bossSprite.setImmovable(true);
        this._bossSprite.setDepth(20);
        this._bossSprite.setAlpha(0);

        this._bossSprite.body.setSize(60, 80);
        this._bossSprite.body.setOffset(6, 16);

        this._bossBehavior = 'idle';
        this._bossBehaviorTimer = 0;
    }

    _updateBellowsBrute(time) {
        if (this._bossDead) return;
        const elapsed = time - this._bossTimer;

        switch (this._bossBehavior) {
            case 'idle': {
                // Subtle breathe
                if (!this._bossBreatheTween) {
                    this._bossBreatheTween = this.tweens.add({
                        targets: this._bossSprite,
                        scaleY: 1.03,
                        scaleX: 0.97,
                        duration: 800,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                }
                if (elapsed > 2000) {
                    this._bossBehavior = 'charge';
                    this._bossBehaviorTimer = time;
                    this._bossTimer = time;
                    this._showIntelWarning('INCOMING: CHARGE');
                }
                break;
            }
            case 'charge': {
                const dx = this.player.x - this._bossSprite.x;
                const dir = dx > 0 ? 1 : -1;
                this._bossSprite.setVelocityX(220 * dir);
                this._bossSprite.setFlipX(dir < 0);
                this._bossSprite.setTint(0xFF8800);
                if (elapsed > 1200) {
                    this._bossSprite.setVelocityX(0);
                    this._bossSprite.clearTint();
                    this._bossBehavior = 'stomp';
                    this._bossTimer = time;
                    this._showIntelWarning('INCOMING: STOMP');
                }
                break;
            }
            case 'stomp': {
                // Jump to player x
                this._bossSprite.x = Phaser.Math.Linear(this._bossSprite.x, this.player.x, 0.05);
                if (elapsed > 1500) {
                    // Land and create shockwave
                    this.cameras.main.shake(200, 0.015);
                    // Shockwave expanding rect
                    const sw = this.add.rectangle(this._bossSprite.x, 398, 10, 12, 0xFF8800, 0.6).setDepth(15);
                    this.tweens.add({
                        targets: sw,
                        width: 400,
                        alpha: 0,
                        duration: 400,
                        onComplete: () => sw.destroy()
                    });
                    // Check player hit
                    if (Math.abs(this.player.x - this._bossSprite.x) < 200 && this.player.y > 380 && !this.player.isInvincible) {
                        this._hurtPlayer();
                    }
                    this._bossBehavior = 'idle';
                    this._bossTimer = time;
                    this._bossBreatheTween = null;
                }
                break;
            }
        }

        // Stomp-on-head check
        if (!this._bossDead && this.player.body.velocity.y > 0 &&
            this.player.body.y + this.player.body.height > this._bossSprite.y &&
            this.player.body.y + this.player.body.height < this._bossSprite.y + 30 &&
            Math.abs(this.player.x - this._bossSprite.x) < 40) {
            this._hitBoss();
        }
    }

    // ═══════════════════════════════════════════
    // BOSS 1 — "Clockwork Sentinel" (HP: 5)
    // ═══════════════════════════════════════════
    _createClockworkSentinel() {
        this._bossName = 'CLOCKWORK SENTINEL';
        this._bossHP = 5;
        this._bossMaxHP = 5;
        this._bossPhase = 1;

        this._bossSprite = this.physics.add.sprite(600, 200, 'boss-sentinel');
        this._bossSprite.body.setAllowGravity(false);
        this._bossSprite.setImmovable(true);
        this._bossSprite.setDepth(20);
        this._bossSprite.setAlpha(0);

        this._bossSprite.body.setSize(60, 60);
        this._bossSprite.body.setOffset(6, 6);

        this._bossBehavior = 'hover';
        this._bossBehaviorTimer = 0;
        this._bossBaseY = 200;

        // Floating oscillation
        this.tweens.add({
            targets: this._bossSprite,
            y: this._bossBaseY - 30,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    _updateClockworkSentinel(time) {
        if (this._bossDead) return;
        const elapsed = time - this._bossTimer;

        // Rotate slowly
        this._bossSprite.angle += 0.3;

        switch (this._bossBehavior) {
            case 'hover': {
                // Descend every few seconds
                if (elapsed > 3000) {
                    this._bossBehavior = 'descend';
                    this._bossTimer = time;
                    this._showIntelWarning('INCOMING: STOMP WINDOW');
                    // Stop oscillation
                    this.tweens.killTweensOf(this._bossSprite);
                    this.tweens.add({
                        targets: this._bossSprite,
                        y: 280,
                        duration: 800,
                        ease: 'Quad.easeIn'
                    });
                }
                break;
            }
            case 'descend': {
                if (elapsed > 800) {
                    // Stomp window: check player stomp
                    if (this._bossSprite.y >= 270) {
                        // Player can stomp here
                        if (this.player.body.velocity.y > 0 &&
                            this.player.body.y + this.player.body.height > this._bossSprite.y - 10 &&
                            this.player.body.y + this.player.body.height < this._bossSprite.y + 20 &&
                            Math.abs(this.player.x - this._bossSprite.x) < 50) {
                            this._hitBoss();
                        }
                    }
                }
                if (elapsed > 2500) {
                    this._bossBehavior = 'bomb';
                    this._bossTimer = time;
                }
                break;
            }
            case 'bomb': {
                // Drop bomb
                const bomb = this.add.rectangle(this._bossSprite.x, this._bossSprite.y + 30, 8, 8, 0xFF4400).setDepth(15);
                this.physics.add.existing(bomb);
                bomb.body.setAllowGravity(true);
                bomb.body.setVelocityY(200);
                bomb.body.setGravityY(400);
                this._projectiles.push(bomb);

                this._bossBehavior = 'laser';
                this._bossTimer = time;
                this._showIntelWarning('INCOMING: LASER SWEEP');
                break;
            }
            case 'laser': {
                // Sweep laser
                const laserG = this.add.graphics().setDepth(14);
                laserG.lineStyle(3, 0xFF0000, 0.8);
                laserG.lineBetween(this._bossSprite.x, this._bossSprite.y + 30, 
                    this._bossSprite.x + (this.player.x > this._bossSprite.x ? 800 : -800), 
                    this._bossSprite.y + 30);
                
                // Check player hit
                if (Math.abs(this.player.y - (this._bossSprite.y + 30)) < 20 && !this.player.isInvincible) {
                    this._hurtPlayer();
                }

                this.time.delayedCall(600, () => {
                    laserG.destroy();
                    this._bossBehavior = 'ascend';
                    this._bossTimer = time;
                });
                this._bossTimer = time + 600;
                this._bossBehavior = 'waiting';
                break;
            }
            case 'waiting':
                break;
            case 'ascend': {
                this.tweens.add({
                    targets: this._bossSprite,
                    y: this._bossBaseY - 30,
                    duration: 800,
                    ease: 'Quad.easeOut',
                    onComplete: () => {
                        this._bossBehavior = 'hover';
                        this._bossTimer = time;
                        // Restart oscillation
                        this.tweens.add({
                            targets: this._bossSprite,
                            y: this._bossBaseY - 30,
                            duration: 1500,
                            yoyo: true,
                            repeat: -1,
                            ease: 'Sine.easeInOut'
                        });
                    }
                });
                this._bossBehavior = 'waiting';
                break;
            }
        }

        // Bomb ground collision
        for (let i = this._projectiles.length - 1; i >= 0; i--) {
            const b = this._projectiles[i];
            if (b && b.active && b.y >= GROUND_Y - 10) {
                b.body.setVelocity(0, 0);
                b.body.setAllowGravity(false);
                // Explosion
                this.tweens.add({
                    targets: b,
                    scale: 3,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => { if (b.active) b.destroy(); }
                });
                // Damage player if close
                if (Math.abs(this.player.x - b.x) < 50 && Math.abs(this.player.y - b.y) < 30 && !this.player.isInvincible) {
                    this._hurtPlayer();
                }
                this._projectiles.splice(i, 1);
            }
        }
    }

    // ═══════════════════════════════════════════
    // BOSS 2 — "Core Tyrant" (HP: 5)
    // ═══════════════════════════════════════════
    _createCoreTyrant() {
        this._bossName = 'CORE TYRANT';
        this._bossHP = 5;
        this._bossMaxHP = 5;
        this._bossPhase = 1;

        this._bossSprite = this.physics.add.sprite(600, 320, 'boss-tyrant');
        this._bossSprite.body.setAllowGravity(false);
        this._bossSprite.setImmovable(true);
        this._bossSprite.setDepth(20);
        this._bossSprite.setAlpha(0);

        this._bossSprite.body.setSize(80, 100);
        this._bossSprite.body.setOffset(8, 20);

        this._bossBehavior = 'idle';
        this._bossBehaviorTimer = 0;
    }

    _updateCoreTyrant(time) {
        if (this._bossDead) return;
        const elapsed = time - this._bossTimer;

        // Phase 2 check
        if (this._bossHP <= 2 && this._bossPhase === 1) {
            this._bossPhase = 2;
            this._bossSprite.setTint(0xFF3300);
            this.cameras.main.shake(300, 0.02);
            this._showFloatingText(600, 200, 'PHASE 2!', '#FF0000');
            this._bossBehavior = 'idle';
            this._bossTimer = time;
        }

        switch (this._bossBehavior) {
            case 'idle': {
                if (elapsed > 2000) {
                    this._bossBehavior = 'charge';
                    this._bossTimer = time;
                    this._showIntelWarning('INCOMING: CHARGE');
                }
                break;
            }
            case 'charge': {
                const speed = this._bossPhase === 2 ? 380 : 280;
                const dx = this.player.x - this._bossSprite.x;
                const dir = dx > 0 ? 1 : -1;
                this._bossSprite.setVelocityX(speed * dir);
                this._bossSprite.setFlipX(dir < 0);
                if (elapsed > 1500) {
                    this._bossSprite.setVelocityX(0);
                    this._bossBehavior = 'idle';
                    this._bossTimer = time;
                }
                // Check collision with player
                if (!this.player.isInvincible && 
                    Math.abs(this.player.x - this._bossSprite.x) < 50 &&
                    Math.abs(this.player.y - this._bossSprite.y) < 40) {
                    this._hurtPlayer();
                }
                break;
            }
        }

        // Phase 2: Projectile rain
        if (this._bossPhase === 2) {
            const rainElapsed = time - this._bossAttackTimer;
            if (rainElapsed > 1200) {
                this._bossAttackTimer = time;
                for (let i = 0; i < 3; i++) {
                    const rx = Phaser.Math.Between(50, 750);
                    const proj = this.add.rectangle(rx, 0, 8, 8, 0xFF6600).setDepth(15);
                    this.physics.add.existing(proj);
                    proj.body.setAllowGravity(true);
                    proj.body.setGravityY(300);
                    this._projectiles.push(proj);
                }
            }
        }

        // Projectile cleanup & damage
        for (let i = this._projectiles.length - 1; i >= 0; i--) {
            const b = this._projectiles[i];
            if (b && b.active) {
                if (b.y > GAME_HEIGHT + 20) {
                    b.destroy();
                    this._projectiles.splice(i, 1);
                } else if (!this.player.isInvincible && 
                    Math.abs(this.player.x - b.x) < 15 && 
                    Math.abs(this.player.y - b.y) < 15) {
                    this._hurtPlayer();
                    b.destroy();
                    this._projectiles.splice(i, 1);
                }
            } else {
                this._projectiles.splice(i, 1);
            }
        }

        // Stomp-on-head check (same as bellows)
        if (!this._bossDead && this.player.body.velocity.y > 0 &&
            this.player.body.y + this.player.body.height > this._bossSprite.y &&
            this.player.body.y + this.player.body.height < this._bossSprite.y + 30 &&
            Math.abs(this.player.x - this._bossSprite.x) < 45) {
            this._hitBoss();
        }
    }

    // ── Hit boss ──
    _hitBoss() {
        if (this._bossDead) return;
        this._bossHP--;
        this.player.bounce();

        // Update HP bar
        this._updateHPBar();

        // Flash white
        this._bossSprite.setTint(0xFFFFFF);
        this.time.delayedCall(200, () => {
            if (this._bossSprite && this._bossSprite.active) {
                if (this._bossPhase === 2) {
                    this._bossSprite.setTint(0xFF3300);
                } else {
                    this._bossSprite.clearTint();
                }
            }
        });

        // Screen shake
        this.cameras.main.shake(150, 0.015);

        // Spawn particles
        this._emitParticles(this._bossSprite.x, this._bossSprite.y, 0xFFD700, 10);

        // Score
        this.score += 100;
        this._scoreText.setText('SCORE: ' + this.score);
        this._showFloatingText(this._bossSprite.x, this._bossSprite.y - 40, '+100', '#FFD700');

        // Boss death
        if (this._bossHP <= 0) {
            this._bossDead = true;
            this._bossDeath();
        }
    }

    // ── Boss death ──
    _bossDeath() {
        this._bossSprite.body.enable = false;

        // Death explosion
        this.tweens.add({
            targets: this._bossSprite,
            scale: 3,
            alpha: 0,
            duration: 800,
            ease: 'Quad.easeOut'
        });

        // Screen flash white
        const flash = this.add.rectangle(400, 225, 800, 450, 0xFFFFFF, 0).setDepth(9999);
        this.tweens.add({
            targets: flash,
            alpha: { from: 0, to: 0.8 },
            duration: 200,
            yoyo: true,
            hold: 200,
            onComplete: () => flash.destroy()
        });

        // Particles burst
        for (let i = 0; i < 20; i++) {
            this.time.delayedCall(i * 50, () => {
                this._emitParticles(
                    this._bossSprite.x + Phaser.Math.Between(-20, 20),
                    this._bossSprite.y + Phaser.Math.Between(-20, 20),
                    0xFFD700, 5
                );
            });
        }

        // Save boss defeated
        SaveManager.markBossDefeated(this.currentSlot, this.levelIndex);

        // Bonus score
        const bonus = 500 * (this.districtIndex + 1);
        this.score += bonus;
        this._showFloatingText(400, 150, 'BONUS: +' + bonus, '#FFD700');

        // Transition to level complete after delay
        this.time.delayedCall(1500, () => {
            const coinsCollected = 0; // Boss levels have no coins
            const totalCoins = 0;
            const elapsed = 0;
            const starResult = { stars: 3, coinsCollected: 0, totalCoins: 0, timeSeconds: 0 };
            this.scene.start('LevelCompleteScene', {
                score: this.score,
                level: this.levelIndex,
                nextLevel: this.levelIndex + 1,
                lives: this.lives,
                saveSlot: this.currentSlot,
                stars: starResult
            });
        });
    }

    // ── HP Bar ──
    _createHPBar() {
        const B = 400;
        this._hpBarBg = this.add.rectangle(400, 34, 300, 14, 0x333333, 0.8)
            .setScrollFactor(0).setDepth(B + 10);
        this._hpBarFill = this.add.rectangle(250, 34, 0, 12, 0xFF2222, 1)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(B + 11);
        this._updateHPBar();
    }

    _updateHPBar() {
        if (!this._hpBarFill) return;
        const ratio = this._bossMaxHP > 0 ? this._bossHP / this._bossMaxHP : 0;
        const targetW = Math.max(0, 296 * ratio);
        this.tweens.add({
            targets: this._hpBarFill,
            width: targetW,
            duration: 200,
            ease: 'Quad.easeOut'
        });
        // Update text
        if (this._hpCountText) {
            this._hpCountText.setText(this._bossHP + ' / ' + this._bossMaxHP);
        }
        // Color based on HP
        if (ratio > 0.5) this._hpBarFill.setFillStyle(0xFF2222);
        else if (ratio > 0.25) this._hpBarFill.setFillStyle(0xFF8800);
        else this._hpBarFill.setFillStyle(0xFF0000);
    }

    // ── Boss HUD ──
    _createBossHUD() {
        const B = 400;
        // Lives display
        this._livesText = this.add.text(16, 70, '', {
            fontSize: '14px', fontFamily: 'monospace', color: '#FF4444'
        }).setScrollFactor(0).setDepth(B + 10);
        this._updateLivesDisplay();

        this._scoreText = this.add.text(784, 70, 'SCORE: ' + this.score, {
            fontSize: '12px', fontFamily: 'monospace', color: '#FFFFFF',
            stroke: '#000000', strokeThickness: 2
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(B + 10);

        // Intel warning text
        if (this._hasBossIntel) {
            this._intelText = this.add.text(400, 90, '', {
                fontSize: '12px', fontFamily: 'monospace', color: '#FF4444', fontStyle: 'bold',
                stroke: '#000000', strokeThickness: 2
            }).setOrigin(0.5).setScrollFactor(0).setDepth(B + 20).setAlpha(0);
        }
    }

    _updateLivesDisplay() {
        if (this._livesText) {
            let str = '';
            for (let i = 0; i < this.lives; i++) str += '\u2764 ';
            this._livesText.setText(str.trim());
        }
    }

    // ── Intel warning ──
    _showIntelWarning(msg) {
        if (!this._hasBossIntel || !this._intelText) return;
        this._intelText.setText(msg).setAlpha(1);
        this.tweens.add({
            targets: this._intelText,
            alpha: 0,
            duration: 1500,
            ease: 'Quad.easeOut'
        });
    }

    // ── Hurt player ──
    _hurtPlayer() {
        if (this.player.isInvincible || this.player.isDead || this._gameOverTriggered) return;

        // Try shield first
        if (this._shieldCharges > 0) {
            this._shieldCharges--;
            this.player.makeInvincible();
            if (this.player._flashTween) {
                this.player._flashTween.destroy();
            }
            this.player.isInvincible = true;
            this.player._flashTween = this.tweens.add({
                targets: this.player,
                alpha: { from: 1, to: 0.3 },
                duration: 150,
                yoyo: true,
                repeat: 16,
                onComplete: () => {
                    this.player.isInvincible = false;
                    this.player.alpha = 1;
                }
            });
            const flash = this.add.rectangle(this.player.x, this.player.y, 32, 32, 0x4444FF, 0.5).setDepth(100);
            this.tweens.add({ targets: flash, alpha: 0, duration: 300, onComplete: () => flash.destroy() });
            return;
        }

        this.lives--;
        this.player.makeInvincible();
        this.cameras.main.shake(150, 0.012);
        this.cameras.main.flash(200, 255, 0, 0, true);
        this._emitParticles(this.player.x, this.player.y, 0xFF4444, 10);
        this._updateLivesDisplay();

        if (this.lives <= 0) {
            this._gameOver();
        }
    }

    // ── Game over ──
    _gameOver() {
        if (this._gameOverTriggered) return;
        this._gameOverTriggered = true;
        this.player.isDead = true;
        this.player.freeze();
        this.player.body.enable = false;
        this.player.setTexture('player-hurt');

        const overlay = this.add.rectangle(400, 225, 800, 450, 0x000000, 0)
            .setScrollFactor(0).setDepth(9999);
        this.tweens.add({
            targets: overlay,
            alpha: 1,
            duration: 500,
            onComplete: () => {
                this.scene.start('GameOverScene', {
                    score: this.score,
                    level: this.levelIndex,
                    saveSlot: this.currentSlot,
                    coinsCollected: 0,
                    totalCoins: 0,
                    timeSeconds: 0
                });
            }
        });
    }

    // ── Floating text ──
    _showFloatingText(x, y, text, color) {
        const floatText = this.add.text(x, y, text, {
            fontFamily: 'monospace', fontSize: '16px', color: color || '#FFD700',
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);
        this.tweens.add({
            targets: floatText,
            y: y - 50,
            alpha: 0,
            duration: 800,
            ease: 'Quad.easeOut',
            onComplete: () => floatText.destroy()
        });
    }

    // ── Particles ──
    _emitParticles(x, y, color, count) {
        for (let i = 0; i < (count || 8); i++) {
            const p = this.add.rectangle(
                x + Phaser.Math.Between(-4, 4),
                y + Phaser.Math.Between(-4, 4),
                4, 4, color || 0xFFD700
            );
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const speed = Phaser.Math.Between(40, 120);
            this.tweens.add({
                targets: p,
                x: p.x + Math.cos(angle) * speed,
                y: p.y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0,
                duration: Phaser.Math.Between(300, 600),
                ease: 'Quad.easeOut',
                onComplete: () => p.destroy()
            });
        }
    }

    // ── Update loop ──
    update(time, delta) {
        if (this.player.isDead || this._gameOverTriggered || this._levelCompleteTriggered) return;

        // ── Ground state ──
        const onGround = this.player.body.blocked.down;
        if (onGround) {
            this._lastGroundedTime = time;
            this._isJumping = false;
            this._jumpCount = 0;
        }

        // ── Input ──
        const leftInput = this.cursors.left.isDown || this.keyA.isDown || this.touchControls.getLeft();
        const rightInput = this.cursors.right.isDown || this.keyD.isDown || this.touchControls.getRight();
        const touchJump = this.touchControls.consumeJump();
        const jumpJustDown = Phaser.Input.Keyboard.JustDown(this.cursors.up)
            || Phaser.Input.Keyboard.JustDown(this.keyW)
            || Phaser.Input.Keyboard.JustDown(this.keySpace)
            || touchJump;

        if (jumpJustDown) this._jumpBufferTime = time;
        const hasBufferedJump = (time - this._jumpBufferTime) < this._jumpBufferMs;
        const hasCoyoteTime = (time - this._lastGroundedTime) < this._coyoteTimeMs;
        const canJump = (onGround || hasCoyoteTime) && hasBufferedJump;
        const canDoubleJump = !onGround && !hasCoyoteTime && this._jumpCount < 2 && jumpJustDown;

        if (canJump) {
            this.player.body.setVelocityY(PLAYER_JUMP);
            this._jumpBufferTime = 0;
            this._lastGroundedTime = 0;
            this._isJumping = true;
            this._jumpCount = 1;
        } else if (canDoubleJump) {
            this.player.body.setVelocityY(PLAYER_DOUBLE_JUMP);
            this._isJumping = true;
            this._jumpCount = 2;
        }

        const jumpStillHeld = this.cursors.up.isDown || this.keyW.isDown || this.keySpace.isDown || this.touchControls.getJump();
        if (this._isJumping && !jumpStillHeld && this.player.body.velocity.y < -200) {
            this.player.body.setVelocityY(this.player.body.velocity.y * 0.7);
            this._isJumping = false;
        }

        if (leftInput) {
            this.player.body.setVelocityX(-PLAYER_SPEED);
            this.player.setFlipX(true);
        } else if (rightInput) {
            this.player.body.setVelocityX(PLAYER_SPEED);
            this.player.setFlipX(false);
        }

        // ── Shield key ──
        if (Phaser.Input.Keyboard.JustDown(this.keyShield) && this._shieldCharges > 0 && !this.player.isInvincible && !this.player.isDead) {
            this._shieldCharges--;
            this.player.makeInvincible();
            if (this.player._flashTween) {
                this.player._flashTween.destroy();
            }
            this.player.isInvincible = true;
            this.player._flashTween = this.tweens.add({
                targets: this.player,
                alpha: { from: 1, to: 0.3 },
                duration: 150,
                yoyo: true,
                repeat: 16,
                onComplete: () => {
                    this.player.isInvincible = false;
                    this.player.alpha = 1;
                }
            });
            const flash = this.add.rectangle(this.player.x, this.player.y, 32, 32, 0x4444FF, 0.5).setDepth(100);
            this.tweens.add({ targets: flash, alpha: 0, duration: 300, onComplete: () => flash.destroy() });
        }

        // ── Player animation ──
        this.player.updateAnimation();

        // ── Update boss ──
        if (!this._bossDead) {
            switch (this.districtIndex) {
                case 0: this._updateBellowsBrute(time); break;
                case 1: this._updateClockworkSentinel(time); break;
                case 2: this._updateCoreTyrant(time); break;
            }
        }

        // ── Fall death ──
        if (this.player.y > GAME_HEIGHT + 50) {
            if (this.player.isDead || this.player.isInvincible) return;
            this._hurtPlayer();
        }
    }

    // ── Cleanup on shutdown ──
    shutdown() {
        if (this._bossBreatheTween) { this._bossBreatheTween.destroy(); this._bossBreatheTween = null; }
        if (this._bossSprite) { this._bossSprite.destroy(); this._bossSprite = null; }
        this._projectiles.forEach(p => { if (p && p.active) p.destroy(); });
        this._projectiles = [];
    }
}
