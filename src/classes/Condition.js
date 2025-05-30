import { AgentHandler } from "./Agent"


function isGreaterThan(comparisonValue, refValue) {
  return comparisonValue > refValue
}

function isLessThan(comparisonValue, refValue) {
  return comparisonValue < refValue
}


function isIdentical(comparisonValue, refValue) {
  return comparisonValue === refValue
}


const COMPARISONS = {
  isGreaterThan: isGreaterThan,
  isLessThan: isLessThan,
  isIdentical: isIdentical
}


export class ConditionHandler {

  evaluateCondition(item, agent, store) {
    var agentValue
    if (item.conditionType === 'preset') {
      const agentHandler = new AgentHandler()
      agentValue = agentHandler[item.classMethod](agent)

    } else if (item.conditionType === 'property') {
      agentValue = agent.stateData[item.property]
    } else if (item.conditionType === 'vicinity') {
      // get number of agents of given property value in vicinity
      // eslint-disable-next-line
      const [agentTypeName, _] = Object.entries(store.agentTypes).find(([name, obj]) => obj.id === item.agentType)
      const agentIdsInVicinity = agent.knowledge.vicinity.agents

      // count agents of given type in vicinity
      let agentsInVicinity = store.agentItems[agentTypeName].filter(agent =>
        agentIdsInVicinity.includes(agent.id)
      )

      // if property and values specified for condition, filter only matching agents
      if (item.property) {
        agentsInVicinity = agentsInVicinity.filter(agent =>
          // note: this only works with strings - need to broaden
          agent.stateData[item.property] === item.propertyValue
        )
      }

      agentValue = agentsInVicinity.length
    }

    const evalFunc = COMPARISONS[item.comparison]
    const result = evalFunc(agentValue, item.conditionValue)
    return result
  }

  conditionLongformName(item) {
    return `${item.classMethod} ${item.comparison} ${item.conditionValue}`
  }
}