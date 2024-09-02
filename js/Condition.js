class Condition {
  constructor(agent, property, condition, value) {
    this.agent = agent
    this.property = property
    this.condition = condition
    this.value = value
  }

  evaluate() {
    const agentValue = this.agent.stateData[this.property]
    console.log(agentValue)
    const evalFunc = COMPARISONS[this.condition]
    return evalFunc(agentValue, this.value)
  }
}


function isGreaterThan(comparisonValue, refValue) {
  return comparisonValue > refValue
}


COMPARISONS = {
  isGreaterThan: isGreaterThan
}