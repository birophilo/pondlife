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
    this.destination = {x: 400, y: 200, width: 130, height: 100}
    this.nominalSpeed = 0.02
    this.homePosition = {x: this.position.x, y: this.position.y}
    this.speed = this.nominalSpeed * globalSpeed
  }

  travel() {
    const xDistance = this.destination.x - this.position.x
    const yDistance = this.destination.y - this.position.y
    const angle = Math.atan2(yDistance, xDistance)

    const xVelocity = Math.cos(angle) * this.speed
    const yVelocity = Math.sin(angle) * this.speed

    this.position.x += xVelocity
    this.position.y += yVelocity

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
  }

  update(globalSpeed) {

    this.speed = this.nominalSpeed * globalSpeed

    this.draw()
    this.travel()

    const destinationLeftExtent = this.destination.x - 20
    const destinationRightExtent = this.destination.x + this.destination.width + 20

    const reachedDestination = (
      this.center.x > destinationLeftExtent && this.center.x < destinationRightExtent
    )

    if (reachedDestination) {
      this.destination.x = this.homePosition.x
      this.destination.y = this.homePosition.y
      // this.money -= 20
    }
  }
}