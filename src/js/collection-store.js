
/* ==========================================
   BRANSONVERSE
   SISTEMA DE DESBLOQUEO DE LA COLECCIÓN
========================================== */

(function () {
  "use strict";

  /* ========================================
     CONFIGURACIÓN
  ======================================== */

  const STORAGE_KEY =
    "bransonverse.collection.unlocked.v1";

  // Todos los personajes de la colección
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

  // Solo dos personajes desbloqueados al empezar
  const INITIAL_CHARACTERS = [

    "standard",
    "brenda"

  ];

  const validIds = new Set(ALL_CHARACTERS);

  // Progreso temporal si falla localStorage
  let memoryUnlocked = new Set(INITIAL_CHARACTERS);

  /* ========================================
     LEER EL PROGRESO GUARDADO
  ======================================== */

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

      // Los dos personajes iniciales siempre estarán
      // disponibles
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

  /* ========================================
     GUARDAR EL PROGRESO
  ======================================== */

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

  /* ========================================
     DESBLOQUEAR PERSONAJE
  ======================================== */

  function unlock(characterId) {

    // Comprobar que el personaje existe
    if (!validIds.has(characterId)) {

      console.warn(
        "Personaje no encontrado:",
        characterId
      );

      return false;

    }

    const unlocked = readUnlocked();

    // No desbloquear dos veces
    if (unlocked.has(characterId)) {

      return false;

    }

    // Añadir el personaje capturado
    unlocked.add(characterId);

    // Guardarlo
    saveUnlocked(unlocked);

    // Avisar a la pantalla de colección
    window.dispatchEvent(
      new Event("branson:collection-updated")
    );

    return true;

  }

  /* ========================================
     CONSULTAR SI ESTÁ DESBLOQUEADO
  ======================================== */

  function isUnlocked(characterId) {

    return readUnlocked().has(characterId);

  }

  /* ========================================
     OBTENER TODOS LOS DESBLOQUEADOS
  ======================================== */

  function getUnlocked() {

    return [...readUnlocked()];

  }

  /* ========================================
     REINICIAR PROGRESO PARA PRUEBAS
  ======================================== */

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

    // Refrescar colección
    window.dispatchEvent(
      new Event("branson:collection-updated")
    );

  }

  /* ========================================
     EXPONER LAS FUNCIONES AL JUEGO
  ======================================== */

  window.BransonCollection = {

    unlock: unlock,

    isUnlocked: isUnlocked,

    getUnlocked: getUnlocked,

    resetForTesting: resetForTesting

  };

})();
