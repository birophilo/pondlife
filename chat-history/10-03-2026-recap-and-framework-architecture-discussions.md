Hello, this repo is called Pondlife. It is a browser-based simulation platform - what currently exists is an early prototype. The canvas element is the arena for simulations to take place. Currently these are 2d sprites. The platform allows users to create their own types of agents with their own properties, create custom actions for them, chain these actions together, transition from one action to another using completion criteria and so on. The user can create many instances of agents and place them onto the board, then run them as a scene. The platform currently supports state machine and utility systems for decision making.

The app is written in Vue.js. I have not done any work on it for a while but I am coming back to it to resume. There will probably be lots of scope for refactoring and redesigning, including perhaps changing the choice of Javascript framework and other tools. The refactoring is for later. Right now I want your opinion on Javascript framework choice. If you look at the main App.vue file, you'll see the canvas element that is the place where all simulations are animated and visualised. Around it are a number of forms for setting up the scene as well as metrics around the agents in the scene. This part will expand in future - the user can create aggregations and analysis of data about the agents, and these data metrics/visualisations will change live as the agent state in the scene changes. All agents are essentially Javascript nested key-value objects, where the key-values contain the agents' state. The same goes for other entities in this simulation: agent types, conditions, actions etc. Each entity type has its own handler - a class that contains a number of pre-defined stateless functions on the objects. The entity objects and their instances are stored in a MongoDB database, so that scenes of agents with configured actions can be created and saved, then loaded from the database and run.

This introduction is to describe the particular requirements of our software. We have large numbers of Javascript objects (nested key-values) embodying our simulation agents and rules; a frame-based canvas animation element which updates quickly and changes a lot of state between each frame. We also have HTML elements with CSS that reflect different aspects of the state of the simulation, including HTML elements that can be used to alter the simulation while it is running.

It is important that we maintain a good frame rate for our animations. The app is at a fairly early stage of development, but it has already suffered an occasion where frame rate was impeded and made too slow: this was when I added Vue Router. I removed Vue Router for the time being and the whole app is currently contained within a single URL. This is just one example - there were a couple of others. So my question centres on the virtual DOM. I understand that virtual DOM Javascript frameworks come with an overhead cost. I am thinking of switching to Svelte, which does not use a Virtual DOM. I anticipate that the pre-compiled approach of Svelte will be more compatible and performant for the needs of this web platform. I would like your opinion on Vue.js (and other virtualDOM frameworks e.g. React) for this software requirement versus Svelte - in particular expected suitability when dealing with very large and quick state updates. I would also like your opinion on other Javascript frameworks that you think might be suitable candidates here, whether those that are pre-compiled like Svelte or any other design approach. Thanks.

-----------------------------


Here’s a concise opinion based on your codebase and requirements.

---

## 1. What’s actually hurting you

In `animate()` you do this every frame:

- `store.hover = null` / `store.hover = true` (multiple times)
- `store.GlobalSettings.animationFrameId = frameId`

The template uses `store.GlobalSettings.globalSpeed` (speed display and slider). Mutating `store.GlobalSettings.animationFrameId` each frame means Vue’s reactivity sees `GlobalSettings` as changed every frame. So anything that depends on `store.GlobalSettings` (and possibly the whole App if the dependency is broad) can re-run or re-render 60 times per second. The canvas is imperative and doesn’t need that; the surrounding UI doesn’t need to react to `animationFrameId` or `hover` at 60 Hz.

So the issue isn’t “Vue is slow” in the abstract—it’s that the **animation hot path is writing to reactive store state every frame**, which forces the framework to do work (dependency tracking, re-renders, and in a vdom world, diffing) on every tick. Vue Router made it worse by adding more reactive surface and work. Your instinct to question the framework choice for “large and quick state updates” is right.

---

## 2. Virtual DOM (Vue, React) vs your use case

