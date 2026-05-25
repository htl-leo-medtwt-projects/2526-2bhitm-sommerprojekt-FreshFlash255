/// <reference path="../data/gameData.js" />
/// <reference path="statsHandler.js" />
/// <reference path="inventoryScript.js" />

const STATS_STORAGE_KEY = 'minemaster_stats_v1';
const PLAYER_STORAGE_KEY = 'minemaster_player_v1';
const STATS_SAVE_INTERVAL_MS = 5000;
const PLAYER_SAVE_INTERVAL_MS = 5000;
let lastStatsSave = 0;
let lastPlayerSave = 0;

const PLAYER_NUMERIC_FIELDS = [
	'bitcoin',
	'money',
	'generatingPower',
	'energy',
];

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

function sanitizeInventoryBucket(bucket, allowedIds) {
	const result = {};
	if (!bucket || typeof bucket !== 'object' || !allowedIds) {
		return result;
	}
	Object.entries(bucket).forEach(([id, value]) => {
		if (!allowedIds.has(id)) {
			return;
		}
		const amount = Math.floor(Number(value) || 0);
		if (amount > 0) {
			result[id] = amount;
		}
	});
	return result;
}

function getAllowedIdSet(source) {
	if (!source || typeof source !== 'object') {
		return new Set();
	}
	return new Set(Object.keys(source));
}

function loadPlayerFromLocalStorage() {
	if (typeof localStorage === 'undefined') {
		return;
	}
	if (typeof PLAYER === 'undefined' || !PLAYER || typeof PLAYER !== 'object') {
		return;
	}
	const raw = localStorage.getItem(PLAYER_STORAGE_KEY);
	if (!raw) {
		return;
	}
	let parsed = null;
	try {
		parsed = JSON.parse(raw);
	} catch (error) {
		console.warn('Failed to parse player data from localStorage', error);
		return;
	}
	if (!parsed || typeof parsed !== 'object') {
		return;
	}

	PLAYER_NUMERIC_FIELDS.forEach((key) => {
		const value = Number(parsed[key]);
		if (Number.isFinite(value)) {
			PLAYER[key] = value;
		}
	});

	const gpuIds = getAllowedIdSet(typeof DATA !== 'undefined' ? DATA.graphicCards : null);
	const energyIds = getAllowedIdSet(typeof DATA !== 'undefined' ? DATA.energySupply : null);

	if (parsed.graphicCardsInventory) {
		PLAYER.graphicCardsInventory = sanitizeInventoryBucket(parsed.graphicCardsInventory, gpuIds);
	}
	if (parsed.rackInventory) {
		PLAYER.rackInventory = sanitizeInventoryBucket(parsed.rackInventory, gpuIds);
	}
	if (parsed.energySupply) {
		PLAYER.energySupply = sanitizeInventoryBucket(parsed.energySupply, energyIds);
	}

	if (typeof syncRuntimeStats === 'function') {
		syncRuntimeStats();
	}
	if (typeof updateDisplay === 'function') {
		updateDisplay();
	}
	if (typeof renderInventory === 'function') {
		renderInventory();
	}
}

function getPlayerSnapshot() {
	if (typeof PLAYER === 'undefined' || !PLAYER || typeof PLAYER !== 'object') {
		return null;
	}
	const snapshot = {};
	PLAYER_NUMERIC_FIELDS.forEach((key) => {
		const value = Number(PLAYER[key]);
		if (Number.isFinite(value)) {
			snapshot[key] = value;
		}
	});

	const gpuIds = getAllowedIdSet(typeof DATA !== 'undefined' ? DATA.graphicCards : null);
	const energyIds = getAllowedIdSet(typeof DATA !== 'undefined' ? DATA.energySupply : null);

	snapshot.graphicCardsInventory = sanitizeInventoryBucket(PLAYER.graphicCardsInventory, gpuIds);
	snapshot.rackInventory = sanitizeInventoryBucket(PLAYER.rackInventory, gpuIds);
	snapshot.energySupply = sanitizeInventoryBucket(PLAYER.energySupply, energyIds);
	return snapshot;
}

function savePlayerToLocalStorage(force = false) {
	if (typeof localStorage === 'undefined') {
		return;
	}
	const now = Date.now();
	if (!force && now - lastPlayerSave < PLAYER_SAVE_INTERVAL_MS) {
		return;
	}
	const snapshot = getPlayerSnapshot();
	if (!snapshot) {
		return;
	}
	try {
		localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(snapshot));
		lastPlayerSave = now;
	} catch (error) {
		console.warn('Failed to save player data to localStorage', error);
	}
}
loadStatsFromLocalStorage();
loadPlayerFromLocalStorage();
