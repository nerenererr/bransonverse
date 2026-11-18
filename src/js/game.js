/* persona 1*/
const MAX_ATTEMPTS = 3;
const GAME_TIME = 90;

const bransons = [
    {
        id: 1,
        name: "Standard Branson",
        image: "URL_DEL_BRANSON_VAQUERO",
        spawnWeight: 48,
        fallProbability: 15
    },
    {
        id: 2,
        name: "Brenda",
        image: "URL_DEL_BRANSON_VAQUERO",
        spawnWeight: 48,
        fallProbability: 15
    },
    {
        id: 3,
        name: "Branson especial de Halloween",
        image: "URL_DEL_BRANSON_VAQUERO",
        spawnWeight: 32,
        fallProbability: 30
    },
    {
        id: 4,
        name: "Pokebranson",
        image: "URL_DEL_BRANSON_VAQUERO",
        spawnWeight: 32,
        fallProbability: 30
    },
    {
        id: 5,
        name: "Nekobranson",
        image: "URL_DEL_BRANSON_VAQUERO",
        spawnWeight: 12,
        fallProbability: 55
    },
    {
        id: 6,
        name: "Branjosé Tomás",
        image: "URL_DEL_BRANSON_VAQUERO",
        spawnWeight: 32,
        fallProbability: 30
    },
    {
        id: 7,
        name: "Branson especial de San Valentín",
        image: "https://res.cloudinary.com/dbtuho5h0/image/upload/v1794398491/%C3%81ngel_Cupido_de_fieltro_con_arco_y_flecha_eow7bo.png",
        spawnWeight: 32,
        fallProbability: 30
    },
    {
        id: 8,
        name: "Brokeback Branson",
        image: "URL_DEL_BRANSON_VAQUERO",
        spawnWeight: 32,
        fallProbability: 30
    },
    {
        id: 9,
        name: "Branson especial de Navidad",
        image: "URL_DEL_BRANSON_VAQUERO",
        spawnWeight: 32,
        fallProbability: 30
    }
];

let attempts = MAX_ATTEMPTS;
let timeLeft = GAME_TIME;
let timerInterval = null;
let gameFinished = false;


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

    attempts = MAX_ATTEMPTS;
    timeLeft = GAME_TIME;
    gameFinished = false;

    gameFailure.hidden = true;
    gameResult.hidden = true;
    gameOver.hidden = true;

    updateCounters();

    startTimer(); // Temporalmente para probar el tiempo
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


function handleAttemptResult(success, branson = null) {
    if (gameFinished || attempts <= 0) return;

    if (success) {
        showResult(branson);
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
    gameFailure.hidden = false;

    setTimeout(() => {
        gameFailure.hidden = true;
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

// BOTONES TEMPORALES DE PRUEBA

document.getElementById("testWinBtn").addEventListener("click", () => {
    handleAttemptResult(true, {
        name: "Branson Vaquero",
        image: "/assets/branson-vaquero.png"
    });
});

document.getElementById("testLoseBtn").addEventListener("click", () => {
    endGame();
});

document.getElementById('testAttemptBtn').addEventListener('click', () => {
    console.log("Intento fallido pulsado");
    handleAttemptResult(false);
}); 