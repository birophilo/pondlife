class Action {
  constructor(customer = null, args, conditions = [], transitions = []) {
    this.id = args.id  // incrementing PK
    this.customer = customer
    this.args = args
    // temporary?
    this.editing = false

    if (this.customer !== null) {
      if (args.agentType === 'lemonadeStall') {
        this.agentType = args.agentType

        if (args.agentChoice === 'nearest') {
          const agentArray = AGENT_CONFIGS[this.agentType].agentArray
          this.destination = this.customer.getClosestAgent(agentArray)
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
    for (i = 0; i < this.conditions.length; i++) {
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
    for (i = 0; i < this.transitions.length; i++) {
      const result = this.transitions[i].condition.evaluate()
      if (result === true) {
        this.isComplete = true
        this.customer.actionList.push(
          this.transitions[i].nextAction.clone(
            this.customer,
            {destination: this.customer.home, cloned: true}
          )
        )
      }
    }

    if (this.defaultCompletionCheckPasses()) {
      this.isComplete = true
    }
  }

  clone(customer, args) {
    return new this.constructor(
      customer,
      this.args = {...this.args, ...args},
      this.conditions,
      this.transitions,
      this.propertyChanges
    )
  }

}


class ActionGoTo extends Action {
  constructor(customer = null, args, conditions = [], transitions = []) {
    super(customer, args, conditions, transitions)
  }

  start() {
    this.customer.destination = this.destination
    this.customer.currentStateName = this.stateName
    this.customer.frames.max = 9
  }

  defaultCompletionCheckPasses() {
    // default complete condition for class/action type
    return this.customer.atDestination()
  }

}


class ActionPropertyChanges extends Action {
  constructor(customer = null, args, conditions = [], transitions = [], propertyChanges = []) {
    super(customer, args, conditions, transitions)

    this.propertyChanges = propertyChanges ? propertyChanges : []
    this.changesApplied = false  // temporary duplicate 'complete' flag - find different approach

    if (this.customer !== null) {
      this.propertyChanges.forEach(change => {
        // this is currently hard-coded just to apply to self agent, not e.g. target agent
        change.agent = this.customer
      })
    }
  }

  start() {
    this.propertyChanges.forEach(change => {
      // temporary hard-coding
      if (this.args.agentType === 'lemonadeStall') {
        var agentToChange = this.destination
      } else {
        var agentToChange = this.customer
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


class ActionDefaults {
  constructor(customer) {
    this.customer = customer
  }

  idle() {
    this.customer.currentStateName = 'idle'
    this.customer.destination = null
    this.customer.image.src = '../img/sprites/GirlSample_Walk_Down.png'
    this.customer.frames.max = 1
  }
}


class PropertyChange {
  constructor(agent, propertyName, changeType, propertyValue) {
    this.agent = agent
    this.propertyName = propertyName
    this.changeType = changeType
    this.propertyValue = changeType === 'increase' ? propertyValue : -propertyValue
  }
}


// class ActionGoingToStall {
//   constructor(customer, args) {
//     this.inProgress = false
//     this.isComplete = false
//     this.customer = customer
//   }
//   start() {
//     const hasEnoughMoney = this.customer.stateData.money >= 20
//     if (hasEnoughMoney) {
//       const closestStall = this.customer.getClosestAgent(this.customer.stateData.stalls)
//       this.customer.destination = closestStall
//       this.customer.frames.max = 9
//     }
//   }
// }


// class ActionGoToAgentIfHaveEnoughMoney {
//   constructor(customer, args) {
//     this.inProgress = false
//     this.isComplete = false
//     this.customer = customer
//     this.agent = args.agent
//     this.actionName = 'goToAgentIfMoney'
//     this.stateName = `goingToAgentIfMoney: ${this.agent.name}`
//   }

//   start() {

//     const condition = new Condition(this.customer, 'money', 'isGreaterThan', 20)
//     const qualifies = condition.evaluate()
//     if (qualifies) {
//       this.customer.currentStateName = this.stateName
//       this.customer.destination = this.agent
//       this.customer.frames.max = 9
//     } else {
//       console.log('does not qualify')
//     }

//   }

//   check(stateData) {
//     if (this.customer.atDestination()) {
//       this.isComplete = true
//     }
//   }

// }

// class ActionBuy {
//   constructor(customer, args) {
//     this.inProgress = false
//     this.isComplete = false
//     this.customer = customer
//     this.duration = 100
//     this.actionName = 'buy'
//     this.stateName = 'buying'
//   }

//   start() {
//     this.customer.currentStateName = this.stateName
//     this.startFrame = GlobalSettings.animationFrameId
//     this.customer.image.src = '../img/sprites/GirlSample_Walk_Down.png'
//     this.customer.frames.max = 1

//     const hasEnoughMoney = this.customer.stateData.money >= 20
//     if (hasEnoughMoney) {
//       this.customer.stateData.money -= 20
//       const stall = lemonadeStalls.find(stall => stall.id === this.customer.destination.id)
//       stall.money += 20
//       stall.lemons -= 2
//     }

//     this.customer.destination = null
//   }

//   check(stateData) {
//     const currentFrame = stateData.globals.animationFrameId
//     const timerExpired = currentFrame - (this.startFrame + this.duration) >= 0
//     if (timerExpired) {
//       this.isComplete = true
//     }
//   }

// }


// class ActionRest {
//   constructor(customer, args) {
//     this.inProgress = false
//     this.isComplete = false
//     this.customer = customer
//     this.duration = 100
//     this.actionName = 'rest'
//     this.stateName = 'resting'
//   }

//   start() {
//     this.customer.currentStateName = this.stateName
//     this.customer.destination = null
//     this.customer.image.src = '../img/sprites/GirlSample_Walk_Down.png'
//     this.customer.frames.max = 1
//     this.startFrame = GlobalSettings.animationFrameId
//   }

//   check(stateData) {
//     const currentFrame = stateData.globals.animationFrameId
//     const timerExpired = currentFrame - (this.startFrame + this.duration) >= 0
//     if (timerExpired) {
//       this.isComplete = true
//     }
//   }
// }
