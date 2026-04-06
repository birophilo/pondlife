One change I would like to make is this: when the user clicks on a different route e.g. Home when the sim is running, don't destroy all of the simulation, only pause it. So if on Simulation, the user clicks Home and then Simulation, the paused scene will be there waiting for the user. Can you implement that?

--------------------

Thinking:

The user wants to change the behavior when navigating away from /sim to /home (or another route). Currently, onBeforeRouteLeave and onBeforeUnmount call sim.stopSimRuntime() which fully tears down the canvas, rAF, listeners, etc.

They want instead:

When leaving the sim route: pause the simulation (don't destroy)
When returning to sim: the paused scene is still there, user can unpause
This implies we need keep-alive on the router-view for SimView, OR we don't unmount SimView when navigating away. The standard Vue pattern is:

<keep-alive> wrapping <router-view> with include for SimView only - so SimView stays mounted but inactive when on Home route
On deactivate (when leaving SimView): pause sim, optionally detach listeners/cancel rAF without full destroy - OR keep rAF paused
Actually if SimView stays mounted with keep-alive:

onBeforeUnmount does NOT run when switching routes - instead onDeactivated runs
onBeforeRouteLeave still runs when navigating away
So the flow:

Use <keep-alive include="SimView"> or include matching component name
Replace stopSimRuntime on route leave with pause only - pauseScene() which sets sceneIsPlaying false, sceneIsPaused true, and stops the animation loop
On onActivated (when coming back to SimView): re-attach might be needed if we... actually canvas is still there, sim runtime still exists - we just need to NOT destroy on leave
Wait - if we use keep-alive:

SimView component instance is cached - not destroyed
onMounted runs once first time
When navigating away: onDeactivated fires, NOT onBeforeUnmount
When navigating back: onActivated fires
So I need to:

Remove onBeforeRouteLeave calling stopSimRuntime - or change it to only pause
Remove onBeforeUnmount calling stopSimRuntime for normal route change - but onBeforeUnmount won't run when using keep-alive when switching routes!
Actually when using keep-alive:

Leaving /sim: onDeactivated (not unmount)
Going to /sim: onActivated
So I should:

Add keep-alive in App.vue with include="SimView"
In onDeactivated or onBeforeRouteLeave: call sim.pauseScene() and ensure rAF is cancelled (pauseScene might already stop the loop - need to check simRuntime)
Let me read pauseScene and animate behavior in simRuntime again.

From earlier context:

const pauseScene = () => {
  store.sceneIsPlaying = false
  store.sceneIsPaused = true
}
const animate = () => {
  if (destroyed) return
  let frameId
  if (store.sceneIsPaused === true) {
    frameId = requestAnimationFrame(() => console.log('PAUSED'))
  } else {
    lastRafId = requestAnimationFrame(animate)
    frameId = lastRafId
  }
  ...
When paused, it schedules a useless rAF that doesn't chain - so the loop stops effectively after one bad frame.

When user navigates away with keep-alive:

We need to cancelAnimationFrame and remove listeners? If we remove listeners, when user comes back we need to re-attach. If we only pause, the rAF might still fire one more time...
Actually the user said "don't destroy all of the simulation" - they want pause, not teardown. So:

On deactivate (leave sim route): pauseScene() + cancelAnimationLoop() to stop rAF - but keep canvas, keep sim runtime state, keep event listeners? Or remove listeners to avoid handling events when not visible?
When user is on Home page, SimView is kept alive but hidden - canvas events might still fire if the element is in DOM but hidden? Usually keep-alive keeps the DOM in the inactive tree - might still receive events if overlapping? Typically the inactive component's DOM is not displayed - might be display: none or v-show on router-view - need to check.

Vue Router with keep-alive: the inactive component's root is not in the document... actually I think it's kept in memory with display: none or similar. Let me check - keep-alive caches the component instance, the DOM might be in a fragment or hidden.

Actually for router-view + keep-alive, the inactive component's DOM is removed from the flow but kept in cache - I need to verify. From Vue docs: "The cached component's DOM is preserved in memory."

So canvas might not be visible - mouse events on canvas might not fire if not in viewport. Safer to remove listeners on deactivate and re-attach on activate to avoid stray events, OR leave them - probably remove listeners when leaving to be clean.

So flow:

onDeactivated: pauseScene() + cancelAnimationLoop() + detachCanvasListeners() (new method) - but NOT destroy liveHud, NOT destroy canvas ref, NOT set destroyed=true

onActivated: if canvas exists, attachCanvasListeners() again (or full attachCanvas if needed) - if we never destroyed canvas context, we're good

Actually the current destroy() does too much. I need to split:

pauseSimRuntime() or detachForRouteLeave(): pause scene, cancel rAF, remove canvas + document listeners, optionally don't destroy liveHud (or destroy HUD DOM - user might want HUD when returning - keep liveHud)
Let me read full destroy and attachCanvas in simRuntime.


-------------

Thinking:
I need to:

App.vue: Wrap <router-view> in <keep-alive include="SimView"> so SimView is cached when navigating to Home.

simRuntime.js: Add suspendForRouteLeave() or pauseAndDetach() that:

pauseScene() - sets playing false, paused true
cancelAnimationLoop() - stop rAF
Remove canvas + document listeners (don't null canvas/c - keep references for reactivation)
Do NOT destroy liveHud
Do NOT set destroyed = true (so we can resume)
Do NOT reset play flags in store beyond pauseScene - user wants paused state preserved
Wait: pauseScene() sets sceneIsPlaying = false and sceneIsPaused = true. If user was playing (not paused), we want that to become paused when leaving - so when they return they see "unpause scene" button. Good.

If user was in edit mode (not playing), sceneIsPlaying false, sceneIsPaused false - we should still cancel rAF. The animate loop might not be running. Good.

If user was playing - we pause and cancel rAF. Store shows paused. Good.

Add resumeAfterRouteEnter() or reattachInput() that:

Re-add canvas listeners if canvas still exists and listeners were removed
Re-add document listeners
Do NOT restart animation unless user clicks unpause - unPauseScene already does that
Actually on activate we only need to reattach listeners. We should NOT call startAnimationLoop unless was playing - but we paused on leave so we're paused. User clicks unpause on return. Good.

Guard attachCanvas: If called when canvas already exists with same element - skip or re-init. For first mount, attachCanvas runs. For reactivation after keep-alive, canvas ref still points to same element - we need reattachListenersOnly() or check if listeners already attached.

Simpler: detachForRouteLeave removes listeners, sets a flag listenersDetached = true resumeAfterRouteEnter re-adds listeners if listenersDetached && canvas

destroy / stopSimRuntime: Only for true unmount when keep-alive excludes or app teardown - actually when is SimView destroyed with keep-alive? When cache is pruned or include changes. We still need onBeforeUnmount for when component is finally destroyed (e.g. max cache, or navigating away if we remove keep-alive later).

onBeforeRouteLeave: Change to sim.suspendForRouteLeave() instead of stopSimRuntime

onBeforeUnmount: Call sim.stopSimRuntime() only - when component actually destroyed

onActivated (from vue): When SimView becomes active again, call sim.resumeAfterRouteEnter()

onDeactivated: Call sim.suspendForRouteLeave()

Note: onDeactivated fires when leaving cached component. onBeforeRouteLeave also fires. Order might be both - avoid duplicate suspend. Use only onDeactivated for suspend, remove onBeforeRouteLeave suspend OR use only onBeforeRouteLeave.

From Vue docs: onBeforeRouteLeave runs before navigation. onDeactivated runs when component is deactivated by keep-alive.

I'll use onDeactivated for suspend and onActivated for resume. Remove onBeforeRouteLeave suspend (duplicate).

Actually onBeforeRouteLeave runs in same tick as navigation - onDeactivated runs after. For keep-alive, onBeforeUnmount does NOT run. So onDeactivated is the right one.

Remove onBeforeRouteLeave entirely for suspend.

onMounted runs only once when SimView first created. When returning from Home, onActivated runs, not onMounted. So first visit: onMounted sets up canvas, hud, etc. When leaving: onDeactivated suspends. When returning: onActivated resumes listeners only - onMounted does NOT run again.

First visit edge case: User goes to /sim first time - onMounted runs. User goes Home - onDeactivated suspend. User returns - onActivated resume. Good.

User goes directly to /sim first load: onMounted runs. Good.

attachLiveHud on first mount only - on reactivated we don't re-init HUD. Good.

suspendForRouteLeave must NOT destroy liveHud - HUD stays in DOM (hidden with parent). Good.

pauseScene currently sets sceneIsPlaying false, sceneIsPaused true - but if user was already in edit mode (not playing), pauseScene would set paused true even though they weren't "playing". Let me check - before Phase G destroy reset both flags. Now:

User editing (not playing): sceneIsPlaying false, sceneIsPaused false. On suspend: we should call cancelAnimationLoop() only, not necessarily pauseScene which sets paused true...
If we call pauseScene() for edit mode, we get sceneIsPaused true - UI might show "unpause" when it should show "play scene". Need to check SimView template buttons.

From earlier template:

<span v-if="store.sceneIsPlaying">
  <button @click="pauseScene">pause scene</button>
</span>
<span v-else-if="store.sceneIsPaused">
  <button @click="unPauseScene">unpause scene</button>
</span>
<span v-else>
  <button @click="playScene">play scene</button>
</span>
So if edit mode: playing false, paused false → "play scene". If we pauseScene() on leave from edit mode, we'd set paused true → "unpause scene" - wrong.

suspendForRouteLeave should:

Always cancelAnimationLoop()
Remove listeners
If store.sceneIsPlaying === true (actively playing): call pauseScene() to get to paused state
If not playing: just cancel rAF (maybe animate wasn't running anyway)
If user had paused mid-play: sceneIsPlaying false, sceneIsPaused true - already paused. Just cancel rAF.

If user was playing: sceneIsPlaying true, sceneIsPaused false - call pauseScene().

If user was edit: both false - don't call pauseScene().

const suspendForRouteLeave = () => {
  cancelAnimationLoop()
  detachCanvasListeners()
  detachDocumentListeners()
  if (store.sceneIsPlaying === true) {
    store.sceneIsPlaying = false
    store.sceneIsPaused = true
  }
  tickLiveHud()
}
Actually pauseScene() does exactly store.sceneIsPlaying = false; store.sceneIsPaused = true - we should only call that when playing. Good.

detachCanvasListeners: extract removal logic from destroy without nulling canvas.

resumeAfterRouteEnter:

const resumeAfterRouteEnter = () => {
  if (destroyed || !canvas) return
  attachCanvasListeners() // need to split attachCanvas into getContext once vs listeners
Refactor attachCanvas to:

initCanvas(canvasEl) - first time only: getContext, size, fill
attachCanvasListeners() - add mousemove, click
Or: attachCanvas does full init - on first mount only. On resume, only attachCanvasListeners() if not already attached.

Use a flag listenersAttached boolean.

destroyed flag: suspend does NOT set destroyed. destroy() sets destroyed and nulls canvas.

Re-entering after suspend: canvas ref still valid, c still valid. We only removed listeners.

attachDocumentListeners on resume - call again.

First mount: onMounted calls attachCanvas (sets up canvas + listeners) + attachDocumentListeners + hud.

Suspend removes document listener - on resume reattach.

Split attachCanvas:

let listenersAttached = false
const attachCanvas = (canvasEl) => {
  ...
  setupCanvasSurface(canvasEl) // width, height, fill once
  attachCanvasListeners()
}
const attachCanvasListeners = () => {
  if (!canvas || listenersAttached) return
  ...
  canvas.addEventListener(...)
  listenersAttached = true
}
const detachCanvasListeners = () => {
  if (!canvas || !listenersAttached) return
  canvas.removeEventListener(...)
  listenersAttached = false
}
Wait - first time attachCanvas, we need listenersAttached false. After attach, true. After suspend, false. After resume, true again.

detachDocumentListeners similarly - track documentListenerAttached

Let me read attachCanvas from the start - I'll refactor carefully.

Also animate when paused uses bad rAF - we should fix that to not schedule anything when paused - actually cancelAnimationLoop in suspend handles it.

unPauseScene on return - user clicks - starts loop. Good.

Implementation steps:

simRuntime: Add listenersAttached and documentListenerAttached flags OR infer from onMouseMove non-null.

Split attachCanvas into:

attachCanvas(canvasEl) - sets canvas, c, dimensions, initial fill, calls attachCanvasListenersInternal()
detachCanvasListeners - remove if attached

detachDocumentListeners - remove if attached

suspendForRouteLeave - cancelAnimationLoop, detach canvas listeners, detach document, conditional pause playing state

resumeAfterRouteEnter - attachCanvasListeners (need canvas ref still valid), attachDocumentListeners

Export suspendForRouteLeave, resumeAfterRouteEnter

destroy() - also set listenersAttached false, documentListenerAttached false when removing

Actually duplicate logic - destroy() calls removeEventListener - same as detach. Refactor destroy to call detach methods + liveHud destroy + null canvas + destroyed.

attachCanvasListenersInternal - the current code that adds listeners - only add if canvas exists and not already attached.

attachDocumentListeners - add guard if already attached

Let me read full attachCanvas from line 373.

I'll implement let canvasListenersAttached = false and let documentListenerAttached = false.

attachCanvas:

const attachCanvas = (canvasEl) => {
  ...
  canvas = canvasEl
  c = canvas.getContext('2d')
  ...
  attachCanvasPointerListeners()
}
const attachCanvasPointerListeners = () => {
  if (!canvas || canvasListenersAttached) return
  onMouseMove = ...
  onCanvasClick = ...
  canvas.addEventListener('mousemove', onMouseMove)
  canvas.addEventListener('click', onCanvasClick)
  canvasListenersAttached = true
}
const detachCanvasPointerListeners = () => {
  if (!canvas || !canvasListenersAttached) return
  canvas.removeEventListener('mousemove', onMouseMove)
  canvas.removeEventListener('click', onCanvasClick)
  canvasListenersAttached = false
  // keep onMouseMove/onCanvasClick refs for reattach? We need to recreate or keep same function refs - keep same refs, just remove listeners
}
Actually after detach, we can keep the same function objects for reattach - good.

attachDocumentListeners - add guard:

let documentListenerAttached = false
const attachDocumentListeners = () => {
  if (documentListenerAttached) return
  onDocumentKeydown = ...
  document.addEventListener('keydown', onDocumentKeydown)
  documentListenerAttached = true
}
const detachDocumentListeners = () => {
  if (!documentListenerAttached || !onDocumentKeydown) return
  document.removeEventListener('keydown', onDocumentKeydown)
  documentListenerAttached = false
}
destroy uses detach methods + null everything.

suspendForRouteLeave:

const suspendForRouteLeave = () => {
  if (destroyed) return
  cancelAnimationLoop()
  detachCanvasPointerListeners()
  detachDocumentListeners()
  if (store.sceneIsPlaying === true) {
    store.sceneIsPlaying = false
    store.sceneIsPaused = true
  }
  tickLiveHud()
}
resumeAfterRouteEnter:

const resumeAfterRouteEnter = () => {
  if (destroyed || !canvas) return
  attachCanvasPointerListeners()
  attachDocumentListeners()
  tickLiveHud()
}
SimView:

Remove onBeforeRouteLeave stopSimRuntime
onDeactivated: sim.suspendForRouteLeave()
onActivated: sim.resumeAfterRouteEnter()
onBeforeUnmount: sim.stopSimRuntime() - full destroy when cache evicted or HMR
keep-alive: <keep-alive include="SimView"> - component name must be SimView - we have name: 'SimView' - good.

HomeView - no name conflict.

Edge case: User on sim, never mounted canvas? Impossible.

Edge case: First navigation to /sim - onMounted runs before onActivated? For first mount: onMounted runs, then onActivated might also run (keep-alive activates). Order: onMounted then onActivated on first visit. So we'd suspend never before first activate... Actually first time: onMounted attaches everything. Then onActivated runs - we'd resumeAfterRouteEnter which tries to attach listeners again - duplicate listeners if we don't guard!

From Vue docs: For kept-alive child, onMounted and onActivated both fire on first mount - order is onMounted then onActivated.

So resumeAfterRouteEnter on first mount would double-attach listeners!

Fix: Only use onActivated for resume when not first mount - use a ref hasMounted = ref(false) in SimView:

onMounted(() => {
  ...
  hasMounted.value = true
})
onActivated(() => {
  if (!hasMounted.value) return // impossible
  // Skip first activation if we just mounted - use a flag isInitialActivation
})
Actually simpler: don't call resume in onActivated on first run - use let isFirstActivate = true in setup:

let skipNextActivate = true
onMounted(() => {
  ...
  skipNextActivate = false // no, wrong
onActivated(() => {
  if (skipNextActivate) {
    skipNextActivate = false
    return
  }
  sim.resumeAfterRouteEnter()
})
First visit: onMounted runs, sets up canvas. Then onActivated runs - we skip resume once. User goes Home - onDeactivated suspend. User returns - onActivated - resume. Good.

But wait - first visit order: onMounted then onActivated. So we need skip first onActivated:

const isFirstActivation = ref(true)
onActivated(() => {
  if (isFirstActivation.value) {
    isFirstActivation.value = false
    return
  }
  sim.resumeAfterRouteEnter()
})
First mount: onMounted, onActivated (skip). User leaves: onDeactivated suspend. User returns: onActivated resume. Perfect.

Alternative: only onMounted for initial setup, onActivated only for resume - check if (sim.needsResume()) - hacky.

Use isFirstActivation ref.

destroy when keep-alive prunes - onBeforeUnmount runs - full stopSimRuntime.

Export suspendForRouteLeave, resumeAfterRouteEnter from sim return object.

stopSimRuntime remains full destroy for unmount.

Let me also verify: when suspend, we don't call destroyed = true - good. When stopSimRuntime on unmount, destroyed = true.

attachCanvas on first mount - if user returns from Home, we don't call attachCanvas again - canvas and c still exist. Good.

liveHud - not destroyed on suspend - good.

tickLiveHud after suspend - HUD might show stale - ok.

Implement the refactor in simRuntime - I need to merge attachCanvas listener part with new attachCanvasPointerListeners.

Also fix pauseScene duplicate - suspend uses inline if playing.

Let me read attachCanvas full block again for copy.

----------

Answer:
Implementing keep-alive for SimView, adding suspendForRouteLeave / resumeAfterRouteEnter with listener detach/reattach, and skipping the first onActivated so we don't double-attach listeners.

Thinking:
I'll add canvasPointerListenersAttached and documentListenerAttached after line 51.

Refactor attachCanvas to use inner functions.

destroy() should call detach helpers and reset flags before nulling.

suspendForRouteLeave / resumeAfterRouteEnter as designed.

SimView: import onActivated, onDeactivated from 'vue', add isFirstActivation ref, remove onBeforeRouteLeave.

App.vue: keep-alive

Let me write the full attachCanvas replacement - I'll read lines 373-458 again to do one search_replace.

Now update destroy() to use detach helpers and reset flags

App.vue keep-alive SimView: onActivated, onDeactivated, remove onBeforeRouteLeave, isFirstActivation for resume

Import onActivated, onDeactivated from vue

Update template comment in SimView for new behavior

Run lint - Vue 3 router-view v-slot syntax - should work in Vue 3 / vue-router 4

Verify keep-alive include - component name SimView - export default has name: 'SimView' - good

Edge case: HomeView doesn't have name SimView - only SimView is cached - good

Issue: When using v-slot on router-view, the Component might be wrapped - need to verify. From Vue Router 4 docs: <router-view v-slot="{ Component }"><component :is="Component" /></router-view> - standard.

keep-alive with dynamic component - the cached components need name option - SimView has name: 'SimView'. HomeView might need name for exclude - we're using include only SimView - HomeView is not cached (not in include) - actually include="SimView" means only SimView instances are cached. HomeView is not in include so it's not kept - HomeView remounts each visit. Good.

Potential bug: First visit to /sim - onMounted, onActivated (skip resume). User leaves to Home - onDeactivated suspend. User returns - onActivated resume. Good.

User never visits Home first: User goes to /sim - onMounted, onActivated skip. Good.

User goes / -> /sim first time: Same.

SimView destroy: When would cache prune? Default max 10 components - unlikely. If user clears cache - onBeforeUnmount - destroy. Good.

HMR: might remount - ok

Run lint build

Double-check: resumeAfterRouteEnter - attachDocumentListeners - guard prevents double - first attach on mount sets documentListenerAttached true. On deactivate we detach - false. On resume - attach again - good.

attachCanvasPointerListeners - on resume, ensurePointerHandlers - onMouseMove was nulled in destroy but not in suspend - we only detach listeners, onMouseMove is NOT nulled in suspend. Good.

Run tests

Actually detachCanvasPointerListeners doesn't null onMouseMove - good, same function refs for reattach.

SimView template comment update

Add name to HomeView for clarity - optional

Document: if user was in "edit" mode (not playing), suspend doesn't set paused - good.

If user was playing, we set paused - they return and see unpause - good.

Consider: router index comment update

I'll give user a short summary

One more thing: max cache for keep-alive - default unlimited for included components? Actually only SimView is included - one instance. Good.

Vue Router 4 + keep-alive: Some versions need key on router-view - not for our case.

Verify isFirstActivation - when SimView is first created, onActivated runs after onMounted. Good.

When user navigates from Home to Sim for first time in session - SimView created, onMounted, onActivated (skip). Good.

When user goes Sim -> Home -> Sim - onDeactivated, onActivated (resume). Good.

Potential issue: User opens app on Home first, then goes to Sim - first time Sim: onMounted, onActivated skip. Good.

Done.

--------

Answer:

Here’s what was implemented:

### 1. **`App.vue` — `<keep-alive include="SimView">`**
- Uses the **router-view v-slot** pattern so only **`SimView`** is cached when you leave **`/sim`**.
- **`HomeView`** is not in `include`, so it still mounts fresh when you open Home.

### 2. **`simRuntime.js` — suspend vs destroy**
- **`suspendForRouteLeave()`** (used when leaving **`/sim`**):
  - **`cancelAnimationLoop()`**
  - **`detachCanvasPointerListeners()`** / **`detachDocumentListeners()`** (with flags so we don’t double-remove)
  - If **`store.sceneIsPlaying === true`**, sets **`sceneIsPlaying = false`** and **`sceneIsPaused = true`** (same as pausing while staying on the page).
  - Does **not** clear the canvas/context, **does not** tear down the HUD, **does not** set **`destroyed`**.
- **`resumeAfterRouteEnter()`** (when coming back to **`/sim`**):
  - **`attachCanvasPointerListeners()`** and **`attachDocumentListeners()`** again.
  - **`tickLiveHud()`**
- **`attachCanvas`** / **`attachDocumentListeners`** refactored so pointer listeners can be detached and reattached; **`destroy()`** uses the same detach helpers.
- **`stopSimRuntime` / `destroy`** still does a **full** teardown (for real unmount).

### 3. **`SimView.vue` lifecycle**
- **`onDeactivated`** → **`sim.suspendForRouteLeave()`**
- **`onActivated`** → **`sim.resumeAfterRouteEnter()`**, except the **first** activation (right after the first **`onMounted`**) so we don’t attach listeners twice.
- **`onBeforeUnmount`** → **`sim.stopSimRuntime()`** (cache eviction, app teardown, etc.)

### Behaviour
- **Sim → Home while playing:** rAF stops, input is detached, sim is **paused**; agents/scene stay in memory.
- **Home → Sim again:** listeners return; UI still shows **unpause** / **play** according to **`store`**; user can continue as before.
- **Sim → Home while already paused (or edit-only):** only rAF + listeners stop; we don’t flip you into “paused” if you weren’t playing.

Lint and build both pass.


-------------

That's great. One question: what is "isFirstActivation" needed for here? 

-------------

The user is asking about the isFirstActivation ref pattern in SimView.vue that I implemented for the keep-alive flow. I should explain clearly why it's needed without using tools - this is a conceptual answer.

The reason: When a component is wrapped in <keep-alive>, Vue runs both onMounted and onActivated the first time the component enters the tree. So the sequence is:

User navigates to /sim for the first time
onMounted runs - we call attachCanvas, attachDocumentListeners (which attach the listeners)
onActivated also runs immediately after (first activation)
If we called resumeAfterRouteEnter() unconditionally in onActivated, we would try to attachCanvasPointerListeners() and attachDocumentListeners() again
Actually attachCanvasPointerListeners has a guard: if (!canvas || canvasPointerListenersAttached) return - so after onMounted's attachCanvas which calls attachCanvasPointerListeners, canvasPointerListenersAttached is true, so resumeAfterRouteEnter would not double-attach canvas listeners.

For attachDocumentListeners: it has if (documentListenerAttached) return - after onMounted, documentListenerAttached is true, so resume would skip - no double attach.

So actually isFirstActivation might be redundant given the guards in simRuntime!

Let me verify:

First visit: onMounted attaches canvas + listeners (both flags true). onActivated calls resumeAfterRouteEnter - attachCanvasPointerListeners sees canvasPointerListenersAttached true, returns. attachDocumentListeners sees documentListenerAttached true, returns. No harm - just redundant tickLiveHud().
So isFirstActivation could be removed - resumeAfterRouteEnter would be a no-op on first activation except tickLiveHud() which runs twice (once at end of onMounted hud.update(), once in resume) - minor duplicate.

The user asked what it's needed for - I should explain the original intent (avoid double listener attachment / redundant work) and honestly note that the runtime guards already prevent double attachment, so isFirstActivation is partly defensive/redundant and could be removed if they prefer simpler code, with at most an extra tickLiveHud() on first load.

I'll give a clear, accurate answer.

-------

Answer:
`isFirstActivation` was there to handle a **keep-alive quirk**: the first time `SimView` is shown, Vue runs **`onMounted` and then `onActivated`** in that order.

The idea was: **don’t treat that first `onActivated` like a “return from Home”** — full setup already happened in `onMounted`, so we shouldn’t run the same “resume” path again.

In your current code, **`resumeAfterRouteEnter()` is already safe on that first activation**: `attachCanvasPointerListeners` and `attachDocumentListeners` both bail out if listeners are already attached (`canvasPointerListenersAttached` / `documentListenerAttached`). So you **don’t strictly need** `isFirstActivation` to avoid duplicate listeners.

What you’d get without it is at most an **extra `tickLiveHud()`** right after mount (on top of `hud.update()` in `onMounted`) — harmless.

**Summary:** `isFirstActivation` documents intent (“first activation ≠ coming back from another route”) and skips one redundant resume pass; it’s **not required for correctness** given the guards in `simRuntime`. You can delete it and always call `resumeAfterRouteEnter()` from `onActivated` if you want less state in `SimView`.

----------

Great, and a general Vue question here: what is keep-alive?

----------

Thinking:
The user wants a general explanation of Vue's keep-alive component. This is a conceptual/educational question - no code changes needed unless they ask. I'll explain clearly: what it does, when to use it, relationship to router, caveats.

Answer:
**`<keep-alive>`** is a built-in **wrapper component** that tells Vue: **don’t destroy** a child component when it’s no longer rendered—**cache it in memory** instead.

### What changes without vs with keep-alive

- **Without:** When you navigate away (or `v-if` becomes false), the child is **torn down** (`onBeforeUnmount` / `unmounted`), its DOM is removed, and local state is lost.
- **With:** When the child is **hidden**, Vue **deactivates** it: DOM is taken out of the tree (or hidden in a way that doesn’t patch it), but the **instance, state, and (for your case) canvas + sim setup stay alive**. When you show it again, Vue **reactivates** it (`onActivated`) instead of running a full **mount** from scratch.

### Lifecycle hooks it adds

For cached components you get:

- **`onActivated`** — component is shown again (including the **first** time it enters the cache, right after `onMounted`).
- **`onDeactivated`** — component is hidden but **not** destroyed.

True destroy only happens when the cache drops the instance (e.g. `include`/`exclude` changes, cache limit, or app teardown), then you get **`onBeforeUnmount` / `unmounted`**.

### Common uses

- **Tabs** or **wizards** where you want form state preserved when switching tabs.
- **Vue Router** + **`<router-view>`**: cache specific routes (like your **SimView**) so leaving the route doesn’t reset everything.

### `include` / `exclude`

You can limit which **named** components are cached, e.g. `include="SimView"` so only that route component is kept; others mount/unmount normally.

### Trade-offs

- **Memory:** Cached components stay in RAM (DOM + JS state).
- **Side effects:** Timers, listeners, and **`requestAnimationFrame`** don’t stop automatically—you handle them in **`onDeactivated` / `onActivated`** (as you did with suspend/resume).

So in one line: **`<keep-alive>` is Vue’s “stash this component instance while it’s off-screen” primitive.**





---------

Answer:
Implementing keep-alive for SimView and splitting teardown into "pause + detach listeners" vs full destroy. Reading simRuntime.js lifecycle methods.

Implementing keep-alive for SimView, adding suspendForRouteLeave / resumeAfterRouteEnter with listener detach/reattach, and skipping the first onActivated so we don't double-attach listeners.