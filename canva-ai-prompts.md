# Dreamina AI Prompts — Cogsworth: Last Wind

> 16-bit Steampunk Platformer — Asset Generation Guide for Dreamina AI (Seedream 5.0)
>
> **Model**: Seedream 5.0 (Pixel Art mode)
> **Image size**: Use Dreamina's default output; crop/resize to exact specs later
> **Style keywords**: `pixel art, game sprite, steampunk, transparent PNG`
> **Transparency**: Dreamina's pixel art model supports transparent backgrounds natively — no post-processing needed

---

## 🔰 How to Use

1. Open **Dreamina (dreamina.capcut.com) → AI Image → Seedream 5.0** model
2. Paste the prompt below for the asset you need
3. Generate **4 variations** — pick the best one
4. Download as **PNG** (transparent background is native)
5. Import into `assets/images/` and reference in BootScene

> 💡 Dreamina's Seedream 5.0 has a dedicated pixel art model that understands game sprites, transparency, and pixel-perfect output natively. No need for "no anti-aliasing" or "flat colors" constraints.

---

## 🎨 MASTER PROMPT TEMPLATE

```
pixel art [SUBJECT], game sprite, steampunk style,
[DETAILS], [PALETTE WORDS], transparent PNG
```

> Keep prompts short and direct — Seedream 5.0 understands pixel art conventions natively.

---

## 📦 ASSET PROMPTS

### 1. BACKGROUNDS — Full-Scene (800×450)

Generate as landscape images (no transparency needed for full backgrounds).

---

#### BG-01: Bellows District (Levels 1-5)

```
pixel art background, Bellows District, night sky with copper-orange
smog haze, distant factory chimneys, brass pipes and catwalks silhouettes,
industrial steampunk forge, warm amber and brass, dark navy sky,
glowing furnace windows, 800x450 game background
```

#### BG-02: Clockwork Quarter (Levels 6-10)

```
pixel art background, Clockwork Quarter, deep blue-purple twilight sky,
giant clock tower silhouettes, interlocking gear walls,
blue glowing energy lines, copper wire mesh, cool blue and steel palette,
dark navy background, 800x450 game background
```

#### BG-03: The Core (Levels 11-15)

```
pixel art background, The Core, deep dark red-purple sky,
molten amber glow, reactor core silhouettes, massive flywheels,
lava pipes, charred metal, warning stripes, fire atmosphere,
hot orange and crimson palette, 800x450 game background
```

---

### 2. PLAYER CHARACTER — Cogsworth

All player sprites are 32×32 pixels. Transparency is native.

#### PL-01: Main Character (Idle)

```
pixel art game character, steampunk adventurer idle, 32x32 pixels,
brown aviator cap with brass goggles showing blue lenses,
flowing red scarf, brown leather jacket, brass gear on chest,
utility belt with gold buckle, brown pants and boots,
mechanical backpack, warm brass and copper, red scarf accent,
transparent PNG
```

#### PL-02: Jump Pose

```
pixel art game character, steampunk adventurer mid-jump pose,
32x32 pixels, arms up, legs tucked, brown aviator cap,
blue-lensed goggles, red scarf flowing upward, brown jacket,
gear on chest, brown boots tucked under, transparent PNG
```

#### PL-03: Hurt/Death Pose

```
pixel art game character, steampunk adventurer hurt pose,
32x32 pixels, staggering backward, red tint overlay,
hat tilted, red scarf disturbed, damage frame,
transparent PNG
```

---

### 3. ENEMIES

#### EN-01: Walker Automaton (Idle/Patrol)

```
pixel art game enemy, steampunk mechanical automaton walking,
32x32 pixels, brass dome head with glowing amber eyes,
goggles, ventilator grill mouth, copper torso with gear,
piston arms ending in pincer claws, riveted metal legs,
dark brass and copper, transparent PNG
```

#### EN-02: Walker Death

```
pixel art game enemy, destroyed steampunk automaton, 32x32 pixels,
same body with X eyes made of red pixels, dark overlay,
head tilted, gear chest cracked, defeated pose, transparent PNG
```

#### EN-03: PatrolDrone (Flying)

```
pixel art game enemy, steampunk flying drone, 28x28 pixels,
brass propeller on top, copper oval body,
central glowing amber mechanical eye, small steam pipes,
bronze and brass colors with amber glow, transparent PNG
```

#### EN-04: PatrolDrone Death

```
pixel art game enemy, destroyed steampunk drone, 28x28 pixels,
same body with red X eye, dark overlay, propeller stopped,
transparent PNG
```

#### EN-05: Laser Beam (Drone Attack)

```
pixel art laser beam, 8x80 pixels, vertical glowing red energy,
white hot core, red outer glow, game projectile,
transparent PNG
```

---

### 4. OBSTACLES

#### OB-01: Saw Blade (BuriedSaw / SurpriseSaw)

