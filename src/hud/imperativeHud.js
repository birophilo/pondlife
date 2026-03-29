/**
 * Plan 3 Phase D — imperative DOM under an empty Vue `ref` host.
 * Vue must not place {{ }} or v-* inside the host; we own children and tear them down in destroy().
 */

/**
 * @param {HTMLElement|null} hostEl
 * @param {() => {
 *   simMode: string,
 *   dayNumber: number,
 *   selectedName: string|null,
 *   currentStateName: string|null,
 *   currentActionName: string|null,
 *   currentActionSequenceName: string|null,
 *   mouseX: number,
 *   mouseY: number
 * }} getSnapshot Readonly snapshot; safe to call every frame from sim rAF.
 * @returns {{ update: () => void, destroy: () => void }}
 */
export function initLiveHud (hostEl, getSnapshot) {
  if (!hostEl) {
    console.error('imperativeHud: host element is missing')
    return {
      update: () => {},
      destroy: () => {}
    }
  }

  while (hostEl.firstChild) {
    hostEl.removeChild(hostEl.firstChild)
  }

  const panel = document.createElement('div')
  panel.className = 'sim-live-hud__panel'

  function makeRow (labelText) {
    const wrap = document.createElement('div')
    wrap.className = 'sim-live-hud__row'
    const label = document.createElement('span')
    label.className = 'sim-live-hud__label'
    label.textContent = labelText
    const value = document.createElement('span')
    value.className = 'sim-live-hud__value'
    wrap.append(label, value)
    return { wrap, value }
  }

  const modeRow = makeRow('sim')
  const dayRow = makeRow('day')
  const agentRow = makeRow('agent')
  const stateRow = makeRow('state')
  const actionRow = makeRow('action')
  const sequenceRow = makeRow('seq')
  const mouseRow = makeRow('mouse')

  panel.append(
    modeRow.wrap,
    dayRow.wrap,
    agentRow.wrap,
    stateRow.wrap,
    actionRow.wrap,
    sequenceRow.wrap,
    mouseRow.wrap
  )
  hostEl.appendChild(panel)

  /** @type {Record<string, string>} */
  let prev = {}

  const display = (key, el, val) => {
    const text =
      val === null || val === undefined || val === '' ? '—' : String(val)
    if (prev[key] === text) return
    prev[key] = text
    el.textContent = text
  }

  const update = () => {
    const s = getSnapshot()
    display('simMode', modeRow.value, s.simMode)
    display('day', dayRow.value, s.dayNumber)
    display('agent', agentRow.value, s.selectedName)
    display('state', stateRow.value, s.currentStateName)
    display('action', actionRow.value, s.currentActionName)
    display('sequence', sequenceRow.value, s.currentActionSequenceName)
    display('mouse', mouseRow.value, `${s.mouseX}, ${s.mouseY}`)
  }

  const destroy = () => {
    prev = {}
    while (hostEl.firstChild) {
      hostEl.removeChild(hostEl.firstChild)
    }
  }

  return { update, destroy }
}
