
import { jest } from '@jest/globals';

const standardBranson = {
    id: 1,
    name: 'Standard Branson',
    image: 'https://example.com/standard.png'
};

const brenda = {
    id: 2,
    name: 'Brenda',
    image: 'https://example.com/brenda.png'
};

const machineBransons = Array.from(
    { length: 15 },
    (_, index) => index % 2 === 0 ? standardBranson : brenda
);

const machineMocks = {
    renderBransons: jest.fn(),
    finishGrab: jest.fn(),
    resetMachine: jest.fn(),
    setMachineEnabled: jest.fn()
};

const selectionMocks = {
    getBransonById: jest.fn(),
    checkClawSuccess: jest.fn(),
    generateMachineBransons: jest.fn()
};

let game;
let elements;
let documentEvents;

function createElement() {
    const handlers = new Map();

    return {
        textContent: '',
        hidden: false,
        src: '',
        addEventListener: jest.fn((type, callback) => {
            handlers.set(type, callback);
        }),
        click() {
            handlers.get('click')?.();
        }
    };
}

function emitMachineEvent(type, detail = {}) {
    document.dispatchEvent({ type, detail });
}

beforeAll(async () => {
    const ids = [
        'attemptsCount',
        'timeCount',
        'gameFailure',
        'gameResult',
        'gameOver',
        'obtainedBranson',
        'obtainedBransonImage',
        'playAgainBtn',
        'restartGameBtn'
    ];

    elements = Object.fromEntries(
        ids.map(id => [id, createElement()])
    );

    documentEvents = new Map();

    globalThis.document = {
        getElementById: jest.fn(id => elements[id] ?? null),

        addEventListener: jest.fn((type, callback) => {
            if (!documentEvents.has(type)) {
                documentEvents.set(type, []);
            }

            documentEvents.get(type).push(callback);
        }),

        dispatchEvent: jest.fn(event => {
            for (const callback of documentEvents.get(event.type) ?? []) {
                callback(event);
            }

            return true;
        })
    };

    jest.useFakeTimers();

    jest.unstable_mockModule(
        '../src/js/machine.js',
        () => machineMocks
    );

    jest.unstable_mockModule(
        '../src/js/random-selection.js',
        () => selectionMocks
    );

    game = await import('../src/js/game.js');
});

beforeEach(() => {
    jest.clearAllTimers();

    selectionMocks.getBransonById.mockImplementation(id =>
        [standardBranson, brenda].find(branson => branson.id === id)
    );

    selectionMocks.checkClawSuccess.mockReturnValue(true);

    selectionMocks.generateMachineBransons.mockReturnValue(
        machineBransons
    );

    game.startGame();
    jest.clearAllMocks();
});

afterEach(() => {
    jest.clearAllTimers();
});

afterAll(() => {
    jest.useRealTimers();
    delete globalThis.document;
});

describe('Inicio y reinicio de partida', () => {
    test('La partida comienza con 3 intentos y 90 segundos', () => {
        expect(elements.attemptsCount.textContent).toBe(3);
        expect(elements.timeCount.textContent).toBe(90);
        expect(elements.gameFailure.hidden).toBe(true);
        expect(elements.gameResult.hidden).toBe(true);
        expect(elements.gameOver.hidden).toBe(true);
    });

    test('Al iniciar se generan 15 Bransons y se activa la máquina', () => {
        game.startGame();

        expect(selectionMocks.generateMachineBransons).toHaveBeenCalledTimes(1);
        expect(machineMocks.resetMachine).toHaveBeenCalledWith(machineBransons);
        expect(machineMocks.resetMachine.mock.calls[0][0]).toHaveLength(15);
        expect(machineMocks.setMachineEnabled).toHaveBeenCalledWith(true);
    });

    test('Reiniciar restaura intentos, tiempo y pantallas', () => {
        game.handleAttemptResult(false);
        game.handleAttemptResult(false);
        game.endGame();

        game.startGame();

        expect(elements.attemptsCount.textContent).toBe(3);
        expect(elements.timeCount.textContent).toBe(90);
        expect(elements.gameFailure.hidden).toBe(true);
        expect(elements.gameResult.hidden).toBe(true);
        expect(elements.gameOver.hidden).toBe(true);
        expect(machineMocks.setMachineEnabled).toHaveBeenLastCalledWith(true);
    });

    test('Los botones permiten volver a jugar después de ganar o perder', () => {
        game.showResult(brenda);
        elements.playAgainBtn.click();

        expect(elements.gameResult.hidden).toBe(true);
        expect(elements.attemptsCount.textContent).toBe(3);

        game.endGame();
        elements.restartGameBtn.click();

        expect(elements.gameOver.hidden).toBe(true);
        expect(elements.timeCount.textContent).toBe(90);
    });
});

