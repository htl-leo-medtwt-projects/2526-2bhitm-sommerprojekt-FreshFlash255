/// <reference path="../data/gameData.js" />

const STAT_DEFAULTS = {
	playTimeSeconds: 0,
	totalBtcMined: 0,
	totalMoneyEarned: 0,
	totalMoneySpent: 0,
	btcRateMin: 0,
	btcRateMax: 0,
	btcRateSum: 0,
	btcRateSamples: 0,
	currentMoney: 0,
	currentBitcoin: 0,
	currentEnergy: 0,
	currentPower: 0,
	currentUpkeep: 0,
	gpuOwnedCount: 0,
	gpuInstalledCount: 0,
	energySupplyCount: 0,
	energyOutput: 0,
	energyUse: 0,
	energyUpkeep: 0,
};

function ensureStats() {
	if (typeof DATA === 'undefined' || !DATA || typeof DATA !== 'object') {
		return null;
	}
	if (!DATA.stats || typeof DATA.stats !== 'object') {
		DATA.stats = {};
	}
	const baseRate = Number(DATA.bitcoinToMoney) || 3600;
	const defaults = {
		...STAT_DEFAULTS,
		btcRateMin: baseRate,
		btcRateMax: baseRate,
	};
	Object.entries(defaults).forEach(([key, value]) => {
		if (DATA.stats[key] === undefined || DATA.stats[key] === null || Number.isNaN(DATA.stats[key])) {
			DATA.stats[key] = value;
		}
	});
	if (!Number.isFinite(DATA.stats.btcRateMin)) {
		DATA.stats.btcRateMin = baseRate;
	}
	if (!Number.isFinite(DATA.stats.btcRateMax)) {
		DATA.stats.btcRateMax = baseRate;
	}
	return DATA.stats;
}

function recordPlaytime(seconds) {
	const stats = ensureStats();
	const value = Number(seconds);
	if (!stats || !Number.isFinite(value) || value <= 0) {
		return;
	}
	stats.playTimeSeconds += value;
}

function recordBtcMined(amount) {
	const stats = ensureStats();
	const value = Number(amount);
	if (!stats || !Number.isFinite(value) || value <= 0) {
		return;
	}
	stats.totalBtcMined += value;
}

function recordMoneyEarned(amount) {
	const stats = ensureStats();
	const value = Number(amount);
	if (!stats || !Number.isFinite(value) || value <= 0) {
		return;
	}
	stats.totalMoneyEarned += value;
}

function recordMoneySpent(amount) {
	const stats = ensureStats();
	const value = Number(amount);
	if (!stats || !Number.isFinite(value) || value <= 0) {
		return;
	}
	stats.totalMoneySpent += value;
}

function seedRateStats(minValue, maxValue, sumValue, samples) {
	const stats = ensureStats();
	if (!stats) {
		return;
	}
	const minRate = Number(minValue);
	const maxRate = Number(maxValue);
	const sumRate = Number(sumValue);
	const sampleCount = Number(samples);

	if (Number.isFinite(minRate)) {
		stats.btcRateMin = minRate;
	}
	if (Number.isFinite(maxRate)) {
		stats.btcRateMax = maxRate;
	}
	if (Number.isFinite(sumRate)) {
		stats.btcRateSum = sumRate;
	}
	if (Number.isFinite(sampleCount)) {
		stats.btcRateSamples = sampleCount;
	}
}

function recordRateSample(rateValue) {
	const stats = ensureStats();
	const rate = Number(rateValue);
	if (!stats || !Number.isFinite(rate)) {
		return;
	}
	const currentMin = Number.isFinite(stats.btcRateMin) ? stats.btcRateMin : rate;
	const currentMax = Number.isFinite(stats.btcRateMax) ? stats.btcRateMax : rate;
	stats.btcRateMin = Math.min(currentMin, rate);
	stats.btcRateMax = Math.max(currentMax, rate);
	stats.btcRateSum = (Number(stats.btcRateSum) || 0) + rate;
	stats.btcRateSamples = (Number(stats.btcRateSamples) || 0) + 1;
}

function syncRuntimeStats() {
	const stats = ensureStats();
	if (!stats || typeof PLAYER === 'undefined' || !PLAYER || typeof PLAYER !== 'object') {
		return;
	}

	stats.currentMoney = Number(PLAYER.money) || 0;
	stats.currentBitcoin = Number(PLAYER.bitcoin) || 0;
	stats.currentEnergy = Number(PLAYER.energy) || 0;
	stats.currentPower = Number(PLAYER.generatingPower) || 0;
	stats.currentUpkeep = typeof currentUpkeep === 'number' && Number.isFinite(currentUpkeep)
		? currentUpkeep
		: stats.currentUpkeep;

	const gpuTotals = typeof calculateGpuTotal === 'function' ? calculateGpuTotal() : null;
	const energyTotals = typeof calculateEnergyTotal === 'function' ? calculateEnergyTotal() : null;

	stats.energyUse = gpuTotals ? Number(gpuTotals.energyUse) || 0 : 0;
	stats.energyOutput = energyTotals ? Number(energyTotals.output) || 0 : 0;
	stats.energyUpkeep = energyTotals ? Number(energyTotals.upkeep) || 0 : 0;

	stats.gpuOwnedCount = sumCounts(PLAYER.graphicCardsInventory);
	stats.gpuInstalledCount = sumCounts(PLAYER.rackInventory);
	stats.energySupplyCount = sumCounts(PLAYER.energySupply);
}

function sumCounts(bucket) {
	if (!bucket || typeof bucket !== 'object') {
		return 0;
	}
	return Object.values(bucket).reduce((total, value) => total + (Number(value) || 0), 0);
}

ensureStats();
