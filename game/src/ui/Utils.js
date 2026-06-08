// Shared utility functions for Cogsworth: Last Wind

// ── Draw a small gear icon (used in HUD and pause menu) ──
function drawMiniGear(g, cx, cy, radius, teeth, color, alpha) {
    g.fillStyle(color, alpha || 0.5);
    g.fillCircle(cx, cy, radius);
    const tw = radius * 0.35;
    const th = radius * 0.25;
    const step = (Math.PI * 2) / teeth;
    for (let i = 0; i < teeth; i++) {
        const angle = i * step - Math.PI / 2;
        const tx = cx + Math.cos(angle) * radius;
        const ty = cy + Math.sin(angle) * radius;
        g.fillRect(tx - tw / 2, ty - th / 2, tw, th);
    }
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(cx, cy, radius * 0.4);
}
