## Claw machine (Person 3 · Dani C)

The claw machine is the visual and interactive part of the game screen. The player moves the claw, drops it on top of a Branson and the machine tries to grab it. The machine **does not run any random draw**: it only takes care of the animations, the controls and the sounds. What happens on each attempt is decided by the game logic (Person 1).

### Files

| File | Content |
|---|---|
| `src/css/machine.css` | Machine styles and animations |
| `src/js/machine.js` | Claw movement, controls, Bransons, events and sounds |
| `tests/machine.test.js` | Unit tests for the machine functions |
| `pages/game.html` | Machine area inside the game screen |

### Controls

| Action | Mouse / touch | Keyboard |
|---|---|---|
| Move the claw | Hold the joystick (left or right side) | `←` and `→` |
| Drop the claw | Yellow button | `↓` |

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

### Events fired by the machine

| Event | When | Data (`event.detail`) |
|---|---|---|
| `machine:button-pressed` | The player presses the button | — |
| `machine:branson-grabbed` | The claw has grabbed a Branson | `{ id, name }` |
| `machine:prize` | The Branson has fallen into the prize door | `{ id, name }` |
| `machine:fail` | The Branson has fallen from the claw | `{ id, name }` |
| `machine:empty` | The claw went down without grabbing anything | — |

Example of how to connect it from `game.js`:

```js
renderBransons(bransons);

document.addEventListener("machine:branson-grabbed", function (event) {
    const branson = bransons.find(function (item) {
        return item.id === event.detail.id;
    });
    const isSuccess = Math.random() * 100 >= branson.fallProbability;
    finishGrab(isSuccess);
});

document.addEventListener("machine:prize", function (event) {
    console.log("Prize:", event.detail.name);
});
```

### Animations

- Blinking light bulbs on the frame, which blink faster when a prize is won.
- The claw tilts while moving, squeezes when it closes and swings while carrying the Branson.
- The Branson moves up into the claw when grabbed and, if it falls, goes back to its place with a small bounce.
- The Bransons laugh ("JA JA JA") when the claw fails.
- The machine shakes when the prize falls.
- The button lights up with a flash and a wave when pressed, and the joystick shows arrows while moving.

### Design and responsive

- **Mobile first**, with breakpoints at `768px` and `1024px`.
- The machine keeps its proportions and fills the available height without scrolling, also on phones in landscape.
- Classes follow the **BEM** naming convention (`machine__button`, `claw--down`, `branson--grabbed`...).
- The machine, claw and Branson images are hosted on **Cloudinary**. The Bransons use `e_trim` so they all have the same size, and `f_auto,q_auto` so they load fast.

### Tests

The functions that do not depend on the DOM are tested with **Jest** in `tests/machine.test.js`:

- `clampPosition` and `getNextPosition`: the claw never leaves the machine.
- `findClosestBranson`: picks the Branson underneath the claw.
- `isBransonNear`: decides which Bransons laugh when the claw fails.
- `getBransonPlace`, `getBransonImage`, `getBransonName` and `getBransonSource`: position and image of each Branson.
