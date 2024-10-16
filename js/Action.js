class Action {
  constructor(agent = null, args, conditions = [], transitions = []) {
    this.id = args.id  // incrementing PK
    this.agent = agent
    this.args = args
    // temporary?
    this.editing = false

    if (args.agentChoiceMethod === 'specific') {
      this.destination = args.target
    }

    if (args.destinationType === 'point') {
        this.destination = args.target
    }

    if (this.agent !== null) {
      if (args.destinationType === 'agent') {

        this.agentType = args.agentType

        if (args.agentChoiceMethod === 'nearest') {
          const agentArray = AGENT_CONFIGS[this.agentType].agentArray
          this.destination = this.agent.getClosestAgent(agentArray)
          this.stateName = `goingTo: ${this.destination.name}`
        }

      } else if (args.destinationType === 'point') {
        this.stateName = `goingTo: ${this.destination.name}`
      }
    }

    this.actionName = args.actionName
    this.actionType = args.actionType

    this.inProgress = false
    this.isComplete = false

    this.conditions = conditions ? conditions : []
    this.transitions = transitions ? transitions : []

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

  check(stateData, globals) {
    console.log(this.actionName)
    for (let i = 0; i < this.transitions.length; i++) {
      const result = this.transitions[i].condition.evaluate()
      if (result === true) {
        this.isComplete = true
        this.agent.actionList.push(
          this.transitions[i].nextAction.clone(
            this.agent
          )
        )
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


class ActionGoTo extends Action {
  constructor(agent = null, args, conditions = [], transitions = []) {
    super(agent, args, conditions, transitions)
  }

  start(globals) {
    this.agent.destination = this.destination
    this.agent.currentStateName = this.stateName
    this.agent.frames.max = this.agent.config.frames.max
  }

  defaultCompletionCheckPasses() {
    // default complete condition for class/action type
    return this.agent.atDestination()
  }

}


class ActionPropertyChanges extends Action {
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

  start(globals) {
    this.propertyChanges.forEach(change => {

      if (change.args.agentType === 'self') {
        var agentToChange = this.agent
      } else {
        const agentArray = AGENT_CONFIGS[change.args.agentType].agentArray
        const targetAgent = this.agent.getClosestAgent(agentArray)
        var agentToChange = targetAgent
      }

      const changeValue = change.changeType === 'increase' ? Number(change.propertyValue) : 0 - Number(change.propertyValue)
      agentToChange.stateData[change.propertyName] += changeValue

    })
    this.changesApplied = true
  }

  defaultCompletionCheckPasses() {
    // default complete condition for class/action type
    return this.changesApplied === true
  }
}


class ActionInterval extends Action {
  /*
    A timer object; an 'action' that just waits for a specified frame duration.
  */
  constructor(agent = null, args, conditions = [], transitions = [], propertyChanges = []) {
    super(agent, args, conditions, transitions)

    this.duration = args.duration
  }

  start(globals) {
    const currentFrame = globals.animationFrameId
    this.startFrame = currentFrame
  }

  defaultCompletionCheckPasses() {
    // default complete condition for class/action type
    return this.isComplete === true
  }

  check(stateData, globals) {
    const currentFrame = globals.animationFrameId
    console.log("start frame", this.startFrame)
    console.log("current frame", currentFrame)
    console.log("duration", this.duration)
    const timerExpired = currentFrame - (this.startFrame + this.duration) >= 0
    console.log(timerExpired)

    if (timerExpired) {
      this.isComplete = true
    }

    // super.check(stateData, globals) here?
  }
}


class ActionTransition {
  constructor(condition, nextAction) {
    this.condition = condition
    this.nextAction = nextAction
    this.editing = false
  }
}


class ActionDefaults {
  constructor(agent) {
    this.agent = agent
  }

  idle() {
    this.agent.currentStateName = 'idle'
    this.agent.destination = null
    this.agent.image.src = this.agent.defaultImage
    this.agent.frames.max = 1
  }
}


class PropertyChange {
  constructor(agent, propertyName, changeType, propertyValue, args) {
    this.agent = agent
    this.propertyName = propertyName
    this.changeType = changeType
    // only handling numbers for now, not strings, boolean etc.
    this.propertyValue = propertyValue
    this.args = args

    this.editing = false
  }
}
