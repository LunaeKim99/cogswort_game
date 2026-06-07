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
6. **Direction**: All sprites face **right**. The game flips them for left movement — no need to generate mirrored versions.

> 💡 Dreamina's Seedream 5.0 has a dedicated pixel art model that understands game sprites, transparency, and pixel-perfect output natively. No need for "no anti-aliasing" or "flat colors" constraints.

> 💡 For animated entities, consider generating a **sprite sheet** from Section 11 instead of individual single-frame prompts — one sprite sheet can provide all animation frames in a single generation. Split the sheet later using Aseprite or a similar editor.

---

## 🎨 MASTER PROMPT TEMPLATE

```
pixel art [SUBJECT], game sprite, steampunk style,
[DETAILS], [PALETTE WORDS], transparent PNG
```

> Keep prompts short and direct — Seedream 5.0 understands pixel art conventions natively.
>
> 🎯 **Direction**: All character and enemy sprites face **RIGHT** by default. The game engine flips them horizontally for left-facing movement via `setFlipX()`. Do NOT generate left-facing variants.

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
pixel art game character, steampunk adventurer idle, facing right, 32x32 pixels,
brown aviator cap with brass goggles showing blue lenses,
flowing red scarf, brown leather jacket, brass gear on chest,
utility belt with gold buckle, brown pants and boots,
mechanical backpack, warm brass and copper, red scarf accent,
transparent PNG
```

#### PL-02: Jump Pose

```
pixel art game character, steampunk adventurer mid-jump pose, facing right,
32x32 pixels, arms up, legs tucked, brown aviator cap,
blue-lensed goggles, red scarf flowing upward, brown jacket,
gear on chest, brown boots tucked under, transparent PNG
```

#### PL-03: Hurt/Death Pose

```
pixel art game character, steampunk adventurer hurt pose, facing right,
32x32 pixels, staggering backward, red tint overlay,
hat tilted, red scarf disturbed, damage frame,
transparent PNG
```

---

### 3. ENEMIES

#### EN-01: Walker Automaton (Idle/Patrol)

```
pixel art game enemy, steampunk mechanical automaton walking, facing right,
32x32 pixels, brass dome head with glowing amber eyes,
goggles, ventilator grill mouth, copper torso with gear,
piston arms ending in pincer claws, riveted metal legs,
dark brass and copper, transparent PNG
```

#### EN-02: Walker Death

```
pixel art game enemy, destroyed steampunk automaton, facing right, 32x32 pixels,
same body with X eyes made of red pixels, dark overlay,
head tilted, gear chest cracked, defeated pose, transparent PNG
```

#### EN-03: PatrolDrone (Flying)

```
pixel art game enemy, steampunk flying drone, facing right, 28x28 pixels,
brass propeller on top, copper oval body,
central glowing amber mechanical eye, small steam pipes,
bronze and brass colors with amber glow, transparent PNG
```

#### EN-04: PatrolDrone Death

```
pixel art game enemy, destroyed steampunk drone, facing right, 28x28 pixels,
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

### 10. FRAME-BY-FRAME PROMPTS

*For precise control over each animation frame, generate individual frames separately using these prompts. After generating all frames, combine them into a sprite sheet using Aseprite's grid tool. Each frame is a standalone PNG that can be assembled into the final spritesheet.*

#### PLAYER (32×32px) — 10 frames total

##### PL-01-F0 (Idle Frame 1): Standing upright, both legs together, arms relaxed at sides, facing forward, aviator cap with brass goggles (blue lenses), red scarf hanging straight, brown leather jacket with brass gear on chest, utility belt with gold buckle, brown boots, mechanical backpack, neutral expression, warm brass and copper colors
```
pixel art game character frame, steampunk adventurer standing idle, facing right,
pose frame 1 of 2, upright standing, both legs together,
arms at sides, brown aviator cap with brass goggles showing blue lenses,
flowing red scarf hanging straight, brown leather jacket,
brass gear on chest, utility belt, brown pants and boots,
mechanical backpack, neutral expression, 32x32 pixels, transparent PNG
```