- **Virtual DOM** means: when reactive state changes, the framework re-runs render, builds a new vdom tree, diffs it to the previous one, then patches the DOM. Cost scales with “how much of the tree might have changed” and how many components read that state.
- In your app, the **canvas is already outside that model** (you draw with the 2D context every frame). The problem is the **UI around it**: lots of `store.*` in the template and many components. So when you touch the store every frame, you risk:
  - Re-running render for App and children
  - Diffing a large tree
  - Extra GC from vdom objects every frame

So for “very large and quick state updates” (or even a few reactive writes per frame), **virtual DOM is a poor fit** for the part of the app that’s on the hot path. It can be made to work only by **keeping the hot path out of reactive state** (see “Quick win” below).

---

## 3. Vue / React vs Svelte for this

- **Vue (current)**  
  - Same vdom story as above.  
  - Easiest path: stay on Vue and **stop writing to reactive store inside the rAF loop** for things that don’t need to drive the UI (e.g. `animationFrameId`, or `hover` if you keep setting cursor imperatively).  
  - If you later drive many live metrics from high-frequency state (e.g. many panels updating every frame), you’ll have to be very careful what’s reactive.

- **React**  
  - Same idea: vdom + diffing. Same risk if you put frame id or per-frame state in React state.  
  - You’d have to isolate the loop (refs, or state outside React) and only push into React state at low frequency (e.g. throttled metrics). No inherent advantage over Vue for your scenario.

- **Svelte**  
  - **No virtual DOM.** Compiles to direct DOM updates. Only the specific bindings that depend on a changed value update.  
  - So when you do `store.hover = true` or `animationFrameId = frameId`, only the few elements that actually use those in the template update—no full tree diff.  
  - Smaller runtime, less work per update.  
  - **Fits your requirements well**: lots of nested objects, frame-based loop, and future “metrics/visualisations that change live with agent state.” You can still throttle updates (e.g. update a “current frame” display every N frames), but the cost of each update is much more predictable and smaller than vdom.  
  - Migration from Vue is moderate: Pinia → Svelte stores, templates and components are different but the “handler + nested objects” and canvas logic can move over with limited changes.

**Conclusion:** For “large, fast state updates” and live-updating UI around a canvas, **Svelte is a better fit than Vue or React** because it avoids vdom and compiles to targeted DOM updates.

---

## 4. Other framework options

- **Solid.js**  
  - **Fine-grained reactivity**, no vdom. Only the exact DOM nodes that subscribe to a given signal update when that signal changes.  
  - Very well suited to high-frequency updates and many live metrics: you can have a lot of reactive values that change often without re-rendering whole trees.  
  - Arguably a better fit than Svelte if you expect **many** live panels/charts that depend on different slices of agent state; Svelte is still “component-level” reactivity, Solid is “expression-level.”  
  - Steeper learning curve than Svelte (explicit signals, no “just assign and it updates”), but worth considering if you want to maximise performance and clarity of “what updates when.”

- **Lit**  
  - No vdom, small, web components. You’d wire your own state (e.g. a small store) and update the DOM in response.  
  - Good if you want minimal framework and full control; more manual work for forms and nested UI than Svelte/Solid.

- **Vanilla JS + a small store**  
  - For a canvas-centric app, you could use a tiny store (e.g. nanostores, zustand) and update the DOM only where needed (e.g. one function that updates “day”, “speed”, “selected agent” elements).  
  - No framework reactivity on the hot path; you decide exactly what to update and when. Maximum control, more boilerplate for complex forms.

---

## 5. Recommendation

- **Short term (before any migration):**  
  - **Stop writing to reactive store every frame** for things that don’t need to drive the UI.  
  - In particular: **don’t set `store.GlobalSettings.animationFrameId` in the rAF loop** unless you have a visible debug display that needs it. If you need it only for logic, keep it in a plain variable or a `ref` that you don’t use in the template.  
  - Keep `store.hover` for cursor logic only and set `canvas.style.cursor` imperatively; if nothing in the template reads `store.hover`, consider not putting it in the store at all (e.g. a module-level variable or a ref that’s not used in the template).  
  That alone can remove most of the “60 updates per second” pressure on Vue’s reactivity and often restores frame rate without changing frameworks.

