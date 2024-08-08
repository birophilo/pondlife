class SupplyVanState {
  constructor(van) {
    this.name = 'idle'
    this.van = van
  }

  updateState(state, data) {
    console.log('state')
    console.log(data)
    if (state === 'goingToStall') {
      this.goToStall(data)
    }  else if (state === 'goingHome') {
      this.goHome(data)
    } else if (state === 'resting') {
      this.rest(data)
    } else if (state === 'selling') {
      this.sell(data)
    }
  }

  goToStall(data) {
    this.name = 'goingToStall'
    const closestStall = this.van.getClosestAgent(data.stalls)
    data.stall = closestStall
    this.van.destination = closestStall
  }

  goHome(data) {
    this.van.destination = {
      position: {
        x: this.van.homePosition.x,
        y: this.van.homePosition.y
      },
      width: 80,
      height: 80,
      name: 'home',
      id: 1
    }
    this.name = 'goingHome'
  }

  rest(data) {
    this.name = 'resting'
    this.van.destination = null
    const self = this
    let timer1 = new Timer(data.frameId, 500, self, 'goingToStall', data)
    timers.push(timer1)
  }

  sell(data) {
    this.name = 'selling'
    const self = this
    let timer2 = new Timer(data.frameId, 200, self, 'goingHome', data)
    timers.push(timer2)

    const stall = lemonadeStalls.find(stall => stall.id === this.van.destination.id)
    const stallHasEnoughMoney = stall.money >= 20
    if (stallHasEnoughMoney) {
      this.van.money += 20
      stall.lemons += 10
      stall.money -= 40
    }

    this.van.destination = null
  }
}

class SupplyVan {
  constructor({ position = { x: 0, y: 0 }, num = 0, globalSpeed }) {
    this.position = position
    this.nominalSpeed = 0.01
    this.num = num

    this.center = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    }

    this.width = 50
    this.height = 50

    this.collisionArea = {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height
    }
    
    this.homePosition = {x: this.position.x, y: this.position.y}
    this.destination = null

    this.speed = this.nominalSpeed * globalSpeed

    this.reachedDestination = false

    this.state = new SupplyVanState(this)
  }

  travel() {
    if (this.destination) {
      const xDistance = this.destination.position.x - this.position.x
      const yDistance = this.destination.position.y - this.position.y
      const angle = Math.atan2(yDistance, xDistance)

      const xVelocity = Math.cos(angle) * this.speed
      const yVelocity = Math.sin(angle) * this.speed

      this.position.x += xVelocity
      this.position.y += yVelocity
    }

    this.center = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    }

    this.collisionArea = {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height
    }
  }

  draw() {
    c.fillStyle = 'yellow'
    c.fillRect(this.position.x, this.position.y, this.width, this.height)
  }

  atDestination() {
    if (!this.destination) {
      return false
    }
    const destinationLeftExtent = this.destination.position.x - 20
    const destinationRightExtent = this.destination.position.x + this.destination.width + 20
    const destinationTopExtent = this.destination.position.y - 20
    const destinationBottomExtent = this.destination.position.y + this.destination.height + 20
    const atDestination = (
      this.center.x > destinationLeftExtent &&
      this.center.x < destinationRightExtent &&
      this.center.y > destinationTopExtent &&
      this.center.y < destinationBottomExtent
    )
    return atDestination
  }

  update(data) {

    this.speed = this.nominalSpeed * data.globalSpeed

    this.draw()
    this.travel()

    if (this.state.name == 'idle') {
      this.state.updateState('goingToStall', data)
    }

    if (this.atDestination()) {
      this.reachedDestination = true
    }

    if (this.reachedDestination && this.state.name === 'goingToStall') {
      this.state.updateState('selling', data = data)
      this.reachedDestination = false
    }

    if (this.reachedDestination && this.state.name === 'goingHome') {
      this.state.updateState('resting', data = data)
      this.reachedDestination = false
    }
  }

  getDistanceToAgent(agent) {
    const xDiff = agent.center.x - this.center.x
    const yDiff = agent.center.y - this.center.y
    return Math.hypot(xDiff, yDiff)
  }

  getClosestAgent(agents) {
    let closestDistance = this.getDistanceToAgent(agents[0])
    let closestAgent = agents[0]
    for (let i = 1; i < agents.length; i++) {
      if (this.getDistanceToAgent(agents[i]) < closestDistance) {
        closestAgent = agents[i]
      }
    }
    return closestAgent
  }


}