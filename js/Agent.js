function get8WayDirection(xVelocity, yVelocity) {
  const diagonalThreshold = 0.2
  const xVelocityIsNotDiagonal = Math.abs(xVelocity) < diagonalThreshold
  const yVelocityIsNotDiagonal = Math.abs(yVelocity) < diagonalThreshold

  if (xVelocity > 0 && yVelocityIsNotDiagonal) {
    return 'right'
  } else if (xVelocity < 0 && yVelocityIsNotDiagonal) {
    return 'left'
  } else if (xVelocityIsNotDiagonal && yVelocity > 0) {
    return 'down'
  } else if (xVelocityIsNotDiagonal && yVelocity < 0) {
    return 'up'
  } else if (xVelocity >= diagonalThreshold && yVelocity > diagonalThreshold) {
    return 'downRight'
  } else if (xVelocity >= diagonalThreshold && yVelocity < -diagonalThreshold) {
    return 'upRight'
  } else if (xVelocity <= -diagonalThreshold && yVelocity < -diagonalThreshold) {
    return 'upLeft'
  } else if (xVelocity <= -diagonalThreshold && yVelocity > -diagonalThreshold) {
    return 'downLeft'
  }
}


class Agent extends Sprite {

  constructor({
    position = { x: 0, y: 0 },
    num = 0,
    globals,
    config
  }) {
    super({ 
      position,
      imageSrc: config.imageSrc,
      frames: config.frames,
      offset: config.offset,
      scale: config.scale
    })
    this.name = config.name
    this.num = num
    this.width = config.width
    this.height = config.height
    this.position = position
    this.config = config

    // move to Sprite class
    this.spriteSheets = config.spriteSheets

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

    this.defaultActions = new ActionDefaults(this)

    this.currentAction = null

    this.currentActionName = ''
    this.currentStateName = ''

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

      const direction = get8WayDirection(xVelocity, yVelocity)
      this.image.src = this.spriteSheets[direction]
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

  draw() {
    super.draw()
    this.updateLabel()
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
      return this.currentAction.defaultCompletionCheckPasses()
    }
  }

  updateLabel() {
    /* Update the display text placed just above the agent */
    this.labelElement.style.top = `${this.position.y - 20}px`
    this.labelElement.style.left = `${this.position.x}px`
    this.labelText = `money: ${this.stateData.money}<br />${this.currentStateName}`
    this.labelElement.innerHTML = this.labelText
  }

  update(newData, globals) {

    super.update(globals)

    this.stateData = {...this.stateData, ...newData}
    this.globals = globals
    if (globals.animationFrameId % 32 === 0) console.log('action: ' + this.currentAction)
    this.speed = this.nominalSpeed * this.globals.globalSpeed

    this.updateLabel()

    this.draw()
    this.travel()

    // remove action if complete
    if (this.currentAction && this.currentAction.defaultCompletionCheckPasses() === true) {
      this.currentAction = null
    }

    // go into 'idle' mode if no more actions
    if (this.currentAction === null) {
      this.defaultActions.idle()
      return
    }

    // if unstarted Action in action list, start it; if already doing action, check if complete
    if (this.currentAction.isComplete === false) {
      if (this.currentAction.inProgress === false) {
        const meetsConditions = this.currentAction.meetsConditions()
        console.log('meets conditions', meetsConditions)
        if (meetsConditions) {
          this.currentAction.inProgress = true
          this.currentAction.start(globals)
        }
      }
    }

    if (this.currentAction.inProgress === true) {
      console.log('checking')
      this.currentAction.check(this.stateData, globals)
    }
  }

  endDay() {
    this.stateData.money = 100
  }

  getDistanceToAgent(agent) {
    const xDiff = agent.center.x - this.center.x
    const yDiff = agent.center.y - this.center.y
    return Math.hypot(xDiff, yDiff)
  }

  getClosestAgent(agents) {
    let closestDistance = this.getDistanceToAgent(agents[0])
    let closestAgent = agents[0]
    for (let i = 1; i < agents.length; i++) {
      if (this.getDistanceToAgent(agents[i]) < closestDistance) {
        closestAgent = agents[i]
      }
    }
    return closestAgent
  }

  setProperty(property, value) {
    this.stateData[property] = value
  }
}
