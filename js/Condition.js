class Condition {
  constructor(agent, property, condition, value) {
    this.agent = agent
    this.property = property
    this.condition = condition
    this.value = value
    this.name = `${this.property} ${this.condition} ${this.value}`
  }

  evaluate() {
    const agentValue = this.agent.stateData[this.property]
    const evalFunc = COMPARISONS[this.condition]
    const result = evalFunc(agentValue, this.value)
    return result
  }
}


function isGreaterThan(comparisonValue, refValue) {
  return comparisonValue > refValue
}


COMPARISONS = {
  isGreaterThan: isGreaterThan
}