const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const backgroundColor = 'rgb(200, 200, 200)'

canvas.width = 1000
canvas.height = 600

c.fillStyle = backgroundColor
c.fillRect(0, 0, canvas.width, canvas.height)

const AGENTS = {
  customer: Customer,
  lemonadeStall: LemonadeStall,
  supplyVan: SupplyVan
}

let createdActions = []
let createdConditions = []
let createdPresetConditions = []

let globalSpeed = GlobalSettings.globalSpeed
let dayNumber = 1
const dayLength = 1000 // frames

// const customerData = [{x: 0, y: 0}, {x: 900, y: 400}]
const customerData = [{x: 900, y: 400}]
const lemonadeStallData = [firstStall, secondStall]
// const supplyVanData = [{x: 800, y: 800}]
const supplyVanData = []
const agentMenuButtonData = [
  {name: 'customer', rgb: [255, 0, 0]},
  {name: 'lemonadeStall', rgb: [0, 0, 255]},
  {name: 'supplyVan', rgb: [255, 255, 0]}
]
const agentMenuButtons = []

const customers = []
const lemonadeStalls = []
const supplyVans = []

let selectedAgent = null
let agentPreview = null
let placingAgent = false
let deleteMode = false

let mouse = {x: 0, y: 0}

let AGENT_CONFIGS = {
  customer: {
    agentClass: Customer,
    agentArray: customers,
    config: {
      width: 40,
      height: 40,
      offset: {x: 96, y: 46},
      scale: 0.7,
    }
  },
  lemonadeStall: {
    agentClass: LemonadeStall,
    agentArray: lemonadeStalls,
    config: {
      width: 130,
      height: 100,
      offset: {x: 0, y: 0},
      scale: 1
    }
  },
  supplyVan: {
    agentClass: SupplyVan,
    agentArray: supplyVans,
    config: {
      width: 50,
      height: 50,
      offset: {x: 2, y: 0},
      scale: 2.5
    }
  }
}

function addAgent(agentClassName, agentClass, agentArray) {
  const num = agentArray.length + 1
  agentArray.push( new agentClass({
    position: {
      x: mouse.x - AGENT_CONFIGS[agentClassName].config.width / 2,
      y: mouse.y - AGENT_CONFIGS[agentClassName].config.height / 2
    },
    num: num,
    globals: GlobalSettings,
    offset: AGENT_CONFIGS[agentClassName].config.offset,
    scale: AGENT_CONFIGS[agentClassName].config.scale,
    config: AGENT_CONFIGS[agentClassName].config
  }))
}

function selectOrDeleteAgent(agentClassName, point) {
  let agentArray = AGENT_CONFIGS[agentClassName].agentArray
  agentArray.forEach((agent, i) => {
    const isInArea = pointIsInArea(point, agent.collisionArea)

    // SELECT AGENT
    if (isInArea) {
      selectedAgent = agent
    }
    // DELETE AGENT (in delete mode)
    if (isInArea && deleteMode === true) {
      agentArray.splice(i, 1)
      deleteMode = false
    }
  })
}

function changeAgentStateFromButton(agent, actionClass, args={}) {
  agent.actionList.push(new actionClass(agent, args))
}

