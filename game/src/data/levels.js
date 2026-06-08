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
        districtIdx: districtIdx,
        subName: subName,
        districtLevel: idx + 1,
        width: width,
        height: GAME_HEIGHT,
        playerStart: { x: 64, y: 350 },
        gateX: width - 160,
        background: d.bg
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
        floatPlat(400,  320, 96),   // A — start
        floatPlat(750,  295, 80),   // B — up (-25)
        floatPlat(1100, 305, 80),   // C — regression (+10)
        floatPlat(1600, 280, 96),   // D — up (-25)
        floatPlat(2000, 290, 80),   // E — regression (+10)
        floatPlat(2400, 265, 80),   // F — up (-25)
        floatPlat(2750, 275, 64)    // G — regression (+10)
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
        coin(400,  288),   // A-32
        coin(750,  263),   // B-32
        coin(900,  386),
        coin(1100, 273),   // C-32
        coin(1500, 386),
        coin(1600, 248),   // D-32
        coin(2000, 258),   // E-32
        coin(2100, 386),
        coin(2400, 233),   // F-32
        coin(2700, 386),
        coin(2750, 243),   // G-32
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
        floatPlat(350,  320, 96),   // A — start
        floatPlat(650,  290, 80),   // B — up (-30)
        floatPlat(1000, 305, 80),   // C — regression (+15)
        floatPlat(1500, 275, 80),   // D — up (-30)
        floatPlat(1850, 290, 64),   // E — regression (+15)
        floatPlat(2250, 260, 80),   // F — up (-30)
        floatPlat(2600, 275, 64),   // G — regression (+15)
        floatPlat(3100, 245, 80),   // H — up (-30)
        floatPlat(3400, 260, 64)    // I — regression (+15)
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
        coin(150,  386),
        coin(350,  288),     // A-32
        coin(650,  258),     // B-32
        coin(800,  386),
        coin(1000, 273),     // C-32
        coin(1500, 243),     // D-32
        coin(1850, 258),     // E-32
        coin(2000, 386),
        coin(2250, 228),     // F-32
        coin(2600, 243),     // G-32
        coin(3100, 213),     // H-32
        coin(3400, 228),     // I-32
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
        floatPlat(300,  320, 80),   // A — start
        floatPlat(600,  285, 64),   // B — up (-35)
        floatPlat(1000, 300, 64),   // C — regression (+15)
        floatPlat(1400, 270, 64),   // D — up (-30)
        floatPlat(1850, 285, 64),   // E — regression (+15)
        floatPlat(2350, 255, 64),   // F — up (-30)
        floatPlat(2750, 270, 64),   // G — regression (+15)
        floatPlat(3150, 240, 64),   // H — up (-30)
        floatPlat(3550, 255, 64),   // I — regression (+15)
        floatPlat(3950, 230, 64)    // J — up (-25)
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
        coin(300,  288),     // A-32
        coin(600,  253),     // B-32
        coin(1000, 268),     // C-32
        coin(1400, 238),     // D-32
        coin(1500, 386),
        coin(1850, 253),     // E-32
        coin(2350, 223),     // F-32
        coin(2500, 386),
        coin(2750, 238),     // G-32
        coin(3150, 208),     // H-32
        coin(3550, 223),     // I-32
        coin(3950, 198),     // J-32
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
        floatPlat(300,  320, 80),   // A — start
        floatPlat(600,  280, 64),   // B — up (-40)
        floatPlat(1000, 295, 64),   // C — regression (+15)
        floatPlat(1450, 260, 80),   // D — up (-35)
        floatPlat(1850, 280, 64),   // E — regression (+20)
        floatPlat(2350, 245, 64),   // F — up (-35)
        floatPlat(2750, 265, 64),   // G — regression (+20)
        floatPlat(3150, 230, 64),   // H — up (-35)
        floatPlat(3600, 250, 64),   // I — regression (+20)
        floatPlat(4050, 220, 64),   // J — up (-30)
        floatPlat(4400, 240, 64)    // K — regression (+20)
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
        coin(300,  288),     // A-32
        coin(600,  248),     // B-32
        coin(1000, 263),     // C-32
        coin(1450, 228),     // D-32
        coin(1500, 386),
        coin(1850, 248),     // E-32
        coin(2000, 386),
        coin(2350, 213),     // F-32
        coin(2750, 233),     // G-32
        coin(3150, 198),     // H-32
        coin(3600, 218),     // I-32
        coin(4050, 188),     // J-32
        coin(4400, 208),     // K-32
        coin(3800, 386)
    ]
});

