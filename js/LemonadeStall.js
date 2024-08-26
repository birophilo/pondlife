class LemonadeStall {

  static agentName() {
    return 'lemonadeStall'
  }

  static baseWidth() {
    return 130
  }

  static baseHeight() {
    return 100
  }

  constructor({
    position = { x: 0, y: 0 },
    imageSrc = '../img/stall-1.png',
    num = 0,
    id
  }) {
    this.name = 'lemonadeStall'
    this.image = new Image()
    this.image.src = imageSrc
    this.num = num
    this.position = position
    this.width = 130
    this.height = 104
    // distance from stall to count as collision (same for x and y here)
    this.accessRange = 20
    this.id = id
    this.money = 0
    this.lemons = 10
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
  }

  draw() {
    this.image.src = '../img/stall-1.png'
    // c.fillStyle = 'blue'
    // c.fillRect(
    //   this.position.x,
    //   this.position.y,
    //   this.width,
    //   this.height
    // )

    c.fillStyle = 'rgba(40, 70, 180, 0.1)'
    c.fillRect(
      this.position.x - this.accessRange,
      this.position.y - this.accessRange,
      this.width + this.accessRange * 2,
      this.height + this.accessRange * 2
    )

    c.fillStyle = 'black'
    c.fillText(
      `money: ${this.money}, lemons: ${this.lemons}`,
      this.position.x,
      this.position.y - 5
    )

    c.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    )
  }

  update() {
    return
  }
}