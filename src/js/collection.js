(function () {
  "use strict";

  const characters = [

    {
      id: "standard",

      name: "standard branson",

      description:
        "Es la versión standard de Branson.\n" +
        "El Branson de toda la vida que puedes\n" +
        "encontrar a partir de las 9:00AM en\n" +
        "cualquier CEI.",

      image:
        "https://res.cloudinary.com/da9tytxsu/image/upload/e_trim/v1794909672/brandonStandar_cflcns.png"
    },

    {
      id: "brenda",

      name: "brenda",

      description:
        "El lado femenino de Branson en el Bransonverso. " +
        "Es puntual, le encantan los perros y habla por los codos.",

      image:
        "https://res.cloudinary.com/da9tytxsu/image/upload/e_trim/v1794918716/brandon_0001_biare4.png"
    },

    {
      id: "pokebranson",

      name: "pokebranson",

      description:
        "¿Poké no?  ¡Es un pokemon de tipo entero! " +
        "¡Pokebranson¡ ¡Int-pact Trueno!",

      image:
        "https://res.cloudinary.com/da9tytxsu/image/upload/e_trim/v1794918715/brandon_0004_zregty.png"
    },

    {
      id: "branjose",

      name: "BrANJOSÉ TOMÁS",

      description:
        "Es un bravo.  No es fácil atraparlo. " +
        "Espera el gancho a puerta gayola y cuando vas a cogerlo " +
        "te hace unos pases que da gusto el niño. " +
        "Su única forma de salir de la máquina es por la puerta grande.",

      image:
        "https://res.cloudinary.com/da9tytxsu/image/upload/e_trim/v1794918715/brandon_0006_vhqdhm.png"
    },

    {
      id: "valentin",

      name: "brANSON ESPECIAL DE SAN VALENTÍN",

      description:
        "EL Branson bueno.  Tiene un arco pero no tiene flechas " +
        "porque su única arma es el amor... y la IA.",

      image:
        "https://res.cloudinary.com/da9tytxsu/image/upload/e_trim/v1794911232/brandon_0005_lcpawf.png"
    },

    {
      id: "halloween",

      name: "brANSON ESPECIAL DE HALLOWEEN",

      description:
        "¡¡El diablo!!",

      image:
        "https://res.cloudinary.com/da9tytxsu/image/upload/e_trim/v1794911223/brandon_0002_s2bngb.png"
    },

    {
      id: "neko",

      name: "nekobranson",

      description:
        "Un Branson gato de la suerte. " +
        "Es la esencia destilada del Branson Standard. " +
        "Un branson como debería ser un Branson.",

      image:
        "https://res.cloudinary.com/da9tytxsu/image/upload/e_trim/v1794918715/brandonNeko_xzxatk.png"
    },

    {
      id: "navidad",

      name: "branson especial de navidad",

      description:
        "Ayuda a Papá Branson y a los reyes Branson " +
        "con la lista de los Bransons buenos y los Bransons malos.",

      image:
        "https://res.cloudinary.com/da9tytxsu/image/upload/e_trim/v1794918715/brandonEspecialNavidad_prgkh2.png"
    },

    {
      id: "brokeback",

      name: "brokeback branson",

      description:
        "Protagonista de la famosa película Brokeback Branson, " +
        "que ganó 4 Bransons de oro y se llevó el premio " +
        "de la 63ª edición del festival de Branson de Venecia.",

      image:
        "https://res.cloudinary.com/da9tytxsu/image/upload/e_trim/v1794918715/brandon-vaquero_oqo9bz.png"
    }

  ];

  const grid = document.getElementById(
    "characters-grid"
  );

  const nameElement = document.getElementById(
    "character-name"
  );

  const descriptionElement = document.getElementById(
    "character-description"
  );

  if (!grid || !nameElement || !descriptionElement) {
    return;
  }

  if (!window.BransonCollection) {

    console.error(
      "No se ha cargado collection-store.js"
    );

    return;
  }

  let selectedIndex = 0;

  const cards = [];

  function createCards() {

    grid.innerHTML = "";

    characters.forEach((character, index) => {

      const card = document.createElement("button");

      card.type = "button";

      card.className = "collection__card";

      card.dataset.characterId = character.id;

      const image = document.createElement("img");

      image.className = "collection__sprite";

      image.src = character.image;

      image.alt = "";

      image.draggable = false;

      card.appendChild(image);

      card.addEventListener("mouseenter", () => {

        selectCharacter(index);

      });

      card.addEventListener("click", () => {

        selectCharacter(index);

      });

      card.addEventListener("focus", () => {

        selectCharacter(index);

      });

      cards.push(card);

      grid.appendChild(card);

    });

  }

  function isCharacterUnlocked(index) {

    return window.BransonCollection.isUnlocked(
      characters[index].id
    );

  }

  function selectCharacter(index) {

    if (
      index < 0 ||
      index >= characters.length
    ) {
      return;
    }

    if (!isCharacterUnlocked(index)) {
      return;
    }

    selectedIndex = index;

    render();

  }

  function render() {

    const unlockedCharacters = new Set(
      window.BransonCollection.getUnlocked()
    );

    cards.forEach((card, index) => {

      const character = characters[index];

      const unlocked = unlockedCharacters.has(
        character.id
      );

      const selected = index === selectedIndex;

      card.classList.toggle(
        "is-selected",
        selected
      );

      card.classList.toggle(
        "is-locked",
        !unlocked
      );

      card.setAttribute(
        "aria-label",
        unlocked
          ? character.name + ", desbloqueado"
          : "Personaje bloqueado"
      );

      card.setAttribute(
        "aria-disabled",
        String(!unlocked)
      );

      card.setAttribute(
        "aria-pressed",
        String(selected)
      );

      card.tabIndex = selected ? 0 : -1;

    });

    const activeCharacter = characters[selectedIndex];

    nameElement.textContent =
      activeCharacter.name;

    descriptionElement.textContent =
      activeCharacter.description;

  }

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

    for (let step = 0; step < columns * rows; step++) {

      switch (key) {

        case "ArrowRight":
          nextColumn = (nextColumn + 1) % columns;
          break;

        case "ArrowLeft":
          nextColumn = (nextColumn + columns - 1) % columns;
          break;

        case "ArrowDown":
          nextRow = (nextRow + 1) % rows;
          break;

        case "ArrowUp":
          nextRow = (nextRow + rows - 1) % rows;
          break;

        default:
          return;

      }

      const nextIndex =
        nextRow * columns + nextColumn;

      if (isCharacterUnlocked(nextIndex)) {

        selectCharacter(nextIndex);

        cards[nextIndex].focus({
          preventScroll: true
        });

        return;

      }

    }

  }

  document.addEventListener("keydown", (event) => {

    if (event.key === "Backspace") {

      event.preventDefault();

      window.location.href =
        document.querySelector(".collection__back").href;

      return;

    }

    const validKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight"
    ];

    if (!validKeys.includes(event.key)) {
      return;
    }

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

    event.preventDefault();

    moveSelection(event.key);

  });

  window.addEventListener(
    "branson:collection-updated",
    () => {

      render();

    }
  );

  window.addEventListener("storage", (event) => {

    if (
      event.key ===
      "bransonverse.collection.unlocked.v1"
    ) {

      render();

    }

  });

  createCards();

  render();

})();
