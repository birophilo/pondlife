This is a little unintuitive and unintended UX at the moment. Although I still like the idea of not destroying the sim scene as soon as the user clicks off the screen, it is not behaving correctly. When I am playing scene A and go to "Simulations", and click on "load scene" for scene B, the agent state of scene A is still visible (also it doesn't really work properly - there are bugs, but we'll deal with those later). This is confusing. How about this: when a user clicks on "load scene A", then immediately destroy the current scene and reset/wipe all agents before loading and staging any new scene fixtures. Before we do this, can you give me a rundown of how scene state is currently handled when switching from one scene to another?

----------------


Here’s a concise rundown of **how scene state flows today** when you move between scenes (especially A → Simulations → load B).

## 1. Two “layers” of state

**Pinia (`mainStore`)** holds the authoritative **editor/sim data**: `sceneId`, `sceneName`, `sceneData`, `agentTypes`, `agentItems`, `actions`, `conditions`, menus (`itemMenu`, `deleteButton`, …), and playback flags (`sceneIsPlaying`, `sceneIsPaused`), etc.

**`createSimRuntime` (`simRuntime.js`)** holds **imperative** stuff: canvas `2d` context, rAF id, pointer handlers, and a reference to the **live HUD**. It reads/writes the **same store** during ticks and input.

## 2. Leaving the sim route (e.g. open “Simulations”)

`SimView` is under **`keep-alive`**, so the component instance (and `simRuntime`) **stay alive**.

**`onDeactivated` → `suspendForRouteLeave()`**:

- Cancels the animation loop and **detaches** canvas/document listeners.
- If the scene was **playing**, it sets **`sceneIsPlaying = false`** and **`sceneIsPaused = true`** (pause semantics, not a full teardown).

**Important:** It does **not** clear agents, actions, or canvas pixels. **Scene A’s Pinia state and last drawn frame stay in memory.**

## 3. Choosing another scene on the Simulations page

**`SimulationsView`** only **`router.push({ name: 'simulationDetail', params: { sceneId } })`**. It does **not** clear the store itself.

When **`SimView` becomes active again**, two paths can run (watch + `onActivated` both end up in **`syncRouteScene`**):

- If **`sceneId` in the URL ≠ `store.sceneId`**, we treat it as a **different** scene:
  - **`stopPlaybackForSceneChange()`** — cancel rAF (already stopped if you left via suspend).
  - **`loadSceneForSimulation({ id })`** which:
    - **`clearSceneFixtureState()`** — clears agent/types/actions/conditions/menus and related arrays (`clearAllData` + extra lists).
    - **`resetSimulationSessionState()`** — playback + selection UI reset.
    - **`fetchSceneData`** → **`GET /simulation/:id`** → sets **`sceneData`**, **`sceneId`**, etc.
    - Sets **`needsSimHydration = true`** on success.
  - **`hydrateSimIfNeeded()`** — **`loadAgentsAndFixtures()`** (sceneLoader), **`renderAgents('draw')`**, HUD tick, clears **`needsSimHydration`**.

So **B’s data** is supposed to replace **A’s** in the store, then the canvas is **redrawn** once in **`hydrateSimIfNeeded`**.

## 4. Why you still *see* scene A briefly (and why it feels wrong)

Roughly:

1. **Until** `hydrateSimIfNeeded` runs **`renderAgents('draw')`**, the **bitmap** is whatever was last drawn — almost always **A** after you paused and left.
2. Updates are **async** (`fetch` + Vue’s render cycle). There is a **window** where the UI still shows **A**’s agents in the sidebar/canvas even though you’ve already “chosen” B.
3. **keep-alive** means **no full destroy** of `SimView` / runtime between routes, so nothing **automatically** clears the canvas the instant you click “load” on the list; clearing happens **after** navigation + fetch + hydrate.

So your intuition matches the implementation: **we pause and keep A in memory on leave**, and **we only wipe + load B once we’re back on the sim route and `syncRouteScene` finishes its async work** — not at click time on Simulations.

## 5. Same scene vs different scene

- **Same** `sceneId` again: we **skip** refetch; **pause/play memory** can remain (by design from earlier requirements).
- **Different** `sceneId`: we **clear fixture state**, reset session UI, fetch B, hydrate — but **timing** is still “after navigation + async”, not “on click”.

---

