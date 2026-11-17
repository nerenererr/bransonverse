const {
    clampPosition,
    getNextPosition,
    getPercentPosition,
    getDollImage,
    DOLL_IMAGES,
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

describe("getDollImage", () => {
    test("devuelve la imagen que toca según la posición", () => {
        expect(getDollImage(0)).toBe(DOLL_IMAGES[0]);
        expect(getDollImage(3)).toBe(DOLL_IMAGES[3]);
    });

    test("si hay más nombres que imágenes vuelve a empezar", () => {
        expect(getDollImage(DOLL_IMAGES.length)).toBe(DOLL_IMAGES[0]);
        expect(getDollImage(DOLL_IMAGES.length + 1)).toBe(DOLL_IMAGES[1]);
    });
});