function updateHtml() {

  if (selectedAgent !== null) {
    const info = `${selectedAgent.name} ${selectedAgent.num}.<br/>` +
    `Money: ${selectedAgent.stateData.money}.<br/>` +
    `${selectedAgent.currentStateName}`
    document.querySelector('#info').innerHTML = info

    const actionListNames = selectedAgent.actionList.map(action => action.stateName)
    document.querySelector('#action-queue-list').innerHTML = actionListNames.join('<br/>')
    let actionButtonList = document.getElementById('action-button-list')

    if (actionButtonList.children.length !== createdActions.length) {

      actionButtonList.innerHTML = ''

      for (i = 0; i < createdActions.length; i++) {
        const button = document.createElement('button')
        button.innerText = createdActions[i].actionName
        const j = Number(i)  // closure
        button.addEventListener('click', () => {
          selectedAgent.actionList.push(createdActions[j].clone(
            selectedAgent,
            {destination: selectedAgent.home, cloned: true}
          ))
        })
        actionButtonList.appendChild(button)
      }
    }

    let createdConditionList = document.getElementById('created-condition-list')

    if (createdConditionList.children.length !== createdConditions.length) {

      createdConditionList.innerHTML = ''

      for (i = 0; i < createdConditions.length; i++) {
        const div = document.createElement('div')
        div.innerText = createdConditions[i].name
        createdConditionList.appendChild(div)
      }
    }

    let transitionCheckActionMenu = document.getElementById('form-transition-action')

    if (transitionCheckActionMenu.children.length !== createdActions.length) {

      transitionCheckActionMenu.innerHTML = ''

      for (i = 0; i < createdActions.length; i++) {
        const option = document.createElement('option')
        option.innerText = createdActions[i].actionName
        option.value = createdActions[i].id
        transitionCheckActionMenu.appendChild(option)
      }
    }

    let transitionCheckConditionMenu = document.getElementById('form-transition-condition')

    if (transitionCheckConditionMenu.children.length !== createdPresetConditions.length) {

      transitionCheckConditionMenu.innerHTML = ''

      for (i = 0; i < createdPresetConditions.length; i++) {
        const option = document.createElement('option')
        option.innerText = createdPresetConditions[i].name
        option.value = createdPresetConditions[i].id
        transitionCheckConditionMenu.appendChild(option)
      }
    }

    let transitionCheckNextActionMenu = document.getElementById('form-transition-next-action')

    if (transitionCheckNextActionMenu.children.length !== createdActions.length) {

      transitionCheckNextActionMenu.innerHTML = ''

      for (i = 0; i < createdActions.length; i++) {
        const option = document.createElement('option')
        option.innerText = createdActions[i].actionName
        option.value = createdActions[i].id
        transitionCheckNextActionMenu.appendChild(option)
      }
    }


  }

  document.querySelector('#day-number').innerHTML = dayNumber

}


function endDay() {
  dayNumber++
}

function pointIsInArea(point = {x, y}, area = {x, y, width, height}) {
  if (
    point.x >= area.x &&
    point.x <= area.x + area.width &&
    point.y >= area.y &&
    point.y <= area.y + area.height
  ) {
    document.body.style.cursor = 'pointer'
    return true
  } else {
    return false
  }
}


lemonadeStallData.forEach(stall => {
  lemonadeStalls.push(
    new LemonadeStall(stall)
  )
})

supplyVanData.forEach(van => {
  supplyVans.push(
    new SupplyVan({
      position: van,
      globals: GlobalSettings,
      offset: AGENT_CONFIGS.supplyVan.config.offset,
      scale: AGENT_CONFIGS.supplyVan.config.scale
    })
  )
})

customerData.forEach((cust, i) => {
  customers.push( new Customer({
    position: {x: cust.x, y: cust.y},
    num: i + 1,
    globals: GlobalSettings,
    offset: AGENT_CONFIGS.customer.config.offset,
    scale: AGENT_CONFIGS.customer.config.scale
  }))
})

const itemMenu = new AgentMenu()

agentMenuButtonData.forEach((icon, i) => {
  agentMenuButtons.push(
    new AgentMenuIcon({
      menu: itemMenu,
      i: i,
      name: icon.name,
      agent: AGENT_CONFIGS[icon.name].agentClass,
      config: AGENT_CONFIGS[icon.name].config
    })
  )
})

let deleteButton = new DeleteButton({
  menu: itemMenu,
  i: agentMenuButtons.length
})

/* --- ANIMATE --- */

