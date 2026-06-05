// GameScene - main gameplay scene, handles all level logic
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.currentLevel = data.level || 0;
        this.score = data.score || 0;
        this.lives = data.lives !== undefined ? data.lives : INITIAL_LIVES;
    }

    create() {
        const levelData = levels[this.currentLevel];
        if (!levelData) {
            // Invalid level - go to main menu
            this.scene.start('MainMenuScene');
            return;
        }

        // Set world bounds (extra height for fall death zone)
        this.physics.world.setBounds(0, 0, levelData.width, levelData.height + 200);

        // Create background
        this._createBackground(levelData);

        // Create platforms
        this.platforms = this.physics.add.staticGroup();
        this._createPlatforms(levelData);

        // Create moving platforms
        this.movingPlatforms = [];
        this._createMovingPlatforms(levelData);

        // Create player
        this.player = new Player(this, levelData.playerStart.x, levelData.playerStart.y);
        this.player.setCollideWorldBounds(true);

        // Create enemies
        this.enemies = this.physics.add.group();
        this._createEnemies(levelData);

        // Create coins (disable gravity so they stay in place)
        this.coins = this.physics.add.group({ allowGravity: false });
        this._createCoins(levelData);
        this.totalCoins = levelData.coins.length;

        // Create exit gate
        this._createGate(levelData);

        // Create obstacles (saw blades, spikes)
        this.obstacles = this.physics.add.group({ allowGravity: false });
        this._createObstacles(levelData);

        // Setup camera
        this.cameras.main.setBounds(0, 0, levelData.width, levelData.height);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setDeadzone(100, 50);
        this.cameras.main.fadeIn(500);

        // Setup collisions: static platforms
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);

        // Moving platforms (dynamic bodies — Phaser auto-handles riding)
        this.movingPlatforms.forEach(mp => {
            this.physics.add.collider(this.player, mp);
            this.physics.add.collider(this.enemies, mp);
        });

        // Player-enemy overlap with stomp detection
        this.physics.add.overlap(this.player, this.enemies, this._handleEnemyCollision, null, this);

        // Player-coin overlap
        this.physics.add.overlap(this.player, this.coins, this._handleCoinCollect, null, this);

        // Player-obstacle overlap (instant damage, no stomp)
        this.physics.add.overlap(this.player, this.obstacles, this._handleObstacleHit, null, this);

        // Player-gate overlap (only triggers if gate is active)
        this.physics.add.overlap(this.player, this.gate, this._handleGateReached, null, this);

        // Setup keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyW = this.input.keyboard.addKey('W');
        this.keyA = this.input.keyboard.addKey('A');
        this.keyD = this.input.keyboard.addKey('D');
        this.keySpace = this.input.keyboard.addKey('SPACE');

        // Setup touch controls
        this.touchControls = new TouchControls(this);

        // Launch HUD scene
        this.scene.launch('HUDScene', {
            score: this.score,
            lives: this.lives,
            levelName: levelData.name,
            totalCoins: this.totalCoins
        });
        // Send initial coin count
        this.events.emit('updateCoins', {
            collected: 0,
            total: this.totalCoins
        });

        // State flags
        this._gameOverTriggered = false;
        this._levelCompleteTriggered = false;
        this._gateActive = false;
        this._isPaused = false;

        // Platformer feel improvements
        this._lastGroundedTime = 0;
        this._jumpBufferTime = 0;
        this._coyoteTimeMs = 100;   // ms after leaving ground where jump still works
        this._jumpBufferMs = 180;   // ms to buffer a jump input before landing
        this._isJumping = false;

        // ── Visual polish: player entrance animation ──
        this._doEntranceAnimation();

        // ── Pause system ──
        this._setupPause();
    }

    // ── Pause System ──
    _setupPause() {
        // Pause button (top-right corner)
        this.pauseBtn = this.add.image(GAME_WIDTH - 24, 24, 'btn-pause')
            .setInteractive({ useHandCursor: true })
            .setScrollFactor(0)
            .setDepth(900);

        this.pauseBtn.on('pointerdown', () => this._togglePause());

        // Escape key to pause
        this.input.keyboard.on('keydown-ESC', () => this._togglePause());

        // Pause menu container (hidden initially)
        this.pauseContainer = this.add.container(0, 0).setDepth(950).setVisible(false);
    }

    _togglePause() {
        if (this._gameOverTriggered || this._levelCompleteTriggered) return;

        this._isPaused = !this._isPaused;

        if (this._isPaused) {
            this.physics.world.pause();
            this.tweens.pauseAll();
            this.scene.pause('HUDScene');
            this._showPauseMenu();
        } else {
            this.physics.world.resume();
            this.tweens.resumeAll();
            this.scene.resume('HUDScene');
            this._hidePauseMenu();
        }
    }

    _showPauseMenu() {
        const cx = GAME_WIDTH / 2;
        const cy = GAME_HEIGHT / 2;

        // Dim overlay
        this.pauseOverlay = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
            .setScrollFactor(0).setDepth(900);

        // Panel background
        const panel = this.add.rectangle(cx, cy, 260, 260, 0x1a1a2e, 0.95)
            .setStrokeStyle(2, 0xFFD700).setDepth(910);

        // Title
        const title = this.add.text(cx, cy - 100, 'PAUSED', {
            fontSize: '28px', fontFamily: 'monospace', color: '#FFD700', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(920);

        // Resume button
        const resumeBtn = this._makePauseButton(cx, cy - 30, '▶  RESUME', () => this._togglePause());
        const restartBtn = this._makePauseButton(cx, cy + 40, '↻  RESTART', () => {
            this._isPaused = false;
            this.physics.world.resume();
            this.tweens.resumeAll();
            this.scene.resume('HUDScene');
            this.scene.restart({ level: this.currentLevel, score: this.score, lives: this.lives });
        });
        const menuBtn = this._makePauseButton(cx, cy + 110, '☰  MAIN MENU', () => {
            this._isPaused = false;
            this.physics.world.resume();
            this.tweens.resumeAll();
            this.scene.resume('HUDScene');
            this.scene.stop('HUDScene');
            this.scene.start('MainMenuScene');
        });

        this.pauseContainer.add([this.pauseOverlay, panel, title, resumeBtn.bg, resumeBtn.label,
            restartBtn.bg, restartBtn.label, menuBtn.bg, menuBtn.label]);
        this.pauseContainer.setVisible(true);
    }

    _hidePauseMenu() {
        this.pauseContainer.removeAll(true);
        this.pauseContainer.setVisible(false);
    }

    _makePauseButton(x, y, text, callback) {
        const bg = this.add.rectangle(x, y, 220, 46, 0x444466, 0.9)
            .setStrokeStyle(2, 0x8888AA)
            .setInteractive({ useHandCursor: true });
        const label = this.add.text(x, y, text, {
            fontSize: '16px', fontFamily: 'monospace', color: '#FFFFFF', fontStyle: 'bold'
        }).setOrigin(0.5);

        bg.on('pointerover', () => {
            this.tweens.add({ targets: [bg, label], scaleX: 1.06, scaleY: 1.06, duration: 80 });
            bg.setFillStyle(0x6666AA);
            bg.setStrokeStyle(2, 0xFFD700);
            label.setColor('#FFD700');
        });
        bg.on('pointerout', () => {
            this.tweens.add({ targets: [bg, label], scaleX: 1, scaleY: 1, duration: 80 });
            bg.setFillStyle(0x444466);
            bg.setStrokeStyle(2, 0x8888AA);
            label.setColor('#FFFFFF');
        });
        bg.on('pointerdown', () => {
            this.tweens.add({ targets: [bg, label], scaleX: 0.95, scaleY: 0.95, duration: 40 });
        });
        bg.on('pointerup', () => callback());
        return { bg, label };
    }

    // ── Visual polish: entrance animation ──
    _doEntranceAnimation() {
        // Flash effect
        this.cameras.main.flash(300, 255, 255, 255);

        // Player slam-in from above
        const startY = this.player.y;
        this.player.y = -50;
        this.player.body.allowGravity = false;
        this.player.body.moves = false;

        this.tweens.add({
            targets: this.player,
            y: startY,
            duration: 400,
            ease: 'Bounce.easeOut',
            onComplete: () => {
                this.player.body.allowGravity = true;
                this.player.body.moves = true;
                // Small landing shake
                this.cameras.main.shake(80, 0.004);
            }
        });
    }

    // ── Visual polish: floating score text ──
    _showFloatingText(x, y, text, color) {
        const floatText = this.add.text(x, y, text, {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: color || '#FFD700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
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

    // ── Visual polish: particle burst ──
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

    // ── Background ──
    _createBackground(levelData) {
        const bg = this.add.tileSprite(0, 0, levelData.width, GAME_HEIGHT, levelData.background);
        bg.setOrigin(0, 0);
        bg.setScrollFactor(0.1);

        // Dark overlay for atmosphere
        const overlay = this.add.rectangle(0, 0, levelData.width, GAME_HEIGHT, 0x000000, 0.15);
        overlay.setOrigin(0, 0);
        overlay.setScrollFactor(0);
    }

    // ── Platforms ──
    _createPlatforms(levelData) {
        levelData.platforms.forEach(p => {
            const platform = this.add.tileSprite(
                p.x + p.width / 2,
                p.y + p.height / 2,
                p.width,
                p.height,
                'ground-tile'
            );
            this.physics.add.existing(platform, true); // static body
            this.platforms.add(platform);
        });
    }

    // ── Enemies ──
    _createEnemies(levelData) {
        levelData.enemies.forEach(e => {
            const enemy = new Enemy(this, e.x, e.y, e.patrolLeft, e.patrolRight);
            this.enemies.add(enemy);
        });
    }

    // ── Coins ──
    _createCoins(levelData) {
        levelData.coins.forEach(c => {
            const coin = new Coin(this, c.x, c.y);
            this.coins.add(coin);
        });
    }

    // ── Moving Platforms ──
    _createMovingPlatforms(levelData) {
        if (!levelData.movingPlatforms) return;
        levelData.movingPlatforms.forEach(cfg => {
            const mp = new MovingPlatform(this, cfg.x, cfg.y, cfg);
            this.movingPlatforms.push(mp);
        });
    }

    // ── Obstacles (saw blades, spikes) ──
    _createObstacles(levelData) {
        if (!levelData.obstacles) return;
        levelData.obstacles.forEach(cfg => {
            const obs = new Obstacle(this, cfg.x, cfg.y, cfg);
            this.obstacles.add(obs);
        });
    }

    // ── Obstacle hit handler ──
    _handleObstacleHit(player, obstacle) {
        if (player.isInvincible || player.isDead) return;
        this._hurtPlayer();
    }

    // ── Exit Gate ──
    _createGate(levelData) {
        const gx = levelData.gateX || levelData.width - 80;
        const gy = GROUND_Y - 32;  // sits on top of ground

        // Gate sprite (starts closed/locked)
        this.gate = this.physics.add.sprite(gx, gy, 'gate-closed');
        this.gate.setOrigin(0.5, 1);  // bottom of sprite at gy
        this.gate.body.setAllowGravity(false);
        this.gate.body.setImmovable(true);

        // "EXIT" label below gate
        this.gateLabel = this.add.text(gx, gy + 4, 'EXIT', {
            fontSize: '10px', fontFamily: 'monospace', color: '#666666',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0).setAlpha(0.6);

        // "Collect all coins to open gate" hint
        this.gateHint = this.add.text(gx, gy + 16, 'LOCKED', {
            fontSize: '8px', fontFamily: 'monospace', color: '#FF4444',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
    }

    // ── Gate reached ──
    _handleGateReached(player, gate) {
        if (!this._gateActive || this._levelCompleteTriggered) return;
        this._levelComplete();
    }

    // ── Activate gate (called when all coins collected) ──
    _activateGate() {
        this._gateActive = true;

        // Change texture to open/glowing
        this.gate.setTexture('gate-open');

        // Update labels
        this.gateLabel.setColor('#FFD700').setAlpha(1);
        this.gateHint.setText('OPEN').setColor('#44FF88');

        // Visual effects
        this.cameras.main.flash(400, 255, 215, 0, true);  // gold flash

        // Gate entrance glow
        this.tweens.add({
            targets: this.gate,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 400,
            yoyo: true,
            repeat: 2,
            ease: 'Sine.easeInOut'
        });

        // Show floating hint
        this._showFloatingText(this.gate.x, this.gate.y - 40, 'GATE OPEN!', '#44FF88');
    }

    // ── Enemy collision handler (with stomp logic) ──
    _handleEnemyCollision(player, enemy) {
        if (enemy.isDead) return;

        // STOMP LOGIC:
        // 1. Player is falling (velocity Y > 0)
        // 2. Player's bottom (BBoxBottom) is above enemy's center (enemy.y + 20 tolerance)
        // 3. Enemy is not already dead

        const playerBottom = player.body.y + player.body.height;
        const enemyCenter = enemy.y;
        const tolerance = 20;

        const isFalling = player.body.velocity.y > 0;
        const isAbove = playerBottom < enemyCenter + tolerance;

        if (isFalling && isAbove) {
            // STOMP SUCCESSFUL!
            enemy.stomp();
            player.bounce();
            this.score += STOMP_SCORE;

            // Update HUD
            this.events.emit('updateScore', this.score);

            // Play sound
            try { this.sound.play('sfx-stomp'); } catch(e) {}

            // ── Visual polish: stomp effects ──
            this.cameras.main.shake(100, 0.008);
            this._emitParticles(enemy.x, enemy.y, 0xFFD700, 12);
            this._showFloatingText(enemy.x, enemy.y - 20, '+20', '#FFD700');
        } else if (!player.isInvincible) {
            // Player hit by enemy from side/below
            this._hurtPlayer();
        }
    }

    // ── Coin collection ──
    _handleCoinCollect(player, coin) {
        coin.collect();
        this.score += COIN_SCORE;

        // Update HUD: score
        this.events.emit('updateScore', this.score);

        // Update HUD: coin counter
        const collected = this.totalCoins - this.coins.countActive();
        this.events.emit('updateCoins', { collected, total: this.totalCoins });

        // ── Visual polish: coin collect effects ──
        this._showFloatingText(coin.x, coin.y, '+10', '#00FF88');
        this._emitParticles(coin.x, coin.y, 0x00FF88, 6);

        // Check win condition: all coins collected → activate gate
        if (this.coins.countActive() === 0) {
            this._activateGate();
        }
    }

    // ── Hurt player ──
    _hurtPlayer() {
        if (this.player.isInvincible || this.player.isDead) return;

        this.lives--;
        this.player.makeInvincible();

        // Update HUD
        this.events.emit('updateLives', this.lives);

        // Play sound
        try { this.sound.play('sfx-hurt'); } catch(e) {}

        // ── Visual polish: hurt effects ──
        this.cameras.main.shake(150, 0.012);
        this.cameras.main.flash(200, 255, 0, 0, true);
        this._emitParticles(this.player.x, this.player.y, 0xFF4444, 10);

        // Check game over
        if (this.lives <= 0) {
            this._gameOver();
        }
    }

    // ── Fall into void ──
    _checkFallDeath() {
        if (this.player.y > GAME_HEIGHT + 50) {
            if (this.player.isDead) return;
            this._hurtPlayer();
            // If still alive, respawn at start
            if (this.lives > 0) {
                const start = levels[this.currentLevel].playerStart;
                this.player.setPosition(start.x, start.y);
                this.player.body.setVelocity(0, 0);
                this.player.body.moves = true;
                this.player.body.allowGravity = true;
                this.player.isDead = false;
            }
        }
    }

    // ── Game over ──
    _gameOver() {
        if (this._gameOverTriggered) return;
        this._gameOverTriggered = true;

        this.player.freeze();
        this.player.setTexture('player-hurt');

        // ── Visual polish: dramatic death ──
        this.cameras.main.flash(300, 255, 0, 0);
        this.cameras.main.shake(400, 0.02);
        this._emitParticles(this.player.x, this.player.y, 0xFF4444, 20);
        // Brief slow-mo for dramatic effect
        this.time.timeScale = 0.3;
        this.time.delayedCall(400, () => { this.time.timeScale = 1; });

        this.time.delayedCall(1500, () => {
            this.scene.stop('HUDScene');
            this.scene.start('GameOverScene', {
                score: this.score,
                level: this.currentLevel
            });
        });
    }

    // ── Level complete ──
    _levelComplete() {
        if (this._levelCompleteTriggered) return;
        this._levelCompleteTriggered = true;

        this.player.freeze();

        // Play win sound
        try { this.sound.play('sfx-win'); } catch(e) {}

        this.time.delayedCall(1000, () => {
            this.scene.stop('HUDScene');

            // Check if there are more levels
            const nextLevel = this.currentLevel + 1;
            if (nextLevel < levels.length) {
                // Go to level complete screen
                this.scene.start('LevelCompleteScene', {
                    score: this.score,
                    level: this.currentLevel,
                    nextLevel: nextLevel,
                    lives: this.lives
                });
            } else {
                // All levels complete - WIN!
                this.scene.start('WinScene', {
                    score: this.score,
                    level: this.currentLevel
                });
            }
        });
    }

    // ── Main update loop ──
    update(time, delta) {
        if (this.player.isDead) return;
        if (this._isPaused) return;

        // ── Track ground state for coyote time ──
        const onGround = this.player.body.blocked.down;
        if (onGround) {
            this._lastGroundedTime = time;
            this._isJumping = false;
        }

        // ── Gather input from all sources ──
        const leftInput = this.cursors.left.isDown || this.keyA.isDown || this.touchControls.getLeft();
        const rightInput = this.cursors.right.isDown || this.keyD.isDown || this.touchControls.getRight();
        const jumpJustDown = Phaser.Input.Keyboard.JustDown(this.cursors.up)
            || Phaser.Input.Keyboard.JustDown(this.keyW)
            || Phaser.Input.Keyboard.JustDown(this.keySpace)
            || this.touchControls.consumeJump();

        // ── Jump buffering: remember jump input for a short window ──
        if (jumpJustDown) {
            this._jumpBufferTime = time;
        }
        const hasBufferedJump = (time - this._jumpBufferTime) < this._jumpBufferMs;

        // ── Coyote time: allow jumping shortly after leaving a platform ──
        const hasCoyoteTime = (time - this._lastGroundedTime) < this._coyoteTimeMs;

        // ── Execute jump ──
        const canJump = (onGround || hasCoyoteTime) && hasBufferedJump;
        if (canJump) {
            this.player.body.setVelocityY(PLAYER_JUMP);
            this._jumpBufferTime = 0; // Consume buffer
            this._lastGroundedTime = 0; // Prevent re-trigger
            this._isJumping = true;
            try { this.sound.play('sfx-jump'); } catch(e) {}
        }

        // ── Variable jump height: release early = shorter jump ──
        const jumpStillHeld = this.cursors.up.isDown || this.keyW.isDown || this.keySpace.isDown
            || this.touchControls.getJump();
        if (this._isJumping && !jumpStillHeld && this.player.body.velocity.y < -200) {
            // Gently reduce upward velocity for a slightly shorter jump
            this.player.body.setVelocityY(this.player.body.velocity.y * 0.7);
            this._isJumping = false;
        }

        // ── Horizontal movement ──
        if (leftInput) {
            this.player.body.setVelocityX(-PLAYER_SPEED);
            this.player.setFlipX(true);
        } else if (rightInput) {
            this.player.body.setVelocityX(PLAYER_SPEED);
            this.player.setFlipX(false);
        }
        // Drag handles deceleration when no input

        // ── Update player animation ──
        this.player.updateAnimation();

        // ── Visual polish: player trail ──
        if (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0) {
            if (Math.random() < 0.35) {
                const trail = this.add.rectangle(
                    this.player.x + Phaser.Math.Between(-8, 8),
                    this.player.y + Phaser.Math.Between(-4, 4),
                    3, 3, 0x88CCFF
                ).setAlpha(0.6).setDepth(-1);
                this.tweens.add({
                    targets: trail,
                    alpha: 0,
                    scale: 0,
                    duration: 300,
                    onComplete: () => trail.destroy()
                });
            }
        }

        // ── Update enemies ──
        this.enemies.children.iterate(enemy => {
            if (enemy && enemy.active) {
                enemy.update(time, delta);
            }
        });

        // ── Update moving platforms ──
        this.movingPlatforms.forEach(mp => {
            if (mp && mp.active) mp.update();
        });

        // ── Update obstacles ──
        this.obstacles.children.iterate(obs => {
            if (obs && obs.active) obs.update();
        });

        // ── Check fall death ──
        this._checkFallDeath();
    }
}
