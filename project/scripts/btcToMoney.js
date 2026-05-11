const BTC_RATE_STATE = {
	value: Number(DATA.bitcoinToMoney) || 3600,
	target: Number(DATA.bitcoinToMoney) || 3600,
	velocity: 0,
};

const BTC_RATE_HISTORY = [];
const BTC_RATE_MAX_POINTS = 120;

const BTC_CHART_STATE = {
	chart: null,
	series: null,
	container: null,
	lastTime: 0,
};

function clampValue(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

function initBtcToMoney() {
	const baseValue = Number(DATA.bitcoinToMoney) || 3600;
	BTC_RATE_STATE.value = baseValue;
	BTC_RATE_STATE.target = baseValue;
	BTC_RATE_STATE.velocity = 0;
}

function updateBtcToMoney(seconds = 1) {
	if (!Number.isFinite(BTC_RATE_STATE.value)) {
		initBtcToMoney();
	}

	let minRate = 800;
	let maxRate = 12000;
	const targetShiftChance = 0.12 * seconds;
	if (Math.random() < targetShiftChance) {
		const shift = 1 + (Math.random() - 0.5) * 0.2;
		BTC_RATE_STATE.target = clampValue(BTC_RATE_STATE.target * shift, minRate, maxRate);
	}

	let pull = (BTC_RATE_STATE.target - BTC_RATE_STATE.value) * 0.15;
	let noise = (Math.random() - 0.5) * BTC_RATE_STATE.value * 0.02;
	BTC_RATE_STATE.velocity = (BTC_RATE_STATE.velocity + pull + noise) * 0.85;
	BTC_RATE_STATE.value = clampValue(
		BTC_RATE_STATE.value + BTC_RATE_STATE.velocity * seconds,
		minRate,
		maxRate
	);

	DATA.bitcoinToMoney = Math.round(BTC_RATE_STATE.value);
	pushBtcRatePoint(DATA.bitcoinToMoney);
	updateSellRateDisplay();
	return DATA.bitcoinToMoney;
}

function pushBtcRatePoint(value) {
	const time = Math.floor(Date.now() / 1000);
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
				<input type="number" id="btcSellAmount" min="0" step="0.0001" placeholder="BTC" />
				<button onclick="sellBitcoinFromInput()">Sell</button>
				<button onclick="sellAllBitcoin()">Sell all</button>
			</div>
		</div>
		<div class="sellChart" id="btcChart"></div>
	`;

	ensureBtcChart();
	updateSellRateDisplay();
}

function ensureBtcChart() {
	const container = document.getElementById('btcChart');
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
		width: container.clientWidth || 400,
		height: container.clientHeight || 220,
		layout: {
			background: { color: '#0f0f0f' },
			textColor: '#d8d8d8',
			attributionLogo: false,
		},
		grid: {
			vertLines: { color: '#54bbff' },
			horzLines: { color: '#54bbff' },
		},
		rightPriceScale: { borderColor: '#333' },
		timeScale: { borderColor: '#333', timeVisible: true, secondsVisible: true },
	});

	BTC_CHART_STATE.series = BTC_CHART_STATE.chart.addAreaSeries({
		lineColor: '#00ccff',
		topColor: 'rgba(0, 204, 255, 0.3)',
		bottomColor: 'rgba(0, 204, 255, 0.0)',
	});

	if (BTC_RATE_HISTORY.length) {
		BTC_CHART_STATE.series.setData(BTC_RATE_HISTORY);
	}

	window.addEventListener('resize', () => {
		if (!BTC_CHART_STATE.chart || !BTC_CHART_STATE.container) {
			return;
		}
		BTC_CHART_STATE.chart.resize(
			BTC_CHART_STATE.container.clientWidth || 400,
			BTC_CHART_STATE.container.clientHeight || 220
		);
	});
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

