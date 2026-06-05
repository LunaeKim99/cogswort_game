// Helper: ground Y position
const GROUND_Y = GAME_HEIGHT - TILE_SIZE; // 418
const GROUND_H = TILE_SIZE; // 32

// Helper: district definitions
const DISTRICTS = [
    { name: 'Bellows District',  bg: 'bg-level1', color: '#2d1b2e' },
    { name: 'Clockwork Quarter', bg: 'bg-level2', color: '#1a1a3e' },
    { name: 'The Core',          bg: 'bg-level3', color: '#1a0a1e' }
];

// Helper: generate level meta
function levelMeta(districtIdx, subName, width, idx) {
    const d = DISTRICTS[districtIdx];
    return {
        name: d.name + ' - ' + subName,
        district: d.name,
        subName: subName,
        districtLevel: idx + 1,
        width: width,
        height: GAME_HEIGHT,
        playerStart: { x: 64, y: 350 },
        gateX: width - 160,
        background: d.bg,
        bgColor: d.color
    };
}

// ── Entity helpers ──
function walker(x, patrolLeft, patrolRight) {
    return { type: 'walker', x, y: GROUND_Y - 14, patrolLeft, patrolRight };
}
function drone(x, y, patrolLeft, patrolRight) {
    return { type: 'drone', x, y, patrolLeft, patrolRight };
}
function spikeTrap(x, extendDelay, retractDelay) {
    return { type: 'spike-trap', x, y: GROUND_Y - 12, extendDelay, retractDelay };
}
function spikeTrapFloat(x, y, extendDelay, retractDelay) {
    return { type: 'spike-trap', x, y, extendDelay, retractDelay, inverted: false };
}
function buriedSaw(x, triggerDistance) {
    return { type: 'buried-saw', x, y: GROUND_Y, triggerDistance };
}
function surpriseSaw(x, y, patrolLeft, patrolRight, speed) {
    return { type: 'surprise-saw', x, y, patrolLeft, patrolRight, speed: speed || 60, triggerDistance: 140 };
}
function oldSaw(x, y, patrolLeft, patrolRight, speed) {
    return { type: 'saw', x, y, axis: 'x', patrolLeft, patrolRight, speed: speed || 65 };
}
function movingPlatform(x, y, width, cfg) {
    return { x, y, width, height: GROUND_H, ...cfg };
}
function coin(x, y) {
    return { x, y };
}
function groundSection(x, width) {
    return { x, y: GROUND_Y, width, height: GROUND_H };
}
function floatPlat(x, y, width) {
    return { x, y, width, height: GROUND_H };
}

// ============================================================
// LEVEL CONFIGURATIONS — 15 levels across 3 districts
// ============================================================
const levels = [];

// ── DISTRICT 1: BELLOWS DISTRICT (Levels 1-5) ──
// Easy → Medium-Easy progression

// ════════════════════════════════════════════════════════════
// Level 1 — "Tutorial" (width: 2400)
// ════════════════════════════════════════════════════════════
levels.push({
    ...levelMeta(0, 'Tutorial', 2400, 0),
    platforms: [
        groundSection(0,    800),   // safe starting area
        groundSection(900,  600),   // 100px gap (easy)
        groundSection(1600, 800),   // 100px gap
        // Floating platform (introduction)
        floatPlat(400,  320, 160),
        floatPlat(1200, 300, 128),
        floatPlat(2000, 310, 128)
    ],
    enemies: [
        walker(300,  200,  500),
        walker(1000, 950, 1300)
    ],
    movingPlatforms: [],
    obstacles: [],
    coins: [
        coin(150,  386),
        coin(400,  288),  // on floating platform
        coin(600,  386),
        coin(1000, 386),
        coin(1200, 268),  // on floating platform
        coin(1400, 386),
        coin(1700, 386),
        coin(2000, 278),
        coin(2100, 386),
        coin(2200, 386)
    ]
});

// ════════════════════════════════════════════════════════════
// Level 2 — "The Smelting Floors" (width: 3000)
// ════════════════════════════════════════════════════════════
levels.push({
    ...levelMeta(0, 'The Smelting Floors', 3000, 1),
    platforms: [
        groundSection(0,    700),
        groundSection(800,  500),
        groundSection(1400, 600),
        groundSection(2080, 480),
        groundSection(2624, 376),
        // Floating platforms
        floatPlat(500,  310, 128),
        floatPlat(1100, 290, 128),
        floatPlat(1800, 320, 96),
        floatPlat(2300, 280, 128)
    ],
    enemies: [
        walker(300,  180,  550),
        walker(900,  830, 1150),
        walker(1500, 1450, 1800),
        drone(1700, 240, 1600, 1850)
    ],
    movingPlatforms: [],
    obstacles: [
        spikeTrap(2000, 2000, 2500)   // introduced spike trap
    ],
    coins: [
        coin(200,  386),
        coin(500,  278),  // floating
        coin(900,  386),
        coin(1100, 258),  // floating
        coin(1500, 386),
        coin(1800, 288),  // floating
        coin(2100, 386),
        coin(2300, 248),  // floating
        coin(2700, 386),
        coin(2800, 386)
    ]
});

