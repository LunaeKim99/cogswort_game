# Cogsworth: Last Wind - Build & Run Instructions

## Quick Start (Play in Browser)

### Option 1: Python (recommended)
```bash
cd W:\Matery\G-Tech\Cogsworth Last Wind\game
python -m http.server 8080
```
Then open `http://localhost:8080/` in your browser.

### Option 2: Node.js
```bash
cd W:\Matery\G-Tech\Cogsworth Last Wind\game
npx serve .
```
Then open the URL shown in terminal.

### Option 3: Any static server
Simply serve the `game/` directory and open the root URL.

## Controls

### Keyboard (Desktop)
- **Arrow Left / A**: Move left
- **Arrow Right / D**: Move right
- **Arrow Up / W / Space**: Jump
- **M**: Return to menu (on game over/win screens)

### Touch (Mobile)
- **Left button** (bottom-left): Move left
- **Right button** (bottom-left): Move right
- **Jump button** (bottom-right): Jump

## Game Features
- 3 levels with progressive difficulty
- Stomp enemies by landing on them from above
- Collect all gears (coins) to clear a level
- 3 lives per run
- Score system (+10 per gear, +20 per stomp)
- HUD with hearts, score, and level name

## Project Structure
```
game/
├── index.html              # Entry point (loads Phaser from CDN)
├── package.json            # NPM config
├── capacitor.config.json   # Capacitor config for Android build
├── BUILD.md                # This file
├── src/
│   ├── config.js           # Phaser game config
│   ├── constants.js        # Game constants (physics, gameplay)
│   ├── main.js             # Game initialization
│   ├── data/
│   │   └── levels.js       # Level definitions (3 levels)
│   ├── entities/
│   │   ├── Player.js       # Player class
│   │   ├── Enemy.js        # Enemy patrol class
│   │   └── Coin.js         # Collectible coin class
│   ├── ui/
│   │   └── TouchControls.js # Virtual buttons for mobile
│   └── scenes/
│       ├── BootScene.js    # Generates all textures procedurally
│       ├── PreloadScene.js # Loads audio, shows loading bar
│       ├── MainMenuScene.js
│       ├── GameScene.js    # Main gameplay
│       ├── HUDScene.js     # Score/lives overlay
│       ├── LevelCompleteScene.js
│       ├── GameOverScene.js
│       └── WinScene.js
```

## Build Android APK with Capacitor

### Prerequisites
- Node.js 18+
- Android Studio with SDK
- Java 17+

### Steps
```bash
# 1. Navigate to game directory
cd W:\Matery\G-Tech\Cogsworth Last Wind\game

# 2. Install Capacitor CLI (globally or locally)
npm install -g @capacitor/cli @capacitor/core
npm install @capacitor/android

# 3. Initialize Capacitor (if not already done)
npx cap init CogsworthLastWind com.cogsworth.lastwind

# 4. Add Android platform
npx cap add android

# 5. Build the web app (copy web assets)
npx cap copy

# 6. Copy capacitor config
npx cap copy android

# 7. Open in Android Studio
npx cap open android

# 8. In Android Studio:
#    - Let Gradle sync complete
#    - Connect Android device or start emulator
#    - Click Run (green play button)

# For production APK:
# Android Studio → Build → Build Bundle(s) / APK → Build APK
```

### Notes for Android Build
- All game assets are loaded via relative paths, safe for mobile WebView
- Sound files are .wav and .mp3 format, compatible with Android
- Touch controls are built-in and work in WebView
- Game uses `Phaser.Scale.FIT` for proper scaling on any screen size
- Background textures are generated procedurally (no external image dependencies)
- All sprite graphics are generated at runtime via Phaser Graphics API

## Level Design
| Level | Name | Width | Difficulty |
|-------|------|-------|------------|
| 1 | Bellows District | 4800px | Easy - onboarding |
| 2 | Clockwork Quarter | 5600px | Medium - more gaps & enemies |
| 3 | The Core | 6400px | Hard - tight platforms & enemies |

## Credits
- Engine: Phaser 3 (phaser.io)
- Music: time_for_adventure.mp3
- Sound Effects: Various free sources
- Art: Procedurally generated pixel art
