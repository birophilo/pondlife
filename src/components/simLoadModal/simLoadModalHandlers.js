import { markRaw } from 'vue'
import api from '@/apiCrud.js'
import { AgentMenuIcon } from '@/classes/SelectionMenu.js'
import { SIM_LOAD_MODAL_KINDS } from '@/components/simLoadModal/simLoadModalColumns.js'

function sheetRefId (ref) {
  if (ref == null || ref === '') return null
  return typeof ref === 'string' ? ref : ref.id
}

function resolveAnimationSetSheets (animationSet, spriteSheets) {
  const resolved = { ...animationSet, sheets: { ...animationSet.sheets } }
  for (const direction of Object.keys(resolved.sheets)) {
    const id = sheetRefId(resolved.sheets[direction])
    if (!id) continue
    const sheet = spriteSheets.find((s) => s.id === id)
    resolved.sheets[direction] = sheet ?? id
  }
  return resolved
}

async function loadAgentType (agentType, store) {
  const atName = agentType.name
  store.agentTypes[atName] = agentType
  store.agentItems[atName] = []
  store.closeLoadSimObjectModal()

  store.agentMenuButtons.push(
    markRaw(
      new AgentMenuIcon({
        menu: store.itemMenu,
        i: store.agentMenuButtons.length,
        name: atName,
        agentType: store.agentTypes[atName]
      })
    )
  )

  await store.saveScene()
}

async function loadSpriteSheet (spriteSheet, store) {
  if (!store.spriteSheets.some((s) => s.id === spriteSheet.id)) {
    store.spriteSheets.push(spriteSheet)
    await store.saveScene()
  }
  store.closeLoadSimObjectModal()
}

async function loadAnimationSet (animationSet, store, context) {
  if (store.animationSets.some((a) => a.id === animationSet.id)) {
    store.closeLoadSimObjectModal()
    return
  }

  const allSpriteSheets = context.allSpriteSheets ?? []
  for (const ref of Object.values(animationSet.sheets ?? {})) {
    const id = sheetRefId(ref)
    if (!id) continue
    if (store.spriteSheets.some((s) => s.id === id)) continue
    const sheet = allSpriteSheets.find((s) => s.id === id)
    if (sheet) {
      store.spriteSheets.push(sheet)
    }
  }

  store.animationSets.push(
    resolveAnimationSetSheets(animationSet, store.spriteSheets)
  )
  await store.saveScene()
  store.closeLoadSimObjectModal()
}

async function loadSensor (sensor, store) {
  if (!store.sensors.some((s) => s.id === sensor.id)) {
    store.sensors.push(sensor)
    await store.saveScene()
  }
  store.closeLoadSimObjectModal()
}

async function loadUtilityFunction (utilityFunction, store) {
  if (!store.agentUtilityFunctions.some((uf) => uf.id === utilityFunction.id)) {
    store.agentUtilityFunctions.push({ ...utilityFunction })
    await store.saveScene()
  }
  store.closeLoadSimObjectModal()
}

async function ensurePropertyChangesForAction (action, store) {
  const changeIds = action.propertyChanges ?? []
  for (const changeId of changeIds) {
    if (typeof changeId !== 'string' || changeId === '') continue
    if (store.propertyChanges.some((pc) => pc.id === changeId)) continue
    const propertyChange = await api.getPropertyChange(changeId)
    if (propertyChange?.error) continue
    store.propertyChanges.push(propertyChange)
  }
}

async function loadAction (action, store) {
  if (store.actions.some((a) => a.id === action.id)) {
    store.closeLoadSimObjectModal()
    return
  }

  await ensurePropertyChangesForAction(action, store)

  store.actions.push({
    ...action,
    agent: null,
    inProgress: false,
    isComplete: false
  })
  await store.saveScene()
  store.closeLoadSimObjectModal()
}

async function loadCondition (condition, store) {
  if (store.conditions.some((c) => c.id === condition.id)) {
    store.closeLoadSimObjectModal()
    return
  }

  store.conditions.push({
    ...condition,
    agent: null
  })
  await store.saveScene()
  store.closeLoadSimObjectModal()
}

function applyAgentPropertyToScene (agentProperty, store) {
  for (const agentTypeName of agentProperty.agentTypes ?? []) {
    const agentItems = store.agentItems[agentTypeName] ?? []
    for (const agent of agentItems) {
      agent.stateData[agentProperty.name] = agentProperty.initialValue
    }

    const agentType = store.agentTypes[agentTypeName]
    if (!agentType) continue
    if (!agentType.properties) {
      agentType.properties = []
    }
    if (!agentType.properties.includes(agentProperty.name)) {
      agentType.properties.push(agentProperty.name)
    }
  }
}

async function loadAgentProperty (agentProperty, store) {
  if (store.agentProperties.some((p) => p.id === agentProperty.id)) {
    store.closeLoadSimObjectModal()
    return
  }

  store.agentProperties.push({ ...agentProperty })
  applyAgentPropertyToScene(agentProperty, store)
  await store.saveScene()
  store.closeLoadSimObjectModal()
}

async function loadPropertyChange (propertyChange, store) {
  if (!store.propertyChanges) {
    store.propertyChanges = []
  }
  if (store.propertyChanges.some((pc) => pc.id === propertyChange.id)) {
    store.closeLoadSimObjectModal()
    return
  }

  store.propertyChanges.push({ ...propertyChange, agent: null })
  await store.saveScene()
  store.closeLoadSimObjectModal()
}

async function loadRecurringChange (recurringChange, store) {
  if (store.ungroupedRecurringChanges.some((rc) => rc.id === recurringChange.id)) {
    store.closeLoadSimObjectModal()
    return
  }

  store.ungroupedRecurringChanges.push({ ...recurringChange })
  store.groupRecurringChanges()
  await store.saveScene()
  store.closeLoadSimObjectModal()
}

const SIM_LOAD_HANDLERS = {
  [SIM_LOAD_MODAL_KINDS.agentType]: loadAgentType,
  [SIM_LOAD_MODAL_KINDS.spriteSheet]: loadSpriteSheet,
  [SIM_LOAD_MODAL_KINDS.animationSet]: loadAnimationSet,
  [SIM_LOAD_MODAL_KINDS.sensor]: loadSensor,
  [SIM_LOAD_MODAL_KINDS.utilityFunction]: loadUtilityFunction,
  [SIM_LOAD_MODAL_KINDS.action]: loadAction,
  [SIM_LOAD_MODAL_KINDS.condition]: loadCondition,
  [SIM_LOAD_MODAL_KINDS.propertyChange]: loadPropertyChange,
  [SIM_LOAD_MODAL_KINDS.recurringChange]: loadRecurringChange,
  [SIM_LOAD_MODAL_KINDS.agentProperty]: loadAgentProperty
}

/**
 * Apply scene load for a row selected in SimObjectLoadModal.
 */
export async function applySimObjectLoadSelection (kind, item, store, context = {}) {
  const handler = SIM_LOAD_HANDLERS[kind]
  if (!handler) {
    console.warn(`No sim load handler for kind: ${kind}`)
    store.closeLoadSimObjectModal()
    return
  }
  await handler(item, store, context)
}
