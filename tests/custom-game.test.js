/**
 * @jest-environment jsdom
 */
import { jest } from "@jest/globals";
import { readFileSync } from "node:fs";

const customGameScript = readFileSync(
    new URL("../src/js/custom-game.js", import.meta.url),
    "utf8"
);

function setName(index, value) {
    const input = document.querySelectorAll(".name-input")[index];
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
}

function submitForm() {
    document.querySelector(".custom-game-form").dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
    );
}

function loadCustomGameForm() {
    document.body.innerHTML = `
        <form class="custom-game-form" novalidate>
            <div class="custom-game-summary">
                <div class="name-progress"></div>
                <output class="name-count"></output>
            </div>
            <div class="name-columns">
                <div class="name-column"></div>
                <div class="name-column"></div>
            </div>
            <button type="button" class="add-name-button">Añadir</button>
            <button type="submit" class="start-custom-game">Comenzar</button>
            <p class="custom-game-feedback"></p>
        </form>
    `;

    eval(customGameScript);
}

describe("Formulario de partida personalizada", () => {
    beforeEach(() => {
        sessionStorage.clear();
        globalThis.playMenuSelectionSound = jest.fn();
        globalThis.playBackOrRemoveSound = jest.fn();
        loadCustomGameForm();
    });

    afterEach(() => {
        delete globalThis.playMenuSelectionSound;
        delete globalThis.playBackOrRemoveSound;
    });

    test("empieza con nueve campos vacíos", () => {
        expect(document.querySelectorAll(".name-input")).toHaveLength(9);
        expect(document.querySelector(".name-count").value).toBe("0/15");
        expect(document.querySelectorAll(".name-progress span")).toHaveLength(15);
    });

    test("permite añadir nombres hasta quince y desactiva el botón al llegar al máximo", () => {
        const addButton = document.querySelector(".add-name-button");

        for (let index = 0; index < 6; index += 1) {
            addButton.click();
        }

        expect(document.querySelectorAll(".name-input")).toHaveLength(15);
        expect(addButton.disabled).toBe(true);

        addButton.click();
        expect(document.querySelectorAll(".name-input")).toHaveLength(15);
    });

    test("eliminar un campo por encima del mínimo lo quita y enfoca el anterior", () => {
        document.querySelector(".add-name-button").click();

        const removeButtons = document.querySelectorAll(".remove-name-button");
        removeButtons[removeButtons.length - 1].click();

        const inputs = document.querySelectorAll(".name-input");
        expect(inputs).toHaveLength(9);
        expect(document.activeElement).toBe(inputs[inputs.length - 1]);
    });

    test("al mínimo de nueve campos, eliminar vacía el nombre sin quitar el campo", () => {
        setName(0, "Dani");
        document.querySelector(".remove-name-button").click();

        const inputs = document.querySelectorAll(".name-input");
        expect(inputs).toHaveLength(9);
        expect(inputs[0].value).toBe("");
        expect(document.querySelector(".name-count").value).toBe("0/15");
    });

    test("rechaza campos vacíos, muestra feedback y enfoca el primer campo inválido", () => {
        for (let index = 0; index < 8; index += 1) {
            setName(index, `Nombre ${index + 1}`);
        }

        submitForm();

        const inputs = document.querySelectorAll(".name-input");
        expect(document.querySelector(".custom-game-feedback").textContent)
            .toBe("Completa todos los campos antes de comenzar.");
        expect(inputs[8].getAttribute("aria-invalid")).toBe("true");
        expect(document.activeElement).toBe(inputs[8]);
        expect(sessionStorage.getItem("gameMode")).toBeNull();
    });

    test("rechaza nombres duplicados ignorando mayúsculas y espacios", () => {
        setName(0, " Dani ");
        setName(1, "dani");
        for (let index = 2; index < 9; index += 1) {
            setName(index, `Nombre ${index + 1}`);
        }

        submitForm();

        const inputs = document.querySelectorAll(".name-input");
        expect(document.querySelector(".custom-game-feedback").textContent)
            .toBe("No puede haber nombres repetidos.");
        expect(inputs[0].getAttribute("aria-invalid")).toBe("true");
        expect(inputs[1].getAttribute("aria-invalid")).toBe("true");
        expect(document.activeElement).toBe(inputs[0]);
        expect(sessionStorage.getItem("gameMode")).toBeNull();
    });

    test("guarda los nombres recortados y el modo cuando todos son válidos", () => {
        const startGame = jest.fn();
        window.addEventListener("branson:start-game", startGame);

        for (let index = 0; index < 9; index += 1) {
            setName(index, `  Nombre ${index + 1}  `);
        }

        const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
        try {
            submitForm();
        } finally {
            consoleError.mockRestore();
        }

        expect(sessionStorage.getItem("gameMode")).toBe("custom");
        expect(JSON.parse(sessionStorage.getItem("customNames"))).toEqual(
            Array.from({ length: 9 }, (_, index) => `Nombre ${index + 1}`)
        );
        expect(startGame).toHaveBeenCalledTimes(1);
        window.removeEventListener("branson:start-game", startGame);
    });
});