- **If you’re open to a framework change:**  
  - **Svelte** is a strong choice: no vdom, small bundle, predictable performance, and a good match for “nested objects + canvas + live metrics.”  
  - **Solid** is an even better fit if you expect many fine-grained, high-frequency updates (e.g. many live charts/panels) and are happy to adopt signals.

- **If you stay on Vue:**  
  - Treat the rule “the rAF loop must not write to reactive state except for values that are intentionally shown in the UI at high frequency” as non-negotiable.  
  - For future live metrics, prefer throttled or batched updates (e.g. update “current agent state” or chart data every 100 ms or every N frames), and keep the store shape so that only the metrics components depend on those values, not the whole tree.

If you want, the next step can be a concrete patch for `App.vue` and the store: where to remove or move `animationFrameId` and `hover` so the animate loop no longer touches reactive state every frame.

---------------------

14/3/2026

This is all very interesting and useful, thanks! I am coming back to this project after nearly a year away and need to refresh my memory on all of the implementation details and reasons for the choices I made.

As you point out, the app state/agent state used by the canvas is maintained outside of the Vue data store for the most part, and this was a deliberate choice carefully maintained. But there seem to be a couple of instances (GlobalSettings.animationFrameId and the setting cursor to pointer or not based on whether it hovers over an agent or not) where I didn't or couldn't find a way to keep this separation, or even just took a shortcut to get things working.

I'd like to think through some framework/architectural choice before addressing the more immediate fixes suggested.

I like the idea of using signals for a more targeted and minimal way of updating the DOM. I have used the pub-sub pattern before with MQTT, with multiple programs can communicating on message channels as producers and consumers, and also Godot's signals. In theory signals are more intuitive than a reactive VDOM.

I have just researched a little bit about solid.js. Apparently Solid has inspired a redesign of Vue.js itself, and a new version 3.6 of Vue enables "vapor", which completely rewrites Vue under the hood to use signals, and that performance is similar to Solid. Perhaps I could even keep using Vue but switch to using Vue with signals instead? I also wonder about the possibility of writing a simple signals-based implementation (or other minimal reactive store) from scratch. What does Solid.js offer that a minimal hand-made implementation of signals with event listeners would not?

Could you offer a comparison of the feasibility/pros and cons of: 1. Solid.js, 2. Vue with vapor, and 3. minimal signals implementation from scratch.

-------------------


Here’s the comparison again, with the Solid.js details folded in.

---

## 1. Solid.js

**What it gives you beyond “signals + listeners”:**

- **Automatic dependency tracking**  
  You read signals inside effects/memos; Solid registers those as subscribers. No manual dependency arrays. Your “hand-made” version would need a global “current effect” and to register every signal read during that effect’s run—doable, but easy to get wrong (nested effects, cleanup, batching).

- **Compiled JSX**  
  JSX is compiled to real DOM nodes plus small effect wrappers so only the expressions that use a signal re-run. So you get “this text node updates when this signal changes” without writing `element.textContent = signal()` yourself everywhere.

- **Batching**  
  Multiple signal writes in the same tick trigger one pass of updates, not N.

- **Control flow**  
  `<Show>`, `<For>` etc. are built to create/destroy DOM and subscribe only to the right slice of state, so list and conditional updates are efficient and correct.

- **Ecosystem**  
  Router, SSR, starter templates, and a known pattern for stores (signals + nested objects).

**Feasibility for you:**  
You’d be rewriting Vue SFCs to Solid (JSX/TSX, `createSignal`, `createEffect`, `onCleanup`). Your canvas and handler/class code can move over with little change. Moderate one-off cost, then a clean fit for high-frequency updates.

**Pros:** Mature, fine-grained updates, no vDOM, matches your “targeted updates” goal.  
**Cons:** Different syntax and mental model from Vue; need to embrace JSX and explicit signals.

---

## 2. Vue with Vapor (Vue 3.6+)