// ════════════════════════════════════════════════════════════
// Level 3 — "Gearworks Alley" (width: 3600)
// ════════════════════════════════════════════════════════════
levels.push({
    ...levelMeta(0, 'Gearworks Alley', 3600, 2),
    platforms: [
        groundSection(0,    640),
        groundSection(768,  480),
        groundSection(1376, 384),
        groundSection(1888, 480),
        groundSection(2496, 384),
        groundSection(3008, 592),
        // Floating platforms
        floatPlat(350,  320, 128),
        floatPlat(700,  250, 96),
        floatPlat(1100, 300, 96),
        floatPlat(1600, 260, 128),
        floatPlat(2200, 310, 96),
        floatPlat(2700, 250, 128),
        floatPlat(3200, 290, 96)
    ],
    enemies: [
        walker(250,  150,  500),
        walker(800,  790, 1100),
        walker(1450, 1400, 1720),
        drone(1200, 200, 1100, 1350),
        walker(2000, 1950, 2250)
    ],
    movingPlatforms: [],
    obstacles: [
        spikeTrap(1750, 1800, 2200),
        spikeTrap(2800, 1500, 2000)
    ],
    coins: [
        coin(200,  386),
        coin(350,  288),
        coin(800,  386),
        coin(1100, 268),
        coin(1450, 386),
        coin(1600, 228),
        coin(2000, 386),
        coin(2200, 278),
        coin(2700, 218),
        coin(3100, 386)
    ]
});

// ════════════════════════════════════════════════════════════
// Level 4 — "Boiler Pass" (width: 4200)
// ════════════════════════════════════════════════════════════
levels.push({
    ...levelMeta(0, 'Boiler Pass', 4200, 3),
    platforms: [
        groundSection(0,    576),
        groundSection(704,  384),
        groundSection(1216, 320),
        groundSection(1664, 448),
        groundSection(2240, 384),
        groundSection(2752, 320),
        groundSection(3200, 384),
        groundSection(3712, 488),
        // Floating platforms
        floatPlat(300,  320, 96),
        floatPlat(600,  250, 96),
        floatPlat(1000, 300, 64),
        floatPlat(1500, 240, 96),
        floatPlat(2000, 300, 64),
        floatPlat(2500, 240, 96),
        floatPlat(3000, 290, 64),
        floatPlat(3500, 250, 96),
        floatPlat(3900, 300, 64)
    ],
    enemies: [
        walker(250,  150,  480),
        walker(750,  730,  980),
        walker(1300, 1240, 1550),
        drone(1800, 220, 1700, 1950),
        walker(2300, 2260, 2550),
        drone(2800, 200, 2700, 2950)
    ],
    movingPlatforms: [],
    obstacles: [
        spikeTrap(1100, 1800, 2000),
        spikeTrap(2100, 2000, 2200),
        buriedSaw(3300, 140)
    ],
    coins: [
        coin(150,  386),
        coin(300,  288),
        coin(600,  218),
        coin(1000, 268),
        coin(1500, 208),
        coin(2000, 268),
        coin(2500, 208),
        coin(3000, 258),
        coin(3500, 218),
        coin(3800, 386)
    ]
});

// ════════════════════════════════════════════════════════════
// Level 5 — "The Great Bell" (width: 4800) - District climax
// ════════════════════════════════════════════════════════════
levels.push({
    ...levelMeta(0, 'The Great Bell', 4800, 4),
    platforms: [
        groundSection(0,    576),
        groundSection(704,  384),
        groundSection(1216, 320),
        groundSection(1664, 384),
        groundSection(2176, 320),
        groundSection(2624, 384),
        groundSection(3136, 320),
        groundSection(3584, 384),
        groundSection(4096, 704),
        // Floating platforms
        floatPlat(300,  320, 96),
        floatPlat(600,  240, 64),
        floatPlat(1000, 300, 64),
        floatPlat(1400, 230, 96),
        floatPlat(1900, 290, 64),
        floatPlat(2400, 230, 96),
        floatPlat(2900, 280, 64),
        floatPlat(3300, 220, 96),
        floatPlat(3800, 270, 64),
        floatPlat(4200, 230, 96)
    ],
    enemies: [
        walker(250,  150,  480),
        walker(750,  730,  980),
        drone(1000, 220, 900, 1150),
        walker(1300, 1240, 1550),
        walker(1700, 1680, 2000),
        drone(2200, 200, 2100, 2400),
        walker(2700, 2640, 2950),
        drone(3300, 180, 3200, 3500)
    ],
    movingPlatforms: [
        movingPlatform(4500, 300, 80, { patrolLeft: 4400, patrolRight: 4600, speed: 50 })
    ],
    obstacles: [
        spikeTrap(900, 2000, 2200),
        buriedSaw(1800, 140),
        spikeTrap(2500, 1800, 2000),
        buriedSaw(3500, 150)
    ],
    coins: [
        coin(150,  386),
        coin(300,  288),
        coin(600,  208),
        coin(1000, 268),
        coin(1400, 198),
        coin(1900, 258),
        coin(2400, 198),
        coin(2900, 248),
        coin(3300, 188),
        coin(3800, 238)
    ]
});

// ── DISTRICT 2: CLOCKWORK QUARTER (Levels 6-10) ──
// Medium → Medium-Hard progression

