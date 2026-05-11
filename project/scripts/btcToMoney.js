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
	for (let i = 0; i < points; i += 1) {
		if (i !== 0) {
			const drift = (Math.random() - 0.5) * 0.08;
			value = clampValue(value * (1 + drift), BTC_RATE_MIN, BTC_RATE_MAX);
		}
		BTC_RATE_HISTORY.push({ time: i, value: Math.round(value) });
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
				<input type="number" min="0.0001" max="${formatBtc(PLAYER.bitcoin)}" id="btcSellAmount" step="1" placeholder="BTC" />
				<button class="sellBtn" onclick="sellBitcoinFromInput()">Sell</button>
				<button class="sellBtn" onclick="sellAllBitcoin()">Sell all</button>
			</div>
		</div>
		<div class="sellChart" id="btcChart"></div>
	`;

	ensureBtcChart();
	updateSellRateDisplay();
}

//Template von KI selbst bearbeitet und abgeändert
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

