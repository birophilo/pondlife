class Condition {
  constructor(agent, property, condition, conditionValue) {
    this.agent = agent
    this.property = property
    this.condition = condition
    this.conditionValue = conditionValue
    this.name = `${this.property} ${this.condition} ${this.conditionValue}`
  }

  evaluate() {
    const agentValue = this.agent.stateData[this.property]
    const evalFunc = COMPARISONS[this.condition]
    const result = evalFunc(agentValue, this.conditionValue)
    return result
  }
}


function isGreaterThan(comparisonValue, refValue) {
  return comparisonValue > refValue
}

function isIdentical(comparisonValue, refValue) {
  return comparisonValue === refValue
}


COMPARISONS = {
  isGreaterThan: isGreaterThan,
  isIdentical: isIdentical
}


class PresetCondition {
  // not sure how to incorporate checks like agent.atDestination() yet - this is temporary design
  constructor(agent, classMethod, condition, conditionValue) {
    this.classMethod = classMethod
    this.agent = agent
    this.condition = condition
    this.conditionValue = conditionValue
    this.name = `${this.classMethod} ${this.condition} ${this.conditionValue}`
  }
  evaluate() {
    const agentValue = this.agent[this.classMethod]()
    const evalFunc = COMPARISONS[this.condition]
    const result = evalFunc(agentValue, this.conditionValue)
    return result
  }
}