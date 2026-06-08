# Changelog

All notable changes to Cogsworth: Last Wind are documented here.

---

## [Unreleased]

### Added
- Count-up timer in HUD with color-coded pacing (green/yellow/red per district threshold)
- Debug logging to LevelCompleteScene transitions

### Changed
- **Floating platform incline redesign** across all 15 levels:
  - **Levels 2-5** (Bellows District): gradual incline + regression pattern; Y ranges L2: 320→275, L3: 320→260, L4: 320→230, L5: 320→240
  - **Levels 6-10** (Clockwork Quarter): platforms trend Y≈310→180; 5 vertical moving platforms added
  - **Levels 11-15** (The Core): aggressive incline Y≈280→120 with narrow 32-48px platforms; 4 vertical moving platforms added
- **Progressive coin scaling**: L6→15, L7→13, L8→14, L9→15, L10→17, L11→16, L12→19, L13→19, L14→22, L15→23
- **Difficulty & distance tuning**: L6 widened 3200→3600px, L11 widened 3600→4200px; extra walkers on L7/L9/L11; patrol tightening on L8/L12/L15; walker→drone swap on L13; trigger distance shortened on L10/L14; spike delay shortened on L15
- Pause menu buttons fire on `pointerdown` instead of `pointerup` (fixes mobile touch drift)
- Scene transitions deferred via `delayedCall(0)` to avoid input handler conflicts
- Death transition uses tween fade-to-black instead of `timeScale` + `delayedCall` (prevents timer stall)

### Fixed
- Pause menu: restart and main menu buttons not working (root cause: `pointerup` + scene ops inside input handler)
- Death menu (GameOverScene) not appearing (replaced `settings.data` with `init(data)`)
- Gate overlap in level 3 (missing `refreshBody()` after `setOrigin`)
- Gate floating in gap in level 9 (extended ground section)
- 3 unreachable floating platforms in level 3 (lowered Y values)
- Pause menu stuck at level start (missing `setScrollFactor(0)` on pause elements)

---

## [2026-06-08] — Bug Fixes & Gate Always Open

### Changed
- Gate always open — star rating purely cosmetic (full coin collection no longer required to advance)

### Fixed
- 10 bugs: SpikeTrap Y positioning, drone laser crash when target destroyed, coin animation double-trigger, stomp threshold too strict (now 30px), intro banner scale stuck at 0, fall death leaving player frozen, game over timer race with `timeScale`, touch consumeJump order blocking keyboard, unused DPR constants, `initialDelay` falsy fallback, HUD panel alpha

---

## [2026-06-07] — Sprite Animation System & Asset Pipeline

### Added
- Multi-frame sprite sheet animation system (player, enemies, coins)
- Frame-by-frame Canva AI prompts for all animation states
- Art style consistency guide with Dreamina Img2Img workflow
- Preload system with PNG fallback + progress bar
- `convert-assets.ps1` script for automated asset conversion

### Changed
- All character/enemy prompts updated to facing-right direction
- Player character specified as female gender
- Complete rewrite of Canva prompts with proper naming conventions

---

## [2026-06-06] — Menu Overhaul & Difficulty Balancing

### Added
- Menu system: Mode Select, Save Slots (3 slots), Level Select
- SaveManager with localStorage persistence
- Double jump mechanic
- Star rating system (based on lives, coins, time)

### Changed
- Gate system: now always open (collect gears for star rating, not required to advance)
- Drone laser visual redesigned with cone indicator
- Spike trap texture and hitbox redesigned

### Fixed
- Pause menu buttons not clickable (moved from Container to direct scene children with explicit depths)
- Duplicate `### Changed` section in changelog

---

## [2026-06-05] — Initial Build: 15 Levels, Full Mechanics

### Added
- **15 levels across 3 districts**: Bellows District (1-5), Clockwork Quarter (6-10), The Core (11-15)
- New enemy types: drone (flying + laser) and walker (steampunk mechanical)
- New obstacles: spike traps, buried saws, surprise saws
- Moving platforms (horizontal patrol) for strategic climbing
- Exit gate system with lock/unlock visual and indicators
- Particle effects: stomp, coin collect, hurt, death
- Floating score text (+10 gear, +20 stomp)
- Screen shake & camera flash on damage, stomp, death, gate activation
- Player entrance animation (slam-in with bounce easing)
- Player trail particles while moving
- Interactive buttons with hover/press animations (main menu, game over)
- Pause menu (Escape key / button) with Resume, Restart, Main Menu
- Full HUD overhaul: hearts, score, coin counter with progress bar, level name
- Touch controls for mobile (left, right, jump buttons)
- Main menu with animated gears, ambient floating dust, START button
- Game over screen with RETRY and MAIN MENU buttons
- Level complete transition with star rating display
- Win screen for final level completion
- Procedural texture generation (all sprites, backgrounds, UI)
- Audio system (jump, coin, stomp, hurt, win, tap SFX + BGM)
- Loading screen with progress bar
- Capacitor configuration for Android APK build
- Coyote time (100ms), jump buffering (180ms), variable jump height

### Changed
- `PLAYER_JUMP` from -500 to -580 (higher jumps)
- Variable jump height: 30% cut (was 50%), threshold raised to -200
- Coin collect: double-trigger guard (`_collected` flag + instant body disable)
- Coins group: `allowGravity: false` to prevent falling
- Main menu: blinking text → interactive button + ambient particles
- Game over: blinking text → interactive buttons
- HUD: complete visual overhaul (panel, coin counter, progress bar)
- Enemy textures: pure steampunk mechanical redesign (drone, walker)
- Moving platform texture: scrollable tile for seamless movement

### Fixed
- Black screen after Start Game (HUDScene crash on missing data)
- Level transition black screen (HUD cleanup on scene switch)
- Moving platform body size not syncing (collider mismatch)
- Gate not opening on last coin collected (coin counter logic)
- Enemy positions and patrol bounds across all levels
- Exit gate position (sits on ground, text above door)
- Level 2 coin placements and moving platform patrol range
