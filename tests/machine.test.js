const {
    clampPosition,
    getNextPosition,
    getDollImage,
    getDollName,
    getDollSource,
    findClosestDoll,
    getDollPlace,
    isDollNear,
    GRAB_DISTANCE,
    LAUGH_DISTANCE,
    DOLL_PILE,
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

describe("findClosestDoll", () => {
    test("devuelve el muñeco que está justo debajo de la garra", () => {
        expect(findClosestDoll([10, 50, 80], 50)).toBe(1);
    });

    test("si hay dos cerca coge el más cercano", () => {
        expect(findClosestDoll([45, 52], 50)).toBe(1);
    });

    test("si no hay ningún muñeco cerca devuelve -1", () => {
        expect(findClosestDoll([10, 80], 50)).toBe(-1);
        expect(findClosestDoll([50 + GRAB_DISTANCE], 50)).toBe(-1);
    });

    test("si no hay muñecos devuelve -1", () => {
        expect(findClosestDoll([], 50)).toBe(-1);
    });
});

describe("isDollNear", () => {
    test("un muñeco al lado de la garra está cerca", () => {
        expect(isDollNear(50, 50)).toBe(true);
        expect(isDollNear(50, 50 + LAUGH_DISTANCE - 1)).toBe(true);
    });

    test("un muñeco lejos de la garra no está cerca", () => {
        expect(isDollNear(50, 50 + LAUGH_DISTANCE)).toBe(false);
        expect(isDollNear(10, 90)).toBe(false);
    });
});

describe("getDollName", () => {
    test("si recibe un texto lo devuelve tal cual", () => {
        expect(getDollName("Nerea")).toBe("Nerea");
    });

    test("si recibe un Branson devuelve su nombre", () => {
        expect(getDollName({ id: 4, name: "Pokebranson" })).toBe("Pokebranson");
    });
});

describe("getDollSource", () => {
    test("usa la imagen del Branson si es una URL", () => {
        const branson = { name: "Pokebranson", image: "https://res.cloudinary.com/pokebranson.png" };
        expect(getDollSource(branson, 0)).toBe(branson.image);
    });

    test("si la imagen no es una URL usa la de la máquina", () => {
        const branson = { name: "Brenda", image: "URL_DEL_BRANSON_VAQUERO" };
        expect(getDollSource(branson, 2)).toBe(DOLL_IMAGES[2]);
    });

    test("si recibe un texto usa la imagen de la máquina", () => {
        expect(getDollSource("Nerea", 0)).toBe(DOLL_IMAGES[0]);
    });
});

describe("getDollPlace", () => {
    test("devuelve el hueco del montón que toca", () => {
        const place = getDollPlace(0);
        expect(place.left).toBe(DOLL_PILE[0].left);
        expect(place.bottom).toBe(DOLL_PILE[0].bottom);
        expect(place.tilt).toBe(DOLL_PILE[0].tilt);
        expect(place.zIndex).toBe(DOLL_PILE[0].zIndex);
    });

    test("si hay más muñecos que huecos, los nuevos van un poco más arriba", () => {
        const first = getDollPlace(0);
        const repeated = getDollPlace(DOLL_PILE.length);
        expect(repeated.left).toBe(first.left);
        expect(repeated.bottom).toBeGreaterThan(first.bottom);
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
