OK, I've decided to go with this approach, Plan 3. I have decided not to retain the last two commits on the "retry-vue-router-and-refactor-state" branch, as the results obtained were not sufficient to keep that code, and much will presumably become redundant/replaced by what is implemented next. A question before we begin with the migration plan: I have reverted the code to the state where it was running at 60 FPS before. But today the app is only running at 30 FPS. The diagnostics say the rate is exactly 30 FPS, which suggests some capping by the browser (or something else deliberate) rather than just "it's going as fast as it can", as the speed each time I load the app is exactly 1/2 the speed of optimal 60 FPS. Do you know why this 30 FPS is happening? Incidentally, it is something I noticed sometimes last year during earlier development: sometimes the frame speed just seemed to be half/double what I was used to. Note: I do have a lot of browser windows open and this Cursor program is placing a big demand on system memory usage generally, in case that is relevant.

------------------------------


There’s **nothing in your `animate` / `requestAnimationFrame` chain** that halves the rate: you schedule one `requestAnimationFrame(animate)` per tick (when not paused), and the grep didn’t show any “every 2nd frame” or `30` cap in sim code.

So **a steady ~30 FPS in your diagnostics almost always means `requestAnimationFrame` is only firing ~30 times per second**, not that the sim “could go faster but chose not to.”

---

## Likely causes (environment > code)

### 1. **Display / OS refresh (most common for “exactly half”)**
- **macOS:** **System Settings → Displays** — check **Refresh rate** (e.g. **ProMotion** vs fixed **60 Hz** vs **30 Hz** if available; some setups show **30** for power saving or bad EDID).
- **External monitor:** **4K over HDMI** on some cables/hubs is limited to **30 Hz**; the browser’s rAF aligns with that, so you see **~30 FPS** consistently.
- **“Exactly 30”** fits **“compositor is 30 Hz”** better than random CPU load.

### 2. **Low Power / thermal / battery**
- **Low Power Mode** (Mac) or **Windows battery saver** can reduce what the GPU/compositor does; effects vary by OS/version but can land near **half** refresh in edge cases.

### 3. **Tab / window visibility**
- **Background tabs** are throttled heavily (often **not** a clean 30). If the tab is **foreground** but another window is **full-screen** or the browser is **occluded**, behavior depends on the browser—worth testing with **only** the app tab visible and maximized.

### 4. **DevTools / throttling**
- In Chrome: **Performance** recording can add overhead; there’s also **CPU throttling** in the Performance panel (only while recording if set). Less common: leaving a **throttle** on from a prior profile—worth **closing DevTools** and retesting.

### 5. **Heavy system load (your note)**
- Memory pressure usually gives **jittery** FPS, **not** a stable **30.0** every time—unless the OS/GPU is **consistently** stepping down to a **30 Hz** mode. Still worth a test with **fewer apps** and **Activity Monitor** to see if **WindowServer** / GPU is pegged.

### 6. **Browser / flags**
- Rare: experimental flags or GPU blacklist causing software paths—**try another browser** (Firefox vs Chrome) on the same machine for a quick A/B.

---

## Quick experiments (ordered)

1. **Confirm display refresh** in OS settings (and try **another monitor** or **built-in only** if you use external).
2. **Full-screen app tab**, **DevTools closed**, **Low Power off**, **power plugged in**.
3. **Minimal repro:** `requestAnimationFrame` loop in a **blank tab** (e.g. data URL or tiny static HTML) logging FPS—if that’s also **30**, it’s **almost certainly display/OS/browser compositor**, not Pondlife.
4. **`chrome://gpu`** (Chrome) — note **Graphics Feature Status** for issues.

---

## Side note (unrelated to 30 FPS)

You use **`frameId` from `requestAnimationFrame`** in `frameId % UPDATE_AGENT_KNOWLEDGE_EVERY_X_FRAMES` and similar. That value is a **browser handle**, **not** a monotonic frame counter, so **`%` for “every N frames” is unreliable**. Worth fixing later with your own `let simFrame = 0; simFrame++` in `animate`. It doesn’t explain stable 30 FPS.

---

**Bottom line:** **Stable ~30 FPS** with a normal rAF loop usually means **the browser is only compositing / firing rAF at ~30 Hz** — start with **display refresh and external display limits**, then **power/visibility**, then a **minimal rAF test** to separate Pondlife from the machine.