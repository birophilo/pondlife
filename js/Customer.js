const CUSTOMER_SPRITE_DIRECTION = {
  up: '../img/sprites/GirlSample_Walk_Up.png',
  upRight: '../img/sprites/GirlSample_Walk_UpRight.png',
  right: '../img/sprites/GirlSample_Walk_Right.png',
  downRight: '../img/sprites/GirlSample_Walk_DownRight.png',
  down: '../img/sprites/GirlSample_Walk_Down.png',
  downLeft: '../img/sprites/GirlSample_Walk_DownLeft.png',
  left: '../img/sprites/GirlSample_Walk_Left.png',
  upLeft: '../img/sprites/GirlSample_Walk_UpLeft.png'
}

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


class Customer extends Sprite {

  static agentName() {
    return 'customer'
  }

  static imageSrc() {
    return '../img/sprites/GirlSample_Walk_Up.png'
  }

  static scale() {
    return 0.7
  }

  constructor({
    position = { x: 0, y: 0 },
    num = 0,
    globals,
    offset,
    scale
  }) {
    super({ 
      position,
      imageSrc: '../img/sprites/GirlSample_Walk_Down.png',
      frames: {max: 9, columns: 4, rows: 3} ,
      offset,
      scale
    })
    this.name = 'customer'
    this.num = num
    this.width = 30
    this.height = 40
    this.position = position
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
    this.nominalSpeed = 0.02
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

    this.restTimeBetweenTrips = 400 // frames
    this.actionEndedFrame = null

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
      this.image.src = CUSTOMER_SPRITE_DIRECTION[direction]
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

  update(newData) {

    super.update()

    this.stateData = {...this.stateData, ...newData}

    if (this.stateData.globals.animationFrameId % 20 === 0) {
      console.log(this.actionList.map(action => action.actionName))
    }


    this.speed = this.nominalSpeed * this.stateData.globals.globalSpeed

    this.draw()
    this.travel()

    // remove any freshly completed Actions from the action list
    if (this.actionList.length && this.actionList[0].isComplete) {
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
          this.actionList[0].start()
        }
      }
    }

    if (this.actionList[0].inProgress === true) {
      console.log('checking')
      this.actionList[0].check(this.stateData)
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

  addProperty(property, value) {
    this.stateData[property] = value
  }
}
