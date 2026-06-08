# Changelog

All notable changes to Cogsworth: Last Wind are documented here.

---

## [Unreleased]

### Added
- Moving platforms (horizontal & vertical patrol) - Level 2 & 3
- Saw blade obstacles (spinning hazards, damage on contact) - Level 2 & 3
- Spike static hazard texture (future use)
- Exit gate system - collect all gears to unlock, reach gate to clear the level
- Gate visual (closed/locked → open/glowing) with lock/unlock indicators
- Particle burst effects (stomp, coin collect, hurt, death)
- Floating score text (+10 for gear, +20 for stomp)
- Screen shake & camera flash (damage, stomp, death, gate activation)
- Player entrance animation (slam-in from above with bounce easing)
- Player trail particles (while moving)
- Slow-motion death effect (time scale 0.3 on game over)
- Interactive buttons with hover/press animations (main menu, game over)
- Count-up timer display in HUD with color-coded pacing (green/yellow/red per district threshold)
- Debug logging to LevelCompleteScene transitions

### Changed
- `PLAYER_JUMP` increased from -500 to -580 (higher jumps)
- Variable jump height reduced from 50% cut to 30% cut, threshold raised to -200
- Coyote time increased from 80ms to 100ms
- Jump buffer increased from 150ms to 180ms
- Coin collect is now guarded against double-trigger (`_collected` flag + instant body disable)
- Coins group now uses `{ allowGravity: false }` to prevent falling
- Main menu: blinking text replaced with interactive START GAME button + ambient floating dust particles
- Game over screen: blinking text replaced with interactive RETRY and MAIN MENU buttons
- Level completion now requires reaching the exit gate (not automatic on last coin)
- **Progressive coin scaling**: levels 6-15 now have more gears (L6→15, L7→13, L8→14, L9→15, L10→17, L11→16, L12→19, L13→19, L14→22, L15→23)
- **Difficulty & distance progression**: levels 6 (3200→3600px) and 11 (3600→4200px) widened; +walkers on L7/L9/L11; patrol tightening on L8/L12/L15; walker→drone swap on L13; trigger distance shortened on L10/L14; spike delay shortened on L15
- **Floating platform incline redesign** (all 15 levels):
  - **Levels 2-5** (Bellows District): platforms now follow gradual incline + regression pattern (Y ranges: L2 320→275, L3 320→260, L4 320→230, L5 320→240); platform counts increased (L2: 4→7, L3: 7→9, L4: 9→10, L5: 10→11)
  - **Levels 6-10** (Clockwork Quarter): platforms trend from Y≈310 down to 255→180 with regressions every 2-3 platforms; 5 vertical moving platforms added across L7-L10
  - **Levels 11-15** (The Core): aggressive incline Y≈280→120 with narrow platforms (32-48px); 4 vertical moving platforms added across L11-L15
- Gate always open — star rating purely cosmetic (full coin collection no longer required to advance)
- Death transition: replaced timeScale+delayedCall with tween-based fade-to-black overlay (avoids timer stall)
- Pause menu buttons: callback fires on `pointerdown` instead of `pointerup` (fixes mobile drift)
- Resume / Restart / Main Menu callbacks: now call `_hidePauseMenu()` first, defer scene ops via `delayedCall(0)`

### Fixed
- Coins in Level 2 that were floating in mid-air between platforms (repositioned to nearest platform)
- Coin score loop exploit (overlap triggering multiple times during collect animation)
- Coin physics body not properly disabling gravity when added to group
- 10 bugs: SpikeTrap Y positioning, drone laser crash when target destroyed, coin collect animation playing twice, stomp threshold too strict (now 30px), intro banner scale stuck at 0, fall death leaving player frozen mid-air, game over timer race with `timeScale`, touch consumeJump order blocking keyboard, unused DPR constants, initialDelay falsy fallback, HUD panel alpha
- Pause menu stuck at level start (missing `setScrollFactor(0)` on pause elements)
- Level 3 gate overlap (missing `refreshBody()` after `setOrigin(0.5, 1)`)
- Level 9 gate floating in mid-air gap (extended ground section)
- 3 unreachable floating platforms in level 3 (lowered Y values)
- Death menu (GameOverScene) not appearing (wrong scene data access — replaced `settings.data` with `init(data)`)
- Pause menu: restart from pause and main menu from pause not working (root cause: `pointerup` + scene ops in input handler)

---

## [1.0.0] - 2025-01-15

### Added
- Initial release - 3-level platformer
- Player with idle/run/jump/fall/hurt animations (procedural sprites)
- Stomp mechanic (enemy death from above)
- Coin collection (+10 points each)
- 3 lives per run with invincibility frames
- Enemy AI (horizontal patrol)
- Procedural texture generation (all sprites, backgrounds, UI)
- Audio system (jump, coin, stomp, hurt, win, tap SFX + BGM)
- Loading screen with progress bar
- Main menu with animated gears
- Game over screen with score display
- Win screen for final level completion
- Level complete transition screen
- HUD overlay (hearts, score, level name)
- Touch controls for mobile (left, right, jump buttons)
- Responsive scaling (Phaser.Scale.FIT)
- Capacitor configuration for Android APK build
- Coyote time (80ms) and jump buffering (150ms)
- Variable jump height (release early = shorter jump)