**What it is:**  
Vapor is a new *compilation* mode: the same Vue SFCs and template syntax compile to direct DOM updates (no virtual DOM), with a signals-style reactivity under the hood (“Alien Signals”). Same Vue API you use today; the compiler and runtime change.

**Status:**  
Previewed for Vue 3.6; Vapor had compatibility/scheduling slips and is often cited as targeting a stable story around **early 2026**. You can try it on the `vapor` branch, but it’s not yet the default production path.

**Feasibility for you:**  
If/when Vapor is stable, the idea is **opt-in and backward compatible**: same codebase, enable Vapor mode and get better performance. So in theory you could “keep Vue and switch to Vue with signals” without a full rewrite.

**Pros:** Stay in Vue, same templates and Pinia-style store; no rewrite; performance closer to Solid when Vapor is on.  
**Cons:** Not production-ready yet; timeline and compatibility guarantees are still in flux; you’re waiting rather than solving the problem today.

---

## 3. Minimal signals implementation from scratch

**What a minimal version is:**  
A small core: “signal” = value + list of listener functions; “effect” = run a function once, and while it runs, record every signal.get() and add this function to those signals’ listeners; on signal.set(), call all listeners. Optional: “memo” = signal + effect that writes into it. That’s enough for pub-sub style, dependency-tracked updates.

**What you’d still have to do yourself:**

- **Wiring to the DOM**  
  Solid compiles JSX to “run this effect, and when it runs, set this DOM node’s textContent/attribute/class.” With a minimal signals lib you’d write that by hand: e.g. `createEffect(() => { el.textContent = count(); })` for every place the UI depends on state. More boilerplate and more chances to miss a dependency.

- **Lifecycle and cleanup**  
  When a “component” or view is torn down, you must unsubscribe effects from signals (and avoid stale closures). Solid’s `onCleanup` and component tree handle this; you’d design your own convention.

- **Batching**  
  Multiple sets in one tick → one update pass. You can implement a simple batch (e.g. microtask or requestAnimationFrame) so you don’t get N re-runs per frame.

- **Lists and conditionals**  
  “Re-render this list when this signal changes” and “mount/unmount this block” need careful design (keying, re-use, subscriptions). Solid’s `<For>` / `<Show>` encode that; you’d build your own or accept coarse-grained updates.

**What you gain:**  
No framework; full control; tiny runtime; you can keep the canvas and all “hot path” state outside the signal system and only use signals for the UI bits that need to react (e.g. day number, speed, selected agent). Fits your existing “keep simulation state outside the framework” approach.

**Pros:** Small, no new framework, aligns with your MQTT/Godot mental model; hot path can stay non-reactive.  
**Cons:** You own correctness (dependency tracking, cleanup, batching) and all DOM wiring; more custom code and time.

---

## Summary

|                     | Solid.js              | Vue + Vapor           | Hand-made signals      |
|---------------------|----------------------|------------------------|-------------------------|
| **Effort now**      | Rewrite to Solid     | Wait / try vapor branch| Build small core + wire DOM |
| **Targeted updates**| Yes (compiled)       | Yes (when Vapor on)   | Yes (if you wire it)   |
| **Risk**            | New stack            | Timeline/compatibility| Your implementation     |
| **Fit for Pondlife**| Strong               | Strong (when ready)   | Strong (max control)   |

**Practical suggestion:**  
- If you want **targeted, signal-style updates soon** and are okay leaving Vue: **Solid** is the most direct.  
- If you prefer **staying in Vue** and can afford to wait and/or experiment: keep the **immediate fixes** (no store writes on the rAF loop), then **revisit Vue + Vapor** in 2026.  
- If you **like minimalism and control** and are happy to own a tiny reactive layer: a **small signals core** plus manual DOM updates for the few UI bindings (day, speed, selected agent, cursor) is feasible and matches your architecture; the main cost is your time to implement and maintain it.

I can sketch a minimal signal + effect API and how you’d use it in one small part of `App.vue` (e.g. day number and speed) so you can judge the “from scratch” path concretely.

