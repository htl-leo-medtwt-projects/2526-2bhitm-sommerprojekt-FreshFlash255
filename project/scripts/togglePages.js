/// <reference path="mainScript.js" />
/// <reference path="balanceHandler.js" />
/// <reference path="racks.js" />

const SCREENS = {
    startScreen: document.getElementById('startScreen'),
    settingsScreen: document.getElementById('settingsScreen'),
    tutorialScreen: document.getElementById('tutorialScreen'),
    gameScreen: document.getElementById('gameScreen'),
    pauseMenu: document.getElementById('pauseMenu'),
    inventoryScreen: document.getElementById('inventoryScreen'),
    backButtonSettings: document.getElementById('backButtonSettings'),
    backButtonTutorial: document.getElementById('backButtonTutorial'),
    backButtonInventory: document.getElementById('backButtonInventory'),
    backButton: document.querySelectorAll('.backButton'),
    pcScreen: {
        main: document.getElementById('pcScreen'),
        home: document.getElementById('pcHomeScreen'),
        sell: document.getElementById('pcSellScreen'),
        shop: document.getElementById('pcShopScreen'),
        energy: document.getElementById('pcEnergyScreen'),
        backButton: document.getElementById('backButtonPc'),
    },
    loadingScreen: document.getElementById('loadingScreen')
}

const PC_SIDEBAR_BTNS = {
    home: document.getElementById('sidebarBtnHome'),
    sell: document.getElementById('sidebarBtnSell'),
    shop: document.getElementById('sidebarBtnShop'),
    energy: document.getElementById('sidebarBtnEnergy'),
}

const DISPLAY_DATA = {
    dataAll: document.querySelectorAll('.dataWrapper')
}

let pauseMenuIsOpen = false;

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
    Object.entries(SCREENS).forEach(([key, value]) => { // Wird in js Array umgewandelt, Key = z.B. "StartScreen" und value was darin ist
        if (value instanceof HTMLElement) {     //instanceof checkt Typ des Objekts/der Klasse
            value.style.display = 'none';
        } else if (typeof value === "object" && (value != null || value)) { //typeof checkt Typ der Variable
            Object.entries(value).forEach(([innerKey, innerValue]) => {
                if (innerValue instanceof HTMLElement) {
                    innerValue.style.display = 'none';
                }
            });
        } else if(value instanceof NodeList && (value != null || value)) {
            value.forEach(([innerKey, innerValue]) => {
                if(innerValue instanceof HTMLElement) {
                    innerValue.style.display = 'none'
                }
            })
        } else {
            console.warn('Variable "SCREENS" corrupted', SCREENS);
        }
    });
    if (SCREENS.pcScreen.backButton) {
        SCREENS.pcScreen.backButton.style.display = 'none';
    }
    if (SCREENS.pauseMenu) {
        SCREENS.pauseMenu.style.display = 'none';
        SCREENS.pauseMenu.setAttribute('aria-hidden', 'true');
    }
    pauseMenuIsOpen = false;
}

// === Loading Screen ===
function showLoadingScreen() {
        hideAllScreens()
        SCREENS.loadingScreen.style.display = "block";
        setTimeout(200);
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
    if (typeof syncSettingsMenu === 'function') {
        syncSettingsMenu();
    }
}
function saveSettings() {
    if (typeof saveGameFromSettings === 'function') {
        saveGameFromSettings();
    }
}

// === Tutorial Screen ===
function openTutorial() {
    hideAllScreens();
    SCREENS.tutorialScreen.style.display = "flex";
}

// === Game Screen ===
function startGame() {
    showLoadingScreen()
    hideAllScreens()
    SCREENS.gameScreen.style.display = "block"
    startGameLoop();
    if (typeof playMusic === 'function') {
        playMusic();
    }
}
function openPauseMenu() {
    if (!SCREENS.pauseMenu || pauseMenuIsOpen) {
        return;
    }
    pauseMenuIsOpen = true;
    SCREENS.pauseMenu.style.display = 'flex';
    SCREENS.pauseMenu.setAttribute('aria-hidden', 'false');
    if (typeof syncSettingsMenu === 'function') {
        syncSettingsMenu();
    }
    if (typeof stopGameLoop === 'function') {
        stopGameLoop();
    }
}

function closePauseMenu(shouldResumeGame = true) {
    if (!SCREENS.pauseMenu) {
        return;
    }
    pauseMenuIsOpen = false;
    SCREENS.pauseMenu.style.display = 'none';
    SCREENS.pauseMenu.setAttribute('aria-hidden', 'true');
    if (shouldResumeGame && SCREENS.gameScreen && SCREENS.gameScreen.style.display !== 'none' && typeof startGameLoop === 'function') {
        startGameLoop();
    }
}

function setPauseSoundVolume(value) {
    setSoundVolume(value);
    if (typeof syncSettingsMenu === 'function') {
        syncSettingsMenu();
    } else {
        updatePauseMuteButton('pauseSoundMuteButton', Number(value) === 0);
    }
}

function setPauseMusicVolume(value) {
    setMusicVolume(value);
    if (typeof syncSettingsMenu === 'function') {
        syncSettingsMenu();
    } else {
        updatePauseMuteButton('pauseMusicMuteButton', Number(value) === 0);
    }
}

