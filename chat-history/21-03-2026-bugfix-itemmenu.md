I have a bug in that itemMenu is null, causing errors. Can you trace the different references to it and see why that might be occurring? I seem to have introduced this bug just now during the reorganisation (I think).

--------------

Thinking:
The user has a bug where itemMenu is null. I need to trace where itemMenu is set, used, and if something in the reorganisation broke the initialization order or removed code that sets it.

Let me search for itemMenu in the codebase.

So store.itemMenu is set in loadAgentsAndFixtures in App.vue at line 277: store.itemMenu = new AgentModal(). If the user opens ModalLoadObject or AgentTypeCreate before loading a scene, itemMenu would still be null.

Let me read more context:

When is loadAgentsAndFixtures called?
ModalLoadObject line 51 - what uses itemMenu?
AgentTypeCreate 86
The bug might be:

User opens "load agent type" modal before loading a scene
Or loadAgentsAndFixtures no longer runs when expected
Or clearAllData clears itemMenu but doesn't reset it
Or something else clears agent menu before itemMenu is set
Let me read App.vue around loadAgentsAndFixtures, clearAllData, and when load scene happens. Also ModalLoadObject and AgentTypeCreate.

I see the issue now:

store.itemMenu is only set inside loadAgentsAndFixtures() at line 277.
loadAgentsAndFixtures() is only called from loadScene() (after fetchSceneData).
So before the user loads a scene for the first time:

itemMenu stays null (initial state from mainStore)
User might open SimEditorMenu and use AgentTypeCreate or ModalLoadObject without ever loading a scene
Both push AgentMenuIcon with menu: store.itemMenu where itemMenu is null → errors
OR after reorganisation:

Maybe SceneMenu or initial app flow no longer calls loadScene on mount?
Let me check onMounted in App.vue - does it auto-load a scene?
If the app starts without loading a scene, itemMenu is null until loadScene runs. So the bug might be:

Pre-existing for anyone who uses AgentTypeCreate before loading a scene
Reorganisation might have shown SimEditorMenu immediately without going through scene menu first
The fix should ensure itemMenu (and possibly deleteButton) exist whenever we need them. Options:

A) Initialize itemMenu when Pinia store is created - e.g. in store state or an action ensureCanvasMenu() that creates AgentMenu if null. But AgentMenu is a class - might need to be created in App.vue on mount or first use.

B) Create itemMenu on app mount in App.vue onMounted if still null - but then we need canvas for positioning maybe? Let me read AgentMenu class.

C) In clearAllData, set itemMenu to null - actually clearAllData does NOT reset itemMenu! So when you load a new scene:

clearAllData clears agentMenuButtons to []
But itemMenu is still the OLD AgentMenu instance from previous scene
loadAgentsAndFixtures runs and sets store.itemMenu = new AgentMenu() - so it replaces it. OK.
D) The issue: User opens app, scene menu shows, user never selects a scene but... can they get to SimEditor? If the scene menu hides the whole app or they close it without loading?

Let me read App.vue onMounted - what happens on first load?

Let me read more of onMounted - line 864+

The root cause is clear:

itemMenu is only created in loadAgentsAndFixtures(), which runs only after loading/creating a scene via loadScene.

On first app load: displaySceneMenu = true, user sees scene menu. The sidebar (SimEditorMenu) is still visible in the template - it's not inside v-show="store.displaySceneMenu". So the user can see the editor and click "load agent type" or create agent type before selecting a scene → itemMenu is still null.

animate() calls store.itemMenu.update(...) every frame when scene plays - if they never loaded scene, is animate running? Probably not until play - but wait, does animate run on mount? Let me check - user might not play until scene loaded.

Canvas click handler uses store.itemMenu.area when store.placingAgent - only when placing agent.

So the fix: Ensure itemMenu and deleteButton exist before they're needed. The cleanest approaches:

After canvas is ready in onMounted, if !store.itemMenu, create store.itemMenu = new AgentMenu() and store.deleteButton = new DeleteButton({ menu: store.itemMenu, i: 0 }).

Problem: Then loadAgentsAndFixtures creates a NEW AgentMenu and replaces - the old menu buttons might still reference old menu? When loadScene runs, loadAgentsAndFixtures clears agentMenuButtons and repopulates with new itemMenu. Good.

Actually when user first loads app without scene: we need itemMenu for ModalLoadObject and AgentTypeCreate. So initialize empty menu on mount.

When loadAgentsAndFixtures runs, it replaces itemMenu with new AgentMenu() and rebuilds buttons. So we need deleteButton too - loadAgentsAndFixtures sets deleteButton at the end. If we init on mount with empty agentMenuButtons, deleteButton needs menu with i: agentMenuButtons.length (0).

Let me check animate - does it run when scene not loaded?

animate only runs when playScene. So the frame loop isn't the issue for initial null unless they play without loading...

The bug is definitely: AgentTypeCreate and ModalLoadObject need itemMenu when user adds agent type before loadScene.

Also clearAllData doesn't null out itemMenu or deleteButton. So after clearAllData, old itemMenu might still point to valid object but agentMenuButtons is []. Then loadAgentsAndFixtures creates new itemMenu. OK.

But wait - what if someone calls clearAllData without loadAgentsAndFixtures? Unlikely.

