const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1000
canvas.height = 600

c.fillStyle = 'grey'
c.fillRect(0, 0, canvas.width, canvas.height)

const image = new Image()

image.onload = () => {
  animate()
}

image.src = 'img/gameMap.bmp'

let selectedCustomer = null

let globalSpeed = 100

const dayLength = 1000 // frames
let dayNumber = 1

const customerData = [{x: 0, y: 0}, {x: 900, y: 400}]
const customers = []

const lemonadeStallData = [firstStall]
const lemonadeStalls = []

const supplyVanData = [{x: 300, y: 800}]
const supplyVans = []

const agentMenuButtonData = ['customer']
const agentMenuButtons = []

lemonadeStallData.forEach(stall => {
  lemonadeStalls.push(
    new LemonadeStall(stall)
  )
})

supplyVanData.forEach(van => {
  supplyVans.push(
    new SupplyVan({position: van, globalSpeed: globalSpeed})
  )
})

for (let i = 0; i < customerData.length; i++) {
  customers.push( new Customer({
    position: {x: customerData[i].x, y: customerData[i].y},
    num: i + 1,
    globalSpeed: globalSpeed
  }))
}

const itemMenu = new AgentMenu()
let agentPreview = null
let placingAgent = false
let deleteMode = false

agentMenuButtonData.forEach(icon => {
  agentMenuButtons.push(
    new AgentMenuIcon({
      position: {x: itemMenu.position.x + itemMenu.border, y: itemMenu.position.y + itemMenu.border}
    })
  )
})

console.log(agentMenuButtons[0].position)

let deleteButton = new DeleteButton({
  position: {x: itemMenu.position.x + 40 + itemMenu.border * 2, y: itemMenu.position.y + itemMenu.border}
})

console.log(deleteButton.position)


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

let mouse = {x: 0, y: 0}

/* --- ANIMATE --- */

function animate() {
  c.fillStyle = 'grey'
  c.fillRect(0, 0, canvas.width, canvas.height)

  const animationId = requestAnimationFrame(animate)

  if (animationId % 100 === 0) {
      console.log(animationId)
  }

  lemonadeStalls.forEach(stall => {
    stall.draw()
  })

  let hover = null

  customers.forEach(customer => {
    customer.update({globalSpeed: globalSpeed, frameId: animationId})
    const isInArea = pointIsInArea(mouse, customer.collisionArea)
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

  supplyVans.forEach(van => {
    van.update({globalSpeed: globalSpeed, frameId: animationId})
  })

  if (false === true) {
    cancelAnimationFrame(animationId)
  }
  if (animationId % dayLength === 0) {
    endDay()
  }

  if (selectedCustomer !== null) {
    document.querySelector('#info').innerHTML = `Customer ${selectedCustomer.customerNumber}. Money: ${selectedCustomer.money}.`
  }

  document.querySelector('#day-number').innerHTML = dayNumber

  timers.forEach(timer => timer.check(animationId))

}

function endDay() {
  dayNumber++
}


canvas.addEventListener('mousemove', (event) => {
  mouse.x = event.clientX
  mouse.y = event.clientY
})

/* --- CLICK ACTIONS --- */

canvas.addEventListener('click', (event) => {
  console.log(event.x, event.y)
  const point = {x: event.x, y: event.y}

  if (placingAgent) {
    placingAgent = false
    customerNumber = customers.length + 1

    customers.push( new Customer({
      position: {x: mouse.x - 40 / 2, y: mouse.y - 40 / 2},
      num: customerNumber,
      globalSpeed: globalSpeed
    }))

    agentPreview = null
  }

  customers.forEach((customer, i) => {
    const isInArea = pointIsInArea(point, customer.collisionArea)
    if (isInArea && deleteMode === true) {
      customers.splice(i, 1)
      deleteMode = false
    }
    if (isInArea) {
      console.log('Customer ' + customer.customerNumber)
      selectedCustomer = customer
    }
  })

  agentMenuButtons.forEach(icon => {
    const isInArea = pointIsInArea(point, icon.area)
    if (isInArea && !agentPreview) {
      agentPreview = new AgentPreview()
      placingAgent = true
    }
  })

  const isInArea = pointIsInArea(point, deleteButton.area)
  if (isInArea) {
    deleteMode = !deleteMode
  }

})

animate()

var slider = document.getElementById('sim-speed-slider')
var sliderValue = document.getElementById('sim-speed-value')

sliderValue.innerHTML = slider.value / 100

slider.oninput = function() {
  globalSpeed = this.value
  sliderValue.innerHTML = this.value / 100
}