##### PL-01-F1 (Idle Frame 2): Same character but breathing in — chest slightly expanded (1-2px), shoulders raised 1px, scarf slightly lifted, subtle animation frame
```
pixel art game character frame, steampunk adventurer idle breathing, facing right,
pose frame 2 of 2, chest expanded slightly, shoulders raised 1px,
scarf slightly lifted, subtle breathing animation,
brown aviator cap with goggles, blue lenses, red scarf,
brown leather jacket with gear, 32x32 pixels, transparent PNG
```

##### PL-01-RUN-F0 (Run Frame 1): Running pose, left leg forward, right leg trailing, right arm forward, left arm back, scarf flowing behind, dynamic action pose
```
pixel art game character frame, steampunk adventurer running, facing right,
pose frame 1 of 4 walk cycle, left leg forward striding,
right leg trailing behind, right arm swinging forward,
left arm back, red scarf flowing behind, brown aviator cap with goggles,
32x32 pixels, transparent PNG
```

##### PL-01-RUN-F1 (Run Frame 2): Running pose, legs together mid-stride, both arms at sides, scarf flowing horizontally, momentum frame
```
pixel art game character frame, steampunk adventurer running, facing right,
pose frame 2 of 4 walk cycle, legs together mid-stride,
both arms at sides, scarf flowing horizontal with momentum,
brown cap with brass goggles, brown jacket, gear on chest,
32x32 pixels, transparent PNG
```

##### PL-01-RUN-F2 (Run Frame 3): Running pose, right leg forward, left leg trailing, left arm forward, right arm back, scarf flowing, opposite of frame 1
```
pixel art game character frame, steampunk adventurer running, facing right,
pose frame 3 of 4 walk cycle, right leg forward striding,
left leg trailing behind, left arm swinging forward,
right arm back, red scarf flowing, brown cap with goggles,
32x32 pixels, transparent PNG
```

##### PL-01-RUN-F3 (Run Frame 4): Same as frame 2, legs together mid-stride, transition frame back to frame 1
```
pixel art game character frame, steampunk adventurer running, facing right,
pose frame 4 of 4 walk cycle, legs together mid-stride,
arms at sides, scarf flowing, transition pose,
brown cap with brass goggles, brown jacket, 32x32 pixels,
transparent PNG
```

##### PL-02-F0 (Jump Frame 1): Jumping upward, arms raised above head, knees bent and legs tucked, scarf flying up, dynamic upward motion
```
pixel art game character frame, steampunk adventurer jumping up, facing right,
pose frame 1 of 2, arms raised above head, knees bent,
legs tucked under body, red scarf flying upward,
brown aviator cap with brass goggles, blue lenses, brown jacket,
32x32 pixels, transparent PNG
```

##### PL-02-F1 (Jump Frame 2): Jumping at apex, arms slightly lowered from peak, legs still tucked, scarf still floating up, reaching highest point
```
pixel art game character frame, steampunk adventurer jump apex, facing right,
pose frame 2 of 2, arms slightly lowered from peak,
legs still tucked, scarf floating upward, reaching highest point,
brown cap with goggles, red scarf, gear on chest,
32x32 pixels, transparent PNG
```

##### PL-03-F0 (Fall Frame): Falling downward, arms spread out for balance, legs spread apart, scarf blowing upward, descent pose
```
pixel art game character frame, steampunk adventurer falling, facing right,
falling downward pose, arms spread out for balance,
legs spread apart, red scarf blowing upward, descent animation,
brown cap with goggles, brown jacket, 32x32 pixels, transparent PNG
```

##### PL-04-F0 (Hurt/Death Frame): Staggering backward, knocked back pose, red tint overlay, hat tilted sideways, scarf disturbed, damage state
```
pixel art game character frame, steampunk adventurer hurt, facing right,
staggering backward knocked back pose, red tint overlay,
hat tilted sideways, red scarf disturbed, damage state,
brown cap with goggles, brown jacket with gear,
32x32 pixels, transparent PNG
```

#### WALKER AUTOMATON (32×32px) — 6 frames total

