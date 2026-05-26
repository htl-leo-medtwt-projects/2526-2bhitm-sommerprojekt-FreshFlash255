/// <reference path="../data/gameData.js" />

const INVENTORY_UI = {
	player: document.getElementById('playerInventory'),
	rack: document.getElementById('rackInventory'),
};

const RACK_SPRITE_FRAMES = 4;
let activeRackIndex = 0;

function getInventoryBucket(key) {
	if (!PLAYER[key] || typeof PLAYER[key] !== 'object' || Array.isArray(PLAYER[key])) {
		PLAYER[key] = {};
	}
	return PLAYER[key];
}

function getRackCount() {
	if (typeof DATA !== 'undefined' && DATA && Array.isArray(DATA.racks)) {
		return DATA.racks.length;
	}
	if (Array.isArray(PLAYER.rackInventory)) {
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

function getItemCount(bucket, itemId) {
	if (!bucket || typeof bucket !== 'object') {
		return 0;
	}
	return Number(bucket[itemId]) || 0;
}

function addItemToInventory(itemId, amount = 1) {
	if (!DATA.graphicCards[itemId]) {
		return;
	}
	const inventory = getInventoryBucket('graphicCardsInventory');
	inventory[itemId] = getItemCount(inventory, itemId) + amount;
	renderInventory();
}

function removeItemFromInventory(itemId, amount = 1) {
	const inventory = getInventoryBucket('graphicCardsInventory');
	const nextAmount = getItemCount(inventory, itemId) - amount;
	if (nextAmount <= 0) {
		delete inventory[itemId];
	} else {
		inventory[itemId] = nextAmount;
	}
	renderInventory();
}

function installGpu(itemId, amount = 1, rackIndex) {
	const inventory = getInventoryBucket('graphicCardsInventory');
	const resolvedIndex = Number.isInteger(rackIndex) ? rackIndex : getActiveRackIndex();
	if (resolvedIndex === null || resolvedIndex === undefined) {
		return;
	}
	if (!isRackUnlocked(resolvedIndex)) {
		return;
	}
	const rack = getRackBucket(resolvedIndex);
	if (!rack) {
		return;
	}
	if (getItemCount(inventory, itemId) < amount) {
		return;
	}
	const capacity = getRackCapacity(resolvedIndex);
	const used = getRackUsedCount(rack);
	if (capacity > 0 && used + amount > capacity) {
		return;
	}
	inventory[itemId] = getItemCount(inventory, itemId) - amount;
	if (inventory[itemId] <= 0) {
		delete inventory[itemId];
	}
	rack[itemId] = getItemCount(rack, itemId) + amount;
	renderInventory();
}

function uninstallGpu(itemId, amount = 1, rackIndex) {
	const inventory = getInventoryBucket('graphicCardsInventory');
	const resolvedIndex = Number.isInteger(rackIndex) ? rackIndex : findRackIndexForGpu(itemId);
	if (resolvedIndex === null || resolvedIndex === undefined) {
		return;
	}
	const rack = getRackBucket(resolvedIndex);
	if (!rack) {
		return;
	}
	if (getItemCount(rack, itemId) < amount) {
		return;
	}
	rack[itemId] = getItemCount(rack, itemId) - amount;
	if (rack[itemId] <= 0) {
		delete rack[itemId];
	}
	inventory[itemId] = getItemCount(inventory, itemId) + amount;
	renderInventory();
}

function calculateTotals(bucket) {
	let totalCount = 0;
	let totalPower = 0;
	let totalEnergyUse = 0;

	Object.entries(bucket).forEach(([id, count]) => {
		const amount = Number(count) || 0;
		const gpu = DATA.graphicCards[id];
		if (!gpu || amount <= 0) {
			return;
		}
		totalCount += amount;
		totalPower += gpu.power * amount;
		totalEnergyUse += gpu.energyUse * amount;
	});

	return { totalCount, totalPower, totalEnergyUse };
}

function buildItem(id, gpu, count, options = {}) {
	const actionsHtml = options.actionsHtml || '';
	const clickHandler = options.clickHandler ? ` onclick="${options.clickHandler}"` : '';

	return `
		<div class="inventoryItem"${clickHandler}>
			<div class="inventoryItemInfo">
				<div class="inventoryItemName">${gpu.name}</div>
				<img class="gpuImg" src="${gpu.img}">
			</div>
			<div class="inventoryItemCount">x${count}</div>
			${actionsHtml}
		</div>
	`;
}

function renderPlayerInventory() {
	if (!INVENTORY_UI.player) {
		return;
	}
	const inventory = getInventoryBucket('graphicCardsInventory');
	const rackIndex = getActiveRackIndex();
	const itemsHtml = Object.entries(DATA.graphicCards)
		.map(([id, gpu]) => {
			const count = getItemCount(inventory, id);
			return buildItem(id, gpu, count, { clickHandler: `installGpu('${id}', 1, ${rackIndex})` });
		})
		.join('');
	const totals = calculateTotals(inventory);

	INVENTORY_UI.player.innerHTML = `
		<div class="inventoryTitle">Inventar</div>
		<div class="inventoryList">${itemsHtml}</div>
	`;
}

function renderRackInventory() {
	if (!INVENTORY_UI.rack) {
		return;
	}
	const rackIndex = getActiveRackIndex();
	const rack = getRackBucket(rackIndex);
	if (!rack) {
		INVENTORY_UI.rack.innerHTML = `
			<div class="inventoryTitle">Rack</div>
			<div class="inventoryEmpty">Keine Racks verfuegbar.</div>
		`;
		return;
	}
	const title = `Rack ${rackIndex + 1}`;
	const config = getRackConfig(rackIndex);
	const capacity = getRackCapacity(rackIndex);
	const used = getRackUsedCount(rack);
	const slotLabel = capacity > 0 ? `${used}/${capacity}` : `${used}`;

	if (!isRackUnlocked(rackIndex)) {
		const price = config ? Number(config.price) : 0;
		const priceLabel = Number.isFinite(price) && price > 0 ? `Preis: ${price}` : '';
		INVENTORY_UI.rack.innerHTML = `
			<div class="inventoryTitle">${title}</div>
			<div class="inventoryEmpty">Gesperrt${priceLabel ? ` - ${priceLabel}` : ''}</div>
		`;
		return;
	}

	const entries = Object.entries(rack).filter(([, count]) => Number(count) > 0);
	if (entries.length === 0) {
		INVENTORY_UI.rack.innerHTML = `
			<div class="inventoryTitle">${title}</div>
			<div class="inventoryEmpty">Keine GPUs eingebaut.</div>
			<div class="inventorySummary">Slots: ${slotLabel}</div>
		`;
		return;
	}

	const itemsHtml = entries
		.map(([id, count]) => {
			const gpu = DATA.graphicCards[id];
			if (!gpu) {
				return '';
			}
			return buildItem(id, gpu, Number(count) || 0, { clickHandler: `uninstallGpu('${id}', 1, ${rackIndex})` });
		})
		.join('');
	const totals = calculateTotals(rack);

	INVENTORY_UI.rack.innerHTML = `
		<div class="inventoryTitle">${title}</div>
		<div class="inventoryList">${itemsHtml}</div>
		<div class="inventorySummary">Slots: ${slotLabel} | Power: ${totals.totalPower} | Energy: ${totals.totalEnergyUse}</div>
	`;
}

function renderInventory() {
	if (!DATA || !PLAYER) {
		return;
	}
	renderPlayerInventory();
	renderRackInventory();
	updateRackSprites();
}