// ════════════════════════════════════════════════════════════
// Level 6 — "Tutorial" (width: 3200)
// ════════════════════════════════════════════════════════════
levels.push({
    ...levelMeta(1, 'Tutorial', 3200, 5),
    platforms: [
        groundSection(0,    576),
        groundSection(704,  384),
        groundSection(1216, 320),
        groundSection(1664, 384),
        groundSection(2176, 320),
        groundSection(2624, 576),
        // Floating platforms
        floatPlat(300,  310, 96),
        floatPlat(600,  240, 64),
        floatPlat(1000, 290, 64),
        floatPlat(1500, 230, 96),
        floatPlat(2100, 280, 64),
        floatPlat(2500, 230, 96),
        floatPlat(2800, 270, 64)
    ],
    enemies: [
        walker(250,  150,  480),
        walker(750,  730,  980),
        drone(1000, 200, 900, 1100),
        walker(1300, 1240, 1550),
        walker(1700, 1680, 2000),
        drone(2300, 180, 2200, 2500)
    ],
    movingPlatforms: [
        movingPlatform(1500, 280, 80, { patrolLeft: 1420, patrolRight: 1580, speed: 45 })
    ],
    obstacles: [
        spikeTrap(900, 2000, 2200),
        buriedSaw(2000, 150),
        spikeTrap(2700, 1800, 2000)
    ],
    coins: [
        coin(150,  386),
        coin(300,  278),
        coin(600,  208),
        coin(1000, 258),
        coin(1300, 386),
        coin(1500, 248),
        coin(1700, 386),
        coin(2100, 248),
        coin(2500, 198),
        coin(2700, 386)
    ]
});

// ════════════════════════════════════════════════════════════
// Level 7 — "Pendulum Path" (width: 4000)
// ════════════════════════════════════════════════════════════
levels.push({
    ...levelMeta(1, 'Pendulum Path', 4000, 6),
    platforms: [
        groundSection(0,    512),
        groundSection(640,  320),
        groundSection(1088, 384),
        groundSection(1600, 320),
        groundSection(2048, 256),
        groundSection(2432, 320),
        groundSection(2880, 256),
        groundSection(3264, 384),
        groundSection(3776, 224),
        // Floating platforms
        floatPlat(300,  300, 80),
        floatPlat(550,  230, 64),
        floatPlat(900,  280, 64),
        floatPlat(1400, 220, 80),
        floatPlat(1900, 270, 64),
        floatPlat(2300, 210, 64),
        floatPlat(2700, 260, 64),
        floatPlat(3100, 200, 80),
        floatPlat(3600, 260, 64)
    ],
    enemies: [
        walker(200,  100,  400),
        walker(700,  670,  950),
        drone(900,  200, 800, 1000),
        walker(1150, 1110, 1450),
        drone(1400, 180, 1300, 1550),
        walker(1700, 1650, 1950),
        walker(2100, 2070, 2350),
        drone(2500, 170, 2400, 2700)
    ],
    movingPlatforms: [
        movingPlatform(1600, 280, 80, { patrolLeft: 1520, patrolRight: 1680, speed: 50 }),
        movingPlatform(2400, 260, 80, { patrolLeft: 2320, patrolRight: 2480, speed: 55 })
    ],
    obstacles: [
        spikeTrap(800, 2000, 2200),
        buriedSaw(1800, 140),
        surpriseSaw(3000, 280, 2900, 3100, 60),
        spikeTrap(3500, 1800, 2000)
    ],
    coins: [
        coin(150,  386),
        coin(300,  268),
        coin(550,  198),
        coin(900,  248),
        coin(1400, 188),
        coin(1700, 386),
        coin(1900, 238),
        coin(2300, 178),
        coin(2700, 228),
        coin(3100, 168)
    ]
});

// ════════════════════════════════════════════════════════════
// Level 8 — "Spring-Loaded Corridor" (width: 4800)
// ════════════════════════════════════════════════════════════
levels.push({
    ...levelMeta(1, 'Spring-Loaded Corridor', 4800, 7),
    platforms: [
        groundSection(0,    448),
        groundSection(576,  320),
        groundSection(1024, 256),
        groundSection(1408, 320),
        groundSection(1856, 256),
        groundSection(2240, 320),
        groundSection(2688, 256),
        groundSection(3072, 320),
        groundSection(3520, 256),
        groundSection(3904, 320),
        groundSection(4352, 448),
        // Floating platforms
        floatPlat(250,  300, 80),
        floatPlat(550,  220, 64),
        floatPlat(850,  280, 64),
        floatPlat(1200, 210, 80),
        floatPlat(1650, 260, 64),
        floatPlat(2000, 200, 64),
        floatPlat(2500, 260, 64),
        floatPlat(2900, 190, 80),
        floatPlat(3350, 250, 64),
        floatPlat(3700, 200, 64),
        floatPlat(4100, 260, 64)
    ],
    enemies: [
        walker(200,  100,  380),
        walker(600,  590,  850),
        drone(850,  190, 750,  950),
        walker(1100, 1050, 1300),
        drone(1300, 170, 1200, 1450),
        walker(1500, 1450, 1750),
        walker(1900, 1870, 2120),
        drone(2100, 160, 2000, 2300),
        walker(2300, 2260, 2550),
        drone(2800, 180, 2700, 3000)
    ],
    movingPlatforms: [
        movingPlatform(1600, 280, 80, { patrolLeft: 1520, patrolRight: 1680, speed: 50 }),
        movingPlatform(2600, 260, 80, { patrolLeft: 2520, patrolRight: 2680, speed: 55 }),
        movingPlatform(3500, 270, 80, { patrolLeft: 3420, patrolRight: 3580, speed: 50 })
    ],
    obstacles: [
        spikeTrap(700, 1800, 2200),
        buriedSaw(1400, 140),
        surpriseSaw(2000, 270, 1900, 2100, 55),
        spikeTrap(2700, 2000, 2000),
        buriedSaw(3400, 130),
        surpriseSaw(3800, 250, 3700, 3900, 60)
    ],
    coins: [
        coin(150,  386),
        coin(250,  268),
        coin(550,  188),
        coin(850,  248),
        coin(1200, 178),
        coin(1650, 228),
        coin(2000, 168),
        coin(2500, 228),
        coin(2900, 158),
        coin(3350, 218)
    ]
});

