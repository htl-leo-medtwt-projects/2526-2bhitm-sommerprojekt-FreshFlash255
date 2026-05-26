/// <reference path="../data/gameData.js" />
/// <reference path="shop.js" />

const RACK_SPRITE_FRAMES = 4;
let activeRackIndex = 0;

function getItemCount(bucket, itemId) {
	if (!bucket || typeof bucket !== 'object') {
		return 0;
	}
	return Number(bucket[itemId]) || 0;
}

function getRackCount() {
	if (typeof DATA !== 'undefined' && DATA && Array.isArray(DATA.racks)) {
		return DATA.racks.length;
	}
	if (typeof PLAYER !== 'undefined' && PLAYER && Array.isArray(PLAYER.rackInventory)) {
		return PLAYER.rackInventory.length;
	}
	return 0;
}

function setActiveRackIndex(index) {
	const rackCount = getRackCount();
	const nextIndex = Number.isInteger(index) ? index : 0;
	activeRackIndex = rackCount > 0 && nextIndex >= 0 && nextIndex < rackCount ? nextIndex : 0;
	return activeRackIndex;
}

function getActiveRackIndex() {
	const rackCount = getRackCount();
	if (!Number.isInteger(activeRackIndex) || activeRackIndex < 0 || activeRackIndex >= rackCount) {
		activeRackIndex = 0;
	}
	return activeRackIndex;
}

function ensureRackInventory() {
	if (!PLAYER.rackInventory || typeof PLAYER.rackInventory !== 'object') {
		PLAYER.rackInventory = [];
	}
	if (!Array.isArray(PLAYER.rackInventory)) {
		const legacyRack = PLAYER.rackInventory;
		PLAYER.rackInventory = [];
		if (legacyRack && typeof legacyRack === 'object') {
			PLAYER.rackInventory[0] = legacyRack;
		}
	}

	const rackCount = getRackCount();
	for (let i = 0; i < rackCount; i += 1) {
		if (!PLAYER.rackInventory[i] || typeof PLAYER.rackInventory[i] !== 'object' || Array.isArray(PLAYER.rackInventory[i])) {
			PLAYER.rackInventory[i] = {};
		}
	}

	return PLAYER.rackInventory;
}

function getRackConfig(index) {
	if (typeof DATA === 'undefined' || !DATA || !Array.isArray(DATA.racks)) {
		return null;
	}
	return DATA.racks[index] || null;
}

function isRackUnlocked(index) {
	const config = getRackConfig(index);
	return config ? Boolean(config.unlocked) : true;
}

function getRackCapacity(index) {
	const config = getRackConfig(index);
	const capacity = config ? Number(config.capacity) : 0;
	return Number.isFinite(capacity) ? capacity : 0;
}

function getRackBucket(index) {
	const racks = ensureRackInventory();
	if (!Number.isInteger(index) || index < 0 || index >= racks.length) {
		return null;
	}
	return racks[index];
}

function getRackUsedCount(rack) {
	if (!rack || typeof rack !== 'object') {
		return 0;
	}
	return Object.values(rack).reduce((total, value) => total + (Number(value) || 0), 0);
}

function findFirstAvailableRackIndex(amount) {
	const racks = ensureRackInventory();
	const needed = Number(amount) || 0;

	for (let i = 0; i < racks.length; i += 1) {
		if (!isRackUnlocked(i)) {
			continue;
		}
		const capacity = getRackCapacity(i);
		if (capacity <= 0) {
			continue;
		}
		const used = getRackUsedCount(racks[i]);
		if (used + needed <= capacity) {
			return i;
		}
	}
	return null;
}

function findRackIndexForGpu(itemId) {
	const racks = ensureRackInventory();
	for (let i = 0; i < racks.length; i += 1) {
		if (getItemCount(racks[i], itemId) > 0) {
			return i;
		}
	}
	return null;
}

function getRackFillQuarter(used, capacity) {
	if (!Number.isFinite(capacity) || capacity <= 0) {
		return 0;
	}
	const ratio = Math.max(0, Math.min(1, used / capacity));
	const quarter = Math.floor(ratio * RACK_SPRITE_FRAMES);
	return Math.min(RACK_SPRITE_FRAMES - 1, Math.max(0, quarter));
}

function updateRackSprites() {
	const rackImages = document.querySelectorAll('.rackClip img');
	if (!rackImages.length) {
		return;
	}
	const racks = ensureRackInventory();
	const frameShift = 100 / RACK_SPRITE_FRAMES;

	rackImages.forEach((img, index) => {
		const rack = racks[index] || {};
		const capacity = getRackCapacity(index);
		const used = getRackUsedCount(rack);
		const quarter = getRackFillQuarter(used, capacity);
		img.style.transform = `translateX(-${quarter * frameShift}%)`;
	});
}

function buyRack(index) {
	const config = getRackConfig(index);
	if (!config || config.unlocked) {
		return false;
	}
	const price = Number(config.price) || 0;
	if (price > 0) {
		const afford = typeof canAfford === 'function'
			? canAfford(price)
			: Number(PLAYER.money) >= price;
		if (!afford) {
			return false;
		}
		if (typeof spendMoney === 'function') {
			spendMoney(price);
		} else {
			PLAYER.money = Math.max(0, Number(PLAYER.money) - price);
		}
	}
	config.unlocked = true;
	ensureRackInventory();
	updateRackSprites();
	if (typeof renderInventory === 'function') {
		renderInventory();
	}
	if (typeof updateDisplay === 'function') {
		updateDisplay();
	}
	return true;
}
