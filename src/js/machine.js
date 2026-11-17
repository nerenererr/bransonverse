const CLOUDINARY = "https://res.cloudinary.com/da9tytxsu/image/upload/f_auto,q_auto/";
const DOLLS_CLOUDINARY = "https://res.cloudinary.com/da9tytxsu/image/upload/e_trim/f_auto,q_auto/";

const CLAW_OPEN_IMAGE = CLOUDINARY + "v1794919052/extended_claw_qmld36.png";
const CLAW_CLOSED_IMAGE = CLOUDINARY + "v1794919052/claw_closed_gk492g.png";

const DOLL_IMAGES = [
    DOLLS_CLOUDINARY + "v1794918844/Figura_de_arcilla_con_sudadera_y_zapatillas_1_xbmwkl.png",
    DOLLS_CLOUDINARY + "v1794918844/Diablillo_de_fieltro_con_tridente_1_b3myuz.png",
    DOLLS_CLOUDINARY + "v1794918844/Personaje_de_arcilla_con_gorra_rosa_1_pxfjgn.png",
    DOLLS_CLOUDINARY + "v1794918844/Figura_de_plastilina_con_disfraz_de_Pikachu_1_newyv9.png",
    DOLLS_CLOUDINARY + "v1794918844/Personaje_gato_de_arcilla_con_campana_1_wkphmv.png",
    DOLLS_CLOUDINARY + "v1794918843/Torero_Chibi_de_Fieltro_con_Capa_Roja_1_uh8wiw.png",
    DOLLS_CLOUDINARY + "v1794918843/%C3%81ngel_Cupido_de_fieltro_con_arco_y_flecha_1_dbn5zv.png",
    DOLLS_CLOUDINARY + "v1794918844/Figura_de_reno_de_plastilina_con_bast%C3%B3n_de_caramelo_3_lm56zq.png",
    DOLLS_CLOUDINARY + "v1794918844/Joven_vaquero_de_arcilla_con_estrella_amarilla_1_avrv05.png"
];

const SOUNDS = {
    move: "",
    button: "",
    drop: "",
    grab: "",
    prize: ""
};

const MIN_POSITION = 10;
const MAX_POSITION = 90;
const MOVE_STEP = 2;
const MOVE_INTERVAL = 50;
const PRIZE_DOOR_POSITION = 88;

const DOLL_PILE = [
    { left: 2, bottom: -6, tilt: -8, zIndex: 5 },
    { left: 30, bottom: -5, tilt: 12, zIndex: 5 },
    { left: 55, bottom: -6, tilt: -15, zIndex: 5 },
    { left: 14, bottom: -12, tilt: -85, zIndex: 8 },
    { left: 44, bottom: -12, tilt: 80, zIndex: 8 },
    { left: 66, bottom: -5, tilt: 18, zIndex: 6 },
    { left: 20, bottom: 0, tilt: -12, zIndex: 3 },
    { left: 42, bottom: 1, tilt: 8, zIndex: 3 },
    { left: 64, bottom: -12, tilt: -95, zIndex: 8 },
    { left: 8, bottom: 1, tilt: 10, zIndex: 3 },
    { left: 58, bottom: 1, tilt: -10, zIndex: 3 },
    { left: 28, bottom: -6, tilt: 175, zIndex: 7 },
    { left: 70, bottom: 0, tilt: 8, zIndex: 2 },
    { left: 36, bottom: -12, tilt: -100, zIndex: 9 },
    { left: 0, bottom: -12, tilt: 95, zIndex: 9 }
];

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

function getDollPlace(index) {
    const place = DOLL_PILE[index % DOLL_PILE.length];
    const round = Math.floor(index / DOLL_PILE.length);

    return {
        left: place.left,
        bottom: place.bottom + round * 10,
        tilt: place.tilt,
        zIndex: place.zIndex
    };
}

function wait(milliseconds) {
    return new Promise(function (resolve) {
        setTimeout(resolve, milliseconds);
    });
}

