/**
 * Plain JS simulation world — authoritative graph for the canvas / rAF loop.
 * Pinia is synced from here after scene load (syncWorldToStore) so Vue forms
 * share the same object references where possible.
 */

/** Plain-JS simulation graph + canvas chrome (see syncWorldToStore for Pinia fields). */
export function createWorld () {
  return {
    dayNumber: 1,
    conditions: [],
    actions: [],
    agentItems: {},
    agentTypes: {},
    agentMenuButtons: [],
    animationSets: [],
    spriteSheets: [],
    sensors: [],
    agentUtilityFunctions: [],
    ungroupedRecurringChanges: [],
    groupedRecurringChanges: {},
    firstActions: {},
    agentProperties: [],
    propertyChanges: [],
    actionSequences: [],
    itemMenu: null,
    deleteButton: null
  }
}

/**
 * Clear world lists before hydrating a new scene (mirrors clearSceneFixtureState scope).
 * @param {object} world
 * @param {{ dayNumber?: number }} [store] — optional Pinia store to copy dayNumber from
 */
export function resetWorld (world, store = null) {
  world.conditions = []
  world.actions = []
  world.agentItems = {}
  world.agentTypes = {}
  world.agentMenuButtons = []
  world.itemMenu = null
  world.deleteButton = null
  world.animationSets = []
  world.spriteSheets = []
  world.sensors = []
  world.agentUtilityFunctions = []
  world.ungroupedRecurringChanges = []
  world.groupedRecurringChanges = {}
  world.firstActions = {}
  world.agentProperties = []
  world.propertyChanges = []
  world.actionSequences = []
  world.dayNumber = store?.dayNumber ?? 1
}

/** Same logic as Pinia groupRecurringChanges (including legacy concat branch). */
export function groupRecurringChangesOnWorld (world) {
  world.groupedRecurringChanges = {}
  for (const change of world.ungroupedRecurringChanges) {
    if (world.groupedRecurringChanges[change.frameInterval] === undefined) {
      world.groupedRecurringChanges[change.frameInterval] = [
        {
          agentType: change.agentType,
          property: change.property,
          change: change.change
        }
      ]
    } else {
      world.groupedRecurringChanges[change.frameInterval].concat[
        {
          agentType: change.agentType,
          property: change.property,
          change: change.change
        }
      ]
    }
  }
}

/**
 * Copy world references into Pinia so Vue forms and templates see the same objects.
 * @param {import('pinia').Store} store
 * @param {object} world
 */
export function syncWorldToStore (store, world) {
  store.dayNumber = world.dayNumber
  store.conditions = world.conditions
  store.actions = world.actions
  store.agentItems = world.agentItems
  store.agentTypes = world.agentTypes
  store.agentMenuButtons = world.agentMenuButtons
  store.animationSets = world.animationSets
  store.spriteSheets = world.spriteSheets
  store.sensors = world.sensors
  store.agentUtilityFunctions = world.agentUtilityFunctions
  store.ungroupedRecurringChanges = world.ungroupedRecurringChanges
  store.groupedRecurringChanges = world.groupedRecurringChanges
  store.firstActions = world.firstActions
  store.agentProperties = world.agentProperties
  store.propertyChanges = world.propertyChanges
  store.actionSequences = world.actionSequences
  store.itemMenu = world.itemMenu
  store.deleteButton = world.deleteButton
}
