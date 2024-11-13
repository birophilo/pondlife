export class Action {
  constructor(agent = null, args, conditions = [], transitions = []) {
    this.id = args.id  // incrementing PK
    this.agent = agent
    this.args = args
    // temporary?
    this.editing = false

    this.actionName = args.actionName
    this.actionType = args.actionType

    this.inProgress = false
    this.isComplete = false

    this.conditions = conditions ? conditions : []
    this.transitions = transitions ? transitions : []

    this.actionSpriteSheet = args.spriteSheet

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
    for (let i = 0; i < this.transitions.length; i++) {
      const result = this.transitions[i].condition.evaluate()
      if (result === true) {
        this.isComplete = true
        this.agent.currentAction = this.transitions[i].nextAction.clone(this.agent)
      }
    }

    if (this.defaultCompletionCheckPasses()) {
      this.isComplete = true
    }
  }

  clone(agent, args) {
    return new this.constructor(
      agent,
      this.args = {...this.args, ...args},
      this.conditions,
      this.transitions,
      this.propertyChanges
    )
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
        this.stateName = `goingTo: ${this.destination.name}`
      }
    }

    this.agent.currentStateName = this.stateName
  }

  defaultCompletionCheckPasses() {
    return this.agent.atDestination()
  }

}


export class ActionPropertyChanges extends Action {
  constructor(agent = null, args, conditions = [], transitions = [], propertyChanges = []) {
    super(agent, args, conditions, transitions)

    this.propertyChanges = propertyChanges ? propertyChanges : []
    this.changesApplied = false  // temporary duplicate 'complete' flag - find different approach

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
            change.args.target.forEach(agentItem => agentItem.stateData[change.propertyName] += changeValue)
          } else {
            change.args.target.stateData[change.propertyName] += changeValue
          }

      }

    })
    this.changesApplied = true
  }

  defaultCompletionCheckPasses() {
    return this.changesApplied === true
  }
}


export class ActionInterval extends Action {
  /*
    A timer object; an 'action' that just waits for a specified frame duration.
  */
  constructor(agent = null, args, conditions = [], transitions = []) {
    super(agent, args, conditions, transitions)

    this.duration = args.duration
  }

  start(globals) {
    if (this.actionSpriteSheet !== null) {
      this.agent.useSpriteSheet(this.actionSpriteSheet)
    }
    const currentFrame = globals.animationFrameId
    this.startFrame = currentFrame
    this.agent.currentStateName = `waiting for ${this.duration} frames`
  }

  defaultCompletionCheckPasses() {
    return this.isComplete === true
  }

  check(stateData, globals) {
    const currentFrame = globals.animationFrameId
    const timerExpired = currentFrame - (this.startFrame + this.duration) >= 0

    if (timerExpired) {
      this.isComplete = true
    }

    super.check(stateData, globals)
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
    return this.agent.atDestination()
  }

}


export class ActionTransition {
  constructor(condition, nextAction) {
    this.condition = condition
    this.nextAction = nextAction
    this.editing = false
  }
}


export class PropertyChange {
  constructor(agent, propertyName, changeType, propertyValue, args) {
    this.agent = agent
    this.propertyName = propertyName
    this.changeType = changeType
    // only handling numbers for now, not strings, boolean etc.
    this.propertyValue = propertyValue
    this.args = args

    this.editing = false
  }

  start(globals) {
    this.agent.useSpriteSheet(this.actionSpriteSheet)
    const currentFrame = globals.animationFrameId
    this.startFrame = currentFrame
    this.agent.currentStateName = `waiting for ${this.duration} frames`
  }

  defaultCompletionCheckPasses() {
    return this.agent.atDestination()
  }
}
