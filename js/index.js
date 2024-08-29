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

let globalSpeed = GlobalSettings.globalSpeed
let dayNumber = 1
const dayLength = 1000 // frames

const customerData = [{x: 0, y: 0}, {x: 900, y: 400}]
const lemonadeStallData = [firstStall]
const supplyVanData = [{x: 800, y: 800}]
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

function myMsg(msg) {
  console.log(`hellooo ${msg}`)
}

function updateHtml() {
  if (selectedAgent !== null) {
    const info = `${selectedAgent.name} ${selectedAgent.num}.<br/>` +
    `Money: ${selectedAgent.money}.<br/` +
    `${selectedAgent.state.name}`
    document.querySelector('#info').innerHTML = info

    document.querySelector('#change-state-button').onclick = () => myMsg(selectedAgent.num)
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
  console.log(stall)
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
    console.log(agentPreview)
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
  console.log(newAgentName.value)
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