// ════════════════════════════════════════════════════════════
// Level 9 — "Ratchet Ridge" (width: 5200)
// ════════════════════════════════════════════════════════════
levels.push({
    ...levelMeta(1, 'Ratchet Ridge', 5200, 8),
    platforms: [
        groundSection(0,    384),
        groundSection(512,  256),
        groundSection(896,  320),
        groundSection(1344, 256),
        groundSection(1728, 320),
        groundSection(2176, 256),
        groundSection(2560, 320),
        groundSection(3008, 256),
        groundSection(3392, 320),
        groundSection(3840, 256),
        groundSection(4224, 320),
        groundSection(4672, 256),
        groundSection(5056, 144),
        // Floating platforms (narrow)
        floatPlat(250,  290, 64),
        floatPlat(500,  210, 48),
        floatPlat(800,  270, 64),
        floatPlat(1150, 200, 48),
        floatPlat(1550, 260, 64),
        floatPlat(1950, 190, 48),
        floatPlat(2350, 250, 64),
        floatPlat(2800, 190, 48),
        floatPlat(3200, 240, 64),
        floatPlat(3650, 190, 48),
        floatPlat(4050, 250, 64),
        floatPlat(4500, 200, 48)
    ],
    enemies: [
        walker(200,  100,  350),
        walker(550,  530,  780),
        drone(700,  200, 600,  800),
        walker(950,  910, 1250),
        drone(1100, 180, 1000, 1250),
        walker(1400, 1360, 1650),
        drone(1600, 170, 1500, 1750),
        walker(1800, 1760, 2050),
        walker(2200, 2180, 2450),
        drone(2600, 160, 2500, 2800),
        walker(3100, 3050, 3300)
    ],
    movingPlatforms: [
        movingPlatform(1200, 280, 80, { patrolLeft: 1120, patrolRight: 1280, speed: 55 }),
        movingPlatform(2200, 250, 80, { patrolLeft: 2120, patrolRight: 2280, speed: 60 }),
        movingPlatform(3200, 270, 80, { patrolLeft: 3120, patrolRight: 3280, speed: 55 }),
        movingPlatform(4200, 260, 80, { patrolLeft: 4120, patrolRight: 4280, speed: 60 })
    ],
    obstacles: [
        spikeTrap(650, 1800, 2000),
        buriedSaw(1250, 130),
        surpriseSaw(1800, 260, 1700, 1900, 60),
        spikeTrap(2500, 1800, 2000),
        buriedSaw(3000, 120),
        surpriseSaw(3700, 240, 3600, 3800, 65),
        spikeTrap(4300, 1600, 1800),
        buriedSaw(4800, 130)
    ],
    coins: [
        coin(150,  386),
        coin(250,  258),
        coin(500,  178),
        coin(800,  238),
        coin(1150, 168),
        coin(1550, 228),
        coin(1950, 158),
        coin(2350, 218),
        coin(2800, 158),
        coin(3200, 208)
    ]
});

