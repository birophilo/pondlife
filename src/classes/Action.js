export class Action {
  constructor(agent = null, args, conditions = [], transitions = []) {
    this.id = args.id  // incrementing PK
    this.agent = agent
    this.args = args

    this.actionName = args.actionName
    this.actionType = args.actionType

    this.inProgress = false
    this.isComplete = false

    this.conditions = conditions ? conditions : []
    this.transitions = transitions ? transitions : []

    this.spriteSheet = args.spriteSheet

    if (this.transitions.length > 0 && this.agent !== null) {
      this.transitions.forEach(transition => {
        // broadly applicable enough?
        transition.condition.agent = this.agent
      })
    }
  }

  meetsConditions() {
    for (let i = 0; i < this.conditions.length; i++) {
      const qualifies = this.conditions[i].evaluate()
      if (qualifies === false) {
        console.log('did not meet condition')
        return
      }
    }
    return true
  }

  // eslint-disable-next-line
  check(stateData, globals) {
    console.log(this.actionName)
    if (this.defaultCompletionCheckPasses()) {
      this.isComplete = true
    }
    if (this.changesApplied === true) {
      this.isComplete = true
    }
  }

  clone(agent, args) {
    const action =  new this.constructor(
      agent,
      this.args = {...this.args, ...args},
      this.conditions,
      this.transitions,
      this.propertyChanges
    )
    return action
  }
}


export class ActionGoTo extends Action {
  constructor(agent = null, args, conditions = [], transitions = []) {
    super(agent, args, conditions, transitions)

    if (args.agentChoiceMethod === 'specific') {
      this.destination = args.target
    }

    if (args.destinationType === 'point') {
        this.destination = args.target
    }
  }

  // eslint-disable-next-line
  start(globals) {
    this.destination = this.args.target
    this.agent.destination = this.args.target

    if (this.agent !== null) {
      if (this.args.destinationType === 'agent') {
        this.stateName = `going to: ${this.destination.name}`
      } else if (this.args.destinationType === 'point') {
        this.stateName = `going to: (x: ${this.args.target.position.x}, y: ${this.args.target.position.y})`
      }
    }

    this.agent.currentStateName = this.stateName
  }

  defaultCompletionCheckPasses() {
    // console.log('at destination', this.agent.atDestination())
    return this.agent.atDestination()
  }
}


export class ActionPropertyChanges extends Action {
  constructor(agent = null, args, conditions = [], transitions = [], propertyChanges = []) {
    super(agent, args, conditions, transitions)

    this.propertyChanges = propertyChanges ? propertyChanges : []

    if (this.agent !== null) {
      this.propertyChanges.forEach(change => {
        // this is currently hard-coded just to apply to self agent, not e.g. target agent
        change.agent = this.agent
      })
    }
  }

  // eslint-disable-next-line
  start(globals) {
    this.propertyChanges.forEach(change => {

      const value = change.propertyValue
      const changeValue = change.changeType === 'increase' ? Number(value) : 0 - Number(value)

      if (change.args.agentType === 'self') {
        this.agent.stateData[change.propertyName] += changeValue
      } else {
        if (change.args.agentChoiceMethod === 'all') {
          change.target.forEach(agentItem => agentItem.stateData[change.propertyName] += changeValue)
        } else {
          change.target.stateData[change.propertyName] += changeValue
        }
      }
    })
    this.changesApplied = true
  }

  defaultCompletionCheckPasses() {
    return this.isComplete
  }
}



export class ActionInterval extends Action {
  /*
    A timer object; an 'action' that just waits for a specified frame duration.
  */
  constructor(agent = null, args, conditions = [], transitions = []) {
    super(agent, args, conditions, transitions)
  }

  start(globals) {
    if (this.args.spriteSheet) {
      this.agent.useSpriteSheet(this.args.spriteSheet,)
    }
    const currentFrame = globals.animationFrameId
    this.startFrame = currentFrame
    this.agent.currentStateName = `waiting for ${this.args.duration} frames`
  }

  defaultCompletionCheckPasses() {
    return this.isComplete
  }

  check(stateData, globals) {
    const currentFrame = globals.animationFrameId
    const timerExpired = currentFrame - (this.startFrame + this.args.duration) >= 0

    if (timerExpired) {
      this.isComplete = true
    }

    super.check(stateData, globals)
  }
}


export class ActionSpawnAgent extends Action {
  constructor(agent = null, args, conditions = [], transitions = []) {
    super(agent, args, conditions, transitions)

    this.agentType = args.agentType
    this.position = args.position
    this.useRandomPosition = args.useRandomPosition
  }

  // eslint-disable-next-line
  start(globals) {
    this.isComplete = true
    const spawnArgs = {
      agentType: this.agentType,
      position: this.position
    }
    return {agentsToSpawn: [spawnArgs]}
  }

  defaultCompletionCheckPasses() {
    return this.isComplete
  }
}


export class ActionRemoveAgent extends Action {
  constructor(agent = null, args, conditions = [], transitions = []) {
    super(agent, args, conditions, transitions)
  }

  // eslint-disable-next-line
  start(globals) {
    this.isComplete = true
    return {agentsToDelete: [this.agent]}
  }

