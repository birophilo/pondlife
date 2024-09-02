class Timer {
  constructor(
    currentFrame,
    timerDuration,
    stateObject,
    nextState,
  ) {

    this.startFrame = currentFrame
    this.duration = timerDuration
    this.stateObject = stateObject
    this.nextState = nextState
    this.active = true

  }

  check(currentFrame) {
    const timerExpired = currentFrame - (this.startFrame + this.duration) >= 0
    if (timerExpired && this.active) {
      this.active = false
      this.stateObject.updateState(this.nextState)
    }
  }
}


class TimerActionList {
  constructor(
    currentFrame,
    timerDuration,
    stateObject,
    actionObject,
  ) {

    this.startFrame = currentFrame
    this.duration = timerDuration
    this.stateObject = stateObject
    this.actionObject = actionObject
    this.active = true

  }

  check(currentFrame) {
    const timerExpired = currentFrame - (this.startFrame + this.duration) >= 0
    if (timerExpired && this.active) {
      this.active = false
      this.actionObject.isComplete = true
    }
  }
}


let timers = []