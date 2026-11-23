import { jest } from '@jest/globals';

let startGame;
let useAttempt;
let endGame;
let showResult;
let showFailure;
let handleAttemptResult;
let elements;

beforeAll(async () => {
    elements = {};

    const ids = [
        'attemptsCount',
        'timeCount',
        'gameFailure',
        'gameResult',
        'gameOver',
        'obtainedBranson',
        'obtainedBransonImage',
        'playAgainBtn',
        'restartGameBtn',
        'testWinBtn',
        'testLoseBtn',
        'testAttemptBtn'
    ];

    ids.forEach(id => {
        elements[id] = {
            textContent: '',
            hidden: false,
            src: '',
            addEventListener: jest.fn()
        };
    });

    globalThis.document = {
        getElementById: jest.fn(id => elements[id] ?? null)
    };

    jest.useFakeTimers();

    const game = await import('../src/js/game.js');

    startGame = game.startGame;
    useAttempt = game.useAttempt;
    endGame = game.endGame;
    showResult = game.showResult;
    showFailure = game.showFailure;
    handleAttemptResult = game.handleAttemptResult;
});

afterAll(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    delete globalThis.document;
});

describe('Pruebas de la lógica del juego', () => {

    test('La partida debe comenzar con 3 intentos y 90 segundos', () => {
        startGame();

        expect(elements.attemptsCount.textContent).toBe(3);
        expect(elements.timeCount.textContent).toBe(90);
    });

    test('Un intento fallido debe restar un intento', () => {
    startGame();

    useAttempt();

    expect(elements.attemptsCount.textContent).toBe(2);
    });

    test('Los intentos no deben bajar de cero', () => {
    startGame();

    useAttempt();
    useAttempt();
    useAttempt();
    useAttempt();

    expect(elements.attemptsCount.textContent).toBe(0);
    });

    test('La partida debe finalizar cuando se agotan los intentos', () => {
    startGame();

    useAttempt();
    useAttempt();
    useAttempt();

    endGame();

    expect(elements.attemptsCount.textContent).toBe(0);
    expect(elements.gameOver.hidden).toBe(false);
    });

    test('Conseguir un Branson debe finalizar la partida sin restar intentos', () => {
    startGame();

    const branson = {
        id: 2,
        name: 'Brenda',
        image: 'https://example.com/brenda.png'
    };

    showResult(branson);

    expect(elements.attemptsCount.textContent).toBe(3);
    expect(elements.gameResult.hidden).toBe(false);
    expect(elements.obtainedBranson.textContent).toBe('Brenda');
    expect(elements.obtainedBransonImage.src).toBe(branson.image);
    });

    test('No se deben descontar intentos después de ganar', () => {
    startGame();

    const branson = {
        id: 2,
        name: 'Brenda',
        image: 'https://example.com/brenda.png'
    };

    showResult(branson);

    useAttempt();

    expect(elements.attemptsCount.textContent).toBe(3);
    expect(elements.gameResult.hidden).toBe(false);
    });

    test('Reiniciar la partida debe restaurar los valores iniciales', () => {
    startGame();

    useAttempt();
    useAttempt();

    endGame();

    startGame();

    expect(elements.attemptsCount.textContent).toBe(3);
    expect(elements.timeCount.textContent).toBe(90);

    expect(elements.gameFailure.hidden).toBe(true);
    expect(elements.gameResult.hidden).toBe(true);
    expect(elements.gameOver.hidden).toBe(true);
    });

    test('El temporizador debe disminuir un segundo', () => {
    startGame();

    expect(elements.timeCount.textContent).toBe(90);

    jest.advanceTimersByTime(1000);

    expect(elements.timeCount.textContent).toBe(89);
    });

    test('La partida debe finalizar cuando el temporizador llega a cero', () => {
    startGame();

    jest.advanceTimersByTime(90000);

    expect(elements.timeCount.textContent).toBe(0);
    expect(elements.gameOver.hidden).toBe(false);
    });

    test('El temporizador debe detenerse cuando el jugador gana', () => {
    startGame();

    jest.advanceTimersByTime(10000);

    const branson = {
        id: 2,
        name: 'Brenda',
        image: 'https://example.com/brenda.png'
    };

    showResult(branson);

    const remainingTime = elements.timeCount.textContent;

    jest.advanceTimersByTime(20000);

    expect(elements.timeCount.textContent).toBe(remainingTime);
    expect(elements.timeCount.textContent).toBe(80);
    expect(elements.gameResult.hidden).toBe(false);
    });

    test('El temporizador debe detenerse cuando el jugador pierde', () => {
    startGame();

    jest.advanceTimersByTime(10000);

    useAttempt();
    useAttempt();
    useAttempt();

    endGame();

    const remainingTime = elements.timeCount.textContent;

    jest.advanceTimersByTime(20000);

    expect(elements.attemptsCount.textContent).toBe(0);
    expect(elements.timeCount.textContent).toBe(remainingTime);
    expect(elements.timeCount.textContent).toBe(80);
    expect(elements.gameOver.hidden).toBe(false);
    });

    test('El mensaje de fallo debe aparecer y desaparecer después de 3 segundos', () => {
    startGame();

    showFailure();

    expect(elements.gameFailure.hidden).toBe(false);

    jest.advanceTimersByTime(2999);

    expect(elements.gameFailure.hidden).toBe(false);

    jest.advanceTimersByTime(1);

    expect(elements.gameFailure.hidden).toBe(true);
    });

    test('Un fallo de la garra debe descontar un intento', () => {
    startGame();

    const randomSpy = jest.spyOn(Math, 'random');

    try {
        randomSpy.mockReturnValue(0);

        handleAttemptResult();

        expect(elements.attemptsCount.textContent).toBe(2);
        expect(elements.gameResult.hidden).toBe(true);
        expect(elements.gameFailure.hidden).toBe(false);

    } finally {
        randomSpy.mockRestore();
    }
    });

    test('Tres fallos consecutivos deben finalizar la partida automáticamente', () => {
    startGame();

    const randomSpy = jest.spyOn(Math, 'random');

    try {
        randomSpy.mockReturnValue(0);

        handleAttemptResult();
        handleAttemptResult();
        handleAttemptResult();

        expect(elements.attemptsCount.textContent).toBe(0);
        expect(elements.gameOver.hidden).toBe(false);
        expect(elements.gameResult.hidden).toBe(true);
        expect(elements.gameFailure.hidden).toBe(true);

    } finally {
        randomSpy.mockRestore();
    }
    });

    test('Un intento exitoso debe finalizar la partida sin descontar intentos', () => {
    startGame();

    const randomSpy = jest.spyOn(Math, 'random');

    try {
        randomSpy.mockReturnValue(0.15);

        handleAttemptResult();

        expect(elements.attemptsCount.textContent).toBe(3);
        expect(elements.gameResult.hidden).toBe(false);
        expect(elements.gameOver.hidden).toBe(true);
        expect(elements.gameFailure.hidden).toBe(true);
        expect(elements.obtainedBranson.textContent).toBe('Standard Branson');

    } finally {
        randomSpy.mockRestore();
    }
    });

    test('No se deben permitir nuevos intentos después de una victoria', () => {
    startGame();

    const randomSpy = jest.spyOn(Math, 'random');

    try {
        randomSpy.mockReturnValue(0.15);

        handleAttemptResult();
        handleAttemptResult();

        expect(elements.attemptsCount.textContent).toBe(3);
        expect(elements.gameResult.hidden).toBe(false);
        expect(elements.gameOver.hidden).toBe(true);

    } finally {
        randomSpy.mockRestore();
    }
    });

    test('No se deben permitir nuevos intentos después de una derrota', () => {
    startGame();

    const randomSpy = jest.spyOn(Math, 'random');

    try {
        randomSpy.mockReturnValue(0);

        handleAttemptResult();
        handleAttemptResult();
        handleAttemptResult();

        expect(elements.attemptsCount.textContent).toBe(0);
        expect(elements.gameOver.hidden).toBe(false);

        randomSpy.mockReturnValue(0.15);

        handleAttemptResult();

        expect(elements.attemptsCount.textContent).toBe(0);
        expect(elements.gameOver.hidden).toBe(false);
        expect(elements.gameResult.hidden).toBe(true);

    } finally {
        randomSpy.mockRestore();
    }
    });

    test('Se debe poder ganar después de reiniciar una partida perdida', () => {
    startGame();

    const randomSpy = jest.spyOn(Math, 'random');

    try {
        randomSpy.mockReturnValue(0);

        handleAttemptResult();
        handleAttemptResult();
        handleAttemptResult();

        expect(elements.attemptsCount.textContent).toBe(0);
        expect(elements.gameOver.hidden).toBe(false);

        startGame();

        expect(elements.attemptsCount.textContent).toBe(3);
        expect(elements.gameOver.hidden).toBe(true);

        randomSpy.mockReturnValue(0.15);

        handleAttemptResult();

        expect(elements.attemptsCount.textContent).toBe(3);
        expect(elements.gameResult.hidden).toBe(false);
        expect(elements.obtainedBranson.textContent).toBe('Standard Branson');

    } finally {
        randomSpy.mockRestore();
    }
    });

    test('Se debe poder volver a jugar después de ganar', () => {
    startGame();

    const randomSpy = jest.spyOn(Math, 'random');

    try {
        randomSpy.mockReturnValue(0.15);

        handleAttemptResult();

        expect(elements.gameResult.hidden).toBe(false);
        expect(elements.attemptsCount.textContent).toBe(3);

        startGame();

        expect(elements.attemptsCount.textContent).toBe(3);
        expect(elements.timeCount.textContent).toBe(90);
        expect(elements.gameResult.hidden).toBe(true);

        randomSpy.mockReturnValue(0);

        handleAttemptResult();

        expect(elements.attemptsCount.textContent).toBe(2);
        expect(elements.gameFailure.hidden).toBe(false);
        expect(elements.gameOver.hidden).toBe(true);

    } finally {
        randomSpy.mockRestore();
    }
    });

    test('El mensaje de fallo anterior no debe afectar a una nueva partida', () => {
    startGame();

    showFailure();

    jest.advanceTimersByTime(2000);

    startGame();

    jest.advanceTimersByTime(500);

    showFailure();

    jest.advanceTimersByTime(500);

    expect(elements.gameFailure.hidden).toBe(false);
    });

    test('Una victoria debe ocultar el mensaje de fallo', () => {
    startGame();

    showFailure();

    const branson = {
        id: 2,
        name: 'Brenda',
        image: 'https://example.com/brenda.png'
    };

    showResult(branson);

    expect(elements.gameFailure.hidden).toBe(true);
    expect(elements.gameResult.hidden).toBe(false);

    jest.advanceTimersByTime(3000);

    expect(elements.gameResult.hidden).toBe(false);
    expect(elements.gameFailure.hidden).toBe(true);
    });

    test('No se deben permitir intentos cuando se agota el tiempo', () => {
    startGame();

    jest.advanceTimersByTime(90000);

    expect(elements.timeCount.textContent).toBe(0);
    expect(elements.gameOver.hidden).toBe(false);

    useAttempt();

    expect(elements.attemptsCount.textContent).toBe(3);
    expect(elements.gameOver.hidden).toBe(false);
    });

    test('El temporizador debe reiniciarse correctamente en una nueva partida', () => {
    startGame();

    jest.advanceTimersByTime(30000);

    expect(elements.timeCount.textContent).toBe(60);

    startGame();

    expect(elements.timeCount.textContent).toBe(90);

    jest.advanceTimersByTime(1000);

    expect(elements.timeCount.textContent).toBe(89);
    });

    test('El temporizador debe continuar después de un intento fallido', () => {
    startGame();

    jest.advanceTimersByTime(10000);

    const randomSpy = jest.spyOn(Math, 'random');

    try {
        randomSpy.mockReturnValue(0);

        handleAttemptResult();

        expect(elements.attemptsCount.textContent).toBe(2);
        expect(elements.timeCount.textContent).toBe(80);

        jest.advanceTimersByTime(5000);

        expect(elements.timeCount.textContent).toBe(75);
        expect(elements.gameOver.hidden).toBe(true);
        expect(elements.gameResult.hidden).toBe(true);

    } finally {
        randomSpy.mockRestore();
    }
    });

});

