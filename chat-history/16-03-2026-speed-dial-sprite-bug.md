When I adjust the speed dial, the sprite animation in a running scene "breaks", that is it just displays a single image with no image rotation i.e. no animation, presumably this is some bug with communicating the frame number to the sprite/agent class? Can you see what the bug is? Note: this bug predates the recent changes we made, so it was not caused by them.

----------------

Thinking:
The user is saying that when they adjust the speed dial (which controls store.GlobalSettings.globalSpeed), the sprite animation breaks - it shows a single image with no rotation/animation. They say this bug predates the recent changes (hover, animationFrameId, FPS diagnostic), so it's not caused by moving animationFrameId out of the store or getGlobals().

So the issue is likely: when globalSpeed changes, something about how the sprite gets or uses that value goes wrong. Let me think about the flow:

User changes the speed slider → store.GlobalSettings.globalSpeed updates (reactive).
The animate loop runs. It calls getGlobals() which returns { globalSpeed: store.GlobalSettings.globalSpeed, animationFrameId: currentAnimationFrameId }.
This gets passed to agentHandler.update(c, {}, getGlobals(), agent).
In Agent.js update(), we have item.globals = globals and item.speed = item.nominalSpeed * item.globals.globalSpeed.
Sprite.js update(globals, item) uses globals.globalSpeed for frame speed.
So when we pass getGlobals(), we're passing a new object each time. The agent gets item.globals = that object. So item.globals.globalSpeed is the current value. That should be fine.

Wait - maybe the issue is different. When the user changes the speed dial, Vue's reactivity updates store.GlobalSettings.globalSpeed. But do we have a situation where the agent or sprite holds a stale reference?

Let me look at the Sprite.js update logic - it uses globals for frame advancement. Maybe there's something where the sprite stores globals or frame state and when globals is a new object something breaks? Or maybe the issue is that when globalSpeed changes, some internal state in the sprite (like frames.elapsed, frames.hold) gets out of sync?

Let me read the Sprite.js and Agent.js update methods to understand how globalSpeed is used and what could "break" animation when it changes.

----------

Tracing how globalSpeed flows into the sprite animation logic:

----------

Thought for 45s:
I see the bug! In Sprite.js update():

