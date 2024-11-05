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
  if (
    point.x >= area.x &&
    point.x <= area.x + area.width &&
    point.y >= area.y &&
    point.y <= area.y + area.height
  ) {
    return true
  } else {
    return false
  }
}