##### EN-01-WALK-F0 (Walk Frame 1): Walking, left leg forward (leg drawn at x-offset -1), right arm forward (arm at x+1), brass dome head with glowing amber eyes, goggles, ventilator grill mouth, copper torso with gear in chest
```
pixel art game enemy frame, steampunk mechanical walker robot walking, facing right,
walk cycle frame 1 of 4, left leg forward, right arm forward,
brass dome head with glowing amber eyes, brass goggles,
ventilator grill mouth, copper torso with gear in chest,
piston arms with pincer claws, riveted metal legs,
dark brass and copper colors, 32x32 pixels, transparent PNG
```

##### EN-01-WALK-F1 (Walk Frame 2): Walking, neutral standing pose, both legs together, both arms at sides, transition frame
```
pixel art game enemy frame, steampunk mechanical walker robot walking, facing right,
walk cycle frame 2 of 4, neutral standing, legs together,
arms at sides, brass dome head with glowing amber eyes,
copper torso with gear, piston arms, riveted legs,
32x32 pixels, transparent PNG
```

##### EN-01-WALK-F2 (Walk Frame 3): Walking, right leg forward (leg at x+1), left arm forward (arm at x-1), opposite of frame 1
```
pixel art game enemy frame, steampunk mechanical walker robot walking, facing right,
walk cycle frame 3 of 4, right leg forward, left arm forward,
brass dome head with amber eyes, copper torso with gear,
piston arms with pincer claws, riveted legs,
32x32 pixels, transparent PNG
```

##### EN-01-WALK-F3 (Walk Frame 4): Same as frame 2, neutral standing, transition frame
```
pixel art game enemy frame, steampunk mechanical walker robot walking, facing right,
walk cycle frame 4 of 4, neutral standing, legs together,
arms at sides, brass dome head, amber eyes,
copper torso with chest gear, 32x32 pixels, transparent PNG
```

##### EN-02-F0 (Death Frame 1): Walker destroyed, X eyes made of red pixels, head tilted, dark overlay, gear chest cracked, starting to collapse
```
pixel art game enemy frame, destroyed steampunk walker robot, facing right,
death frame 1 of 2, X eyes made of red pixels, head tilted,
gear chest cracked, dark overlay, starting to collapse,
32x32 pixels, transparent PNG
```

##### EN-02-F1 (Death Frame 2): Fully collapsed, fallen apart, gears scattered, smoke wisps, destroyed state
```
pixel art game enemy frame, destroyed steampunk walker robot, facing right,
death frame 2 of 2, fully collapsed fallen apart, gears scattered,
smoke wisps rising, destroyed defeated state, dark overlay,
32x32 pixels, transparent PNG
```

#### PATROLDRONE (28×28px) — 3 frames total

##### EN-03-F0 (Fly Frame 1): Flying, propeller blades visible (normal spin), copper oval body, central amber glowing eye, steam pipes on sides, bottom fin
```
pixel art game enemy frame, steampunk flying drone flying, facing right,
fly frame 1 of 2, propeller blades visible normal speed,
copper oval body, central glowing amber mechanical eye,
small steam pipes on sides, bottom fin, hovering pose,
bronze and brass colors, 28x28 pixels, transparent PNG
```

##### EN-03-F1 (Fly Frame 2): Flying, propeller fully blurred (fast spin blur effect), same body, fast motion effect
```
pixel art game enemy frame, steampunk flying drone flying, facing right,
fly frame 2 of 2, propeller fully blurred fast spin motion blur,
copper oval body, glowing amber eye, steam pipes,
motion effect, 28x28 pixels, transparent PNG
```

##### EN-04-F0 (Death Frame): Drone destroyed, red X eye, dark overlay, propeller stopped, smoke implied, falling
```
pixel art game enemy frame, destroyed steampunk drone, facing right,
death frame, red X eye, dark overlay, propeller stopped,
smoke implied, falling destroyed state, 28x28 pixels,
transparent PNG
```

#### GEAR COIN (16×16px) — 4 frames total

##### CO-01-F0 (Spin Frame 1): Golden gear coin, notches at top, bottom, left, and right positions, shiny highlight at top-left, dark center hole
```
pixel art game collectible frame, golden gear coin spin animation,
frame 1 of 4, notches at top bottom left and right positions,
shiny highlight at top-left, dark center hole,
gold outer ring, 16x16 pixels, transparent PNG
```