```
pixel art circular saw blade, 28x28 pixels, metal gear with
8 sharp jagged teeth, dark gray metal center,
red glowing center eye, steel and iron, transparent PNG
```

#### OB-02: Spike Trap

```
pixel art spike trap, 48x32 pixels, wide metal base plate
with rivets, five upward serrated spikes, dark red and gray,
industrial hazard, floor trap, transparent PNG
```

---

### 5. COLLECTIBLES & PROPS

#### CO-01: Gear Coin

```
pixel art golden gear coin, 16x16 pixels, gold outer ring
with notches, dark center hole, shiny highlight,
game collectible, transparent PNG
```

#### CO-02: Exit Gate (Closed)

```
pixel art steampunk exit door closed, 48x64 pixels,
heavy metal door with arched top, brass frame with rivets,
two dark wooden panels, red locked indicator in center,
brown and brass, transparent PNG
```

#### CO-03: Exit Gate (Open/Active)

```
pixel art steampunk exit door open, 48x64 pixels,
same arched frame with rivets, panels glowing golden,
bright yellow light emanating, green active indicator,
golden glow effect, game goal sprite, transparent PNG
```

---

### 6. TILESET — Ground & Platforms

#### TI-01: Ground Tile

```
pixel art seamless ground tile, 32x32 pixels,
riveted metal plate texture, dark brown-brass,
brick-like metal panels with grid lines,
four corner rivets, industrial steampunk floor,
tileable seamless, no visible borders
```

#### TI-02: Floating Platform

```
pixel art floating platform tile, 32x32 pixels,
metal grate or gear-tooth platform, brass colored,
small gaps showing through, riveted edges,
tileable horizontally, transparent
```

---

### 7. UI ELEMENTS

#### UI-01: Heart (Full)

```
pixel art heart icon full health, 22x22 pixels,
red heart shape with white highlight,
game UI icon, transparent PNG
```

#### UI-02: Heart (Empty)

```
pixel art heart icon empty health, 22x22 pixels,
same shape but dark gray, depleted health,
game UI icon, transparent PNG
```

#### UI-03: Pause Button Icon

```
pixel art pause button icon, 32x32 pixels,
two vertical white bars in a circle on dark gray,
game menu icon, transparent PNG
```

#### UI-04: Dust Particle

```
pixel art dust particle, 4x4 pixels,
white square pixel with slight transparency,
generic particle for steam and dust effects, transparent
```

---

### 8. EFFECTS & PARTICLES

#### FX-01: Steam Puff

```
pixel art steam puff effect, 16x16 pixels,
white-gray cloud puff, expanding circular shape,
semi-transparent, steampunk steam vent, transparent PNG
```

#### FX-02: Gear Shatter (Enemy Death)

```
pixel art gear shatter effect, 16x16 pixels,
gold and brown gear fragments scattered,
explosion debris, game death effect, transparent PNG
```

---

### 9. DISTRICT-SPECIFIC VARIATIONS

Use these color/setting modifiers in your prompts for variation:

| District  | Modify Prompt With |
|-----------|-------------------|
| Bellows   | warm brass and copper tones, amber glow, forge atmosphere, brown and orange palette |
| Clockwork | cool blue steel, clockwork precision, blue-purple shadows, teal energy glow |
| The Core  | molten red and orange, charred black metal, fire glow, hellish industrial |

---

### 10. SPRITE SHEET GENERATION (DREAMINA ADVANCED)

Dreamina can generate multi-panel sprite sheets natively. Use these prompts for character animation frames in a single generation:

#### PL-01-SS: Player Sprite Sheet (4 frames)

```
pixel art sprite sheet, 4 frames of steampunk adventurer,
frame 1 idle standing, frame 2 running step 1,
frame 3 running step 2, frame 4 jumping pose,
brown aviator cap with goggles, red scarf, brown jacket,
brass gear on chest, arranged in 2x2 grid,
each frame 32x32, transparent PNG
```

#### EN-01-SS: Walker Automaton Sprite Sheet (4 frames)

```
pixel art sprite sheet, 4 frames of steampunk automaton,
walking cycle animation, brass dome head, glowing eyes,
mechanical arms and legs, arranged in 1x4 horizontal strip,
each frame 32x32, transparent PNG
```

#### CO-01-SS: Gear Coin Spin Sheet (4 frames)

```
pixel art sprite sheet, gear coin spin animation,
4 frames showing rotation, golden gear with notches,
arranged in 1x4 horizontal strip, each frame 16x16,
transparent PNG
```

> **How to split sprite sheets**: Download the PNG, open in Aseprite or similar editor, slice into individual frames using the grid tool, then export each frame separately as `{texture-key}-frame-{n}.png`.

---

## 🗺️ COMPLETE ASSET INVENTORY

