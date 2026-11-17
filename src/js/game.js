/* persona 1*/
const MAX_ATTEMTS = 3;
const GAME_TIME = 90;

let attempts = MAX_ATTEMTS;
let timeLeft = GAME_TIME;
let timerInterval = null;
let gameFinished = false;


const attemptsCount = document.getElementById('attemptsCount');
const timeCount = document.getElementById('timeCount');

const gameFailure = document.getElementById('gameResult');
const gameResult = document.getElementById('gameResult');
const gameOver = document.getElementById('gameOver');

const obtainedBranson = document.getElementById('obtainedBrandom');
const obtainedBransonImage = document.getElementById('obtainedBrandomImage');

const playAgainBtn = document.getElementById('playAgainBtn');
const restartGameBtn = document.getElementById('restartGameBtn');



function updateCounters() {
    attemptsCount.textContent = attempts;
    timeCount.textContent = timeLeft;
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


function showFailure() {
    gameFailure.hidden = false;
}


function showResult(branson) {
    gameFinished = true;
    clearInterval(timerInterval);

    gameFailure.hidden = true;
    gameResult.hidden = false;

    obtainedBranson.textContent = branson.name;
    obtainedBransonImage.src = branson.image;
}