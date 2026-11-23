import {
    getBransonById,
    checkClawSuccess,
    generateMachineBransons
} from './random-selection.js';

import { renderBransons, finishGrab, resetMachine, setMachineEnabled } from "./machine.js";


const MAX_ATTEMPTS = 3;
const GAME_TIME = 90;

function getCustomNames() {
    if (
        typeof sessionStorage === 'undefined' ||
        sessionStorage.getItem('gameMode') !== 'custom'
    ) {
        return null;
    }

    try {
        const names = JSON.parse(sessionStorage.getItem('customNames') || '[]');

        if (!Array.isArray(names) || names.length < 9 || names.length > 15) {
            return null;
        }

        if (names.some(name => typeof name !== 'string' || !name.trim())) {
            return null;
        }

        const cleanNames = names.map(name => name.trim());
        const uniqueNames = new Set(
            cleanNames.map(name => name.toLocaleLowerCase('es'))
        );

        if (uniqueNames.size !== cleanNames.length) {
            return null;
        }

        return cleanNames;
    } catch {
        return null;
    }
}

let attempts = MAX_ATTEMPTS;
let timeLeft = GAME_TIME;
let timerInterval = null;
let gameFinished = false;
let failureTimeout = null;
let timerStarted = false;
let currentBransons = [];
let isCustomGame = false;


const attemptsCount = document.getElementById('attemptsCount');
const timeCount = document.getElementById('timeCount');

const gameFailure = document.getElementById('gameFailure');
const gameResult = document.getElementById('gameResult');
const gameOver = document.getElementById('gameOver');

const obtainedBranson = document.getElementById('obtainedBranson');
const obtainedBransonImage = document.getElementById('obtainedBransonImage');

const playAgainBtn = document.getElementById('playAgainBtn');
const restartGameBtn = document.getElementById('restartGameBtn');



function updateCounters() {
    attemptsCount.textContent = attempts;
    timeCount.textContent = timeLeft;
}

function startGame() {
    clearInterval(timerInterval);
    clearTimeout(failureTimeout);
    timerInterval = null;
    failureTimeout = null;

    attempts = MAX_ATTEMPTS;
    timeLeft = GAME_TIME;
    gameFinished = false;
    timerStarted = false;

    gameFailure.hidden = true;
    gameResult.hidden = true;
    gameOver.hidden = true;

    const customNames = getCustomNames();

isCustomGame = customNames !== null;

const generatedBransons = generateMachineBransons();

if (isCustomGame) {
    currentBransons = customNames.map((name, index) => ({
        ...generatedBransons[index],
        id: 1000 + index,
        name: name
    }));
} else {
    currentBransons = generatedBransons;
}

resetMachine(currentBransons);
setMachineEnabled(true);

    updateCounters();
}

function startTimer() {
    if (timerStarted || gameFinished) {
        return;
    }

    timerStarted = true;

    timerInterval = setInterval(() => {
        if (gameFinished) {
            clearInterval(timerInterval);
            timerInterval = null;
            return;
        }

        timeLeft--;
        updateCounters();

        if (timeLeft <= 0) {
            timeLeft = 0;
            updateCounters();
            endGame();
        }
    }, 1000);
}


function useAttempt() {
    if (gameFinished || attempts <= 0) return;
    attempts--;
    updateCounters();
    console.log("Intentos restantes:", attempts);
}


function handleAttemptResult(success, branson = null) {
    if (gameFinished) {
        return;
    }

    if (success) {
        if (branson) {
            showResult(branson);
        }
        return;
    }

    useAttempt();

    if (attempts === 0) {
        endGame();
    } else {
        showFailure();
    }
}


function showFailure() {
    clearTimeout(failureTimeout);

    gameFailure.hidden = false;

    failureTimeout = setTimeout(() => {
        gameFailure.hidden = true;
        failureTimeout = null;
    }, 3000);
}


function showResult(branson) {
    gameFinished = true;
    setMachineEnabled(false);

    clearInterval(timerInterval);
    clearTimeout(failureTimeout);

    timerInterval = null;
    failureTimeout = null;

    gameFailure.hidden = true;
    gameResult.hidden = false;

    obtainedBranson.textContent = branson.name;
    obtainedBransonImage.src = branson.image;

    if (!isCustomGame) {
        window.BransonCollection.unlock(branson.id);
    }
}

function endGame() {
    if (gameFinished) return;

    gameFinished = true;
    setMachineEnabled(false);
    clearInterval(timerInterval);
    clearTimeout(failureTimeout);

    timerInterval = null;
    failureTimeout = null;

    gameFailure.hidden = true;
    gameOver.hidden = false;
}


playAgainBtn.addEventListener('click', startGame);
restartGameBtn.addEventListener('click', startGame);

function getCurrentBransonById(id) {
    if (isCustomGame) {
        return currentBransons.find(branson => branson.id === id);
    }

    return getBransonById(id);
}

document.addEventListener('machine:interaction', () => {
    startTimer();
});

document.addEventListener('machine:branson-grabbed', (event) => {
    if (gameFinished) {
        return;
    }

    const branson = getCurrentBransonById(event.detail.id);

    if (!branson) {
        finishGrab(false);
        return;
    }

    const isSuccess = checkClawSuccess(branson);

    finishGrab(isSuccess);
});

document.addEventListener('machine:fail', () => {
    if (gameFinished) {
        return;
    }

    handleAttemptResult(false);
});

document.addEventListener('machine:empty', () => {
    if (gameFinished) {
        return;
    }

    handleAttemptResult(false);
});

document.addEventListener('machine:prize', (event) => {
    if (gameFinished) {
        return;
    }

    const branson = getCurrentBransonById(event.detail.id);

    if (!branson) {
        return;
    }

    handleAttemptResult(true, branson);
});

startGame();

export {
    updateCounters,
    startGame,
    startTimer,
    useAttempt,
    handleAttemptResult,
    showFailure,
    showResult,
    endGame
};