------------------------------

I'm also thinking about the considerations of using a JS framework in conjunction with canvas animation and state but also a JS framework for the single-page-app (SPA) approach to the website in general. This is a web app that will have all of the regular state and routing of a normal web application: user authentication and login, navigation, holding various fetched boilerplate data in memory and displaying it on the page (anything like blog post links, fetched footer details, notifications, you get the idea).

It is important to me that the simulation arena is, and feels like, a native web application, with access to web standards and technologies like CSS and text rendering - part of the normal screen window of a website rather than everything taking place in a pop-up box like a typical webAssembly export, for example (e.g. Godot), which inevitably has pixelly or inferior anti-aliased font rendering and so on, and feels "computer gamey". Is it realistic to rely on a single Javascript framework or library to handle both jobs (general web UI and simulation), even with minimal use of the store? Does a signals-based approach (or careful refactoring) reduce the pitfalls of this?  Tell me more about the possibility of "nanostores" here (I have used Zustand before). Could a separate store be used for canvas/simulation state? The problem is I need some HTML elements to update with simulation state (form inputs, charts etc). Would there be any benefits to using two different frameworks/libraries for simulation state and general UI (and is this even feasible)? Or do signals and/or vigilance over the "hot path" provide a sane enough approach here?

---------------------------


Here’s a concise way to think about it and how nanostores fit in.

---

## One framework for both “web app” and “simulation”

**Yes, it’s realistic** to use a single JS framework for:

- **General SPA**: auth, routing, nav, fetched data (blog links, footer, notifications), normal pages.
- **Simulation arena**: canvas + the HTML that reflects simulation state (forms, charts, metrics).

The important split is **by state and update frequency**, not by framework:

- **“Human” state**: user, session, route, fetched boilerplate. Updates rarely.
- **“Simulation” state**: scene, agents, play/pause, selected agent, day, speed, data for charts. Some of this updates often (or could), and **some of it** is read by HTML.

So one framework is fine as long as:

1. The **hot path** (rAF, agent updates, canvas draw) does **not** write into reactive state every frame, **or**
2. The reactive layer is **fine-grained** (e.g. signals) so only the few nodes that show “day”, “speed”, “selected agent”, chart data, etc. update.

Signals (or careful refactoring) don’t remove the need for that discipline; they make it **safe** to have a few simulation values in reactive state because only those bindings re-run, not the whole tree. So: **one framework can handle both jobs**, and signals + hot-path care are a sane approach.

---

## Native “web app” feel (canvas in the page)

The “native web app” feel (CSS, good text, canvas as part of the normal layout, not a pixelly game box) is about **how you use the platform**:

- One document, normal layout (header, nav, main, footer).
- Canvas is one element in the DOM; text and UI are real HTML/CSS (fonts, anti-aliasing).
- No need for a second framework. One framework is enough to render the shell and the “simulation” section; the canvas is just a `<canvas>` that you draw into from JS.

So you don’t need two frameworks to get that feel; you need one app, good layout, and the simulation area as a first-class part of the page.

---

## Separate store for canvas/simulation state

Using a **separate store (or store namespace) for simulation** is a good idea:

- **App store**: user, auth, route, fetched boilerplate (blog links, footer, notifications). “Website” state.
- **Simulation store**: scene, agents, play/pause, selected agent, day number, speed, data for charts. “Arena” state.

The catch you already see: **some HTML must update from simulation state** (form inputs, charts). So:

- The simulation store is still **reactive** from the framework’s point of view: when “selected agent” or “day number” or “chart series” changes, the framework has to update the DOM.
- The gain is **isolation**: the hot path (rAF loop) does **not** write into this store every frame. It only writes:
  - **Low-frequency** simulation state (e.g. “selected agent” on click, “day” on day boundary, “play/pause” on button), and/or
  - **Throttled/batched** values if you ever need “live” metrics (e.g. update a “current value” atom every 100 ms, not every frame).

So: **two stores (app vs simulation) = good**. Same framework can subscribe to both. No need for two frameworks.

