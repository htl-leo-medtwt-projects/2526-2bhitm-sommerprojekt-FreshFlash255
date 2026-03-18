//NUR Funktionsnamen KI Generiert


// === UI / Navigation ===
function toggleFullscreen() {}
function showScreen(screenId) {}
function hideScreen(screenId) {}
function hideAllScreens() {}

// === Start Screen ===
function onStartButtonClick() {}
function onSettingsButtonClick() {}
function onTutorialButtonClick() {}

// === Settings Screen ===
function openSettings() {}
function closeSettings() {}
function saveSettings() {}

// === Tutorial Screen ===
function openTutorial() {}
function closeTutorial() {}

// === Game Screen ===
function startGame() {}
// function pauseGame() {}
// function resumeGame() {}
function endGame() {}
function updateGameUI() {}

// === Inventory Screen ===
function openInventory() {}
function closeInventory() {}
function renderInventory() {}
function addItemToInventory(item) {}
function removeItemFromInventory(itemId) {}

// === PC Screen ===
function openPC() {}
function closePC() {}

// === PC – Home ===
function showPCHome() {}

// === PC – Sell ===
function showPCSell() {}
function sellItem(itemId) {}

// === PC – Shop ===
function showPCShop() {}
function buyItem(itemId) {}

// === PC – Energy ===
function showPCEnergy() {}
function buyEnergy(amount) {}
function updateEnergyDisplay() {}






// Fullscreen ein/aus toggeln(Claude KI benutzt)
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    //document.getElementById('fullscreenButton').style.display = 'none'
  } else {
    document.exitFullscreen();
    //document.getElementById('fullscreenButton').style.display = 'block'
  }
}