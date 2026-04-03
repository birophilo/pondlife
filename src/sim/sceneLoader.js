import { markRaw } from 'vue'
import { createAgentObject } from '@/classes/Agent.js'
import { AgentMenu, AgentMenuIcon, DeleteButton } from '@/classes/SelectionMenu.js'

export function loadAgentsAndFixtures({ store, getGlobals, agentHandler}) {
  const raw = store.sceneData
  if (raw == null || typeof raw !== 'object') {
    return
  }

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

  for (let condition of conditions) {
    let newCondition = {...condition}
    newCondition.agent = null
    store.conditions.push(newCondition)
  }

  // populate spriteSheets and animationSets
  store.animationSets = animationSets
  store.spriteSheets = spritesheets

  // replace animationSet spriteSheet ID references with spriteSheet objects
  for (let animSet of store.animationSets) {
    for (let sheet in animSet.sheets) {
      const spriteSheet = store.spriteSheets.find(sh => sh.id === animSet.sheets[sheet])
      animSet.sheets[sheet] = spriteSheet
    }
  }

  store.sensors = [...sensors]

  for (let agentType of agentTypes) {
    store.agentTypes[agentType.name] = agentType
  }

  for (let agentTypeName of Object.keys(store.agentTypes)) {
    const animationSetId = store.agentTypes[agentTypeName].animationSet
    const animationSet = store.animationSets.find(a => a.id === animationSetId)
    store.agentTypes[agentTypeName].animationSet = animationSet
  }

  // populate agents from initial data
  for (let agentTypeName of Object.keys(store.agentTypes)) {
    store.agentItems[agentTypeName] = []
    if (agentInstances[agentTypeName] !== undefined) {
      for (let i = 0; i < agentInstances[agentTypeName].length; i++) {

        const item = agentInstances[agentTypeName][i]

        let newAgent = createAgentObject(
          item.id,
          store.agentTypes[agentTypeName],  // agentType object
          {x: item.position.x, y: item.position.y},  // position
          i + 1,  // num
          getGlobals(), // globals
        )

        store.agentItems[agentTypeName].push(newAgent)
        agentHandler.useSpriteSheet('idle', newAgent)
      }
    }
  }

  store.firstActions = firstActions
  store.agentProperties = [...agentProperties]
  store.propertyChanges = [...propertyChanges]
  store.agentUtilityFunctions = [...utilityFunctions]
  store.actionSequences = [...actionSequences]

  store.ungroupedRecurringChanges = [...recurringChanges]

  store.groupRecurringChanges()

  // set initial properties, for each agent, of each agent type, for each property
  for (let property of store.agentProperties) {

    for (let agentTypeName of property.agentTypes) {
      // set initial property values for each agent
      const agentItems = store.agentItems[agentTypeName]
      for (let agent of agentItems) {
        agent.stateData[property.name] = property.initialValue
      }

      // add properties to agentType model (this currently only in memory, not a DB field)
      if (!store.agentTypes[agentTypeName].properties) {
        store.agentTypes[agentTypeName].properties = []
      }
      store.agentTypes[agentTypeName].properties.push(property.name)
    }
  }

  // populate actions
  store.actions = [...actions]

  store.itemMenu = markRaw(new AgentMenu())

  const agentTypeButtonNames = Object.keys(store.agentTypes).filter(name => name !== 'world')

  for (let i = 0; i < agentTypeButtonNames.length; i++) {
    const agentName = agentTypeButtonNames[i]
    store.agentMenuButtons.push(
      markRaw(
        new AgentMenuIcon({
          menu: store.itemMenu,
          i: i,
          name: agentName,
          agentType: store.agentTypes[agentName]
        })
      )
    )
  }

  store.deleteButton = markRaw(
    new DeleteButton({
      menu: store.itemMenu,
      i: store.agentMenuButtons.length
    })
  )

}