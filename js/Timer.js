class Timer {
  constructor(currentFrame, timerDuration, stateObject, nextState) {
    this.startFrame = currentFrame
    this.duration = timerDuration
    this.stateObject = stateObject
    this.nextState = nextState
    this.active = true
  }

  check(currentFrame) {
    const timerExpired = currentFrame - (this.startFrame + this.duration) >= 0
    if (timerExpired && this.active) {
      console.log("TIMER FINISHED")
      this.active = false
      this.stateObject.updateState(this.nextState)
    }
  }
}

let timers = []