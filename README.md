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
| S — Shield (consumable, extends invincibility) | *(touch jump near merchant opens shop)* |
| Stomp enemies from above | *(same mechanic)* |
| Interact with Merchant (↑ near NPC) | *(auto-detect proximity)* |

### Scoring
| Action | Points / Reward |
|--------|:---------------:|
| Collect a gear (coin item) | +10 |
| Stomp an enemy | +20 (+ chance to drop ⚙ gear) |
| Defeat a boss | +100 per hit + bonus 500/1000/1500 |

You have **3 lives** per run. Touch an enemy from the side or fall into a gap and you lose one. Lose all three — game over.

### Currency & Upgrades
- **Coins 🪙** — collected in levels, spent at the Merchant for consumables (Extra Life, Shield Flask)
- **Gears ⚙** — dropped by stomped enemies, rewarded on level completion; spent on permanent upgrades
- **Upgrades**: Gear Boots (stronger double jump), Wrench Strike (wider stomp), Cogsworth Coat (free shield), Boss Intel (attack warnings)
- **Shield** — press **S** to activate; grants ~5 seconds of invincibility with blue flash

### New in the latest version
- **16-bit pixel art** — every sprite redrawn as hand-crafted pixel maps (player, enemies, bosses, NPCs)
- **3 Boss battles** — replace level completion on levels 5, 10, 15: Bellows Brute, Clockwork Sentinel, Core Tyrant
- **NPC Merchant** — appears on levels 4, 9, 14; buy items with coins and gears
- **Currency system** — dual currencies (coins + gears) with shop, drops, and permanent upgrades
- **Shield system** — consumable invincibility, purchaseable from Merchant
- **15 levels** across 3 districts — 5 levels per district with progressive difficulty
- **PatrolDrone** — airborne enemy with laser cone attack; stompable from above
- **Walker** — ground patrol mechanical automaton (humanoid steampunk robot)
- **BuriedSaw** — saw blade that springs up when you get close
- **SurpriseSaw** — saw that emerges from the void and patrols
- **SpikeTrap** — floor spikes that extend/retract on a timer
- **Level banners** — shows district + sub-level name at start
- **Pause menu (ESC)** — shows district and level info
- **Exit gates** — reach the gate to clear the level (star rating purely cosmetic)
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
- **3 Boss battles** — Bellows Brute, Clockwork Sentinel, Core Tyrant with unique attack patterns
- **16-bit pixel art** — every sprite hand-crafted as pixel maps (zero external images)
- **Dual currency system** — coins (collect in levels) + gears (dropped by enemies, rewarded on completion)
- **NPC Merchant** — buy consumables and permanent upgrades on shop levels
- **Upgrade system** — Gear Boots, Wrench Strike, Cogsworth Coat, Boss Intel
- **Shield system** — consumable invincibility flask (S key)
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
│   ├── constants.js         # Game constants (physics, gameplay, shop, bosses)
│   ├── main.js              # Game initialization
│   ├── data/
│   │   ├── SaveManager.js   # Save/load progress (5 slots) with currency + inventory
│   │   └── levels.js        # Level definitions (15 levels, 3 districts)
│   ├── entities/
│   │   ├── Player.js        # Player class (invincibility, bounce, stomp)
│   │   ├── Enemy.js         # PatrolDrone (airborne+laser) & Walker (ground mech)
│   │   ├── Coin.js          # Collectible gear item
│   │   ├── MovingPlatform.js # Moving platform class
│   │   └── Obstacle.js      # BuriedSaw, SurpriseSaw, SpikeTrap
│   ├── ui/
│   │   └── TouchControls.js # Virtual buttons for mobile
│   └── scenes/
│       ├── BootScene.js     # Generates all textures (16-bit pixel art)
│       ├── PreloadScene.js  # Loads audio, shows loading bar
│       ├── MainMenuScene.js
│       ├── ModeSelectScene.js
│       ├── SlotSelectScene.js
│       ├── LevelSelectScene.js
│       ├── GameScene.js     # Main gameplay + merchant + gear drops + shield
│       ├── HUDScene.js      # Score/lives/currency overlay
│       ├── BossScene.js     # Single-screen boss arenas (3 unique bosses)
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

| Level | District - Name | Width | Difficulty | Type |
|-------|-----------------|:-----:|:----------:|:----:|
| 1 | Bellows District - Tutorial | 2400px | Easy | Level |
| 2 | Bellows District - The Smelting Floors | 3000px | Easy | Level |
| 3 | Bellows District - Gearworks Alley | 3600px | Easy | Level |
| 4 | Bellows District - Boiler Pass | 4200px | Medium | 🏪 Shop |
| 5 | Bellows District - The Great Bell | 4800px | Medium | **BOSS** |
| 6 | Clockwork Quarter - Tutorial | 3600px | Medium | Level |
| 7 | Clockwork Quarter - Pendulum Path | 4000px | Medium | Level |
| 8 | Clockwork Quarter - Spring-Loaded Corridor | 4800px | Medium | Level |
| 9 | Clockwork Quarter - Ratchet Ridge | 5200px | Hard | 🏪 Shop |
| 10 | Clockwork Quarter - The Mainspring | 5600px | Hard | **BOSS** |
| 11 | The Core - Tutorial | 4200px | Hard | Level |
| 12 | The Core - Brass Depths | 4800px | Hard | Level |
| 13 | The Core - Plasma Forge | 5600px | Hard | Level |
| 14 | The Core - Cogspire | 6000px | Hard | 🏪 Shop |
| 15 | The Core - The Last Wind | 6400px | Very Hard | **BOSS** |

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
