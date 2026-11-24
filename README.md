# The Bransonverse

A claw machine game where luck decides who gets picked. Built with **HTML, CSS and JavaScript** as a team project.

---

## Briefing

**Sacrificios SA**, the association behind events like *The Purge*, *The Maze Runner*, *The Hunger Games*, *Battle Royale* and *Squid Game*, wants a web application for a new event: a **fair and random developer sacrifice**. The app has to receive a list of names and pick them one by one at random.

The brief asked for something **creative, interactive and fun, not the typical spinning wheel**.

## Our idea

Instead of a wheel, **The Bransonverse** is a **claw machine** full of clay figures called **Bransons**.

- The player moves the claw, drops it and tries to catch a Branson.
- In the **custom game**, every Branson hides one of the names written by the players. Nobody knows who is inside until it is caught.
- A caught name **never comes back**. When the last one is caught, the game shows a notice and goes back to the start screen.
- In **Branson mode**, the player plays for fun and every Branson caught is unlocked in the **collection**.

## How to play

1. **Start screen:** press any key to start the intro and the music.
2. **Main menu:** choose `PLAY` or `VER COLECCIÓN`.
3. **Game modes:**
   - **Modo Branson:** catch Bransons and unlock them in the collection.
   - **Partida Bransonalizada:** write between 9 and 15 names and play until every name has been caught.
4. **In the machine:** move the claw, drop it on top of a Branson and hope it does not slip.
   - You have **3 attempts** and **90 seconds**. The timer starts with your first move.
   - Every Branson has its own chance of slipping from the claw.

### Controls

| Screen | Mouse / touch | Keyboard |
|---|---|---|
| Start screen | Click anywhere | Any key |
| Menus | Click an option | `↑` `↓` `←` `→` to move, `Enter` to choose, `Backspace` to go back |
| Custom game form | Buttons `+` and `×` | `Escape` or `Backspace` to go back |
| Claw machine | Hold the joystick, press the yellow button | `←` `→` to move, `↓` to drop |
| Collection | Hover or click a card, back arrow | `↑` `↓` `←` `→` to move, `Backspace` to go back |

## Screenshots

The design was made in **Figma** at 1440 × 1024.

### Main menu

