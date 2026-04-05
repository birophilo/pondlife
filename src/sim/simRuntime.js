/**
 * Plan 3 Phase B/D/F — imperative sim + canvas + rAF; live HUD tick; pointer via simPointer (Phase F).
 * Vue calls createSimRuntime({ store, world, fpsRefs }); attachCanvas / attachLiveHud; rAF reads `world`.
 * stopSimRuntime on true unmount.
 */

import { markRaw } from 'vue'
import { pointIsInArea, rectanglesOverlap, generateFakeIdString } from '@/utils.js'
import { createAgentObject, AgentHandler } from '@/classes/Agent.js'
import { ConditionHandler } from '@/classes/Condition.js'
import { AgentPreview } from '@/classes/SelectionMenu.js'
import {
  ActionHandler,
  ActionGoToHandler,
  ActionPropertyChangesHandler,
  ActionIntervalHandler,
  ActionSpawnAgentHandler,
  ActionRemoveAgentHandler
} from '@/classes/Action.js'
import api from '@/apiCrud.js'
import { loadAgentsAndFixtures as loadAgentsAndFixturesFromScene } from '@/sim/sceneLoader.js'
import { setDynamicActionTargetAgents, setNextAction, chooseNextActionByUtility } from '@/sim/agentActions.js'
import { applyTickEffects } from '@/sim/tickEffects.js'
import { simPointer } from '@/sim/simPointer.js'

const backgroundColor = 'rgb(220, 220, 220)'
const dayLength = 1000
const UPDATE_AGENT_KNOWLEDGE_EVERY_X_FRAMES = 10

