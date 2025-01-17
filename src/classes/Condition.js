import { AgentHandler } from "./Agent"


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


export class ConditionHandler {

  evaluateCondition(item, agent) {
    var agentValue
    if (item.conditionType === 'preset') {
      const agentHandler = new AgentHandler()
      agentValue = agentHandler[item.classMethod](agent)
    } else {
      agentValue = agent.stateData[item.property]
    }
    const evalFunc = COMPARISONS[item.comparison]
    const result = evalFunc(agentValue, item.conditionValue)
    return result
  }

  conditionLongformName(item) {
    return `${item.classMethod} ${item.comparison} ${item.conditionValue}`
  }
}