function updatePauseMuteButton(buttonId, isMuted) {
    const button = document.getElementById(buttonId);
    if (!button) {
        return;
    }
    button.classList.toggle('isMuted', isMuted);
}

function togglePauseSoundMute() {
    const soundRange = document.getElementById('pauseSoundRange');
    soundRange.value = toggleVolume('sound');
    if (typeof syncSettingsMenu === 'function') {
        syncSettingsMenu();
    } else {
        updatePauseMuteButton('pauseSoundMuteButton', Number(soundRange.value) === 0);
    }
}

function togglePauseMusicMute() {
    const musicRange = document.getElementById('pauseMusicRange');
    musicRange.value = toggleVolume('music');
    if (typeof syncSettingsMenu === 'function') {
        syncSettingsMenu();
    } else {
        updatePauseMuteButton('pauseMusicMuteButton', Number(musicRange.value) === 0);
    }
}

function saveGameFromPauseMenu() {
    if (typeof saveStatsToLocalStorage === 'function') {
        saveStatsToLocalStorage(true);
    }
    if (typeof savePlayerToLocalStorage === 'function') {
        savePlayerToLocalStorage(true);
    }
}

function goHomeFromPauseMenu() {
    closePauseMenu(false);
    if (typeof stopGameLoop === 'function') {
        stopGameLoop();
    }
    if (typeof stopMusic === 'function') {
        stopMusic();
    }
    openStartScreen();
}
function endGame() {}

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
        return;
    }
    if (pauseMenuIsOpen) {
        closePauseMenu();
    } else if (SCREENS.gameScreen && SCREENS.gameScreen.style.display !== 'none') {
        openPauseMenu();
    }
});

// === Inventory Screen ===
function openInventory(rackIndex) {
    hideAllScreens();
    SCREENS.inventoryScreen.style.display = "grid";
    if (SCREENS.backButtonInventory) {
        SCREENS.backButtonInventory.style.display = 'block';
    }
    if (typeof setActiveRackIndex === 'function') {
        setActiveRackIndex(rackIndex);
    }
    renderInventory();
}

// === PC Screen ===
function openPc() {
    hideAllScreens();
    SCREENS.pcScreen.main.style.display = "flex";
    if (SCREENS.pcScreen.backButton) {
        SCREENS.pcScreen.backButton.style.display = 'block';
    }
    showPcHome();
}
function closePc() {
    hideAllScreens();
    showPcHome();
    SCREENS.gameScreen.style.display = "block";
    if (SCREENS.pcScreen.backButton) {
        SCREENS.pcScreen.backButton.style.display = 'none';
    }
}

// === PC – Home ===
function showPcHome() {
    /* SCREENS.pcScreen.home.classList.add('sidebarActive')
    SCREENS.pcScreen.sell.classList.remove('sidebarActive')
    SCREENS.pcScreen.shop.classList.remove('sidebarActive')
    SCREENS.pcScreen.energy.classList.remove('sidebarActive') */
    setPcView('home');
    if (typeof renderHomeScreen === 'function') {
        renderHomeScreen();
    }
}

// === PC – Sell ===
function showPcSell() {
    /* SCREENS.pcScreen.home.classList.remove('sidebarActive')
    SCREENS.pcScreen.sell.classList.add('sidebarActive')
    SCREENS.pcScreen.shop.classList.remove('sidebarActive')
    SCREENS.pcScreen.energy.classList.remove('sidebarActive') */
    setPcView('sell');
    if (typeof renderSellScreen === 'function') {
        renderSellScreen();
    }
}

// === PC – Shop ===
function showPcShop() {
    /* SCREENS.pcScreen.home.classList.remove('sidebarActive')
    SCREENS.pcScreen.sell.classList.remove('sidebarActive')
    SCREENS.pcScreen.shop.classList.add('sidebarActive')
    SCREENS.pcScreen.energy.classList.remove('sidebarActive') */
    setPcView('shop');
    loadShop();
}

// === PC – Energy ===
function showPcEnergy() {
    /* SCREENS.pcScreen.home.classList.remove('sidebarActive')
    SCREENS.pcScreen.sell.classList.remove('sidebarActive')
    SCREENS.pcScreen.shop.classList.remove('sidebarActive')
    SCREENS.pcScreen.energy.classList.add('sidebarActive') */
    setPcView('energy');
    loadEnergyShop();
}

function setPcView(activeKey) {
    const views = {
        home: SCREENS.pcScreen.home,
        sell: SCREENS.pcScreen.sell,
        shop: SCREENS.pcScreen.shop,
        energy: SCREENS.pcScreen.energy,
    };

    Object.entries(views).forEach(([key, view]) => {
        if (!view) {
            return;
        }
        view.style.display = key === activeKey ? 'flex' : 'none';
    });

    Object.entries(PC_SIDEBAR_BTNS).forEach(([key, button]) => {
        if (!button) {
            return;
        }
        button.classList.toggle('sidebarActive', key === activeKey);
    });
}

// === INIT ===
function init() {
    showLoadingScreen()
    hideAllScreens()
    updateDisplay()
    openStartScreen()
}

init()
