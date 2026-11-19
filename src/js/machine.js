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
    prize: "",
    fail: "",
    laugh: ""
};

const MIN_POSITION = 10;
const MAX_POSITION = 90;
const MOVE_STEP = 2;
const MOVE_INTERVAL = 50;
const PRIZE_DOOR_POSITION = 88;
const GRAB_DISTANCE = 8;
const LAUGH_DISTANCE = 18;

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
let grabbedDoll = null;
let grabbedDollOldPlace = null;

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

function getDollImage(index) {
    return DOLL_IMAGES[index % DOLL_IMAGES.length];
}

function getDollName(item) {
    if (typeof item === "string") {
        return item;
    }
    return item.name;
}

function getDollSource(item, index) {
    if (typeof item === "object" && item.image && item.image.startsWith("http")) {
        return item.image;
    }
    return getDollImage(index);
}

function isDollNear(dollPosition, position) {
    return Math.abs(dollPosition - position) < LAUGH_DISTANCE;
}

function findClosestDoll(dollPositions, position) {
    let closestIndex = -1;
    let closestDistance = GRAB_DISTANCE;

    dollPositions.forEach(function (dollPosition, index) {
        const distance = Math.abs(dollPosition - position);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
        }
    });

    return closestIndex;
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

function renderDolls(items) {
    const dollsContainer = document.querySelector(".machine__dolls");
    dollsContainer.innerHTML = "";

    items.forEach(function (item, index) {
        const doll = document.createElement("img");
        doll.classList.add("doll");
        doll.src = getDollSource(item, index);
        doll.alt = "Muñeco sorpresa";
        doll.dataset.name = getDollName(item);
        if (item.id !== undefined) {
            doll.dataset.id = item.id;
        }

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

function getDollsWithPosition() {
    const playAreaBox = document.querySelector(".machine__play-area").getBoundingClientRect();
    const dolls = document.querySelectorAll(".machine__dolls .doll");
    const list = [];

    dolls.forEach(function (doll) {
        const dollBox = doll.getBoundingClientRect();
        const dollCenter = dollBox.left - playAreaBox.left + dollBox.width / 2;
        list.push({
            doll: doll,
            position: (dollCenter / playAreaBox.width) * 100
        });
    });

    return list;
}

function findDollUnderClaw() {
    const list = getDollsWithPosition();
    const positions = list.map(function (item) {
        return item.position;
    });

    const index = findClosestDoll(positions, clawPosition);
    if (index === -1) {
        return null;
    }
    return list[index].doll;
}

function updateClawPosition(newPosition) {
    const claw = document.querySelector(".claw");
    clawPosition = newPosition;
    claw.style.left = clawPosition + "%";
}

function placeAboveDoll(element, doll, leftFactor, topFactor) {
    const containerBox = document.querySelector(".machine__dolls").getBoundingClientRect();
    const dollBox = doll.getBoundingClientRect();
    const left = dollBox.left - containerBox.left + dollBox.width * leftFactor;
    const top = dollBox.top - containerBox.top + dollBox.height * topFactor;

    element.style.left = (left / containerBox.width) * 100 + "%";
    element.style.top = (top / containerBox.height) * 100 + "%";
}

function showLaughText(doll) {
    const dollsContainer = document.querySelector(".machine__dolls");

    for (let i = 0; i < 3; i++) {
        const text = document.createElement("span");
        text.classList.add("laugh-text", "laugh-text--" + i);
        text.textContent = "JA";
        placeAboveDoll(text, doll, 0.2 + i * 0.3, 0.1);
        dollsContainer.appendChild(text);
        setTimeout(function () {
            text.remove();
        }, 2000);
    }
}

function makeDollLaugh(doll) {
    playSound("laugh");
    showLaughText(doll);
    addTemporaryClass(doll, "doll--laughing", 1500);
}

function makeNearDollsLaugh() {
    getDollsWithPosition().forEach(function (item) {
        if (isDollNear(item.position, clawPosition)) {
            makeDollLaugh(item.doll);
        }
    });
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

function dropDollBack(doll, dollsContainer, oldPlace) {
    const before = doll.getBoundingClientRect();

    doll.classList.remove("doll--grabbed");
    doll.style.transition = "none";
    doll.style.translate = "";
    doll.style.left = oldPlace.left;
    doll.style.bottom = oldPlace.bottom;
    doll.style.rotate = oldPlace.rotate;
    doll.style.zIndex = oldPlace.zIndex;
    dollsContainer.appendChild(doll);

    const after = doll.getBoundingClientRect();
    const moveX = (before.left + before.width / 2) - (after.left + after.width / 2);
    const moveY = (before.top + before.height / 2) - (after.top + after.height / 2);

    doll.style.translate = moveX + "px " + moveY + "px";
    doll.style.rotate = "0deg";
    doll.getBoundingClientRect();

    doll.style.transition = "translate 0.5s ease-in, rotate 0.5s ease-in";
    doll.style.translate = "";
    doll.style.rotate = oldPlace.rotate;

    playSound("fail");
    setTimeout(function () {
        doll.style.transition = "";
        addTemporaryClass(doll, "doll--landed", 300);
    }, 500);
}

function moveDollIntoClaw(doll, claw) {
    const before = doll.getBoundingClientRect();
    const oldRotate = doll.style.rotate;

    doll.style.left = "";
    doll.style.bottom = "";
    doll.style.rotate = "";
    doll.style.zIndex = "";
    doll.classList.add("doll--grabbed");
    claw.appendChild(doll);

    const after = doll.getBoundingClientRect();
    const moveX = (before.left + before.width / 2) - (after.left + after.width / 2);
    const moveY = (before.top + before.height / 2) - (after.top + after.height / 2);

    doll.style.transition = "none";
    doll.style.translate = "calc(-50% + " + moveX + "px) " + moveY + "px";
    doll.style.rotate = oldRotate;
    doll.getBoundingClientRect();

    doll.style.transition = "translate 0.4s ease-out, rotate 0.4s ease-out";
    doll.style.translate = "";
    doll.style.rotate = "0deg";
}

function getDollInfo(doll) {
    let id = null;
    if (doll.dataset.id !== undefined) {
        id = Number(doll.dataset.id);
    }
    return { id: id, name: doll.dataset.name };
}

async function dropClaw() {
    if (isMachineBusy) {
        return;
    }

    stopMoving();
    isMachineBusy = true;

    const claw = document.querySelector(".claw");
    claw.classList.add("claw--auto");
    claw.classList.add("claw--down");
    playSound("drop");
    await wait(DROP_TIME);

    const doll = findDollUnderClaw();

    closeClaw();
    addTemporaryClass(claw, "claw--gripping", 300);
    playSound("grab");

    if (!doll) {
        await wait(GRAB_TIME);
        claw.classList.remove("claw--down");
        await wait(DROP_TIME);
        openClaw();
        claw.classList.remove("claw--auto");
        isMachineBusy = false;
        makeNearDollsLaugh();
        document.dispatchEvent(new CustomEvent("machine:empty"));
        return;
    }

    grabbedDollOldPlace = {
        left: doll.style.left,
        bottom: doll.style.bottom,
        rotate: doll.style.rotate,
        zIndex: doll.style.zIndex
    };
    grabbedDoll = doll;
    moveDollIntoClaw(doll, claw);
    await wait(GRAB_TIME);

    document.dispatchEvent(new CustomEvent("machine:doll-grabbed", { detail: getDollInfo(doll) }));
}

async function finishGrab(isSuccess) {
    if (!grabbedDoll) {
        return;
    }

    const doll = grabbedDoll;
    const oldPlace = grabbedDollOldPlace;
    const dollInfo = getDollInfo(doll);
    grabbedDoll = null;
    grabbedDollOldPlace = null;

    const claw = document.querySelector(".claw");
    const dollsContainer = document.querySelector(".machine__dolls");
    claw.classList.remove("claw--down");

    if (!isSuccess) {
        await wait(DROP_TIME / 3);
        dropDollBack(doll, dollsContainer, oldPlace);
        await wait(DROP_TIME);
        openClaw();
        claw.classList.remove("claw--auto");
        isMachineBusy = false;
        makeDollLaugh(doll);
        document.dispatchEvent(new CustomEvent("machine:fail", { detail: dollInfo }));
        return;
    }

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

    document.dispatchEvent(new CustomEvent("machine:prize", { detail: dollInfo }));
}

function resetMachine(items) {
    const claw = document.querySelector(".claw");
    const dollInClaw = claw.querySelector(".doll");
    if (dollInClaw) {
        dollInClaw.remove();
    }
    grabbedDoll = null;
    grabbedDollOldPlace = null;
    isMachineBusy = false;
    stopMoving();
    claw.classList.remove("claw--down", "claw--auto", "claw--swinging");
    openClaw();
    updateClawPosition(50);
    renderDolls(items);
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
    dropClaw();
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
    if (event.key === "ArrowDown") {
        event.preventDefault();
    }
    if (event.repeat) {
        return;
    }
    if (event.key === "ArrowLeft") {
        startMoving("left");
    } else if (event.key === "ArrowRight") {
        startMoving("right");
    } else if (event.key === "ArrowDown") {
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
        getDollImage,
        getDollName,
        getDollSource,
        findClosestDoll,
        getDollPlace,
        isDollNear,
        GRAB_DISTANCE,
        LAUGH_DISTANCE,
        DOLL_PILE,
        DOLL_IMAGES,
        MIN_POSITION,
        MAX_POSITION,
        MOVE_STEP
    };
}
