class Agent extends Sprite {

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
      offset: config.offset,
      scale: config.scale
    })
    this.num = num
    this.name = `${agentTypeName} ${num}`
    this.agentType = agentTypeName
    this.width = config.width
    this.height = config.height
    this.position = position
    this.config = config

    // move to Sprite class
    this.spriteMap = config.spriteMap

    if (this.spriteMap !== null) {
      // hard-coding - to change
      const spriteSheet = this.spriteMap.sheets['idle']
      this.image.src = spriteSheet.src

      this.frames = {
        ...this.frames,
        max: spriteSheet.numImages,
        columns: spriteSheet.columns,
        rows: spriteSheet.rows,
        hold: spriteSheet.refreshInterval
      }
      this.defaultFrames = {...this.frames}
    }


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

      if (this.config.spriteMap !== null) {
        const direction = get8WayDirection(xVelocity, yVelocity)

        if (this.currentDirection !== direction) {
          const spriteSheet = this.config.spriteMap.sheets[direction]
          this.image.src = spriteSheet.src
          this.frames = {
            ...this.frames,
            max: spriteSheet.numImages,
            columns: spriteSheet.columns,
            rows: spriteSheet.rows,
            hold: spriteSheet.refreshInterval
          }
        }
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

  update(newData, globals) {

    super.update(globals)

    this.stateData = {...this.stateData, ...newData}
    this.globals = globals
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
      this.idle()
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

  getClosestAgent(agentTypeName) {
    const agents = vue.agentItems[agentTypeName]
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

  idle() {
    this.currentStateName = 'idle'
    this.destination = null

    if (this.spriteMap !== null && this.currentDirection !== 'idle') {
      const spriteSheet = this.spriteMap.sheets['idle']
      this.image.src = spriteSheet.src
      this.frames = {
        ...this.frames,
        max: spriteSheet.numImages,
        columns: spriteSheet.columns,
        rows: spriteSheet.rows,
        hold: spriteSheet.refreshInterval
      }
      this.currentDirection = 'idle'
    }
  }
}
