import {
    clampPosition,
    getNextPosition,
    getBransonImage,
    getBransonName,
    getBransonSource,
    trimCloudinaryImage,
    findClosestBranson,
    getBransonPlace,
    isBransonNear,
    GRAB_DISTANCE,
    LAUGH_DISTANCE,
    BRANSON_PILE,
    BRANSON_IMAGES,
    MIN_POSITION,
    MAX_POSITION,
    MOVE_STEP
} from "../src/js/machine.js";

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

describe("findClosestBranson", () => {
    test("devuelve el muñeco que está justo debajo de la garra", () => {
        expect(findClosestBranson([10, 50, 80], 50)).toBe(1);
    });

    test("si hay dos cerca coge el más cercano", () => {
        expect(findClosestBranson([45, 52], 50)).toBe(1);
    });

    test("si no hay ningún muñeco cerca devuelve -1", () => {
        expect(findClosestBranson([10, 80], 50)).toBe(-1);
        expect(findClosestBranson([50 + GRAB_DISTANCE], 50)).toBe(-1);
    });

    test("si no hay muñecos devuelve -1", () => {
        expect(findClosestBranson([], 50)).toBe(-1);
    });
});

describe("isBransonNear", () => {
    test("un muñeco al lado de la garra está cerca", () => {
        expect(isBransonNear(50, 50)).toBe(true);
        expect(isBransonNear(50, 50 + LAUGH_DISTANCE - 1)).toBe(true);
    });

    test("un muñeco lejos de la garra no está cerca", () => {
        expect(isBransonNear(50, 50 + LAUGH_DISTANCE)).toBe(false);
        expect(isBransonNear(10, 90)).toBe(false);
    });
});

describe("getBransonName", () => {
    test("si recibe un texto lo devuelve tal cual", () => {
        expect(getBransonName("Nerea")).toBe("Nerea");
    });

    test("si recibe un Branson devuelve su nombre", () => {
        expect(getBransonName({ id: 4, name: "Pokebranson" })).toBe("Pokebranson");
    });
});

describe("trimCloudinaryImage", () => {
    test("añade el recorte a una imagen de Cloudinary", () => {
        expect(trimCloudinaryImage("https://res.cloudinary.com/demo/image/upload/v1/gato.png"))
            .toBe("https://res.cloudinary.com/demo/image/upload/e_trim/f_auto,q_auto/v1/gato.png");
    });

    test("no recorta dos veces una imagen que ya está recortada", () => {
        expect(trimCloudinaryImage(BRANSON_IMAGES[0])).toBe(BRANSON_IMAGES[0]);
    });
});

describe("getBransonSource", () => {
    test("usa la imagen del Branson recortada si es de Cloudinary", () => {
        const branson = { name: "Pokebranson", image: "https://res.cloudinary.com/demo/image/upload/v1/pokebranson.png" };
        expect(getBransonSource(branson, 0)).toBe("https://res.cloudinary.com/demo/image/upload/e_trim/f_auto,q_auto/v1/pokebranson.png");
    });

    test("usa la imagen del Branson tal cual si no es de Cloudinary", () => {
        const branson = { name: "Pokebranson", image: "https://example.com/pokebranson.png" };
        expect(getBransonSource(branson, 0)).toBe(branson.image);
    });

    test("si la imagen no es una URL usa la de la máquina", () => {
        const branson = { name: "Brenda", image: "URL_DEL_BRANSON_VAQUERO" };
        expect(getBransonSource(branson, 2)).toBe(BRANSON_IMAGES[2]);
    });

    test("si recibe un texto usa la imagen de la máquina", () => {
        expect(getBransonSource("Nerea", 0)).toBe(BRANSON_IMAGES[0]);
    });
});

describe("getBransonPlace", () => {
    test("devuelve el hueco del montón que toca", () => {
        const place = getBransonPlace(0);
        expect(place.left).toBe(BRANSON_PILE[0].left);
        expect(place.bottom).toBe(BRANSON_PILE[0].bottom);
        expect(place.tilt).toBe(BRANSON_PILE[0].tilt);
        expect(place.zIndex).toBe(BRANSON_PILE[0].zIndex);
    });

    test("si hay más muñecos que huecos, los nuevos van un poco más arriba", () => {
        const first = getBransonPlace(0);
        const repeated = getBransonPlace(BRANSON_PILE.length);
        expect(repeated.left).toBe(first.left);
        expect(repeated.bottom).toBeGreaterThan(first.bottom);
    });
});

describe("getBransonImage", () => {
    test("devuelve la imagen que toca según la posición", () => {
        expect(getBransonImage(0)).toBe(BRANSON_IMAGES[0]);
        expect(getBransonImage(3)).toBe(BRANSON_IMAGES[3]);
    });

    test("si hay más nombres que imágenes vuelve a empezar", () => {
        expect(getBransonImage(BRANSON_IMAGES.length)).toBe(BRANSON_IMAGES[0]);
        expect(getBransonImage(BRANSON_IMAGES.length + 1)).toBe(BRANSON_IMAGES[1]);
    });
});
