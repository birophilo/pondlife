import { Agent } from './Agent.js'

const menuWidth = 200
const menuHeight = 50
const menuBorder = 5

const menuButtonWidth = 40
const menuButtonHeight = 40

const menuPosX = 20
const menuPosY = 520


export class AgentMenu {
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

  draw(c) {
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

  update(c, numButtons) {
    this.draw(c)
    this.width = (numButtons * (menuButtonWidth + menuBorder)) + menuBorder
  }
}

class AgentMenuButton {
  constructor({ menu, i = 0, name }) {
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
  }

  draw(c) {
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

export class AgentMenuIcon extends AgentMenuButton {

  constructor({ menu, i = 1, name, agentType }) {
    super({ menu, i, name })
    this.name = name
    this.agent = Agent
    this.thumbnail = new Image()
    this.thumbnail.src = '/media/' + agentType.thumbnail
    this.agentType = agentType
  }

  draw(c) {
    super.draw(c)

    c.drawImage(
      this.thumbnail,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    )
  }

  update(c, i) {
    if (this.thumbnail.src !== this.agentType.thumbnail) {
      this.thumbnail.src = this.agentType.thumbnail
    }
    this.draw(c)
    super.update(i)
  }
}


export class DeleteButton extends AgentMenuButton {

  draw(c, selected) {
    super.draw(c)
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

  update(c, i, selected) {
    this.draw(c, selected)
    super.update(i)
  }
}


export class AgentPreview {
  constructor(agentType) {
    this.agentType = agentType
    this.position = {x: 0, y: 0}
    this.width = agentType.width,
    this.height = agentType.height,
    this.image = new Image()
    this.image.src = "/media/" + agentType.previewImage

    if (agentType.defaultSpritesheet !== undefined) {
      this.image.src = agentType.defaultSpritesheet
      this.spritesheet = agentType.defaultSpritesheet
    } else {
      try {
        this.image.src = "/media/" + agentType.animationSet.sheets['idle'].src
        this.spritesheet = agentType.animationSet.sheets['idle']
      } catch (error) {
        console.log(`Could not load image for ${agentType.name}: ${error}`)
      }
    }
  }

  draw(c) {
    const spriteWidth = this.image.width / this.spritesheet.columns
    const spriteHeight = this.image.height / this.spritesheet.rows
    const offsetX = this.agentType.animationSet.offset.x * this.agentType.animationSet.scale
    const offsetY = this.agentType.animationSet.offset.y * this.agentType.animationSet.scale

    c.drawImage(
      this.image,
      0,
      0,
      spriteWidth,
      spriteHeight,
      this.position.x - offsetX,
      this.position.y - offsetY,
      spriteWidth * this.agentType.animationSet.scale,
      spriteHeight * this.agentType.animationSet.scale
    )
  }

  update(c, mouse) {
    this.position.x = mouse.x - this.width / 2
    this.position.y = mouse.y - this.height / 2
    this.draw(c)
  }
}