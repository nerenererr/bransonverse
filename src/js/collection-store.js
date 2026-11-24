(function () {
  "use strict";

  const STORAGE_KEY =
    "bransonverse.collection.unlocked.v1";

  const ALL_CHARACTERS = [

    "standard",
    "brenda",
    "pokebranson",
    "branjose",
    "valentin",
    "halloween",
    "neko",
    "navidad",
    "brokeback"

  ];

  const INITIAL_CHARACTERS = [

    "standard",
    "brenda"

  ];

  const GAME_IDS = {

    1: "standard",
    2: "brenda",
    3: "halloween",
    4: "pokebranson",
    5: "neko",
    6: "branjose",
    7: "valentin",
    8: "brokeback",
    9: "navidad"

  };

  const validIds = new Set(ALL_CHARACTERS);

  let memoryUnlocked = new Set(INITIAL_CHARACTERS);

  function toCollectionId(id) {

    if (GAME_IDS[id]) {

      return GAME_IDS[id];

    }

    return id;

  }

  function readUnlocked() {

    try {

      const savedData = localStorage.getItem(
        STORAGE_KEY
      );

      if (savedData === null) {

        return new Set(memoryUnlocked);

      }

      const savedCharacters = JSON.parse(
        savedData
      );

      if (!Array.isArray(savedCharacters)) {

        return new Set(memoryUnlocked);

      }

      const unlocked = new Set(
        INITIAL_CHARACTERS
      );

      savedCharacters.forEach((id) => {

        if (validIds.has(id)) {

          unlocked.add(id);

        }

      });

      memoryUnlocked = unlocked;

      return new Set(unlocked);

    } catch (error) {

      return new Set(memoryUnlocked);

    }

  }

  function saveUnlocked(unlocked) {

    memoryUnlocked = new Set(unlocked);

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...unlocked])
      );

    } catch (error) {

      console.warn(
        "No se pudo guardar el progreso.",
        error
      );

    }

  }

  function unlock(id) {

    const characterId = toCollectionId(id);

    if (!validIds.has(characterId)) {

      console.warn(
        "Personaje no encontrado:",
        characterId
      );

      return false;

    }

    const unlocked = readUnlocked();

    if (unlocked.has(characterId)) {

      return false;

    }

    unlocked.add(characterId);

    saveUnlocked(unlocked);

    window.dispatchEvent(
      new Event("branson:collection-updated")
    );

    return true;

  }

  function isUnlocked(id) {

    return readUnlocked().has(toCollectionId(id));

  }

  function getUnlocked() {

    return [...readUnlocked()];

  }

  function resetForTesting() {

    memoryUnlocked = new Set(
      INITIAL_CHARACTERS
    );

    try {

      localStorage.removeItem(
        STORAGE_KEY
      );

    } catch (error) {

      console.warn(
        "No se pudo reiniciar localStorage.",
        error
      );

    }

    window.dispatchEvent(
      new Event("branson:collection-updated")
    );

  }

  window.BransonCollection = {

    unlock: unlock,

    isUnlocked: isUnlocked,

    getUnlocked: getUnlocked,

    resetForTesting: resetForTesting

  };

})();