---

## Nanostores (and how they compare to Zustand)

**Nanostores** are tiny, framework-agnostic atoms:

- `atom(value)`, `atom.get()`, `atom.set(value)`.
- You can subscribe: `atom.subscribe(callback)` or use a framework adapter (`@nanostores/vue`, `@nanostores/solid`) so components re-render when the atom changes.

They give you:

- **One store for “app” and one for “simulation”** (or namespaced atoms): e.g. `user`, `route`, `blogPosts` vs `scene`, `selectedAgent`, `dayNumber`, `chartData`.
- **No framework lock-in**: same atoms work with Vue, Solid, or vanilla; if you switch the view layer later, you keep the stores.
- **Small surface area**: no actions, no devtools by default; you just read/set and subscribe.

They do **not** change the performance rule: if you `atom.set()` 60 times per second and a Vue component subscribes to that atom, you still get 60 updates. So:

- Use nanostores to **hold** simulation state that the UI needs.
- Keep the **hot path** from calling `atom.set()` every frame; only set when something meaningful changes (user click, day rollover) or via a throttled/batched update for live metrics.

**Vs Zustand:**  
Zustand is a single store (one object); you select slices and the view re-renders when those slices change. Nanostores are many small atoms; you subscribe per value. Both can hold “app” and “simulation” state; nanostores make it very explicit which bits of state are “live” and can be easier to throttle (e.g. one atom for “chart data” updated every N ms). For your setup, **nanostores are a good fit** if you want a minimal, framework-agnostic store and are happy with an atom-per-concern (or a few atoms for simulation).

---

## Two different frameworks for simulation vs UI?

**Possible but not recommended** here:

- You’d have two roots, two runtimes, two mental models.
- The simulation **must** drive some HTML (forms, charts). So either:
  - That HTML lives in the “simulation” framework → you maintain two full stacks and the simulation framework still does reactive updates from simulation state, or
  - That HTML lives in the “main” framework and reads simulation state via a bridge (shared store, events, postMessage) → the main framework still reacts to simulation state; you’ve added a bridge and complexity without removing the need for careful updates.

So **two frameworks don’t really help**. What helps is:

- **One framework** with clear separation of state (app vs simulation stores).
- **Hot path discipline**: rAF loop doesn’t write to reactive state every frame.
- **Signals or fine-grained reactivity** so the few simulation-driven UI bindings are cheap.

---

## Direct answers

- **Single framework for both general SPA and simulation?**  
  Yes. Use it for routing, auth, boilerplate data, and for the HTML that shows simulation state. Keep the canvas hot path off the reactive loop (or limit what it writes).

- **Does a signals-based approach (or refactoring) reduce pitfalls?**  
  Yes. Signals (or similar) let the few simulation-driven elements update without re-rendering the whole app; plus the same “don’t write every frame” rule.

- **Separate store for canvas/simulation state?**  
  Yes. E.g. “app” store (auth, nav, fetched data) and “simulation” store (scene, selected agent, day, speed, chart data). Some HTML will subscribe to simulation store; that’s fine as long as the hot path doesn’t write into it every frame.

- **Nanostores?**  
  Good fit: minimal, framework-agnostic, easy to have app vs simulation atoms and to throttle which atoms you update from the rAF loop.

- **Two frameworks for simulation vs UI?**  
  Feasible but not beneficial; you still need some HTML to react to simulation state, and one framework with two stores and hot-path care is simpler and enough.

- **Do signals + hot-path vigilance give a sane approach?**  
  Yes. One framework, app store + simulation store (e.g. nanostores), rAF only touches non-reactive or throttled state, and signals (or careful refactors) for the simulation-driven UI keep updates minimal and predictable.


  -----------------

  Thanks, that all makes a lot of sense. So far, one of the biggest performance hits I experienced was when I added Vue Router. It drastically slowed the animation frame rate, and i ended up just removing it (the app is currently a single URL endpoint with the effect of different 'screens' provided through modals - this was just an expedient solution while the app is a pre-launch work in progress). Could you talk me through how Vue Router interacts with Vue state in general and why a router could have a much bigger impact on reactivity than heavy but simple components? And would there be any benefits to rolling our own router? Other than refactoring our interaction between animation hot path and Vue state, are there any other things we could do to make a SPA router used here more smooth and performant?

  -----------------