##### CO-01-F1 (Spin Frame 2): Same coin but rotated 22.5 degrees clockwise, notches shifted to diagonal positions, highlight moved
```
pixel art game collectible frame, golden gear coin spin animation,
frame 2 of 4, rotated 22.5 degrees clockwise,
notches shifted to diagonal positions, highlight moved,
gold outer ring, dark center, 16x16 pixels, transparent PNG
```

##### CO-01-F2 (Spin Frame 3): Same coin rotated 45 degrees, notches at corners, highlight shifted further
```
pixel art game collectible frame, golden gear coin spin animation,
frame 3 of 4, rotated 45 degrees clockwise,
notches at four corner positions, highlight shifted,
gold gear coin, 16x16 pixels, transparent PNG
```

##### CO-01-F3 (Spin Frame 4): Same coin rotated 67.5 degrees, notches at diagonal positions again, completing rotation cycle
```
pixel art game collectible frame, golden gear coin spin animation,
frame 4 of 4, rotated 67.5 degrees clockwise,
notches at diagonal positions, completing spin cycle,
gold gear coin, 16x16 pixels, transparent PNG
```

#### SAW BLADE (28×28px) — 4 frames total

##### OB-01-F0 (Spin Frame 1): Circular saw blade with 8 teeth, teeth pointing at 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°, red center eye
```
pixel art game obstacle frame, circular saw blade spinning,
frame 1 of 4 rotation, 8 jagged teeth at 0° 45° 90° 135°
180° 225° 270° 315°, dark gray metal center,
red glowing center eye, steel and iron, 28x28 pixels, transparent PNG
```

##### OB-01-F1 (Spin Frame 2): Same saw blade rotated 11.25°, teeth shifted, same red center
```
pixel art game obstacle frame, circular saw blade spinning,
frame 2 of 4 rotation, teeth shifted 11.25 degrees clockwise,
dark gray metal, red glowing center eye,
steel and iron colors, 28x28 pixels, transparent PNG
```

##### OB-01-F2 (Spin Frame 3): Same saw blade rotated 22.5°, teeth shifted further
```
pixel art game obstacle frame, circular saw blade spinning,
frame 3 of 4 rotation, teeth shifted 22.5 degrees clockwise,
dark gray center, red glowing eye,
metal saw blade, 28x28 pixels, transparent PNG
```

##### OB-01-F3 (Spin Frame 4): Same saw blade rotated 33.75°, completing rotation cycle
```
pixel art game obstacle frame, circular saw blade spinning,
frame 4 of 4 rotation, teeth shifted 33.75 degrees,
completing spin cycle, dark metal,
red center eye, 28x28 pixels, transparent PNG
```

#### SPIKE TRAP (48×32px) — 2 frames total

##### OB-02-F0 (Retracted): Spike trap base plate only, spikes hidden below, flat metal plate with rivets, safe state
```
pixel art game obstacle frame, spike trap retracted,
frame 1 of 2, wide metal base plate with rivets only,
spikes hidden below surface, flat safe state,
dark red and gray colors, 48x32 pixels, transparent PNG
```

##### OB-02-F1 (Extended): Spike trap activated, 5 serrated spikes extended upward, sharp red tips extended from base, danger state
```
pixel art game obstacle frame, spike trap extended activated,
frame 2 of 2, 5 sharp serrated spikes extended upward,
red tips emerging from metal base plate with rivets,
industrial hazard danger state, 48x32 pixels, transparent PNG
```

#### STEAM EFFECT (16×16px) — 3 frames total

##### FX-01-F0 (Steam Small): Small steam puff, just starting to expand, compact white-gray cloud, beginning of vent animation
```
pixel art effect frame, steam puff small expanding,
frame 1 of 3 vent animation, small compact white-gray cloud,
just starting to expand, semi-transparent,
16x16 pixels, transparent PNG
```