That’s the current picture. Your proposed change — **on “load scene B” click, immediately tear down the current scene (store + canvas) before fetching/staging B** — would mean moving some of **`clearSceneFixtureState` / reset / blank canvas** (and possibly a **`sim` hook**) into **`SimulationsView`’s `onLoadScene`** (or a shared store action) **before** `router.push`, so users never sit on **A**’s visuals while B is loading. When you want that implemented, we can wire it that way step by step.

---------------------

Let's zoom out a bit: could you tell me: the imperativeHud is only using state fom the plain JS of the canvas, correct? But the scene data in the menu-content part of the frontend is loading things from the store (appStore), it seems. To be honest, I don't actually need a HUD overlay on the canvas, but let's keep it there for now. But if we use the Pinia store for selectedAgent etc, doesn't this mean we are not keeping things as imperative as we could/should? Shouldn't we be displaying the menu-content in a ref element and using plain JS state? Answer in chat, no code changes. 

--------------------


Here’s a tighter picture without changing any code.

### What `imperativeHud` actually uses
It’s **not** only “plain JS from the canvas.” In your setup it’s driven by a **snapshot function** (`getLiveHudSnapshot` in `SimView`) that reads **Pinia**: e.g. `store.selectedAgent`, `store.sceneIsPlaying` / `store.sceneIsPaused`, `store.dayNumber`, plus **`simPointer`** (plain module/object). The HUD DOM is updated **imperatively** (you append/update nodes yourself), but the **data** it shows is largely **the same reactive store** the Vue sidebar uses.

### What the “menu-content” / sidebar uses
The right-hand editor (`SimView` template + child components) is **Vue + Pinia**: forms, lists, `v-for` over `store.actions`, `store.selectedAgent`, etc. That’s **reactive** and **declarative** in the Vue sense.

### Are you “less imperative” because of Pinia for `selectedAgent`?
**Imperative vs declarative** here is really about **who owns the DOM updates**, not only where the state lives.

- **Canvas + HUD**: you already use **imperative DOM/canvas** updates (rAF, manual HUD refresh).
- **Sidebar**: Vue **declaratively** binds templates to state; Pinia is just the **single source of truth** that both Vue and your snapshot can read.

Using Pinia for `selectedAgent` does **not** force the canvas loop to be reactive; the sim still mutates **markRaw** agents and avoids per-frame Vue writes by design (as your store comments describe). Pinia is the **shell** for “what the editor cares about,” not the per-frame hot path.

### “Shouldn’t menu-content be a `ref` + plain JS state?”
You *could* mirror sidebar state in plain objects and imperatively update a container — that’s how some game UIs work. **Tradeoffs:**

- **Pros of plain JS + imperative DOM for menus:** one mental model with the canvas; no Vue re-render coupling when the store churns during scene switches; potentially easier to reason about ordering with rAF.
- **Cons:** you reimplement what Vue gives you for free: components, forms, `v-model`, lists, validation, accessibility, and keeping the DOM in sync when data changes. Your app is already **editor-heavy**; that’s a lot of UI to hand-roll.

So it’s not that Pinia is “wrong” for imperativeness of the **simulation core**; it’s a **boundary choice**: Pinia is a reasonable **authoring/UI state** layer, while the **tick loop** stays imperative and mostly off the reactive graph.

### Practical takeaway
- **HUD overlay:** even if you don’t need it, keeping it fed from the same snapshot/store is consistent: small, read-mostly panel.
- **Not fully “imperative everywhere”:** true — the **editor chrome** is Vue+Pinia by design; the **sim hot path** is the part you kept imperative. That’s a normal split (game loop vs tools UI).
- **If** you ever want **maximum decoupling** during scene switches, the lever is usually **when** you read/update UI state and **how** you scope updates — not necessarily throwing away Pinia for the whole sidebar.

So: **HUD is imperative DOM, not imperative-only data; menu-content is store-driven Vue; that mix is coherent** as long as you’re clear that Pinia is the **editor shell**, not the per-frame sim state writer. Moving the whole menu to plain JS would be a large product/engineering trade, not a requirement for “correct” imperativeness of the canvas runtime.

-------------------

Let's look at the menu section again: currently I think most of the components that make up these forms are simply loading from the database. As scene agents operate in memory (without user input) and not in API CRUD operations to the database, these CRUD forms are independent of live in-progress simulation state, right? It's only the top section with selected agent, current action etc which is tracking live scene state, and this is just the same information as in the imperative HUD. So the only difference between the HUD and the top part of the menu-content is positioning on the screen, as I see it. That's why I think this part of the menu-content div could be made imperative with no great inconvenience elsewhere. Is that assessment valid?

-------------------

