/**
 * @jest-environment jsdom
 */
import { jest } from "@jest/globals";
import { readFileSync } from "node:fs";

const mainScript = readFileSync(
    new URL("../src/js/main.js", import.meta.url),
    "utf8"
);

describe("Navegación a colección y partida", () => {
    beforeEach(() => {
        sessionStorage.clear();
        sessionStorage.setItem("introSeen", "true");
        Object.defineProperty(performance, "getEntriesByType", {
            configurable: true,
            value: () => []
        });
        document.body.innerHTML = `
            <main>
                <video class="intro-video"></video>
                <p class="start-screen"></p>
                <section class="main-menu" hidden>
                    <button class="mode-menu-back"></button>
                    <nav class="primary-menu">
                        <button class="play-button" aria-pressed="true"></button>
                        <button class="collection-button" aria-pressed="false"></button>
                    </nav>
                    <nav class="play-menu" hidden>
                        <button class="branson-mode-button" aria-pressed="true"></button>
                        <button class="custom-game-button" aria-pressed="false"></button>
                    </nav>
                </section>
                <section class="custom-game-screen" hidden>
                    <button class="custom-game-back"></button>
                </section>
            </main>
            <iframe class="collection-frame" hidden></iframe>
            <iframe class="game-frame" hidden></iframe>
        `;

        globalThis.autoStartMusic = jest.fn();
        globalThis.startMusic = jest.fn();
        globalThis.playMenuSelectionSound = jest.fn();
        globalThis.playConfirmSelectionSound = jest.fn();
        globalThis.playBackOrRemoveSound = jest.fn();
        eval(mainScript);
    });

    afterEach(() => {
        delete globalThis.autoStartMusic;
        delete globalThis.startMusic;
        delete globalThis.playMenuSelectionSound;
        delete globalThis.playConfirmSelectionSound;
        delete globalThis.playBackOrRemoveSound;
    });

    test("mantiene la página principal al abrir y cerrar la colección", () => {
        const menu = document.querySelector(".main-menu");
        const frame = document.querySelector(".collection-frame");

        document.querySelector(".collection-button").click();

        expect(menu.hidden).toBe(true);
        expect(frame.hidden).toBe(false);
        expect(frame.getAttribute("src")).toBe(
            "pages/collection.html"
        );

        window.dispatchEvent(new MessageEvent("message", {
            source: frame.contentWindow,
            data: "branson:close-collection"
        }));

        expect(frame.hidden).toBe(true);
        expect(menu.hidden).toBe(false);
    });

    test("mantiene la página principal durante la partida y vuelve al menú sin recargar", () => {
        const menu = document.querySelector(".main-menu");
        const frame = document.querySelector(".game-frame");

        document.querySelector(".play-button").click();
        document.querySelector(".branson-mode-button").click();

        expect(menu.hidden).toBe(true);
        expect(frame.hidden).toBe(false);
        expect(frame.getAttribute("src")).toBe("pages/game.html");

        window.dispatchEvent(new MessageEvent("message", {
            source: frame.contentWindow,
            data: "branson:close-game"
        }));

        expect(frame.hidden).toBe(true);
        expect(menu.hidden).toBe(false);
        expect(document.querySelector(".primary-menu").hidden).toBe(false);
        expect(document.querySelector(".play-menu").hidden).toBe(true);
    });
});
