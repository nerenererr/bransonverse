import {
    getBransonById,
    checkClawSuccess,
    generateMachineBransons
} from './random-selection.js';

import { renderBransons, finishGrab, resetMachine, setMachineEnabled } from "./machine.js";


const MAX_ATTEMPTS = 3;
const GAME_TIME = 90;
const LAST_NAME_DELAY = 4000;
const CUSTOM_STATE_KEY = 'customGameState';

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
let allCustomNames = [];
let remainingNames = [];


const attemptsCount = document.getElementById('attemptsCount');
const timeCount = document.getElementById('timeCount');

const gameFailure = document.getElementById('gameFailure');
const gameResult = document.getElementById('gameResult');
const gameOver = document.getElementById('gameOver');

const obtainedBranson = document.getElementById('obtainedBranson');
const obtainedBransonImage = document.getElementById('obtainedBransonImage');

const playAgainBtn = document.getElementById('playAgainBtn');
const restartGameBtn = document.getElementById('restartGameBtn');



function getRemainingNames(customNames) {
    try {
        const state = JSON.parse(sessionStorage.getItem(CUSTOM_STATE_KEY));

        if (state && JSON.stringify(state.all) === JSON.stringify(customNames)) {
            return state.remaining;
        }
    } catch {
        return [...customNames];
    }

    return [...customNames];
}

function saveRemainingNames() {
    sessionStorage.setItem(CUSTOM_STATE_KEY, JSON.stringify({
        all: allCustomNames,
        remaining: remainingNames
    }));
}

function finishCustomGame() {
    sessionStorage.removeItem('gameMode');
    sessionStorage.removeItem('customNames');
    sessionStorage.removeItem(CUSTOM_STATE_KEY);
    window.location.href = '../index.html';
}

function updateCounters() {
    attemptsCount.textContent = attempts;
    attemptsCount.className = 'attempts--' + attempts;
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
        allCustomNames = customNames;
        remainingNames = getRemainingNames(customNames);

        if (remainingNames.length === 0) {
            remainingNames = [...customNames];
        }

        saveRemainingNames();

        currentBransons = remainingNames.map((name, index) => ({
            ...generatedBransons[index],
            id: 1000 + index,
            name: name
        }));

        document.getElementById('resultTitle').textContent = 'Has obtenido a';
        gameResult.querySelector('.gameOverActions').hidden = false;
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
        if (typeof window !== 'undefined' && window.BransonCollection) {
            window.BransonCollection.unlock(branson.id);
        }
        return;
    }

    remainingNames = remainingNames.filter(name => name !== branson.name);
    saveRemainingNames();

    if (remainingNames.length === 0) {
        document.getElementById('resultTitle').textContent = '¡Era el último!';
        gameResult.querySelector('.gameOverActions').hidden = true;
        setTimeout(finishCustomGame, LAST_NAME_DELAY);
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