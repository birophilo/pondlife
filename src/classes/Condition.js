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


export function createConditionObject(
  agent,
  conditionName,
  property,
  comparison,
  conditionValue
) {
  const item = {
    agent: agent,
    property: property,
    comparison: comparison,
    conditionType: 'property',
    conditionName: conditionName,
    conditionValue: conditionValue
  }
  return item
}


export function createPresetConditionObject(
  agent,
  conditionName,
  classMethod,
  comparison,
  conditionValue,
  id
) {
  const item = {
    id: id,
    classMethod: classMethod,
    agent: agent,
    comparison: comparison,
    conditionType: 'preset',
    conditionName: conditionName,
    conditionValue: conditionValue
  }
  return item
}


export class ConditionHandler {

  evaluateCondition(item) {
    var agentValue
    if (item.conditionType === 'preset') {
      const agentHandler = new AgentHandler()
      agentValue = agentHandler[item.classMethod](item.agent)
    } else {
      agentValue = item.agent.stateData[item.property]
    }
    const evalFunc = COMPARISONS[item.comparison]
    const result = evalFunc(agentValue, item.conditionValue)
    return result
  }

  conditionLongformName(item) {
    return `${item.classMethod} ${item.comparison} ${item.conditionValue}`
  }
}