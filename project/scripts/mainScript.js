/// <reference path="togglePages.js" />
/// <reference path="../data/gameData.js" />
/// <reference path="statsHandler.js" />
/// <reference path="balanceHandler.js" />

let SETTINGS = {
    volume: 100,
}

const GAME_LOOP_INTERVAL = 1000;
const BITCOIN_PER_POWER_PER_SECOND = 0.001;
const BITCOIN_DECIMALS = 4;
const MONEY_DECIMALS = 2;
let gameLoopId = null;
let currentPower = 0;
let currentUpkeep = 0;
let oldMoney = 0;
let oldBitcoin = 0;
let oldEnergy = 0;

function startGameLoop() {
    if (gameLoopId !== null) {
        return;
    }
    gameLoopId = setInterval(gameLoop, GAME_LOOP_INTERVAL);
}

function stopGameLoop() {
    if (gameLoopId === null) {
        return;
    }
    clearInterval(gameLoopId);
    gameLoopId = null;
}

function gameLoop() {
    updateGeneratingPower();
    const seconds = GAME_LOOP_INTERVAL / 1000;

    if (typeof recordPlaytime === 'function') {
        recordPlaytime(seconds);
    } else if (DATA.stats) {
        DATA.stats.playTimeSeconds += seconds;
    }
    
    updateBtcToMoney(seconds);

    if (currentPower > 0) {
        const mined = currentPower * BITCOIN_PER_POWER_PER_SECOND * seconds;
        PLAYER.bitcoin += mined;
        if (typeof recordBtcMined === 'function') {
            recordBtcMined(mined);
        } else if (DATA.stats) {
            DATA.stats.totalBtcMined += mined;
        }
        PLAYER.bitcoin = roundToDecimals(PLAYER.bitcoin, BITCOIN_DECIMALS);
    }
    if (currentUpkeep > 0) {
        const upkeepCost = currentUpkeep * seconds;
        const moneyBefore = PLAYER.money;
        PLAYER.money = Math.max(0, PLAYER.money - upkeepCost);
        const spent = Math.max(0, moneyBefore - PLAYER.money);
        if (typeof recordMoneySpent === 'function') {
            recordMoneySpent(spent);
        } else if (DATA.stats) {
            DATA.stats.totalMoneySpent += spent;
        }
        PLAYER.money = roundToDecimals(PLAYER.money, MONEY_DECIMALS);
    }
    const moneyChanged = oldMoney !== PLAYER.money;
    const bitcoinChanged = oldBitcoin !== PLAYER.bitcoin;
    const energyChanged = oldEnergy !== PLAYER.energy;
    if (moneyChanged || bitcoinChanged || energyChanged) {
        updateDisplay();
    }
    if (typeof syncRuntimeStats === 'function') {
        syncRuntimeStats();
    }
    if (typeof updateHomeStatsDisplay === 'function') {
        updateHomeStatsDisplay();
    }
    oldMoney = PLAYER.money;
    oldBitcoin = PLAYER.bitcoin;
    oldEnergy = PLAYER.energy;
}

function roundToDecimals(value, decimals) {
    let factor = 10 ** decimals;
    return Math.round((Number(value)) * factor) / factor;
}

function updateDisplay() {
    const energyValue = Number(PLAYER.energy) || 0;
    const energyClass = energyValue < 0 ? 'energyDisplay isNegative' : 'energyDisplay';
    let tempstring = `
    <div class="moneyDisplay" id="moneyDisplay"><strong>$</strong> ${PLAYER.money}</div>
    <div class="btcDisplay" id="btcDisplay"><strong>BTC</strong> ${PLAYER.bitcoin}</div>
    <div class="${energyClass}" id="energyDisplay"><img src="img/energy.png" height="30"> ${energyValue}</div>
    `;
    
    DISPLAY_DATA.dataAll.forEach((element) => {
        element.innerHTML = tempstring;
    })
}