function animate() {
  c.fillStyle = backgroundColor
  c.fillRect(0, 0, canvas.width, canvas.height)

  const animationId = requestAnimationFrame(animate)

  GlobalSettings.animationFrameId = animationId

  lemonadeStalls.forEach(stall => stall.draw())

  let hover = null

  customers.forEach(customer => {
    customer.update({
      globals: GlobalSettings,
      frameId: animationId,
      stalls: lemonadeStalls,
      stall: firstStall
    })
    const isInArea = pointIsInArea(mouse, customer.collisionArea)
    if (isInArea) {
      hover = true
    }
  })

  lemonadeStalls.forEach(stall => {
    const isInArea = pointIsInArea(mouse, stall.collisionArea)
    if (isInArea) {
      hover = true
    }
  })

  supplyVans.forEach(van => {
    van.update({
      globals: GlobalSettings,
      frameId: animationId,
      stalls: lemonadeStalls,
      stall: firstStall
    })
    const isInArea = pointIsInArea(mouse, van.collisionArea)
    if (isInArea) {
      hover = true
    }
  })
  
  itemMenu.update(agentMenuButtons.length + 1)

  agentMenuButtons.forEach((button, i) => {
    button.update(i)
    const isInArea = pointIsInArea(mouse, button.area)
    if (isInArea) {
      hover = true
    }
  })

  if (agentPreview) agentPreview.update(mouse)

  if (pointIsInArea(mouse, deleteButton.area)) {
    hover = true
  }

  deleteButton.update(agentMenuButtons.length, deleteMode)

  canvas.style.cursor = hover ? 'pointer' : 'auto'

  if (animationId % dayLength === 0) {
    endDay()
  }

  updateHtml()

  timers.forEach((timer, i) => {
    timer.check(animationId)
    if (timer.active === false) {
      timers.splice(i, 1)
    }
  })

}

animate()

/* --- CLICK ACTIONS / EVENT LISTENERS --- */

canvas.addEventListener('mousemove', (event) => {
  mouse.x = event.clientX
  mouse.y = event.clientY
})

canvas.addEventListener('click', (event) => {
  const point = {x: event.x, y: event.y}

  // PLACE NEW AGENT ON
  if (placingAgent) {
    const isInMenuArea = pointIsInArea(point, itemMenu.area)
    if (isInMenuArea === false) {
      const agentClassName = agentPreview.agent.agentName()
      addAgent(
        agentClassName,
        AGENT_CONFIGS[agentClassName].agentClass,
        AGENT_CONFIGS[agentClassName].agentArray
      )
      placingAgent = false
      agentPreview = null
    }
  }

  const agentNameList = Object.keys(AGENT_CONFIGS)

  agentNameList.forEach(agentName => {
    selectOrDeleteAgent(agentName, point)
  })

  // SELECT AGENT BUTTON TO CREATE CURSOR PREVIEW (to place new agent on board)
  for (let i = 0; i < agentMenuButtons.length; i++) {

    const isInArea = pointIsInArea(point, agentMenuButtons[i].area)

    if (isInArea && !agentPreview) {
      agentPreview = new AgentPreview({
        agent: AGENTS[agentMenuButtons[i].name],
        rgb: agentMenuButtons[i].rgb,
        config: AGENT_CONFIGS[agentMenuButtons[i].name].config
      })

      placingAgent = true
      break

    } else if (isInArea && agentPreview) {
      // if have active agent preview (tracking cursor), clicking on the agent menu again cancels the selection
      placingAgent = false
      agentPreview = null
    }
  }

  // TOGGLE DELETE MODE
  const isInArea = pointIsInArea(point, deleteButton.area)
  if (isInArea) {
    deleteMode = !deleteMode
  }

})

document.addEventListener('keydown', (e) => {
  if (e.code === 'Escape' && placingAgent === true) {
    placingAgent = false
    agentPreview = null
  }
})


/* --- UPDATE HTML --- */

var slider = document.getElementById('sim-speed-slider')
var sliderValue = document.getElementById('sim-speed-value')

sliderValue.innerHTML = slider.value / 100

slider.oninput = function() {
  GlobalSettings.globalSpeed = this.value
  sliderValue.innerHTML = this.value / 100
}

function createAgent() {
  console.log('creating agent')
  const newAgentName = document.getElementById('form-create-agent-name')
  const newAgentWidth = document.getElementById('form-create-agent-width')
  const newAgentHeight = document.getElementById('form-create-agent-height')
  agentData = AGENT_CONFIGS[newAgentName.value]
  let config = agentData.config
  config.width = Number(newAgentWidth.value)
  config.height = Number(newAgentHeight.value)

  let newIcon = new AgentMenuIcon({
    menu: itemMenu,
    i: agentMenuButtons.length + 1,
    name: newAgentName.value,
    agent: agentData.agentClass,
    config: config
  })
  agentMenuButtons.push(newIcon)
}


