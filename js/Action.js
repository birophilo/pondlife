class Action {
  constructor(name, targetAgentType, targetAgent) {
    this.name = name
    this.agent = agent

    this.actionType = 'goTo'
    this.targetAgentType = targetAgentType
    this.targetAgent = targetAgent
    this.isComplete = false
  }
}


class ActionGoingToStall {
  constructor(customer, args) {
    this.inProgress = false
    this.isComplete = false
    this.customer = customer
  }
  start() {
    const hasEnoughMoney = this.customer.stateData.money >= 20
    if (hasEnoughMoney) {
      const closestStall = this.customer.getClosestAgent(this.customer.stateData.stalls)
      this.customer.destination = closestStall
      this.customer.frames.max = 9
    }
  }
}


// class ActionEmpty {
//   constructor(customer, args, conditions = []) {
//     this.customer = customer
//     this.args = args
//     this.actionName = 'do nothing'
//     this.stateName = 'doing nothing'
//     this.inProgress = false
//     this.isComplete = false

//     this.conditions = conditions ? conditions : []

//     this.actionList = []
//   }

//     meetsConditions() {
//     for (i = 0; i < this.conditions.length; i++) {
//       const qualifies = this.conditions[i].evaluate()
//       if (qualifies === false) {
//         console.log('did not meet condition')
//         return
//       }
//     }
//     return true
//   }

//   start() {
//     this.customer.currentStateName = `${this.stateName}`
//     this.customer.frames.max = 1

//   }

//   check(stateData) {
//     return
//   }

//   afterComplete

//   clone() {
//     return new this.constructor(this.customer, this.args)
//   }
// }

class ActionGoToDestination {
  constructor(customer, args, conditions = []) {
    this.customer = customer
    this.args = args
    this.destination = args.destination
    this.actionName = args.actionName
    this.stateName = `goingTo: ${this.destination.name}`
    this.inProgress = false
    this.isComplete = false

    this.conditions = conditions ? conditions : []

    this.actionList = []
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

  start() {
    this.customer.currentStateName = `${this.stateName}`
    this.customer.destination = this.destination
    this.customer.frames.max = 9
  }

  check(stateData) {
    const condition = new PresetCondition(this.customer, 'atDestination', 'isIdentical', true)
    const result = condition.evaluate()
    if (result === true) {
      this.isComplete = true
    }
    console.log(result)
  }

  clone() {
    return new this.constructor(this.customer, this.args)
  }
}

class ActionGoToAgent {
  constructor(customer, args, conditions = []) {
    this.customer = customer
    this.args = args
    this.agentType = args.agentType

    if (args.agentChoice === 'nearest') {
      const agentArray = AGENT_CONFIGS[this.agentType].agentArray
      this.agent = this.customer.getClosestAgent(agentArray)
    }

    this.actionName = args.actionName
    this.stateName = `goingTo: ${this.agent.name}`
    this.inProgress = false
    this.isComplete = false

    this.conditions = conditions ? conditions : []

    this.actionList = []

    this.transitionChecks = []

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

  start() {

    this.customer.destination = this.agent
    this.customer.currentStateName = this.stateName
    this.customer.frames.max = 9
  }

  check(stateData) {
    for (i = 0; i < this.transitionChecks.length; i++) {
      const result = this.transitionChecks[i].condition.evaluate()
      if (result === true) {
        this.isComplete = true
        this.customer.actionList.push(this.transitionChecks[i].nextAction)
      }
      console.log(result)
    }

  }

  clone() {
    return new this.constructor(this.customer, this.args, this.conditions)
  }
    
}

class ActionGoToAgentIfHaveEnoughMoney {
  constructor(customer, args) {
    this.inProgress = false
    this.isComplete = false
    this.customer = customer
    this.agent = args.agent
    this.actionName = 'goToAgentIfMoney'
    this.stateName = `goingToAgentIfMoney: ${this.agent.name}`
  }

  start() {

    const condition = new Condition(this.customer, 'money', 'isGreaterThan', 20)
    const qualifies = condition.evaluate()
    console.log(qualifies)
    if (qualifies) {
      this.customer.currentStateName = this.stateName
      this.customer.destination = this.agent
      this.customer.frames.max = 9
    } else {
      console.log('does not qualify')
    }

  }

  check(stateData) {
    if (this.customer.atDestination()) {
      this.isComplete = true
    }
  }

}

class ActionBuy {
  constructor(customer, args) {
    this.inProgress = false
    this.isComplete = false
    this.customer = customer
    this.duration = 100
    this.actionName = 'buy'
    this.stateName = 'buying'
  }

  start() {
    this.customer.currentStateName = this.stateName
    this.startFrame = GlobalSettings.animationFrameId
    this.customer.image.src = '../img/sprites/GirlSample_Walk_Down.png'
    this.customer.frames.max = 1

    const hasEnoughMoney = this.customer.stateData.money >= 20
    if (hasEnoughMoney) {
      this.customer.stateData.money -= 20
      const stall = lemonadeStalls.find(stall => stall.id === this.customer.destination.id)
      stall.money += 20
      stall.lemons -= 2
    }

    this.customer.destination = null
  }

  check(stateData) {
    const currentFrame = stateData.globals.animationFrameId
    const timerExpired = currentFrame - (this.startFrame + this.duration) >= 0
    if (timerExpired) {
      this.isComplete = true
    }
  }

}


class ActionRest {
  constructor(customer, args) {
    this.inProgress = false
    this.isComplete = false
    this.customer = customer
    this.duration = 100
    this.actionName = 'rest'
    this.stateName = 'resting'
  }

  start() {
    this.customer.currentStateName = this.stateName
    this.customer.destination = null
    this.customer.image.src = '../img/sprites/GirlSample_Walk_Down.png'
    this.customer.frames.max = 1
    this.startFrame = GlobalSettings.animationFrameId
  }

  check(stateData) {
    const currentFrame = stateData.globals.animationFrameId
    const timerExpired = currentFrame - (this.startFrame + this.duration) >= 0
    if (timerExpired) {
      this.isComplete = true
    }
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