  defaultCompletionCheckPasses() {
    return this.isComplete
  }
}


export class ActionTransition {
  constructor(condition, nextAction) {
    this.condition = condition
    this.nextAction = nextAction
  }
}


export class PropertyChange {
  constructor(agent, target, propertyName, changeType, propertyValue, args) {
    this.agent = agent
    this.target = target
    this.propertyName = propertyName
    this.changeType = changeType
    // only handling numbers for now, not strings, boolean etc.
    this.propertyValue = propertyValue
    this.args = args
  }

  start(globals) {
    const currentFrame = globals.animationFrameId
    this.startFrame = currentFrame
    this.agent.currentStateName = `waiting for ${this.duration} frames`
  }

  defaultCompletionCheckPasses() {
    return this.agent.actionIsComplete()
  }

  description() {
    return `${this.propertyName} ${this.changeType} ${this.propertyValue}`
  }
}


/* FUNCTIONS TO CREATE OBJECTS */


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

  if (item.transitions.length > 0 && item.agent !== null) {
    item.transitions.forEach(transition => {
      // broadly applicable enough?
      transition.condition.agent = item.agent
    })
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
  }
  return item
}


export function createActionPropertyChanges (agent = null, data) {
  let item = createActionObject(agent, data)
  item.propertyChanges = data.propertyChanges ? data.propertyChanges : []
  if (item.agent !== null) {
    item.propertyChanges.forEach(change => {
      // this is currently hard-coded just to apply to self agent, not e.g. target agent
      // change.agent = this.agent  -- WRONG?
      change.agent = data.agent  // -- RIGHT?
    })
  }
  return item
}


export function createActionInterval (agent = null, data) {
  let item = createActionObject(agent, data)
  return item
}


export function createActionSpawnAgent (agent = null, data) {
  let item = createActionObject(agent, data)
  item.agentType = data.args.agentType
  item.position = data.args.position
  item.useRandomPosition = data.args.useRandomPosition
}


export function createActionRemoveAgent (agent = null, data) {
  const item = createActionObject(agent, data)
  return item
}


export function createActionTransitionObject (condition, nextAction) {
  const item = {
    condition: condition,
    nextAction: nextAction
  }
  return item
}


export function createPropertyChange (agent, target, propertyName, changeType, propertyValue, args) {
  const item = {
    agent: agent,
    target: target,
    propertyName: propertyName,
    changeType: changeType,
    // only handling numbers for now, not strings, boolean etc.
    propertyValue: propertyValue,
    args: args
  }
  return item
}


/* HANDLER CLASSES */


export class ActionHandler {

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
    console.log(item.actionName)
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

    console.log("CLONED ACTION")
    console.log(action)
    return action
  }
}


export class ActionGoToHandler extends ActionHandler {

  // eslint-disable-next-line
  start(item, globals) {

    console.log("STARTING")
    console.log(item)
    console.log(item.destination)

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
    // console.log('at destination', this.agent.atDestination())
    return agentHandler.atDestination(item.agent)
  }
}


export class ActionPropertyChangesHandler extends ActionHandler {

  // eslint-disable-next-line
  start(item, globals) {
    item.propertyChanges.forEach(change => {

      const value = change.propertyValue
      const changeValue = change.changeType === 'increase' ? Number(value) : 0 - Number(value)

      if (change.args.agentType === 'self') {
        item.agent.stateData[change.propertyName] += changeValue
      } else {
        if (change.args.agentChoiceMethod === 'all') {
          change.target.forEach(agentItem => agentItem.stateData[change.propertyName] += changeValue)
        } else {
          change.target.stateData[change.propertyName] += changeValue
        }
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

  start(item, globals, agentHandler) {
    // if (item.args.spriteSheet) {
    //   agentHandler.useSpriteSheet(item.args.spriteSheet, item.agent)
    // }
    agentHandler.useSpriteSheet('idle', item.agent)
    const currentFrame = globals.animationFrameId
    item.startFrame = currentFrame
    item.agent.currentStateName = `waiting for ${item.args.duration} frames`
  }

  defaultCompletionCheckPasses(item) {
    return item.isComplete
  }

  check(item, stateData, globals, agentHandler) {
    const currentFrame = globals.animationFrameId
    const timerExpired = currentFrame - (item.startFrame + item.args.duration) >= 0

    if (timerExpired) {
      item.isComplete = true
    }

    super.check(item, stateData, globals, agentHandler)
  }
}


export class ActionSpawnAgentHandler extends ActionHandler {

  // eslint-disable-next-line
  start(item, globals) {
    item.isComplete = true
    const spawnArgs = {
      agentType: item.agentType,
      position: item.position
    }
    return {agentsToSpawn: [spawnArgs]}
  }

  defaultCompletionCheckPasses(item) {
    return item.isComplete
  }
}


export class ActionRemoveAgentHandler extends ActionHandler {

  // eslint-disable-next-line
  start(item, globals) {
    item.isComplete = true
    return {agentsToDelete: [item.agent]}
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
    return `${item.propertyName} ${item.changeType} ${item.propertyValue}`
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
