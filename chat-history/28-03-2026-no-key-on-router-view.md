Could you give me more information about what "key" does in vue-router (I understand the very basics that it forces a re-mount and state update.) Are there any limitations or drawbacks from the fact that we will not be using keyed views? Under what circumstances would this most likely be used in normal circumstances?

----------------

Here’s a tighter picture of how **`key`** interacts with **`<router-view>`** and what you give up by **not** keying it.

## What `key` does here

Vue uses **`key`** to decide whether a node in the virtual DOM is the **same** logical element across updates.

- **Same `key`** → Vue tries to **reuse** the existing component instance and **patch** it in place.
- **Different `key`** → Vue treats it as a **new** tree: **tear down** the old instance, **create** a new one (`beforeUnmount` → new `setup` / `onMounted`).

On **`<router-view>`**, adding something like `:key="$route.fullPath"` ties that identity to the **current URL** (path + query). Each time the key string changes, the **routed component is remounted**, even if Vue Router would otherwise **reuse** the same component **constructor** for the next navigation.

So it’s not “Vue Router’s key” as a separate feature—it’s the **normal Vue `key` semantics** applied to whatever component the router is rendering.

## What you lose by **not** keying (tradeoffs, not bugs)

Without a key, Vue Router’s default is roughly: **reuse the component instance when it makes sense** (same component, new params/query often **don’t** destroy the instance).

**Implication:** **Local** state inside that component (refs, `data`, internal caches) **survives** navigations that only change **params/query** but still render the **same** component.

That’s often **desirable** (faster, preserves scroll, keeps form drafts). When it’s **not** what you want, people either:

- **`watch` the route** and reset state, or  
- Put a **`:key`** on `<router-view>` (or on an inner wrapper) so the **whole view** remounts and you get a clean slate without manual resets.

So the “limitation” of skipping `:key` is: **you must reset or react to route changes yourself** when you need “fresh page” behavior on param/query changes. That’s normal app design, not a router flaw.

## Drawbacks of **using** a key (why we skipped it for the sim)

Keyed `<router-view>` means **full remount** whenever the key changes. For **SimView** that implies:

- Canvas DOM node and **sim runtime** lifecycle run again (`destroy` / `attachCanvas` / listeners / rAF).
- Any mistake in cleanup → duplicate listeners or duplicate animation loops.
- Unnecessary work if you only needed to react to a **query** change.

So for the sim, **no key** is the conservative default: **one stable mount** for the route unless you **intentionally** navigate away to another route (then the component unmounts normally).

## When keyed views are common in “normal” apps

Typical cases for **`:key="$route.fullPath"`** (or path/params):

1. **Same component, different IDs** — e.g. `/users/1` → `/users/2` with one `UserView.vue`. You want **empty form**, reset scroll, re-run `onMounted` fetches **without** writing reset logic.
2. **Search/list UIs** — query string changes (`?q=foo` → `?q=bar`); you want the list child to **fully reload** instead of patching.
3. **Nested routes** where the **parent** should reset when a segment changes (less common; often you key a **child** `<router-view>` instead).

Many apps **don’t** key the root `<router-view>` and instead use **per-route** patterns: `watch` route, or key only a **nested** fragment, or use **`keep-alive`** with explicit `include`/`exclude` for caching—which is yet another axis (cache vs remount).

## Short summary

| | No `:key` on `<router-view>` | With `:key` (e.g. `fullPath`) |
|--|------------------------------|-------------------------------|
| **Behavior** | Prefer **reuse** of the same component instance when the router keeps the same component. | **Remount** whenever the key string changes. |
| **Risk** | Stale **local** state if params/query change and you don’t reset. | Heavier teardown; must ensure **cleanup** (canvas/sim/HUD). |
| **Typical use** | Default shell; performance; stable heavy widgets. | “New page” semantics, forms, same component different slug. |

For your sim, **not** keying the root view is appropriate; if you later add routes like `/settings` and `/`, **navigation between those** still unmounts `SimView`—the thing to avoid is an accidental **`:key`** that flips on every minor URL change while you’re still on the sim.