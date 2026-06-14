let soundVolume = 1;
let musicVolume = 1;
let oldSoundVolume = 1;
let oldMusicVolume = 1;

let backgroundMusic = new Audio('sounds/backgroundMusic.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = musicVolume;

function playMusic() {
    backgroundMusic.play();
}

function stopMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

function playSound(soundPath) {
    let sound = new Audio(soundPath);
    sound.volume = soundVolume;
    sound.play();
}

function setSoundVolume(value) {
    soundVolume = value / 100;
    if (soundVolume > 0) {
        oldSoundVolume = soundVolume;
    }
}

function setMusicVolume(value) {
    musicVolume = value / 100;
    backgroundMusic.volume = musicVolume;
    if (musicVolume > 0) {
        oldMusicVolume = musicVolume;
    }
}

function toggleVolume(type) {
    if (type === 'music') {
        if (musicVolume > 0) {
            oldMusicVolume = musicVolume;
            setMusicVolume(0);
        } else {
            setMusicVolume(oldMusicVolume * 100);
        }
        return musicVolume * 100;
    }

    if (type === 'sound') {
    if (soundVolume > 0) {
        oldSoundVolume = soundVolume;
        setSoundVolume(0);
    } else {
        setSoundVolume(oldSoundVolume * 100);
    }
    return soundVolume * 100;
    }
}
