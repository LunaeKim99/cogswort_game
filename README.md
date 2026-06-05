# Cogsworth: Last Wind ⚙️

> *A steampunk platformer built with Phaser 3 — collect gears, stomp clockwork enemies, and escape the crumbling factory.*

---

## 🎮 How to Play

**Goal:** Collect all gears (coins) in each level, then reach the exit gate to advance.

### Controls

| Desktop | Mobile |
|---------|--------|
| ← → / A D — Move | Left / Right buttons (bottom-left) |
| ↑ / W / Space — Jump (press again mid-air for double jump) | Jump button (bottom-right) |
| Stomp enemies from above | *(same mechanic)* |

### Scoring
| Action | Points |
|--------|:------:|
| Collect a gear | +10 |
| Stomp an enemy | +20 |

You have **3 lives** per run. Touch an enemy from the side or fall into a gap and you lose one. Lose all three — game over.

### New in the latest version
- **15 levels** across 3 districts (was 3) — 5 levels per district with progressive difficulty
- **PatrolDrone** — airborne enemy with laser cone attack; stompable from above
- **Walker** — ground patrol mechanical automaton (humanoid steampunk robot)
- **BuriedSaw** — saw blade that springs up when you get close
- **SurpriseSaw** — saw that emerges from the void and patrols
- **SpikeTrap** — floor spikes that extend/retract on a timer
- **Level banners** — shows district + sub-level name at start
- **Pause menu (ESC)** — shows district and level info
- **Exit gates** — collect all gears to unlock, then reach the gate to clear the level
- **Moving platforms** — ride platforms that patrol left/right or up/down

---

## 🚀 Quick Start

### Play in Browser

**Option 1 — Python (recommended)**
```bash
cd "W:\Matery\G-Tech\Cogsworth Last Wind\game"
python -m http.server 8080
```
Then open **http://localhost:8080/**

**Option 2 — Node.js**
```bash
cd "W:\Matery\G-Tech\Cogsworth Last Wind\game"
npx serve .
```

**Option 3 — Any static server**
Serve the `game/` directory and open the root URL.

---

## 🕹️ Game Features

- **15 levels** (3 districts × 5 levels) — Bellows District (Easy), Clockwork Quarter (Medium), The Core (Hard)
- **Procedural pixel art** — all sprites, backgrounds, and UI generated at runtime (zero external images)
- **Steampunk mechanical theme** — brass, copper, gears, rivets, pistons, steam pipes, glowing amber eyes
- **Smooth platforming** — coyote time, jump buffering, variable jump height, **double jump**
- **Responsive controls** — keyboard (desktop) + touch buttons (mobile) in one build
- **Juice & polish** — screen shake, particle bursts, floating score text, interactive buttons, slow-mo death
- **Audio** — jump, collect, stomp, hurt, win sound effects + background music
- **Mobile-ready** — scales to any screen, touch-friendly, ready for Android APK via Capacitor

---

## 📁 Project Structure

```
game/
├── index.html               # Entry point (loads Phaser from CDN)
├── package.json             # NPM config
├── capacitor.config.json    # Capacitor config for Android build
├── BUILD.md                 # Detailed build instructions
├── src/
│   ├── config.js            # Phaser game config
│   ├── constants.js         # Game constants (physics, gameplay)
│   ├── main.js              # Game initialization
│   ├── data/
│   │   └── levels.js        # Level definitions (15 levels, 3 districts)
│   │   ├── Player.js        # Player class
│   │   ├── Enemy.js         # PatrolDrone (airborne+lazer) & Walker (ground mech)
│   │   ├── Coin.js          # Collectible coin class
│   │   ├── MovingPlatform.js # Moving platform class
│   │   └── Obstacle.js      # BuriedSaw, SurpriseSaw, SpikeTrap, legacy saw
│   ├── ui/
│   │   └── TouchControls.js # Virtual buttons for mobile
│   └── scenes/
│       ├── BootScene.js     # Generates all textures procedurally
│       ├── PreloadScene.js  # Loads audio, shows loading bar
│       ├── MainMenuScene.js
│       ├── GameScene.js     # Main gameplay (collisions, scoring, gates)
│       ├── HUDScene.js      # Score/lives overlay
│       ├── LevelCompleteScene.js
│       ├── GameOverScene.js
│       └── WinScene.js
└── assets/
    ├── sounds/              # SFX (wav/mp3)
    └── music/               # BGM (mp3)
```

---

## 📱 Build Android APK

```bash
cd "W:\Matery\G-Tech\Cogsworth Last Wind\game"
npm install -g @capacitor/cli @capacitor/core
npm install @capacitor/android
npx cap init CogsworthLastWind com.cogsworth.lastwind
npx cap add android
npx cap copy android
npx cap open android
```

Then in Android Studio: **Run** (or Build → APK).

---

## 📜 Level Design

| Level | District - Name | Width | Difficulty | New Features |
|-------|-----------------|:-----:|:----------:|--------------|
| 1 | Bellows District - Tutorial | 2400px | Easy | Basic enemies, stomp intro |
| 2 | Bellows District - The Smelting Floors | 2800px | Easy | PatrolDrone, moving platform |
| 3 | Bellows District - Conveyor Crossings | 3200px | Easy | Walker, BuriedSaw |
| 4 | Bellows District - Pipeworks | 3600px | Medium | SurpriseSaw, more gaps |
| 5 | Bellows District - The Great Furnace | 4000px | Medium | SpikeTrap, mixed enemies |
| 6 | Clockwork Quarter - Tutorial | 3200px | Medium | Moving platforms, airborne hazards |
| 7 | Clockwork Quarter - Gear Assembly | 3600px | Medium | Dense enemy patrols |
| 8 | Clockwork Quarter - Pendulum Pass | 4000px | Medium | Vertical moving platforms |
| 9 | Clockwork Quarter - Regulator Room | 4400px | Hard | Spike timing puzzles |
| 10 | Clockwork Quarter - The Mainspring | 4800px | Hard | All enemy types |
| 11 | The Core - Tutorial | 4000px | Hard | Tight platforms, surprise saws |
| 12 | The Core - Pressure Valve | 4400px | Hard | Fast drones, spike corridors |
| 13 | The Core - Boiler Room | 4800px | Hard | Dense obstacles, mixed enemies |
| 14 | The Core - Governor's Chamber | 5600px | Hard | Precision platforming |
| 15 | The Core - The Heart of Cogsworth | 6400px | Very Hard | All hazards maxed |

---

## 🛠️ Tech Stack

- **Engine:** [Phaser 3.80](https://phaser.io/) (CDN, no build step)
- **Audio:** WAV / MP3 (loaded at runtime)
- **Mobile:** Capacitor (Android APK)
- **All graphics:** Procedurally generated via Phaser `Graphics.generateTexture()`

---

## 📄 License

MIT — use it, mod it, share it.

---

## 🙏 Credits

- **Engine:** Phaser 3 (phaser.io)
- **Sound effects:** Various free sources
- **Art:** Procedurally generated pixel art (no external assets)
- **Built with:** [OpenCode](https://github.com/sst/opencode) AI agent
