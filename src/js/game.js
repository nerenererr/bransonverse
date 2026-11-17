/* persona 1*/
const MAX_ATTEMTS = 3;
const GAME_TIME = 90;

let attempts = MAX_ATTEMTS;
let timeLeft = GAME_TIME;
let timerInterval = null;
let gameFinished = false;


const attemptsCount = document.getElementById('attemptsCount');
const timeCount = document.getElementById('timeCount');

const gameFailure = document.getElementById('gameFailure');
const gameResult = document.getElementById('gameResult');
const gameOver = document.getElementById('gameOver');

const obtainedBranson = document.getElementById('obtainedBransom');
const obtainedBransonImage = document.getElementById('obtainedBransomImage');

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

function endGame() {
    if (gameFinished) return;

    gameFinished = true;
    clearInterval(timerInterval);

    gameFailure.hidden = true;
    gameOver.hidden = false;
}

function startGame() {
    clearInterval(timerInterval);

    attempts = MAX_ATTEMTS;
    timeLeft = GAME_TIME;
    gameFinished = false;

    gameFailure.hidden = true;
    gameResult.hidden = true;
    gameOver.hidden = true;

    updateCounters();
}


playAgainBtn.addEventListener('click', startGame);
restartGameBtn.addEventListener('click', startGame);

startGame();

// BOTONES TEMPORALES DE PRUEBA

document.getElementById("testWinBtn").addEventListener("click", () => {
    showResult({
        name: "Brandon Vaquero",
        image: "/assets/brandon-vaquero.png"
    });
});

document.getElementById("testLoseBtn").addEventListener("click", () => {
    endGame();
});