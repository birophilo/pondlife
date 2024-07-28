class SupplyVan {
  constructor({ position = { x: 0, y: 0 } }) {
    this.position = position
    this.speed = 1
    this.destination = {x: 400, y: 200}
    this.homePosition = {x: this.position.x, y: this.position.y}
  }

  travel() {
    const xDistance = this.destination.x - this.position.x
    const yDistance = this.destination.y - this.position.y
    const angle = Math.atan2(yDistance, xDistance)

    const xVelocity = Math.cos(angle) * this.speed
    const yVelocity = Math.sin(angle) * this.speed

    this.position.x += xVelocity
    this.position.y += yVelocity
  }

  draw() {
    c.fillStyle = 'yellow'
    c.fillRect(this.position.x, this.position.y, 50, 50)
  }

  update() {
    this.draw()
    this.travel()

    if (Math.abs(this.destination.x - this.position.x) < 5 && Math.abs(this.destination.y - this.position.y) < 5) {
      this.destination.x = this.homePosition.x
      this.destination.y = this.homePosition.y
    }
  }

}