update(globals, item) {
  const frameSpeedMultiple = globals.globalSpeed / 100
  const hold = Number(item.frames.hold)
  item.frames.hold = hold / frameSpeedMultiple   // BUG: mutating item.frames.hold!
  item.frames.elapsed++
  if (item.frames.elapsed % item.frames.hold === 0) {
The problem: item.frames.hold is the base value from the sprite sheet (e.g. "show each frame for 3 ticks" - the refreshInterval). But the code is overwriting item.frames.hold with hold / frameSpeedMultiple every single frame. So:

First frame: item.frames.hold might be 3 (from useSpriteSheet). frameSpeedMultiple = 1 (globalSpeed 100). item.frames.hold = 3/1 = 3. OK.
Next frame: item.frames.hold is now 3. We do hold = Number(3) = 3, item.frames.hold = 3 / frameSpeedMultiple. Still OK if globalSpeed hasn't changed.
User changes globalSpeed to 200. frameSpeedMultiple = 2. We do hold = Number(item.frames.hold) - but item.frames.hold was already divided by the previous frameSpeedMultiple! So it might be 1.5 or 3 or something. Then we set item.frames.hold = hold / 2. So we're dividing an already-modified hold again. So the value gets corrupted - we're using the already-divided value as if it were the original refreshInterval.
So the bug is: we're mutating the stored item.frames.hold each frame. The sprite sheet's original "hold" (refreshInterval) is lost after the first frame. So when we do const hold = Number(item.frames.hold), we're not getting the original refresh interval - we're getting last frame's computed value. When globalSpeed changes, we divide by a new frameSpeedMultiple and the math goes wrong. Even without speed change, we're doing hold = 3, item.frames.hold = 3/1 = 3, then next frame hold = 3, item.frames.hold = 3/1 = 3 - so that's stable. But when speed changes: say item.frames.hold was 3. We set item.frames.hold = 3/1 = 3. User changes to 200%. frameSpeedMultiple = 2. hold = Number(3) = 3, item.frames.hold = 3/2 = 1.5. Next frame hold = 1.5, item.frames.hold = 1.5/2 = 0.75. Next frame 0.75/2 = 0.375. So we're compounding the division every frame! So item.frames.hold quickly goes to 0 or a fraction, and then item.frames.elapsed % item.frames.hold might be NaN or behave oddly (e.g. 0 % 0.375), and the animation could freeze or break.

Actually wait - if item.frames.hold becomes 0.375, then item.frames.elapsed % 0.375 - every frame elapsed increments. So we'd be advancing current very fast (every frame maybe) or the modulo with a fractional number could be weird. Or if hold goes to 0 we get division by zero (elapsed % 0 is NaN). So the fix is: don't mutate item.frames.hold. We need to keep the original refresh interval somewhere and compute the "effective hold" for this frame's speed without overwriting the stored value.

So we should either:

Store the original "base" hold value (e.g. item.frames.baseHold or get it from the sprite sheet) and compute effective hold each frame without mutating item.frames.hold. Then use the computed value for the modulo check.
Or compute the effective hold into a local variable and use it for the modulo, and don't assign back to item.frames.hold.
Let me look at useSpriteSheet again - it sets item.frames.hold = spriteSheet.refreshInterval. So the "canonical" base value is the sprite sheet's refreshInterval. But we're overwriting it every frame in update(). So the fix: in update(), use a local variable for the speed-adjusted hold instead of mutating item.frames.hold. We need to get the "base" hold - but we've already overwritten it. So we need to store the base hold somewhere so we don't lose it. Options: a) In useSpriteSheet, also set item.frames.baseHold = spriteSheet.refreshInterval (or just keep hold as the base and never overwrite it - use a different property for the effective hold). b) In update(), don't overwrite item.frames.hold. Compute effectiveHold = baseHold / frameSpeedMultiple and use that for the modulo. So we need the base to be preserved. So in useSpriteSheet we have item.frames.hold = spriteSheet.refreshInterval. In update we should do: const baseHold = Number(item.frames.hold), effectiveHold = baseHold / frameSpeedMultiple. And then we should NOT do item.frames.hold = effectiveHold. We use effectiveHold for the elapsed check. But wait - then the first time we run update after useSpriteSheet, baseHold is the real value. But the second time, we didn't overwrite item.frames.hold, so baseHold is still the real value. Good! So the fix is simply: don't mutate item.frames.hold. Use a local variable effectiveHold = baseHold / frameSpeedMultiple and then check item.frames.elapsed % effectiveHold === 0. But modulo with a floating point number can be tricky. Let me think... item.frames.elapsed is an integer that increments each frame. So we're counting frames. We want to advance the sprite image every "effectiveHold" frames. So when elapsed is 0, 1, 2 and effectiveHold is 1.5, we'd want to advance at 1.5 - but we can't advance at fractional frames. So the typical approach is: we want to advance when elapsed reaches a threshold. So we could do: if (Math.floor(item.frames.elapsed / effectiveHold) > Math.floor((item.frames.elapsed - 1) / effectiveHold)) then advance. Or: increment a counter when elapsed % effectiveHold < 1 or something. Actually the original code does item.frames.hold = hold / frameSpeedMultiple, so they're making hold smaller when speed is higher (frameSpeedMultiple > 1), so we advance more often. So effectiveHold is in "frames" - meaning "advance every effectiveHold frames". So with hold=3 and frameSpeedMultiple=2, effectiveHold=1.5, so we'd advance every 1.5 frames. The check item.frames.elapsed % item.frames.hold === 0 - with hold=1.5, elapsed 0->1->2->3, 0%1.5=0, 1%1.5=1, 2%1.5=0.5, 3%1.5=0. So we advance when elapsed is 0 and 3? That's not quite right. Actually with hold=1.5 we want to advance at elapsed 0, 1.5, 3, 4.5... but elapsed is integer. So we advance when floor(elapsed/1.5) > floor((elapsed-1)/1.5), i.e. when elapsed is 2, 3, 5, 6... (when elapsed goes from 1 to 2, floor(2/1.5)=1, floor(1/1.5)=0, so we advance). So the modulo approach with a float is fragile. The original design might have assumed hold stays an integer (e.g. 3/2 = 1.5, and then 1%1.5=1, 2%1.5=0.5, 3%1.5=0 - so we advance at 0 and 3? That's every 3 frames when we wanted every 1.5). So there might be a separate bug with fractional hold. For now, the main fix is: don't overwrite item.frames.hold so that we preserve the base value. Use a local variable for the speed-adjusted hold. So: const frameSpeedMultiple = globals.globalSpeed / 100 const baseHold = Number(item.frames.hold) const effectiveHold = baseHold / frameSpeedMultiple item.frames.elapsed++ if (item.frames.elapsed % effectiveHold === 0) { // or use a threshold check to avoid float issues ... }

