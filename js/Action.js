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
  constructor(customer) {
    this.begun = false
    this.isComplete = false
    this.customer = customer
  }
  start() {
    const hasEnoughMoney = this.customer.money >= 20
    if (hasEnoughMoney) {
      const closestStall = this.customer.getClosestAgent(this.customer.stateData.stalls)
      this.customer.destination = closestStall
      this.customer.frames.max = 9
    }
  }
}

class ActionGoingHome {
  constructor(customer) {
    this.begun = false
    this.isComplete = false
    this.customer = customer
  }

  start() {
    this.customer.destination = {
    position: {
      x: this.customer.homePosition.x,
      y: this.customer.homePosition.y
    },
    width: 80,
    height: 80,
    name: 'home',
    id: 1
  }
  this.customer.frames.max = 9
  }

  check(stateData) {
    if (this.customer.atDestination()) {
      this.isComplete = true
    }
  }
}

class ActionGoToDestination {
  constructor(customer, destination) {
    this.begun = false
    this.isComplete = false
    this.customer = customer
    this.destination = destination
  }

  start() {
    this.customer.destination = this.destination
    this.customer.frames.max = 9

    if (this.customer.atDestination()) {
      this.isComplete = true
    }
  }

  check(stateData) {
    if (this.customer.atDestination()) {
      this.isComplete = true
    }
  }
}

class ActionGoToAgent {
  constructor(customer, agent) {
    this.begun = false
    this.isComplete = false
    this.customer = customer
    this.agent = agent
  }

  start() {
    this.customer.destination = this.agent
    this.customer.frames.max = 9
  }

  check(stateData) {
    if (this.customer.atDestination()) {
      this.isComplete = true
    }
  }
    
}

class ActionBuy {
  constructor(customer) {
    this.begun = false
    this.isComplete = false
    this.customer = customer
    this.duration = 100
  }

  start() {
    this.startFrame = GlobalSettings.animationFrameId
    this.customer.image.src = '../img/sprites/GirlSample_Walk_Down.png'
    this.customer.frames.max = 1

    const hasEnoughMoney = this.customer.money >= 20
    if (hasEnoughMoney) {
      this.customer.money -= 20
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