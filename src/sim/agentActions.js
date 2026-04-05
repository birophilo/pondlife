import UTILITY_FUNCS from '@/UTILITY_FUNCS.js'

export function setDynamicActionTargetAgents ({ world, action, agent, agentHandler, lastAction }) {
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
    const agentItems = world.agentItems[agentTypeName].filter(ag => ag.id !== agent.id)

    if (agentItems.length === 0) {
      console.log(`No ${agentTypeName} exists - cannot choose nearest.`)
      agentHandler.idle(agent)
      return false
    }

    const targetAgent = agentHandler.getClosestAgent(agent, agentItems)

    action.target = targetAgent
    action.destination = targetAgent

  } else if (action.agentChoiceMethod === 'all') {
    action.target = world.agentItems[action.agentType.name]
  }

  if (action.agentChoiceMethod === 'random' && action.destinationType === 'agent') {

    const agentTypeName = action.agentType.name
    // get agents excluding self
    const agentItems = world.agentItems[agentTypeName].filter(ag => ag.id !== agent.id)

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

    const changeObjs = world.propertyChanges.filter(ch => action.propertyChanges.includes(ch.id))

    for (let change of changeObjs) {
      if (change.agentType !== 'self') {
        if (change.agentChoiceMethod === 'nearest') {
          const agentItems = world.agentItems[change.agentType]
          const targetAgent = agentHandler.getClosestAgent(agent, agentItems)
          change.target = targetAgent
        } else if (change.agentChoiceMethod === 'all') {
          change.target = world.agentItems[change.agentType]
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
        const targetAgents = world.agentItems[action.agentType.name]
        const targetAgent = agentHandler.getClosestAgent(agent, targetAgents)
        action.target = targetAgent
      } else if (action.agentChoiceMethod === 'all') {
        action.target = world.agentItems[action.agentType.name]
      }
    }
  }

  return true  // 'ok' used by outer function, circuit breaker if not
}

/**
 * Check current action transitions; if a condition passes, clone the next action.
 * Otherwise clear sequence / current action when nothing applies.
 */
export function setNextAction ({
  agent,
  world,
  conditionHandler,
  actionHandler,
  agentHandler
}) {
  // check for state transitions and set next action if complete
  for (let transition of agent.currentAction.transitions) {

    const condition = world.conditions.find(cond => cond.id === transition.condition)
    const result = conditionHandler.evaluateCondition(condition, agent, world)

    if (result === true) {
      const nextAction = world.actions.find(action => action.id === transition.nextAction)
      const ok = setDynamicActionTargetAgents({
        world,
        action: nextAction,
        agent,
        agentHandler,
        lastAction: agent.currentAction
      })
      if (ok) {
        agent.currentAction = actionHandler.clone(nextAction, agent)
      }
      return
    }
  }

  // if using an actionSequence and this was last action in sequence, set to null
  if (agent.currentActionSequence !== null && agent.currentActionSequence !== undefined) {
    const arrLength = agent.currentActionSequence.actions.length
    const finalSequenceActionName = agent.currentActionSequence.actions[arrLength - 1]
    const action = world.actions.find(a => a.actionName === finalSequenceActionName)
    if (action.actionName === agent.currentAction.actionName) {
      agent.currentActionSequence = null
    }
  }

  // no further action if no transitions
  agent.currentAction = null
  agent.currentActionName = null
}


export function chooseNextActionByUtility ({ world, agent }) {
  /* Returns the ID of the Action or ActionSequence with the highest utility */

  // utility functions currently specific to agent type
  const utilityFunctionsForAgent = world.agentUtilityFunctions.filter(uf => uf.agentType === agent.agentType.name)

  var highestScore = 0
  // var highestScoreActionId = null
  var selected = null

  for (let option of utilityFunctionsForAgent) {
    var score = calculateActionUtility(agent, option.property, UTILITY_FUNCS[option.func])

    if (score > highestScore) {
      highestScore = score
      // highestScoreActionId = option.actionId
      selected = {...option}
    }
  }

  return [selected.actionId, selected.actionObjectType]
}

function calculateActionUtility(agent, property, func) {
  const propValue = agent.stateData[property]
  const utilityScore = func(propValue)
  return utilityScore
}