##### FX-01-F1 (Steam Medium): Medium steam puff, partially expanded, cloud growing outward, mid-animation
```
pixel art effect frame, steam puff medium expanding,
frame 2 of 3 vent animation, partially expanded cloud,
growing outward, white-gray color, semi-transparent,
16x16 pixels, transparent PNG
```

##### FX-01-F2 (Steam Large): Large steam puff, fully expanded, cloud dissipating, end of vent animation, fading out
```
pixel art effect frame, steam puff large dissipating,
frame 3 of 3 vent animation, fully expanded cloud,
starting to dissipate and fade, white-gray,
semi-transparent, 16x16 pixels, transparent PNG
```

#### GEAR SHATTER (16×16px) — 2 frames total

##### FX-02-F0 (Shatter Start): Gear fragments just starting to fly apart, small gold and brown pieces, explosion beginning
```
pixel art effect frame, gear shatter debris flying,
frame 1 of 2 explosion, gold and brown gear fragments
just starting to fly apart from center, small pieces,
16x16 pixels, transparent PNG
```

##### FX-02-F1 (Shatter Spread): Gear fragments fully scattered, pieces flying outward in all directions, explosion complete
```
pixel art effect frame, gear shatter debris scattered,
frame 2 of 2 explosion, gold and brown gear fragments
fully scattered outward in all directions,
explosion debris complete, 16x16 pixels, transparent PNG
```

> *After generating all frames, open Aseprite, create a new sprite sheet at the correct pixel dimensions, import each frame, arrange them in order, and export as a single PNG spritesheet. Then register animations in Phaser using `this.anims.createFromAseprite()` or manual frame references.*

---

### 11. SPRITE SHEET GENERATION

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

#### EN-02-SS: Walker Death Sheet (2 frames)

```
pixel art sprite sheet, 2 frames of steampunk automaton dying,
frame 1: robot cracking, frame 2: collapsed with X eyes,
brass dome head, copper body, arranged in 1x2 horizontal strip,
each frame 32x32, transparent PNG
```

#### EN-03-SS: PatrolDrone Fly Sheet (2 frames)

```
pixel art sprite sheet, 2 frames of steampunk flying drone,
frame 1: propeller normal, frame 2: propeller blurred (fast spin),
copper oval body, glowing amber eye, arranged in 1x2 horizontal strip,
each frame 28x28, transparent PNG
```

#### EN-04-SS: PatrolDrone Death Sheet (1-2 frames)

```
pixel art sprite sheet, steampunk drone destroyed,
red X eye, dark overlay, propeller stopped, smoke implied,
1-2 frames, 28x28, transparent PNG
```

#### PL-02-SS: Player Jump Sheet (2 frames)

```
pixel art sprite sheet, steampunk adventurer jump animation,
2 frames: frame 1 jumping up (arms up), frame 2 reaching apex,
brown cap with goggles, red scarf, 32x32 each frame,
transparent PNG
```

#### PL-03-SS: Player Hurt Sheet (1-2 frames)

```
pixel art sprite sheet, steampunk adventurer hurt animation,
1-2 frames of staggering back, red tint, hat tilted,
32x32 each frame, transparent PNG
```

#### OB-01-SS: Saw Blade Spin Sheet (4 frames)

```
pixel art sprite sheet, circular saw blade spin animation,
4 frames of rotation animation, metal gear with jagged teeth,
red center eye, each frame 28x28, arranged in 1x4 horizontal strip,
transparent PNG
```

#### OB-02-SS: Spike Trap Sheet (2 frames)

```
pixel art sprite sheet, spike trap extend animation,
2 frames: frame 1 retracted (hidden), frame 2 extended (spikes up),
metal base plate with rivets, serrated spikes, 48x32 each frame,
transparent PNG
```

#### FX-03-SS: Steam Vent Sheet (3 frames)

```
pixel art sprite sheet, steam puff animation,
3 frames of expanding white-gray cloud puff,
growing circular shape, semi-transparent,
each frame 16x16, arranged in 1x3 horizontal strip,
transparent PNG
```

#### FX-04-SS: Gear Shatter Sheet (2 frames)

```
pixel art sprite sheet, gear shatter debris animation,
2 frames of gold and brown gear fragments flying apart,
explosion particles, each frame 16x16, arranged horizontally,
transparent PNG
```

