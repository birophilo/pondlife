const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const backgroundColor = 'rgb(200, 200, 200)'

canvas.width = 1000
canvas.height = 600

c.fillStyle = backgroundColor
c.fillRect(0, 0, canvas.width, canvas.height)

const image = new Image()

image.onload = () => {
  animate()
}

const AGENTS = {
  customer: Customer,
  lemonadeStall: LemonadeStall,
  supplyVan: SupplyVan
}

let globalSpeed = 100
const dayLength = 1000 // frames
let dayNumber = 1
let selectedAgent = null
let agentPreview = null
let placingAgent = false
let deleteMode = false

let mouse = {x: 0, y: 0}

const customerData = [{x: 0, y: 0}, {x: 900, y: 400}]
const supplyVanData = [{x: 800, y: 800}]
const lemonadeStallData = [firstStall]

const customers = []
const lemonadeStalls = []
const supplyVans = []

let AGENT_INIT_CONFIGS = {
  customer: {
    agentClass: Customer,
    agentArray: customers,
    offset: {x: 96, y: 46},
    scale: 0.7,
  },
  lemonadeStall: {
    agentClass: LemonadeStall,
    agentArray: lemonadeStalls,
    offset: {x: 0, y: 0},
    scale: 1
  },
  supplyVan: {
    agentClass: SupplyVan,
    agentArray: supplyVans,
    offset: {x: 2, y: 0},
    scale: 2.5
  }
}

const agentMenuButtonData = [
  {name: 'customer', rgb: [255, 0, 0]},
  {name: 'lemonadeStall', rgb: [0, 0, 255]},
  {name: 'supplyVan', rgb: [255, 255, 0]}
]

const agentMenuButtons = []

lemonadeStallData.forEach(stall => {
  lemonadeStalls.push(
    new LemonadeStall(stall)
  )
})

supplyVanData.forEach(van => {
  supplyVans.push(
    new SupplyVan({
      position: van,
      globalSpeed: globalSpeed,
      offset: {x: 2, y: 0},
      scale: 2.5
    })
  )
})

for (let i = 0; i < customerData.length; i++) {
  customers.push( new Customer({
    position: {x: customerData[i].x, y: customerData[i].y},
    num: i + 1,
    globalSpeed: globalSpeed,
    offset: {x: 98, y: 46},
    scale: 0.7
  }))
}

const itemMenu = new AgentMenu()


agentMenuButtonData.forEach((icon, i) => {
  agentMenuButtons.push(
    new AgentMenuIcon({
      menu: itemMenu,
      i: i,
      name: icon.name,
      rgb: icon.rgb
    })
  )
})


let deleteButton = new DeleteButton({ menu: itemMenu, i: agentMenuButtons.length })


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

function updateHtml() {
  if (selectedAgent !== null) {
    const info = `${selectedAgent.name} ${selectedAgent.num}. Money: ${selectedAgent.money}.`
    document.querySelector('#info').innerHTML = info
  }

  document.querySelector('#day-number').innerHTML = dayNumber
}

function endDay() {
  dayNumber++
}

function addAgent(agentClassName, agentClass, agentArray) {
  const num = agentArray.length + 1
  agentArray.push( new agentClass({
    position: {x: mouse.x - 20, y: mouse.y - 20},
    num: num,
    globalSpeed: globalSpeed,
    offset: AGENT_INIT_CONFIGS[agentClassName].offset,
    scale: AGENT_INIT_CONFIGS[agentClassName].scale
  }))
}

function selectOrDeleteAgent(agentClassName, point) {
  let agentArray = AGENT_INIT_CONFIGS[agentClassName].agentArray
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

/* --- ANIMATE --- */

function animate() {
  c.fillStyle = backgroundColor
  c.fillRect(0, 0, canvas.width, canvas.height)

  const animationId = requestAnimationFrame(animate)

  lemonadeStalls.forEach(stall => {
    stall.draw()
  })

  let hover = null

  customers.forEach(customer => {
    customer.update({
      globalSpeed: globalSpeed,
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
      globalSpeed: globalSpeed,
      frameId: animationId,
      stalls: lemonadeStalls,
      stall: firstStall
    })
    const isInArea = pointIsInArea(mouse, van.collisionArea)
    if (isInArea) {
      hover = true
    }
  })
  
  itemMenu.draw()

  agentMenuButtons.forEach(button => {
    const isInArea = pointIsInArea(mouse, button.area)
    if (isInArea) {
      hover = true
    }
    button.draw()
  })

  if (agentPreview) agentPreview.update(mouse)

  if (pointIsInArea(mouse, deleteButton.area)) {
    hover = true
  }

  deleteButton.draw(deleteMode)

  canvas.style.cursor = hover ? 'pointer' : 'auto'

  if (animationId % dayLength === 0) {
    endDay()
  }

  updateHtml()

  timers.forEach(timer => timer.check(animationId))

}

canvas.addEventListener('mousemove', (event) => {
  mouse.x = event.clientX
  mouse.y = event.clientY
})

/* --- CLICK ACTIONS --- */

canvas.addEventListener('click', (event) => {
  const point = {x: event.x, y: event.y}

  // PLACE NEW AGENT ON
  if (placingAgent) {
    placingAgent = false

    const agentClassName = agentPreview.agent.agentName()

    addAgent(
      agentClassName,
      AGENT_INIT_CONFIGS[agentClassName].agentClass,
      AGENT_INIT_CONFIGS[agentClassName].agentArray
    )

    agentPreview = null
  }

  const agentNameList = Object.keys(AGENT_INIT_CONFIGS)

  agentNameList.forEach(agentName => {
    selectOrDeleteAgent(agentName, point)
  })

  // SELECT AGENT BUTTON TO CREATE CURSOR PREVIEW (to place new agent on board)
  agentMenuButtons.forEach(icon => {
    const isInArea = pointIsInArea(point, icon.area)

    if (isInArea && !agentPreview) {
      agentPreview = new AgentPreview({
        agent: AGENTS[icon.name],
        rgb: icon.rgb
      })
      placingAgent = true
    }
  })

  // TOGGLE DELETE MODE
  const isInArea = pointIsInArea(point, deleteButton.area)
  if (isInArea) {
    deleteMode = !deleteMode
  }

})

animate()

/* --- UPDATE HTML ELEMENTS --- */

var slider = document.getElementById('sim-speed-slider')
var sliderValue = document.getElementById('sim-speed-value')

sliderValue.innerHTML = slider.value / 100

slider.oninput = function() {
  globalSpeed = this.value
  sliderValue.innerHTML = this.value / 100
}

function createAgent() {
  console.log('creating agent')
}