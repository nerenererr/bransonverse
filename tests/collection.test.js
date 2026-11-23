/**
 * @jest-environment jsdom
 */

import { readFileSync } from "node:fs";

const storeScript = readFileSync(
  new URL("../src/js/collection-store.js", import.meta.url),
  "utf8"
);

function loadStore() {

  localStorage.clear();
  new Function(storeScript)();
  return window.BransonCollection;

}

describe("personajes iniciales", () => {

  test("standard y brenda empiezan desbloqueados", () => {

    const collection = loadStore();

    expect(collection.isUnlocked("standard")).toBe(true);
    expect(collection.isUnlocked("brenda")).toBe(true);

  });

  test("el resto de personajes empiezan bloqueados", () => {

    const collection = loadStore();

    expect(collection.isUnlocked("neko")).toBe(false);
    expect(collection.getUnlocked().length).toBe(2);

  });

});

describe("unlock", () => {

  test("desbloquea un personaje nuevo", () => {

    const collection = loadStore();

    expect(collection.unlock("pokebranson")).toBe(true);
    expect(collection.isUnlocked("pokebranson")).toBe(true);

  });

  test("no desbloquea dos veces el mismo personaje", () => {

    const collection = loadStore();

    collection.unlock("neko");

    expect(collection.unlock("neko")).toBe(false);

  });

  test("no desbloquea un personaje que no existe", () => {

    const collection = loadStore();

    expect(collection.unlock("pikachu")).toBe(false);
    expect(collection.getUnlocked().length).toBe(2);

  });

  test("acepta el id numérico del juego", () => {

    const collection = loadStore();

    expect(collection.unlock(5)).toBe(true);
    expect(collection.isUnlocked("neko")).toBe(true);
    expect(collection.isUnlocked(5)).toBe(true);

  });

  test("avisa a la pantalla de colección al desbloquear", () => {

    const collection = loadStore();
    let updated = false;

    window.addEventListener(
      "branson:collection-updated",
      () => {
        updated = true;
      },
      { once: true }
    );

    collection.unlock("navidad");

    expect(updated).toBe(true);

  });

});

describe("guardado", () => {

  test("guarda los desbloqueados en localStorage", () => {

    const collection = loadStore();

    collection.unlock("halloween");

    const saved = JSON.parse(
      localStorage.getItem("bransonverse.collection.unlocked.v1")
    );

    expect(saved).toContain("halloween");

  });

  test("resetForTesting vuelve a los personajes iniciales", () => {

    const collection = loadStore();

    collection.unlock("brokeback");
    collection.resetForTesting();

    expect(collection.isUnlocked("brokeback")).toBe(false);
    expect(collection.getUnlocked().length).toBe(2);

  });

});