// ════════════════════════════════════════════════════════════
// Level 10 — "The Mainspring" (width: 5600) - District climax
// ════════════════════════════════════════════════════════════
levels.push({
    ...levelMeta(1, 'The Mainspring', 5600, 9),
    platforms: [
        groundSection(0,    384),
        groundSection(512,  256),
        groundSection(896,  224),
        groundSection(1248, 256),
        groundSection(1632, 224),
        groundSection(1984, 256),
        groundSection(2368, 224),
        groundSection(2720, 256),
        groundSection(3104, 224),
        groundSection(3456, 256),
        groundSection(3840, 224),
        groundSection(4192, 256),
        groundSection(4576, 224),
        groundSection(4928, 256),
        groundSection(5312, 288),
        // Floating platforms
        floatPlat(200,  290, 64),
        floatPlat(450,  200, 48),
        floatPlat(700,  260, 64),
        floatPlat(1050, 190, 48),
        floatPlat(1450, 250, 64),
        floatPlat(1800, 180, 48),
        floatPlat(2200, 240, 64),
        floatPlat(2550, 180, 48),
        floatPlat(2950, 240, 64),
        floatPlat(3300, 170, 48),
        floatPlat(3700, 230, 64),
        floatPlat(4050, 180, 48),
        floatPlat(4400, 240, 64),
        floatPlat(4750, 190, 48),
        floatPlat(5150, 250, 64)
    ],
    enemies: [
        walker(150,  80,  320),
        drone(350,  200, 250,  450),
        walker(550,  530,  780),
        drone(700,  180, 600,  800),
        walker(950,  910, 1200),
        drone(1100, 170, 1000, 1200),
        walker(1300, 1260, 1550),
        walker(1650, 1610, 1880),
        drone(1800, 160, 1700, 1950),
        walker(2050, 2010, 2280),
        drone(2200, 170, 2100, 2350),
        walker(2500, 2450, 2700),
        walker(2850, 2800, 3050),
        drone(3000, 180, 2900, 3150),
        walker(3500, 3450, 3750),
        drone(3800, 160, 3700, 3950)
    ],
    movingPlatforms: [
        movingPlatform(1000, 280, 80, { patrolLeft: 920, patrolRight: 1080, speed: 55 }),
        movingPlatform(2000, 250, 80, { patrolLeft: 1920, patrolRight: 2080, speed: 60 }),
        movingPlatform(3000, 260, 80, { patrolLeft: 2920, patrolRight: 3080, speed: 55 }),
        movingPlatform(4000, 240, 80, { patrolLeft: 3920, patrolRight: 4080, speed: 60 }),
        movingPlatform(5000, 270, 80, { patrolLeft: 4920, patrolRight: 5080, speed: 55 })
    ],
    obstacles: [
        spikeTrap(500, 1800, 2000),
        buriedSaw(1100, 130),
        surpriseSaw(1700, 260, 1600, 1800, 60),
        spikeTrap(2300, 1800, 2000),
        buriedSaw(2800, 120),
        surpriseSaw(3400, 240, 3300, 3500, 65),
        spikeTrap(4000, 1600, 1800),
        buriedSaw(4600, 130),
        surpriseSaw(5100, 250, 5000, 5200, 60)
    ],
    coins: [
        coin(150,  386),
        coin(200,  258),
        coin(450,  168),
        coin(700,  228),
        coin(1050, 158),
        coin(1450, 218),
        coin(1800, 148),
        coin(2200, 208),
        coin(2550, 148),
        coin(2950, 208)
    ]
});

// ── DISTRICT 3: THE CORE (Levels 11-15) ──
// Hard → Very Hard progression

// ════════════════════════════════════════════════════════════
// Level 11 — "Tutorial" (width: 3600)
// ════════════════════════════════════════════════════════════
levels.push({
    ...levelMeta(2, 'Tutorial', 3600, 10),
    platforms: [
        groundSection(0,    384),
        groundSection(512,  256),
        groundSection(896,  224),
        groundSection(1248, 256),
        groundSection(1632, 224),
        groundSection(1984, 256),
        groundSection(2368, 224),
        groundSection(2720, 256),
        groundSection(3104, 496),
        // Floating platforms
        floatPlat(200,  280, 64),
        floatPlat(500,  200, 48),
        floatPlat(750,  260, 64),
        floatPlat(1100, 190, 48),
        floatPlat(1500, 250, 64),
        floatPlat(1800, 180, 48),
        floatPlat(2200, 240, 64),
        floatPlat(2600, 190, 48),
        floatPlat(2900, 250, 64)
    ],
    enemies: [
        walker(200,  100,  350),
        drone(400,  200, 300,  500),
        walker(600,  580,  800),
        drone(800,  180, 700,  900),
        walker(1000, 960, 1200),
        drone(1200, 170, 1100, 1300),
        walker(1500, 1460, 1700),
        walker(1850, 1800, 2050),
        drone(2000, 160, 1900, 2150)
    ],
    movingPlatforms: [
        movingPlatform(900, 280, 80, { patrolLeft: 820, patrolRight: 980, speed: 55 }),
        movingPlatform(2000, 260, 80, { patrolLeft: 1920, patrolRight: 2080, speed: 60 }),
        movingPlatform(3000, 270, 80, { patrolLeft: 2920, patrolRight: 3080, speed: 55 })
    ],
    obstacles: [
        spikeTrap(500, 1800, 2000),
        buriedSaw(1200, 130),
        surpriseSaw(1800, 260, 1700, 1900, 60),
        spikeTrap(2500, 1600, 1800),
        buriedSaw(3000, 120)
    ],
    coins: [
        coin(150,  386),
        coin(200,  248),
        coin(500,  168),
        coin(750,  228),
        coin(1100, 158),
        coin(1500, 218),
        coin(1800, 148),
        coin(2200, 208),
        coin(2600, 158),
        coin(2900, 218)
    ]
});

