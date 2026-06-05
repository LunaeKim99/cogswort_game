# Cogsworth: Last Wind ⚙️

> *A steampunk platformer built with Phaser 3 — collect gears, stomp clockwork enemies, and escape the crumbling factory.*

---

## 🎮 How to Play

**Goal:** Collect all gears (coins) in each level, then reach the exit gate to advance.

### Controls

| Desktop | Mobile |
|---------|--------|
| ← → / A D — Move | Left / Right buttons (bottom-left) |
| ↑ / W / Space — Jump | Jump button (bottom-right) |
| Stomp enemies from above | *(same mechanic)* |

### Scoring
| Action | Points |
|--------|:------:|
| Collect a gear | +10 |
| Stomp an enemy | +20 |

You have **3 lives** per run. Touch an enemy from the side or fall into a gap and you lose one. Lose all three — game over.

### New in the latest version
- **Exit gates** — collect all gears to unlock, then reach the gate to clear the level
- **Moving platforms** — ride platforms that patrol left/right or up/down
- **Saw blades** — spinning hazards that patrol and damage on contact (no stomp)

---

## 🚀 Quick Start

### Play in Browser

**Option 1 — Python (recommended)**
```bash
cd "W:\Matery\G-Tech\Cogsworth Last Wind"
python -m http.server 8080
```
Then open **http://localhost:8080/game/**

**Option 2 — Node.js**
```bash
cd "W:\Matery\G-Tech\Cogsworth Last Wind\game"
npx serve .
```

**Option 3 — Any static server**
Serve the root directory and access `/game/`.

---

## 🕹️ Game Features

- **3 levels** with progressive difficulty (4800px → 5600px → 6400px)
- **Procedural pixel art** — all sprites, backgrounds, and UI generated at runtime (zero external images)
- **Steampunk theme** — gears, goggles, brick platforms, glowing factory backgrounds
- **Smooth platforming** — coyote time, jump buffering, variable jump height
- **Responsive controls** — keyboard (desktop) + touch buttons (mobile) in one build
- **Juice & polish** — screen shake, particle bursts, floating score text, interactive buttons
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
│   │   └── levels.js        # Level definitions (3 levels)
│   ├── entities/
│   │   ├── Player.js        # Player class
│   │   ├── Enemy.js         # Enemy patrol class
│   │   ├── Coin.js          # Collectible coin class
│   │   ├── MovingPlatform.js # Moving platform class
│   │   └── Obstacle.js      # Saw blade / spike hazard
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

| Level | Name | Width | Difficulty | Features |
|-------|------|:-----:|:----------:|----------|
| 1 | Bellows District | 4800px | Easy | Wide platforms, basic enemies, intro to stomp |
| 2 | Clockwork Quarter | 5600px | Medium | More gaps, moving platform, saw blade |
| 3 | The Core | 6400px | Hard | Narrow platforms, 3 moving platforms, 3 saw blades |

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