Your picture is **partly right**, but a couple of details matter so you don’t underestimate what’s “live” vs “definition”.

### What’s mostly **definition / CRUD** (loaded from the API, edited as documents)
Things like **agent types**, **actions** (as templates), **conditions**, **sprites**, **animation sets**, **agent property definitions**, **sensors**, **utility functions**, **recurring changes**, etc. are backed by **scene data you fetched** and often **saved back** with `saveScene` / `update*` calls. They are **not** the same thing as “this frame’s agent positions,” though they **constrain** what the sim can do.

Those panels are **loosely coupled** to the tick loop: they don’t need to update every frame, but they **do** read/write the **same Pinia store** that `sceneLoader` filled, so they’re not a separate database view—they’re **in-memory editors** for scene content.

### What’s **live simulation / selection** (same family as the HUD)
Anything bound to **`store.selectedAgent`**, **`store.selectedAgent.stateData`**, **`store.agentItems`**, or actions that **mutate agents** (e.g. **Start action** / **cloneAction**) is tied to **runtime objects** the sim updates (your `markRaw` agents, etc.). That is **not** “just DB CRUD”; it’s **the same in-memory graph** the canvas uses.

So it’s **not** only the **top “Selected agent”** block that tracks live state—the **Properties** block (when an agent is selected) and **Start action** are obvious examples too.

### HUD vs the **top** menu block
For the **narrow** strip that shows **who is selected + current action / sequence names + day / mode**, your assessment is **fair**: that’s **the same kind of information** the imperative HUD already surfaces, so **duplication is mostly layout**, not a different source of truth.

Making **that** block imperative (same pattern as the HUD: snapshot + manual DOM updates) is **reasonable** and **localized**—as long as you’re clear you’re only replacing **that summary**, not claiming the **whole** sidebar is HUD-equivalent.

### Bottom line
- **Valid:** For the **summary header** of selection + current action info, imperative vs Vue is **mostly a presentation choice**; data can still come from the same reads you already use in `getLiveHudSnapshot`.
- **Overbroad:** Saying **all** menu forms are “independent of live sim state” isn’t true—anything touching **selected agent** or **per-agent state** is **live**.
- **Valid:** The **definition** forms are **not** per-frame CRUD to the DB during play; they’re **editors** over loaded scene data, while the sim runs on **instances** in memory.

So: **yes, your assessment holds for the specific “status strip” you’re eyeing; no, it doesn’t extend to the entire menu-content without checking each section.**

-----------------

Just to clarify: is all of our sceneData that is used in the canvas rAF loop kept outside Pinia now? Or in Pinia but marked to prevent it triggering re-renders when data changes i.e. no reactivity?

-----------------


**Neither “all outside Pinia” nor “all non‑reactive.”** It’s a mix on purpose.

### Where rAF reads from
The canvas loop (`simRuntime` / `sceneLoader` / actions) still uses **`store` (Pinia)** as the place those structures live: `agentItems`, `agentTypes`, `actions`, `conditions`, playback flags, etc. There isn’t a separate parallel heap outside Pinia for “canvas-only” scene data.

### What’s deliberately **non‑reactive** for the hot path
- **Agent instances** — `createAgentObject()` returns **`markRaw(...)`** (`Agent.js`). They sit **inside** `store.agentItems[...]`, but Vue **does not** deep-proxy them, so normal rAF mutations (position, `stateData`, action progress, etc.) **don’t** trigger reactive updates.
- **Canvas UI chrome** used every frame — **`itemMenu`**, **`deleteButton`**, **`agentMenuButtons`**, **`agentPreview`** are **`markRaw`** when attached in `sceneLoader` / `simRuntime`.
- **`simPointer`** — plain object in a module, **not** in Pinia.

### What can still be reactive
Containers and **definition** data (arrays/objects of actions, conditions, agent type records, etc.) are still **Pinia state** and can be reactive when you **replace** them or edit them from Vue. The design goal was to keep **per-frame mutation** off the reactive graph for **agents and menu chrome**, not to move all scene data out of Pinia.

**Short answer:** Scene data used in rAF is **still in Pinia**; the parts that change every frame on agents (and the floating menu objects) are **`markRaw`** so those updates **don’t** drive re-renders. It’s **not** “all outside Pinia,” and it’s **not** “no reactivity anywhere”—it’s **Pinia + markRaw for sim-hot objects**.

-----------------

