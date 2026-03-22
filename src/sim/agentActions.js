export function setDynamicActionTargetAgents  ({ store, action, agent, agentHandler, lastAction }) {
  /*
  Some target agent/s need to be set dynamically according to criteria that can
  only be determined when the action starts:
  - nearest agent: dynamic
  - specific agent: not dynamic
  - all agents: dynamic (number could change between creating action and starting it)

  Note: this may not be generalisable enough - to re-organise?
  */

  if (action.agentChoiceMethod === 'nearest' && action.destinationType === 'agent') {

    const agentTypeName = action.agentType.name
    // get agents excluding self
    const agentItems = store.agentItems[agentTypeName].filter(ag => ag.id !== agent.id)

    if (agentItems.length === 0) {
      console.log(`No ${agentTypeName} exists - cannot choose nearest.`)
      agentHandler.idle(agent)
      return false
    }

    const targetAgent = agentHandler.getClosestAgent(agent, agentItems)

    action.target = targetAgent
    action.destination = targetAgent

  } else if (action.agentChoiceMethod === 'all') {
    action.target = store.agentItems[action.agentType.name]
  }

  if (action.agentChoiceMethod === 'random' && action.destinationType === 'agent') {

    const agentTypeName = action.agentType.name
    // get agents excluding self
    const agentItems = store.agentItems[agentTypeName].filter(ag => ag.id !== agent.id)

    if (agentItems.length === 0) {
      console.log(`No ${agentTypeName} exists - cannot choose random.`)
      agentHandler.idle(agent)
      return false
    }

    const targetAgent = agentHandler.getRandomAgent(agentItems)
    action.target = targetAgent
    action.destination = targetAgent

  }

  // if action involves property changes, set target for each change based on
  // agentChoiceMethod ('nearest' etc)
  if (action.actionType === 'change') {

    const changeObjs = store.propertyChanges.filter(ch => action.propertyChanges.includes(ch.id))

    for (let change of changeObjs) {
      if (change.agentType !== 'self') {
        if (change.agentChoiceMethod === 'nearest') {
          const agentItems = store.agentItems[change.agentType]
          const targetAgent = agentHandler.getClosestAgent(agent, agentItems)
          change.target = targetAgent
        } else if (change.agentChoiceMethod === 'all') {
          change.target = store.agentItems[change.agentType]
        }
      }
    }
  }

  if (action.actionType === 'interval' && lastAction) {
    action.target = lastAction.target
  }

  if (action.actionType === 'removeAgent') {
    if (action.agentType === 'currentTarget' && lastAction) {
      action.target = lastAction.target
    }

    else if (action.agentType !== 'self') {
      if (action.agentChoiceMethod === 'nearest') {
        const targetAgents = store.agentItems[action.agentType.name]
        const targetAgent = agentHandler.getClosestAgent(agent, targetAgents)
        action.target = targetAgent
      } else if (action.agentChoiceMethod === 'all') {
        action.target = store.agentItems[action.agentType.name]
      }
    }
  }

  return true  // 'ok' used by outer function, circuit breaker if not
}
