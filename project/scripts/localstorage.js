/// <reference path="../data/gameData.js" />
/// <reference path="statsHandler.js" />

const STATS_STORAGE_KEY = 'minemaster_stats_v1';
const STATS_SAVE_INTERVAL_MS = 5000;
let lastStatsSave = 0;

function loadStatsFromLocalStorage() {
	if (typeof localStorage === 'undefined') {
		return;
	}
	const raw = localStorage.getItem(STATS_STORAGE_KEY);
	if (!raw) {
		return;
	}
	let parsed = null;
	try {
		parsed = JSON.parse(raw);
	} catch (error) {
		console.warn('Failed to parse stats from localStorage', error);
		return;
	}
	if (!parsed || typeof parsed !== 'object') {
		return;
	}

	const stats = typeof ensureStats === 'function'
		? ensureStats()
		: (typeof DATA !== 'undefined' && DATA && DATA.stats ? DATA.stats : null);
	if (!stats) {
		return;
	}

	Object.entries(parsed).forEach(([key, value]) => {
		if (!(key in stats)) {
			return;
		}
		const numeric = Number(value);
		if (Number.isFinite(numeric)) {
			stats[key] = numeric;
		}
	});
}

function getStatsSnapshot() {
	if (typeof DATA === 'undefined' || !DATA || !DATA.stats) {
		return null;
	}
	const snapshot = {};
	Object.entries(DATA.stats).forEach(([key, value]) => {
		if (typeof value === 'number' && Number.isFinite(value)) {
			snapshot[key] = value;
		}
	});
	return snapshot;
}

function saveStatsToLocalStorage(force = false) {
	if (typeof localStorage === 'undefined') {
		return;
	}
	const now = Date.now();
	if (!force && now - lastStatsSave < STATS_SAVE_INTERVAL_MS) {
		return;
	}
	const snapshot = getStatsSnapshot();
	if (!snapshot) {
		return;
	}
	try {
		localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(snapshot));
		lastStatsSave = now;
	} catch (error) {
		console.warn('Failed to save stats to localStorage', error);
	}
}

loadStatsFromLocalStorage();
