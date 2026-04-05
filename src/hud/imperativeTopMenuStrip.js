/**
 * Imperative DOM for the top sidebar block: day / speed / FPS strip plus
 * Selected Agent `<details>` (same fields as the canvas HUD; refreshed in `update()`).
 */

/**
 * @param {HTMLElement|null} hostEl
 * @param {{
 *   store: import('pinia').Store,
 *   defaultInterval: { name: string, frames: number },
 *   isEditingDefaultInterval: import('vue').Ref<boolean>,
 *   showFrameRateDiagnostics: import('vue').Ref<boolean>,
 *   cumulativeAverageFps: import('vue').Ref<number>,
 *   currentFps: import('vue').Ref<number>,
 *   onFpsDiagnosticsChange: () => void
 * }} ctx
 * @returns {{ update: () => void, destroy: () => void }}
 */
export function initTopMenuStrip (hostEl, ctx) {
  if (!hostEl) {
    console.error('imperativeTopMenuStrip: host element is missing')
    return {
      update: () => {},
      destroy: () => {}
    }
  }

  while (hostEl.firstChild) {
    hostEl.removeChild(hostEl.firstChild)
  }

  const {
    store,
    defaultInterval,
    isEditingDefaultInterval,
    showFrameRateDiagnostics,
    cumulativeAverageFps,
    currentFps,
    onFpsDiagnosticsChange
  } = ctx

  const section = document.createElement('div')
  section.className = 'menu-section'

  const dayContainer = document.createElement('div')
  dayContainer.className = 'day-container'

  const editWrap = document.createElement('div')
  editWrap.style.display = 'none'
  const editIntro = document.createElement('div')
  editIntro.append('Default time interval:')
  editWrap.appendChild(editIntro)
  editWrap.appendChild(document.createElement('br'))

  const nameLabel = document.createElement('span')
  nameLabel.textContent = 'name: '
  const nameInput = document.createElement('input')
  nameInput.type = 'text'
  nameInput.addEventListener('input', () => {
    defaultInterval.name = nameInput.value
  })
  editWrap.append(nameLabel, nameInput)
  editWrap.appendChild(document.createElement('br'))

  const framesLabel = document.createElement('span')
  framesLabel.textContent = 'frames per interval: '
  const framesInput = document.createElement('input')
  framesInput.type = 'number'
  framesInput.addEventListener('input', () => {
    defaultInterval.frames = Number(framesInput.value)
  })
  editWrap.append(framesLabel, framesInput)

  const viewWrap = document.createElement('div')
  const dayLine = document.createElement('div')
  const dayPrefix = document.createElement('span')
  const dayNumberSpan = document.createElement('span')
  dayNumberSpan.id = 'day-number'
  dayLine.append(dayPrefix, dayNumberSpan)
  const editBtn = document.createElement('button')
  editBtn.type = 'button'
  editBtn.textContent = 'edit'
  editBtn.addEventListener('click', () => {
    isEditingDefaultInterval.value = true
    syncEditModeVisibility()
    nameInput.value = defaultInterval.name
    framesInput.value = String(defaultInterval.frames)
  })
  viewWrap.append(dayLine, editBtn)

  dayContainer.append(editWrap, viewWrap)

  const speedWrap = document.createElement('div')
  speedWrap.className = 'speed-slide-container'
  const speedLabel = document.createElement('div')
  const speedSlider = document.createElement('input')
  speedSlider.type = 'range'
  speedSlider.id = 'sim-speed-slider'
  speedSlider.min = '0'
  speedSlider.max = '200'
  speedSlider.value = String(store.GlobalSettings.globalSpeed)
  const refreshSpeedLabel = () => {
    speedLabel.textContent = `speed: ${store.GlobalSettings.globalSpeed / 100}`
  }
  speedSlider.addEventListener('input', () => {
    store.GlobalSettings.globalSpeed = Number(speedSlider.value)
    refreshSpeedLabel()
  })
  refreshSpeedLabel()
  speedWrap.append(speedLabel, speedSlider)

  const fpsWrap = document.createElement('div')
  fpsWrap.className = 'fps-diagnostics-container'
  const fpsLabel = document.createElement('label')
  const fpsCheckbox = document.createElement('input')
  fpsCheckbox.type = 'checkbox'
  fpsCheckbox.checked = showFrameRateDiagnostics.value
  fpsCheckbox.addEventListener('change', () => {
    showFrameRateDiagnostics.value = fpsCheckbox.checked
    onFpsDiagnosticsChange()
    syncFpsReadingsVisibility()
  })
  fpsLabel.append(fpsCheckbox, document.createTextNode(' frame rate diagnostics'))

  const fpsReadings = document.createElement('div')
  fpsReadings.className = 'fps-readings'
  fpsReadings.style.display = 'none'
  const fpsCumulativeRow = document.createElement('div')
  const fpsCurrentRow = document.createElement('div')
  fpsReadings.append(fpsCumulativeRow, fpsCurrentRow)

  fpsWrap.append(fpsLabel, fpsReadings)

  section.append(dayContainer, speedWrap, fpsWrap)
  hostEl.appendChild(section)

  const selectedDetails = document.createElement('details')
  selectedDetails.className = 'menu-section'
  selectedDetails.id = 'selected-agent-section'
  const selectedSummary = document.createElement('summary')
  selectedSummary.className = 'menu-section-heading'
  selectedSummary.textContent = 'Selected Agent'
  const selectedBody = document.createElement('div')
  selectedDetails.append(selectedSummary, selectedBody)
  hostEl.appendChild(selectedDetails)

  function appendBr (parent) {
    parent.appendChild(document.createElement('br'))
  }

  function appendText (parent, t) {
    parent.appendChild(document.createTextNode(t))
  }

  function rebuildSelectedAgentBody (a) {
    selectedBody.replaceChildren()
    if (!a) {
      appendText(selectedBody, 'none')
      return
    }
    appendText(selectedBody, a.name)
    appendBr(selectedBody)
    appendText(selectedBody, `current action: ${a.currentStateName ?? ''}`)
    appendBr(selectedBody)
    appendText(selectedBody, `current state name: ${a.currentAction?.actionName ?? ''}`)
    appendBr(selectedBody)
    appendBr(selectedBody)
    appendText(selectedBody, `current action sequence: ${a.currentActionSequence?.name ?? ''}`)
    appendBr(selectedBody)
    appendBr(selectedBody)
    for (const [k, v] of Object.entries(a.stateData ?? {})) {
      appendText(selectedBody, `${k}: ${v}`)
      appendBr(selectedBody)
    }
  }

  let prevSelectedSig = ''

  function syncEditModeVisibility () {
    const editing = isEditingDefaultInterval.value
    editWrap.style.display = editing ? '' : 'none'
    viewWrap.style.display = editing ? 'none' : ''
  }

  function syncFpsReadingsVisibility () {
    fpsReadings.style.display = showFrameRateDiagnostics.value ? '' : 'none'
  }

  syncEditModeVisibility()
  syncFpsReadingsVisibility()

  let prevDayPrefix = ''
  let prevDayNum = ''
  let prevCumulative = ''
  let prevCurrent = ''

  const update = () => {
    syncEditModeVisibility()

    const prefix = `${defaultInterval.name}: `
    if (prefix !== prevDayPrefix) {
      prevDayPrefix = prefix
      dayPrefix.textContent = prefix
    }

    const dn = String(store.dayNumber)
    if (dn !== prevDayNum) {
      prevDayNum = dn
      dayNumberSpan.textContent = dn
    }

    if (String(store.GlobalSettings.globalSpeed) !== speedSlider.value) {
      speedSlider.value = String(store.GlobalSettings.globalSpeed)
      refreshSpeedLabel()
    }

    if (fpsCheckbox.checked !== showFrameRateDiagnostics.value) {
      fpsCheckbox.checked = showFrameRateDiagnostics.value
    }
    syncFpsReadingsVisibility()

    if (showFrameRateDiagnostics.value) {
      const c = `${cumulativeAverageFps.value.toFixed(1)} FPS`
      const cur = `${currentFps.value.toFixed(1)} FPS`
      if (c !== prevCumulative) {
        prevCumulative = c
        fpsCumulativeRow.textContent = `cumulative avg: ${c}`
      }
      if (cur !== prevCurrent) {
        prevCurrent = cur
        fpsCurrentRow.textContent = `current: ${cur}`
      }
    }

    const a = store.selectedAgent
    const sig = !a
      ? 'none'
      : JSON.stringify({
        name: a.name,
        currentStateName: a.currentStateName,
        actionName: a.currentAction?.actionName ?? null,
        sequenceName: a.currentActionSequence?.name ?? null,
        stateData: a.stateData ?? {}
      })
    if (sig !== prevSelectedSig) {
      prevSelectedSig = sig
      rebuildSelectedAgentBody(a)
    }
  }

  const destroy = () => {
    prevDayPrefix = ''
    prevDayNum = ''
    prevCumulative = ''
    prevCurrent = ''
    prevSelectedSig = ''
    while (hostEl.firstChild) {
      hostEl.removeChild(hostEl.firstChild)
    }
  }

  return { update, destroy }
}
