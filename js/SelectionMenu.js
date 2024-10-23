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
    this.area = {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height
    }
  }

  draw() {
    c.fillStyle = 'white'
    c.fillRect(
      this.position.x,
      this.position.y,
      this.width,
      this.height
    )
    c.lineWidth = 0.2
    c.strokeStyle = 'grey'
    c.strokeRect(
      this.position.x,
      this.position.y,
      this.width,
      this.height
    )
  }

  update(numButtons) {
    this.draw()
    this.width = (numButtons * (menuButtonWidth + menuBorder)) + menuBorder
  }
}

class agentMenuButton {
  constructor({ menu, i = 0, name, config }) {
    this.name = name
    this.width = menuButtonWidth
    this.height = menuButtonHeight
    this.menu = menu
    this.position = {
      x: this.menu.position.x + this.menu.border + (this.width + this.menu.border) * i,
      y: this.menu.position.y + this.menu.border
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
    this.agentConfig = config  // need this or not?
  }

  draw() {
    c.lineWidth = 0.2
    c.strokeStyle = 'grey'
    c.strokeRect(
      this.position.x,
      this.position.y,
      this.width,
      this.height
    )
  }

  update(i) {
    this.position = {
      x: this.menu.position.x + this.menu.border + (this.width + this.menu.border) * i,
      y: this.menu.position.y + this.menu.border
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

  constructor({menu, i = 1, name, agent, config}) {
    super({menu, i, name, config})
    this.name = name
    this.agent = agent
    this.thumbnail = new Image()
    this.thumbnail.src = config.imageSrc
    console.log("CONFIG")
    console.log(config.imageSrc)
    this.config = config
  }

  draw() {
    super.draw()

    c.drawImage(
      this.thumbnail,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    )
  }

  update(i) {
    this.draw()
    super.update(i)
  }
}


class DeleteButton extends agentMenuButton {

  draw(selected) {
    super.draw()
    c.fillStyle = selected ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.1)'
    c.stroke 
    c.fillRect(this.position.x, this.position.y, this.width, this.height)

    c.beginPath()
    c.lineWidth = 2
    c.moveTo(this.position.x + 5, this.position.y + 5)
    c.lineTo(this.position.x + this.width - 5, this.position.y + this.height - 5)
    c.stroke()
    c.moveTo(this.position.x + this.width - 5, this.position.y + 5)
    c.lineTo(this.position.x + 5, this.position.y + this.height - 5)
    c.strokeStyle = "rgb(80, 80, 80)"
    c.stroke()
    c.lineWidth = 0.8
  }

  update(i, selected) {
    this.draw(selected)
    super.update(i)
  }
}


class AgentPreview {
  constructor({ agent, rgb, config }) {
    this.agent = agent
    this.agentType = config.name
    this.position = {x: 0, y: 0}
    this.width = config.width,
    this.height = config.height,
    this.scale = config.scale,
    this.rgb = rgb
    this.thumbnail = new Image()
    this.thumbnail.src = config.imageSrc
  }

  draw() {
    c.drawImage(
      this.thumbnail,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    )
  }

  update(mouse) {
    this.position.x = mouse.x - this.width / 2
    this.position.y = mouse.y - this.height / 2
    this.draw()
  }
}