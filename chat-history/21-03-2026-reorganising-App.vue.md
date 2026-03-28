@App.vue I'd like some general suggestions on code organisation. The App.vue contains the main animation loop. It is too long for my liking. It could be considered an orchestrator of all of the main work of the simulation. However, I feel that this file could be shorter. Existing functions could be moved to separate files whether grouped or not, and imported. And various code blocks could probably be turned into functions and also imported and called. Do you have any suggestions about different approaches I could take to shifting some of this code into different modules and calling these in, for example grouped by purpose or theme?

---------


Here’s a concise organization plan that matches how your `App.vue` is actually structured.

---

## What `App.vue` is doing today

Roughly:

| Area | Role |
|------|------|
| **Template** | Shell + canvas + large sidebar of forms (already split into many child components) |
| **setup()** | Scene load, agent load, play/pause, **animation loop**, actions/utility/emissions, mouse/canvas events, helpers |

The “too long” part is mostly the **script**: one big `setup()` with many closures that share `store`, handlers, and `getGlobals()`.

---

## Approaches (you can mix them)

### 1. **Extract pure functions by theme** (lowest friction)

Move **stateless** or **store-agnostic** logic to modules that take explicit arguments and return values. `App.vue` stays the orchestrator but calls `import { … } from '@/sim/…'`.

| Module (example path) | Contents |
|----------------------|----------|
| `sim/sceneLoader.js` | `loadAgentsAndFixtures(store, deps)` — or split: `hydrateSceneFromApiData`, `wireAnimationSetsToSpriteSheets`, `spawnAgentsFromSceneData` |
| `sim/simulationTick.js` | `runFrame({ store, frameId, getGlobals, handlers, … })` — one function that runs **one** frame: recurring effects → renderAgents → agent loops → emissions → menu/cursor/FPS. `animate()` becomes: `requestAnimationFrame` + `currentAnimationFrameId = frameId` + `runFrame(...)`. |
| `sim/agentActions.js` | `setNextAction`, `cloneAction`, `chooseNextActionByUtility`, `setDynamicActionTargetAgents` (these are large and self-contained) |
| `sim/emissions.js` | `handleEmissions(store, emissions, …)` |
| `sim/canvasInput.js` | `createCanvasMouseHandlers({ store, canvas, … })` returning `{ onMouseMove, onMouseDown, … }` or attach once in `onMounted` |
| `sim/dayCycle.js` | `endDay`, `applyScheduledEffects` |

**Dependency injection:** pass `store`, `getGlobals`, `agentHandler`, `actionHandlers`, `conditionHandler` as parameters so modules don’t import the store themselves (easier to test and to swap implementations).

---

### 2. **`SimulationEngine` or `useSimulation` composable** (medium refactor)

Put “everything that isn’t UI” behind one composable:

```text
src/composables/useSimulation.js
```

It returns: `{ playScene, pauseScene, animate, loadAgentsAndFixtures, … }` and holds handler instances internally. `App.vue` only does:

```js
const sim = useSimulation(store, { getGlobals, ...refs })
onMounted(() => sim.mountCanvas(canvasRef))
```

**Pros:** Short `App.vue` script, clear boundary “UI vs simulation”.  
**Cons:** One big composable can become a “god composable” unless you still split internals into `sim/*.js` as in (1).

---

### 3. **Class or object for the loop** (game-engine style)

```text
src/sim/SimulationRunner.js
```

A class with `start()`, `stop()`, `tick(frameId)`, references to canvas context, store, and handlers. Matches “orchestrator” mentally and keeps module-level vars (`currentAnimationFrameId`, FPS counters) as instance fields instead of file-level `let`s.

---

### 4. **Split the template** (orthogonal but high impact)

The script is long; the template is also huge. Consider:

- **`SimulationView.vue`** — canvas container, scene heading, play/save buttons, maybe FPS block.
- **`SceneEditorSidebar.vue`** — the big `info-container` / all the `<details>` sections (or 2–3 chunks: “runtime”, “definitions”, “tools”).

`App.vue` becomes layout + router shell (later) + `<SimulationView />` + `<SceneEditorSidebar />`.  
Simulation logic can live in a composable used only by `SimulationView.vue`, so `App.vue` is thin.

---

## Grouping by “purpose or theme” (summary)

| Theme | Suggested home |
|-------|----------------|
| **Scene / API hydration** | `sceneLoader.js` |
| **Per-frame tick** | `simulationTick.js` or `SimulationRunner.tick` |
| **Action graph / utility / transitions** | `agentActions.js` |
| **Spawn/delete side effects** | `emissions.js` |
| **Input → simulation** | `canvasInput.js` |
| **Time / day / recurring** | `dayCycle.js` |
| **Runtime-only state** (frame id, FPS, cursor) | Small `simulationRuntime.js` or fields on `SimulationRunner` |

---

## Practical order of operations

1. **Extract `simulationTick` + slim `animate()`** — biggest readability win, touches one hot path.  
2. **Extract `sceneLoader`** — long, mostly linear, few dependencies.  
3. **Extract `agentActions` + `setDynamicActionTargetAgents`** — shrinks the middle of the file.  
4. **Extract canvas input** — isolates DOM listeners.  
5. **Optional:** `useSimulation` or `SimulationRunner` as a thin facade over the above.  
6. **Optional:** split template into `SimulationView` + sidebar.

---

## Things to watch

- **Shared closures:** many functions close over `store`, `getGlobals`, handlers. Either pass them as arguments into extracted functions or pass a single `ctx` object `{ store, getGlobals, agentHandler, actionHandlers, … }` to avoid huge parameter lists.
- **Module-level `let`s:** moving them into a `SimulationRunner` instance makes lifecycle and testing clearer.
- **Don’t over-split:** a few 200–400 line modules are easier to navigate than twenty 50-line files with circular imports.

If you want to implement one slice first, the highest leverage is usually **`simulationTick.js` + a 15-line `animate()` in `App.vue`**, then **`sceneLoader.js`**.