// ════════════════════════════════════════════════════════════
// Level 12 — "Brass Depths" (width: 4800)
// ════════════════════════════════════════════════════════════
levels.push({
    ...levelMeta(2, 'Brass Depths', 4800, 11),
    platforms: [
        groundSection(0,    320),
        groundSection(448,  224),
        groundSection(800,  256),
        groundSection(1184, 224),
        groundSection(1536, 256),
        groundSection(1920, 224),
        groundSection(2272, 256),
        groundSection(2656, 224),
        groundSection(3008, 256),
        groundSection(3392, 224),
        groundSection(3744, 256),
        groundSection(4128, 224),
        groundSection(4480, 320),
        // Floating platforms
        floatPlat(200,  280, 48),
        floatPlat(400,  200, 48),
        floatPlat(650,  250, 48),
        floatPlat(1000, 180, 48),
        floatPlat(1350, 240, 48),
        floatPlat(1700, 170, 48),
        floatPlat(2050, 230, 48),
        floatPlat(2450, 170, 48),
        floatPlat(2850, 230, 48),
        floatPlat(3200, 160, 48),
        floatPlat(3550, 220, 48),
        floatPlat(3950, 170, 48),
        floatPlat(4300, 240, 48)
    ],
    enemies: [
        walker(150,  80,  300),
        drone(300,  190, 200,  400),
        walker(500,  470,  720),
        drone(650,  180, 550,  750),
        walker(850,  820, 1050),
        drone(1000, 170, 900, 1100),
        walker(1250, 1200, 1450),
        drone(1400, 160, 1300, 1500),
        walker(1600, 1560, 1800),
        walker(1950, 1900, 2150),
        drone(2100, 160, 2000, 2250),
        walker(2400, 2350, 2600),
        drone(2700, 180, 2600, 2850)
    ],
    movingPlatforms: [
        movingPlatform(900,  270, 80, { patrolLeft: 820,  patrolRight: 980,  speed: 55 }),
        movingPlatform(1900, 250, 80, { patrolLeft: 1820, patrolRight: 1980, speed: 60 }),
        movingPlatform(2900, 260, 80, { patrolLeft: 2820, patrolRight: 2980, speed: 55 }),
        movingPlatform(3900, 240, 80, { patrolLeft: 3820, patrolRight: 3980, speed: 60 })
    ],
    obstacles: [
        spikeTrap(400, 1600, 1800),
        buriedSaw(1000, 120),
        surpriseSaw(1600, 250, 1500, 1700, 60),
        spikeTrap(2200, 1600, 1800),
        buriedSaw(2800, 120),
        surpriseSaw(3400, 230, 3300, 3500, 65),
        spikeTrap(4000, 1400, 1600),
        buriedSaw(4500, 120)
    ],
    coins: [
        coin(150,  386),
        coin(200,  248),
        coin(400,  168),
        coin(650,  218),
        coin(1000, 148),
        coin(1350, 208),
        coin(1700, 138),
        coin(2050, 198),
        coin(2450, 138),
        coin(2850, 198)
    ]
});

// ════════════════════════════════════════════════════════════
// Level 13 — "Plasma Forge" (width: 5600)
// ════════════════════════════════════════════════════════════
levels.push({
    ...levelMeta(2, 'Plasma Forge', 5600, 12),
    platforms: [
        groundSection(0,    320),
        groundSection(448,  192),
        groundSection(768,  224),
        groundSection(1120, 192),
        groundSection(1440, 224),
        groundSection(1792, 192),
        groundSection(2112, 224),
        groundSection(2464, 192),
        groundSection(2784, 224),
        groundSection(3136, 192),
        groundSection(3456, 224),
        groundSection(3808, 192),
        groundSection(4128, 224),
        groundSection(4480, 192),
        groundSection(4800, 224),
        groundSection(5152, 448),
        // Floating platforms
        floatPlat(200,  270, 48),
        floatPlat(400,  190, 48),
        floatPlat(600,  240, 48),
        floatPlat(900,  170, 48),
        floatPlat(1250, 230, 48),
        floatPlat(1600, 160, 48),
        floatPlat(1950, 220, 48),
        floatPlat(2300, 160, 48),
        floatPlat(2600, 220, 48),
        floatPlat(2950, 150, 48),
        floatPlat(3300, 210, 48),
        floatPlat(3650, 160, 48),
        floatPlat(4000, 220, 48),
        floatPlat(4350, 170, 48),
        floatPlat(4700, 230, 48),
        floatPlat(5000, 190, 48)
    ],
    enemies: [
        walker(150,  80,  300),
        drone(300,  180, 200,  400),
        walker(480,  470,  650),
        drone(600,  170, 500,  700),
        walker(800,  780, 1000),
        drone(950,  160, 850, 1050),
        walker(1150, 1120, 1350),
        drone(1300, 160, 1200, 1400),
        walker(1500, 1460, 1700),
        drone(1650, 150, 1550, 1750),
        walker(1850, 1800, 2050),
        walker(2150, 2100, 2350),
        drone(2300, 160, 2200, 2450),
        walker(2550, 2500, 2750),
        drone(2850, 170, 2750, 3000),
        walker(3200, 3150, 3400),
        drone(3500, 180, 3400, 3650)
    ],
    movingPlatforms: [
        movingPlatform(800,  280, 80, { patrolLeft: 720,  patrolRight: 880,  speed: 55 }),
        movingPlatform(1800, 250, 80, { patrolLeft: 1720, patrolRight: 1880, speed: 60 }),
        movingPlatform(2800, 260, 80, { patrolLeft: 2720, patrolRight: 2880, speed: 55 }),
        movingPlatform(3800, 240, 80, { patrolLeft: 3720, patrolRight: 3880, speed: 60 }),
        movingPlatform(4800, 250, 80, { patrolLeft: 4720, patrolRight: 4880, speed: 55 })
    ],
    obstacles: [
        spikeTrap(350, 1500, 1700),
        buriedSaw(900, 120),
        surpriseSaw(1500, 240, 1400, 1600, 60),
        spikeTrap(2100, 1500, 1700),
        buriedSaw(2700, 110),
        surpriseSaw(3300, 220, 3200, 3400, 65),
        spikeTrap(3900, 1400, 1600),
        buriedSaw(4400, 120),
        surpriseSaw(4900, 230, 4800, 5000, 60),
        spikeTrap(5200, 1400, 1600)
    ],
    coins: [
        coin(150,  386),
        coin(200,  238),
        coin(400,  158),
        coin(600,  208),
        coin(900,  138),
        coin(1250, 198),
        coin(1600, 128),
        coin(1950, 188),
        coin(2300, 128),
        coin(2600, 188)
    ]
});

