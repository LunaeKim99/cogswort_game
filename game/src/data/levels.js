// Helper: ground Y position
const GROUND_Y = GAME_HEIGHT - TILE_SIZE; // 418
const GROUND_H = TILE_SIZE; // 32

// ============================================================
// Level configurations with progressive difficulty
// ============================================================
const levels = [
    // ============================================================
    // Level 1 - "Bellows District" (Easy onboarding)
    // ============================================================
    {
        name: 'Bellows District',
        width: 4800,
        height: GAME_HEIGHT,
        playerStart: { x: 64, y: 350 },
        // Gate position at end of level (collect all coins to activate)
        gateX: 4640,
        platforms: [
            // Ground sections (safe wide platforms)
            { x: 0,     y: GROUND_Y, width: 960,  height: GROUND_H },  // Starting area
            { x: 1056,  y: GROUND_Y, width: 800,  height: GROUND_H },  // after 96px gap
            { x: 1920,  y: GROUND_Y, width: 640,  height: GROUND_H },  // after 64px gap
            { x: 2656,  y: GROUND_Y, width: 960,  height: GROUND_H },  // after 96px gap
            { x: 3680,  y: GROUND_Y, width: 1120, height: GROUND_H },  // leading to exit, after 64px gap

            // Floating platforms (introduction to platforming)
            { x: 400,   y: 300, width: 160, height: GROUND_H },  // wide, safe
            { x: 1400,  y: 320, width: 128, height: GROUND_H },
            { x: 2100,  y: 280, width: 128, height: GROUND_H },
            { x: 3000,  y: 310, width: 160, height: GROUND_H },
            { x: 4000,  y: 290, width: 128, height: GROUND_H }
        ],
        enemies: [
            // Ground 1 (0-960)
            { x: 250,  y: 404, patrolLeft: 180,  patrolRight: 400  },
            { x: 600,  y: 404, patrolLeft: 480,  patrolRight: 880  },
            // Ground 1 edge (max x:960) — patrol dalam batas platform
            { x: 900,  y: 404, patrolLeft: 830,  patrolRight: 940  },
            // Ground 2 (1056-1856)
            { x: 1500, y: 404, patrolLeft: 1350, patrolRight: 1700 },
            // Ground 4 (2656-3616) — patrolLeft di atas x:2656
            { x: 2800, y: 404, patrolLeft: 2690, patrolRight: 3000 },
            // Ground 5 (3680-4800)
            { x: 4000, y: 404, patrolLeft: 3800, patrolRight: 4200 }
        ],
        coins: [
            { x: 200,  y: 386 },
            { x: 400,  y: 268 },
            { x: 700,  y: 386 },
            { x: 1200, y: 386 },
            { x: 1500, y: 288 },
            { x: 2000, y: 386 },
            { x: 2200, y: 248 },
            { x: 2800, y: 386 },
            { x: 3100, y: 278 },
            { x: 4000, y: 386 }
        ],
        background: 'bg-level1',
        bgColor: '#2d1b2e'
    },

    // ============================================================
    // Level 2 - "Clockwork Quarter" (Medium difficulty)
    // ============================================================
    {
        name: 'Clockwork Quarter',
        width: 5600,
        height: GAME_HEIGHT,
        playerStart: { x: 64, y: 350 },
        gateX: 5440,
        platforms: [
            // Ground sections (more/bigger gaps)
            { x: 0,     y: GROUND_Y, width: 800,  height: GROUND_H },
            { x: 928,   y: GROUND_Y, width: 544,  height: GROUND_H },  // after 128px gap
            { x: 1568,  y: GROUND_Y, width: 640,  height: GROUND_H },  // after 96px gap
            { x: 2368,  y: GROUND_Y, width: 480,  height: GROUND_H },  // after 160px gap
            { x: 2976,  y: GROUND_Y, width: 704,  height: GROUND_H },  // after 128px gap
            { x: 3776,  y: GROUND_Y, width: 544,  height: GROUND_H },  // after 96px gap
            { x: 4448,  y: GROUND_Y, width: 1152, height: GROUND_H },  // after 128px gap

            // Floating platforms (narrower, more varied heights)
            { x: 500,   y: 310, width: 128, height: GROUND_H },
            { x: 850,   y: 250, width: 96,  height: GROUND_H },  // stepping-stone
            { x: 1200,  y: 320, width: 128, height: GROUND_H },
            { x: 1700,  y: 280, width: 96,  height: GROUND_H },
            { x: 2100,  y: 240, width: 128, height: GROUND_H },
            { x: 2500,  y: 300, width: 96,  height: GROUND_H },
            { x: 3100,  y: 270, width: 128, height: GROUND_H },
            { x: 3600,  y: 310, width: 96,  height: GROUND_H },
            { x: 4000,  y: 250, width: 128, height: GROUND_H },
            { x: 4500,  y: 290, width: 96,  height: GROUND_H }
        ],
        enemies: [
            // Ground 1 (0-800)
            { x: 500,  y: 404, patrolLeft: 300,  patrolRight: 700  },
            // Ground 2 (928-1472)
            { x: 1100, y: 404, patrolLeft: 950,  patrolRight: 1300 },
            // Ground 3 (1568-2208)
            { x: 1800, y: 404, patrolLeft: 1650, patrolRight: 2000 },
            // Ground 4 (2368-2848) — patrolLeft ≥ 2368
            { x: 2500, y: 404, patrolLeft: 2390, patrolRight: 2750 },
            // Ground 5 (2976-3680)
            { x: 3200, y: 404, patrolLeft: 3000, patrolRight: 3500 },
            // Ground 6 (3776-4320) — patrolRight ≤ 4320
            { x: 4200, y: 404, patrolLeft: 4000, patrolRight: 4300 }
        ],
        movingPlatforms: [
            // Horizontal: nyebrang gap lebar (ground 2208-2368 = 160px gap)
            { x: 2300,  y: 340, width: 96,  patrolLeft: 2220, patrolRight: 2500, speed: 55 },
            // Vertical: naik ke floating platform atas (coin x:2600, y:268)
            { x: 2620,  y: 340, width: 64,  axis: 'y',  patrolUp: 240, patrolDown: 380, speed: 40 },
            // Vertical: naik ke coin x:4100, y:218 (tembok tinggi)
            { x: 4080,  y: 340, width: 64,  axis: 'y',  patrolUp: 210, patrolDown: 380, speed: 45 }
        ],
        obstacles: [
            { x: 3400,  y: 290, axis: 'x', patrolLeft: 3300, patrolRight: 3550, speed: 70 }
        ],
        coins: [
            { x: 200,  y: 386 },
            { x: 500,  y: 278 },
            { x: 800,  y: 386 },
            { x: 1100, y: 298 },   // on ground section starting at x:928
            { x: 1300, y: 386 },
            { x: 1760, y: 258 },   // on floating platform at x:1700
            // Coin di atas moving platform horizontal
            { x: 2300, y: 308 },   // on moving platform (y:340 - 32)
            { x: 2200, y: 208 },
            { x: 2600, y: 268 },
            // Coin di atas moving platform vertikal
            { x: 2620, y: 208 },   // saat platform di puncak (240-32)
            { x: 3200, y: 238 },
            { x: 3800, y: 386 },
            { x: 4100, y: 218 },
            { x: 4700, y: 386 }
        ],
        background: 'bg-level2',
        bgColor: '#1a1a3e'
    },

    // ============================================================
    // Level 3 - "The Core" (Hardest - narrow platforms, big gaps)
    // ============================================================
    {
        name: 'The Core',
        width: 6400,
        height: GAME_HEIGHT,
        playerStart: { x: 64, y: 350 },
        gateX: 6240,
        platforms: [
            // Ground sections (short, many gaps)
            { x: 0,     y: GROUND_Y, width: 640,  height: GROUND_H },
            { x: 800,   y: GROUND_Y, width: 384,  height: GROUND_H },  // after 160px gap
            { x: 1376,  y: GROUND_Y, width: 480,  height: GROUND_H },  // after 192px gap
            { x: 1984,  y: GROUND_Y, width: 320,  height: GROUND_H },  // after 128px gap
            { x: 2496,  y: GROUND_Y, width: 480,  height: GROUND_H },  // after 192px gap
            { x: 3136,  y: GROUND_Y, width: 384,  height: GROUND_H },  // after 160px gap
            { x: 3712,  y: GROUND_Y, width: 480,  height: GROUND_H },  // after 192px gap
            { x: 4352,  y: GROUND_Y, width: 384,  height: GROUND_H },  // after 160px gap
            { x: 4864,  y: GROUND_Y, width: 640,  height: GROUND_H },  // after 128px gap
            { x: 5664,  y: GROUND_Y, width: 736,  height: GROUND_H },  // after 160px gap

            // Floating platforms (very narrow for precision)
            { x: 300,   y: 320, width: 96,  height: GROUND_H },
            { x: 600,   y: 260, width: 96,  height: GROUND_H },
            { x: 900,   y: 310, width: 64,  height: GROUND_H },
            { x: 1200,  y: 250, width: 96,  height: GROUND_H },
            { x: 1500,  y: 300, width: 64,  height: GROUND_H },
            { x: 1800,  y: 240, width: 96,  height: GROUND_H },
            { x: 2100,  y: 310, width: 64,  height: GROUND_H },
            { x: 2500,  y: 260, width: 96,  height: GROUND_H },
            { x: 2900,  y: 300, width: 64,  height: GROUND_H },
            { x: 3200,  y: 240, width: 96,  height: GROUND_H },
            { x: 3600,  y: 310, width: 64,  height: GROUND_H },
            { x: 4000,  y: 250, width: 96,  height: GROUND_H },
            { x: 4400,  y: 290, width: 64,  height: GROUND_H },
            { x: 5000,  y: 260, width: 96,  height: GROUND_H },
            { x: 5400,  y: 300, width: 64,  height: GROUND_H }
        ],
        enemies: [
            // Ground 1 (0-640)
            { x: 400,  y: 404, patrolLeft: 200,  patrolRight: 600  },
            // Ground 2 (800-1184)
            { x: 900,  y: 404, patrolLeft: 750,  patrolRight: 1050 },
            // Ground 3 (1376-1856)
            { x: 1500, y: 404, patrolLeft: 1350, patrolRight: 1700 },
            // Ground 4 (1984-2304)
            { x: 2100, y: 404, patrolLeft: 1950, patrolRight: 2250 },
            // Ground 5 (2496-2976)
            { x: 2700, y: 404, patrolLeft: 2500, patrolRight: 2900 },
            // Ground 6 (3136-3520)
            { x: 3300, y: 404, patrolLeft: 3100, patrolRight: 3500 },
            // Ground 7 (3712-4192) — patrolRight ≤ 4192
            { x: 3900, y: 404, patrolLeft: 3700, patrolRight: 4170 },
            // Ground 9 (4864-5504)
            { x: 5000, y: 404, patrolLeft: 4800, patrolRight: 5300 }
        ],
        movingPlatforms: [
            // Horizontal: nyebrang floating platform gap 1500-1800
            { x: 1600,  y: 280, width: 80,  patrolLeft: 1500, patrolRight: 1800, speed: 55 },
            // Horizontal: nyebrang gap di area tengah
            { x: 3500,  y: 260, width: 80,  patrolLeft: 3400, patrolRight: 3700, speed: 60 },
            // Vertical: naik tembok tinggi ke floating x:2900, y:300
            { x: 2880,  y: 340, width: 64,  axis: 'y',  patrolUp: 220, patrolDown: 380, speed: 40 },
            // Vertical: naik ke coin atas x:4000, y:218
            { x: 3980,  y: 340, width: 64,  axis: 'y',  patrolUp: 210, patrolDown: 380, speed: 45 },
            // Horizontal: nyebrang gap terakhir (5504-5664)
            { x: 5580,  y: 310, width: 96,  patrolLeft: 5480, patrolRight: 5800, speed: 50 },
            // Vertical: naik tembok tertinggi menjelang gate
            { x: 6000,  y: 340, width: 64,  axis: 'y',  patrolUp: 200, patrolDown: 380, speed: 55 }
        ],
        obstacles: [
            { x: 1000,  y: 280, axis: 'x', patrolLeft: 900,  patrolRight: 1200, speed: 75 },
            { x: 2800,  y: 250, axis: 'x', patrolLeft: 2700, patrolRight: 3000, speed: 80 },
            { x: 4600,  y: 300, axis: 'x', patrolLeft: 4500, patrolRight: 4800, speed: 65 }
        ],
        coins: [
            { x: 150,  y: 386 },
            { x: 300,  y: 288 },
            { x: 600,  y: 228 },
            { x: 900,  y: 278 },
            { x: 1200, y: 218 },
            { x: 1500, y: 268 },
            // Coin di atas moving platform horizontal x:1600
            { x: 1600, y: 248 },
            { x: 1800, y: 208 },
            // Coin di atas moving platform vertikal x:2880
            { x: 2880, y: 188 },   // puncak 220-32
            { x: 2100, y: 278 },
            { x: 2500, y: 228 },
            { x: 2900, y: 268 },
            // Coin di atas moving platform horizontal x:3500
            { x: 3500, y: 228 },
            { x: 3300, y: 208 },
            { x: 3700, y: 386 },
            // Coin di atas moving platform vertikal x:3980
            { x: 3980, y: 178 },   // puncak 210-32
            { x: 4000, y: 218 },
            { x: 4500, y: 386 },
            // Coin di atas moving platform horizontal x:5580
            { x: 5580, y: 278 },
            // Coin di atas moving platform vertikal terakhir x:6000
            { x: 6000, y: 168 },   // puncak 200-32
            { x: 5100, y: 228 }
        ],
        background: 'bg-level3',
        bgColor: '#1a0a1e'
    }
];
