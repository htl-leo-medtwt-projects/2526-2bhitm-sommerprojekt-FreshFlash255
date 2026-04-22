/// <reference path="../data/gameData.js" />
/// <reference path="inventoryScript.js" />

//=== GPUS ===

function canAfford(price) {
	return Number(PLAYER.money) >= Number(price);
}

function spendMoney(price) {
	PLAYER.money = Math.max(0, Number(PLAYER.money) - Number(price));
}

function buyGpu(id) {
	const gpu = DATA.graphicCards[id];
	if (!gpu) {
		return false;
	}
	if (!canAfford(gpu.price)) {
		return false;
	}
	spendMoney(gpu.price);
	addItemToInventory(id, 1);
	return true;
}

//=== ENERGY SUPPLY ===

function addEnergySupplyItem(id, amount = 1) {
	if (!DATA.energySupply[id]) {
		return;
	}
	if (!PLAYER.energySupply) {
		PLAYER.energySupply = {};
	}
	const current = Number(PLAYER.energySupply[id]) || 0;
	PLAYER.energySupply[id] = current + amount;
}

function buyEnergySupply(id) {
	const source = DATA.energySupply[id];
	if (!source) {
		return false;
	}
	if (!canAfford(source.price)) {
		return false;
	}
	spendMoney(source.price);
	addEnergySupplyItem(id, 1);
	return true;
}
