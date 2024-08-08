class Timer {
  constructor(currentFrame, timerDuration, stateObject, nextState, data) {
    this.startFrame = currentFrame
    this.duration = timerDuration
    this.stateObject = stateObject
    this.nextState = nextState
    this.active = true
    this.data = data
  }

  check(currentFrame) {
    const timerExpired = currentFrame - (this.startFrame + this.duration) >= 0
    if (timerExpired && this.active) {
      console.log("TIMER FINISHED")
      this.active = false
      console.log(this.data)
      this.stateObject.updateState(this.nextState, this.data)
    }
  }
}

let timers = []