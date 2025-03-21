export function createActionObject (agent = null, data) {

  const item = {
    agent: agent,
    actionName: data.actionName,
    actionType: data.actionType,
    inProgress: false,
    isComplete: false,
    conditions: data.conditions || [],
    transitions: data.transitions || [],
    spriteSheet: data.spriteSheet,
    agentType: data.agentType
  }

  if (data.propertyChanges) item.propertyChanges = data.propertyChanges

  return item
}


export function createActionGoTo (agent = null, data) {
  let item = createActionObject(agent, data)

  item.destinationType = data.destinationType,
  item.agentChoiceMethod = data.agentChoiceMethod,
  item.target = data.target

  if (data.agentChoiceMethod === 'specific') {
    item.destination = data.target
  }
  if (data.destinationType === 'point') {
    item.destination = data.target
    item.pointType = data.pointType

    if (item.pointType === 'defined') {
      item.definedPoint = data.definedPoint
    }
  }
  return item
}


export function createActionPropertyChanges (agent = null, data) {
  let item = createActionObject(agent, data)
  item.propertyChanges = data.propertyChanges ? data.propertyChanges : []
  return item
}


export function createActionInterval (agent = null, data) {
  let item = createActionObject(agent, data)
  item.duration = data.duration
  item.intervalType = data.intervalType
  // quick fix to allow interval actions to retain 'target' information in other transitions,
  // goTo target agent -> wait -> remove target agent
  item.target = data.target
  return item
}


export function createActionSpawnAgent (agent = null, data) {
  let item = createActionObject(agent, data)
  item.agentType = data.agentType
  item.position = data.position
  item.useRandomPosition = data.useRandomPosition
  item.spawnAgentPlacement = data.spawnAgentPlacement

  return item
}


export function createActionRemoveAgent (agent = null, data) {
  const item = createActionObject(agent, data)

  item.agentType = data.agentType
  item.agentChoiceMethod = data.agentChoiceMethod,
  item.target = data.target

  return item
}


/* HANDLER CLASSES */


export class ActionHandler {

  constructor() {
    this.name = 'baseHandler'
  }

  meetsConditions(item) {
    for (let i = 0; i < item.conditions.length; i++) {
      const qualifies = item.conditions[i].evaluate()
      if (qualifies === false) {
        console.log('did not meet condition')
        return
      }
    }
    return true
  }

  // eslint-disable-next-line
  check(item, stateData, globals, agentHandler) {

    if (this.defaultCompletionCheckPasses(item, agentHandler)) {
      item.isComplete = true
    }
    if (item.changesApplied === true) {
      item.isComplete = true
    }
  }

  clone(item, agent) {
    const createActionFunction = ACTION_CONSTRUCTORS[item.actionType]
    const action = createActionFunction(agent, item)

    return action
  }
}


export class ActionGoToHandler extends ActionHandler {

  constructor() {
    super()
    this.name = 'goToHandler'
  }

  // eslint-disable-next-line
  start(item, globals) {

    if (item.target.name === 'spawnPoint') {
      item.target = item.agent.spawnPoint
    } else {
      item.destination = item.target
    }
    item.destination = item.target
    item.agent.destination = item.target

    if (item.agent !== null) {
      if (item.destinationType === 'agent') {
        item.stateName = `going to: ${item.destination.name}`
      } else if (item.destinationType === 'point') {
        item.stateName = `going to: (x: ${item.target.position.x}, y: ${item.target.position.y})`
      }
    }

    item.agent.currentStateName = item.stateName
  }

  defaultCompletionCheckPasses(item, agentHandler) {
    return agentHandler.atDestination(item.agent)
  }
}


export class ActionPropertyChangesHandler extends ActionHandler {

  constructor() {
    super()
    this.name = 'propertyChangesHandler'
  }

  // eslint-disable-next-line
  start(item, globals, agentHandler, store) {
    item.propertyChanges.forEach(changeId => {

      const change = store.propertyChanges.find(ch => ch.id === changeId)

      const value = change.value
      const changeValue = change.change === 'increase' ? Number(value) : 0 - Number(value)

      if (change.agentType === 'self') {
        item.agent.stateData[change.property] += changeValue
      } else if (change.agentChoiceMethod === 'all') {
        change.target.forEach(agentItem => agentItem.stateData[change.property] += changeValue)
      } else {
        change.target.stateData[change.property] += changeValue
      }
    })
    item.changesApplied = true
  }