I think conceptually we can potentially distinguish database-object state from in-memory instance state quite clearly. For example, an action will exist in the database and will be loaded into the scene, as will an agent type. But an agent type is the cookiecutter for creating an agent instance (agent item). And when an agent adopts an action, the action is cloned and an instance of the action is associated with the agent. So there is a distinction between an action "template" which exists in the database, and the in-simulation clone of it, which is associated with other entities in the scene. That's why I think we can more cleanly distinguish persistent objects from the ephemeral ones created during the simulation. This assumes that no database CRUD operations happen during the simulation, but I think that is currently the case: the sim play button is essentially idempotent - you can run the sim in full or stop it halfway, reload the sim and run it again and it will start from the same starting state - because that is what is defined in the database and in-sim actions don't currently alter this. So I wonder if the database objects upon scene load could be copied into a plain JS state that is owned by the canvas loop, then they won't need to be part of the general Pinia store. And in-memory instances can be cloned from those, also away from the Pinia store. Does that distinction make sense? If so, how could we better separate state in that way in code implementation (answer in chat and/or feel free to counter)?

------------------


Yes, that distinction **makes sense** conceptually. It’s the usual split between **authoritative definitions** (what you’d persist / reload) and **runtime instances** (what the tick loop mutates). In your own terms: **agent type + action template** vs **agent item + per-agent cloned action** is exactly that boundary.

A few nuances to keep straight:

### 1. “No DB CRUD during simulation”
**Roughly** aligned with how you use play today: **runtime clones** advance without rewriting the **template** documents on every frame. But the codebase still has **conditional** API use (e.g. add/delete agents depending on play vs edit). So it’s not “zero network while playing” in all code paths—more “**hot path doesn’t continuously sync instances to DB**.”

### 2. “Reload always starts from DB”
True **only if** you **don’t save** mid-session changes to definitions/instances, or you **explicitly** treat “start state” as whatever was last **saved**. If the user edits templates in the sidebar and hits **save scene**, the **next** load is from that new persisted snapshot—not from the old mental model of “pure DB.”

So the clean mental model is: **persistence = last saved scene graph**; **runtime = ephemeral overlay** until you choose to persist.

### 3. Moving templates into plain JS “owned by the canvas loop”
**Coherent**, with tradeoffs:

**Pros**
- **Single owner** for everything rAF reads: one `World` / `SimulationState` object (templates + instances + spatial queries if you add them).
- Pinia becomes **UI + routing + “which id is selected”** instead of **the whole world**.
- Easier to reason about **what mutates per frame** vs **what is edited in forms**.

**Cons / design work**
- **Two sources of truth** unless you’re strict: today Pinia is the hub for both forms and sim. If templates live only in `world.templates`, **every form** must read/write **that** object (or a thin façade), and you need a **dirty / save** story.
- **Scene load** becomes: `fetch → build World` (deep copy or structured clone of JSON-safe bits), then **hydrate** instances from that. Pinia might only hold **metadata** (`sceneId`, `sceneName`, errors) or **nothing** about defs.
- **Editing** a template while instances exist: either **invalidate / rebuild** instances, or **fork** templates per instance (you already clone actions onto agents—good).

### 4. Lighter alternative (incremental)
You don’t have to **leave Pinia entirely** to get clarity:

- Keep **templates** in Pinia for **Vue forms**, but put **runtime** in `store.runtime` as a **single `markRaw(world)`** ref updated only at load boundaries, and have **rAF read only `world`**. Pinia then holds **pointers**, not the hot graph.
- Or: Pinia keeps templates; **`createSimRuntime` holds** `instances` + cloned actions in a **closed module**; store only exposes **ids** for UI.

That gives you **conceptual** separation without a big-bang migration.

### 5. Counterargument (when full split might be overkill)
If the **real** pain is **reactivity / ordering / scene switch**, you can fix a lot with **boundaries** (when to clear, what owns canvas, snapshot HUD) without moving **all** templates out of Pinia. The **big win** of a `World` object is **documentation + enforcement**: “sim code may only import `world`, not `useStore`.”

---

**Bottom line:** Your **template vs runtime instance** split is **sound** and matches how you already **clone** actions onto agents. **Implementing** it “cleanly” usually means introducing a **`World` / `SimulationModel`** (plain JS or class) that owns **templates + instances**, with Pinia (or props) only for **UI state and save/load orchestration**—or a **smaller** step: **`markRaw(world)`** in the store and a rule that **rAF never touches reactive template arrays directly**.

-------------------

