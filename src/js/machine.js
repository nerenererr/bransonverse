const CLOUDINARY_IMAGES = "https://res.cloudinary.com/TU_CLOUD/image/upload/bransonverse/";
const CLOUDINARY_SOUNDS = "https://res.cloudinary.com/TU_CLOUD/video/upload/bransonverse/sounds/";

const DOLL_IMAGES = [
    CLOUDINARY_IMAGES + "doll-branson-cei.png",
    CLOUDINARY_IMAGES + "doll-devil.png",
    CLOUDINARY_IMAGES + "doll-cap.png",
    CLOUDINARY_IMAGES + "doll-pikachu.png",
    CLOUDINARY_IMAGES + "doll-cat.png",
    CLOUDINARY_IMAGES + "doll-bullfighter.png",
    CLOUDINARY_IMAGES + "doll-cupid.png",
    CLOUDINARY_IMAGES + "doll-reindeer.png"
];

const SOUNDS = {
    move: CLOUDINARY_SOUNDS + "claw-move.mp3",
    button: CLOUDINARY_SOUNDS + "button.mp3",
    drop: CLOUDINARY_SOUNDS + "claw-drop.mp3",
    grab: CLOUDINARY_SOUNDS + "claw-grab.mp3",
    prize: CLOUDINARY_SOUNDS + "prize.mp3"
};

const MIN_POSITION = 10;
const MAX_POSITION = 90;
const MOVE_STEP = 5;
const PRIZE_DOOR_POSITION = 88;

const MOVE_TIME = 600;
const DROP_TIME = 900;
const GRAB_TIME = 400;

let clawPosition = 50;
let isMachineBusy = false;
let moveInterval = null;

function clampPosition(position) {
    if (position < MIN_POSITION) {
        return MIN_POSITION;
    }
    if (position > MAX_POSITION) {
        return MAX_POSITION;
    }
    return position;
}

function getNextPosition(position, direction) {
    if (direction === "left") {
        return clampPosition(position - MOVE_STEP);
    }
    if (direction === "right") {
        return clampPosition(position + MOVE_STEP);
    }
    return position;
}

function getPercentPosition(elementCenter, containerWidth) {
    if (containerWidth <= 0) {
        return 50;
    }
    const percent = (elementCenter / containerWidth) * 100;
    return clampPosition(Math.round(percent));
}

function getDollImage(index) {
    return DOLL_IMAGES[index % DOLL_IMAGES.length];
}

function wait(milliseconds) {
    return new Promise(function (resolve) {
        setTimeout(resolve, milliseconds);
    });
}

function playSound(soundName) {
    const sound = new Audio(SOUNDS[soundName]);
    sound.volume = 0.5;
    sound.play().catch(function () {});
}

function renderDolls(names) {
    const dollsContainer = document.querySelector(".machine__dolls");
    dollsContainer.innerHTML = "";

    names.forEach(function (name, index) {
        const doll = document.createElement("img");
        doll.classList.add("doll", "doll--tilt-" + (index % 4));
        doll.src = getDollImage(index);
        doll.alt = "Muñeco sorpresa";
        doll.dataset.name = name;
        dollsContainer.appendChild(doll);
    });
}

function findDoll(name) {
    const dolls = document.querySelectorAll(".machine__dolls .doll");
    for (let i = 0; i < dolls.length; i++) {
        if (dolls[i].dataset.name === name) {
            return dolls[i];
        }
    }
    return null;
}

function updateClawPosition(newPosition) {
    const claw = document.querySelector(".claw");
    clawPosition = newPosition;
    claw.style.left = clawPosition + "%";
}

function moveClaw(direction) {
    if (isMachineBusy) {
        return;
    }
    const newPosition = getNextPosition(clawPosition, direction);
    if (newPosition !== clawPosition) {
        updateClawPosition(newPosition);
        playSound("move");
    }
}

