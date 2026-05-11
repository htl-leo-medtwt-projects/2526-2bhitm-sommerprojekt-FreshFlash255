/// <reference path="../data/gameData.js" />
/// <reference path="inventoryScript.js" />
/// <reference path="togglePages.js" />

//=== GPUS ===

function canAfford(price) {
	return Number(PLAYER.money) >= Number(price);
}

function spendMoney(price) {
	const moneyBefore = Number(PLAYER.money);
	PLAYER.money = Math.max(0, moneyBefore - Number(price));
	if (DATA.stats) {
		DATA.stats.totalMoneySpent = (Number(DATA.stats.totalMoneySpent) || 0) + Math.max(0, moneyBefore - PLAYER.money);
	}
	const moneyDecimals = typeof MONEY_DECIMALS === 'number' ? MONEY_DECIMALS : 2;
	if (typeof roundToDecimals === 'function') {
		PLAYER.money = roundToDecimals(PLAYER.money, moneyDecimals);
	} else {
		const factor = 10 ** moneyDecimals;
		PLAYER.money = Math.round(PLAYER.money * factor) / factor;
	}
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
		console.error("Shop container not found");
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
		console.error("Energy shop container not found");
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