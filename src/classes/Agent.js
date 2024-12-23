import { Sprite, createSpriteObject, SpriteHandler } from './Sprite.js'
import { ACTION_HANDLERS } from './Action.js'
import { get8WayDirection } from '../utils.js'

export default class Agent extends Sprite {

  constructor({
    agentTypeName,
    position = { x: 0, y: 0 },
    num = 0,
    globals,
    config
  }) {
    super({
      position,
      previewImage: config.previewImage,
      animationSet: config.animationSet,
      initialSpriteSheet: config.initialSpriteSheet
    })
    this.num = num
    this.name = `${agentTypeName} ${num}`
    this.agentType = agentTypeName
    this.width = config.width
    this.height = config.height
    this.position = position
    this.config = config

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
    this.nominalSpeed = config.nominalSpeed
    this.homePosition = {x: this.position.x, y: this.position.y}

    this.home = {
      position: {
        x: this.homePosition.x,
        y: this.homePosition.y
      },
      width: 80,
      height: 80,
      name: 'home',
      id: 1
    }

    this.speed = this.nominalSpeed * globals.globalSpeed

    this.reachedDestination = false

    // stateful configurable properties/parameters/variables
    this.stateData = {}  // e.g. money: 100

    this.currentAction = null

    this.currentActionName = ''
    this.currentStateName = ''

    this.currentDirection = null  // temporary approach?

    this.labelElement = document.createElement('div')
    this.labelElement.classList.add('canvas-agent-label')
    const canvasContainer = document.getElementsByClassName('canvas-container')[0]
    canvasContainer.appendChild(this.labelElement)

  }

