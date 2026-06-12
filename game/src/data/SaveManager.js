// SaveManager — autosave & load game progress via localStorage (5 slots)
const SAVE_PREFIX = 'cogsworth_slot_';
const SLOT_COUNT = 5;

const DEFAULT_SAVE = {
    currentLevel: 0,
    score: 0,
    lives: 3,
    unlockedLevels: [0],
    timestamp: Date.now(),
    version: 1
};

const SaveManager = {
    // ── Core save/load ──
    save(slotIndex, levelIndex, score, lives) {
        const data = {
            currentLevel: levelIndex,
            score: score || 0,
            lives: lives !== undefined ? lives : 3,
            unlockedLevels: this._computeUnlocked(levelIndex),
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
            return data;
        } catch (e) {
            console.warn('Load failed for slot ' + slotIndex + ':', e);
            return null;
        }
    },

    // ── Autosave — triggered on level start & level complete ──
    autosave(slotIndex, levelIndex, score, lives) {
        if (slotIndex === undefined || slotIndex === null) return;
        this.save(slotIndex, levelIndex, score, lives);
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

    // ── Helpers ──
    _computeUnlocked(levelIndex) {
        const unlocked = [];
        for (let i = 0; i <= levelIndex; i++) {
            unlocked.push(i);
        }
        return unlocked;
    }
};
