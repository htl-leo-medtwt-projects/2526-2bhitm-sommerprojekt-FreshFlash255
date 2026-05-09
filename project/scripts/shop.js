/// <reference path="../data/gameData.js" />
/// <reference path="inventoryScript.js" />
/// <reference path="togglePages.js" />

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

function loadShop() {
	const shopContainer = SCREENS.pcScreen.shop;
	if (!shopContainer) {
		return;
	}
	let tempString = '';
	Object.entries(DATA.graphicCards).forEach(([id, gpu]) => {
		tempString += `
		<div class="shopItem">
			<img src="${gpu.img}">
			<div class="shopItemInfo">
				<div class="shopItemName">${gpu.name}</div>
				<div class="shopItemPrice"><strong>Price:</strong> $${gpu.price}</div>
				<button onclick="buyGpu('${id}')">Buy</button>
			</div>
		</div>
		`;
	});
	shopContainer.innerHTML = tempString;
}

function loadEnergyShop() {
	const energyShopContainer = SCREENS.pcScreen.energy;
	if (!energyShopContainer) {
		return;
	}
	let tempString = '';
	Object.entries(DATA.energySupply).forEach(([id, source]) => {
		const energyImg = 'img/energy.png';
		tempString += `
		<div class="shopItem">
			<img src="${energyImg}">
			<div class="shopItemInfo">
				<div class="shopItemName">${source.name}</div>
				<div class="shopItemPrice"><strong>Price:</strong> $${source.price}</div>
				<button onclick="buyEnergySupply('${id}')">Buy</button>
			</div>
		</div>
		`;
	});
	energyShopContainer.innerHTML = tempString;
}