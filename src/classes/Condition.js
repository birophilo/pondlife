export class Condition {
  constructor(
    agent,
    conditionName,
    property,
    comparison,
    conditionValue
  ) {
    this.agent = agent
    this.property = property
    this.comparison = comparison
    this.conditionType = 'property'
    this.conditionName = conditionName
    this.conditionValue = conditionValue
  }

  evaluate() {
    const agentValue = this.agent.stateData[this.property]
    const evalFunc = COMPARISONS[this.condition]
    const result = evalFunc(agentValue, this.conditionValue)
    return result
  }

  conditionLongformName() {
    return `${this.property} ${this.comparison} ${this.conditionValue}`
  }
}


function isGreaterThan(comparisonValue, refValue) {
  return comparisonValue > refValue
}

function isIdentical(comparisonValue, refValue) {
  return comparisonValue === refValue
}


const COMPARISONS = {
  isGreaterThan: isGreaterThan,
  isIdentical: isIdentical
}


export class PresetCondition {
  // not sure how to incorporate checks like agent.atDestination() yet - this is temporary design
  constructor(
    agent,
    conditionName,
    classMethod,
    comparison,
    conditionValue,
    id
  ) {
    this.id = id
    this.classMethod = classMethod
    this.agent = agent
    this.comparison = comparison
    this.conditionType = 'preset'
    this.conditionName = conditionName
    this.conditionValue = conditionValue
  }

  evaluate() {
    const agentValue = this.agent[this.classMethod]()
    const evalFunc = COMPARISONS[this.comparison]
    const result = evalFunc(agentValue, this.conditionValue)
    return result
  }

  conditionLongformName() {
    return `${this.classMethod} ${this.comparison} ${this.conditionValue}`
  }
}