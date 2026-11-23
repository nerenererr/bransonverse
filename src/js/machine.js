const CLOUDINARY = "https://res.cloudinary.com/da9tytxsu/image/upload/f_auto,q_auto/";
const BRANSONS_CLOUDINARY = "https://res.cloudinary.com/da9tytxsu/image/upload/e_trim/f_auto,q_auto/";

const CLAW_OPEN_IMAGE = CLOUDINARY + "v1794919052/extended_claw_qmld36.png";
const CLAW_CLOSED_IMAGE = CLOUDINARY + "v1794919052/claw_closed_gk492g.png";

const BRANSON_IMAGES = [
    BRANSONS_CLOUDINARY + "v1794918844/Figura_de_arcilla_con_sudadera_y_zapatillas_1_xbmwkl.png",
    BRANSONS_CLOUDINARY + "v1794918844/Diablillo_de_fieltro_con_tridente_1_b3myuz.png",
    BRANSONS_CLOUDINARY + "v1794918844/Personaje_de_arcilla_con_gorra_rosa_1_pxfjgn.png",
    BRANSONS_CLOUDINARY + "v1794918844/Figura_de_plastilina_con_disfraz_de_Pikachu_1_newyv9.png",
    BRANSONS_CLOUDINARY + "v1794918844/Personaje_gato_de_arcilla_con_campana_1_wkphmv.png",
    BRANSONS_CLOUDINARY + "v1794918843/Torero_Chibi_de_Fieltro_con_Capa_Roja_1_uh8wiw.png",
    BRANSONS_CLOUDINARY + "v1794918843/%C3%81ngel_Cupido_de_fieltro_con_arco_y_flecha_1_dbn5zv.png",
    BRANSONS_CLOUDINARY + "v1794918844/Figura_de_reno_de_plastilina_con_bast%C3%B3n_de_caramelo_3_lm56zq.png",
    BRANSONS_CLOUDINARY + "v1794918844/Joven_vaquero_de_arcilla_con_estrella_amarilla_1_avrv05.png"
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

const BRANSON_PILE = [
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
let grabbedBranson = null;
let grabbedBransonOldPlace = null;

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

function getBransonImage(index) {
    return BRANSON_IMAGES[index % BRANSON_IMAGES.length];
}

function getBransonName(item) {
    if (typeof item === "string") {
        return item;
    }
    return item.name;
}

function getBransonSource(item, index) {
    if (typeof item === "object" && item.image && item.image.startsWith("http")) {
        return item.image;
    }
    return getBransonImage(index);
}

function isBransonNear(bransonPosition, position) {
    return Math.abs(bransonPosition - position) < LAUGH_DISTANCE;
}

function findClosestBranson(bransonPositions, position) {
    let closestIndex = -1;
    let closestDistance = GRAB_DISTANCE;

    bransonPositions.forEach(function (bransonPosition, index) {
        const distance = Math.abs(bransonPosition - position);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
        }
    });

    return closestIndex;
}

function getBransonPlace(index) {
    const place = BRANSON_PILE[index % BRANSON_PILE.length];
    const round = Math.floor(index / BRANSON_PILE.length);

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

function renderBransons(items) {
    const bransonsContainer = document.querySelector(".machine__bransons");
    bransonsContainer.innerHTML = "";

    items.forEach(function (item, index) {
        const branson = document.createElement("img");
        branson.classList.add("branson");
        branson.src = getBransonSource(item, index);
        branson.alt = "Muñeco sorpresa";
        branson.dataset.name = getBransonName(item);
        if (item.id !== undefined) {
            branson.dataset.id = item.id;
        }

        const place = getBransonPlace(index);
        branson.style.left = place.left + "%";
        branson.style.bottom = place.bottom + "%";
        branson.style.rotate = place.tilt + "deg";
        branson.style.zIndex = place.zIndex;

        bransonsContainer.appendChild(branson);
    });
}

function renderDefaultBransons() {
    const names = [];
    for (let i = 0; i < BRANSON_IMAGES.length; i++) {
        names.push("Branson " + (i + 1));
    }
    renderBransons(names);
}

function getBransonsWithPosition() {
    const playAreaBox = document.querySelector(".machine__play-area").getBoundingClientRect();
    const bransons = document.querySelectorAll(".machine__bransons .branson");
    const list = [];

    bransons.forEach(function (branson) {
        const bransonBox = branson.getBoundingClientRect();
        const bransonCenter = bransonBox.left - playAreaBox.left + bransonBox.width / 2;
        list.push({
            branson: branson,
            position: (bransonCenter / playAreaBox.width) * 100
        });
    });

    return list;
}

function findBransonUnderClaw() {
    const list = getBransonsWithPosition();
    const positions = list.map(function (item) {
        return item.position;
    });

    const index = findClosestBranson(positions, clawPosition);
    if (index === -1) {
        return null;
    }
    return list[index].branson;
}

function updateClawPosition(newPosition) {
    const claw = document.querySelector(".claw");
    clawPosition = newPosition;
    claw.style.left = clawPosition + "%";
}

function placeAboveBranson(element, branson, leftFactor, topFactor) {
    const containerBox = document.querySelector(".machine__bransons").getBoundingClientRect();
    const bransonBox = branson.getBoundingClientRect();
    const left = bransonBox.left - containerBox.left + bransonBox.width * leftFactor;
    const top = bransonBox.top - containerBox.top + bransonBox.height * topFactor;

    element.style.left = (left / containerBox.width) * 100 + "%";
    element.style.top = (top / containerBox.height) * 100 + "%";
}

function showLaughText(branson) {
    const bransonsContainer = document.querySelector(".machine__bransons");

    for (let i = 0; i < 3; i++) {
        const text = document.createElement("span");
        text.classList.add("laugh-text", "laugh-text--" + i);
        text.textContent = "JA";
        placeAboveBranson(text, branson, 0.2 + i * 0.3, 0.1);
        bransonsContainer.appendChild(text);
        setTimeout(function () {
            text.remove();
        }, 2000);
    }
}

function makeBransonLaugh(branson) {
    playSound("laugh");
    showLaughText(branson);
    addTemporaryClass(branson, "branson--laughing", 1500);
}

function makeNearBransonsLaugh() {
    getBransonsWithPosition().forEach(function (item) {
        if (isBransonNear(item.position, clawPosition)) {
            makeBransonLaugh(item.branson);
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

function dropBransonBack(branson, bransonsContainer, oldPlace) {
    const before = branson.getBoundingClientRect();

    branson.classList.remove("branson--grabbed");
    branson.style.transition = "none";
    branson.style.translate = "";
    branson.style.left = oldPlace.left;
    branson.style.bottom = oldPlace.bottom;
    branson.style.rotate = oldPlace.rotate;
    branson.style.zIndex = oldPlace.zIndex;
    bransonsContainer.appendChild(branson);

    const after = branson.getBoundingClientRect();
    const moveX = (before.left + before.width / 2) - (after.left + after.width / 2);
    const moveY = (before.top + before.height / 2) - (after.top + after.height / 2);

    branson.style.translate = moveX + "px " + moveY + "px";
    branson.style.rotate = "0deg";
    branson.getBoundingClientRect();

    branson.style.transition = "translate 0.5s ease-in, rotate 0.5s ease-in";
    branson.style.translate = "";
    branson.style.rotate = oldPlace.rotate;

    playSound("fail");
    setTimeout(function () {
        branson.style.transition = "";
        addTemporaryClass(branson, "branson--landed", 300);
    }, 500);
}

function moveBransonIntoClaw(branson, claw) {
    const before = branson.getBoundingClientRect();
    const oldRotate = branson.style.rotate;

    branson.style.left = "";
    branson.style.bottom = "";
    branson.style.rotate = "";
    branson.style.zIndex = "";
    branson.classList.add("branson--grabbed");
    claw.appendChild(branson);

    const after = branson.getBoundingClientRect();
    const moveX = (before.left + before.width / 2) - (after.left + after.width / 2);
    const moveY = (before.top + before.height / 2) - (after.top + after.height / 2);

    branson.style.transition = "none";
    branson.style.translate = "calc(-50% + " + moveX + "px) " + moveY + "px";
    branson.style.rotate = oldRotate;
    branson.getBoundingClientRect();

    branson.style.transition = "translate 0.4s ease-out, rotate 0.4s ease-out";
    branson.style.translate = "";
    branson.style.rotate = "0deg";
}

function getBransonInfo(branson) {
    let id = null;
    if (branson.dataset.id !== undefined) {
        id = Number(branson.dataset.id);
    }
    return { id: id, name: branson.dataset.name };
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

    const branson = findBransonUnderClaw();

    closeClaw();
    addTemporaryClass(claw, "claw--gripping", 300);
    playSound("grab");

    if (!branson) {
        await wait(GRAB_TIME);
        claw.classList.remove("claw--down");
        await wait(DROP_TIME);
        openClaw();
        claw.classList.remove("claw--auto");
        isMachineBusy = false;
        makeNearBransonsLaugh();
        document.dispatchEvent(new CustomEvent("machine:empty"));
        return;
    }

    grabbedBransonOldPlace = {
        left: branson.style.left,
        bottom: branson.style.bottom,
        rotate: branson.style.rotate,
        zIndex: branson.style.zIndex
    };
    grabbedBranson = branson;
    moveBransonIntoClaw(branson, claw);
    await wait(GRAB_TIME);

    document.dispatchEvent(new CustomEvent("machine:branson-grabbed", { detail: getBransonInfo(branson) }));
}

async function finishGrab(isSuccess) {
    if (!grabbedBranson) {
        return;
    }

    const branson = grabbedBranson;
    const oldPlace = grabbedBransonOldPlace;
    const bransonInfo = getBransonInfo(branson);
    grabbedBranson = null;
    grabbedBransonOldPlace = null;

    const claw = document.querySelector(".claw");
    const bransonsContainer = document.querySelector(".machine__bransons");
    claw.classList.remove("claw--down");

    if (!isSuccess) {
        await wait(DROP_TIME / 3);
        dropBransonBack(branson, bransonsContainer, oldPlace);
        await wait(DROP_TIME);
        openClaw();
        claw.classList.remove("claw--auto");
        isMachineBusy = false;
        makeBransonLaugh(branson);
        document.dispatchEvent(new CustomEvent("machine:fail", { detail: bransonInfo }));
        return;
    }

    await wait(DROP_TIME);

    claw.classList.add("claw--swinging");
    updateClawPosition(PRIZE_DOOR_POSITION);
    playSound("move");
    await wait(MOVE_TIME);

    claw.classList.remove("claw--swinging");
    openClaw();
    branson.classList.add("branson--falling");
    playSound("prize");
    await wait(DROP_TIME / 2);

    const machine = document.querySelector(".machine");
    addTemporaryClass(machine, "machine--shake", 400);
    addTemporaryClass(machine, "machine--party", 1500);
    await wait(DROP_TIME / 2);
    branson.remove();

    claw.classList.remove("claw--auto");
    isMachineBusy = false;

    document.dispatchEvent(new CustomEvent("machine:prize", { detail: bransonInfo }));
}

function resetMachine(items) {
    const claw = document.querySelector(".claw");
    const bransonInClaw = claw.querySelector(".branson");
    if (bransonInClaw) {
        bransonInClaw.remove();
    }
    grabbedBranson = null;
    grabbedBransonOldPlace = null;
    isMachineBusy = false;
    stopMoving();
    claw.classList.remove("claw--down", "claw--auto", "claw--swinging");
    openClaw();
    updateClawPosition(50);
    renderBransons(items);
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
    renderDefaultBransons();
}

if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", initMachine);
}

if (typeof module !== "undefined") {
    module.exports = {
        clampPosition,
        getNextPosition,
        getBransonImage,
        getBransonName,
        getBransonSource,
        findClosestBranson,
        getBransonPlace,
        isBransonNear,
        GRAB_DISTANCE,
        LAUGH_DISTANCE,
        BRANSON_PILE,
        BRANSON_IMAGES,
        MIN_POSITION,
        MAX_POSITION,
        MOVE_STEP
    };
}
