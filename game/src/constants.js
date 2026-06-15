const GAME_WIDTH = 800;
const GAME_HEIGHT = 450;
const TILE_SIZE = 32;

// Player physics (from Construct 2 spec)
const PLAYER_SPEED = 200;
const PLAYER_JUMP = -480;       // First jump (shorter than before)
const PLAYER_DOUBLE_JUMP = -400; // Second jump (double jump)
const PLAYER_GRAVITY = 1200;
const PLAYER_MAX_FALL = 800;
const PLAYER_BOUNCE_STOMP = -400;

// Gameplay
const INITIAL_LIVES = 3;
const INVINCIBLE_DURATION = 2000; // ms
const COIN_SCORE = 10;
const STOMP_SCORE = 20;
const ENEMY_DEATH_DELAY = 600; // ms

// Touch controls
const BTN_ALPHA = 0.5;
const BTN_SIZE = 64;

// ── Design / HUD Constants ──
const HUD = {
    PANEL_ALPHA: 0.35,
    PANEL_COLOR: 0x000000,
    CORNER_RADIUS: 6,
    HEART_SIZE: 22,
    HEART_SPACING: 30,
    HEART_OFFSET_X: 14,
    HEART_OFFSET_Y: 48,      // below safe top zone
    SCORE_OFFSET_X: 16,
    SCORE_OFFSET_Y: 48,
    LEVEL_OFFSET_Y: 12,
    COIN_OFFSET_Y: 68,
    PROGRESS_BAR_Y: 82,
    PROGRESS_BAR_W: 160,
    PROGRESS_BAR_H: 4,
    FONT_FAMILY: 'monospace',
    FONT_TITLE: '18px',
    FONT_SCORE: '20px',
    FONT_COIN: '13px',
    FONT_LEVEL: '14px',
    TIMER_OFFSET_X: 250,      // x = 800 - 250 = 550 from right
    TIMER_OFFSET_Y: 48,
    FONT_TIMER: '16px',
    TIMER_THROTTLE_MS: 100,
};

// Timer display thresholds (shared between GameScene and HUDScene)
const TIME_THRESHOLDS = [
    { fast: 20, good: 35, ok: 60 },   // Bellows (Easy, districtIdx=0)
    { fast: 30, good: 50, ok: 80 },   // Clockwork (Medium, districtIdx=1)
    { fast: 40, good: 65, ok: 100 }   // The Core (Hard, districtIdx=2)
];

// ── Spectacle / Polish Constants ──
const SPECTACLE = {
    SCORE_POP_SCALE: 1.3,
    SCORE_POP_DURATION: 200,
    HEART_PULSE_SCALE: 1.15,
    HEART_PULSE_DURATION: 400,
    COIN_ICON_SIZE: 12,
    INTRO_BANNER_DURATION: 2000,
    INTRO_BANNER_HOLD: 800,
    COMBO_MAX_BREAK_TIME: 2000,  // ms before combo resets
    VIGNETTE_ALPHA: 0.25
};

// ── Merchant / Shop Constants ──
const MERCHANT_LEVEL_INDICES = [3, 8, 13]; // L4, L9, L14 (0-indexed)
const MERCHANT_INTERACT_DIST = 80;
const GEAR_STOMP_DROP_CHANCE = 0.3;
const BOSS_LEVEL_INDICES = [4, 9, 14];     // L5, L10, L15 (0-indexed)
const SHOP_ITEMS = [
    { id: 'extra_life', label: 'Extra Life',     price: 30, currency: 'coin', type: 'consumable', max: 9 },
    { id: 'shield',     label: 'Shield Flask',   price: 50, currency: 'coin', type: 'consumable', max: 5 },
    { id: 'gear_boots', label: 'Gear Boots',     price: 2,  currency: 'gear', type: 'upgrade',    max: 1 },
    { id: 'wrench',     label: 'Wrench Strike',  price: 3,  currency: 'gear', type: 'upgrade',    max: 1 },
    { id: 'coat',       label: 'Cogsworth Coat', price: 5,  currency: 'gear', type: 'upgrade',    max: 1 },
    { id: 'boss_intel', label: 'Boss Intel',     price: 1,  currency: 'gear', type: 'utility',    max: 1 },
];

// ── Shield key binding (S key) ──
const SHIELD_KEY = 'S';

// ── Wrench Throw ──
const WRENCH_SPEED = 400;
const WRENCH_GRAVITY = 200;
const WRENCH_MAX_RANGE = 350;
const WRENCH_COOLDOWN = 1200;
const WRENCH_MAX_ACTIVE = 2;
const WRENCH_KEY = 'X';
const WRENCH_BOUNCE_SCORE = 20;

// ── Drone Weak Point ──
const DRONE_WEAK_POINT_HEIGHT = 8;

// ── Drone Aggressive Sensor ──
const DRONE_SENSOR_WIDTH = 200;
const DRONE_SENSOR_HEIGHT = 120;
const DRONE_AGGRO_SPEED_MULT = 1.5;
const DRONE_RECOVERY_DURATION = 1500;

// ── Drone Debug ──
const DEBUG_DRONE = false;