![The Bransonverse main menu](https://res.cloudinary.com/dbtuho5h0/image/upload/v1795457934/Captura_de_pantalla_2026-11-23_191213_zwtpoe.png)

### Custom game

![Custom game name selection](https://res.cloudinary.com/dbtuho5h0/image/upload/v1795457933/Captura_de_pantalla_2026-11-23_191309_yfeto5.png)

### Claw machine

![The Bransonverse claw machine](https://res.cloudinary.com/dbtuho5h0/image/upload/v1795457934/Captura_de_pantalla_2026-11-23_191235_bugrf0.png)

### Victory screen

![Branson obtained](https://res.cloudinary.com/dbtuho5h0/image/upload/v1795457933/Captura_de_pantalla_2026-11-23_191255_gcwznf.png)

### Collection

![Branson collection](https://res.cloudinary.com/dbtuho5h0/image/upload/v1795457933/Captura_de_pantalla_2026-11-23_191154_khcfcf.png)

## Requirements

| Requirement | How we solved it |
|---|---|
| Receive a list of names | Custom game form with 9 to 15 names, no empty fields and no repeated names |
| Pick a name at random | The claw catches a Branson and its hidden name is revealed |
| Show who was picked | Result message with the name and the Branson |
| A picked name does not come back | Caught names are removed until the game is restarted |
| Add and remove names | `+` and `×` buttons in the form |
| Animations and transitions | Claw, Bransons, lights, buttons, messages and screens |
| Events that start animations | Keyboard, mouse and custom events (`machine:prize`, `machine:fail`...) |
| Sound effects | Background music, menu sounds and claw machine sounds |
| Start screen | "Press any key" screen, intro video and main menu |
| Restart button | "Jugar otra vez" and "Volver al inicio" |
| Notice for the last name | "¡Era el último!" message |
| Back to the start after the last name | Automatic redirect to the main menu |
| Responsive | Breakpoints for mobile, tablet and desktop, and phones in landscape |
| Tested | 6 test suites with Jest |
| Bonus: local storage | The collection remembers the Bransons you have caught |

## Technologies and tools

- **HTML, CSS and JavaScript** (ES modules)
- **Jest** with `jest-environment-jsdom` for unit tests
- **Cloudinary** for images, video, music and sounds
- **Google Fonts:** Barrio and Baloo Da 2
- **Figma** for the design
- **Trello** for the Kanban board
- **Git and GitHub** for version control

## Project structure

```
bransonverse/
├── index.html              Start screen, main menu and custom game form
├── pages/
│   ├── game.html           Game screen with the claw machine
│   └── collection.html     Collection screen
├── src/
│   ├── css/
│   │   ├── main.css        Imports every stylesheet
│   │   ├── home.css        Start screen and menus
│   │   ├── custom-game.css Custom game form
│   │   ├── game.css        Counters and game messages
│   │   ├── machine.css     Claw machine
│   │   └── collection.css  Collection
│   └── js/
│       ├── main.js         Start screen and menu navigation
│       ├── custom-game.js  Custom game form
│       ├── music.js        Background music
│       ├── sound-effects.js Menu sounds
│       ├── game.js         Game flow: attempts, timer and results
│       ├── random-selection.js Bransons data and random logic
│       ├── machine.js      Claw machine
│       ├── collection-store.js Saved collection (localStorage)
│       └── collection.js   Collection screen
├── tests/                  Jest tests
├── package.json
└── README.md
```

## Getting started

1. Clone the repository:
   ```bash
   git clone https://github.com/nerenererr/bransonverse.git
   ```
2. Open the folder in Visual Studio Code and start `index.html` with **Live Server**.

### Running the tests

```bash
npm install
npm test
```

## Team and workflow

| Person | Part | Branch |
|---|---|---|
| Person 1 · Nerea | Game logic: attempts, timer, random selection and results | `feature/game-logic` |
| Person 2 · Dani P | Start screen, menus, custom game form and music | `feature/menus-forms` |
| Person 3 · Dani C | Claw machine: claw, controls, animations and sounds | `feature/machine` |
| Person 4 · Carlos | Collection screen and saved progress | `feature/collection` |

- We worked with **Scrum** and a **Kanban** board in Trello.
- Each person worked on their own `feature/...` branch.
- Finished work was joined into `dev` with **pull requests**, and `dev` goes into `main` for the final version.

---

## Start screen, menus and custom game

- The start screen waits for any key, then plays the intro video and starts the music.
- After the intro, the main menu appears. When the player comes back from another page, the intro is skipped.
- The menus work with the keyboard and the mouse, and every action has its own sound.
- The custom game form checks the names before starting:
  - between **9 and 15** names;
  - no empty fields;
  - no repeated names, ignoring upper and lower case.
- The names are saved in `sessionStorage` and the game screen reads them.
- The game and the collection open inside the main page (in an `iframe`), so the background music never stops when the player changes screen. It starts again from the beginning when the page is reloaded.

## Game logic

- Every game has **3 attempts** and **90 seconds**. A failed attempt or an empty grab uses one attempt.
- The machine is filled with **15 Bransons**, chosen at random using their `spawnWeight`.
- When the claw grabs a Branson, its `fallProbability` decides whether it slips.

| Branson | Spawn weight | Fall probability |
|---|---|---|
| Standard Branson | 48 | 15 % |
| Brenda | 48 | 15 % |
| Branson especial de Halloween | 32 | 30 % |
| Pokebranson | 32 | 30 % |
| Nekobranson | 12 | 55 % |
| Branjosé Tomás | 32 | 30 % |
| Branson especial de San Valentín | 32 | 30 % |
| Brokeback Branson | 32 | 30 % |
| Branson especial de Navidad | 32 | 30 % |

- In the **custom game**, each Branson carries one of the written names. The names that have been caught are removed and saved in `sessionStorage`, so they never come back until the game is restarted. When the last name is caught, the game shows "¡Era el último!" and goes back to the main menu.
- In **Branson mode**, the caught Branson is unlocked in the collection.

## Collection

- Shows the **9 Bransons** in a fixed order. **Standard Branson** and **Brenda** are always unlocked.
- Locked Bransons are shown as a black silhouette and cannot be selected.
- The selected Branson shows its name and description.
- The progress is saved in `localStorage`, so the collection remembers what you have caught.
- The game unlocks a Branson with `window.BransonCollection.unlock(id)`.

## Claw machine

The claw machine is the visual and interactive part of the game screen. The player moves the claw, drops it on top of a Branson and the machine tries to grab it. The machine **does not run any random draw**: it only takes care of the animations, the controls and the sounds. What happens on each attempt is decided by the game logic.

### How an attempt works

1. The player moves the claw and presses the button.
2. The claw goes down **right where it is** and closes.
3. The machine looks for the Branson underneath:
   - If there is none, the claw goes up empty and fires the `machine:empty` event.
   - If there is one, it grabs it and fires the `machine:branson-grabbed` event with its `id` and `name`.
4. The game logic decides whether the Branson falls (using its `fallProbability`) and calls `finishGrab(true)` or `finishGrab(false)`.
5. The machine finishes the animation:
   - `true`: it carries the Branson to the prize door and fires `machine:prize`.
   - `false`: the Branson slips, falls back to the pile, laughs and fires `machine:fail`.

### Functions to use from the game

| Function | What it does |
|---|---|
| `renderBransons(bransons)` | Places the Bransons in the machine. It receives the list of Bransons (`id`, `name`, `image`). It also accepts a list of names. |
| `finishGrab(isSuccess)` | Finishes the attempt: `true` takes the Branson, `false` drops it. |
| `resetMachine(bransons)` | Moves the claw back to the center and places the Bransons again. |
| `setMachineEnabled(enabled)` | Turns the controls on (`true`) or off (`false`), for example while a message is shown or when the time is over. |

### Events fired by the machine

| Event | When | Data (`event.detail`) |
|---|---|---|
| `machine:interaction` | The player moves the claw or presses the button | — |
| `machine:button-pressed` | The player presses the button | — |
| `machine:branson-grabbed` | The claw has grabbed a Branson | `{ id, name }` |
| `machine:prize` | The Branson has fallen into the prize door | `{ id, name }` |
| `machine:fail` | The Branson has fallen from the claw | `{ id, name }` |
| `machine:empty` | The claw went down without grabbing anything | — |

`machine.js` is an ES module, so these functions are imported where they are needed:

```js
import { renderBransons, finishGrab } from "./machine.js";

renderBransons(bransons);

document.addEventListener("machine:branson-grabbed", function (event) {
    const branson = bransons.find(function (item) {
        return item.id === event.detail.id;
    });
    const isSuccess = Math.random() * 100 >= branson.fallProbability;
    finishGrab(isSuccess);
});
```

### Animations and sounds

- Blinking light bulbs on the frame, which blink faster when a prize is won.
- The claw tilts while moving, squeezes when it closes and swings while carrying the Branson.
- The Branson moves up into the claw when grabbed and, if it falls, goes back to its place with a small bounce.
- The Bransons laugh ("JA JA JA") when the claw fails.
- The machine shakes when the prize falls.
- The button lights up with a flash and a wave when pressed, and the joystick shows arrows while moving.
- Sounds for moving, pressing the button, dropping, grabbing, winning, failing and laughing.

### Design

- The machine keeps its proportions and fills the available height without scrolling, also on phones in landscape.
- Classes follow the **BEM** naming convention (`machine__button`, `claw--down`, `branson--grabbed`...).
- The Bransons use Cloudinary `e_trim` so they all have the same size, and `f_auto,q_auto` so they load fast.

---

## Tests

All the tests run with `npm test`.

| File | What it tests |
|---|---|
| `tests/custom-game.test.js` | Custom game form: adding and removing names, validation and saving the names |
| `tests/game.test.js` | Attempts, timer, results and communication with the machine |
| `tests/random-selection.test.js` | Random Branson selection and claw probabilities |
| `tests/machine.test.js` | Claw limits, Branson under the claw, positions and images |
| `tests/collection.test.js` | Initial Bransons, unlocking and saved progress |
| `tests/navigation.test.js` | Opening and closing the game and the collection from the main menu |

## Credits

- Sound effects from **Mixkit** and **Pixabay**.
- Background music from **Pixabay**.
- Fonts **Barrio** and **Baloo Da 2** from Google Fonts.
