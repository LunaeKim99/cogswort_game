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
        this.currentSlot = this.saveSlot;
    }

    create() {
        const levelData = levels[this.currentLevel];
        this.levelIndex = this.currentLevel;
        // D2: Apply upgrades
        const saveData = SaveManager.load(this.currentSlot) || {};
        const upgrades = saveData.upgrades || {};
        this._activeDoubleJump = upgrades.gear_boots
            ? PLAYER_DOUBLE_JUMP * 1.15 : PLAYER_DOUBLE_JUMP;
        this._shieldCharges = (saveData.inventory && saveData.inventory.shield) || 0;
        if (upgrades.coat) this._shieldCharges = Math.max(this._shieldCharges, 1);
        this._hasBossIntel = upgrades.boss_intel || false;
        this._hasWrenchStrike = upgrades.wrench || false;
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
        this.keyShield = this.input.keyboard.addKey(SHIELD_KEY);

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

        // ── Merchant ──
        this._merchantSprite = null;
        this._merchantPrompt = null;
        this._merchantX = 0;
        this._merchantNearby = false;
        this._shopOpen = false;
        this._shopElements = null;
        if (MERCHANT_LEVEL_INDICES.includes(this.levelIndex)) {
            this._spawnMerchant();
        }

        // ── Shutdown cleanup for merchant ──
        this.events.on('shutdown', () => {
            if (this._merchantSprite) { this._merchantSprite.destroy(); this._merchantSprite = null; }
            if (this._merchantLabel) { this._merchantLabel.destroy(); this._merchantLabel = null; }
            if (this._merchantPrompt) { this._merchantPrompt.destroy(); this._merchantPrompt = null; }
            this._closeShop();
        });

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

        // Main Menu button (with confirm)
        const menuBtn = this._makePauseButton(cx, cy + 95, '☰  MAIN MENU', () => {
            if (menuBtn._confirming) return;
            menuBtn._confirming = true;
            menuBtn.label.setText('EXIT AND LOSE PROGRESS?');
            menuBtn.label.setColor('#FF6666');
            menuBtn.bg.setFillStyle(0x662222);

            const doExit = () => {
                this._hidePauseMenu();
                if (this._pauseStartTime !== null) {
                    this._totalPausedTime += this.time.now - this._pauseStartTime;
                    this._pauseStartTime = null;
                }
                this._isPaused = false;
                // Skip resume — scene is transitioning away, no need to tick physics
                this.scene.stop('HUDScene');
                this.time.delayedCall(0, () => { this.scene.start('MainMenuScene'); });
            };

            const yesBtn = this._makePauseButton(cx - 68, cy + 140, '✓ YES', doExit);
            yesBtn.bg.setDepth(B + 40); yesBtn.label.setDepth(B + 41);
            yesBtn.bg.setFillStyle(0x226622); yesBtn.bg.setStrokeStyle(2, 0x44AA44);
            yesBtn.bg.width = 110; yesBtn.bg.height = 40;

            const noBtn = this._makePauseButton(cx + 68, cy + 140, '✗ NO', () => {
                menuBtn._confirming = false;
                menuBtn.label.setText('☰  MAIN MENU');
                menuBtn.label.setColor('#FFFFFF');
                menuBtn.bg.setFillStyle(0x444466);
                // Remove from cleanup list before destroying (prevents double-destroy)
                this._pauseElements = this._pauseElements.filter(
                    el => el !== yesBtn.bg && el !== yesBtn.label && el !== noBtn.bg && el !== noBtn.label
                );
                yesBtn.bg.destroy(); yesBtn.label.destroy();
                noBtn.bg.destroy(); noBtn.label.destroy();
            });
            noBtn.bg.setDepth(B + 40); noBtn.label.setDepth(B + 41);
            noBtn.bg.setFillStyle(0x662222); noBtn.bg.setStrokeStyle(2, 0xAA4444);
            noBtn.bg.width = 110; noBtn.bg.height = 40;

            this._pauseElements.push(yesBtn.bg, yesBtn.label, noBtn.bg, noBtn.label);
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
        const levelData = levels[this.levelIndex];
        if (BOSS_LEVEL_INDICES.includes(this.levelIndex)) {
            this._levelCompleteTriggered = true;
            this.player.freeze();
            this._playSound('sfx-win');
            const overlay = this.add.rectangle(
                GAME_WIDTH / 2, GAME_HEIGHT / 2,
                GAME_WIDTH, GAME_HEIGHT, 0x000000, 0
            ).setScrollFactor(0).setDepth(9999);
            this.tweens.add({
                targets: overlay,
                alpha: 1,
                duration: 800,
                ease: 'Quad.easeIn',
                onComplete: () => {
                    this.scene.stop('HUDScene');
                    this.scene.start('BossScene', {
                        slotIndex: this.currentSlot,
                        districtIndex: levelData.districtIdx,
                        levelIndex: this.levelIndex,
                        score: this.score,
                        lives: this.lives,
                    });
                }
            });
        } else {
            this._levelComplete();
        }
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
        const tolerance = this._hasWrenchStrike ? 26 : 20;

        const isFalling = player.body.velocity.y >= -10;
        const isAbove = playerBottom < enemyCenter + tolerance;

        if (isFalling && isAbove) {
            // STOMP SUCCESSFUL!
            enemy.stomp();
            player.bounce();
            this.score += STOMP_SCORE;

            // Wrench strike: boost stomp radius effects
            if (this._hasWrenchStrike) {
                this.cameras.main.shake(150, 0.015);
            }

            // Gear drop chance
            if (Math.random() < GEAR_STOMP_DROP_CHANCE && !this._levelCompleteTriggered) {
                this._spawnGearDrop(enemy.x, enemy.y);
            }

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

        this.player.freeze();
        this._playSound('sfx-win');

        const nextLevel = this.currentLevel + 1;

        // Gear and coin rewards
        const coinsCollected = this.totalCoins - (this.coins?.countActive() ?? 0);
        const elapsed = (this.time.now - this._levelStartTime - this._totalPausedTime) / 1000;
        const levelData = levels[this.currentLevel];
        const timeRank = elapsed <= TIME_THRESHOLDS[levelData.districtIdx].fast ? 'fast'
            : elapsed <= TIME_THRESHOLDS[levelData.districtIdx].good ? 'good' : 'ok';
        const gearReward = 1 + (timeRank === 'fast' ? 2 : timeRank === 'good' ? 1 : 0);
        SaveManager.addGear(this.currentSlot, gearReward);
        SaveManager.addCoins(this.currentSlot, coinsCollected);
        this._emitCurrencyEvents();

        SaveManager.autosave(this.saveSlot, nextLevel, this.score, this.lives);

        const overlay = this.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2,
            GAME_WIDTH, GAME_HEIGHT, 0x000000, 0
        ).setScrollFactor(0).setDepth(9999);

        this.tweens.add({
            targets: overlay,
            alpha: 1,
            duration: 800,
            delay: 400,
            ease: 'Quad.easeIn',
            onComplete: () => {
                this.scene.stop('HUDScene');
                const coinsCollected = this.totalCoins - (this.coins?.countActive() ?? 0);
                const pausedTotal = this._totalPausedTime +
                    (this._pauseStartTime ? this.time.now - this._pauseStartTime : 0);
                const elapsed = (this.time.now - this._levelStartTime - pausedTotal) / 1000;
                const starResult = this._calculateStars(coinsCollected, elapsed);

                if (nextLevel < levels.length) {
                    this.scene.start('LevelCompleteScene', {
                        score: this.score,
                        level: this.currentLevel,
                        nextLevel,
                        lives: this.lives,
                        saveSlot: this.saveSlot,
                        stars: starResult
                    });
                } else {
                    this.scene.start('WinScene', {
                        score: this.score,
                        level: this.currentLevel,
                        saveSlot: this.saveSlot
                    });
                }
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

        // ── Update merchant interaction ──
        if (this._merchantSprite && this._merchantSprite.active) {
            this._updateMerchant(time, delta);
        }

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
        this._trailTimer = (this._trailTimer || 0) + delta;
        while (this._trailTimer >= 50) {
            this._trailTimer -= 50;
            if (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0) {
                this._trailEmitter.emitParticleAt(
                    this.player.x + Phaser.Math.Between(-8, 8),
                    this.player.y + Phaser.Math.Between(-4, 4)
                );
            }
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

        // ── Shield key (S) ──
        if (Phaser.Input.Keyboard.JustDown(this.keyShield) && this._shieldCharges > 0 && !this.player.isInvincible && !this.player.isDead && !this._merchantNearby) {
            this._useShield();
        }
    }

    // ────────────────────────────────────────────────────────────
    // ── Merchant / Shop Methods ──
    // ────────────────────────────────────────────────────────────

    _spawnMerchant() {
        const levelData = levels[this.levelIndex];
        const gx = levelData.gateX || levelData.width - 160;
        const mx = gx - 180;

        // Place merchant sprite
        this._merchantSprite = this.physics.add.sprite(mx, GROUND_Y - 24, 'merchant-npc');
        this._merchantSprite.body.setAllowGravity(false);
        this._merchantSprite.setImmovable(true);
        this._merchantSprite.setDepth(5);
        this._merchantX = mx;

        // Floating "[ SHOP ]" text
        this._merchantLabel = this.add.text(mx, GROUND_Y - 70, '[ SHOP ]', {
            fontSize: '10px', fontFamily: 'monospace', color: '#FFD700', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5);

        // Blink tween on label
        this.tweens.add({
            targets: this._merchantLabel,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Interaction prompt (hidden by default)
        this._merchantPrompt = this.add.text(mx, GROUND_Y - 90, '[ \u2191 ] INTERACT', {
            fontSize: '9px', fontFamily: 'monospace', color: '#44FF88', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5).setAlpha(0);

        this._merchantNearby = false;
    }

    _updateMerchant() {
        if (!this._merchantSprite || !this._merchantSprite.active) return;
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this._merchantX, GROUND_Y - 24);
        const nearby = dist < MERCHANT_INTERACT_DIST;

        if (nearby && !this._merchantNearby) {
            this._merchantNearby = true;
            this.tweens.add({ targets: this._merchantPrompt, alpha: 1, duration: 150 });
        } else if (!nearby && this._merchantNearby) {
            this._merchantNearby = false;
            this.tweens.add({ targets: this._merchantPrompt, alpha: 0, duration: 150 });
        }

        // UP key / touch jump interaction
        const touchJump = this.touchControls.consumeJump();
        const interactPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up)
            || Phaser.Input.Keyboard.JustDown(this.keyW)
            || touchJump;

        if (interactPressed && this._merchantNearby) {
            // Force consume the jump so it doesn't double-trigger
            if (touchJump) { /* already consumed */ }
            this._jumpBufferTime = 0;
            this._openShop();
        }
    }

    _openShop() {
        if (this._shopOpen) return;
        this._shopOpen = true;

        // Pause game
        this.physics.world.pause();
        this.tweens.pauseAll();

        const cx = GAME_WIDTH / 2;
        const cy = GAME_HEIGHT / 2;
        const B = 500;

        // Dark backdrop
        this._shopBackdrop = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.8)
            .setScrollFactor(0).setDepth(B);
        this._shopBackdrop.setInteractive(); // block clicks through

        // Panel with brass border
        const panel = this.add.graphics().setScrollFactor(0).setDepth(B + 10);
        panel.fillStyle(0x1a1a2e, 1);
        panel.fillRoundedRect(cx - 200, cy - 170, 400, 340, 10);
        panel.lineStyle(3, 0xCC8800, 1);
        panel.strokeRoundedRect(cx - 200, cy - 170, 400, 340, 10);
        panel.lineStyle(1, 0xFFD700, 0.3);
        panel.strokeRoundedRect(cx - 195, cy - 165, 390, 330, 8);

        // Title
        this._shopTitle = this.add.text(cx, cy - 155, 'MERCHANT SHOP', {
            fontSize: '20px', fontFamily: 'monospace', color: '#FFD700', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(B + 20);

        // Currency bar
        const saveData = SaveManager.load(this.currentSlot) || {};
        this._shopCoinText = this.add.text(cx - 180, cy - 125, 'COINS: ' + (saveData.coins || 0), {
            fontSize: '12px', fontFamily: 'monospace', color: '#FFD700'
        }).setScrollFactor(0).setDepth(B + 20);

        this._shopGearText = this.add.text(cx + 180, cy - 125, 'GEAR: ' + (saveData.gear || 0), {
            fontSize: '12px', fontFamily: 'monospace', color: '#FFD700'
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(B + 20);

        // Separator
        const sep = this.add.graphics().setScrollFactor(0).setDepth(B + 20);
        sep.lineStyle(1, 0xFFD700, 0.2);
        sep.lineBetween(cx - 180, cy - 110, cx + 180, cy - 110);

        // Tab labels
        this._activeShopTab = 'coin';
        this._shopCoinTab = this.add.text(cx - 80, cy - 100, '[ COIN ITEMS ]', {
            fontSize: '11px', fontFamily: 'monospace', color: '#FFD700', fontStyle: 'bold',
            backgroundColor: '#333355', padding: { x: 4, y: 2 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(B + 20).setInteractive({ useHandCursor: true });

        this._shopGearTab = this.add.text(cx + 80, cy - 100, '[ GEAR UPGRADES ]', {
            fontSize: '11px', fontFamily: 'monospace', color: '#888888',
            padding: { x: 4, y: 2 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(B + 20).setInteractive({ useHandCursor: true });

        // Tab switching
        this._shopCoinTab.on('pointerdown', () => this._refreshShop('coin'));
        this._shopGearTab.on('pointerdown', () => this._refreshShop('gear'));

        // Item rows container
        this._shopItemsContainer = this.add.container(0, 0).setDepth(B + 30);

        // Close button
        this._shopCloseBtn = this.add.text(cx + 185, cy - 160, 'X', {
            fontSize: '18px', fontFamily: 'monospace', color: '#FF6666', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(B + 30).setInteractive({ useHandCursor: true });
        this._shopCloseBtn.on('pointerdown', () => this._closeShop());

        // Tab tip
        this._shopTip = this.add.text(cx, cy + 155, 'Click tabs above to switch', {
            fontSize: '9px', fontFamily: 'monospace', color: '#666666'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(B + 20);

        // Store elements for cleanup
        this._shopElements = [this._shopBackdrop, panel, this._shopTitle, this._shopCoinText,
            this._shopGearText, sep, this._shopCoinTab, this._shopGearTab, this._shopCloseBtn,
            this._shopTip, this._shopItemsContainer];

        // Draw initial items
        this._refreshShop('coin');
    }

    _refreshShop(tab) {
        this._activeShopTab = tab;

        // Update tab visuals
        if (this._shopCoinTab) {
            this._shopCoinTab.setColor(tab === 'coin' ? '#FFD700' : '#888888');
            this._shopCoinTab.setBackgroundColor(tab === 'coin' ? '#333355' : '#222233');
        }
        if (this._shopGearTab) {
            this._shopGearTab.setColor(tab === 'gear' ? '#FFD700' : '#888888');
            this._shopGearTab.setBackgroundColor(tab === 'gear' ? '#333355' : '#222233');
        }

        // Clear old items
        if (this._shopItemsContainer) {
            this._shopItemsContainer.removeAll(true);
        }

        const saveData = SaveManager.load(this.currentSlot) || {};
        const cx = GAME_WIDTH / 2;
        const cy = GAME_HEIGHT / 2;
        const B = 500;

        // Filter items by currency tab
        const items = SHOP_ITEMS.filter(item => item.currency === tab);

        items.forEach((item, i) => {
            const rowY = cy - 75 + i * 50;
            const balance = item.currency === 'gear' ? (saveData.gear || 0) : (saveData.coins || 0);
            const affordable = balance >= item.price;
            const owned = item.type === 'upgrade' || item.type === 'utility'
                ? !!(saveData.upgrades && saveData.upgrades[item.id])
                : (saveData.inventory && saveData.inventory[item.id]) || 0;
            const canBuy = item.type === 'consumable' ? owned < item.max : !owned;

            // Item label
            const label = this.add.text(cx - 170, rowY, item.label, {
                fontSize: '13px', fontFamily: 'monospace', color: canBuy ? '#FFFFFF' : '#555555'
            }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(B + 40);

            // Owned count
            const ownedStr = item.type === 'consumable' ? (owned + '/' + item.max)
                : owned ? 'OWNED' : '';
            if (ownedStr) {
                this.add.text(cx - 20, rowY, ownedStr, {
                    fontSize: '11px', fontFamily: 'monospace', color: owned ? '#44FF88' : '#666666'
                }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(B + 40);
            }

            // Price
            this.add.text(cx + 50, rowY, (item.currency === 'gear' ? '\u2699' : '\u25B6') + ' ' + item.price, {
                fontSize: '12px', fontFamily: 'monospace', color: '#FFD700'
            }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(B + 40);

            // Buy button
            const btnBg = this.add.rectangle(cx + 120, rowY, 70, 28,
                affordable && canBuy ? 0x226622 : 0x444444,
                affordable && canBuy ? 0.9 : 0.5
            ).setScrollFactor(0).setDepth(B + 40)
            .setStrokeStyle(1, affordable && canBuy ? 0x44AA44 : 0x666666);

            const btnText = this.add.text(cx + 120, rowY, 'BUY', {
                fontSize: '11px', fontFamily: 'monospace', color: affordable && canBuy ? '#FFFFFF' : '#666666',
                fontStyle: 'bold'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(B + 41);

            if (affordable && canBuy) {
                btnBg.setInteractive({ useHandCursor: true });
                btnBg.on('pointerover', () => {
                    btnBg.setFillStyle(0x338833);
                    btnBg.setStrokeStyle(1, 0x66CC66);
                });
                btnBg.on('pointerout', () => {
                    btnBg.setFillStyle(0x226622);
                    btnBg.setStrokeStyle(1, 0x44AA44);
                });
                btnBg.on('pointerdown', () => {
                    const success = SaveManager.buyItem(this.currentSlot, item.id);
                    if (success) {
                        this._playSound('sfx-tap');
                        // Refresh data
                        const newData = SaveManager.load(this.currentSlot) || {};
                        if (this._shopCoinText) this._shopCoinText.setText('COINS: ' + (newData.coins || 0));
                        if (this._shopGearText) this._shopGearText.setText('GEAR: ' + (newData.gear || 0));
                        this._refreshShop(this._activeShopTab);
                        // Apply upgrade immediately
                        if (item.type === 'upgrade' || item.type === 'utility') {
                            this._applyUpgrade(item.id);
                        }
                    }
                });
            }

            // Add to container for cleanup
            this._shopItemsContainer.add([label, btnBg, btnText]);
        });
    }

    _applyUpgrade(upgradeId) {
        switch (upgradeId) {
            case 'gear_boots':
                this._activeDoubleJump = PLAYER_DOUBLE_JUMP * 1.15;
                this._showFloatingText(this.player.x, this.player.y - 30, 'GEAR BOOTS!', '#FFD700');
                break;
            case 'wrench':
                this._hasWrenchStrike = true;
                this._showFloatingText(this.player.x, this.player.y - 30, 'WRENCH STRIKE!', '#FFD700');
                break;
            case 'coat':
                this._shieldCharges = Math.max(this._shieldCharges, 1);
                this._showFloatingText(this.player.x, this.player.y - 30, 'COGSWORTH COAT!', '#FFD700');
                break;
            case 'boss_intel':
                this._hasBossIntel = true;
                this._showFloatingText(this.player.x, this.player.y - 30, 'BOSS INTEL!', '#FFD700');
                break;
        }
    }

    _closeShop() {
        if (!this._shopOpen) return;
        this._shopOpen = false;

        // Destroy all shop elements
        if (this._shopElements) {
            this._shopElements.forEach(el => {
                if (el && el.destroy) el.destroy();
            });
            this._shopElements = null;
        }
        this._shopItemsContainer = null;
        this._shopBackdrop = null;
        this._shopTitle = null;
        this._shopCoinText = null;
        this._shopGearText = null;
        this._shopCoinTab = null;
        this._shopGearTab = null;
        this._shopCloseBtn = null;
        this._shopTip = null;

        // Resume game
        this.physics.world.resume();
        this.tweens.resumeAll();
    }

    // ────────────────────────────────────────────────────────────
    // ── Gear Drops & Shield ──
    // ────────────────────────────────────────────────────────────

    _spawnGearDrop(x, y) {
        const gearIcon = this.add.image(x, y, 'coin').setDepth(50).setScale(0.7);
        gearIcon.setTint(0xFFD700);

        // Float up and fade
        this.tweens.add({
            targets: gearIcon,
            y: y - 40,
            alpha: 0,
            duration: 700,
            ease: 'Quad.easeOut',
            onComplete: () => {
                gearIcon.destroy();
                SaveManager.addGear(this.currentSlot, 1);
                this._emitCurrencyEvents();
            }
        });

        // Floating text
        this._showFloatingText(x, y - 10, '+1 \u2699', '#FFD700');
    }

    _useShield() {
        if (this._shieldCharges <= 0 || this.player.isInvincible) return;
        this._shieldCharges--;

        const saveData = SaveManager.load(this.currentSlot) || {};
        if (!(saveData.upgrades && saveData.upgrades.coat)) {
            SaveManager.useConsumable(this.currentSlot, 'shield');
        }

        this.player.makeInvincible();
        // Extend invincibility for shield
        if (this.player._flashTween) {
            this.player._flashTween.destroy();
        }
        this.player.isInvincible = true;
        this.player._flashTween = this.tweens.add({
            targets: this.player,
            alpha: { from: 1, to: 0.3 },
            duration: 150,
            yoyo: true,
            repeat: 16, // ~5 seconds (150*2*17 = 5100ms)
            onComplete: () => {
                this.player.isInvincible = false;
                this.player.alpha = 1;
            }
        });

        // Blue flash
        const flash = this.add.rectangle(this.player.x, this.player.y, 32, 32, 0x4444FF, 0.5)
            .setDepth(100);
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 300,
            onComplete: () => flash.destroy()
        });

        this._playSound('sfx-tap');
        this._showFloatingText(this.player.x, this.player.y - 30, 'SHIELD!', '#44BBFF');
    }

    _emitCurrencyEvents() {
        const data = SaveManager.load(this.currentSlot) || {};
        this.events.emit('updateGear', data.gear || 0);
        this.events.emit('updateCoins', {
            collected: data.coins || 0,
            total: this.totalCoins
        });
        this.events.emit('updateCoinsCount', data.coins || 0);
    }
}
