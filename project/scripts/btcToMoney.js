const BTC_RATE_STATE = {
	value: Number(DATA.bitcoinToMoney) || 3600,
	target: Number(DATA.bitcoinToMoney) || 3600,
	velocity: 0,
};

const BTC_RATE_HISTORY = [];
const BTC_RATE_MAX_POINTS = 120;
const BTC_RATE_MIN = 800;
const BTC_RATE_MAX = 12000;
const BTC_RATE_SEED_POINTS = 100;

const BTC_CHART_STATE = {
	chart: null,
	series: null,
	container: null,
	lastTime: 0,
	startTime: 0,
};

function clampValue(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

function seedBtcRateHistory(baseValue) {
	BTC_RATE_HISTORY.length = 0;
	const points = Math.min(BTC_RATE_SEED_POINTS, BTC_RATE_MAX_POINTS);
	let value = clampValue(baseValue, BTC_RATE_MIN, BTC_RATE_MAX);
	let minValue = value;
	let maxValue = value;
	let sumValue = 0;
	for (let i = 0; i < points; i += 1) {
		if (i !== 0) {
			const drift = (Math.random() - 0.5) * 0.08;
			value = clampValue(value * (1 + drift), BTC_RATE_MIN, BTC_RATE_MAX);
		}
		const rounded = Math.round(value);
		BTC_RATE_HISTORY.push({ time: i, value: rounded });
		minValue = Math.min(minValue, rounded);
		maxValue = Math.max(maxValue, rounded);
		sumValue += rounded;
	}
	if (DATA.stats) {
		DATA.stats.btcRateMin = minValue;
		DATA.stats.btcRateMax = maxValue;
		DATA.stats.btcRateSum = sumValue;
		DATA.stats.btcRateSamples = points;
	}
}

function initBtcToMoney() {
	const baseValue = Number(DATA.bitcoinToMoney) || 3600;
	if (!BTC_RATE_HISTORY.length) {
		seedBtcRateHistory(baseValue);
	}
	if (BTC_RATE_HISTORY.length) {
		const lastValue = BTC_RATE_HISTORY[BTC_RATE_HISTORY.length - 1].value;
		BTC_RATE_STATE.value = lastValue;
		BTC_RATE_STATE.target = lastValue;
		BTC_RATE_STATE.velocity = 0;
		DATA.bitcoinToMoney = lastValue;
	} else {
		BTC_RATE_STATE.value = baseValue;
		BTC_RATE_STATE.target = baseValue;
		BTC_RATE_STATE.velocity = 0;
	}
	const now = Math.floor(Date.now() / 1000);
	const offset = Math.max(0, BTC_RATE_HISTORY.length - 1);
	BTC_CHART_STATE.startTime = now - offset;
}

function updateBtcToMoney(seconds = 1) {
	if (!Number.isFinite(BTC_RATE_STATE.value)) {
		initBtcToMoney();
	}
	if (!BTC_CHART_STATE.startTime) {
		BTC_CHART_STATE.startTime = Math.floor(Date.now() / 1000);
	}

	const targetShiftChance = 0.12 * seconds;
	if (Math.random() < targetShiftChance) {
		const shift = 1 + (Math.random() - 0.5) * 0.2;
		BTC_RATE_STATE.target = clampValue(BTC_RATE_STATE.target * shift, BTC_RATE_MIN, BTC_RATE_MAX);
	}

	let pull = (BTC_RATE_STATE.target - BTC_RATE_STATE.value) * 0.15;
	let noise = (Math.random() - 0.5) * BTC_RATE_STATE.value * 0.02;
	BTC_RATE_STATE.velocity = (BTC_RATE_STATE.velocity + pull + noise) * 0.85;
	BTC_RATE_STATE.value = clampValue(
		BTC_RATE_STATE.value + BTC_RATE_STATE.velocity * seconds,
		BTC_RATE_MIN,
		BTC_RATE_MAX
	);

	DATA.bitcoinToMoney = Math.round(BTC_RATE_STATE.value);
	if (DATA.stats) {
		const rate = DATA.bitcoinToMoney;
		const currentMin = Number.isFinite(DATA.stats.btcRateMin) ? DATA.stats.btcRateMin : rate;
		const currentMax = Number.isFinite(DATA.stats.btcRateMax) ? DATA.stats.btcRateMax : rate;
		DATA.stats.btcRateMin = Math.min(currentMin, rate);
		DATA.stats.btcRateMax = Math.max(currentMax, rate);
		DATA.stats.btcRateSum = (Number(DATA.stats.btcRateSum) || 0) + rate;
		DATA.stats.btcRateSamples = (Number(DATA.stats.btcRateSamples) || 0) + 1;
	}
	pushBtcRatePoint(DATA.bitcoinToMoney);
	updateSellRateDisplay();
	return DATA.bitcoinToMoney;
}

function pushBtcRatePoint(value) {
	const time = Math.max(0, Math.floor(Date.now() / 1000) - BTC_CHART_STATE.startTime);
	const lastIndex = BTC_RATE_HISTORY.length - 1;
	const point = { time, value };

	if (lastIndex >= 0 && BTC_RATE_HISTORY[lastIndex].time === time) {
		BTC_RATE_HISTORY[lastIndex] = point;
	} else {
		BTC_RATE_HISTORY.push(point);
		if (BTC_RATE_HISTORY.length > BTC_RATE_MAX_POINTS) {
			BTC_RATE_HISTORY.shift();
		}
	}

	if (BTC_CHART_STATE.series) {
		BTC_CHART_STATE.series.update(point);
	}
}

function formatBtc(value) {
	return Number(value || 0).toFixed(4);
}

function formatPlayTime(time) {
	const totalSeconds = Math.max(0, Math.floor(Number(time) || 0));
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function formatMoney(value) {
	const decimals = typeof MONEY_DECIMALS === 'number' ? MONEY_DECIMALS : 2;
	return Number(value || 0).toFixed(decimals);
}

function formatBtcTotal(value) {
	const decimals = typeof BITCOIN_DECIMALS === 'number' ? BITCOIN_DECIMALS : 4;
	return Number(value || 0).toFixed(decimals);
}

function formatRate(value) {
	return Math.round(Number(value) || 0);
}

function sellBitcoin(amount) {
	const amountNumber = Number(amount);
	if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
		return false;
	}
	const sellAmount = Math.min(amountNumber, Number(PLAYER.bitcoin) || 0);
	if (sellAmount <= 0) {
		return false;
	}
	const rate = Number(DATA.bitcoinToMoney) || 0;
	const payout = sellAmount * rate;
	PLAYER.bitcoin = Math.max(0, Number(PLAYER.bitcoin) - sellAmount);
	PLAYER.money = Number(PLAYER.money) + payout;
	if (DATA.stats) {
		DATA.stats.totalMoneyEarned = (Number(DATA.stats.totalMoneyEarned) || 0) + payout;
	}
	const moneyDecimals = typeof MONEY_DECIMALS === 'number' ? MONEY_DECIMALS : 2;
	if (typeof roundToDecimals === 'function') {
		PLAYER.money = roundToDecimals(PLAYER.money, moneyDecimals);
	} else {
		const factor = 10 ** moneyDecimals;
		PLAYER.money = Math.round(PLAYER.money * factor) / factor;
	}
	if (typeof updateDisplay === 'function') {
		updateDisplay();
	}
	updateSellRateDisplay();
	return true;
}

function sellAllBitcoin() {
	return sellBitcoin(PLAYER.bitcoin);
}

function sellBitcoinFromInput() {
	const input = document.getElementById('btcSellAmount');
	if (!input) {
		return;
	}
	sellBitcoin(input.value);
	input.value = '';
}

function renderSellScreen() {
	const sellScreen = SCREENS.pcScreen.sell;
	if (!sellScreen) {
		return;
	}

	sellScreen.innerHTML = `
		<div class="sellPanel">
			<div class="sellTitle">BTC verkaufen</div>
			<div class="sellRate">Kurs: $<span id="btcRateValue">${DATA.bitcoinToMoney}</span></div>
			<div class="sellHoldings">Dein BTC: <span id="btcHoldingsValue">${formatBtc(PLAYER.bitcoin)}</span></div>
			<div class="sellControls">
				<input type="number" min="0.0001" max="${formatBtc(PLAYER.bitcoin)}" id="btcSellAmount" step="1" placeholder="BTC" />
				<button class="sellBtn" onclick="sellBitcoinFromInput()">Sell</button>
				<button class="sellBtn" onclick="sellAllBitcoin()">Sell all</button>
			</div>
		</div>
		<div class="sellChart" id="btcChart"></div>
	`;

	ensureBtcChart('btcChart');
	updateSellRateDisplay();
}

function renderHomeScreen() {
	const homeScreen = SCREENS.pcScreen.home;
	if (!homeScreen) {
		return;
	}

	homeScreen.innerHTML = `
		<div class="homePanel">
			<div class="homeChart" id="btcChartHome"></div>
			<aside class="homeStats">
				<div class="homeStatsTitle">Overall Stats</div>
				<div class="homeStatsList">
					<div class="homeStatRow"><span>Playtime</span><span id="statPlaytime">0:00</span></div>
					<div class="homeStatRow"><span>BTC mined</span><span id="statBtcMined">0</span></div>
					<div class="homeStatRow"><span>Money earned</span><span id="statMoneyEarned">0</span></div>
					<div class="homeStatRow"><span>Money spent</span><span id="statMoneySpent">0</span></div>
					<div class="homeStatRow"><span>Rate min</span><span id="statBtcRateMin">0</span></div>
					<div class="homeStatRow"><span>Rate max</span><span id="statBtcRateMax">0</span></div>
					<div class="homeStatRow"><span>Rate avg</span><span id="statBtcRateAvg">0</span></div>
				</div>
			</aside>
		</div>
	`;

	ensureBtcChart('btcChartHome');
	updateHomeStatsDisplay();
}

//Template von KI selbst bearbeitet und abgeändert
function ensureBtcChart(containerId = 'btcChart') {
	const container = document.getElementById(containerId);
	if (!container || typeof LightweightCharts === 'undefined') {
		return;
	}

	if (BTC_CHART_STATE.container === container && BTC_CHART_STATE.chart) {
		return;
	}

	if (BTC_CHART_STATE.chart && typeof BTC_CHART_STATE.chart.remove === 'function') {
		BTC_CHART_STATE.chart.remove();
	}

	BTC_CHART_STATE.container = container;
	BTC_CHART_STATE.chart = LightweightCharts.createChart(container, {
		width: container.clientWidth,
		height: container.clientHeight,
		layout: {
			background: { color: '#0f0f0f' },
			textColor: '#d8d8d8',
			attributionLogo: false,
			fontFamily: 'Pixeled',
			fontSize: 12,
		},
		grid: {
			vertLines: {
				color: '#0e1c24',
				lineStyle: LightweightCharts.LineStyle.LargeDashed,
			},
			horzLines: {
				color: '#0e1c24',
				lineStyle: LightweightCharts.LineStyle.LargeDashed,
			},
		},
		crosshair: {
			vertLine: {
				color: '#00ccff',
				width: 2,
				style: LightweightCharts.LineStyle.Solid,
			},
			horzLine: {
				color: '#00ccff',
				width: 2,
				style: LightweightCharts.LineStyle.Solid,
			},
		},
		rightPriceScale: { borderColor: '#333' },
		timeScale: {
			borderColor: '#333',
			timeVisible: true,
			secondsVisible: true,
			tickMarkFormatter: formatPlayTime,
		},
		localization: {
			timeFormatter: formatPlayTime,
		},
	});

	BTC_CHART_STATE.series = BTC_CHART_STATE.chart.addSeries(
		LightweightCharts.AreaSeries,
		{
			lineColor: '#004353',
			lineWidth: 2,
			topColor: 'rgba(0, 204, 255, 0.3)',
			bottomColor: 'rgba(0, 204, 255, 0.0)',
		}
	);

	if (BTC_RATE_HISTORY.length) {
		BTC_CHART_STATE.series.setData(BTC_RATE_HISTORY);
	}

	//AI
	window.addEventListener('resize', () => {
		if (!BTC_CHART_STATE.chart || !BTC_CHART_STATE.container) {
			return;
		}
		BTC_CHART_STATE.chart.resize(
			BTC_CHART_STATE.container.clientWidth,
			BTC_CHART_STATE.container.clientHeight
		);
	});
}

function updateHomeStatsDisplay() {
	const stats = DATA.stats || {};
	const playtimeEl = document.getElementById('statPlaytime');
	if (playtimeEl) {
		playtimeEl.textContent = formatPlayTime(stats.playTimeSeconds);
	}
	const btcMinedEl = document.getElementById('statBtcMined');
	if (btcMinedEl) {
		btcMinedEl.textContent = formatBtcTotal(stats.totalBtcMined);
	}
	const moneyEarnedEl = document.getElementById('statMoneyEarned');
	if (moneyEarnedEl) {
		moneyEarnedEl.textContent = formatMoney(stats.totalMoneyEarned);
	}
	const moneySpentEl = document.getElementById('statMoneySpent');
	if (moneySpentEl) {
		moneySpentEl.textContent = formatMoney(stats.totalMoneySpent);
	}
	const minRateEl = document.getElementById('statBtcRateMin');
	if (minRateEl) {
		minRateEl.textContent = formatRate(stats.btcRateMin);
	}
	const maxRateEl = document.getElementById('statBtcRateMax');
	if (maxRateEl) {
		maxRateEl.textContent = formatRate(stats.btcRateMax);
	}
	const avgRateEl = document.getElementById('statBtcRateAvg');
	if (avgRateEl) {
		const samples = Number(stats.btcRateSamples) || 0;
		const avg = samples > 0 ? stats.btcRateSum / samples : stats.btcRateMin;
		avgRateEl.textContent = formatRate(avg);
	}
}

function updateSellRateDisplay() {
	const rateEl = document.getElementById('btcRateValue');
	if (rateEl) {
		rateEl.textContent = DATA.bitcoinToMoney;
	}
	const holdingsEl = document.getElementById('btcHoldingsValue');
	if (holdingsEl) {
		holdingsEl.textContent = formatBtc(PLAYER.bitcoin);
	}
}

initBtcToMoney();

