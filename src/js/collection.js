
/* ==========================================
   BRANSONVERSE - COLECCIÓN
   Textos originales del Figma
========================================== */

(function () {
  "use strict";

  /* ========================================
     PERSONAJES DE LA COLECCIÓN

     Orden visual:
     1  2  3
     4  5  6
     7  8  9
  ======================================== */

  const characters = [

    // ======================================
    // 1. STANDARD BRANSON
    // Desbloqueado inicialmente
    // ======================================

    {
      id: "standard",

      name: "standard branson",

      description:
        "Es la versión standard de Branson.\n" +
        "El Branson de toda la vida que puedes\n" +
        "encontrar a partir de las 9:00AM en\n" +
        "cualquier CEI.",

      image:
        "https://res.cloudinary.com/da9tytxsu/image/upload/v1794909672/brandonStandar_cflcns.png",

      width: 45,
      height: 81
    },

    // ======================================
    // 2. BRENDA
    // Desbloqueada inicialmente
    // ======================================

    {
      id: "brenda",

      name: "brenda",

      description:
        "El lado femenino de Branson en el Bransonverso. " +
        "Es puntual, le encantan los perros y habla por los codos.",

      image:
        "https://res.cloudinary.com/da9tytxsu/image/upload/v1794918716/brandon_0001_biare4.png",

      width: 54,
      height: 87
    },

    // ======================================
    // 3. POKEBRANSON
    // Bloqueado inicialmente
    // ======================================

    {
      id: "pokebranson",

      name: "pokebranson",

      description:
        "¿Poké no?  ¡Es un pokemon de tipo entero! " +
        "¡Pokebranson¡ ¡Int-pact Trueno!",

      image:
        "https://res.cloudinary.com/da9tytxsu/image/upload/v1794918715/brandon_0004_zregty.png",

      width: 81,
      height: 93
    },

    // ======================================
    // 4. BRANJOSÉ TOMÁS
    // Bloqueado inicialmente
    // ======================================

    {
      id: "branjose",

      name: "BrANJOSÉ TOMÁS",

      description:
        "Es un bravo.  No es fácil atraparlo. " +
        "Espera el gancho a puerta gayola y cuando vas a cogerlo " +
        "te hace unos pases que da gusto el niño. " +
        "Su única forma de salir de la máquina es por la puerta grande.",

      image:
        "https://res.cloudinary.com/da9tytxsu/image/upload/v1794918715/brandon_0006_vhqdhm.png",

      width: 57,
      height: 90
    },

    // ======================================
    // 5. BRANSON ESPECIAL SAN VALENTÍN
    // Bloqueado inicialmente
    // ======================================

    {
      id: "valentin",

      name: "brANSON ESPECIAL DE SAN VALENTÍN",

      description:
        "EL Branson bueno.  Tiene un arco pero no tiene flechas " +
        "porque su única arma es el amor... y la IA.",

      image:
        "https://res.cloudinary.com/da9tytxsu/image/upload/v1794911232/brandon_0005_lcpawf.png",

      width: 87,
      height: 81
    },

    // ======================================
    // 6. BRANSON ESPECIAL HALLOWEEN
    // Bloqueado inicialmente
    // ======================================

    {
      id: "halloween",

      name: "brANSON ESPECIAL DE HALLOWEEN",

      description:
        "¡¡El diablo!!",

      image:
        "https://res.cloudinary.com/da9tytxsu/image/upload/v1794911223/brandon_0002_s2bngb.png",

      width: 66,
      height: 90
    },

    // ======================================
    // 7. NEKOBRANSON
    // Bloqueado inicialmente
    // ======================================

    {
      id: "neko",

      name: "nekobranson",

      description:
        "Un Branson gato de la suerte. " +
        "Es la esencia destilada del Branson Standard. " +
        "Un branson como debería ser un Branson.",

      image:
        "https://res.cloudinary.com/da9tytxsu/image/upload/v1794918715/brandonNeko_xzxatk.png",

      width: 69,
      height: 84
    },

    // ======================================
    // 8. BRANSON ESPECIAL NAVIDAD
    // Bloqueado inicialmente
    // ======================================

    {
      id: "navidad",

      name: "branson especial de navidad",

      description:
        "Ayuda a Papá Branson y a los reyes Branson " +
        "con la lista de los Bransons buenos y los Bransons malos.",

      image:
        "https://res.cloudinary.com/da9tytxsu/image/upload/v1794918715/brandonEspecialNavidad_prgkh2.png",

      width: 63,
      height: 105
    },

    // ======================================
    // 9. BROKEBACK BRANSON
    // Bloqueado inicialmente
    // ======================================

    {
      id: "brokeback",

      name: "brokeback branson",

      description:
        "Protagonista de la famosa película Brokeback Branson, " +
        "que ganó 4 Bransons de oro y se llevó el premio " +
        "de la 63ª edición del festival de Branson de Venecia.",

      image:
        "https://res.cloudinary.com/da9tytxsu/image/upload/v1794918715/brandon-vaquero_oqo9bz.png",

      width: 69,
      height: 96
    }

  ];

  /* ========================================
     ELEMENTOS DEL HTML
  ======================================== */

  const grid = document.getElementById(
    "characters-grid"
  );

  const nameElement = document.getElementById(
    "character-name"
  );

  const descriptionElement = document.getElementById(
    "character-description"
  );

  // Comprobar que existe la página
  if (!grid || !nameElement || !descriptionElement) {
    return;
  }

  // Comprobar que el sistema de guardado está cargado
  if (!window.BransonCollection) {

    console.error(
      "No se ha cargado collection-store.js"
    );

    return;
  }

  /* ========================================
     ESTADO DE SELECCIÓN
  ======================================== */

  // Primer personaje seleccionado por defecto
  let selectedIndex = 0;

  // Array de fichas HTML
  const cards = [];

  /* ========================================
     CREAR FICHAS
  ======================================== */

  function createCards() {

    grid.innerHTML = "";

    characters.forEach((character, index) => {

      // Crear la ficha
      const card = document.createElement("button");

      card.type = "button";

      card.className = "collection__card";

      card.dataset.characterId = character.id;

      // Crear imagen
      const image = document.createElement("img");

      image.className = "collection__sprite";

      image.src = character.image;

      image.alt = "";

      image.draggable = false;

      image.width = character.width;
      image.height = character.height;

      // Tamaños de los sprites obtenidos del Figma
      card.style.setProperty(
        "--sprite-width",
        character.width + "px"
      );

      card.style.setProperty(
        "--sprite-height",
        character.height + "px"
      );

      card.appendChild(image);

      /* ====================================
         SELECCIONAR CON RATÓN
      ==================================== */

      card.addEventListener("mouseenter", () => {

        selectCharacter(index);

      });

      /* ====================================
         SELECCIONAR CON CLIC O TOQUE
      ==================================== */

      card.addEventListener("click", () => {

        selectCharacter(index);

      });

      /* ====================================
         SELECCIONAR CON TABULADOR
      ==================================== */

      card.addEventListener("focus", () => {

        selectCharacter(index);

      });

      // Guardar ficha
      cards.push(card);

      // Insertar en pantalla
      grid.appendChild(card);

    });

  }

  /* ========================================
     SELECCIONAR UN PERSONAJE
  ======================================== */

  function selectCharacter(index) {

    if (
      index < 0 ||
      index >= characters.length
    ) {
      return;
    }

    selectedIndex = index;

    render();

  }

  /* ========================================
     DIBUJAR ESTADO DE LA COLECCIÓN
  ======================================== */

  function render() {

    const unlockedCharacters = new Set(
      window.BransonCollection.getUnlocked()
    );

    // Recorrer todas las fichas
    cards.forEach((card, index) => {

      const character = characters[index];

      const unlocked = unlockedCharacters.has(
        character.id
      );

      const selected = index === selectedIndex;

      // Fondo amarillo si está seleccionado
      card.classList.toggle(
        "is-selected",
        selected
      );

      // Silueta negra si está bloqueado
      card.classList.toggle(
        "is-locked",
        !unlocked
      );

      // Accesibilidad
      card.setAttribute(
        "aria-label",
        unlocked
          ? character.name + ", desbloqueado"
          : "Personaje bloqueado"
      );

      card.setAttribute(
        "aria-pressed",
        String(selected)
      );

      // Control del tabulador
      card.tabIndex = selected ? 0 : -1;

    });

    /* ====================================
       DESCRIPCIÓN DEL PERSONAJE
    ==================================== */

    const activeCharacter = characters[selectedIndex];

    const activeUnlocked = unlockedCharacters.has(
      activeCharacter.id
    );

    // Si está bloqueado no se desvela quién es
    if (activeUnlocked) {

      nameElement.textContent =
        activeCharacter.name;

      descriptionElement.textContent =
        activeCharacter.description;

    } else {

      nameElement.textContent = "???";

      descriptionElement.textContent =
        "Atrápalo en la máquina para descubrir quién es.";

    }

  }

  /* ========================================
     NAVEGACIÓN CON TECLADO
  ======================================== */

  function moveSelection(key) {

    const columns = 3;
    const rows = 3;

    const currentRow = Math.floor(
      selectedIndex / columns
    );

    const currentColumn =
      selectedIndex % columns;

    let nextRow = currentRow;
    let nextColumn = currentColumn;

    switch (key) {

      case "ArrowRight":
        nextColumn = (currentColumn + 1) % columns;
        break;

      case "ArrowLeft":
        nextColumn = (currentColumn + columns - 1) % columns;
        break;

      case "ArrowDown":
        nextRow = (currentRow + 1) % rows;
        break;

      case "ArrowUp":
        nextRow = (currentRow + rows - 1) % rows;
        break;

      default:
        return;

    }

    const nextIndex =
      nextRow * columns + nextColumn;

    // Seleccionar personaje
    selectCharacter(nextIndex);

    // Mover foco de teclado a su ficha
    cards[nextIndex].focus({
      preventScroll: true
    });

  }

  /* ========================================
     DETECTAR FLECHAS DEL TECLADO
  ======================================== */

  document.addEventListener("keydown", (event) => {

    const validKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight"
    ];

    if (!validKeys.includes(event.key)) {
      return;
    }

    // Evitar interferencias con otros controles
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    if (
      event.target.closest(
        "input, textarea, select, a"
      )
    ) {
      return;
    }

    // Evitar desplazamiento de página
    event.preventDefault();

    moveSelection(event.key);

  });

  /* ========================================
     ACTUALIZAR DESPUÉS DE UNA CAPTURA
  ======================================== */

  window.addEventListener(
    "branson:collection-updated",
    () => {

      render();

    }
  );

  /* ========================================
     SINCRONIZACIÓN ENTRE PESTAÑAS
  ======================================== */

  window.addEventListener("storage", (event) => {

    if (
      event.key ===
      "bransonverse.collection.unlocked.v1"
    ) {

      render();

    }

  });

  /* ========================================
     INICIAR LA COLECCIÓN
  ======================================== */

  createCards();

  render();

})();