function createGoToAction() {
  console.log('creating action2')
  const newActionName = document.getElementById('form-create-action-name').value
  const newActionType = document.getElementById('form-create-action-type').value
  const newActionDestination = document.getElementById('form-create-action-destination').value

  const agentChoiceValue = document.agentRadioSelect.agentChoice.value

  let args = {
    id: createdActions.length + 1,
    actionName: newActionName,
    type: newActionType,  // 'goTo'
    agentType: newActionDestination,
    agentChoice: agentChoiceValue
  }

  if (newActionDestination === 'home') {
    args.destination = selectedAgent.home
  } else {
    args.agentType = newActionDestination
    args.agentChoice = agentChoiceValue
  }

  let newAction = new ActionGoTo(null, args)

  createdActions.push(newAction)

  updateHtml()
}

function createCondition() {
  console.log('creating condition')
  const newConditionProperty = document.getElementById('form-create-condition-property').value
  const newConditionComparison = document.getElementById('form-create-condition-comparison').value
  const newConditionThreshold = document.getElementById('form-create-condition-threshold').value

  let newCondition = new Condition(
    selectedAgent,
    newConditionProperty,
    newConditionComparison,
    Number(newConditionThreshold),
    createdConditions.length + 1  // id
  )

  createdConditions.push(newCondition)

  // hard coding temporarily
  createdActions[0].conditions.push(newCondition)

  updateHtml()
}

function createPresetCondition() {
  console.log('creating preset condition')
  const newConditionMethod = document.getElementById('form-create-preset-condition-method').value
  const newConditionComparison = document.getElementById('form-create-preset-condition-comparison').value
  const newConditionThreshold = document.getElementById('form-create-preset-condition-value').value

  let newCondition = new PresetCondition(
    selectedAgent,
    newConditionMethod,
    newConditionComparison,
    true,  // hard-coded for now,
    createdConditions.length + 1  // id
  )

  createdPresetConditions.push(newCondition)

  updateHtml()
}

function setAgentProperty() {
  console.log('adding agent property')
  const newAgentProperty = document.getElementById('form-add-agent-property').value
  const newAgentPropertyValue = Number(document.getElementById('form-add-agent-property-value').value)

  selectedAgent.setProperty(newAgentProperty, newAgentPropertyValue)

}

function createTransitionCheck() {

  const transitionCheckActionId = document.getElementById('form-transition-action').value
  const transitionCheckConditionId = document.getElementById('form-transition-condition').value
  const transitionCheckNextActionId = document.getElementById('form-transition-next-action').value

  console.log(transitionCheckActionId, transitionCheckConditionId, transitionCheckNextActionId)

  const action = createdActions.filter(action => action.id === Number(transitionCheckActionId))[0]
  const condition = createdPresetConditions.filter(cond => cond.id === Number(transitionCheckConditionId))[0]
  const nextAction = createdActions.filter(action => action.id === Number(transitionCheckNextActionId))[0]

  console.log(action, condition, nextAction)

  action.transitionChecks.push({
    condition: condition,
    nextAction: nextAction
  })
}

function createPropertyChangeAction() {
  const actionName = document.getElementById('action-change-property-action-name').value
  const agentType = document.getElementById('action-change-property-agent-type').value
  const propertyName = document.getElementById('action-change-property-name').value
  const propertyChangeType = document.getElementById('action-change-property-change').value
  const propertyChangeValue = Number(document.getElementById('action-change-property-value').value)

  const change1 = new PropertyChange(
    null,
    propertyName,
    propertyChangeType,
    propertyChangeValue
  )

  const propertyChangesAction = new ActionPropertyChanges(
    null,
    {
      id: createdActions.length + 1,
      actionName: actionName,
      propertyChanges: [change1]
    },
    [],
    [],
    [change1]
  )

  createdActions.push(propertyChangesAction)
}