| # | Texture Key | Game Usage | Size | Source |
|---|------------|-----------|------|--------|
| 1 | `player-idle` | Player standing | 32x32 | PL-01 |
| 2 | `player-run` | Player running | 32x32 | PL-01 (recolor) |
| 3 | `player-jump` | Player jumping | 32x32 | PL-02 |
| 4 | `player-fall` | Player falling | 32x32 | PL-02 (modify) |
| 5 | `player-hurt` | Player damaged | 32x32 | PL-03 |
| 6 | `enemy-walk` | Walker patrol | 28x28 | EN-01 |
| 7 | `enemy-death` | Walker destroyed | 28x28 | EN-02 |
| 8 | `drone` | PatrolDrone flying | 28x28 | EN-03 |
| 9 | `drone-death` | Drone destroyed | 28x28 | EN-04 |
| 10 | `laser-beam` | Drone laser | 8x80 | EN-05 |
| 11 | `laser-cone` | Laser warning cone | 16x12 | EN-05 var |
| 12 | `laser-warning` | Laser dot marker | 8x8 | EN-05 var |
| 13 | `saw-blade` | BuriedSaw / SurpriseSaw | 28x28 | OB-01 |
| 14 | `spike-trap` | SpikeTrap obstacle | 48x32 | OB-02 |
| 15 | `coin` | Gear collectible | 16x16 | CO-01 |
| 16 | `gate-closed` | Exit gate locked | 48x64 | CO-02 |
| 17 | `gate-open` | Exit gate active | 48x64 | CO-03 |
| 18 | `ground-tile` | Floor platforms | 32x32 | TI-01 |
| 19 | `heart-full` | HUD health full | 22x22 | UI-01 |
| 20 | `heart-empty` | HUD health empty | 22x22 | UI-02 |
| 21 | `particle` | Dust/steam effects | 4x4 | UI-04 |
| 22 | `btn-left` | Touch left button | 64x64 | UI var |
| 23 | `btn-right` | Touch right button | 64x64 | UI var |
| 24 | `btn-jump` | Touch jump button | 64x64 | UI var |
| 25 | `btn-pause` | Pause overlay button | 32x32 | UI-03 |
| 26 | `icon-play` | Resume icon | 32x32 | UI var |
| 27 | `bg-level1` | Background Bellows | 800x450 | BG-01 |
| 28 | `bg-level2` | Background Clockwork | 800x450 | BG-02 |
| 29 | `bg-level3` | Background Core | 800x450 | BG-03 |

---

## ⚡ Quick Priority Order

| Priority | Assets | Why First |
|----------|--------|-----------|
| **P0** | `ground-tile`, `bg-level1`, `bg-level2`, `bg-level3` | Every level needs these immediately |
| **P0** | `player-idle`, `player-run`, `player-jump`, `player-fall` | Core gameplay |
| **P0** | `coin`, `gate-closed`, `gate-open` | Level objectives |
| **P1** | `saw-blade`, `spike-trap` | Obstacles in many levels |
| **P1** | `enemy-walk`, `drone`, `laser-beam` | Enemies in many levels |
| **P1** | `heart-full`, `heart-empty` | HUD essential |
| **P2** | `player-hurt`, `enemy-death`, `drone-death` | Death states |
| **P2** | `particle`, `btn-pause`, `icon-play` | Effects & UI |
| **P3** | Touch buttons, `laser-cone`, `laser-warning` | Mobile & details |

---

## 🔧 Dreamina-Specific Tips

1. **Access Dreamina**: Go to **dreamina.capcut.com → AI Image → Seedream 5.0** model. Select the "Pixel Art" style preset if available.
2. **Transparency is native**: Dreamina's pixel art model outputs transparent PNGs directly — no background removal needed.
3. **4 variations workflow**: Dreamina generates 4 variants per prompt. Pick the best one, then re-roll or tweak the prompt for the next asset. Rarely need more than 1-2 rounds.
4. **Resize with nearest-neighbor**: Dreamina often outputs slightly larger than needed. Resize down to exact pixel dimensions using **nearest-neighbor** interpolation in Aseprite, Photoshop, or ImageMagick (`-sample` flag).
5. **If a background appears**: Use Dreamina's built-in background remover (Canvas → Remove Background) as a fallback — but with Seedream 5.0's pixel art model this is rarely needed.
6. **Sprite sheets**: Dreamina can generate multi-frame sprite sheets natively (see Section 10). After generation, split into individual frames using Aseprite's grid tool or slice manually.
7. **Image-to-image consistency**: For consistent character designs across poses, generate the first pose, then use Dreamina's Image-to-Image feature with low strength to create the next pose while preserving the character.
8. **Keep prompts short**: Seedream 5.0 does better with concise, specific prompts. Avoid over-describing — the model understands game asset conventions.
9. **Renaming convention**: After generating, rename files to match `{texture-key}.png` (see inventory table). For sprite sheet frames, use `{texture-key}-frame-{n}.png`.
10. **Palette fine-tuning**: If colors need adjustment, import into Aseprite and apply indexed color mode with a custom palette — Dreamina outputs rich color by default.

---

*Last updated: June 2026 — For Dreamina AI (Seedream 5.0) text-to-image generation*
