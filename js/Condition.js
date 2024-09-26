class Condition {
  constructor(agent, property, comparison, conditionValue) {
    this.agent = agent
    this.property = property
    this.comparison = comparison
    this.conditionType = 'property'
    this.conditionValue = conditionValue
    this.conditionName = `${this.property} ${this.comparison} ${this.conditionValue}`
    this.editing = false
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
  constructor(agent, classMethod, comparison, conditionValue, id) {
    this.id = id
    this.classMethod = classMethod
    this.agent = agent
    this.comparison = comparison
    this.conditionType = 'preset'
    this.conditionValue = conditionValue
    this.conditionName = `${this.classMethod} ${this.comparison} ${this.conditionValue}`
    this.editing = false
  }
  evaluate() {
    const agentValue = this.agent[this.classMethod]()
    const evalFunc = COMPARISONS[this.condition]
    const result = evalFunc(agentValue, this.conditionValue)
    return result
  }
}