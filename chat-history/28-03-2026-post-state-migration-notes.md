One question: what is "isFirstActivation" needed for here?

-------------


`isFirstActivation` was there to handle a **keep-alive quirk**: the first time `SimView` is shown, Vue runs **`onMounted` and then `onActivated`** in that order.

The idea was: **don’t treat that first `onActivated` like a “return from Home”** — full setup already happened in `onMounted`, so we shouldn’t run the same “resume” path again.

In your current code, **`resumeAfterRouteEnter()` is already safe on that first activation**: `attachCanvasPointerListeners` and `attachDocumentListeners` both bail out if listeners are already attached (`canvasPointerListenersAttached` / `documentListenerAttached`). So you **don’t strictly need** `isFirstActivation` to avoid duplicate listeners.

What you’d get without it is at most an **extra `tickLiveHud()`** right after mount (on top of `hud.update()` in `onMounted`) — harmless.

**Summary:** `isFirstActivation` documents intent (“first activation ≠ coming back from another route”) and skips one redundant resume pass; it’s **not required for correctness** given the guards in `simRuntime`. You can delete it and always call `resumeAfterRouteEnter()` from `onActivated` if you want less state in `SimView`.

--------------

Great, and a general Vue question here: what is keep-alive?

-------------


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