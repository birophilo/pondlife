class Action {
  constructor(agent = null, args, conditions = [], transitions = []) {
    this.id = args.id  // incrementing PK
    this.agent = agent
    this.args = args
    // temporary?
    this.editing = false

    if (this.agent !== null) {
      if (args.agentType === 'lemonadeStall') {
        this.agentType = args.agentType

        if (args.agentChoice === 'nearest') {
          const agentArray = AGENT_CONFIGS[this.agentType].agentArray
          this.destination = this.agent.getClosestAgent(agentArray)
          this.stateName = `goingTo: ${this.destination.name}`
        }
      } else {
        this.destination = args.destination
        this.stateName = `goingTo: ${this.destination.name}`
      }
    }

    this.actionName = args.actionName
    this.actionType = args.actionType

    this.inProgress = false
    this.isComplete = false

    this.conditions = conditions ? conditions : []
    this.transitions = transitions ? transitions : []
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

  check(stateData) {
    console.log(this.actionName)
    for (let i = 0; i < this.transitions.length; i++) {
      const result = this.transitions[i].condition.evaluate()
      if (result === true) {
        this.isComplete = true
        this.agent.actionList.push(
          this.transitions[i].nextAction.clone(
            this.agent,
            {destination: this.agent.home, cloned: true}
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

  start() {
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

  start() {
    this.propertyChanges.forEach(change => {
      // temporary hard-coding
      if (this.args.agentType === 'lemonadeStall') {
        var agentToChange = this.destination
      } else {
        var agentToChange = this.agent
      }
      agentToChange.stateData[change.propertyName] += change.propertyValue
    })
    this.changesApplied = true
  }

  defaultCompletionCheckPasses() {
    // default complete condition for class/action type
    return this.changesApplied === true
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
  constructor(agent, propertyName, changeType, propertyValue) {
    this.agent = agent
    this.propertyName = propertyName
    this.changeType = changeType
    // only handling numbers for now, not strings, boolean etc.
    this.propertyValue = changeType === 'increase' ? Number(propertyValue) : 0 - Number(propertyValue)

    this.editing = false
  }
}
