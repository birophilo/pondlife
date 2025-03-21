export function get8WayDirection(xVelocity, yVelocity) {
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


export function pointIsInArea(point, area) {
  return (
    point.x >= area.x &&
    point.x <= area.x + area.width &&
    point.y >= area.y &&
    point.y <= area.y + area.height
  )
}


export function rectanglesOverlap(rect1, rect2) {

  const r1 = {x1: rect1.x, x2: rect1.x + rect1.width, y1: rect1.y, y2: rect1.y + rect1.height}
  const r2 = {x1: rect2.x, x2: rect2.x + rect2.width, y1: rect2.y, y2: rect2.y + rect2.height}

  return !(
    r1.x2 < r2.x1 ||
    r1.x1 > r2.x2 ||
    r1.y2 < r2.y1 ||
    r1.y1 > r2.y2
  )
}


const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"


export function generateFakeIdString () {
  /*
  generate random 10-character dummy MongoDB ID string when need to generate an ID
  but not save the object to a database.
  */
  const randomCharArray =  [...Array(10)].map(() =>
    CHARS.charAt(
      Math.floor(Math.random() * CHARS.length))
    )
  return randomCharArray.join("")
}