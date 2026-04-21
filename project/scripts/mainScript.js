/// <reference path="togglePages.js" />
/// <reference path="../data/gameData.js" />

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
    updateDisplay();
}

function updateDisplay() {}

function updateGeneratingPower() {
    const gpuTotals = calculateGpuTotal();
    const energyTotal = calculateEnergyTotal();
    const energyRatio = gpuTotals.energyUse > 0
        ? Math.min(1, energyTotal.output / gpuTotals.energyUse)
        : 0;
    const effectivePower = gpuTotals.power * energyRatio;

    currentPower = effectivePower;
    currentUpkeep = energyTotal.upkeep;
    PLAYER.generatingPower = effectivePower;
    PLAYER.energy = energyTotal.output - gpuTotals.energyUse;
}

function calculateGpuTotal() {
    const inventory = PLAYER.rackInventory || PLAYER.graphicCardsInventory || {};
    let power = 0;
    let energyUse = 0;

    Object.entries(inventory).forEach(([id, count]) => {
        const amount = Number(count) || 0;
        const gpu = DATA.graphicCards[id];
        if (!gpu || amount <= 0) {
            return;
        }
        power += gpu.power * amount;
        energyUse += gpu.energyUse * amount;
    });

    return { power, energyUse };
}

function calculateEnergyTotal() {
    const sources = PLAYER.energySupply || {};
    let output = 0;
    let upkeep = 0;

    Object.entries(sources).forEach(([id, count]) => {
        const amount = Number(count) || 0;
        const source = DATA.energySupply[id];
        if (!source || amount <= 0) {
            return;
        }
        output += source.output * amount;
        upkeep += source.upkeep * amount;
    });

    return { output, upkeep };
}