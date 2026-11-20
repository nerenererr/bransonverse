/* persona 1*/
import {
    bransons,
    getBransonById,
    selectRandomBranson,
    checkClawSuccess,
    generateMachineBransons
} from './random-selection.js';

const MAX_ATTEMPTS = 3;
const GAME_TIME = 90;

let attempts = MAX_ATTEMPTS;
let timeLeft = GAME_TIME;
let timerInterval = null;
let gameFinished = false;
let failureTimeout = null;


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
    failureTimeout = null;

    attempts = MAX_ATTEMPTS;
    timeLeft = GAME_TIME;
    gameFinished = false;

    gameFailure.hidden = true;
    gameResult.hidden = true;
    gameOver.hidden = true;

    updateCounters();
}

function startTimer() {
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        if (gameFinished) {
            clearInterval(timerInterval);
            return;
        } 
        timeLeft--;
        updateCounters();

        if (timeLeft <= 0) {
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


function handleAttemptResult() {
    if (gameFinished || attempts <= 0) return;

    const selectedBranson = selectRandomBranson();
    const success = checkClawSuccess(selectedBranson);

    if (success) {
        showResult(selectedBranson);
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
    clearInterval(timerInterval);

    gameFailure.hidden = true;
    gameResult.hidden = false;

    obtainedBranson.textContent = branson.name;
    obtainedBransonImage.src = branson.image;
}

function endGame() {
    if (gameFinished) return;

    gameFinished = true;
    clearInterval(timerInterval);

    gameFailure.hidden = true;
    gameOver.hidden = false;
}



playAgainBtn.addEventListener('click', startGame);
restartGameBtn.addEventListener('click', startGame);

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