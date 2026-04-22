/// <reference path="togglePages.js" />
/// <reference path="../data/gameData.js" />
/// <reference path="balanceHandler.js" />

let SETTINGS = {
    volume: 100,
}

const GAME_LOOP_INTERVAL = 1000;
const MONEY_PER_POWER_PER_SECOND = 1;
let gameLoopId = null;
let currentPower = 0;
let currentUpkeep = 0;

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
    if (currentPower > 0) {
        PLAYER.money += currentPower * MONEY_PER_POWER_PER_SECOND * seconds;
    }
    if (currentUpkeep > 0) {
        PLAYER.money = Math.max(0, PLAYER.money - (currentUpkeep * seconds));
    }
    if(oldMoney !== PLAYER.money) {
        updateDisplay();
    }
    let oldMoney = PLAYER.money
}

function updateDisplay() {
    let tempstring = `
    <div class="moneyDisplay" id="moneyDisplay"><strong>$</strong> ${PLAYER.money}</div>
    <div class="btcDisplay" id="btcDisplay"><strong>BTC</strong> ${PLAYER.bitcoin}</div>
    <div class="energyDisplay" id="energyDisplay"><img src=""> ${PLAYER.energy}</div>
    `;
    
    DISPLAY_DATA.dataAll.forEach((element) => {
        element.innerHTML = tempstring;
    })
}