You're right to point out that DB CRUD is still possible in the canvas scene when the scene is not playing. That is a design decision to make out-of-play actions persistable, the "scene constructor" stage, where user mutations alter the initial scene state. And then once the scene is playing, agent and state mutations do not touch the DB. Thinking this through some more: I think these canvas-triggered DB actions during scene construction could also live outside the Pinia store, but could trigger a store API fetch and reload. So for example, adding an extra carrot on the board outside of scene play, triggers an agent create API request to the backend. This updates the database and returns the new list of carrots (and XY coordinates) to the frontend, which updates the list of agents in the relevant menu (controlled by Pinia state, outside of imperative Hud etc). And likewise creating a new action would return a list of new actions that would display in the Pinia-controlled database-object display part of the UI. So canvas actions that trigger an API request and backend mutation would have the effect of reloading and re-rendering Pinia state upon API return, which is different from Pinia reacting directly to similar live changes in the canvas. Would that make sense? Or suggest pros/cons.

-------------------


Yes, that **can** make sense. You’re describing a **one-way flow for anything that must persist**:

**Intent (canvas) → HTTP → canonical response → refresh Pinia (and/or a plain `World`) → Vue re-renders the “database object” panels.**

That is **not** the same as “Pinia reacts to every canvas drag in real time.” For **constructor** edits that **must** match the DB, tying visibility in Pinia to **“after the server agrees”** is coherent.

### Pros
- **Single writer for persisted truth:** the DB (via API) decides ids, validation, and final coordinates; Pinia reflects that, not the other way around.
- **Clear mode split:** play = **no** persistence path; construct = **only** persistence through API + reload/patch.
- **Easier debugging:** “why does the list look wrong?” → trace last successful fetch/response, not every intermediate canvas mutation.
- **Aligns with your template vs runtime story:** templates/lists in Pinia stay **serialization-shaped**; canvas can still hold **ephemeral** previews until the round-trip completes.

### Cons / things to design explicitly
- **Latency & UX:** every placement waits on the network unless you add **optimistic** UI (draw immediately, roll back on error, reconcile ids when the response arrives).
- **Refetch scope:** reloading **the whole scene** after each carrot is simple but heavy and can **flicker** or **lose selection**; often better to **PATCH local state from the response body** (e.g. append one agent with server `id`) and only **full refetch** on ambiguous errors.
- **Concurrency:** double-clicks or fast placement need **disable / queue / debounce** so you don’t get duplicate creates or out-of-order responses.
- **Consistency with “plain JS world”:** if rAF reads a **`World`** object, you still need one **apply step** after API success: update **both** `World` and Pinia (or only `World` and have Pinia read a projection), so canvas and sidebar don’t diverge.
- **Offline / flaky API:** constructor mode needs a clear **error surface** (toast, revert ghost agent).

### Middle ground (often best)
- Canvas **still** calls the API for persistable ops.
- On success, **merge the returned resource** into Pinia (and runtime lists) instead of a **full** scene reload unless necessary.
- Pinia does **not** subscribe to deep canvas mutations for persisted fields; it updates **only** on **explicit** “apply server result” (or refetch).

So: **yes, the pattern is sound**; the main design choice is **optimistic vs wait-for-response** and **full refetch vs surgical merge**—not whether “API return drives Pinia” in principle.

--------------------

Is this a common pattern for e.g. games that have a lot of in-memory state but must also call backend CRUD operations on entities that exist on the canvas?

--------------------


Yes. What you’re describing is a **very common family of patterns**, though games usually name it differently depending on **multiplayer vs single-player** and **who owns truth**.

### Multiplayer / live service (most textbook)
- **Server is authoritative** for anything that must persist or be shared.
- The client keeps a **thick local simulation or presentation layer** (prediction, interpolation, local effects).
- **Mutations** are often modeled as **commands** (“spawn entity”, “use ability”): send to server → server validates → **replication** or a **delta** updates client state. That’s the same *shape* as “canvas intent → API → refresh canonical state,” just often over a socket with more frequent updates.

### Single-player with a backend (editors, cloud saves, UGC)
- Common pattern: **local `World` / runtime** runs the game loop; **HTTP (or sync)** is used for **save/load**, **asset CRUD**, **publishing levels**, etc.
- Less formal than MMO replication: often **“mutate locally for feel, then save snapshot”** or **“POST entity, merge response”** like you outlined.

### Level editors / “constructor” modes
- Very aligned with your **scene constructor vs play** split: **edit mode** operations may hit an **asset pipeline** or **DB**; **play mode** is **in-memory** until you **save** or **bake**.