Here’s how Vue Router can affect reactivity and frame rate, and what you can do about it (including a minimal custom router).

---

## How Vue Router interacts with Vue state (and why it can hurt FPS)

**1. Router adds reactive state and subscribers**

Vue Router injects reactive state that many parts of the app can touch:

- **`$route`** (or `useRoute()`) – current route object: `path`, `params`, `query`, `hash`, `name`, `matched` (array of route records), etc. It’s fully reactive.
- **`$router`** – methods and sometimes internal state.
- **History** – the router subscribes to `popstate` and updates `$route` on navigation.

So you get a **large, shared reactive object** (`$route`) that can be read by many components (layout, nav, breadcrumbs, `router-view`’s logic, etc.). Any of those components becomes a subscriber to `$route`.

**2. Why that can hurt more than “heavy but simple” components**

The issue usually isn’t route *changes* (they’re rare). It’s **what gets re-run when *other* state changes every frame**:

- Your **animation loop** was writing to the store every frame (`store.GlobalSettings.animationFrameId`, `store.hover`).
- That triggers Vue’s reactivity: “something the app depends on changed.”
- Vue re-runs render (or computed/effects) for any component that depends on that store state.
- If the **root or a layout** both:
  - read that store (e.g. for header, layout, or “current user”), and  
  - contain **`<router-view>`** (or router-related components),
then **every frame** you get:
  - Re-render of that parent (and possibly the whole tree under it).
  - Re-evaluation of `router-view`’s “which component to show” (even if the route didn’t change).
  - More work in the router’s internal logic and in any component that uses `$route` or `useRoute()`.

So the router doesn’t “run every frame” by itself; it **multiplies the cost of store updates** because:

- It adds **more reactive surface**: route object + all the components that read it.
- It puts **router-view** inside a tree that’s re-rendering every frame, so the router’s “what to show” and “reuse or remount” logic runs 60 times per second.
- **RouterLink**s and other router-aware components also read `$route` (e.g. for “active” class), so more subscribers and more work when *any* reactive dependency of that tree changes.

Heavy but simple components that **don’t** sit in the same dependency chain as the per-frame store updates only re-run when *their* props/state change. The router, by design, sits in the **top-level** tree and often shares that tree with layout/store, so it gets hit on every reactive tick. That’s why it can have a much bigger impact than a heavy component that’s only used on one screen.

**3. Mental model**

- **Without router:**  
  Store updates every frame → components that depend on that store re-run. You might have one big `App.vue`; if it reads the store, the whole app re-renders every frame.

- **With router:**  
  Same store updates → same re-runs, but now the tree contains router state + `router-view` + matched components. So you get “all the previous cost” **plus** router internals and every component that depends on `$route`. The **dependency graph** is bigger and more central, so the same mistake (writing to reactive store every frame) becomes much more expensive.

So: the root cause is still **reactive store updates every frame**; the router makes that cost much higher because it’s in the middle of the tree and adds a lot of reactive reads.

---

## Benefits of rolling your own router

For a pre-launch app with a few “screens” (arena, login, maybe settings) and the rest via modals, a **minimal custom router** can be a good fit:

**What you’d have:**

- One reactive value: e.g. `currentPath` or `currentScreen` (a string or enum).
- One listener: `popstate` → set `currentPath` from `window.location.pathname` (or your own convention).
- Navigation: `history.pushState` / `replaceState` + set `currentPath`, or just set `currentPath` if you don’t care about URL yet.
- In the root template: a single `v-if` / `v-show` or `<component :is="currentView">` driven only by `currentPath`.

**Benefits:**