// ════════════════════════════════════════════════════════════
// Level 14 — "Cogspire" (width: 6000)
// ════════════════════════════════════════════════════════════
levels.push({
    ...levelMeta(2, 'Cogspire', 6000, 13),
    platforms: [
        groundSection(0,    256),
        groundSection(384,  192),
        groundSection(704,  192),
        groundSection(1024, 192),
        groundSection(1344, 192),
        groundSection(1664, 192),
        groundSection(1984, 192),
        groundSection(2304, 192),
        groundSection(2624, 192),
        groundSection(2944, 192),
        groundSection(3264, 192),
        groundSection(3584, 192),
        groundSection(3904, 192),
        groundSection(4224, 192),
        groundSection(4544, 192),
        groundSection(4864, 192),
        groundSection(5184, 192),
        groundSection(5504, 192),
        groundSection(5824, 176),
        // Floating platforms
        floatPlat(150,  260, 48),
        floatPlat(350,  180, 48),
        floatPlat(550,  240, 48),
        floatPlat(850,  160, 48),
        floatPlat(1150, 220, 48),
        floatPlat(1450, 150, 48),
        floatPlat(1750, 210, 48),
        floatPlat(2050, 150, 48),
        floatPlat(2350, 210, 48),
        floatPlat(2650, 140, 48),
        floatPlat(2950, 200, 48),
        floatPlat(3250, 140, 48),
        floatPlat(3550, 200, 48),
        floatPlat(3850, 140, 48),
        floatPlat(4150, 200, 48),
        floatPlat(4450, 150, 48),
        floatPlat(4750, 210, 48),
        floatPlat(5050, 160, 48),
        floatPlat(5350, 220, 48),
        floatPlat(5650, 170, 48)
    ],
    enemies: [
        walker(150,  80,  280),
        drone(300,  180, 200, 400),
        walker(450,  420,  600),
        drone(600,  170, 500, 700),
        walker(780,  750,  920),
        drone(920,  160, 820, 1020),
        walker(1100, 1060, 1250),
        drone(1250, 150, 1150, 1350),
        walker(1420, 1380, 1580),
        drone(1580, 150, 1480, 1680),
        walker(1750, 1700, 1920),
        drone(1920, 160, 1820, 2020),
        walker(2100, 2060, 2250),
        walker(2400, 2350, 2550),
        drone(2550, 160, 2450, 2700),
        walker(2800, 2750, 2950),
        drone(3100, 170, 3000, 3250),
        walker(3400, 3350, 3550),
        drone(3700, 160, 3600, 3850)
    ],
    movingPlatforms: [
        movingPlatform(800,  270, 80, { patrolLeft: 720,  patrolRight: 880,  speed: 55 }),
        movingPlatform(1800, 240, 80, { patrolLeft: 1720, patrolRight: 1880, speed: 60 }),
        movingPlatform(2800, 250, 80, { patrolLeft: 2720, patrolRight: 2880, speed: 55 }),
        movingPlatform(3800, 230, 80, { patrolLeft: 3720, patrolRight: 3880, speed: 60 }),
        movingPlatform(4800, 240, 80, { patrolLeft: 4720, patrolRight: 4880, speed: 55 }),
        movingPlatform(5400, 250, 80, { patrolLeft: 5320, patrolRight: 5480, speed: 60 })
    ],
    obstacles: [
        spikeTrap(300, 1400, 1600),
        buriedSaw(800, 110),
        surpriseSaw(1400, 230, 1300, 1500, 60),
        spikeTrap(2000, 1400, 1600),
        buriedSaw(2600, 110),
        surpriseSaw(3200, 220, 3100, 3300, 65),
        spikeTrap(3800, 1200, 1400),
        buriedSaw(4300, 110),
        surpriseSaw(4800, 220, 4700, 4900, 60),
        spikeTrap(5200, 1200, 1400),
        buriedSaw(5600, 110)
    ],
    coins: [
        coin(150,  386),
        coin(150,  228),
        coin(350,  148),
        coin(550,  208),
        coin(850,  128),
        coin(1150, 188),
        coin(1450, 118),
        coin(1750, 178),
        coin(2050, 118),
        coin(2350, 178)
    ]
});

