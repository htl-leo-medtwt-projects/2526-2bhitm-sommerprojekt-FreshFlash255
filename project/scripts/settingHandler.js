/// <reference path="mainScript.js" />
/// <reference path="sounds.js" />
/// <reference path="localstorage.js" />

const SETTINGS_STORAGE_KEY = 'minemaster_settings_v1';

const DEFAULT_SETTINGS = {
	volume: 100,
	soundVolume: 100,
	musicVolume: 100,
	autosave: true,
};

if (typeof SETTINGS === 'undefined' || !SETTINGS) {
	SETTINGS = { ...DEFAULT_SETTINGS };
} else {
	Object.assign(SETTINGS, DEFAULT_SETTINGS, SETTINGS);
}

function readStoredSettings() {
	if (typeof localStorage === 'undefined') {
		return null;
	}
	const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
	if (!raw) {
		return null;
	}
	try {
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === 'object' ? parsed : null;
	} catch (error) {
		console.warn('Failed to parse settings from localStorage', error);
		return null;
	}
}

function saveSettingsToLocalStorage() {
	if (typeof localStorage === 'undefined') {
		return;
	}
	try {
		localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({
			volume: Number(SETTINGS.volume) || 0,
			soundVolume: Number(SETTINGS.soundVolume) || 0,
			musicVolume: Number(SETTINGS.musicVolume) || 0,
			autosave: SETTINGS.autosave !== false,
		}));
	} catch (error) {
		console.warn('Failed to save settings to localStorage', error);
	}
}

function isAutosaveEnabled() {
	return SETTINGS.autosave !== false;
}

function getVolumeElements(type) {
	const config = {
		sound: {
			ranges: ['pauseSoundRange', 'settingsSoundRange'],
			muteButtons: ['pauseSoundMuteButton', 'settingsSoundMuteButton'],
			valueKey: 'soundVolume',
		},
		music: {
			ranges: ['pauseMusicRange', 'settingsMusicRange'],
			muteButtons: ['pauseMusicMuteButton', 'settingsMusicMuteButton'],
			valueKey: 'musicVolume',
		},
	};
	return config[type] || null;
}

function updateMuteButton(buttonId, isMuted) {
	const button = document.getElementById(buttonId);
	if (!button) {
		return;
	}
	button.classList.toggle('isMuted', isMuted);
}

function syncVolumeControls(type) {
	const config = getVolumeElements(type);
	if (!config) {
		return;
	}
	const currentValue = Number(SETTINGS[config.valueKey]) || 0;
	config.ranges.forEach((rangeId) => {
		const range = document.getElementById(rangeId);
		if (range) {
			range.value = String(currentValue);
		}
	});
	config.muteButtons.forEach((buttonId) => updateMuteButton(buttonId, currentValue === 0));
}

function syncSettingsMenu() {
	syncVolumeControls('sound');
	syncVolumeControls('music');
	const autosaveToggle = document.getElementById('settingsAutosaveToggle');
	if (autosaveToggle) {
		autosaveToggle.checked = isAutosaveEnabled();
	}
}

function applySoundSetting(type, value) {
	const config = getVolumeElements(type);
	if (!config) {
		return;
	}
	const numericValue = Math.max(0, Math.min(100, Number(value) || 0));
	SETTINGS[config.valueKey] = numericValue;
	SETTINGS.volume = SETTINGS.soundVolume;
	if (type === 'sound') {
		setSoundVolume(numericValue);
	} else {
		setMusicVolume(numericValue);
	}
	syncVolumeControls(type);
	saveSettingsToLocalStorage();
}

function toggleSoundSetting(type) {
	const config = getVolumeElements(type);
	if (!config) {
		return;
	}
	const currentValue = toggleVolume(type);
	applySoundSetting(type, currentValue);
}

function setSettingsSoundVolume(value) {
	applySoundSetting('sound', value);
}

function setSettingsMusicVolume(value) {
	applySoundSetting('music', value);
}

function toggleSettingsSoundMute() {
	toggleSoundSetting('sound');
}

function toggleSettingsMusicMute() {
	toggleSoundSetting('music');
}

function setAutosaveEnabled(enabled) {
	SETTINGS.autosave = Boolean(enabled);
	saveSettingsToLocalStorage();
	syncSettingsMenu();
}

function toggleAutosaveSetting(enabled) {
	setAutosaveEnabled(enabled);
}

function saveGameFromSettings() {
	if (typeof saveStatsToLocalStorage === 'function') {
		saveStatsToLocalStorage(true);
	}
	if (typeof savePlayerToLocalStorage === 'function') {
		savePlayerToLocalStorage(true);
	}
	saveSettingsToLocalStorage();
}

function initializeSettings() {
	const storedSettings = readStoredSettings();
	if (storedSettings) {
		Object.assign(SETTINGS, DEFAULT_SETTINGS, storedSettings);
	}
	if (typeof setSoundVolume === 'function') {
		setSoundVolume(SETTINGS.soundVolume);
	}
	if (typeof setMusicVolume === 'function') {
		setMusicVolume(SETTINGS.musicVolume);
	}
	syncSettingsMenu();
	saveSettingsToLocalStorage();
}

initializeSettings();