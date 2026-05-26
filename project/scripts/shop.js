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
	const spent = Math.max(0, moneyBefore - PLAYER.money);
	if (typeof recordMoneySpent === 'function') {
		recordMoneySpent(spent);
	} else if (DATA.stats) {
		DATA.stats.totalMoneySpent = (Number(DATA.stats.totalMoneySpent) || 0) + spent;
	}
	const moneyDecimals = typeof MONEY_DECIMALS === 'number' ? MONEY_DECIMALS : 2;
	if (typeof roundToDecimals === 'function') {
		PLAYER.money = roundToDecimals(PLAYER.money, moneyDecimals);
	} else {
		const factor = 10 ** moneyDecimals;
		PLAYER.money = Math.round(PLAYER.money * factor) / factor;
	}
	updateDisplay();
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

function positionShopDetails(img, details) {
	const rect = img.getBoundingClientRect();
	const margin = 12;
	details.style.display = 'block';
	details.style.visibility = 'hidden';
	const detailsRect = details.getBoundingClientRect();
	let left = rect.right + margin;
	if (left + detailsRect.width > window.innerWidth) {
		left = rect.left - detailsRect.width - margin;
	}
	if (left < margin) {
		left = margin;
	}
	let top = rect.top;
	if (top + detailsRect.height > window.innerHeight - margin) {
		top = window.innerHeight - detailsRect.height - margin;
	}
	if (top < margin) {
		top = margin;
	}
	details.style.left = `${Math.round(left)}px`;
	details.style.top = `${Math.round(top)}px`;
	details.style.visibility = 'visible';
}

function attachShopHover(container) {
	if (!container) {
		return;
	}
	const items = container.querySelectorAll('.shopItem');
	items.forEach((item) => {
		const img = item.querySelector('img');
		const details = item.nextElementSibling;
		if (!img || !details || !details.classList.contains('shopDetails')) {
			return;
		}
		const showDetails = () => positionShopDetails(img, details);
		const hideDetails = () => {
			details.style.display = 'none';
		};
		img.addEventListener('mouseenter', showDetails);
		img.addEventListener('mouseleave', hideDetails);
		img.addEventListener('focus', showDetails);
		img.addEventListener('blur', hideDetails);
	});
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
				<div class="shopItemPrice"><strong>Price:</strong> $${formatCompactMoney(gpu.price)}</div>
				<div class="shopBtn" onclick="buyGpu('${id}')">Buy</div>
			</div>
		</div>

		<div class="shopDetails" style="display: none;">
			<span class="shopItemDetailName">Name: ${gpu.name}</span>
			<span class="shopItemDetailPrice">Price: ${formatCompactMoney(gpu.price)}</span>
			<span class="shopItemDetailPower">Power: ${gpu.power}</span>
			<span class="shopItemDetailEnergyUse">Energy Use: ${gpu.energyUse}</span>
			<span class="shopItemDetailDesc">Description${gpu.description}</span>
		</div>
		`;
	});
	shopContainer.innerHTML = tempString;
	attachShopHover(shopContainer);
}

function loadEnergyShop() {
	const energyShopContainer = SCREENS.pcScreen.energy;
	if (!energyShopContainer) {
		console.error("Energy shop container not found");
		return;
	}
	let tempString = '';
	Object.entries(DATA.energySupply).forEach(([id, source]) => {
		const energyImg = source.img || "img/energy.png";
		tempString += `
		<div class="shopItem">
			<img src="${energyImg}" onerror="this.src='img/energy.png'">
			<div class="shopItemInfo">
				<div class="shopItemName">${source.name}</div>
				<div class="shopItemPrice"><strong>Price:</strong> $${formatCompactMoney(source.price)}</div>
				<div class="shopBtn" onclick="buyEnergySupply('${id}')">Buy</div>
			</div>
		</div>

		<div class="shopDetails" style="display: none;">
			<span class="energyItemDetailName">Name: ${source.name}</span>
			<span class="energyItemDetailPrice">Price: ${formatCompactMoney(source.price)}</span>
			<span class="energyItemDetailOutput">Energy: ${source.output}</span>
			<span class="energyItemDetailUpKeep">Cost per sec: ${source.upkeep}</span>
			<span class="energyItemDetailDesc">Description: ${source.description}</span>
		</div>
		`;
	});
	energyShopContainer.innerHTML = tempString;
	attachShopHover(energyShopContainer);
}