// ════════════════════════════════════════════════════════════
// Level 15 — "The Last Wind" (width: 6400) - FINAL!
// ════════════════════════════════════════════════════════════
levels.push({
    ...levelMeta(2, 'The Last Wind', 6400, 14),
    platforms: [
        groundSection(0,    256),
        groundSection(384,  160),
        groundSection(672,  160),
        groundSection(960,  160),
        groundSection(1248, 160),
        groundSection(1536, 160),
        groundSection(1824, 160),
        groundSection(2112, 160),
        groundSection(2400, 160),
        groundSection(2688, 160),
        groundSection(2976, 160),
        groundSection(3264, 160),
        groundSection(3552, 160),
        groundSection(3840, 160),
        groundSection(4128, 160),
        groundSection(4416, 160),
        groundSection(4704, 160),
        groundSection(4992, 160),
        groundSection(5280, 160),
        groundSection(5568, 160),
        groundSection(5856, 160),
        groundSection(6144, 256),
        // Floating platforms (very narrow)
        floatPlat(150,  250, 48),
        floatPlat(300,  170, 32),
        floatPlat(500,  230, 48),
        floatPlat(750,  150, 32),
        floatPlat(1000, 210, 48),
        floatPlat(1300, 140, 32),
        floatPlat(1600, 200, 48),
        floatPlat(1900, 130, 32),
        floatPlat(2200, 200, 48),
        floatPlat(2500, 130, 32),
        floatPlat(2800, 190, 48),
        floatPlat(3100, 120, 32),
        floatPlat(3400, 180, 48),
        floatPlat(3700, 120, 32),
        floatPlat(4000, 180, 48),
        floatPlat(4300, 120, 32),
        floatPlat(4600, 180, 48),
        floatPlat(4900, 130, 32),
        floatPlat(5200, 190, 48),
        floatPlat(5500, 140, 32),
        floatPlat(5800, 200, 48),
        floatPlat(6100, 160, 32)
    ],
    enemies: [
        walker(120,  60,  250),
        drone(250,  180, 150, 350),
        walker(420,  400, 550),
        drone(550,  170, 450, 650),
        walker(750,  720, 880),
        drone(900,  160, 800, 1000),
        walker(1050, 1020, 1180),
        drone(1200, 150, 1100, 1300),
        walker(1400, 1360, 1520),
        drone(1550, 150, 1450, 1650),
        walker(1700, 1660, 1850),
        drone(1900, 160, 1800, 2050),
        walker(2100, 2060, 2250),
        drone(2300, 150, 2200, 2450),
        walker(2500, 2450, 2650),
        drone(2700, 160, 2600, 2850),
        walker(2900, 2850, 3050),
        drone(3100, 160, 3000, 3250),
        walker(3300, 3250, 3450),
        drone(3500, 170, 3400, 3650),
        walker(3800, 3750, 3950),
        drone(4100, 160, 4000, 4250),
        walker(4400, 4350, 4550),
        drone(4700, 170, 4600, 4850),
        walker(5000, 4950, 5150),
        drone(5300, 160, 5200, 5450),
        walker(5600, 5550, 5750),
        drone(5900, 170, 5800, 6050)
    ],
    movingPlatforms: [
        movingPlatform(700,  270, 80, { patrolLeft: 620,  patrolRight: 780,  speed: 55 }),
        movingPlatform(1600, 240, 80, { patrolLeft: 1520, patrolRight: 1680, speed: 60 }),
        movingPlatform(2500, 250, 80, { patrolLeft: 2420, patrolRight: 2580, speed: 55 }),
        movingPlatform(3400, 230, 80, { patrolLeft: 3320, patrolRight: 3480, speed: 60 }),
        movingPlatform(4300, 240, 80, { patrolLeft: 4220, patrolRight: 4380, speed: 55 }),
        movingPlatform(5200, 250, 80, { patrolLeft: 5120, patrolRight: 5280, speed: 60 }),
        movingPlatform(6000, 250, 80, { patrolLeft: 5920, patrolRight: 6080, speed: 55 })
    ],
    obstacles: [
        spikeTrap(250, 1200, 1400),
        buriedSaw(700, 100),
        surpriseSaw(1200, 220, 1100, 1300, 60),
        spikeTrap(1800, 1200, 1400),
        buriedSaw(2300, 100),
        surpriseSaw(2900, 210, 2800, 3000, 65),
        spikeTrap(3500, 1100, 1300),
        buriedSaw(4000, 100),
        surpriseSaw(4500, 210, 4400, 4600, 60),
        spikeTrap(5000, 1100, 1300),
        buriedSaw(5400, 100),
        surpriseSaw(5800, 210, 5700, 5900, 65),
        spikeTrap(6200, 1000, 1200)
    ],
    coins: [
        coin(150,  386),
        coin(150,  218),
        coin(300,  138),
        coin(500,  198),
        coin(750,  118),
        coin(1000, 178),
        coin(1300, 108),
        coin(1600, 168),
        coin(1900, 98),
        coin(2200, 168)
    ]
});
