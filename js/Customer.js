const CUSTOMER_SPRITE_DIRECTION = {
  up: '../img/sprites/GirlSample_Walk_Up.png',
  upRight: '../img/sprites/GirlSample_Walk_UpRight.png',
  right: '../img/sprites/GirlSample_Walk_Right.png',
  downRight: '../img/sprites/GirlSample_Walk_DownRight.png',
  down: '../img/sprites/GirlSample_Walk_Down.png',
  downLeft: '../img/sprites/GirlSample_Walk_DownLeft.png',
  left: '../img/sprites/GirlSample_Walk_Left.png',
  upLeft: '../img/sprites/GirlSample_Walk_UpLeft.png'
}

function get8WayDirection(xVelocity, yVelocity) {
  const diagonalThreshold = 0.2
  const xVelocityIsNotDiagonal = Math.abs(xVelocity) < diagonalThreshold
  const yVelocityIsNotDiagonal = Math.abs(yVelocity) < diagonalThreshold

  if (xVelocity > 0 && yVelocityIsNotDiagonal) {
    return 'right'
  } else if (xVelocity < 0 && yVelocityIsNotDiagonal) {
    return 'left'
  } else if (xVelocityIsNotDiagonal && yVelocity > 0) {
    return 'down'
  } else if (xVelocityIsNotDiagonal && yVelocity < 0) {
    return 'up'
  } else if (xVelocity >= diagonalThreshold && yVelocity > diagonalThreshold) {
    return 'downRight'
  } else if (xVelocity >= diagonalThreshold && yVelocity < -diagonalThreshold) {
    return 'upRight'
  } else if (xVelocity <= -diagonalThreshold && yVelocity < -diagonalThreshold) {
    return 'upLeft'
  } else if (xVelocity <= -diagonalThreshold && yVelocity > -diagonalThreshold) {
    return 'downLeft'
  }
}


class CustomerState {
  constructor(customer) {
    this.name = 'idle'
    this.customer = customer
  }

  updateState(state, data) {
    if (state === 'goingToStall') {
      this.goToStall(data)
    }  else if (state === 'goingHome') {
      this.goHome(data)
    } else if (state === 'resting') {
      this.rest(data)
    } else if (state === 'buying') {
      this.buy(data)
    }
  }

  goToStall(data) {
    this.name = 'goingToStall'
    const hasEnoughMoney = this.customer.money >= 20
    if (hasEnoughMoney) {
      const closestStall = this.customer.getClosestAgent(data.stalls)
      data.stall = closestStall
      this.customer.destination = closestStall
      this.customer.frames.max = 9
    }
  }

  goHome(data) {
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
    this.name = 'goingHome'
    this.customer.frames.max = 9
  }

  rest(data) {
    this.name = 'resting'
    this.customer.destination = null
    const self = this
    let timer1 = new Timer(data.frameId, 500, self, 'goingToStall', data)
    timers.push(timer1)
    this.customer.image.src = '../img/sprites/GirlSample_Walk_Down.png'
    this.customer.frames.max = 1
  }

  buy(data) {
    this.name = 'buying'
    const self = this
    let timer2 = new Timer(data.frameId, 200, self, 'goingHome', data)
    timers.push(timer2)
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
}

class Customer extends Sprite {

  static agentName() {
    return 'customer'
  }

  static baseWidth() {
    return 40
  }

  static baseHeight() {
    return 40
  }

  constructor({
    position = { x: 0, y: 0 },
    num = 0,
    globalSpeed,
    offset,
    scale
  }) {
    super({ 
      position,
      imageSrc: '../img/sprites/GirlSample_Walk_Down.png',
      frames: {max: 9, columns: 4, rows: 3} ,
      offset,
      scale
    })
    this.name = 'customer'
    this.num = num
    this.width = 30
    this.height = 40
    this.money = 100
    this.position = position
    this.collisionArea = {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height
    }
    this.center = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    }
    this.destination = null
    this.nominalSpeed = 0.01
    this.homePosition = {x: this.position.x, y: this.position.y}
    this.speed = this.nominalSpeed * globalSpeed

    this.restTimeBetweenTrips = 500 // frames
    this.actionEndedFrame = null

    this.reachedDestination = false

    this.state = new CustomerState(this)
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

      const direction = get8WayDirection(xVelocity, yVelocity)
      this.image.src = CUSTOMER_SPRITE_DIRECTION[direction]
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
    // c.fillStyle = 'red'
    // c.fillRect(this.position.x, this.position.y, this.width, this.height)

    super.draw()

    const destination = this.destination ? this.destination.id : 'none'
    c.strokeText('dest: ' + destination, this.position.x, this.position.y - 10)
    c.strokeText(this.state.name, this.position.x, this.position.y - 22)
    c.strokeText('money: ' + this.money, this.position.x, this.position.y - 34)
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

    super.update()

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
      this.state.updateState('buying', data = data)
      this.reachedDestination = false
    }

    if (this.reachedDestination && this.state.name === 'goingHome') {
      this.state.updateState('resting', data)
      this.reachedDestination = false
    }

  }

  endDay() {
    this.money = 100
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
