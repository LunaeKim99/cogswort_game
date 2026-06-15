// SaveManager — autosave & load game progress via localStorage (5 slots)
const SAVE_PREFIX = 'cogsworth_slot_';
const SLOT_COUNT = 5;

const DEFAULT_SAVE = {
    currentLevel: 0,
    score: 0,
    lives: 3,
    unlockedLevels: [0],
    gear: 0,
    coins: 0,
    inventory: {},
    upgrades: {},
    bossDefeated: [],
    timestamp: Date.now(),
    version: 1
};

const SaveManager = {
    // ── Core save/load ──
    save(slotIndex, levelIndex, score, lives, extra) {
        const data = {
            currentLevel: levelIndex,
            score: score || 0,
            lives: lives !== undefined ? lives : 3,
            unlockedLevels: this._computeUnlocked(levelIndex),
            gear: (extra && extra.gear) || 0,
            coins: (extra && extra.coins) || 0,
            inventory: (extra && extra.inventory) || {},
            upgrades: (extra && extra.upgrades) || {},
            bossDefeated: (extra && extra.bossDefeated) || [],
            timestamp: Date.now(),
            version: 1
        };
        try {
            localStorage.setItem(SAVE_PREFIX + slotIndex, JSON.stringify(data));
        } catch (e) {
            console.warn('Save failed:', e);
        }
    },

    load(slotIndex) {
        try {
            const raw = localStorage.getItem(SAVE_PREFIX + slotIndex);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (!data || typeof data !== 'object') return null;
            if (typeof data.currentLevel !== 'number') return null;
            if (typeof data.score !== 'number') return null;
            if (typeof data.lives !== 'number') return null;
            if (!Array.isArray(data.unlockedLevels)) return null;
            if (data.version !== 1) {
                console.warn('[SaveManager] Unknown save version:', data.version, '— discarding');
                return null;
            }
            // ── Backward-compatible patch for old saves missing currency/inventory ──
            let patched = false;
            if (typeof data.gear !== 'number') { data.gear = 0; patched = true; }
            if (typeof data.coins !== 'number') { data.coins = 0; patched = true; }
            if (typeof data.inventory !== 'object' || Array.isArray(data.inventory)) { data.inventory = {}; patched = true; }
            if (typeof data.upgrades !== 'object' || Array.isArray(data.upgrades)) { data.upgrades = {}; patched = true; }
            if (!Array.isArray(data.bossDefeated)) { data.bossDefeated = []; patched = true; }
            if (patched) {
                try { localStorage.setItem(SAVE_PREFIX + slotIndex, JSON.stringify(data)); } catch(e) {}
            }
            return data;
        } catch (e) {
            console.warn('Load failed for slot ' + slotIndex + ':', e);
            return null;
        }
    },

    // ── Autosave — triggered on level start & level complete ──
    autosave(slotIndex, levelIndex, score, lives, extra) {
        if (slotIndex === undefined || slotIndex === null) return;
        this.save(slotIndex, levelIndex, score, lives, extra);
    },

    // ── Slot queries ──
    hasSlot(slotIndex) {
        try {
            return localStorage.getItem(SAVE_PREFIX + slotIndex) !== null;
        } catch (e) {
            return false;
        }
    },

    deleteSlot(slotIndex) {
        try {
            localStorage.removeItem(SAVE_PREFIX + slotIndex);
        } catch (e) {}
    },

    getSlotInfo(slotIndex) {
        const data = this.load(slotIndex);
        if (!data) return null;
        const levelData = levels[data.currentLevel] || null;
        return {
            slot: slotIndex,
            levelIndex: data.currentLevel,
            score: data.score,
            lives: data.lives,
            unlockedCount: data.unlockedLevels.length,
            totalLevels: levels.length,
            district: levelData ? levelData.district : '???',
            subName: levelData ? levelData.subName : '???',
            timestamp: data.timestamp,
            date: data.timestamp ? new Date(data.timestamp).toLocaleDateString() : '???'
        };
    },

    listSlots() {
        const slots = [];
        for (let i = 0; i < SLOT_COUNT; i++) {
            const info = this.getSlotInfo(i);
            slots.push({
                index: i,
                hasData: this.hasSlot(i) && info !== null,
                info: info
            });
        }
        return slots;
    },

    // ── Currency methods ──
    addGear(slotIndex, amount) {
        const data = this.load(slotIndex);
        if (!data) return;
        data.gear = (data.gear || 0) + amount;
        try { localStorage.setItem(SAVE_PREFIX + slotIndex, JSON.stringify(data)); } catch(e) {}
    },

    addCoins(slotIndex, amount) {
        const data = this.load(slotIndex);
        if (!data) return;
        data.coins = (data.coins || 0) + amount;
        try { localStorage.setItem(SAVE_PREFIX + slotIndex, JSON.stringify(data)); } catch(e) {}
    },

    buyItem(slotIndex, itemId) {
        const data = this.load(slotIndex);
        if (!data) return false;
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (!item) return false;
        const balance = item.currency === 'gear' ? (data.gear || 0) : (data.coins || 0);
        if (balance < item.price) return false;
        // Check constraints
        if (item.type === 'upgrade' || item.type === 'utility') {
            if (data.upgrades[itemId]) return false; // already owned
        } else if (item.type === 'consumable') {
            const current = data.inventory[itemId] || 0;
            if (current >= item.max) return false;
        }
        // Deduct currency
        if (item.currency === 'gear') {
            data.gear = balance - item.price;
        } else {
            data.coins = balance - item.price;
        }
        // Grant item
        if (item.type === 'upgrade' || item.type === 'utility') {
            data.upgrades[itemId] = true;
        } else {
            data.inventory[itemId] = (data.inventory[itemId] || 0) + 1;
        }
        try { localStorage.setItem(SAVE_PREFIX + slotIndex, JSON.stringify(data)); } catch(e) {}
        return true;
    },

    useConsumable(slotIndex, itemId) {
        const data = this.load(slotIndex);
        if (!data) return false;
        if (!data.inventory[itemId] || data.inventory[itemId] <= 0) return false;
        data.inventory[itemId]--;
        if (data.inventory[itemId] <= 0) delete data.inventory[itemId];
        try { localStorage.setItem(SAVE_PREFIX + slotIndex, JSON.stringify(data)); } catch(e) {}
        return true;
    },

    markBossDefeated(slotIndex, levelIndex) {
        const data = this.load(slotIndex);
        if (!data) return;
        if (!data.bossDefeated.includes(levelIndex)) {
            data.bossDefeated.push(levelIndex);
        }
        try { localStorage.setItem(SAVE_PREFIX + slotIndex, JSON.stringify(data)); } catch(e) {}
    },

    // ── Helpers ──
    _computeUnlocked(levelIndex) {
        const unlocked = [];
        for (let i = 0; i <= levelIndex; i++) {
            unlocked.push(i);
        }
        return unlocked;
    }
};
