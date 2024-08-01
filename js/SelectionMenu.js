class AgentMenu {
  constructor() {
    this.position = {x: 20, y: 520}
    this.height = 50
    this.width = 200
    this.border = 5
  }

  draw() {
    c.fillStyle = 'white'
    c.fillRect(
      this.position.x,
      this.position.y,
      this.width,
      this.height
    )
  }
}

class Button {
  constructor({ position = {x: 0, y: 0} }) {
    this.position = position
    this.height = 40
    this.width = 40
    this.center = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    }
    this.area = {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height
    }
  }

}

class AgentMenuIcon extends Button {

  draw() {
    c.fillStyle = 'red'
    c.fillRect(this.position.x, this.position.y, this.width, this.height)
  }
}

class AgentPreview {
  constructor() {
    this.position = {x: 20, y: 50}
    this.height = 40
    this.width = 40
  }

  draw() {
    c.fillStyle = 'rgba(255, 0, 0, 0.4)'
    c.fillRect(this.position.x, this.position.y, this.width, this.height)
  }

  update(mouse) {
    this.position.x = mouse.x - this.width / 2
    this.position.y = mouse.y - this.height / 2
    this.draw()  
  }
}

class DeleteButton extends Button {

  draw(selected) {
    c.fillStyle = selected ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.1)'
    c.stroke 
    c.fillRect(this.position.x, this.position.y, this.width, this.height)

    c.beginPath()
    c.lineWidth = 2
    c.moveTo(this.position.x, this.position.y)
    c.lineTo(this.position.x + this.width, this.position.y + this.height)
    c.stroke()
    c.moveTo(this.position.x + this.width, this.position.y)
    c.lineTo(this.position.x, this.position.y + this.height)
    c.strokeStyle = "black"
    c.stroke()
    c.lineWidth = 0.8
  }
}