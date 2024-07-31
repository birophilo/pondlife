class LemonadeStall {
  constructor({ position = { x: 0, y: 0 } }) {
    this.position = position
    this.width = 130
    this.height = 100
    // distance from stall to count as collision (same for x and y here)
    this.accessRange = 20
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