// ── DISTRICT 2: CLOCKWORK QUARTER (Levels 6-10) ──
// Medium → Medium-Hard progression

// ════════════════════════════════════════════════════════════
// Level 6 — "Tutorial" (width: 3600)
// ════════════════════════════════════════════════════════════
levels.push({
    ...levelMeta(1, 'Tutorial', 3600, 5),
    platforms: [
        groundSection(0,    576),
        groundSection(704,  384),
        groundSection(1216, 320),
        groundSection(1664, 384),
        groundSection(2176, 320),
        groundSection(2624, 576),
        // Floating platforms
        floatPlat(300,  310, 96),   // A
        floatPlat(600,  280, 80),   // B
        floatPlat(950,  295, 64),   // C (regression)
        floatPlat(1400, 260, 80),   // D
        floatPlat(1850, 285, 64),   // E (regression)
        floatPlat(2300, 250, 96),   // F
        floatPlat(2750, 265, 64),   // G (regression)
        floatPlat(3200, 240, 80),   // H
        floatPlat(3500, 255, 64)    // I (regression near end)
    ],
    enemies: [
        walker(250,  150,  480),
        walker(750,  730,  980),
        drone(1000, 200, 900, 1100),
        walker(1300, 1240, 1550),
        walker(1700, 1680, 2000),
        drone(2300, 180, 2200, 2500),
        walker(3300, 3250, 3500)     // patrols new section
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
        coin(150, 386),     // ground
        coin(300, 278),     // A-32
        coin(600, 248),     // B-32
        coin(950, 263),     // C-32
        coin(1300, 386),    // ground
        coin(1400, 228),    // D-32
        coin(1500, 248),    // on movingPlatform
        coin(1700, 386),    // ground
        coin(1850, 253),    // E-32
        coin(2300, 218),    // F-32
        coin(2400, 386),    // ground area (2176-2496 groundSection)
        coin(2700, 386),    // ground
        coin(2750, 233),    // G-32
        coin(3200, 208),    // H-32
        coin(3500, 223)     // I-32
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
        floatPlat(300,  310, 80),   // A start
        floatPlat(550,  270, 64),   // B up
        floatPlat(900,  285, 64),   // C regression
        floatPlat(1400, 250, 80),   // D landing
        floatPlat(1900, 270, 64),   // E regression
        floatPlat(2300, 230, 64),   // F up
        floatPlat(2700, 250, 64),   // G regression
        floatPlat(3100, 210, 80),   // H up
        floatPlat(3600, 240, 64),   // I regression
        floatPlat(3850, 220, 64)    // J final
    ],
    enemies: [
        walker(200,  100,  400),
        walker(700,  670,  950),
        drone(900,  200, 800, 1000),
        walker(1150, 1110, 1450),
        drone(1400, 180, 1300, 1550),
        walker(1700, 1650, 1950),
        walker(2100, 2070, 2350),
        drone(2500, 170, 2400, 2700),
        walker(2800, 2750, 2950)
    ],
    movingPlatforms: [
        movingPlatform(1600, 280, 80, { patrolLeft: 1520, patrolRight: 1680, speed: 50 }),
        movingPlatform(2400, 240, 80, { patrolLeft: 2320, patrolRight: 2480, speed: 55 }),
        movingPlatform(3200, 230, 80, { axis: 'y', patrolUp: 190, patrolDown: 280, speed: 40 })
    ],
    obstacles: [
        spikeTrap(800, 2000, 2200),
        buriedSaw(1800, 140),
        surpriseSaw(3000, 280, 2900, 3100, 60),
        spikeTrap(3500, 1800, 2000)
    ],
    coins: [
        coin(150, 386),
        coin(300, 278),     // A-32
        coin(550, 238),     // B-32
        coin(900, 253),     // C-32
        coin(1400, 218),    // D-32
        coin(1700, 386),
        coin(1900, 238),    // E-32
        coin(2300, 198),    // F-32
        coin(2700, 218),    // G-32
        coin(3100, 178),    // H-32
        coin(3600, 208),    // I-32
        coin(3850, 188),    // J-32
        coin(700, 386)      // ground
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
        floatPlat(250,  310, 80),   // A
        floatPlat(550,  270, 64),   // B
        floatPlat(850,  285, 64),   // C regression
        floatPlat(1200, 250, 80),   // D
        floatPlat(1650, 270, 64),   // E regression
        floatPlat(2000, 230, 64),   // F
        floatPlat(2500, 250, 64),   // G regression
        floatPlat(2900, 210, 80),   // H
        floatPlat(3350, 240, 64),   // I regression
        floatPlat(3700, 200, 64),   // J
        floatPlat(4100, 230, 64),   // K regression
        floatPlat(4400, 200, 80),   // L landing
        floatPlat(4600, 215, 64)    // M regression near gate
    ],
    enemies: [
        walker(200,  100,  380),
        walker(600,  590,  850),
        drone(850,  190, 750,  950),
        walker(1100, 1050, 1300),
        drone(1300, 170, 1200, 1450),
        walker(1500, 1450, 1750),
        walker(1900, 1870, 2120),
        drone(2100, 160, 2100, 2250),
        walker(2300, 2260, 2550),
        drone(2800, 180, 2700, 3000)
    ],
    movingPlatforms: [
        movingPlatform(1600, 280, 80, { patrolLeft: 1520, patrolRight: 1680, speed: 50 }),
        movingPlatform(2600, 260, 80, { patrolLeft: 2520, patrolRight: 2680, speed: 55 }),
        movingPlatform(3500, 270, 80, { patrolLeft: 3420, patrolRight: 3580, speed: 50 }),
        movingPlatform(3100, 220, 80, { axis: 'y', patrolUp: 180, patrolDown: 280, speed: 40 })
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
        coin(150, 386),
        coin(250, 278),     // A-32
        coin(550, 238),     // B-32
        coin(850, 253),     // C-32
        coin(1200, 218),    // D-32
        coin(1650, 238),    // E-32
        coin(2000, 198),    // F-32
        coin(2500, 218),    // G-32
        coin(2900, 178),    // H-32
        coin(3350, 208),    // I-32
        coin(3700, 168),    // J-32
        coin(4100, 198),    // K-32
        coin(4400, 168),    // L-32
        coin(4600, 183)     // M-32
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
        groundSection(4928, 272),  // extended left to cover gate at x=5040
        // Floating platforms (narrow)
        floatPlat(250,  310, 64),   // A start
        floatPlat(500,  260, 48),   // B narrow
        floatPlat(800,  280, 64),   // C regression
        floatPlat(1150, 240, 48),   // D narrow
        floatPlat(1550, 260, 64),   // E regression
        floatPlat(1950, 220, 48),   // F narrow
        floatPlat(2350, 250, 64),   // G regression
        floatPlat(2800, 210, 48),   // H narrow
        floatPlat(3200, 240, 64),   // I regression
        floatPlat(3650, 200, 48),   // J narrow
        floatPlat(4050, 230, 64),   // K regression
        floatPlat(4500, 190, 48),   // L narrow
        floatPlat(4800, 210, 64),   // M regression
        floatPlat(5000, 190, 48)    // N final narrow
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
        walker(3100, 3050, 3300),
        drone(4100, 240, 4000, 4200)
    ],
    movingPlatforms: [
        movingPlatform(1200, 280, 80, { patrolLeft: 1120, patrolRight: 1280, speed: 55 }),
        movingPlatform(2200, 250, 80, { patrolLeft: 2120, patrolRight: 2280, speed: 60 }),
        movingPlatform(3200, 270, 80, { patrolLeft: 3120, patrolRight: 3280, speed: 55 }),
        movingPlatform(4200, 260, 80, { patrolLeft: 4120, patrolRight: 4280, speed: 60 }),
        movingPlatform(3400, 220, 80, { axis: 'y', patrolUp: 170, patrolDown: 270, speed: 45 })
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
        coin(150, 386),
        coin(250, 278),     // A-32
        coin(500, 228),     // B-32
        coin(800, 248),     // C-32
        coin(1150, 208),    // D-32
        coin(1550, 228),    // E-32
        coin(1950, 188),    // F-32
        coin(2350, 218),    // G-32
        coin(2800, 178),    // H-32
        coin(3200, 208),    // I-32
        coin(3650, 168),    // J-32
        coin(4050, 198),    // K-32
        coin(4500, 158),    // L-32
        coin(4800, 178),    // M-32
        coin(5000, 158)     // N-32
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
        floatPlat(200,  310, 64),   // A start
        floatPlat(450,  260, 48),   // B narrow
        floatPlat(700,  280, 64),   // C regression
        floatPlat(1050, 240, 48),   // D narrow
        floatPlat(1450, 260, 64),   // E regression
        floatPlat(1800, 220, 48),   // F narrow
        floatPlat(2200, 250, 64),   // G regression
        floatPlat(2550, 210, 48),   // H narrow
        floatPlat(2950, 240, 64),   // I regression
        floatPlat(3300, 200, 48),   // J narrow
        floatPlat(3700, 230, 64),   // K regression
        floatPlat(4050, 190, 48),   // L narrow
        floatPlat(4400, 220, 64),   // M regression
        floatPlat(4750, 180, 48),   // N narrow
        floatPlat(5150, 200, 64),   // O regression
        floatPlat(5400, 180, 48)    // P final narrow
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
        movingPlatform(5000, 270, 80, { patrolLeft: 4920, patrolRight: 5080, speed: 55 }),
        movingPlatform(5300, 200, 80, { axis: 'y', patrolUp: 160, patrolDown: 260, speed: 45 })
    ],
    obstacles: [
        spikeTrap(500, 1800, 2000),
        buriedSaw(1100, 130),
        surpriseSaw(1700, 260, 1600, 1800, 60),
        spikeTrap(2300, 1800, 2000),
        buriedSaw(2800, 120),
        surpriseSaw(3400, 240, 3300, 3500, 65),
        spikeTrap(4000, 1600, 1800),
        buriedSaw(4500, 130),
        surpriseSaw(5100, 250, 5000, 5200, 60)
    ],
    coins: [
        coin(150, 386),
        coin(200, 278),     // A-32
        coin(450, 228),     // B-32
        coin(700, 248),     // C-32
        coin(1050, 208),    // D-32
        coin(1450, 228),    // E-32
        coin(1800, 188),    // F-32
        coin(2200, 218),    // G-32
        coin(2550, 178),    // H-32
        coin(2950, 208),    // I-32
        coin(3300, 168),    // J-32
        coin(3700, 198),    // K-32
        coin(4050, 158),    // L-32
        coin(4400, 188),    // M-32
        coin(4750, 148),    // N-32
        coin(5150, 168),    // O-32
        coin(5400, 148)     // P-32
    ]
});

