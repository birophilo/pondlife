class CustomerState {
  constructor(customer) {
    this.name = 'idle'
    this.customer = customer
  }

  updateState(state, data) {
    if (state === 'goingToStall') {
      this.goToStall()
    }  else if (state === 'goingHome') {
      this.goHome()
    } else if (state === 'resting') {
      this.rest(data.frameId)
    }
  }

  goToStall() {
    this.customer.destination = {
      x: 400,
      y: 200,
      width: 130,
      height: 100,
      name: 'stall'
  }
    this.name = 'goingToStall'
  }

  goHome() {
    this.customer.destination = {
      x: this.customer.homePosition.x,
      y: this.customer.homePosition.y,
      width: 80,
      height: 80,
      name: 'home'
    }
    this.name = 'goingHome'
  }

  rest(currentFrame) {
    this.name = 'resting'
    this.customer.destination = null
    const self = this
    // const hello = () => {console.log("HELLOHELLO")}
    let timer1 = new Timer(currentFrame, 500, self, 'goingToStall')
    timers.push(timer1)
  }
}

class Customer {
  constructor({ position = { x: 0, y: 0 }, num = 0, globalSpeed }) {
    this.customerNumber = num
    this.money = 100
    this.position = position
    this.width = 40
    this.height = 40
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
    this.state.updateState('goingToStall')
    
  }

  travel() {
    if (this.destination) {
      const xDistance = this.destination.x - this.position.x
      const yDistance = this.destination.y - this.position.y
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
    c.fillStyle = 'red'
    c.fillRect(this.position.x, this.position.y, this.width, this.height)

    const destination = this.destination ? this.destination.name : 'none'
    c.strokeText('dest: ' + destination, this.position.x, this.position.y - 10)
    c.strokeText(this.state.name, this.position.x, this.position.y - 22)
  }

  atDestination() {
    if (!this.destination) {
      return false
    }
    const destinationLeftExtent = this.destination.x - 20
    const destinationRightExtent = this.destination.x + this.destination.width + 20
    return this.center.x > destinationLeftExtent && this.center.x < destinationRightExtent
  }

  update(data = {globalSpeed, frameId}) {

    this.speed = this.nominalSpeed * data.globalSpeed

    this.draw()
    this.travel()

    if (this.atDestination()) {
      this.reachedDestination = true
    }

    if (this.reachedDestination && this.state.name === 'goingToStall') {
      this.state.updateState('goingHome')
      this.reachedDestination = false
    }

    if (this.reachedDestination && this.state.name === 'goingHome') {
      this.state.updateState('resting', data = data)
      this.reachedDestination = false
    }

      // this.actionEndedFrame = this.actionEndedFrame ? this.actionEndedFrame : data.frameId

      // if (data.frameId > this.actionEndedFrame + this.restTimeBetweenTrips) {
      //   console.log("GOING TO STALL NOW")
      //   this.state.updateState('goingToStall')
      //   this.actionEndedFrame = null
      // }

  }

  endDay() {
    this.money = 100
  }
}