- **Tiny reactive surface**: one primitive (string). No deep `$route` object, no `matched`, no RouterLink.
- **No extra components**: no `<router-view>`, no RouterLink; you control exactly which part of the tree depends on “current screen.”
- **Clear dependency chain**: only the root (or one layout) reads `currentPath` and switches views. The **simulation view** (canvas + panels) doesn’t need to read the route at all unless you want it to (e.g. “arena only when path is /”).
- **No guards or hooks** unless you add them yourself (e.g. “if not logged in, set currentPath to login”). So no surprise subscriptions from router internals.

**What you give up:**

- Nested routes, named routes, `params`/`query` as first-class API, lazy-loading helpers, scroll behavior, etc. You can add the bits you need (e.g. a simple “auth guard” that sets screen to login).

**Conclusion:** A small custom router reduces reactive surface and keeps the “which screen” logic in one place, which can make it much easier to keep the animation hot path and router logic from affecting each other. It’s a good option if you only need a few top-level views.

---

## Making an SPA router (Vue Router or custom) smooth and performant

**1. Fix the hot path first (necessary)**

- Stop writing to the store every frame (`animationFrameId`, `hover` in the rAF loop). Use a plain variable or a ref that the template doesn’t read, and set `canvas.style.cursor` directly.
- After that, **re-add Vue Router** and measure. Often the “router killed FPS” effect disappears, because the 60-updates-per-second trigger is gone.

**2. Isolate the simulation view from route reactivity**

- Structure so the **arena** (canvas + side panels) is a single component that:
  - Does **not** read `$route` (or your `currentPath`) in its template or in any computed that runs during the simulation.
- Only the **root or a thin layout** should read the route and decide “show arena vs login vs settings.” That way, route changes don’t force the simulation component to re-render, and more importantly, **per-frame store updates** (if any remain) don’t force the router layer to do work in a loop.

**3. If you keep Vue Router**

- **Single top-level `<router-view>`**: avoid nested `router-view`s so the router’s “what to show” is computed in one place.
- **Don’t read `$route` in the root/layout more than needed**: e.g. if you only need “are we on the arena?”, derive a boolean or a simple string and use that for `v-if` / `:is`, so you don’t depend on the whole `$route` object.
- **Lazy-load route components**: `component: () => import('./Arena.vue')` so the simulation isn’t in the same chunk as login/settings and the router’s initial tree is smaller.
- **Guards**: don’t read store state that changes every frame (e.g. animation state) in `beforeEach` / `afterEach`; guards run on navigation only, but if they pulled in the store, they could still add unnecessary coupling.

**4. If you use a custom router**

- Keep **one** reactive “current screen” (or path) and **one** place in the template that switches views. The simulation view should be a single component that receives props or uses a store that you **don’t** update from the rAF loop.
- If you ever need “route” and “simulation” in the same page (e.g. arena + URL for sharing), keep the URL as the source of truth for “screen” and have the simulation view ignore the route; only the shell reads the route.

**5. Optional: throttle or batch any remaining “simulation → UI” updates**

- If you later add live metrics that depend on simulation state, update them every N ms or every M frames, not every frame, and put only those throttled values in reactive state. That keeps the router (and the rest of the app) from being in a dependency chain that fires 60 times per second.

---

## Short summary

- **Why Vue Router hurt FPS:** It adds a big reactive object (`$route`) and puts `router-view` (and RouterLinks) in the same tree as your app. When you were writing to the store every frame, that whole tree re-ran every frame, so the router’s logic and all route-dependent components ran 60 times per second. The router amplified the cost of those store updates.
- **Custom router:** One reactive value (e.g. `currentPath`), one place that switches views. Much smaller reactive surface and no router internals; good fit for a few top-level screens.
- **What to do:** (1) Fix the hot path (no store writes every frame). (2) Re-test with Vue Router; it may be fine. (3) If you want minimalism and control, use a small custom router and keep the simulation view free of route dependencies. (4) Keep the simulation view out of the “route-dependent” subtree so neither route changes nor any remaining high-frequency updates drag in the router.