### Sprite Sheet Summary

| Code | Description | Frames | Layout | Frame Size |
|------|------------|--------|--------|------------|
| PL-01-SS | Player Idle/Run/Jump | 4 | 2×2 grid | 32×32 |
| PL-02-SS | Player Jump Animation | 2 | 1×2 strip | 32×32 |
| PL-03-SS | Player Hurt Animation | 1–2 | 1×2 strip | 32×32 |
| EN-01-SS | Walker Walk Cycle | 4 | 1×4 strip | 32×32 |
| EN-02-SS | Walker Death Animation | 2 | 1×2 strip | 32×32 |
| EN-03-SS | PatrolDrone Fly Animation | 2 | 1×2 strip | 28×28 |
| EN-04-SS | PatrolDrone Death Animation | 1–2 | 1×2 strip | 28×28 |
| CO-01-SS | Gear Coin Spin | 4 | 1×4 strip | 16×16 |
| OB-01-SS | Saw Blade Spin | 4 | 1×4 strip | 28×28 |
| OB-02-SS | Spike Trap Extend | 2 | 1×2 strip | 48×32 |
| FX-03-SS | Steam Vent Puff | 3 | 1×3 strip | 16×16 |
| FX-04-SS | Gear Shatter Debris | 2 | 1×2 strip | 16×16 |

> **How to split sprite sheets**: Download the PNG, open in Aseprite or similar editor, slice into individual frames using the grid tool, then export each frame separately as `{texture-key}-frame-{n}.png`.

---

## 🗺️ COMPLETE ASSET INVENTORY

| # | Texture Key | Game Usage | Size | Source |
|---|------------|-----------|------|--------|
| 1 | `player-idle` | Player standing | 32x32 | PL-01 / PL-01-SS |
| 2 | `player-run` | Player running | 32x32 | PL-01 (recolor) / PL-01-SS |
| 3 | `player-jump` | Player jumping | 32x32 | PL-02 / PL-02-SS |
| 4 | `player-fall` | Player falling | 32x32 | PL-02 (modify) / PL-02-SS |
| 5 | `player-hurt` | Player damaged | 32x32 | PL-03 / PL-03-SS |
| 6 | `enemy-walk` | Walker patrol | 28x28 | EN-01 / EN-01-SS |
| 7 | `enemy-death` | Walker destroyed | 28x28 | EN-02 / EN-02-SS |
| 8 | `drone` | PatrolDrone flying | 28x28 | EN-03 / EN-03-SS |
| 9 | `drone-death` | Drone destroyed | 28x28 | EN-04 / EN-04-SS |
| 10 | `laser-beam` | Drone laser | 8x80 | EN-05 |
| 11 | `laser-cone` | Laser warning cone | 16x12 | EN-05 var |
| 12 | `laser-warning` | Laser dot marker | 8x8 | EN-05 var |
| 13 | `saw-blade` | BuriedSaw / SurpriseSaw | 28x28 | OB-01 / OB-01-SS |
| 14 | `spike-trap` | SpikeTrap obstacle | 48x32 | OB-02 / OB-02-SS |
| 15 | `coin` | Gear collectible | 16x16 | CO-01 / CO-01-SS |
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
6. **Sprite sheets**: Dreamina can generate multi-frame sprite sheets natively (see Section 11). After generation, split into individual frames using Aseprite's grid tool or slice manually.
7. **Image-to-image consistency**: For consistent character designs across poses, generate the first pose, then use Dreamina's Image-to-Image feature with low strength to create the next pose while preserving the character.
8. **Keep prompts short**: Seedream 5.0 does better with concise, specific prompts. Avoid over-describing — the model understands game asset conventions.
9. **Renaming convention**: After generating, rename files to match `{texture-key}.png` (see inventory table). For sprite sheet frames, use `{texture-key}-frame-{n}.png`.
10. **Palette fine-tuning**: If colors need adjustment, import into Aseprite and apply indexed color mode with a custom palette — Dreamina outputs rich color by default.

---

*Last updated: June 2026 — For Dreamina AI (Seedream 5.0) text-to-image generation*
