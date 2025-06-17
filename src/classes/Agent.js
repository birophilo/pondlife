import { createSpriteObject, SpriteHandler } from './Sprite.js'
import { ACTION_HANDLERS } from './Action.js'
import { get8WayDirection } from '../utils.js'


export function createAgentObject (
  id = null,
  agentType,
  position = { x: 0, y: 0 },
  num = 0,
  globals
) {

  let spriteObject = createSpriteObject(
    position,
    agentType.previewImage,
    agentType.animationSet,
    agentType
    // agentType.initialSpriteSheet  // not currently in object?
  )

  let agentObject = {
    num: num,
    name: `${agentType.name} ${num}`,
    agentType: agentType.name,
    width: agentType.width,
    height: agentType.height,
    position: position,
    config: agentType,
    destination: null,
    reachedDestination: false,
    nominalSpeed: agentType.nominalSpeed,
    speed: agentType.nominalSpeed * globals.globalSpeed,
    stateData: {},  // stateful configurable properties/parameters/variables, e.g. money: 100
    currentAction: null,
    currentActionName: '',
    currentStateName: 'idle',
    currentActionSequence: null,
    currentDirection: null  // temporary approach?
  }

  if (id !== null) {
    agentObject.id = id
  }

  let item = {...agentObject, ...spriteObject}

  item.collisionArea = {
    ...position,
    width: agentType.width,
    height: agentType.height
  }

  item.center = {...position}
  item.spawnPointPosition = {...position}

  item.spawnPoint = {
    position: {...position},
    width: 80,
    height: 80,
    name: 'spawn point'
  }

  // REMOVE THIS FOR NOW
  // item.labelElement = document.createElement('div')
  // item.labelElement.classList.add('canvas-agent-label')
  // const canvasContainer = document.getElementsByClassName('canvas-container')[0]
  // canvasContainer.appendChild(item.labelElement)

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

      const xFunc = xVelocity > 0 ? Math.min : Math.max
      const yFunc = yVelocity > 0 ? Math.min : Math.max

      const xTravel = xFunc(xVelocity, xDistance)
      const yTravel = yFunc(yVelocity, yDistance)

      item.position.x += xTravel
      item.position.y += yTravel

      if (item.config.animationSet !== null) {
        const direction = get8WayDirection(xVelocity, yVelocity)
        if (item.currentDirection !== direction) {
          this.useSpriteSheet(direction, item)
        }
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
    const destinationLeftExtent = item.destination.position.x
    const destinationRightExtent = item.destination.position.x + item.destination.width
    const destinationTopExtent = item.destination.position.y
    const destinationBottomExtent = item.destination.position.y + item.destination.height
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
      const actionType = item.currentAction.actionType
      const handler = new ACTION_HANDLERS[actionType]()
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
    // this.updateLabel(item)
  }

  update(c, newData, globals, item) {

    super.update(globals, item)

    item.stateData = {...item.stateData, ...newData}
    item.globals = globals
    item.speed = item.nominalSpeed * item.globals.globalSpeed

    // this.updateLabel(item)

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
      const distance = this.getDistanceToAgent(agent, targetAgents[i])
      if (distance < closestDistance) {
        closestAgent = targetAgents[i]
        closestDistance = distance
      }
    }
    return closestAgent
  }

  getClosestAgentViaMap(agent, agentList) {
    const distances = agentList.map(ag => this.getDistanceToAgent(agent, ag))
    const closest = Math.min(...distances)
    const index = distances.indexOf(closest)
    return agentList[index]
  }

  getRandomAgent(agents) {
    const randomIndex = Math.floor(Math.random() * agents.length)
    return agents[randomIndex]
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