function playSound(soundName) {
    if (!SOUNDS[soundName]) {
        return;
    }
    const sound = new Audio(SOUNDS[soundName]);
    sound.volume = 0.5;
    sound.play().catch(function () {});
}

function renderDolls(names) {
    const dollsContainer = document.querySelector(".machine__dolls");
    dollsContainer.innerHTML = "";

    names.forEach(function (name, index) {
        const doll = document.createElement("img");
        doll.classList.add("doll");
        doll.src = getDollImage(index);
        doll.alt = "Muñeco sorpresa";
        doll.dataset.name = name;

        const place = getDollPlace(index);
        doll.style.left = place.left + "%";
        doll.style.bottom = place.bottom + "%";
        doll.style.rotate = place.tilt + "deg";
        doll.style.zIndex = place.zIndex;

        dollsContainer.appendChild(doll);
    });
}

function renderDefaultDolls() {
    const names = [];
    for (let i = 0; i < DOLL_IMAGES.length; i++) {
        names.push("Branson " + (i + 1));
    }
    renderDolls(names);
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

function closeClaw() {
    const claw = document.querySelector(".claw");
    const clawImage = document.querySelector(".claw__image");
    claw.classList.add("claw--closed");
    clawImage.src = CLAW_CLOSED_IMAGE;
}

function openClaw() {
    const claw = document.querySelector(".claw");
    const clawImage = document.querySelector(".claw__image");
    claw.classList.remove("claw--closed");
    clawImage.src = CLAW_OPEN_IMAGE;
}

function moveClaw(direction) {
    if (isMachineBusy) {
        return;
    }
    updateClawPosition(getNextPosition(clawPosition, direction));
}

function tiltJoystick(direction) {
    const joystick = document.querySelector(".joystick");
    const claw = document.querySelector(".claw");
    joystick.classList.remove("joystick--left", "joystick--right");
    claw.classList.remove("claw--moving-left", "claw--moving-right");
    if (direction) {
        joystick.classList.add("joystick--" + direction);
        claw.classList.add("claw--moving-" + direction);
    }
}

function addTemporaryClass(element, className, time) {
    element.classList.add(className);
    setTimeout(function () {
        element.classList.remove(className);
    }, time);
}

function startMoving(direction) {
    if (isMachineBusy) {
        return;
    }
    stopMoving();
    tiltJoystick(direction);
    playSound("move");
    moveClaw(direction);
    moveInterval = setInterval(function () {
        moveClaw(direction);
    }, MOVE_INTERVAL);
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

    stopMoving();
    isMachineBusy = true;

    const claw = document.querySelector(".claw");
    claw.classList.add("claw--auto");
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

    closeClaw();
    playSound("grab");
    doll.style.left = "";
    doll.style.bottom = "";
    doll.style.rotate = "";
    doll.style.zIndex = "";
    doll.classList.add("doll--grabbed");
    claw.appendChild(doll);
    await wait(GRAB_TIME);

    claw.classList.remove("claw--down");
    await wait(DROP_TIME);

    claw.classList.add("claw--swinging");
    updateClawPosition(PRIZE_DOOR_POSITION);
    playSound("move");
    await wait(MOVE_TIME);

    claw.classList.remove("claw--swinging");
    openClaw();
    doll.classList.add("doll--falling");
    playSound("prize");
    await wait(DROP_TIME / 2);

    const machine = document.querySelector(".machine");
    addTemporaryClass(machine, "machine--shake", 400);
    addTemporaryClass(machine, "machine--party", 1500);
    await wait(DROP_TIME / 2);
    doll.remove();

    claw.classList.remove("claw--auto");
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
    claw.classList.remove("claw--down", "claw--auto", "claw--swinging");
    openClaw();
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
    }, 500);
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
    } else if (event.key === "ArrowDown") {
        event.preventDefault();
        handleButtonClick();
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
    renderDefaultDolls();
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
        getDollPlace,
        DOLL_PILE,
        DOLL_IMAGES,
        MIN_POSITION,
        MAX_POSITION,
        MOVE_STEP
    };
}
