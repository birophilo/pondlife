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


const customerData = [{x: 0, y: 0}, {x: 900, y: 400}]
const customers = []

const lemonadeStallData = [{x: 400, y: 200}]
const lemonadeStalls = []

const supplyVanData = [{x: 300, y: 800}]
const supplyVans = []

for (let i = 0; i < customerData.length; i++) {
  customers.push( new Customer({
    position: {x: customerData[i].x, y: customerData[i].y},
    num: i + 1
  }))
}

lemonadeStallData.forEach(stall => {
  lemonadeStalls.push(
    new LemonadeStall({position: stall})
  )
})

supplyVanData.forEach(van => {
  supplyVans.push(
    new SupplyVan({position: van})
  )
})


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

function animate() {
  c.fillStyle = 'grey'
  c.fillRect(0, 0, canvas.width, canvas.height)

  const animationId = requestAnimationFrame(animate)

  // increment()

  lemonadeStalls.forEach(stall => {
    stall.draw()
  })

  let hover = null

  customers.forEach(customer => {
    customer.update()
    const isInArea = pointIsInArea(mouse, customer.collisionArea)
    if (isInArea) {
      hover = true
    }
  })

  canvas.style.cursor = hover ? 'pointer' : 'auto'

  supplyVans.forEach(van => {
    van.update()
  })

  if (false === true) {
    cancelAnimationFrame(animationId)
  }

  document.querySelector('#info').innerHTML = `Customer ${selectedCustomer}. Money: ${10}.`

}

canvas.addEventListener('mousemove', (event) => {
  mouse.x = event.clientX
  mouse.y = event.clientY
})

canvas.addEventListener('click', (event) => {
  console.log(event.x, event.y)

  customers.forEach(customer => {
    const point = {x: event.x, y: event.y}
    const isInArea = pointIsInArea(point, customer.collisionArea)
    if (isInArea) {
      console.log('Customer ' + customer.customerNumber)
      selectedCustomer = customer.customerNumber
    }
  })

})


animate()
