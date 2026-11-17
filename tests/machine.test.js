/* persona 3 - Tests de la máquina */

const {
    clampPosition,
    getNextPosition,
    getPercentPosition,
    getDollInitial,
    MIN_POSITION,
    MAX_POSITION,
    MOVE_STEP
} = require("../src/js/machine.js");

describe("clampPosition", () => {
    test("deja igual una posición que está dentro de los límites", () => {
        expect(clampPosition(50)).toBe(50);
    });

    test("no deja que la garra se salga por la izquierda", () => {
        expect(clampPosition(-20)).toBe(MIN_POSITION);
    });

    test("no deja que la garra se salga por la derecha", () => {
        expect(clampPosition(150)).toBe(MAX_POSITION);
    });
});

describe("getNextPosition", () => {
    test("mueve la garra a la izquierda", () => {
        expect(getNextPosition(50, "left")).toBe(50 - MOVE_STEP);
    });

    test("mueve la garra a la derecha", () => {
        expect(getNextPosition(50, "right")).toBe(50 + MOVE_STEP);
    });

    test("no pasa del límite izquierdo", () => {
        expect(getNextPosition(MIN_POSITION, "left")).toBe(MIN_POSITION);
    });

    test("no pasa del límite derecho", () => {
        expect(getNextPosition(MAX_POSITION, "right")).toBe(MAX_POSITION);
    });

    test("si la dirección no es válida no se mueve", () => {
        expect(getNextPosition(50, "up")).toBe(50);
    });
});

describe("getPercentPosition", () => {
    test("calcula el porcentaje del centro del muñeco", () => {
        expect(getPercentPosition(150, 300)).toBe(50);
    });

    test("respeta los límites de la garra", () => {
        expect(getPercentPosition(0, 300)).toBe(MIN_POSITION);
        expect(getPercentPosition(300, 300)).toBe(MAX_POSITION);
    });

    test("si el contenedor no tiene ancho devuelve el centro", () => {
        expect(getPercentPosition(100, 0)).toBe(50);
    });
});

describe("getDollInitial", () => {
    test("devuelve la primera letra en mayúscula", () => {
        expect(getDollInitial("nerea")).toBe("N");
    });

    test("ignora los espacios del principio", () => {
        expect(getDollInitial("   carlos")).toBe("C");
    });

    test("si no hay nombre devuelve una interrogación", () => {
        expect(getDollInitial("")).toBe("?");
        expect(getDollInitial(undefined)).toBe("?");
    });
});