But if we don't mutate item.frames.hold, then baseHold is always the original value from the sprite sheet. So when the user changes speed, the next frame we use the new globalSpeed and recompute effectiveHold correctly. So the animation should work. The modulo with a float might still be slightly off - in JS, 3 % 1.5 is 0. So 0%1.5=0, 1%1.5=1, 2%1.5=0.5, 3%1.5=0. So we advance at 0 and 3. So we're advancing every 3 frames when effectiveHold is 1.5, which is wrong (we want every 1.5). So a better approach might be to use a time-based or frame-based counter that doesn't rely on modulo with a float. For example: when effectiveHold is 1.5, we could use a threshold: if (item.frames.elapsed * 100 >= nextAdvanceAt * 100) then advance and set nextAdvanceAt += effectiveHold. That way we advance at 0, 1.5, 3, 4.5... But that might be a bigger change. Let me just do the minimal fix: don't overwrite item.frames.hold, use a local effectiveHold. For the modulo with float, we could use something like: advance when Math.floor(item.frames.elapsed / effectiveHold) > Math.floor((item.frames.elapsed - 1) / effectiveHold). That would advance at the right fractional frame boundaries. Let me check: effectiveHold=1.5, elapsed 1: floor(1/1.5)=0, floor(0/1.5)=0, no advance. elapsed 2: floor(2/1.5)=1, floor(1/1.5)=0, advance. elapsed 3: floor(3/1.5)=2, floor(2/1.5)=1, advance. So we advance at 2, 3, 4, 5, 6... Actually we want to advance at 0, 1.5, 3, 4.5. So at elapsed=0 advance, at 1 no, at 2 advance (we're past 1.5), at 3 advance. So floor(0/1.5)=0, floor(-1/1.5)=0 no; floor(1/1.5)=0, floor(0/1.5)=0 no; floor(2/1.5)=1, floor(1/1.5)=0 yes; floor(3/1.5)=2, floor(2/1.5)=1 yes. Good. So the condition Math.floor(item.frames.elapsed / effectiveHold) > Math.floor((item.frames.elapsed - 1) / effectiveHold) will advance at the right times. Let me use that instead of modulo to handle fractional effectiveHold cleanly.

----------

Identifying the bug: in Sprite.js update() we overwrite item.frames.hold every frame with the speed-adjusted value, so the original sprite-sheet hold is lost and the value compounds when speed changes. Checking how hold is set from the sprite sheet:

---------

Thought for 5s:
Confirmed. The bug:

useSpriteSheet sets item.frames.hold = spriteSheet.refreshInterval (the base value, e.g. 3).
Every frame, update() does:
hold = Number(item.frames.hold) — but on frame 2+, this is the previous frame's overwritten value, not the original refreshInterval.
item.frames.hold = hold / frameSpeedMultiple — overwrites again.
So after one frame at speed 100: item.frames.hold = 3/1 = 3. Good. When user changes to 200: frameSpeedMultiple = 2. hold = 3, item.frames.hold = 1.5. Next frame hold = 1.5, item.frames.hold = 0.75. Then 0.375, 0.1875... So we're dividing the already-divided value again each frame. Soon item.frames.hold is nearly 0 or a tiny number. Then item.frames.elapsed % item.frames.hold is NaN (if 0) or the modulo logic fails, so the animation freezes (current never advances or advances incorrectly).

Fix: Never mutate item.frames.hold. Treat it as the base hold from the sprite sheet. Use a local variable for the speed-adjusted value and use that for the "should we advance frame?" check. I'll use a threshold-based check so fractional effectiveHold works: advance when floor(elapsed / effectiveHold) > floor((elapsed-1) / effectiveHold).

------------

Identifying the bug: in Sprite.js update() we overwrite item.frames.hold every frame with the speed-adjusted value. That (1) loses the sprite sheet's base refresh interval and (2) when speed changes we divide an already-divided value each frame, so hold quickly shrinks to near-zero and the frame-advance logic breaks. Fixing by treating item.frames.hold as the base and using a local speed-adjusted value for the advance check.

------------

Thought for 2s:
I removed the mutation of item.frames.hold entirely. Now:

baseHold is always the original value from the sprite sheet (refreshInterval), since we never overwrite item.frames.hold.
effectiveHold is recomputed each frame from the current globalSpeed, so when the user changes the dial we immediately use the new speed.
The advance condition uses a quotient comparison so we advance at the right times even when effectiveHold is fractional (e.g. 1.5 frames per image). This is more robust than modulo with a float.
Let me verify there are no linter errors.

-------------


Summary of what was wrong and what was changed:

---

**What was wrong**

In `Sprite.js` `update()` the code did:

1. `hold = Number(item.frames.hold)` 
2. `item.frames.hold = hold / frameSpeedMultiple`
3. Later: `item.frames.elapsed % item.frames.hold === 0` to decide when to advance the frame.

So **`item.frames.hold` was overwritten every frame** with the speed-adjusted value. The original sprite-sheet “hold” (e.g. `refreshInterval` = 3) was only correct on the first frame; after that it was whatever was written last time.

When you **changed the speed dial**:

- `frameSpeedMultiple` changed (e.g. from 1 to 2).
- Next frame: `hold` was read from the *already divided* value (e.g. 1.5), then divided again: `1.5 / 2 = 0.75`, then next frame `0.375`, and so on.
- So `item.frames.hold` quickly went toward zero. With `hold` near 0, `elapsed % hold` is useless (and can be NaN if `hold === 0`), so the “advance frame” condition almost never fired and the sprite stopped animating.

So the bug was: **mutating the stored hold and reusing it as the base for the next frame**, which breaks as soon as speed changes and was fragile even when speed was constant.

---

**What was changed**

1. **Stop mutating `item.frames.hold`**  
   It now always keeps the sprite sheet’s base value (e.g. `refreshInterval`). No more overwriting it in `update()`.

2. **Use a local, speed-adjusted value**  
   Each frame we compute:
   - `baseHold = Number(item.frames.hold)` (the real base from the sheet),
   - `effectiveHold = baseHold / frameSpeedMultiple`,
   and use only `effectiveHold` for the “when to advance” logic. Changing the speed dial only changes `frameSpeedMultiple`, so the next frame uses the new speed with the correct base hold.

3. **Robust advance condition**  
   Replaced `elapsed % item.frames.hold === 0` with a quotient-based check:
   - `prevQuotient = floor((elapsed - 1) / effectiveHold)`,
   - `currQuotient = floor(elapsed / effectiveHold)`,
   - advance when `currQuotient > prevQuotient`.

   This gives correct advances even when `effectiveHold` is not an integer (e.g. 1.5) and avoids relying on modulo with a float.

With this, changing the speed dial only changes how often the sprite advances per frame; the base timing stays correct and animation no longer freezes.


------------

I forget my own code because I've been away from it for a long time. "Hold" is the number of frames to "hold" each sprite image for in an animation, right? The change or refresh interval in other words. Is "hold" a canonical term for this in sprite animation? What would be other or better choices?

Thought for 13s:
The user is asking:

Confirmation that "hold" means the number of frames to display each sprite image (refresh interval) - yes, that's what the code does.
Is "hold" a canonical term in sprite animation?
What are other or better naming choices?
I don't need to search the codebase for this - it's a terminology/naming question. I can answer from general knowledge of game dev and sprite animation.

In sprite/animation terminology:

Frame duration - how long (in time or in "ticks") one frame of the animation is shown. Very common.
Hold - sometimes used (e.g. "hold this pose for N frames") but not the most standard term in APIs.
Refresh interval - the codebase already uses this in the sprite sheet (refreshInterval) - so the data uses "refreshInterval" but the runtime copy on item.frames uses "hold". So there's already a naming split.
Frame delay - common in GIFs and some tools (delay between frames in ms or in frames).
Frames per image / frame duration (in frames) - explicit.
Step - some systems use "step" for how many logical ticks before advancing.
Speed - animation speed (could be ambiguous with movement speed).
Interval - generic.
Canonical-ish terms in the wild:

Unity: Animator uses "frame rate" or you set keyframe timing; sprite animation often "frames per second" or "sample rate".
Godot: AnimatedSprite has "fps" (frames per second) for the sprite sheet.
CSS animation: animation-duration, keyframe timing.
Sprite sheet / pixel art: People often say "frame duration", "frame delay", or "fps" (frames per second). In frame-based (tick-based) engines, "frames per cell" or "ticks per frame" is clear.
GIF: "frame delay" (in hundredths of a second).
So "hold" is understandable but not the most standard. More conventional options:

frameDuration - duration (in frames) of each cell. Clear.
ticksPerFrame - explicit for tick-based.
framesPerCell - each "cell" is one image in the sheet.
refreshInterval - already used in the sprite sheet data; could use consistently.
frameDelay - common in animation (delay before switching).
I'll give a short, practical answer and suggest aligning with the existing "refreshInterval" from the sprite sheet if they want consistency.

-----------

Yes. In your code, **hold** is “how many (simulation) frames to keep each sprite image on screen before switching to the next” — i.e. the frame-based refresh interval for one animation cell.

**Is “hold” canonical?**  
Not really. It’s understandable (“hold this frame for N frames”) but most APIs and docs don’t use “hold” as the main term.

**More common terms:**

| Term | Usage |
|------|--------|
| **Frame duration** | Very common: “duration of each frame” (in time or in ticks). |
| **Frame delay** | Common (e.g. GIF “frame delay”, many tools). |
| **FPS** / **frames per second** | Often used for the *whole* animation (e.g. Godot AnimatedSprite “fps”), so “how many images per second” rather than “how long per image.” |
| **Ticks per frame** | Clear in tick/frame-based engines: “advance image every N ticks.” |
| **Refresh interval** | You already use this in the sprite sheet (`refreshInterval`); it’s a good, standard word for “interval between updates.” |

**Recommendation:**  
- **Concept:** “Hold” = number of frames to hold each sprite image = frame-based refresh interval.  
- **Naming:** Either align with your data and use **refreshInterval** everywhere (so the property on `item.frames` matches the sprite sheet and the meaning is obvious), or use **frameDuration** / **ticksPerFrame** if you want to stress “duration of one frame in ticks.” Any of those is clearer and more conventional than “hold.”


------------

I think perhaps I started off using "hold" and then updated to "refreshInterval", but maybe forgot to update everywhere. I also have to think about breaking backwards compatibility (or versioning if unavoidable). A goal during development it to be able to run simulations with past commits even as the schema go through rapid changes. To this end I have scripts to dump data to JSON and load data from JSON. So every so often I dump the data to JSON and commit this. Then I can recall this small database snapshot and run old simulations even though the code and schemas have since changed, or simulations have been destroyed or undergone more advanced changes. So I was just wondering if you can see where in my exported fixtures I currently use "hold" and where I use "refreshInterval" and likewise in the code?

-----------

Thought for 1s:
The user wants to understand the current state of naming: where "hold" is used vs "refreshInterval" in both (1) exported fixtures/JSON and (2) the codebase. They're thinking about consistency and backwards compatibility with their dump/load workflow.

Thought for 1s:
The grep picked up a lot of "placeholder" too. Let me get a cleaner picture by searching specifically for the property names in the right contexts - "hold" as a property (e.g. in frames, or in JSON structure) and "refreshInterval".

-----------

Getting a clearer picture of where hold and refreshInterval appear as data/schema properties (excluding "placeholder"):

-----------

Thought for 1s:
Now I have a clear picture. Let me also check the dev_db_fixtures/actions.json "hold" occurrences to see the context (lines 503 and 603):

------

Checking the "hold" context in dev_db_fixtures/actions.json:

-------

Where "hold" appears: 12s:

Now I have the full picture. Let me summarize for the user:

Where "hold" appears:

Code – Sprite.js

createSpriteObject: initial defaultFrames and frames both use hold: 3 (lines 18, 27).
update(): reads item.frames.hold as baseHold (line 86).
useSpriteSheet(): when applying a sheet, sets hold: spriteSheet.refreshInterval (line 111) – so at runtime the source is refreshInterval but it’s stored on item.frames as hold.
Exported fixtures / JSON

src/agentObject.json: defaultFrames.hold: 3, frames.hold: 3 (lines 14, 22). Nested under animationSet, each sheet has refreshInterval (not hold).
dev_db_fixtures/actions.json: inside what looks like embedded agent/sprite state, defaultFrames.hold: 3 and frames.hold: 3 (lines 503, 603) and also frames.hold: 1 (line 603). The sheets inside the same structure use refreshInterval.
So the split is:

Schema/source of truth (sprite sheets): always refreshInterval – in SpriteSheetCreate/Edit, in spritesheets.json, in scene JSON (animationSet.sheets[id].refreshInterval), in actions.json (embedded sheets).
Runtime / in-memory (item.frames): hold – created in Sprite.js with hold: 3, and when useSpriteSheet runs it sets hold: spriteSheet.refreshInterval. So the runtime object uses the property name hold for the same value.
Exported agent/sprite state (agentObject.json, and embedded in dev_db_fixtures/actions.json): uses hold inside defaultFrames and frames, and refreshInterval inside each sheet of animationSet.
So when loading old JSON:

If the loader reconstructs agent objects and then calls useSpriteSheet for each sheet, it would read refreshInterval from the sheet and set item.frames.hold. So for animationSet.sheets we need refreshInterval (and that’s what’s in the JSON).
If the loader just assigns the parsed JSON to the agent (including frames: { ..., hold: 3 }), then item.frames.hold is already there from the dump. So old dumps with "hold" in frames/defaultFrames would still work with the current code that reads item.frames.hold.
If we renamed item.frames to use refreshInterval, we’d need to either: (a) migrate old JSON (hold → refreshInterval) when loading, or (b) support both in the reader (accept hold or refreshInterval and normalize to one).
I'll write a clear summary for the user.

-----------


Here’s a concise map of where each name is used and what that means for compatibility.

---

## Summary: where "hold" vs "refreshInterval" appear

### 1. **Code**

| Location | Property | Role |
|----------|----------|------|
| **Sprite.js** | `hold` | `createSpriteObject()` sets `defaultFrames.hold: 3` and `frames.hold: 3`. |
| **Sprite.js** | `hold` | `update()` reads `item.frames.hold` as `baseHold`. |
| **Sprite.js** | `refreshInterval` | `useSpriteSheet()` sets `item.frames.hold = spriteSheet.refreshInterval` (sheet uses `refreshInterval`, runtime still stores it as `hold` on `item.frames`). |
| **SpriteSheetCreate.vue** | `refreshInterval` | Form and payload use `refreshInterval`. |
| **SpriteSheetEdit.vue** | `refreshInterval` | Form uses `itemForm.refreshInterval`. |

So in code: **sprite sheet source of truth** = `refreshInterval`; **runtime frame state** = `hold` on `item.frames` / `item.defaultFrames`.

---

### 2. **Exported fixtures / JSON**

**"hold" only appears on frame objects (runtime-style):**

- **src/agentObject.json**  
  - `defaultFrames.hold: 3` (line 14)  
  - `frames.hold: 3` (line 22)

- **dev_db_fixtures/actions.json** (embedded agent/sprite state)  
  - `defaultFrames.hold: 3` (line 503)  
  - `frames.hold: 1` and `frames.hold: 3` (lines 603, 503)

**"refreshInterval" everywhere else (schema/sprite-sheet level):**

- **Sprite sheets:**  
  `api/data/spritesheets.json`, `dev_db_fixtures/spritesheets.json` → every sheet has `"refreshInterval": N`.
- **Scenes:**  
  `api/data/scene1.json`, `scene2.json`, `scene3.json` → under animation set sheets, only `"refreshInterval"`.
- **Agent/sprite dumps:**  
  `src/agentObject.json` → inside `animationSet.sheets[id]` only `"refreshInterval"` (e.g. lines 33, 41, …).  
  Same in **dev_db_fixtures/actions.json** for embedded `animationSet.sheets[*]` → only `"refreshInterval"`.

So in fixtures:

- **Sheet/schema level** (how long to show each image in the definition): **refreshInterval** only.
- **Runtime frame state** (current `defaultFrames` / `frames` on an agent): **hold** in the dumps you have.

---

### 3. **Data flow**

- **Creating agents in code:**  
  `createSpriteObject()` sets `frames.hold = 3` (and same for defaultFrames).  
  When a sheet is applied, `useSpriteSheet()` does `item.frames.hold = spriteSheet.refreshInterval`, so the **name** on the runtime object is always `hold`.
- **Dump:**  
  You dump `item.frames` / `item.defaultFrames`, so you get `hold` in JSON (as in agentObject.json and actions.json).
- **Load:**  
  If you just assign the parsed JSON back onto the agent, you get `item.frames.hold` (and possibly `item.defaultFrames.hold`) from the file. The code only reads `item.frames.hold`, so **old dumps that use `hold` on frame objects keep working**.

---

### 4. **Backwards compatibility**

- **Existing fixtures:**  
  - Anything that has `frames.hold` / `defaultFrames.hold` (e.g. agentObject.json, actions.json) continues to work with current Sprite.js, which reads `item.frames.hold`.
- **If you standardize on `refreshInterval` in code and runtime:**  
  You’d change Sprite.js (and any creation code) to use `refreshInterval` on `item.frames` instead of `hold`. Then:
  - **New dumps** would have `refreshInterval` on frame objects.
  - **Old dumps** that only have `hold` on frame objects would break unless you **support both when loading**: e.g. when building or reading `item.frames`, set  
    `item.frames.refreshInterval = item.frames.refreshInterval ?? item.frames.hold`  
    (and same for `defaultFrames` if you use it). That way old JSON with `hold` and new JSON with `refreshInterval` both work.
- **Schema/docs:**  
  Your schema (e.g. agentObjectSchema.json) and any docs can declare the canonical name (e.g. `refreshInterval`) and treat `hold` as a legacy alias for load/dump if you want to keep running old commits without rewriting their JSON.

So: **hold** = legacy name on runtime frame state and in exported frame objects; **refreshInterval** = name used everywhere at the sprite-sheet/schema level and in forms. For running old simulations, either keep reading `hold` on `item.frames` (current behavior) or add a one-line fallback when loading so both `hold` and `refreshInterval` are accepted on frame objects.