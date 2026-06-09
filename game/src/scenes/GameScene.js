// GameScene - main gameplay scene, handles all level logic
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.currentLevel = data.level || 0;
        this.score = data.score || 0;
        this.lives = data.lives !== undefined ? data.lives : INITIAL_LIVES;
        this.saveSlot = data.saveSlot !== undefined ? data.saveSlot : null;
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

        // Play background music
        try {
            if (!this.sound.get('bgm-main') || !this.sound.get('bgm-main').isPlaying) {
                this.bgm = this.sound.add('bgm-main', { loop: true, volume: 0.4 });
                this.bgm.play();
            }
        } catch(e) { console.warn('Could not play BGM:', e); }

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

        // Player-gate overlap — reach gate to clear level
        this.physics.add.overlap(this.player, this.gate, this._handleGateReached, null, this);

        // Gate always open — star rating rewards players who collect all coins

        // Track level start time (for star rating)
        this._levelStartTime = this.time.now;

        // Pause time tracking
        this._totalPausedTime = 0;
        this._pauseStartTime = null;
        this._lastTimerEmit = 0;

        // Setup keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyW = this.input.keyboard.addKey('W');
        this.keyA = this.input.keyboard.addKey('A');
        this.keyD = this.input.keyboard.addKey('D');
        this.keySpace = this.input.keyboard.addKey('SPACE');

        // Setup touch controls
        this.touchControls = new TouchControls(this);

        // Launch HUD scene (ensure it's stopped first for clean re-launch)
        this.scene.stop('HUDScene');
        this.scene.launch('HUDScene', {
            score: this.score,
            lives: this.lives,
            levelName: levelData.name,
            totalCoins: this.totalCoins,
            districtIdx: levelData.districtIdx
        });
        // Send initial coin count (delayed to ensure HUDScene is listening)
        this.time.delayedCall(50, () => {
            this.events.emit('updateCoins', {
                collected: 0,
                total: this.totalCoins
            });
        });

        // State flags
        this._gameOverTriggered = false;
        this._levelCompleteTriggered = false;
        this._gateActive = true;   // Gate always open — star rating rewards full coin collection
        this._isPaused = false;

        // ── Player trail particle emitter ──
        this._trailEmitter = this.add.particles(0, 0, 'particle', {
            alpha: { start: 0.6, end: 0 },
            scale: { start: 0.8, end: 0 },
            tint: 0x88CCFF,
            lifespan: 300,
            frequency: -1,
            quantity: 1,
            emitting: false
        });
        this._trailEmitter.setDepth(1);

        // Platformer feel improvements
        this._lastGroundedTime = 0;
        this._jumpBufferTime = 0;
        this._coyoteTimeMs = 100;   // ms after leaving ground where jump still works
        this._jumpBufferMs = 180;   // ms to buffer a jump input before landing
        this._isJumping = false;
        this._jumpCount = 0;           // Double jump counter

        // ── Combo tracker ──
        this._comboCount = 0;
        this._lastStompTime = 0;

        // ── Visual polish: player entrance animation ──
        this._doEntranceAnimation();

        // ── Level intro banner ──
        this._showLevelIntro();

        // ── Pause system ──
        this._setupPause();

        // ── Autosave — save progress on level start ──
        SaveManager.autosave(this.saveSlot, this.currentLevel, this.score, this.lives);

        console.log('[GAME] create() completed for level', this.currentLevel, '- Gate at:', this.gate ? this.gate.x + ',' + this.gate.y : 'NO GATE');
    }

    // ── Level intro banner ──
    _showLevelIntro() {
        const levelInfo = levels[this.currentLevel];
        const district = levelInfo.district || '';
        const subName = levelInfo.subName || '';
        const districtLevel = levelInfo.districtLevel || (this.currentLevel + 1);
        const levelNum = this.currentLevel + 1;

        // Dark overlay
        const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6)
            .setScrollFactor(0).setDepth(800);

        // District name
        const districtText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 55, district, {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(810).setAlpha(0);

        // Big level number
        const numText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, district + ' — LEVEL ' + districtLevel, {
            fontFamily: 'monospace',
            fontSize: '32px',
            color: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(810).setScale(0).setAlpha(0);

        // Level name subtitle
        const nameText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 35, subName, {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(810).setAlpha(0);

        // Decorative separator line
        const sep = this.add.graphics().setScrollFactor(0).setDepth(810);
        sep.lineStyle(2, 0xFFD700, 0.5);
        sep.lineBetween(GAME_WIDTH / 2 - 120, GAME_HEIGHT / 2 + 55, GAME_WIDTH / 2 + 120, GAME_HEIGHT / 2 + 55);

        // Animate in
        this.tweens.add({
            targets: districtText,
            alpha: 1,
            y: GAME_HEIGHT / 2 - 60,
            duration: 400,
            ease: 'Quad.easeOut'
        });

        this.tweens.add({
            targets: numText,
            scale: 1,
            alpha: 1,
            duration: 500,
            ease: 'Back.easeOut'
        });

        this.tweens.add({
            targets: nameText,
            alpha: 1,
            y: GAME_HEIGHT / 2 + 26,
            duration: 600,
            delay: 300,
            ease: 'Quad.easeOut'
        });

        // Hold then fade out
        this.time.delayedCall(SPECTACLE.INTRO_BANNER_DURATION, () => {
            this.tweens.add({
                targets: [districtText, numText, nameText, overlay, sep],
                alpha: 0,
                scale: 0,
                duration: 400,
                ease: 'Quad.easeOut',
                onComplete: () => {
                    districtText.destroy();
                    numText.destroy();
                    nameText.destroy();
                    overlay.destroy();
                    sep.destroy();
                }
            });
        });
    }

    // ── Pause System ──
    _setupPause() {
        // Pause button (top-right corner)
        this.pauseBtn = this.add.image(GAME_WIDTH - 24, 24, 'btn-pause')
            .setInteractive({ useHandCursor: true })
            .setScrollFactor(0)
            .setDepth(900);

        this.pauseBtn.on('pointerdown', () => this._togglePause());

        // Subtle idle pulse on pause button
        this.tweens.add({
            targets: this.pauseBtn,
            scaleX: 1.08,
            scaleY: 1.08,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Escape key to pause
        this.input.keyboard.on('keydown-ESC', () => this._togglePause());
    }

    _togglePause() {
        if (this._gameOverTriggered || this._levelCompleteTriggered) return;

        this._isPaused = !this._isPaused;

        if (this._isPaused) {
            this._pauseStartTime = this.time.now;
            this._showPauseMenu();
            this.physics.world.pause();
            // Pause BGM
            try { if (this.bgm) this.bgm.pause(); } catch(e) {}
            // Delay tweens pause to allow pause menu pop-in animation to play
            this.time.delayedCall(400, () => {
                this.tweens.pauseAll();
            });
            this.scene.pause('HUDScene');
            this.pauseBtn.setVisible(false);
        } else {
            if (this._pauseStartTime !== null) {
                this._totalPausedTime += this.time.now - this._pauseStartTime;
                this._pauseStartTime = null;
            }
            this.physics.world.resume();
            this.tweens.resumeAll();
            // Resume BGM
            try { if (this.bgm) this.bgm.resume(); } catch(e) {}
            this.scene.resume('HUDScene');
            this.pauseBtn.setVisible(true);
            this._hidePauseMenu();
        }
    }

    _showPauseMenu() {
        const cx = GAME_WIDTH / 2;
        const cy = GAME_HEIGHT / 2;
        const B = 900; // base depth — buttons go above this

        // Dim overlay (NOT interactive — won't block buttons below)
        this.pauseOverlay = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
            .setScrollFactor(0).setDepth(B).setAlpha(0);

        // Decorative border frame
        const frame = this.add.graphics().setScrollFactor(0).setDepth(B + 11).setAlpha(0);
        frame.lineStyle(2, 0xFFD700, 0.3);
        frame.strokeRoundedRect(cx - 140, cy - 140, 280, 280, 10);
        frame.lineStyle(1, 0xFFD700, 0.15);
        frame.strokeRoundedRect(cx - 134, cy - 134, 268, 268, 8);

        // Corner decorations (small gears)
        drawMiniGear(frame, cx - 130, cy - 130, 8, 6, 0xFFD700, 0.4);
        drawMiniGear(frame, cx + 130, cy - 130, 8, 6, 0xFFD700, 0.4);
        drawMiniGear(frame, cx - 130, cy + 130, 8, 6, 0xFFD700, 0.4);
        drawMiniGear(frame, cx + 130, cy + 130, 8, 6, 0xFFD700, 0.4);

        // Panel background
        const panel = this.add.rectangle(cx, cy, 260, 250, 0x1a1a2e, 0.95)
            .setScrollFactor(0).setStrokeStyle(2, 0xFFD700).setDepth(B + 10).setAlpha(0);

        // Title
        const title = this.add.text(cx, cy - 95, '— PAUSED —', {
            fontSize: '26px', fontFamily: 'monospace', color: '#FFD700', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(B + 20).setAlpha(0);

        // Level info at bottom of panel
        const lvl = levels[this.currentLevel];
        const levelNum = this.currentLevel + 1;
        const levelInfoStr = lvl ? (lvl.district + ' • Lv.' + lvl.districtLevel + ' — ' + lvl.subName) : ('LEVEL ' + levelNum);
        const levelInfo = this.add.text(cx, cy + 100, levelInfoStr, {
            fontSize: '10px', fontFamily: 'monospace', color: '#888888',
            stroke: '#000000', strokeThickness: 1
        }).setOrigin(0.5).setScrollFactor(0).setDepth(B + 20).setAlpha(0);

        // Separator line
        const sep = this.add.graphics().setScrollFactor(0).setDepth(B + 20).setAlpha(0);
        sep.lineStyle(1, 0xFFD700, 0.2);
        sep.lineBetween(cx - 80, cy - 60, cx + 80, cy - 60);

        // Resume button
        const resumeBtn = this._makePauseButton(cx, cy - 25, '▶  RESUME', () => this._togglePause());
        resumeBtn.bg.setDepth(B + 30);
        resumeBtn.label.setDepth(B + 31);

        // Restart button
        const restartBtn = this._makePauseButton(cx, cy + 35, '↻  RESTART', () => {
            this._hidePauseMenu();
            if (this._pauseStartTime !== null) {
                this._totalPausedTime += this.time.now - this._pauseStartTime;
                this._pauseStartTime = null;
            }
            this._isPaused = false;
            this.physics.world.resume();
            this.tweens.resumeAll();
            this.scene.stop('HUDScene');
            this.time.delayedCall(0, () => {
                this.scene.restart({ level: this.currentLevel, score: this.score, lives: this.lives });
            });
        });
        restartBtn.bg.setDepth(B + 30);
        restartBtn.label.setDepth(B + 31);

        // Main Menu button
        const menuBtn = this._makePauseButton(cx, cy + 95, '☰  MAIN MENU', () => {
            this._hidePauseMenu();
            if (this._pauseStartTime !== null) {
                this._totalPausedTime += this.time.now - this._pauseStartTime;
                this._pauseStartTime = null;
            }
            this._isPaused = false;
            this.physics.world.resume();
            this.tweens.resumeAll();
            this.scene.stop('HUDScene');
            this.time.delayedCall(0, () => {
                this.scene.start('MainMenuScene');
            });
        });
        menuBtn.bg.setDepth(B + 30);
        menuBtn.label.setDepth(B + 31);

        // Pop-in animation
        this.tweens.add({ targets: this.pauseOverlay, alpha: 1, duration: 150 });
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 200, ease: 'Back.easeOut' });
        this.tweens.add({ targets: title, alpha: 1, y: title.y + 5, duration: 250, delay: 100 });
        this.tweens.add({ targets: sep, alpha: 1, duration: 200, delay: 150 });
        this.tweens.add({ targets: levelInfo, alpha: 1, duration: 300, delay: 250 });
        this.tweens.add({ targets: frame, alpha: 1, duration: 200, delay: 50 });

        // Keep references for cleanup
        this._pauseElements = [this.pauseOverlay, frame, panel, title, sep, levelInfo,
            resumeBtn.bg, resumeBtn.label,
            restartBtn.bg, restartBtn.label,
            menuBtn.bg, menuBtn.label];
    }

    _hidePauseMenu() {
        if (this._pauseElements) {
            this._pauseElements.forEach(el => { if (el) el.destroy(); });
            this._pauseElements = null;
        }
    }

    _makePauseButton(x, y, text, callback) {
        const bg = this.add.rectangle(x, y, 220, 46, 0x444466, 0.9)
            .setScrollFactor(0)
            .setStrokeStyle(2, 0x8888AA)
            .setInteractive({ useHandCursor: true });
        const label = this.add.text(x, y, text, {
            fontSize: '16px', fontFamily: 'monospace', color: '#FFFFFF', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0);

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
            callback();
            this.tweens.add({ targets: [bg, label], scaleX: 0.95, scaleY: 0.95, duration: 40 });
        });
        return { bg, label };
    }

    // ── Visual polish: entrance animation ──
    _doEntranceAnimation() {
        // Flash effect
        this.cameras.main.flash(300, 255, 255, 255);

        // Player slam-in from above
        const startY = this.player.y;
        this.player.y = Math.max(-50, levels[this.currentLevel].playerStart.y - 200);
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

    // ── Safe sound play (wraps try/catch) ──
    _playSound(key) {
        try { this.sound.play(key); } catch (e) { console.warn('Sound play failed:', key, e); }
    }

    // ── Background ──
    _createBackground(levelData) {
        // Use a fixed full-viewport image as background (no parallax) to avoid
        // visible seams from non-tiling procedural textures.
        const bgKey = levelData.background || 'bg-level1';
        const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, bgKey)
            .setScrollFactor(0)
            .setDepth(-10);

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
            let enemy;
            if (e.type === 'walker' || !e.type) {
                enemy = new Walker(this, e.x, e.y, e.patrolLeft, e.patrolRight);
            } else if (e.type === 'drone') {
                enemy = new PatrolDrone(this, e.x, e.y, e.patrolLeft, e.patrolRight);
            }
            if (enemy) this.enemies.add(enemy);
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

    // ── Obstacles (saw blades, spikes, traps) ──
    _createObstacles(levelData) {
        if (!levelData.obstacles) return;
        levelData.obstacles.forEach(cfg => {
            let obs;
            const type = cfg.type || 'saw';
            switch (type) {
                case 'buried-saw':
                    obs = new BuriedSaw(this, cfg.x, cfg.y, cfg);
                    break;
                case 'surprise-saw':
                    obs = new SurpriseSaw(this, cfg.x, cfg.y, cfg);
                    break;
                case 'spike-trap':
                    obs = new SpikeTrap(this, cfg.x, cfg.y, cfg);
                    break;
                default:
                    console.warn('Unknown obstacle type: ' + type);
                    return;
            }
            if (obs) this.obstacles.add(obs);
        });
    }

    // ── Obstacle hit handler ──
    _handleObstacleHit(player, obstacle) {
        if (player.isInvincible || player.isDead) return;
        // Spike trap: only damage when extended
        if (typeof obstacle.isExtended === 'function' && !obstacle.isExtended()) return;
        this._hurtPlayer();
    }

    // ── Drone laser damage check ──
    _checkDroneLasers() {
        if (this.player.isInvincible || this.player.isDead) return;
        this.enemies.children.iterate(enemy => {
            if (enemy && enemy.active && !enemy.isDead && typeof enemy._checkLaserHit === 'function') {
                if (enemy._checkLaserHit(this.player)) {
                    this._hurtPlayer();
                }
            }
        });
    }

    // ── Exit Gate ──
    _createGate(levelData) {
        const gx = levelData.gateX || levelData.width - 80;
        const gy = GROUND_Y;  // bottom of gate at ground level

        // Gate sprite (always open — star rating rewards full coin collection)
        this.gate = this.physics.add.sprite(gx, gy, 'gate-open');
        this.gate.setOrigin(0.5, 1);  // bottom of sprite at ground level
        this.gate.refreshBody();      // sync physics body to new origin
        this.gate.body.setAllowGravity(false);
        this.gate.body.setImmovable(true);

        // Glow pulse animation
        this.tweens.add({
            targets: this.gate,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // "EXIT" label above the gate arch (bottom-anchored so text grows up)
        this.gateLabel = this.add.text(gx, gy - 64 - 2, 'EXIT →', {
            fontSize: '10px', fontFamily: 'monospace', color: '#FFD700',
            fontStyle: 'bold'
        }).setOrigin(0.5, 1).setAlpha(1);
        // Bottom at y=352, text extends upward ~340–352. Gate top=354. 2px gap.

        // "OPEN" hint above EXIT
        this.gateHint = this.add.text(gx, gy - 64 - 2 - 10 - 4, 'OPEN', {
            fontSize: '8px', fontFamily: 'monospace', color: '#44FF88',
            fontStyle: 'bold'
        }).setOrigin(0.5, 1);
        // Bottom at y=338, text extends upward ~330–338. EXIT top≈340. 2px gap.
    }

    // ── Gate reached ──
    _handleGateReached(player, gate) {
        if (this._levelCompleteTriggered) return;
        this._levelComplete();
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

        const isFalling = player.body.velocity.y >= -10;
        const isAbove = playerBottom < enemyCenter + tolerance;

        if (isFalling && isAbove) {
            // STOMP SUCCESSFUL!
            enemy.stomp();
            player.bounce();
            this.score += STOMP_SCORE;

            // Update HUD
            this.events.emit('updateScore', this.score);

            // Play sound
            this._playSound('sfx-stomp');

            // ── Stomp combo ──
            const now = this.time.now;
            if (now - this._lastStompTime < SPECTACLE.COMBO_MAX_BREAK_TIME) {
                this._comboCount++;
            } else {
                this._comboCount = 1;
            }
            this._lastStompTime = now;

            if (this._comboCount >= 2) {
                // Show combo text
                const comboLabel = this.add.text(enemy.x, enemy.y - 50, this._comboCount + 'x COMBO!', {
                    fontFamily: 'monospace',
                    fontSize: '22px',
                    color: '#FF6600',
                    fontStyle: 'bold',
                    stroke: '#000000',
                    strokeThickness: 4
                }).setOrigin(0.5);

                this.tweens.add({
                    targets: comboLabel,
                    y: comboLabel.y - 40,
                    scale: 1.3,
                    alpha: 0,
                    duration: 900,
                    ease: 'Quad.easeOut',
                    onComplete: () => comboLabel.destroy()
                });

                // Bigger screen shake for combos
                this.cameras.main.shake(150, 0.015);
            }

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
    }

    // ── Hurt player ──
    _hurtPlayer() {
        if (this.player.isInvincible || this.player.isDead) return;

        this.lives--;
        this.player.makeInvincible();

        // Update HUD
        this.events.emit('updateLives', this.lives);

        // Play sound
        this._playSound('sfx-hurt');

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
            if (this.player.isDead || this.player.isInvincible) return;
            this._hurtPlayer();
            // If game over was triggered, do nothing further
            if (this._gameOverTriggered) return;
            // If still alive, respawn at start
            if (this.lives > 0) {
                const start = levels[this.currentLevel].playerStart;
                this.player.setPosition(start.x, start.y);
                this.player.body.setVelocity(0, 0);
                this._lastGroundedTime = 0;
                this._jumpBufferTime = 0;
                this._jumpCount = 0;
                this._isJumping = false;
            }
        }
    }

    // ── Game over ──
    _gameOver() {
        if (this._gameOverTriggered) return;
        this._gameOverTriggered = true;
        console.log('[GAME] _gameOver() triggered — transitioning in 600ms');

        this.player.isDead = true;
        this.player.freeze();
        this.player.body.enable = false;
        this.player.setTexture('player-hurt');

        // ── Visual polish: dramatic death ──
        this.cameras.main.flash(250, 255, 0, 0);
        this.cameras.main.shake(300, 0.015);
        this._emitParticles(this.player.x, this.player.y, 0xFF4444, 16);

        // Collect stats before transition
        const coinsCollected = this.totalCoins - (this.coins?.countActive() ?? 0);
        const elapsed = this._currentElapsed || 0;

        // Fade-to-black overlay, then transition to GameOverScene
        // Uses tween onComplete (immune to timeScale issues)
        const overlay = this.add.rectangle(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            GAME_WIDTH, GAME_HEIGHT, 0x000000, 0
        ).setScrollFactor(0).setDepth(9999);

        this.tweens.add({
            targets: overlay,
            alpha: 1,
            duration: 500,
            ease: 'Quad.easeIn',
            onComplete: () => {
                try { if (this.bgm) this.bgm.stop(); } catch(e) {}
                overlay.destroy();
                this.scene.stop('HUDScene');
                console.log('[GAME] Starting GameOverScene — score:', this.score, 'level:', this.currentLevel, 'coins:', coinsCollected, 'elapsed:', elapsed);
                this.scene.start('GameOverScene', {
                    score: this.score,
                    level: this.currentLevel,
                    saveSlot: this.saveSlot,
                    coinsCollected: coinsCollected,
                    totalCoins: this.totalCoins,
                    timeSeconds: Math.floor(elapsed)
                });
            }
        });
    }

    // ── Level complete ──
    _levelComplete() {
        if (this._levelCompleteTriggered) return;
        this._levelCompleteTriggered = true;

        console.log('[GAME] _levelComplete() - level:', this.currentLevel, 'nextLevel:', this.currentLevel + 1, 'score:', this.score, 'lives:', this.lives);

        this.player.freeze();

        // Play win sound
        this._playSound('sfx-win');

        // Autosave — unlock next level
        const nextLevel = this.currentLevel + 1;
        SaveManager.autosave(this.saveSlot, nextLevel, this.score, this.lives);

        this.time.delayedCall(1000, () => {
            console.log('[GAME] delayedCall FIRED - about to start LevelCompleteScene');
            this.scene.stop('HUDScene');

            // Calculate star rating
        const coinsCollected = this.totalCoins - (this.coins?.countActive() ?? 0);
            // Subtract total paused time from elapsed
            const pausedTotal = this._totalPausedTime + (this._pauseStartTime ? this.time.now - this._pauseStartTime : 0);
            const elapsed = (this.time.now - this._levelStartTime - pausedTotal) / 1000;
            const starResult = this._calculateStars(coinsCollected, elapsed);

            // Check if there are more levels
            if (nextLevel < levels.length) {
                // Go to level complete screen
                console.log('[GAME] Starting LevelCompleteScene with data:', JSON.stringify({ level: this.currentLevel, nextLevel, score: this.score, lives: this.lives }));
                this.scene.start('LevelCompleteScene', {
                    score: this.score,
                    level: this.currentLevel,
                    nextLevel: nextLevel,
                    lives: this.lives,
                    saveSlot: this.saveSlot,
                    stars: starResult
                });
            } else {
                // All levels complete - WIN!
                this.scene.start('WinScene', {
                    score: this.score,
                    level: this.currentLevel,
                    saveSlot: this.saveSlot
                });
            }
        });
    }

    // ── Star rating calculation (lives, coins, time) ──
    _calculateStars(coinsCollected, timeSeconds) {
        const levelData = levels[this.currentLevel];
        const totalCoins = levelData.coins.length;

        // Determine district for time thresholds (use districtIdx from levelData)
        const district = levelData.districtIdx !== undefined ? levelData.districtIdx : 0;

        // 1) Lives (0–1 point): 3 lives → 1.0, 2 → 0.6, 1 → 0.2
        const livesPoints = this.lives === 3 ? 1.0 : this.lives === 2 ? 0.6 : 0.2;

        // 2) Coins (0–1 point): ratio directly
        const coinPct = totalCoins > 0 ? coinsCollected / totalCoins : 1;
        const coinPoints = coinPct >= 1.0 ? 1.0 : coinPct >= 0.5 ? 0.6 : 0.2;

        // 3) Time (0–1 point): thresholds differ by district
        const t = TIME_THRESHOLDS[district];
        let timePoints = timeSeconds <= t.fast ? 1.0
            : timeSeconds <= t.good ? 0.6
            : timeSeconds <= t.ok ? 0.2 : 0;

        const total = livesPoints + coinPoints + timePoints;

        let stars;
        if (total >= 2.4) stars = 3;
        else if (total >= 1.2) stars = 2;
        else stars = 1;

        return {
            stars,
            coinsCollected,
            totalCoins,
            timeSeconds: Math.floor(timeSeconds)
        };
    }

    // ── Main update loop ──
    update(time, delta) {
        if (this.player.isDead) return;
        if (this._isPaused) return;

        // ── Track ground state for coyote time & double jump ──
        const onGround = this.player.body.blocked.down;
        if (onGround) {
            this._lastGroundedTime = time;
            this._isJumping = false;
            this._jumpCount = 0; // Reset double jump
        }

        // ── Gather input from all sources ──
        const leftInput = this.cursors.left.isDown || this.keyA.isDown || this.touchControls.getLeft();
        const rightInput = this.cursors.right.isDown || this.keyD.isDown || this.touchControls.getRight();
        const touchJump = this.touchControls.consumeJump();
        const jumpJustDown = Phaser.Input.Keyboard.JustDown(this.cursors.up)
            || Phaser.Input.Keyboard.JustDown(this.keyW)
            || Phaser.Input.Keyboard.JustDown(this.keySpace)
            || touchJump;

        // ── Jump buffering: remember jump input for a short window ──
        if (jumpJustDown) {
            this._jumpBufferTime = time;
        }
        const hasBufferedJump = (time - this._jumpBufferTime) < this._jumpBufferMs;

        // ── Coyote time: allow jumping shortly after leaving a platform ──
        const hasCoyoteTime = (time - this._lastGroundedTime) < this._coyoteTimeMs;

        // ── Execute jump (first & double) ──
        const canJump = (onGround || hasCoyoteTime) && hasBufferedJump;
        const canDoubleJump = !onGround && !hasCoyoteTime && this._jumpCount < 2 && jumpJustDown;

        if (canJump) {
            this.player.body.setVelocityY(PLAYER_JUMP);
            this._jumpBufferTime = 0; // Consume buffer
            this._lastGroundedTime = 0; // Prevent re-trigger
            this._isJumping = true;
            this._jumpCount = 1;
            this._playSound('sfx-jump');
        } else if (canDoubleJump) {
            this.player.body.setVelocityY(PLAYER_DOUBLE_JUMP);
            this._isJumping = true;
            this._jumpCount = 2;
            this._playSound('sfx-jump');
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

        // ── Visual polish: player trail (particle-based) ──
        if ((this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0) && Math.random() < 0.35) {
            this._trailEmitter.emitParticleAt(this.player.x + Phaser.Math.Between(-8, 8), this.player.y + Phaser.Math.Between(-4, 4));
        }

        // ── Update enemies (pass player for drone laser detection) ──
        this.enemies.children.iterate(enemy => {
            if (enemy && enemy.active) {
                enemy.update(time, delta, this.player);
            }
        });

        // ── Check drone laser damage ──
        this._checkDroneLasers();

        // ── Update moving platforms ──
        this.movingPlatforms.forEach(mp => {
            if (mp && mp.active) mp.update();
        });

        // ── Update obstacles (pass player for proximity-sensing types) ──
        this.obstacles.children.iterate(obs => {
            if (obs && obs.active) obs.update(this.player);
        });

        // ── Emit timer update to HUD (throttled) ──
        const now = this.time.now;
        this._currentElapsed = (now - this._levelStartTime - this._totalPausedTime) / 1000;
        if (!this._lastTimerEmit || now - this._lastTimerEmit >= HUD.TIMER_THROTTLE_MS) {
            this._lastTimerEmit = now;
            this.events.emit('updateTimer', { elapsed: this._currentElapsed });
        }

        // ── Check fall death ──
        this._checkFallDeath();
    }
}
