/// <reference path="mainScript.js" />

const SCREENS = {
    startScreen: document.getElementById('startScreen'),
    settingsScreen: document.getElementById('settingsScreen'),
    tutorialScreen: document.getElementById('tutorialScreen'),
    gameScreen: document.getElementById('gameScreen'),
    inventoryScreen: document.getElementById('inventoryScreen'),
    pcScreen: {
        main: document.getElementById('pcScreen'),
        home: document.getElementById('pcHomeScreen'),
        sell: document.getElementById('pcSellScreen'),
        shop: document.getElementById('pcShopScreen'),
        energy: document.getElementById('pcEnergyScreen'),
        backButton: document.getElementById('backButtonPc')
    },
    loadingScreen: document.getElementById('loadingScreen')
}


//NUR Funktionsnamen KI Generiert
// === UI / Navigation ===
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
function showScreen(screenId) {}
function hideScreen(screenId) {}
// KI Assistenz
function hideAllScreens() {
    Object.entries(SCREENS).forEach(([key, value]) => {     // Wird in js Array umgewandelt, Key = z.B. "StartScreen" und value was darin ist
        if (value instanceof HTMLElement) {     //instanceof checkt Typ des Objekts/der Klasse
            value.style.display = 'none';
        } else if (typeof value === "object" && (value != null || value)) {   //typeof checkt Typ der Variable
            Object.entries(value).forEach(([innerKey, innerValue]) => {
                if (innerValue instanceof HTMLElement) {
                    innerValue.style.display = 'none';
                }
            });
        } else {
            console.warn('Variable "SCREENS" corrupted', SCREENS);
        }
    });
}

// === Loading Screen

function showLoadingScreen() {
        hideAllScreens()
        SCREENS.loadingScreen.style.display = "block"
        setTimeout(() => {
        openStartScreen()
    }, 2000)
}


// === Start Screen ===
function onStartButtonClick() {
    startGame();
}
function onSettingsButtonClick() {
    openSettings();
}
function onTutorialButtonClick() {
    openTutorial();
}

function openStartScreen() {
    hideAllScreens()
    SCREENS.startScreen.style.display = "flex";
}

// === Settings Screen ===
function openSettings() {
    hideAllScreens();
    SCREENS.settingsScreen.style.display = "flex";
}
function saveSettings() {}

// === Tutorial Screen ===
function openTutorial() {
    hideAllScreens();
    SCREENS.tutorialScreen.style.display = "flex";
}

// === Game Screen ===
function startGame() {
    hideAllScreens()
    SCREENS.gameScreen.style.display = "block"
}
// function pauseGame() {}
// function resumeGame() {}
function endGame() {}
function updateGameUI() {}

// === Inventory Screen ===
function openInventory() {
    hideAllScreens();
    SCREENS.inventoryScreen.style.display = "block";
}
function renderInventory() {}
function addItemToInventory(item) {}
function removeItemFromInventory(itemId) {}

// === PC Screen ===
function openPc() {
    hideAllScreens()
    SCREENS.pcScreen.main.style.display = "flex"
}
function closePc() {
    hideAllScreens()
    showPCHome()
    SCREENS.gameScreen.style.display = "block"
}

// === PC – Home ===
function showPCHome() {
    SCREENS.pcScreen.home.classList.add('sidebarActive')
    SCREENS.pcScreen.sell.classList.remove('sidebarActive')
    SCREENS.pcScreen.shop.classList.remove('sidebarActive')
    SCREENS.pcScreen.energy.classList.remove('sidebarActive')
}

// === PC – Sell ===
function showPCSell() {
    SCREENS.pcScreen.home.classList.remove('sidebarActive')
    SCREENS.pcScreen.sell.classList.add('sidebarActive')
    SCREENS.pcScreen.shop.classList.remove('sidebarActive')
    SCREENS.pcScreen.energy.classList.remove('sidebarActive')
}
function sellItem(itemId) {}

// === PC – Shop ===
function showPCShop() {
    SCREENS.pcScreen.home.classList.remove('sidebarActive')
    SCREENS.pcScreen.sell.classList.remove('sidebarActive')
    SCREENS.pcScreen.shop.classList.add('sidebarActive')
    SCREENS.pcScreen.energy.classList.remove('sidebarActive')
}
function buyItem(itemId) {}

// === PC – Energy ===
function showPCEnergy() {
    SCREENS.pcScreen.home.classList.remove('sidebarActive')
    SCREENS.pcScreen.sell.classList.remove('sidebarActive')
    SCREENS.pcScreen.shop.classList.remove('sidebarActive')
    SCREENS.pcScreen.energy.classList.add('sidebarActive')
}
function buyEnergy(amount) {}
function updateEnergyDisplay() {}




// === INIT ===
function init() {
    //showLoadingScreen()
}

init()