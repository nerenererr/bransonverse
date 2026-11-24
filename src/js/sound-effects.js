const menuSelectionSound = new Audio(
    "https://res.cloudinary.com/da9tytxsu/video/upload/so_0,eo_0.12/v1795168834/liecio-menu_beep_wood_stick_c-533785_m8hy9y.mp3"
);
menuSelectionSound.preload = "auto";

const backOrRemoveSound = new Audio(
    "https://res.cloudinary.com/da9tytxsu/video/upload/v1795170837/driken5482-retro-select-236670_llo5b8.mp3"
);
backOrRemoveSound.preload = "auto";

const confirmSelectionSound = new Audio(
    "https://res.cloudinary.com/da9tytxsu/video/upload/v1795171417/floraphonic-casual-click-pop-ui-2-262119_f6bedn.mp3"
);
confirmSelectionSound.preload = "auto";

function playMenuSelectionSound() {
    menuSelectionSound.currentTime = 0;
    menuSelectionSound.play().catch(() => {});
}

function playBackOrRemoveSound() {
    backOrRemoveSound.currentTime = 0;
    backOrRemoveSound.play().catch(() => {});
}

function playConfirmSelectionSound() {
    confirmSelectionSound.currentTime = 0;
    confirmSelectionSound.play().catch(() => {});
}
