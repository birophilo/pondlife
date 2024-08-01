class LemonadeStall {
  constructor({ position = { x: 0, y: 0 }, width, height, id }) {
    this.position = position
    this.width = width
    this.height = height
    // distance from stall to count as collision (same for x and y here)
    this.accessRange = 20
    this.id = id
    this.money = 0
  }

  draw() {
    c.fillStyle = 'blue'
    c.fillRect(
      this.position.x,
      this.position.y,
      this.width,
      this.height
    )

    c.fillStyle = 'rgba(40, 70, 80, 0.3)'
    c.fillRect(
      this.position.x - this.accessRange,
      this.position.y - this.accessRange,
      this.width + this.accessRange * 2,
      this.height + this.accessRange * 2
    )

    c.fillStyle = 'black'
    c.fillText('money: ' + this.money, this.position.x, this.position.y - 5)
  }
}

const firstStall = {
  position: {x: 400, y: 200},
  width: 130,
  height: 100,
  id: 'firstStall'
}