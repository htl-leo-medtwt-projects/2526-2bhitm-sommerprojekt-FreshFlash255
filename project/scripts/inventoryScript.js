/// <reference path="../data/gameData.js" />
/// <reference path="racks.js" />

const INVENTORY_UI = {
	player: document.getElementById('playerInventory'),
	rack: document.getElementById('rackInventory'),
};

function getInventoryBucket(key) {
	if (!PLAYER[key] || typeof PLAYER[key] !== 'object' || Array.isArray(PLAYER[key])) {
		PLAYER[key] = {};
	}
	return PLAYER[key];
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
		const formattedPrice = Number.isFinite(price)
			? (typeof formatCompactMoney === 'function' ? formatCompactMoney(price) : String(Math.round(price)))
			: '0';
		const buttonLabel = Number.isFinite(price) && price > 0
			? `Buy $${formattedPrice}`
			: 'Buy Free';
		INVENTORY_UI.rack.innerHTML = `
			<div class="inventoryTitle">${title}</div>
			<div class="inventoryLocked">
				<div class="inventoryEmpty">Gesperrt</div>
				<div class="shopBtn" onclick="buyRack(${rackIndex})">${buttonLabel}</div>
			</div>
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