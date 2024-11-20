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
      this.agent.useSpriteSheet(this.args.spriteSheet)
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
