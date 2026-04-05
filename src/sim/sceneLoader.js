import { markRaw } from 'vue'
import { createAgentObject } from '@/classes/Agent.js'
import { AgentMenu, AgentMenuIcon, DeleteButton } from '@/classes/SelectionMenu.js'
import { resetWorld, groupRecurringChangesOnWorld, syncWorldToStore } from '@/sim/world.js'

export function loadAgentsAndFixtures ({ store, world, getGlobals, agentHandler }) {
  const raw = store.sceneData
  if (raw == null || typeof raw !== 'object') {
    return
  }

  resetWorld(world, store)

  const conditions = raw.conditions ?? []
  const animationSets = raw.animationSets ?? []
  const spritesheets = raw.spritesheets ?? []
  const sensors = raw.sensors ?? []
  const agentTypes = raw.agentTypes ?? []
  const agentInstances = raw.agentInstances ?? {}
  const firstActions = { ...(raw.firstActions ?? {}) }
  const agentProperties = raw.agentProperties ?? []
  const propertyChanges = raw.propertyChanges ?? []
  const utilityFunctions = raw.utilityFunctions ?? []
  const actionSequences = raw.actionSequences ?? []
  const recurringChanges = raw.recurringChanges ?? []
  const actions = raw.actions ?? []

  for (const condition of conditions) {
    const newCondition = { ...condition }
    newCondition.agent = null
    world.conditions.push(newCondition)
  }

  world.animationSets = animationSets
  world.spriteSheets = spritesheets

  for (const animSet of world.animationSets) {
    for (const sheet in animSet.sheets) {
      const spriteSheet = world.spriteSheets.find((sh) => sh.id === animSet.sheets[sheet])
      animSet.sheets[sheet] = spriteSheet
    }
  }

  world.sensors = [...sensors]

  for (const agentType of agentTypes) {
    world.agentTypes[agentType.name] = agentType
  }

  for (const agentTypeName of Object.keys(world.agentTypes)) {
    const animationSetId = world.agentTypes[agentTypeName].animationSet
    const animationSet = world.animationSets.find((a) => a.id === animationSetId)
    world.agentTypes[agentTypeName].animationSet = animationSet
  }

  for (const agentTypeName of Object.keys(world.agentTypes)) {
    world.agentItems[agentTypeName] = []
    if (agentInstances[agentTypeName] !== undefined) {
      for (let i = 0; i < agentInstances[agentTypeName].length; i++) {
        const item = agentInstances[agentTypeName][i]

        const newAgent = createAgentObject(
          item.id,
          world.agentTypes[agentTypeName],
          { x: item.position.x, y: item.position.y },
          i + 1,
          getGlobals()
        )

        world.agentItems[agentTypeName].push(newAgent)
        agentHandler.useSpriteSheet('idle', newAgent)
      }
    }
  }

  world.firstActions = firstActions
  world.agentProperties = [...agentProperties]
  world.propertyChanges = [...propertyChanges]
  world.agentUtilityFunctions = [...utilityFunctions]
  world.actionSequences = [...actionSequences]

  world.ungroupedRecurringChanges = [...recurringChanges]

  groupRecurringChangesOnWorld(world)

  for (const property of world.agentProperties) {
    for (const agentTypeName of property.agentTypes) {
      const agentItems = world.agentItems[agentTypeName]
      for (const agent of agentItems) {
        agent.stateData[property.name] = property.initialValue
      }

      if (!world.agentTypes[agentTypeName].properties) {
        world.agentTypes[agentTypeName].properties = []
      }
      world.agentTypes[agentTypeName].properties.push(property.name)
    }
  }

  world.actions = [...actions]

  world.itemMenu = markRaw(new AgentMenu())

  const agentTypeButtonNames = Object.keys(world.agentTypes).filter((name) => name !== 'world')

  for (let i = 0; i < agentTypeButtonNames.length; i++) {
    const agentName = agentTypeButtonNames[i]
    world.agentMenuButtons.push(
      markRaw(
        new AgentMenuIcon({
          menu: world.itemMenu,
          i,
          name: agentName,
          agentType: world.agentTypes[agentName]
        })
      )
    )
  }

  world.deleteButton = markRaw(
    new DeleteButton({
      menu: world.itemMenu,
      i: world.agentMenuButtons.length
    })
  )

  syncWorldToStore(store, world)
}
