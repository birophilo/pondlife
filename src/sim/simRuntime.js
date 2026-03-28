/**
 * Plan 3 Phase B — imperative sim + canvas + rAF. No Vue imports.
 * Vue calls createSimRuntime() from SimView setup, then attachCanvas / destroy from lifecycle hooks.
 */

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

const backgroundColor = 'rgb(220, 220, 220)'
const dayLength = 1000
const UPDATE_AGENT_KNOWLEDGE_EVERY_X_FRAMES = 10

export function createSimRuntime ({ store, fpsRefs }) {
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

  let lastRafId = null
  let destroyed = false

  let onMouseMove
  let onCanvasClick
  let onDocumentKeydown

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

  const getGlobals = () => ({
    globalSpeed: store.GlobalSettings.globalSpeed,
    animationFrameId: currentAnimationFrameId
  })

  const loadAgentsAndFixtures = () => {
    loadAgentsAndFixturesFromScene({ store, getGlobals, agentHandler })
  }

  const renderAgents = (drawOrUpdate) => {
    let ySortArray = []
    for (let agentTypeName of Object.keys(store.agentItems)) {
      ySortArray = ySortArray.concat(store.agentItems[agentTypeName])
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
    for (let [frameInterval, effectArray] of Object.entries(store.groupedRecurringChanges)) {
      if (frameId % frameInterval === 0) {
        for (let effect of effectArray) {
          for (let agent of store.agentItems[effect.agentType]) {
            agent.stateData[effect.property] += effect.change
          }
        }
      }
    }
  }

  const updateAgentKnowledge = (agent) => {
    const agentTypeNames = Object.keys(store.agentTypes)
    const sensor = store.sensors.find((s) => s.id === agent.agentType.sensor)
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
      for (let ag of store.agentItems[agentTypeName]) {
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
    store.dayNumber += 1
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
    const agentItems = store.agentItems[agentTypeName]
    const num = agentItems.length + 1
    let newAgent = createAgentObject(
      null,
      store.agentTypes[agentTypeName],
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
      store,
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
    const agentItems = store.agentItems[agentTypeName]
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
    if (destroyed) return

    let frameId

    if (store.sceneIsPaused === true) {
      frameId = requestAnimationFrame(() => console.log('PAUSED'))
    } else {
      lastRafId = requestAnimationFrame(animate)
      frameId = lastRafId
    }

    let hover = false

    c.fillStyle = backgroundColor
    c.fillRect(0, 0, canvas.width, canvas.height)

    currentAnimationFrameId = frameId

    for (let agentTypeName of Object.keys(store.agentItems)) {
      for (let agent of store.agentItems[agentTypeName]) {
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

    for (let agentTypeName of Object.keys(store.agentTypes)) {
      for (let agent of store.agentItems[agentTypeName]) {
        if (agent.agentType.name === 'customer') {
          if (agent.currentStateName === 'idle' || agent.currentAction === null) {
            const [nextActionId, actionObjectType] = chooseNextActionByUtility({ store, agent })
            if (nextActionId !== null) {
              let matchingAction
              if (actionObjectType === 'actionSequence') {
                matchingAction = store.actionSequences.find((actSeq) => actSeq.id === nextActionId)
                const nextActionName = matchingAction.actions[0]
                const nextAction = store.actions.find((a) => a.actionName === nextActionName)
                agent.currentActionSequence = matchingAction
                cloneAction(nextAction, agent)
              } else {
                matchingAction = store.actions.find((action) => action.id === nextActionId)
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
              store,
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
                store,
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

        const isInArea = pointIsInArea(store.mouse, agent.collisionArea)
        if (isInArea) hover = true
      }
    }

    applyTickEffects(tickEffects, { store, deleteAgent, addAgent })

    store.itemMenu.update(c, store.agentMenuButtons.length + 1)

    for (let i = 0; i < store.agentMenuButtons.length; i++) {
      const button = store.agentMenuButtons[i]
      button.update(c, i)
      const isInArea = pointIsInArea(store.mouse, button.area)
      if (isInArea) hover = true
    }

    if (store.agentPreview) store.agentPreview.update(c, store.mouse)

    if (pointIsInArea(store.mouse, store.deleteButton.area)) hover = true

    if (store.selectionMode === true) hover = true

    store.deleteButton.update(c, store.agentMenuButtons.length, store.deleteMode)

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

    onMouseMove = (event) => {
      store.mouse.x = event.offsetX
      store.mouse.y = event.offsetY
    }

    onCanvasClick = (event) => {
      const point = { x: event.offsetX, y: event.offsetY }

      if (store.placingAgent) {
        const isInMenuArea = pointIsInArea(point, store.itemMenu.area)
        if (isInMenuArea === false) {
          const agentTypeName = store.agentPreview.agentType.name
          const position = {
            x: store.mouse.x - store.agentTypes[agentTypeName].width / 2,
            y: store.mouse.y - store.agentTypes[agentTypeName].height / 2
          }
          addAgent(agentTypeName, position)
        }
      }

      for (let agentTypeName of Object.keys(store.agentTypes)) {
        selectOrDeleteAgent(agentTypeName, point)
      }

      for (let i = 0; i < store.agentMenuButtons.length; i++) {
        const isInArea = pointIsInArea(point, store.agentMenuButtons[i].area)

        if (isInArea && !store.agentPreview) {
          const agentTypeName = store.agentMenuButtons[i].name
          store.agentPreview = new AgentPreview(store.agentTypes[agentTypeName])
          store.placingAgent = true
          break
        } else if (isInArea && store.agentPreview) {
          store.placingAgent = false
          store.agentPreview = null
        }
      }

      const isInArea = pointIsInArea(point, store.deleteButton.area)
      if (isInArea) {
        store.deleteMode = !store.deleteMode
      }

      if (store.selectionMode === true) {
        store.selectedPoint = {
          x: store.mouse.x,
          y: store.mouse.y
        }
      }
    }

    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('click', onCanvasClick)
  }

  const attachDocumentListeners = () => {
    onDocumentKeydown = (e) => {
      if (e.code === 'Escape' && store.placingAgent === true) {
        store.placingAgent = false
        store.agentPreview = null
      }
    }
    document.addEventListener('keydown', onDocumentKeydown)
  }

  const playScene = () => {
    store.sceneIsPlaying = true
    store.sceneIsPaused = false

    for (let atName of Object.keys(store.agentTypes)) {
      const firstActionId = store.firstActions[atName]
      if (firstActionId) {
        const action = store.actions.find((a) => a.id === firstActionId)
        if (action === undefined) {
          throw new Error("Play scene: Can't find action")
        }
        for (let agent of store.agentItems[atName]) {
          cloneAction(action, agent)
        }
      }
    }

    startAnimationLoop()
  }

  const pauseScene = () => {
    store.sceneIsPlaying = false
    store.sceneIsPaused = true
  }

  const unPauseScene = () => {
    store.sceneIsPlaying = true
    store.sceneIsPaused = false
    startAnimationLoop()
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
    destroyed = true
    cancelAnimationLoop()
    if (canvas && onMouseMove) {
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('click', onCanvasClick)
    }
    if (onDocumentKeydown) {
      document.removeEventListener('keydown', onDocumentKeydown)
    }
    onMouseMove = null
    onCanvasClick = null
    onDocumentKeydown = null
    canvas = null
    c = null
  }

  return {
    attachCanvas,
    attachDocumentListeners,
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