  travel() {
    if (this.destination) {
      const xDistance = this.destination.position.x - this.position.x
      const yDistance = this.destination.position.y - this.position.y
      const angle = Math.atan2(yDistance, xDistance)

      const xVelocity = Math.cos(angle) * this.speed
      const yVelocity = Math.sin(angle) * this.speed

      this.position.x += xVelocity
      this.position.y += yVelocity

      if (this.config.animationSet !== null) {
        const direction = get8WayDirection(xVelocity, yVelocity)
        if (this.currentDirection !== direction) this.useSpriteSheet(direction)
        this.currentDirection = direction
      }
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

  atDestination() {
    if (!this.destination) {
      return false
    }
    const destinationLeftExtent = this.destination.position.x - 20
    const destinationRightExtent = this.destination.position.x + this.destination.width + 20
    const destinationTopExtent = this.destination.position.y - 20
    const destinationBottomExtent = this.destination.position.y + this.destination.height + 20
    const atDestination = (
      this.center.x > destinationLeftExtent &&
      this.center.x < destinationRightExtent &&
      this.center.y > destinationTopExtent &&
      this.center.y < destinationBottomExtent
    )
    return atDestination
  }

  actionChangesApplied() {
    if (this.currentAction) {
      return this.currentAction.changesApplied
    }
    return false
  }

  actionIsComplete() {
    if (this.currentAction) {
      return this.currentAction.defaultCompletionCheckPasses(this.currentAction)
    }
  }

  updateLabel() {
    /* Update the display text placed just above the agent */
    const properties = Object.keys(this.stateData)
    const propertiesText = properties.map(key => `${key}: ${this.stateData[key]}`)
    this.labelTextProperties = propertiesText.join('<br />')
    this.labelText = properties.length
      ? `${this.labelTextProperties}<br />${this.currentStateName}`
      : `${this.currentStateName}`

    const lineHeight = 12
    const yOffset = 12 + (lineHeight * properties.length)

    this.labelElement.style.top = `${this.position.y - yOffset}px`
    this.labelElement.style.left = `${this.position.x}px`
    this.labelElement.innerHTML = this.labelText
  }

  draw(c) {
    super.draw(c)
    this.updateLabel()
  }

  update(c, newData, globals) {

    super.update(globals)

    this.stateData = {...this.stateData, ...newData}
    this.globals = globals
    this.speed = this.nominalSpeed * this.globals.globalSpeed

    this.updateLabel()

    this.draw(c)
    if (this.currentAction?.actionType === 'goTo') {
      this.travel()
    }

  }

  endDay() {
    this.stateData.money = 100
  }


  getDistanceToAgent(item) {
    const xDiff = item.center.x - item.center.x
    const yDiff = item.center.y - item.center.y
    return Math.hypot(xDiff, yDiff)
  }

  getClosestAgent(agentItems) {
    let closestDistance = this.getDistanceToAgent(agentItems[0])
    let closestAgent = agentItems[0]
    for (let i = 1; i < agentItems.length; i++) {
      if (this.getDistanceToAgent(agentItems[i]) < closestDistance) {
        closestAgent = agentItems[i]
      }
    }
    return closestAgent
  }

  setProperty(property, value) {
    this.stateData[property] = value
  }

  idle() {
    this.destination = null
    this.currentStateName = 'idle'

    if (this.animationSet !== null) {
      this.useSpriteSheet('idle')
    }
  }
}


export function createAgentObject (
    agentTypeName,
    position = { x: 0, y: 0 },
    num = 0,
    globals,
    config
  ) {

    let spriteObject = createSpriteObject(
      position,
      config.previewImage,
      config.animationSet,
      config.initialSpriteSheet
    )

    let agentObject = {
      num: num,
      name: `${agentTypeName} ${num}`,
      agentType: agentTypeName,
      width: config.width,
      height: config.height,
      position: position,
      config: config,
      destination: null,
      reachedDestination: false,
      nominalSpeed: config.nominalSpeed,
      speed: config.nominalSpeed * globals.globalSpeed,
      stateData: {},  // stateful configurable properties/parameters/variables, e.g. money: 100
      currentAction: null,
      currentActionName: '',
      currentStateName: '',
      currentDirection: null  // temporary approach?
    }

    let item = {...agentObject, ...spriteObject}

    item.collisionArea = {
      ...position,
      width: config.width,
      height: config.height
    }

    item.center = {...position}
    item.homePosition = {...position}

    item.home = {
      position: {...position},
      width: 80,
      height: 80,
      name: 'home',
      id: 1
    }

    item.labelElement = document.createElement('div')
    item.labelElement.classList.add('canvas-agent-label')
    const canvasContainer = document.getElementsByClassName('canvas-container')[0]
    canvasContainer.appendChild(item.labelElement)

    return item
}



export class AgentHandler extends SpriteHandler {

  travel(item) {
    if (item.destination) {
      const xDistance = item.destination.position.x - item.position.x
      const yDistance = item.destination.position.y - item.position.y
      const angle = Math.atan2(yDistance, xDistance)

      const xVelocity = Math.cos(angle) * item.speed
      const yVelocity = Math.sin(angle) * item.speed

      item.position.x += xVelocity
      item.position.y += yVelocity

      if (item.config.animationSet !== null) {
        const direction = get8WayDirection(xVelocity, yVelocity)
        if (item.currentDirection !== direction) this.useSpriteSheet(direction, item)
        item.currentDirection = direction
      }
    }

    item.center = {
      x: item.position.x + item.width / 2,
      y: item.position.y + item.height / 2
    }

    item.collisionArea = {
      x: item.position.x,
      y: item.position.y,
      width: item.width,
      height: item.height
    }
  }

  atDestination(item) {
    if (!item.destination) {
      return false
    }
    const destinationLeftExtent = item.destination.position.x - 20
    const destinationRightExtent = item.destination.position.x + item.destination.width + 20
    const destinationTopExtent = item.destination.position.y - 20
    const destinationBottomExtent = item.destination.position.y + item.destination.height + 20
    const atDestination = (
      item.center.x > destinationLeftExtent &&
      item.center.x < destinationRightExtent &&
      item.center.y > destinationTopExtent &&
      item.center.y < destinationBottomExtent
    )
    return atDestination
  }

  actionIsComplete(item) {
    if (item.currentAction) {
      /* SELECT CORRECT ACTION HANDLER */
      const actionName = item.currentAction.actionName
      const handler = new ACTION_HANDLERS[actionName]()
      return handler.defaultCompletionCheckPasses(item.currentAction, item)
    }
  }

  updateLabel(item) {
    /* Update the display text placed just above the agent */
    const properties = Object.keys(item.stateData)
    const propertiesText = properties.map(key => `${key}: ${item.stateData[key]}`)
    item.labelTextProperties = propertiesText.join('<br />')
    item.labelText = properties.length
      ? `${item.labelTextProperties}<br />${item.currentStateName}`
      : `${item.currentStateName}`

    const lineHeight = 12
    const yOffset = 12 + (lineHeight * properties.length)

    item.labelElement.style.top = `${item.position.y - yOffset}px`
    item.labelElement.style.left = `${item.position.x}px`
    item.labelElement.innerHTML = item.labelText
  }

  draw(c, item) {
    super.draw(c, item)
    this.updateLabel(item)
  }

  update(c, newData, globals, item) {

    super.update(globals, item)

    item.stateData = {...item.stateData, ...newData}
    item.globals = globals
    item.speed = item.nominalSpeed * item.globals.globalSpeed

    this.updateLabel(item)

    this.draw(c, item)
    if (item.currentAction?.actionType === 'goTo') {
      this.travel(item)
    }

  }

  endDay(item) {
    item.stateData.money = 100
  }

  getDistanceToAgent(agent, targetAgent) {
    const xDiff = targetAgent.center.x - agent.center.x
    const yDiff = targetAgent.center.y - agent.center.y
    return Math.hypot(xDiff, yDiff)
  }

  getClosestAgent(agent, targetAgents) {
    let closestDistance = this.getDistanceToAgent(agent, targetAgents[0])
    let closestAgent = targetAgents[0]
    for (let i = 1; i < targetAgents.length; i++) {
      if (this.getDistanceToAgent(agent, targetAgents[i]) < closestDistance) {
        closestAgent = targetAgents[i]
      }
    }
    return closestAgent
  }

  setProperty(property, value, item) {
    item.stateData[property] = value
  }

  idle(item) {
    item.destination = null
    item.currentStateName = 'idle'

    if (item.animationSet !== null) {
      this.useSpriteSheet('idle', item)
    }
  }
}