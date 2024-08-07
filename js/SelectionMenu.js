const menuWidth = 200
const menuHeight = 50
const menuBorder = 5

const menuButtonWidth = 40
const menuButtonHeight = 40

const menuPosX = 20
const menuPosY = 520


class AgentMenu {
  constructor() {
    this.position = {x: menuPosX, y: menuPosY}
    this.width = menuWidth
    this.height = menuHeight
    this.border = menuBorder
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

class agentMenuButton {
  constructor({ menu, i = 0, name }) {
    this.name = name
    this.width = menuButtonWidth
    this.height = menuButtonHeight
    this.menu = menu
    this.position = {
      x: this.menu.position.x + this.menu.border + (this.width + this.menu.border) * i,
      y: this.menu.position.y + this.menu.border
      // x: (this.menu.position.x + this.border) * i,
      // y: this.menu.position.y + this.border
    }

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

class AgentMenuIcon extends agentMenuButton {

  constructor({menu, i = 1, name, rgb}) {
    super({menu, i, name})
    this.rgb = rgb
  }

  draw() {
    c.fillStyle = `rgb(${this.rgb[0]}, ${this.rgb[1]}, ${this.rgb[2]})`
    c.fillRect(this.position.x, this.position.y, this.width, this.height)
  }
}

class AgentPreview {
  constructor({ agent, rgb }) {
    this.agent = agent
    this.position = {x: 0, y: 0}
    this.width = agent.baseWidth()
    this.height = agent.baseHeight()
    this.rgb = rgb
  }

  draw() {
    c.fillStyle = `rgba(${this.rgb[0]}, ${this.rgb[1]}, ${this.rgb[2]}, 0.4)`
    c.fillRect(this.position.x, this.position.y, this.width, this.height)
  }

  update(mouse) {
    this.position.x = mouse.x - this.width / 2
    this.position.y = mouse.y - this.height / 2
    this.draw()  
  }
}

class DeleteButton extends agentMenuButton {

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