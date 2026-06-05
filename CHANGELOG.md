# Changelog

All notable changes to Cogsworth: Last Wind are documented here.

---

## [Unreleased]

### Added
- **15 levels** (was 3) across 3 districts — Bellows District (Easy, Lv1–5), Clockwork Quarter (Medium, Lv6–10), The Core (Hard, Lv11–15)
- **PatrolDrone** — airborne enemy with laser attack (IDLE → WARNING → FIRING → COOLDOWN states)
- **Walker** — ground patrol enemy, humanoid steampunk mechanical automaton
- **BuriedSaw** — half-buried saw blade that pops up when player approaches
- **SurpriseSaw** — patrolling saw that emerges from the void when player nears
- **SpikeTrap** — periodic spike that extends/retracts on delay; damages only when extended
- Level intro banner showing district name + sub-level name
- Pause menu (ESC) displaying district and level info
- Level Complete screen with district progress (District Level X/5, Overall X/15)
- Moving platforms (horizontal & vertical patrol) — Level 2 & 3
- Saw blade obstacles (spinning hazards, damage on contact) — Level 2 & 3
- Spike static hazard texture (future use)
- Exit gate system — collect all gears to unlock, reach gate to clear the level
- Gate visual (closed/locked → open/glowing) with lock/unlock indicators
- Particle burst effects (stomp, coin collect, hurt, death)
- Floating score text (+10 for gear, +20 for stomp)
- Screen shake & camera flash (damage, stomp, death, gate activation)
- Player entrance animation (slam-in from above with bounce easing)
- Player trail particles (while moving)
- Slow-motion death effect (time scale 0.3 on game over)
- Interactive buttons with hover/press animations (main menu, game over)

### Changed
- **Walker redesign**: humanoid steampunk mechanical automaton — brass dome head with ventilator jaw, brass goggles with amber eyes, copper torso with chest gear, steam pipe, pincer claws, piston legs, metal boots (zero skin/cloth)
- **Drone redesign**: pure steampunk mechanical drone — brass propeller, copper dome body, central gear with amber eye, steam pipes, steam vent, rivets (replaced sci-fi blue body + red glow)
- **Enemy system**: refactored into PatrolDrone and Walker classes with shared enemy utilities
- **Obstacle system**: expanded from single saw type to Obstacle (BuriedSaw, SurpriseSaw, SpikeTrap, legacy saw)
- Entity creation in GameScene now switches on `type` field for enemy and obstacle spawning

### Changed
- **Moving platform texture alignment**: tilePosition now uses world-aligned left edge (`x - width/2`) instead of raw world center (`x`), matching static ground tiles so brick patterns stay visually consistent
- **Game over delay reduced**: transition to death menu shortened from ~1500ms to ~500ms real-time (slow-mo 400→150 game-ms; transition timer 1500→150 game-ms, both fire at same tick so death menu appears right after hit-stop)
- `PLAYER_JUMP` increased from -500 to -580 (higher jumps)
- Variable jump height reduced from 50% cut to 30% cut, threshold raised to -200
- Coyote time increased from 80ms to 100ms
- Jump buffer increased from 150ms to 180ms
- Coin collect is now guarded against double-trigger (`_collected` flag + instant body disable)
- Coins group now uses `{ allowGravity: false }` to prevent falling
- Main menu: blinking text replaced with interactive START GAME button + ambient floating dust particles
- Game over screen: blinking text replaced with interactive RETRY and MAIN MENU buttons
- Level completion now requires reaching the exit gate (not automatic on last coin)

### Fixed
- Moving platform texture appearing misaligned/weird in Level 2 — absolute world coordinate wrapping (tilePositionX = x) caused visual offset vs static ground tiles
- Slow-mo (`timeScale = 0.3`) was making game-over delayedCalls take 3× longer, defeating the 1500→500 reduction
- Coins in Level 2 that were floating in mid-air between platforms (repositioned to nearest platform)
- Coin score loop exploit (overlap triggering multiple times during collect animation)
- Coin physics body not properly disabling gravity when added to group

---

## [1.0.0] — 2025-01-15

### Added
- Initial release — 3-level platformer
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
