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

    this.actionList = []

    this.currentActionName = ''
    this.currentStateName = ''

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

    const destination = this.destination ? this.destination.id : 'none'
    c.strokeText('dest: ' + destination, this.position.x, this.position.y - 10)
    c.strokeText(this.currentStateName, this.position.x, this.position.y - 22)
    c.strokeText('money: ' + this.stateData.money, this.position.x, this.position.y - 34)
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
    if (this.actionList.length) {
      return this.actionList[0].changesApplied
    }
    return false
  }

  update(newData, globals) {

    super.update(globals)

    this.stateData = {...this.stateData, ...newData}

    this.globals = globals

    if (this.globals.animationFrameId % 20 === 0) {
      console.log(this.actionList.map(action => action.actionName))
    }


    this.speed = this.nominalSpeed * this.globals.globalSpeed

    this.draw()
    this.travel()

    // remove any freshly completed Actions from the action list
    if (this.actionList.length && this.actionList[0].isComplete === true) {
      this.actionList.splice(0, 1)
    }

    // go into 'idle' mode if no more actions
    if (this.actionList.length === 0) {
      this.defaultActions.idle()
      return
    }

    // if unstarted Action in action list, start it; if already doing action, check if complete
    if (this.actionList[0].isComplete === false) {
      if (this.actionList[0].inProgress === false) {
        const meetsConditions = this.actionList[0].meetsConditions()
        console.log('meets conditions', meetsConditions)
        if (meetsConditions) {
          this.actionList[0].inProgress = true
          this.actionList[0].start(globals)
        }
      }
    }

    if (this.actionList[0].inProgress === true) {
      console.log('checking')
      this.actionList[0].check(this.stateData, globals)
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
