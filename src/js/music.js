const MUSIC_URL = "https://res.cloudinary.com/da9tytxsu/video/upload/so_4.5/v1795093252/jonasblakewood-synthwave-vibe-618635_oexfxg.mp3";
const MUSIC_VOLUME = 0.2;

const backgroundMusic = window.parent === window
    ? new Audio(MUSIC_URL)
    : null;
const hasStartScreen = document.querySelector(".start-screen") !== null;
let hasUserStartedMusic = !hasStartScreen;
let isLeavingPage = false;

if (backgroundMusic) {
    backgroundMusic.loop = true;
    backgroundMusic.volume = MUSIC_VOLUME;

    const navigation = performance.getEntriesByType("navigation")[0];
    const isPageReloaded = navigation && navigation.type === "reload";

    if (isPageReloaded) {
        sessionStorage.removeItem("musicTime");
    }

    const savedMusicTime = sessionStorage.getItem("musicTime");
    if (savedMusicTime) {
        backgroundMusic.currentTime = Number(savedMusicTime);
    }
}

function startMusic() {
    if (
        !backgroundMusic
        || !hasUserStartedMusic
        || isLeavingPage
        || (!backgroundMusic.paused && !backgroundMusic.ended)
    ) {
        return;
    }

    if (backgroundMusic.ended) {
        backgroundMusic.currentTime = 0;
    }

    backgroundMusic.play().catch((error) => {
        if (error.name !== "NotAllowedError" && error.name !== "AbortError") {
            console.error("No se pudo reproducir la música de fondo.", error);
        }
    });
}

function startMusicFromInteraction() {
    hasUserStartedMusic = true;
    startMusic();
}

function autoStartMusic() {
    hasUserStartedMusic = true;
    startMusic();
}

if (backgroundMusic) {
    if (!hasStartScreen) {
        autoStartMusic();
    }

    document.addEventListener("pointerdown", startMusicFromInteraction, true);
    document.addEventListener("keydown", startMusicFromInteraction, true);
    document.addEventListener("touchstart", startMusicFromInteraction, true);
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            startMusic();
        }
    });

    backgroundMusic.addEventListener("pause", () => {
        if (!isLeavingPage && document.visibilityState === "visible") {
            window.setTimeout(startMusic, 0);
        }
    });

    window.addEventListener("pageshow", () => {
        isLeavingPage = false;
        startMusic();
    });

    window.addEventListener("pagehide", () => {
        isLeavingPage = true;
        sessionStorage.setItem("musicTime", backgroundMusic.currentTime);
    });
}
