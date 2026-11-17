/* persona 3 - Máquina de gancho (garra, joystick, animaciones y sonidos)

   Cómo se usa desde game.js (persona 1):
   1. Al empezar la partida: renderDolls(listaDeNombres)
   2. Escuchar cuando el jugador pulsa el botón:
        document.addEventListener("machine:button-pressed", function () {
            const nombre = ...tu algoritmo aleatorio...
            grabDoll(nombre);
        });
   3. Escuchar cuando el muñeco ya ha caído para enseñar el aviso:
        document.addEventListener("machine:prize", function (event) {
            console.log(event.detail.name);
        });
   4. Al reiniciar: resetMachine(listaDeNombres)
*/

// Límites de la garra (en % del ancho del cristal) y lo que avanza en cada paso
const MIN_POSITION = 10;
const MAX_POSITION = 90;
const MOVE_STEP = 5;
const PRIZE_DOOR_POSITION = 12;

// Tiempos de las animaciones (en milisegundos). Tienen que coincidir con machine.css
const MOVE_TIME = 600;
const DROP_TIME = 900;
const GRAB_TIME = 400;

// Rutas de los sonidos
const SOUNDS = {
    move: "../assets/sounds/claw-move.mp3",
    button: "../assets/sounds/button.mp3",
    drop: "../assets/sounds/claw-drop.mp3",
    grab: "../assets/sounds/claw-grab.mp3",
    prize: "../assets/sounds/prize.mp3"
};

let clawPosition = 50;
let isMachineBusy = false;
let moveInterval = null;

/* ---------- Funciones puras (se pueden testear sin el DOM) ---------- */

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

function getDollInitial(name) {
    if (!name || name.trim() === "") {
        return "?";
    }
    return name.trim().charAt(0).toUpperCase();
}

function wait(milliseconds) {
    return new Promise(function (resolve) {
        setTimeout(resolve, milliseconds);
    });
}

/* ---------- Sonidos ---------- */

function playSound(soundName) {
    const sound = new Audio(SOUNDS[soundName]);
    sound.volume = 0.5;
    // Si el archivo no existe o el navegador bloquea el sonido, no rompemos el juego
    sound.play().catch(function () {});
}

/* ---------- Muñecos ---------- */

function renderDolls(names) {
    const dollsContainer = document.querySelector(".machine__dolls");
    dollsContainer.innerHTML = "";

    names.forEach(function (name, index) {
        const doll = document.createElement("div");
        doll.classList.add("doll", "doll--color-" + (index % 6));
        doll.dataset.name = name;

        const face = document.createElement("span");
        face.classList.add("doll__face");
        face.textContent = getDollInitial(name);

        doll.appendChild(face);
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

/* ---------- Movimiento de la garra ---------- */

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

/* ---------- Coger un muñeco ----------
   Esta función la llama game.js (persona 1) con el nombre que ha salido
   en su algoritmo aleatorio. Aquí NO se hace ningún sorteo. */

async function grabDoll(name) {
    const doll = findDoll(name);
    if (!doll || isMachineBusy) {
        return;
    }

    isMachineBusy = true;
    stopMoving();

    const claw = document.querySelector(".claw");
    const clawHead = document.querySelector(".claw__head");
    const glass = document.querySelector(".machine__glass");
    const glassBox = glass.getBoundingClientRect();
    const dollBox = doll.getBoundingClientRect();

    // 1. La garra va hasta encima del muñeco
    const dollCenter = dollBox.left - glassBox.left + dollBox.width / 2;
    updateClawPosition(getPercentPosition(dollCenter, glassBox.width));
    playSound("move");
    await wait(MOVE_TIME);

    // 2. Baja
    claw.classList.add("claw--down");
    playSound("drop");
    await wait(DROP_TIME);

    // 3. Cierra y coge el muñeco
    claw.classList.add("claw--closed");
    playSound("grab");
    doll.classList.add("doll--grabbed");
    clawHead.appendChild(doll);
    await wait(GRAB_TIME);

    // 4. Sube
    claw.classList.remove("claw--down");
    await wait(DROP_TIME);

    // 5. Va hasta la puerta de premios
    updateClawPosition(PRIZE_DOOR_POSITION);
    playSound("move");
    await wait(MOVE_TIME);

    // 6. Abre y suelta el muñeco
    claw.classList.remove("claw--closed");
    doll.classList.add("doll--falling");
    playSound("prize");
    await wait(DROP_TIME);
    doll.remove();

    isMachineBusy = false;

    // Avisamos a game.js de que la animación ha terminado
    document.dispatchEvent(new CustomEvent("machine:prize", { detail: { name: name } }));
}

function resetMachine(names) {
    const claw = document.querySelector(".claw");
    isMachineBusy = false;
    stopMoving();
    claw.classList.remove("claw--down", "claw--closed");
    updateClawPosition(50);
    renderDolls(names);
}

/* ---------- Eventos ---------- */

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

    // game.js escucha este evento, hace el sorteo y llama a grabDoll(nombre)
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

    // Si en esta página no está la máquina, no hacemos nada
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

// Para poder usar las funciones en los tests con Jest
if (typeof module !== "undefined") {
    module.exports = {
        clampPosition,
        getNextPosition,
        getPercentPosition,
        getDollInitial,
        MIN_POSITION,
        MAX_POSITION,
        MOVE_STEP
    };
}