  defaultCompletionCheckPasses(item) {
    return item.isComplete
  }
}


export class ActionIntervalHandler extends ActionHandler {
  /*
    A timer object; an 'action' that just waits for a specified frame duration.
  */

  constructor() {
    super()
    this.name = 'intervalHandler'
  }

  start(item, globals, agentHandler) {
    // if (item.args.spriteSheet) {
    //   agentHandler.useSpriteSheet(item.args.spriteSheet, item.agent)
    // }
    agentHandler.useSpriteSheet('idle', item.agent)
    item.agent.currentDirection = 'idle'

    if (item.intervalType === 'frames') {
      const currentFrame = globals.animationFrameId
      item.startFrame = currentFrame
      item.agent.currentStateName = `waiting for ${item.duration} frames`
    } else if (item.intervalType === 'untilNextInterval') {
      // set item.currentDefaultIntervalValue here (i.e. item.currentDay)
    }

  }

  defaultCompletionCheckPasses(item) {
    return item.isComplete
  }

  check(item, stateData, globals, agentHandler) {

    let timerExpired

    if (item.intervalType === 'frames') {
      const currentFrame = globals.animationFrameId
      timerExpired = currentFrame - (item.startFrame + item.duration) >= 0
    } else if (item.intervalType === 'untilNextInterval') {
      // check value of current day vs. this untilDay
    }

    if (timerExpired) {
      item.isComplete = true
    }

    super.check(item, stateData, globals, agentHandler)
  }
}


export class ActionSpawnAgentHandler extends ActionHandler {

  constructor() {
    super()
    this.name = 'spawnAgentHandler'
  }

  // eslint-disable-next-line
  start(item, globals) {

    // 'selfPosition'- -> use agent's current position; 'specific' -> predefined XY position
    const position = item.spawnAgentPlacement === 'selfPosition'
      ? {...item.agent.position}
      : {...item.position}

    const spawnArgs = {
      agentType: item.agentType,
      position: position
    }

    item.isComplete = true

    return {agentsToSpawn: [spawnArgs]}
  }

  defaultCompletionCheckPasses(item) {
    return item.isComplete
  }
}


export class ActionRemoveAgentHandler extends ActionHandler {

  constructor() {
    super()
    this.name = 'removeAgentHandler'
  }

  // eslint-disable-next-line
  start(item, globals) {
    let emissions = {agentsToDelete: []}

    if (item.agentType === 'self') {
      emissions.agentsToDelete = [item.agent]
    } else if (item.agentType === 'currentTarget') {
      emissions.agentsToDelete = [item.target]
    } else if (item.agentChoiceMethod === 'specific' || item.agentChoiceMethod === 'nearest') {
      emissions.agentsToDelete = [item.target]
    } else if (item.agentChoiceMethod === 'all') {
      emissions.agentsToDelete = [...item.target]
    }

    item.isComplete = true
    return emissions
  }

  defaultCompletionCheckPasses(item) {
    return item.isComplete
  }

}


export class PropertyChangeHandler {

  start(item, globals) {
    const currentFrame = globals.animationFrameId
    item.startFrame = currentFrame
    item.agent.currentStateName = `waiting for ${item.duration} frames`
  }

  defaultCompletionCheckPasses(item, agentHandler) {
    return agentHandler.actionIsComplete(item.agent)
  }

  description(item) {
    return `${item.property} ${item.change} ${item.value}`
  }
}


export const ACTION_HANDLERS = {
  'goTo': ActionGoToHandler,
  'change': ActionPropertyChangesHandler,
  'interval': ActionIntervalHandler,
  'spawnAgent': ActionSpawnAgentHandler,
  'removeAgent': ActionRemoveAgentHandler
}


export const ACTION_CONSTRUCTORS = {
  'goTo': createActionGoTo,
  'change': createActionPropertyChanges,
  'interval': createActionInterval,
  'spawnAgent': createActionSpawnAgent,
  'removeAgent': createActionRemoveAgent
}
