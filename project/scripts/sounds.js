const SOUND_PATHS = {
	click: 'sounds/click.mp3',
	backgroundMusic: 'sounds/backgroundMusic.mp3',
	bgNoise: 'sounds/bgNoise.mp3',
};

const CLICKABLE_SELECTOR = [
	'button',
	'[onclick]',
	'label.autosaveToggle',
	'.startMenuButton',
	'.backButton',
	'.sidebarBtn',
	'.shopBtn',
	'.rackClip',
	'.pcDesk',
	'.gamePauseButton',
	'.pauseImageButton',
	'.pauseMuteButton',
	'.fullscreenButton',
	'.inventoryItem',
	'.sellBtn',
].join(', ');

const audio = {
	music: new Audio(SOUND_PATHS.backgroundMusic),
	noise: new Audio(SOUND_PATHS.bgNoise),
	click: new Audio(SOUND_PATHS.click),
};

let soundVolume = Number(localStorage.getItem('soundVolume')) || 100;
let musicVolume = Number(localStorage.getItem('musicVolume')) || 100;

let lastSoundVolume = soundVolume || 100;
let lastMusicVolume = musicVolume || 100;

audio.music.loop = true;
audio.noise.loop = true;
audio.click.preload = 'auto';

function percentToVolume(value) {
	return Math.max(0, Math.min(100, Number(value))) / 100;
}

function updateAudioVolumes() {
	audio.music.volume = percentToVolume(musicVolume);
	audio.noise.volume = percentToVolume(soundVolume);
}

function updateSettingsSliders() {
	const soundSlider = document.getElementById('settingsSoundRange');
	const musicSlider = document.getElementById('settingsMusicRange');

	if (soundSlider) soundSlider.value = soundVolume;
	if (musicSlider) musicSlider.value = musicVolume;
}

function saveVolumeSettings() {
	localStorage.setItem('soundVolume', soundVolume);
	localStorage.setItem('musicVolume', musicVolume);
}

function setSettingsSoundVolume(value) {
	soundVolume = Math.round(Number(value));

	if (soundVolume > 0) {
		lastSoundVolume = soundVolume;
	}

	updateAudioVolumes();
	updateSettingsSliders();
	saveVolumeSettings();
}

function setSettingsMusicVolume(value) {
	musicVolume = Math.round(Number(value));

	if (musicVolume > 0) {
		lastMusicVolume = musicVolume;
	}

	updateAudioVolumes();
	updateSettingsSliders();
	saveVolumeSettings();
}

function toggleSettingsSoundMute() {
	if (soundVolume > 0) {
		lastSoundVolume = soundVolume;
		setSettingsSoundVolume(0);
	} else {
		setSettingsSoundVolume(lastSoundVolume || 100);
	}
}

function toggleSettingsMusicMute() {
	if (musicVolume > 0) {
		lastMusicVolume = musicVolume;
		setSettingsMusicVolume(0);
	} else {
		setSettingsMusicVolume(lastMusicVolume || 100);
	}
}

function playAudio(audioElement) {
	audioElement.play().catch(() => {});
}

function playGameAudio() {
	updateAudioVolumes();
	playAudio(audio.music);
	playAudio(audio.noise);
}

function stopGameAudio() {
	audio.music.pause();
	audio.noise.pause();

	audio.music.currentTime = 0;
	audio.noise.currentTime = 0;
}

function playClickSound() {
	if (soundVolume <= 0) return;

	const click = audio.click.cloneNode();
	click.volume = percentToVolume(soundVolume);
	playAudio(click);
}

function playSound(soundPath) {
	if (soundVolume <= 0) return;

	const sound = new Audio(soundPath);
	sound.volume = percentToVolume(soundVolume);
	playAudio(sound);
}

function isClickSoundTarget(element) {
	if (!element || !(element instanceof Element)) return false;

	if (element.matches('input[type="range"], input[type="number"]')) {
		return false;
	}

	const clickable = element.closest(CLICKABLE_SELECTOR);
	if (!clickable) return false;

	if (clickable.matches('.inventoryItem:not([onclick])')) {
		return false;
	}

	return true;
}

document.addEventListener('click', (event) => {
	if (isClickSoundTarget(event.target)) {
		playClickSound();
	}
});

document.addEventListener('DOMContentLoaded', () => {
	updateAudioVolumes();
	updateSettingsSliders();
});