// ── DISTRICT 3: THE CORE (Levels 11-15) ──
// Hard → Very Hard progression

// ════════════════════════════════════════════════════════════
// Level 11 — "Tutorial" (width: 4200)
// ════════════════════════════════════════════════════════════
levels.push({
    ...levelMeta(2, 'Tutorial', 4200, 10),
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
        floatPlat(200,  280, 64),   // A start (LOWER than D2 start = harder)
        floatPlat(500,  240, 48),   // B narrow
        floatPlat(750,  260, 64),   // C regression
        floatPlat(1100, 220, 48),   // D narrow
        floatPlat(1500, 250, 64),   // E regression
        floatPlat(1800, 210, 48),   // F narrow
        floatPlat(2200, 240, 64),   // G regression
        floatPlat(2600, 200, 48),   // H narrow
        floatPlat(2900, 230, 64),   // I regression
        floatPlat(3300, 190, 48),   // J narrow
        floatPlat(3700, 210, 64),   // K regression
        floatPlat(4000, 180, 48),   // L narrow near end
        floatPlat(4100, 195, 64),   // M final regression
        groundSection(3600, 600)    // 3600→4200: covers new gate area
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
        drone(2000, 160, 1900, 2150),
        walker(3800, 3750, 4000),     // patrols new section
        walker(2400, 2350, 2550)
    ],
    movingPlatforms: [
        movingPlatform(900,  280, 80, { patrolLeft: 820,  patrolRight: 980,  speed: 55 }),
        movingPlatform(2000, 260, 80, { patrolLeft: 1920, patrolRight: 2080, speed: 60 }),
        movingPlatform(3000, 270, 80, { patrolLeft: 2920, patrolRight: 3080, speed: 55 }),
        movingPlatform(3500, 210, 80, { axis: 'y', patrolUp: 170, patrolDown: 260, speed: 45 })
    ],
    obstacles: [
        spikeTrap(500, 1800, 2000),
        buriedSaw(1200, 130),
        surpriseSaw(1800, 260, 1700, 1900, 60),
        spikeTrap(2500, 1600, 1800),
        buriedSaw(3000, 120)
    ],
    coins: [
        coin(150, 386),
        coin(200, 248),     // A-32
        coin(500, 208),     // B-32
        coin(750, 228),     // C-32
        coin(1100, 188),    // D-32
        coin(1500, 218),    // E-32
        coin(1800, 178),    // F-32
        coin(2200, 208),    // G-32
        coin(2600, 168),    // H-32
        coin(2900, 198),    // I-32
        coin(3300, 158),    // J-32
        coin(3700, 178),    // K-32
        coin(4000, 148),    // L-32
        coin(4100, 163),    // M-32
        coin(650, 386),
        coin(3200, 386)
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
        floatPlat(200,  280, 48),   // A start
        floatPlat(400,  240, 48),   // B up
        floatPlat(650,  260, 48),   // C regression
        floatPlat(1000, 220, 48),   // D up
        floatPlat(1350, 250, 48),   // E regression
        floatPlat(1700, 210, 48),   // F up
        floatPlat(2050, 240, 48),   // G regression
        floatPlat(2450, 200, 48),   // H up
        floatPlat(2850, 230, 48),   // I regression
        floatPlat(3200, 180, 48),   // J up
        floatPlat(3550, 210, 48),   // K regression
        floatPlat(3950, 170, 48),   // L up
        floatPlat(4300, 200, 48),   // M regression
        floatPlat(4500, 170, 48),   // N up
        floatPlat(4650, 185, 48)    // O final regression
    ],
    enemies: [
        walker(150,  90,  290),
        drone(300,  190, 215,  385),
        walker(500,  480,  710),
        drone(650,  180, 565,  735),
        walker(850,  830, 1040),
        drone(1000, 170, 915, 1085),
        walker(1250, 1215, 1435),
        drone(1400, 160, 1315, 1485),
        walker(1600, 1580, 1780),
        walker(1950, 1920, 2130),
        drone(2100, 160, 2025, 2225),
        walker(2400, 2370, 2580),
        drone(2700, 180, 2625, 2825)
    ],
    movingPlatforms: [
        movingPlatform(900,  270, 80, { patrolLeft: 820,  patrolRight: 980,  speed: 55 }),
        movingPlatform(1900, 250, 80, { patrolLeft: 1820, patrolRight: 1980, speed: 60 }),
        movingPlatform(2900, 260, 80, { patrolLeft: 2820, patrolRight: 2980, speed: 55 }),
        movingPlatform(3900, 240, 80, { patrolLeft: 3820, patrolRight: 3980, speed: 60 }),
        movingPlatform(3800, 200, 80, { axis: 'y', patrolUp: 150, patrolDown: 260, speed: 45 })
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
        coin(150, 386),
        coin(200, 248),     // A-32
        coin(400, 208),     // B-32
        coin(650, 228),     // C-32
        coin(1000, 188),    // D-32
        coin(1350, 218),    // E-32
        coin(1700, 178),    // F-32
        coin(2050, 208),    // G-32
        coin(2450, 168),    // H-32
        coin(2850, 198),    // I-32
        coin(3200, 148),    // J-32
        coin(3550, 178),    // K-32
        coin(3950, 138),    // L-32
        coin(4300, 168),    // M-32
        coin(4500, 138),    // N-32
        coin(4650, 153),    // O-32
        coin(550, 386),
        coin(900, 386),
        coin(1300, 386)
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
        floatPlat(200,  280, 48),   // A start
        floatPlat(400,  230, 48),   // B up (40px step)
        floatPlat(600,  260, 48),   // C regression
        floatPlat(900,  220, 48),   // D up
        floatPlat(1250, 250, 48),   // E regression
        floatPlat(1600, 210, 48),   // F up
        floatPlat(1950, 240, 48),   // G regression
        floatPlat(2300, 200, 48),   // H up
        floatPlat(2600, 230, 48),   // I regression
        floatPlat(2950, 180, 48),   // J up
        floatPlat(3300, 220, 48),   // K regression
        floatPlat(3650, 170, 48),   // L up
        floatPlat(4000, 210, 48),   // M regression
        floatPlat(4350, 160, 48),   // N up
        floatPlat(4700, 200, 48),   // O regression
        floatPlat(5000, 150, 48),   // P up
        floatPlat(5200, 180, 48),   // Q regression
        floatPlat(5400, 150, 48)    // R final up
    ],
    enemies: [
        walker(150,  80,  300),
        drone(300,  180, 200,  400),
        walker(480,  470,  650),
        drone(600,  170, 500,  700),
        drone(800,  200, 780, 1000),
        drone(950,  160, 850, 1050),
        walker(1150, 1120, 1350),
        drone(1300, 160, 1200, 1400),
        walker(1500, 1460, 1700),
        drone(1650, 150, 1550, 1750),
        drone(1850, 200, 1800, 2050),
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
        movingPlatform(4800, 250, 80, { patrolLeft: 4720, patrolRight: 4880, speed: 55 }),
        movingPlatform(4600, 190, 80, { axis: 'y', patrolUp: 140, patrolDown: 250, speed: 50 })
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
        coin(150, 386),
        coin(200, 248),     // A-32
        coin(400, 198),     // B-32
        coin(600, 228),     // C-32
        coin(900, 188),     // D-32
        coin(1250, 218),    // E-32
        coin(1600, 178),    // F-32
        coin(1950, 208),    // G-32
        coin(2300, 168),    // H-32
        coin(2600, 198),    // I-32
        coin(2950, 148),    // J-32
        coin(3300, 188),    // K-32
        coin(3650, 138),    // L-32
        coin(4000, 178),    // M-32
        coin(4350, 128),    // N-32
        coin(4700, 168),    // O-32
        coin(5000, 118),    // P-32
        coin(5200, 148),    // Q-32
        coin(5400, 118)     // R-32
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
        floatPlat(150,  280, 48),   // A start
        floatPlat(350,  230, 48),   // B up
        floatPlat(550,  260, 48),   // C regression
        floatPlat(850,  210, 48),   // D up
        floatPlat(1150, 250, 48),   // E regression
        floatPlat(1450, 200, 48),   // F up
        floatPlat(1750, 240, 48),   // G regression
        floatPlat(2050, 190, 48),   // H up
        floatPlat(2350, 230, 48),   // I regression
        floatPlat(2650, 180, 48),   // J up
        floatPlat(2950, 220, 48),   // K regression
        floatPlat(3250, 170, 48),   // L up
        floatPlat(3550, 210, 48),   // M regression
        floatPlat(3850, 160, 48),   // N up
        floatPlat(4150, 200, 48),   // O regression
        floatPlat(4450, 150, 48),   // P up
        floatPlat(4750, 190, 48),   // Q regression
        floatPlat(5050, 140, 48),   // R up
        floatPlat(5350, 180, 48),   // S regression
        floatPlat(5650, 140, 48),   // T near end
        floatPlat(5850, 150, 48)    // U final regression
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
        movingPlatform(5400, 250, 80, { patrolLeft: 5320, patrolRight: 5480, speed: 60 }),
        movingPlatform(5700, 170, 80, { axis: 'y', patrolUp: 120, patrolDown: 230, speed: 50 })
    ],
    obstacles: [
        spikeTrap(300, 1400, 1600),
        buriedSaw(800, 90),
        surpriseSaw(1400, 230, 1300, 1500, 60),
        spikeTrap(2000, 1400, 1600),
        buriedSaw(2600, 90),
        surpriseSaw(3200, 220, 3100, 3300, 65),
        spikeTrap(3800, 1200, 1400),
        buriedSaw(4300, 90),
        surpriseSaw(4800, 220, 4700, 4900, 60),
        spikeTrap(5200, 1200, 1400),
        buriedSaw(5600, 90)
    ],
    coins: [
        coin(150, 386),
        coin(150, 248),     // A-32
        coin(350, 198),     // B-32
        coin(550, 228),     // C-32
        coin(850, 178),     // D-32
        coin(1150, 218),    // E-32
        coin(1450, 168),    // F-32
        coin(1750, 208),    // G-32
        coin(2050, 158),    // H-32
        coin(2350, 198),    // I-32
        coin(2650, 148),    // J-32
        coin(2950, 188),    // K-32
        coin(3250, 138),    // L-32
        coin(3550, 178),    // M-32
        coin(3850, 128),    // N-32
        coin(4150, 168),    // O-32
        coin(4450, 118),    // P-32
        coin(4750, 158),    // Q-32
        coin(5050, 108),    // R-32
        coin(5350, 148),    // S-32
        coin(5650, 108),    // T-32
        coin(5850, 118)     // U-32
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
        floatPlat(150,  280, 48),   // A start
        floatPlat(300,  230, 32),   // B extreme narrow
        floatPlat(500,  260, 48),   // C regression
        floatPlat(750,  210, 32),   // D narrow
        floatPlat(1000, 250, 48),   // E regression
        floatPlat(1300, 200, 32),   // F narrow
        floatPlat(1600, 240, 48),   // G regression
        floatPlat(1900, 180, 32),   // H narrow
        floatPlat(2200, 230, 48),   // I regression
        floatPlat(2500, 170, 32),   // J narrow
        floatPlat(2800, 220, 48),   // K regression
        floatPlat(3100, 160, 32),   // L narrow
        floatPlat(3400, 210, 48),   // M regression
        floatPlat(3700, 150, 32),   // N narrow
        floatPlat(4000, 200, 48),   // O regression
        floatPlat(4300, 140, 32),   // P narrow
        floatPlat(4600, 190, 48),   // Q regression
        floatPlat(4900, 130, 32),   // R narrow
        floatPlat(5200, 180, 48),   // S regression
        floatPlat(5500, 130, 32),   // T narrow
        floatPlat(5800, 170, 48),   // U regression
        floatPlat(6100, 120, 32)    // V highest point
    ],
    enemies: [
        walker(120,  75,  235),
        drone(250,  180, 165, 335),
        walker(420,  411, 539),
        drone(550,  170, 465, 635),
        walker(750,  732, 868),
        drone(900,  160, 815, 985),
        walker(1050, 1032, 1168),
        drone(1200, 150, 1115, 1285),
        walker(1400, 1372, 1508),
        drone(1550, 150, 1465, 1635),
        walker(1700, 1674, 1836),
        drone(1900, 160, 1819, 2031),
        walker(2100, 2074, 2236),
        drone(2300, 150, 2219, 2431),
        walker(2500, 2465, 2635),
        drone(2700, 160, 2619, 2831),
        walker(2900, 2865, 3035),
        drone(3100, 160, 3019, 3231),
        walker(3300, 3265, 3435),
        drone(3500, 170, 3419, 3631),
        walker(3800, 3765, 3935),
        drone(4100, 160, 4019, 4231),
        walker(4400, 4365, 4535),
        drone(4700, 170, 4619, 4831),
        walker(5000, 4965, 5135),
        drone(5300, 160, 5219, 5431),
        walker(5600, 5565, 5735),
        drone(5900, 170, 5819, 6031)
    ],
    movingPlatforms: [
        movingPlatform(700,  270, 80, { patrolLeft: 620,  patrolRight: 780,  speed: 55 }),
        movingPlatform(1600, 240, 80, { patrolLeft: 1520, patrolRight: 1680, speed: 60 }),
        movingPlatform(2500, 250, 80, { patrolLeft: 2420, patrolRight: 2580, speed: 55 }),
        movingPlatform(3400, 230, 80, { patrolLeft: 3320, patrolRight: 3480, speed: 60 }),
        movingPlatform(4300, 240, 80, { patrolLeft: 4220, patrolRight: 4380, speed: 55 }),
        movingPlatform(5200, 250, 80, { patrolLeft: 5120, patrolRight: 5280, speed: 60 }),
        movingPlatform(6000, 250, 80, { patrolLeft: 5920, patrolRight: 6080, speed: 55 }),
        movingPlatform(5900, 160, 80, { axis: 'y', patrolUp: 110, patrolDown: 220, speed: 50 })
    ],
    obstacles: [
        spikeTrap(250, 1000, 1200),
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
        spikeTrap(6200, 800, 1000)
    ],
    coins: [
        coin(150, 386),     // ground
        coin(150, 248),     // A-32
        coin(300, 198),     // B-32
        coin(500, 228),     // C-32
        coin(750, 178),     // D-32
        coin(1000, 218),    // E-32
        coin(1300, 168),    // F-32
        coin(1600, 208),    // G-32
        coin(1900, 148),    // H-32
        coin(2200, 198),    // I-32
        coin(2500, 138),    // J-32
        coin(2800, 188),    // K-32
        coin(3100, 128),    // L-32
        coin(3400, 178),    // M-32
        coin(3700, 118),    // N-32
        coin(4000, 168),    // O-32
        coin(4300, 108),    // P-32
        coin(4600, 158),    // Q-32
        coin(4900, 98),     // R-32
        coin(5200, 148),    // S-32
        coin(5500, 98),     // T-32
        coin(5800, 138),    // U-32
        coin(6100, 88)      // V-32
    ]
});