function tiltJoystick(direction) {
    const joystick = document.querySelector(".joystick");
    joystick.classList.remove("joystick--left", "joystick--right");
    if (direction) {
        joystick.classList.add("joystick--" + direction);
    }
}

function startMoving(direction) {
    stopMoving();
    tiltJoystick(direction);
    moveClaw(direction);
    moveInterval = setInterval(function () {
        moveClaw(direction);
    }, 150);
}

function stopMoving() {
    clearInterval(moveInterval);
    moveInterval = null;
    tiltJoystick(null);
}

async function grabDoll(name) {
    const doll = findDoll(name);
    if (!doll || isMachineBusy) {
        return;
    }

    isMachineBusy = true;
    stopMoving();

    const claw = document.querySelector(".claw");
    const playArea = document.querySelector(".machine__play-area");
    const playAreaBox = playArea.getBoundingClientRect();
    const dollBox = doll.getBoundingClientRect();

    const dollCenter = dollBox.left - playAreaBox.left + dollBox.width / 2;
    updateClawPosition(getPercentPosition(dollCenter, playAreaBox.width));
    playSound("move");
    await wait(MOVE_TIME);

    claw.classList.add("claw--down");
    playSound("drop");
    await wait(DROP_TIME);

    claw.classList.add("claw--closed");
    playSound("grab");
    doll.classList.add("doll--grabbed");
    claw.appendChild(doll);
    await wait(GRAB_TIME);

    claw.classList.remove("claw--down");
    await wait(DROP_TIME);

    updateClawPosition(PRIZE_DOOR_POSITION);
    playSound("move");
    await wait(MOVE_TIME);

    claw.classList.remove("claw--closed");
    doll.classList.add("doll--falling");
    playSound("prize");
    await wait(DROP_TIME);
    doll.remove();

    isMachineBusy = false;

    document.dispatchEvent(new CustomEvent("machine:prize", { detail: { name: name } }));
}

function resetMachine(names) {
    const claw = document.querySelector(".claw");
    const grabbedDoll = claw.querySelector(".doll");
    if (grabbedDoll) {
        grabbedDoll.remove();
    }
    isMachineBusy = false;
    stopMoving();
    claw.classList.remove("claw--down", "claw--closed");
    updateClawPosition(50);
    renderDolls(names);
}

function handleButtonClick() {
    if (isMachineBusy) {
        return;
    }
    const button = document.querySelector(".machine__button");
    button.classList.add("machine__button--pressed");
    setTimeout(function () {
        button.classList.remove("machine__button--pressed");
    }, 200);
    playSound("button");

    document.dispatchEvent(new CustomEvent("machine:button-pressed"));
}

function handleJoystickDown(event) {
    const joystick = document.querySelector(".joystick");
    const joystickBox = joystick.getBoundingClientRect();
    const middle = joystickBox.left + joystickBox.width / 2;

    if (event.clientX < middle) {
        startMoving("left");
    } else {
        startMoving("right");
    }
}

function handleKeyDown(event) {
    if (event.repeat) {
        return;
    }
    if (event.key === "ArrowLeft") {
        startMoving("left");
    } else if (event.key === "ArrowRight") {
        startMoving("right");
    }
}

function handleKeyUp(event) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        stopMoving();
    }
}

function initMachine() {
    const joystick = document.querySelector(".joystick");
    const button = document.querySelector(".machine__button");

    if (!joystick || !button) {
        return;
    }

    joystick.addEventListener("pointerdown", handleJoystickDown);
    joystick.addEventListener("pointerup", stopMoving);
    joystick.addEventListener("pointerleave", stopMoving);
    button.addEventListener("click", handleButtonClick);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    updateClawPosition(50);
}

if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", initMachine);
}

if (typeof module !== "undefined") {
    module.exports = {
        clampPosition,
        getNextPosition,
        getPercentPosition,
        getDollImage,
        DOLL_IMAGES,
        MIN_POSITION,
        MAX_POSITION,
        MOVE_STEP
    };
}