Another scenario: loadAgentsAndFixtures throws or returns early before line 277? If sceneData is empty/malformed, could it error before reaching itemMenu assignment? Then itemMenu stays null from previous session or initial. Let me check - if scene has no agent types, it still reaches line 277. Good.

I'll implement initialise canvas menu on mount in App.vue onMounted after canvas setup:

```
if (!store.itemMenu) {
  store.itemMenu = new AgentMenu()
  store.deleteButton = new DeleteButton({
    menu: store.itemMenu,
    i: 0  // no buttons yet
  })
}
```

When loadScene runs:

clearAllData clears agentMenuButtons
loadAgentsAndFixtures sets store.itemMenu = new AgentMenu() - replaces the instance
Creates new deleteButton
But AgentMenuIcon instances from ModalLoadObject or AgentTypeCreate created BEFORE loadScene would hold reference to the first itemMenu. After user loads scene, loadAgentsAndFixtures replaces itemMenu with a new AgentMenu - the icons pushed before load would still point to OLD menu. That could be a bug flow:

User creates agent type before loading scene → icon has menu = old itemMenu
User loads scene → new itemMenu, new buttons built from agent types in scene - might duplicate or wrong menu reference
Actually the flow "create agent type before scene" might be weird anyway. The safer fix is:

Init itemMenu on mount so it's never null for new icons
When loadScene runs, loadAgentsAndFixtures replaces itemMenu - all agentMenuButtons are cleared by clearAllData and rebuilt in loadAgentsAndFixtures. So any icons added before load are wiped when clearAllData runs (agentMenuButtons = []). So we lose the locally created agent type from... wait clearAllData clears agentTypes too! So if user added agent type before loading scene, then loads scene, the agent type is wiped from memory when clearAllData runs. That's a different bug.
For itemMenu null only: onMounted init fixes ModalLoadObject and AgentTypeCreate when no scene loaded yet.

Also need to guard animate and canvas click for null itemMenu/deleteButton? After init on mount, they're always set. Unless deleteButton - we init both on mount.

Let me also add guard in click handler: if (store.placingAgent && store.itemMenu) before accessing itemMenu.area - defensive.

Actually if we always init on mount, we're good.

clearAllData - should it set itemMenu to null? If we don't, then loadAgentsAndFixtures replaces. If user somehow calls clearAllData without loadAgentsAndFixtures, itemMenu stays old. Edge case.

I'll add to onMounted in App.vue (need to import AgentMenu, DeleteButton - already imported).

Read App imports for AgentMenu DeleteButton

----------

Identifying the issue: store.itemMenu is only assigned in loadAgentsAndFixtures(), which runs after loading/creating a scene. The sidebar (SimEditorMenu) stays visible while the scene menu is open, so we can use "Load agent type" or create an agent type before a scene loads — leaving itemMenu null. Initializing the canvas menu in onMounted so itemMenu and deleteButton exist before any scene load.

Initializing itemMenu and deleteButton on mount. Adding defensive guards in the animation loop and click handler for edge cases.


Here’s what was going wrong and what we changed.

---

## Cause

`store.itemMenu` is only set in **`loadAgentsAndFixtures()`** (around line 277), which runs **after** **`loadScene()`** fetches scene data.

On startup you set **`store.displaySceneMenu = true`**, but the **right-hand editor** (`SimEditorMenu`) is **not** hidden by that modal. So you can:

1. Open **“load agent type”** (`ModalLoadObject`) or create a type in **`AgentTypeCreate`**, and  
2. Do that **before** picking/creating a scene.

In both places you do `new AgentMenuIcon({ menu: store.itemMenu, ... })` while **`itemMenu` is still `null`** (initial Pinia state).

That’s easy to hit after the reorganisation because the same sidebar is always visible; it’s not really a new logic bug, just a timing/order issue that shows up more often.

`clearAllData()` does **not** clear `itemMenu` / `deleteButton`, so loading a scene still replaces them in `loadAgentsAndFixtures()`.

---

## Fix

1. **After the canvas is ready in `onMounted`**, if `itemMenu` / `deleteButton` are missing, create them (same pattern as after a scene load, with `i: 0` and no menu buttons yet). Then **`ModalLoadObject`** and **`AgentTypeCreate`** always get a real `AgentMenu` when they add icons.

2. **Guards** on **`itemMenu`** / **`deleteButton`** in the animation loop and canvas click handler so a null can’t slip through if something else changes later.

---

## References (for your mental model)

| Location | Use of `itemMenu` |
|----------|-------------------|
| **`mainStore.js`** | Initial `itemMenu: null` |
| **`App.vue` `loadAgentsAndFixtures`** | `store.itemMenu = new AgentMenu()`, then build `agentMenuButtons` + `deleteButton` |
| **`ModalLoadObject.vue`** | `new AgentMenuIcon({ menu: store.itemMenu, ... })` on add |
| **`AgentTypeCreate.vue`** | Same when saving a new agent type |
| **`App.vue` `animate`** | `store.itemMenu.update(...)` |
| **`App.vue` canvas click** | `store.itemMenu.area` when placing an agent |

So anything that runs **before the first successful `loadScene` → `loadAgentsAndFixtures`** needed either this early init or null checks; we did the init plus guards.