export function createSimRuntime ({ store, world, fpsRefs }) {
  const showFrameRateDiagnostics = fpsRefs.showFrameRateDiagnostics
  const cumulativeAverageFps = fpsRefs.cumulativeAverageFps
  const currentFps = fpsRefs.currentFps

  let canvas
  let c

  let fpsStartTime = 0
  let fpsLastSecondStart = 0
  let fpsFrameCountThisSecond = 0
  let fpsTotalFrames = 0
  let fpsLastDisplayUpdate = 0

  let currentCursor = 'auto'
  let currentAnimationFrameId = 0
  /** Monotonic tick index per play session (used for modulo scheduling; not the browser rAF handle). */
  let simFrameIndex = 0

  let lastRafId = null
  let destroyed = false

  let onMouseMove
  let onCanvasClick
  let onDocumentKeydown

  let canvasPointerListenersAttached = false
  let documentListenerAttached = false

  /** @type {{ update: () => void, destroy: () => void } | null} */
  let liveHud = null

  const agentHandler = new AgentHandler()
  const actionHandler = new ActionHandler()
  const actionHandlers = {
    goTo: new ActionGoToHandler(),
    change: new ActionPropertyChangesHandler(),
    interval: new ActionIntervalHandler(),
    spawnAgent: new ActionSpawnAgentHandler(),
    removeAgent: new ActionRemoveAgentHandler()
  }
  const conditionHandler = new ConditionHandler()

  const tickLiveHud = () => {
    liveHud?.update()
  }

  const attachLiveHud = (api) => {
    liveHud = api
  }

  const getGlobals = () => ({
    globalSpeed: store.GlobalSettings.globalSpeed,
    animationFrameId: currentAnimationFrameId
  })

  const loadAgentsAndFixtures = () => {
    loadAgentsAndFixturesFromScene({ store, world, getGlobals, agentHandler })
  }

  const renderAgents = (drawOrUpdate) => {
    let ySortArray = []
    for (let agentTypeName of Object.keys(world.agentItems)) {
      ySortArray = ySortArray.concat(world.agentItems[agentTypeName])
    }
    ySortArray.sort((a, b) => a.position.y - b.position.y)

    for (let agent of ySortArray) {
      if (drawOrUpdate === 'draw') {
        agentHandler.draw(c, agent)
      } else {
        agentHandler.update(c, {}, getGlobals(), agent)
      }
    }
  }

  const applyScheduledEffects = (frameId) => {
    for (let [frameInterval, effectArray] of Object.entries(world.groupedRecurringChanges)) {
      if (frameId % frameInterval === 0) {
        for (let effect of effectArray) {
          for (let agent of world.agentItems[effect.agentType]) {
            agent.stateData[effect.property] += effect.change
          }
        }
      }
    }
  }

  const updateAgentKnowledge = (agent) => {
    const agentTypeNames = Object.keys(world.agentTypes)
    const sensor = world.sensors.find((s) => s.id === agent.agentType.sensor)
    if (!sensor) return

    const len = sensor.radius
    const vicinityArea = {
      x: agent.center.x - len,
      y: agent.center.y - len,
      width: len * 2,
      height: len * 2
    }

    if (!agent.knowledge) {
      agent.knowledge = { vicinity: { agents: [] } }
    }
    agent.knowledge.vicinity.agents = []

    for (let agentTypeName of agentTypeNames) {
      for (let ag of world.agentItems[agentTypeName]) {
        const agentArea = { x: ag.position.x, y: ag.position.y, width: ag.width, height: ag.height }
        if (agent.id !== ag.id) {
          if (rectanglesOverlap(vicinityArea, agentArea)) {
            agent.knowledge.vicinity.agents.push(ag.id)
          }
        }
      }
    }
  }

  const endDay = () => {
    world.dayNumber += 1
    store.dayNumber = world.dayNumber
  }

  const deleteAgent = async (agent, agentItems, i) => {
    if (store.sceneIsPlaying !== true) {
      await api.deleteAgent(agent.id)
      agentItems.splice(i, 1)
      await store.saveScene()
    } else {
      agentItems.splice(i, 1)
    }
  }

  const addAgent = async (agentTypeName, position) => {
    const agentItems = world.agentItems[agentTypeName]
    const num = agentItems.length + 1
    let newAgent = createAgentObject(
      null,
      world.agentTypes[agentTypeName],
      position,
      num,
      getGlobals()
    )
    agentHandler.useSpriteSheet('idle', newAgent)

    if (store.sceneIsPlaying !== true) {
      const newItem = await api.createAgent({ agentType: agentTypeName, position })
      newAgent.id = newItem.id
      agentItems.push(newAgent)
      await store.saveScene()
    } else {
      newAgent.id = generateFakeIdString()
      agentItems.push(newAgent)
    }
  }

  const cloneAction = (action, agent) => {
    const ok = setDynamicActionTargetAgents({
      world,
      action,
      agent,
      agentHandler,
      lastAction: agent.currentAction ?? null
    })
    if (ok) {
      agent.currentAction = actionHandler.clone(action, agent)
    }
  }

  const selectOrDeleteAgent = (agentTypeName, point) => {
    const agentItems = world.agentItems[agentTypeName]
    for (let i = 0; i < agentItems.length; i++) {
      const agent = agentItems[i]
      const isInArea = pointIsInArea(point, agent.collisionArea)

      if (isInArea) {
        store.selectedAgent = agent
        if (store.selectionMode === true) store.selectedTargetAgent = agent
      }
      if (isInArea && store.deleteMode === true) {
        deleteAgent(agent, agentItems, i)
      }
    }
  }

  const animate = () => {
    if (destroyed) {
      lastRafId = null
      return
    }
    if (!store.sceneIsPlaying) {
      lastRafId = null
      return
    }

    simFrameIndex += 1
    const frameId = simFrameIndex
    currentAnimationFrameId = frameId

    let hover = false

    c.fillStyle = backgroundColor
    c.fillRect(0, 0, canvas.width, canvas.height)

    for (let agentTypeName of Object.keys(world.agentItems)) {
      for (let agent of world.agentItems[agentTypeName]) {
        if (frameId % UPDATE_AGENT_KNOWLEDGE_EVERY_X_FRAMES === 0) {
          updateAgentKnowledge(agent)
        }
      }
    }

    applyScheduledEffects(frameId)
    renderAgents('update')

    const tickEffects = []
    const emitTickEffect = (effect) => {
      tickEffects.push(effect)
    }

    for (let agentTypeName of Object.keys(world.agentTypes)) {
      for (let agent of world.agentItems[agentTypeName]) {
        if (agent.agentType.name === 'customer') {
          if (agent.currentStateName === 'idle' || agent.currentAction === null) {
            const [nextActionId, actionObjectType] = chooseNextActionByUtility({ world, agent })
            if (nextActionId !== null) {
              let matchingAction
              if (actionObjectType === 'actionSequence') {
                matchingAction = world.actionSequences.find((actSeq) => actSeq.id === nextActionId)
                const nextActionName = matchingAction.actions[0]
                const nextAction = world.actions.find((a) => a.actionName === nextActionName)
                agent.currentActionSequence = matchingAction
                cloneAction(nextAction, agent)
              } else {
                matchingAction = world.actions.find((action) => action.id === nextActionId)
                cloneAction(matchingAction, agent)
              }
            } else {
              agentHandler.idle(agent)
            }
          }
        }

        if (agent.currentAction) {
          const handler = actionHandlers[agent.currentAction.actionType]
          if (handler.defaultCompletionCheckPasses(agent.currentAction, agentHandler) === true) {
            setNextAction({
              agent,
              world,
              conditionHandler,
              actionHandler,
              agentHandler
            })
          }

          if (agent.currentAction && agent.currentAction.isComplete === false) {
            const handler = actionHandlers[agent.currentAction.actionType]

            if (agent.currentAction.inProgress === false) {
              agent.currentAction.inProgress = true
              handler.start(
                agent.currentAction,
                getGlobals(),
                agentHandler,
                world,
                emitTickEffect
              )
            } else {
              handler.check(
                agent.currentAction,
                agent.stateData,
                getGlobals(),
                agentHandler
              )
            }
          }
        }

        if (agent.currentAction === null && agent.currentStateName !== 'idle') {
          agentHandler.idle(agent)
        }

        const isInArea = pointIsInArea(simPointer, agent.collisionArea)
        if (isInArea) hover = true
      }
    }

    applyTickEffects(tickEffects, { world, deleteAgent, addAgent })

    if (world.itemMenu && world.deleteButton) {
      world.itemMenu.update(c, world.agentMenuButtons.length + 1)

      for (let i = 0; i < world.agentMenuButtons.length; i++) {
        const button = world.agentMenuButtons[i]
        button.update(c, i)
        const isInArea = pointIsInArea(simPointer, button.area)
        if (isInArea) hover = true
      }

      if (store.agentPreview) store.agentPreview.update(c, simPointer)

      if (world.deleteButton.area && pointIsInArea(simPointer, world.deleteButton.area)) {
        hover = true
      }

      if (store.selectionMode === true) hover = true

      world.deleteButton.update(c, world.agentMenuButtons.length, store.deleteMode)
    } else if (store.selectionMode === true) {
      hover = true
    }

    const nextCursor = hover ? 'pointer' : 'auto'
    if (nextCursor !== currentCursor) {
      currentCursor = nextCursor
      canvas.style.cursor = currentCursor
    }

    if (showFrameRateDiagnostics.value) {
      const now = performance.now()
      if (fpsTotalFrames === 0) {
        fpsStartTime = now
        fpsLastSecondStart = now
        fpsLastDisplayUpdate = now
      }
      fpsTotalFrames++
      fpsFrameCountThisSecond++
      if (now - fpsLastSecondStart >= 1000) {
        currentFps.value = fpsFrameCountThisSecond
        fpsFrameCountThisSecond = 0
        fpsLastSecondStart = now
      }
      if (now - fpsLastDisplayUpdate >= 500) {
        const elapsedSec = (now - fpsStartTime) / 1000
        cumulativeAverageFps.value = elapsedSec > 0 ? fpsTotalFrames / elapsedSec : 0
        fpsLastDisplayUpdate = now
      }
    }

    if (frameId % dayLength === 0) endDay()

    tickLiveHud()

    if (!destroyed && store.sceneIsPlaying) {
      lastRafId = requestAnimationFrame(animate)
    } else {
      lastRafId = null
    }
  }

  const startAnimationLoop = () => {
    if (destroyed || !canvas) return
    lastRafId = requestAnimationFrame(animate)
  }

  const cancelAnimationLoop = () => {
    if (lastRafId != null) {
      cancelAnimationFrame(lastRafId)
      lastRafId = null
    }
  }

  const ensurePointerHandlers = () => {
    if (onMouseMove) return
    onMouseMove = (event) => {
      simPointer.x = event.offsetX
      simPointer.y = event.offsetY
      if (store.selectionMode === true) {
        store.mouse.x = event.offsetX
        store.mouse.y = event.offsetY
      }
      tickLiveHud()
    }

    onCanvasClick = (event) => {
      const point = { x: event.offsetX, y: event.offsetY }

      if (store.placingAgent && world.itemMenu) {
        const isInMenuArea = pointIsInArea(point, world.itemMenu.area)
        if (isInMenuArea === false) {
          const agentTypeName = store.agentPreview.agentType.name
          const position = {
            x: simPointer.x - world.agentTypes[agentTypeName].width / 2,
            y: simPointer.y - world.agentTypes[agentTypeName].height / 2
          }
          addAgent(agentTypeName, position)
        }
      }

      for (let agentTypeName of Object.keys(world.agentTypes)) {
        selectOrDeleteAgent(agentTypeName, point)
      }

      for (let i = 0; i < world.agentMenuButtons.length; i++) {
        const isInArea = pointIsInArea(point, world.agentMenuButtons[i].area)

        if (isInArea && !store.agentPreview) {
          const agentTypeName = world.agentMenuButtons[i].name
          store.agentPreview = markRaw(new AgentPreview(world.agentTypes[agentTypeName]))
          store.placingAgent = true
          break
        } else if (isInArea && store.agentPreview) {
          store.placingAgent = false
          store.agentPreview = null
        }
      }

      if (world.deleteButton?.area) {
        const isInArea = pointIsInArea(point, world.deleteButton.area)
        if (isInArea) {
          store.deleteMode = !store.deleteMode
        }
      }

      if (store.selectionMode === true) {
        store.selectedPoint = {
          x: simPointer.x,
          y: simPointer.y
        }
      }

      tickLiveHud()
    }
  }

  const attachCanvasPointerListeners = () => {
    if (!canvas || canvasPointerListenersAttached) return
    ensurePointerHandlers()
    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('click', onCanvasClick)
    canvasPointerListenersAttached = true
  }

  const detachCanvasPointerListeners = () => {
    if (!canvas || !canvasPointerListenersAttached) return
    canvas.removeEventListener('mousemove', onMouseMove)
    canvas.removeEventListener('click', onCanvasClick)
    canvasPointerListenersAttached = false
  }

  /** Call once with the mounted <canvas> from SimView; Phase C — avoid reassigning the element from Vue without destroy + re-attach. */
  const attachCanvas = (canvasEl) => {
    if (!canvasEl) {
      console.error('simRuntime: canvas element is missing')
      return
    }
    canvas = canvasEl
    c = canvas.getContext('2d')

    canvas.width = 1000
    canvas.height = 600

    c.fillStyle = backgroundColor
    c.fillRect(0, 0, canvas.width, canvas.height)

    attachCanvasPointerListeners()
  }

  const attachDocumentListeners = () => {
    if (documentListenerAttached) return
    onDocumentKeydown = (e) => {
      if (e.code === 'Escape' && store.placingAgent === true) {
        store.placingAgent = false
        store.agentPreview = null
      }
    }
    document.addEventListener('keydown', onDocumentKeydown)
    documentListenerAttached = true
  }

  const detachDocumentListeners = () => {
    if (!documentListenerAttached || !onDocumentKeydown) return
    document.removeEventListener('keydown', onDocumentKeydown)
    documentListenerAttached = false
  }

  /** Before loading a different simulation id while this runtime stays mounted: stop rAF only. */
  const stopPlaybackForSceneChange = () => {
    if (destroyed) return
    cancelAnimationLoop()
    tickLiveHud()
  }

  /** Leave /sim (keep-alive): stop rAF, detach input, pause if mid-play — scene + agents stay in memory. */
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

  /** Return to /sim after keep-alive cache: reattach listeners only (canvas + context unchanged). */
  const resumeAfterRouteEnter = () => {
    if (destroyed || !canvas) return
    attachCanvasPointerListeners()
    attachDocumentListeners()
    tickLiveHud()
  }

  const playScene = () => {
    if (!world.itemMenu || !world.deleteButton) return

    store.sceneIsPlaying = true
    store.sceneIsPaused = false
    simFrameIndex = 0

    for (let atName of Object.keys(world.agentTypes)) {
      const firstActionId = world.firstActions[atName]
      if (firstActionId) {
        const action = world.actions.find((a) => a.id === firstActionId)
        if (action === undefined) {
          throw new Error("Play scene: Can't find action")
        }
        for (let agent of world.agentItems[atName]) {
          cloneAction(action, agent)
        }
      }
    }

    startAnimationLoop()
    tickLiveHud()
  }

  const pauseScene = () => {
    store.sceneIsPlaying = false
    store.sceneIsPaused = true
    cancelAnimationLoop()
    tickLiveHud()
  }

  const unPauseScene = () => {
    if (!world.itemMenu || !world.deleteButton) return

    store.sceneIsPlaying = true
    store.sceneIsPaused = false
    startAnimationLoop()
    tickLiveHud()
  }

  const resetFpsDiagnostics = () => {
    fpsStartTime = 0
    fpsLastSecondStart = 0
    fpsFrameCountThisSecond = 0
    fpsTotalFrames = 0
    fpsLastDisplayUpdate = 0
    cumulativeAverageFps.value = 0
    currentFps.value = 0
  }

  const destroy = () => {
    if (destroyed) return
    destroyed = true
    cancelAnimationLoop()
    if (liveHud) {
      liveHud.destroy()
      liveHud = null
    }
    detachCanvasPointerListeners()
    detachDocumentListeners()
    onMouseMove = null
    onCanvasClick = null
    onDocumentKeydown = null
    canvas = null
    c = null

    store.sceneIsPlaying = false
    store.sceneIsPaused = false
  }

  return {
    attachCanvas,
    attachDocumentListeners,
    attachLiveHud,
    refreshLiveHud: tickLiveHud,
    suspendForRouteLeave,
    stopPlaybackForSceneChange,
    resumeAfterRouteEnter,
    /** Plan 3 Phase G — full teardown (true unmount). */
    stopSimRuntime: destroy,
    destroy,
    loadAgentsAndFixtures,
    renderAgents,
    getGlobals,
    agentHandler,
    get currentAnimationFrameId () {
      return currentAnimationFrameId
    },
    cloneAction,
    addAgent,
    deleteAgent,
    playScene,
    pauseScene,
    unPauseScene,
    resetFpsDiagnostics
  }
}