describe('Intentos y resultados', () => {
    test('Un fallo descuenta un intento y muestra el aviso', () => {
        game.handleAttemptResult(false);

        expect(elements.attemptsCount.textContent).toBe(2);
        expect(elements.gameFailure.hidden).toBe(false);
        expect(elements.gameResult.hidden).toBe(true);
    });

    test('Tres fallos terminan la partida y desactivan la máquina', () => {
        game.handleAttemptResult(false);
        game.handleAttemptResult(false);
        game.handleAttemptResult(false);

        expect(elements.attemptsCount.textContent).toBe(0);
        expect(elements.gameOver.hidden).toBe(false);
        expect(elements.gameFailure.hidden).toBe(true);
        expect(machineMocks.setMachineEnabled).toHaveBeenLastCalledWith(false);
    });

    test('Conseguir un Branson finaliza la partida sin descontar intentos', () => {
        game.handleAttemptResult(true, brenda);

        expect(elements.attemptsCount.textContent).toBe(3);
        expect(elements.gameResult.hidden).toBe(false);
        expect(elements.obtainedBranson.textContent).toBe('Brenda');
        expect(elements.obtainedBransonImage.src).toBe(brenda.image);
        expect(machineMocks.setMachineEnabled).toHaveBeenLastCalledWith(false);
    });

    test('No se permiten nuevos resultados después de ganar o perder', () => {
        game.showResult(brenda);
        game.handleAttemptResult(false);
        game.useAttempt();

        expect(elements.attemptsCount.textContent).toBe(3);

        game.startGame();

        game.handleAttemptResult(false);
        game.handleAttemptResult(false);
        game.handleAttemptResult(false);
        game.handleAttemptResult(false);
        game.handleAttemptResult(true, brenda);

        expect(elements.attemptsCount.textContent).toBe(0);
        expect(elements.gameOver.hidden).toBe(false);
        expect(elements.gameResult.hidden).toBe(true);
    });
});

describe('Temporizador', () => {
    test('El temporizador no empieza automáticamente', () => {
        jest.advanceTimersByTime(5000);

        expect(elements.timeCount.textContent).toBe(90);
    });

    test('El tiempo comienza con la primera interacción y no se duplica', () => {
        emitMachineEvent('machine:interaction');
        emitMachineEvent('machine:interaction');

        jest.advanceTimersByTime(3000);

        emitMachineEvent('machine:interaction');

        jest.advanceTimersByTime(2000);

        expect(elements.timeCount.textContent).toBe(85);
    });

    test('Al llegar a cero termina la partida', () => {
        emitMachineEvent('machine:interaction');

        jest.advanceTimersByTime(90000);

        expect(elements.timeCount.textContent).toBe(0);
        expect(elements.gameOver.hidden).toBe(false);
        expect(machineMocks.setMachineEnabled).toHaveBeenLastCalledWith(false);
    });

    test('El temporizador se detiene cuando el jugador gana', () => {
        emitMachineEvent('machine:interaction');

        jest.advanceTimersByTime(10000);

        game.showResult(brenda);

        jest.advanceTimersByTime(20000);

        expect(elements.timeCount.textContent).toBe(80);
        expect(elements.gameResult.hidden).toBe(false);
    });

    test('Reiniciar elimina el temporizador anterior', () => {
        emitMachineEvent('machine:interaction');

        jest.advanceTimersByTime(10000);

        game.startGame();

        jest.advanceTimersByTime(5000);

        expect(elements.timeCount.textContent).toBe(90);

        emitMachineEvent('machine:interaction');

        jest.advanceTimersByTime(1000);

        expect(elements.timeCount.textContent).toBe(89);
    });
});

describe('Mensajes de fallo', () => {
    test('El mensaje de fallo desaparece después de 3 segundos', () => {
        game.showFailure();

        expect(elements.gameFailure.hidden).toBe(false);

        jest.advanceTimersByTime(2999);

        expect(elements.gameFailure.hidden).toBe(false);

        jest.advanceTimersByTime(1);

        expect(elements.gameFailure.hidden).toBe(true);
    });

    test('Reiniciar cancela el mensaje de fallo pendiente', () => {
        game.showFailure();

        jest.advanceTimersByTime(2000);

        game.startGame();
        game.showFailure();

        jest.advanceTimersByTime(1500);

        expect(elements.gameFailure.hidden).toBe(false);
    });
});

describe('Comunicación con machine.js', () => {
    test('Al recoger un Branson se comprueba su probabilidad', () => {
        selectionMocks.checkClawSuccess.mockReturnValue(true);

        emitMachineEvent('machine:branson-grabbed', { id: 2 });

        expect(selectionMocks.getBransonById).toHaveBeenCalledWith(2);
        expect(selectionMocks.checkClawSuccess).toHaveBeenCalledWith(brenda);
        expect(machineMocks.finishGrab).toHaveBeenCalledWith(true);
        expect(elements.gameResult.hidden).toBe(true);
    });

    test('Si falla la probabilidad se ejecuta la animación de caída', () => {
        selectionMocks.checkClawSuccess.mockReturnValue(false);

        emitMachineEvent('machine:branson-grabbed', { id: 1 });

        expect(machineMocks.finishGrab).toHaveBeenCalledWith(false);
        expect(elements.attemptsCount.textContent).toBe(3);
    });

    test('Un Branson con ID desconocido no bloquea la animación', () => {
        emitMachineEvent('machine:branson-grabbed', { id: 999 });

        expect(machineMocks.finishGrab).toHaveBeenCalledWith(false);
        expect(selectionMocks.checkClawSuccess).not.toHaveBeenCalled();
    });

    test('Los eventos de fallo y garra vacía descuentan intentos', () => {
        emitMachineEvent('machine:fail');

        expect(elements.attemptsCount.textContent).toBe(2);

        emitMachineEvent('machine:empty');

        expect(elements.attemptsCount.textContent).toBe(1);
        expect(elements.gameFailure.hidden).toBe(false);
    });

    test('La victoria aparece cuando la máquina entrega el premio', () => {
        emitMachineEvent('machine:branson-grabbed', { id: 2 });

        expect(elements.gameResult.hidden).toBe(true);

        emitMachineEvent('machine:prize', { id: 2 });

        expect(elements.gameResult.hidden).toBe(false);
        expect(elements.obtainedBranson.textContent).toBe('Brenda');
        expect(elements.attemptsCount.textContent).toBe(3);
    });
});
