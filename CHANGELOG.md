# Changelog

All notable changes to Cogsworth: Last Wind are documented here.

---

## [Unreleased]

### Added
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
