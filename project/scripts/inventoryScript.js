/// <reference path="inventoryScript.js" />

// Simple GPU inventory: player inventory + rack inventory.
const INVENTORY_UI = {
	player: document.getElementById('playerInventory'),
	rack: document.getElementById('rackInventory'),
};

function getInventoryBucket(key) {
	if (!PLAYER[key]) {
		PLAYER[key] = {};
	}
	return PLAYER[key];
}

function getItemCount(bucket, itemId) {
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

function installGpu(itemId, amount = 1) {
	const inventory = getInventoryBucket('graphicCardsInventory');
	const rack = getInventoryBucket('rackInventory');
	if (getItemCount(inventory, itemId) < amount) {
		return;
	}
	inventory[itemId] = getItemCount(inventory, itemId) - amount;
	if (inventory[itemId] <= 0) {
		delete inventory[itemId];
	}
	rack[itemId] = getItemCount(rack, itemId) + amount;
	renderInventory();
}

function uninstallGpu(itemId, amount = 1) {
	const inventory = getInventoryBucket('graphicCardsInventory');
	const rack = getInventoryBucket('rackInventory');
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

function buildItemHtml(id, gpu, count, actionsHtml) {
	return `
		<div class="inventoryItem">
			<div class="inventoryItemInfo">
				<div class="inventoryItemName">${gpu.name}</div>
				<div class="inventoryItemDesc">${gpu.description}</div>
			</div>
			<div class="inventoryItemCount">x${count}</div>
			<div class="inventoryActions">${actionsHtml}</div>
		</div>
	`;
}

function renderPlayerInventory() {
	if (!INVENTORY_UI.player) {
		return;
	}
	const inventory = getInventoryBucket('graphicCardsInventory');
	const itemsHtml = Object.entries(DATA.graphicCards)
		.map(([id, gpu]) => {
			const count = getItemCount(inventory, id);
			const actions = `
				<button onclick="addItemToInventory('${id}')">+</button>
				<button onclick="removeItemFromInventory('${id}')">-</button>
				<button onclick="installGpu('${id}')">Einbauen</button>
			`;
			return buildItemHtml(id, gpu, count, actions);
		})
		.join('');
	const totals = calculateTotals(inventory);

	INVENTORY_UI.player.innerHTML = `
		<div class="inventoryTitle">Dein Inventar</div>
		<div class="inventoryList">${itemsHtml}</div>
		<div class="inventorySummary">GPUs: ${totals.totalCount}</div>
	`;
}

function renderRackInventory() {
	if (!INVENTORY_UI.rack) {
		return;
	}
	const rack = getInventoryBucket('rackInventory');
	const entries = Object.entries(rack).filter(([, count]) => Number(count) > 0);

	if (entries.length === 0) {
		INVENTORY_UI.rack.innerHTML = `
			<div class="inventoryTitle">Rack</div>
			<div class="inventoryEmpty">Keine GPUs eingebaut.</div>
		`;
		return;
	}

	const itemsHtml = entries
		.map(([id, count]) => {
			const gpu = DATA.graphicCards[id];
			if (!gpu) {
				return '';
			}
			const actions = `
				<button onclick="uninstallGpu('${id}')">Ausbauen</button>
			`;
			return buildItemHtml(id, gpu, Number(count) || 0, actions);
		})
		.join('');
	const totals = calculateTotals(rack);

	INVENTORY_UI.rack.innerHTML = `
		<div class="inventoryTitle">Rack</div>
		<div class="inventoryList">${itemsHtml}</div>
		<div class="inventorySummary">GPUs: ${totals.totalCount} | Power: ${totals.totalPower} | Energy: ${totals.totalEnergyUse}</div>
	`;
}

function renderInventory() {
	if (!DATA || !PLAYER) {
		return;
	}
	renderPlayerInventory();
	renderRackInventory();
}