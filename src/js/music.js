const MUSIC_URL = "https://res.cloudinary.com/da9tytxsu/video/upload/so_4.5/v1795093252/jonasblakewood-synthwave-vibe-618635_oexfxg.mp3";
const MUSIC_VOLUME = 0.2;

const backgroundMusic = new Audio(MUSIC_URL);
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

function startMusic() {
    backgroundMusic.play().catch(() => {});
}

function startMusicOnFirstInteraction() {
    document.addEventListener("pointerdown", startMusic, { once: true });
    document.addEventListener("keydown", startMusic, { once: true });
    document.addEventListener("touchstart", startMusic, { once: true });
}

function autoStartMusic() {
    backgroundMusic.play().catch(() => {
        startMusicOnFirstInteraction();
    });
}

const hasStartScreen = document.querySelector(".start-screen") !== null;

if (!hasStartScreen) {
    autoStartMusic();
}

window.addEventListener("pagehide", () => {
    sessionStorage.setItem("musicTime", backgroundMusic.currentTime);
});
