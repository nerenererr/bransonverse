import {
    getBransonById,
    checkClawSuccess,
    generateMachineBransons
} from './random-selection.js';

import { renderBransons, finishGrab, resetMachine, setMachineEnabled } from "./machine.js";

const MAX_ATTEMPTS = 3;
const GAME_TIME = 90;

let attempts = MAX_ATTEMPTS;
let timeLeft = GAME_TIME;
let timerInterval = null;
let gameFinished = false;
let failureTimeout = null;
let timerStarted = false;
let currentBransons = [];


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

    currentBransons = generateMachineBransons();
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


document.addEventListener('machine:interaction', () => {
    startTimer();
});

document.addEventListener('machine:branson-grabbed', (event) => {
    if (gameFinished) {
        return;
    }

    const branson = getBransonById(event.detail.id);

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

    const branson = getBransonById(event.detail.id);

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