### Terms you’ll see in the wild
- **Authoritative server / client prediction** (multiplayer)
- **Command pattern + event sourcing** (some strategy/sim backends)
- **Replication / state sync** (engine networking)
- **Optimistic UI + reconciliation** (any client that can’t wait on the network)

So: **lots of in-memory state + selective backend CRUD for “real” entities** is normal. The variation is mostly **how often** you sync (every action vs batch save), **who validates**, and **whether** you use **full refetch vs patches**—not whether the idea exists.

---------------------

(then see 05-04-2026-event-systems-and-game-networking-reading-list.md)

---------------

That's great, thanks. So going back to the architecture/state management of the simulation: I think we can do a few things: 1. redo the top part of the menu-section (selected agent etc) as imperative HTML with a ref element, 2. use the Pinia store only to store items retrieved from the database, but copy them into a plain JS sceneData object after fetch - like the current one but not inside the Pinia store. 3. Updates to any scene data apply to these items not anything in the Pinia store. Then 4. optimistically retain user-added agent CRUD in the canvas, and refresh database-loaded Pinia objects when the backend returns (and ideally verify/reconcile frontend state from the backend sync). Does that plan make sense? (Answer in chat to review before we start to implement)

----------------


Yes, the **direction** of the plan makes sense: it’s a coherent version of **authoritative in-memory world + server-shaped mirror + imperative “status” chrome**. A few clarifications will keep it from fighting your existing UI.

### What hangs together well
1. **Imperative top strip** — Same data as the HUD; avoids Vue re-rendering that block on every selection/tick nuance. Low risk if it’s **read-only** and driven by a **snapshot** (tick, rAF end, or event hooks).

2. **Plain JS “world” / `sceneData`** — Good as the **single place** the sim and constructor logic read/write (templates + instances, or templates + runtime instances as you already distinguish).

3. **Pinia as “last synced with DB”** — Reasonable if you mean: **Pinia = cache of server documents** (lists, ids, saved shapes), **not** the live simulation graph. After mutations, **PATCH Pinia from the response** (or targeted refetch), not from arbitrary canvas mutation.

4. **Optimistic canvas CRUD + server reconcile** — Standard for constructor mode; pair with **id assignment**, **rollback on error**, and **ordering** if multiple requests fly.

### Where to tighten the wording before you implement

**“Pinia only for DB” vs the big form tree**  
Most of your **menu-section** is still **Vue forms** bound to data. If that data lives only in plain JS, you need one of:

- **A)** Forms bind to **`reactive()` / `ref()` world** (still not Pinia, but Vue-reactive), or  
- **B)** Forms keep binding **Pinia**, but Pinia is explicitly a **projection** rebuilt from the world **only at sync boundaries** (harder to keep in sync), or  
- **C)** Forms become more imperative too (heavy).

So step 2–3 should explicitly say: **source of truth = plain JS world**; **Pinia = optional mirror for UI** *or* **Vue reactivity on the world** for forms. “Updates never touch Pinia” is only true if **no Vue template** reads Pinia for those fields—or you accept Pinia is **write-through on sync only**.

**Selection**  
Decide: **`selectedAgentId` (+ world lookup)** vs holding **`selectedAgent` reference** in Pinia. For your split, **id in Pinia (or in a tiny UI slice)** + **imperative panel reads world** is usually cleanest.

**One writer rule**  
Be explicit: **constructor mutations** go **world → API → reconcile → update mirror**; **play** mutates **world only**. That matches what you said; just name it so nobody reintroduces `store.actions.push` from a form.

**Reconciliation policy**  
For single-user, **server wins after successful response** is enough; define what happens on **409 / stale version** (refetch scene vs prompt).

### Migration scope (so expectations are right)  
Today **`sceneLoader` / `simRuntime` / `saveScene`** assume **Pinia**. Moving “real” scene data out means **threading a `world` (or `sceneRuntime`) object** through those paths and **rewiring save** to serialize from **world**, not from store arrays. That’s the bulk of the work—not just the top menu.

### Verdict  
**The plan is sound** as an architecture sketch if you refine steps 2–3 to: **plain JS (or Vue-`reactive` world) = authority for sim + constructor edits; Pinia = DB mirror / UI cache updated only from API responses (plus minimal UI flags like selection).**  

If that matches what you meant, it’s reasonable to implement in phases: **(A) world object + sim reads it, (B) sync pipeline Pinia↔API, (C) imperative status strip, (D) optimistic CRUD + reconcile).**