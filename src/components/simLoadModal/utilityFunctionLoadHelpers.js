/**
 * Display label for utility function load modal action column.
 */
export function actionLabelForUtilityFunction (utilityFunction, actions, actionSequences) {
  const id = utilityFunction?.actionId
  if (!id) return ''

  if (utilityFunction.actionObjectType === 'actionSequence') {
    const seq = actionSequences.find((s) => s.id === id)
    return seq?.name ?? id
  }
  if (utilityFunction.actionObjectType === 'action') {
    const action = actions.find((a) => a.id === id)
    return action?.actionName ?? id
  }

  const action = actions.find((a) => a.id === id)
  if (action) return action.actionName
  const seq = actionSequences.find((s) => s.id === id)
  return seq?.name ?? id
}

export function resolveUtilityFunctionActionObjectType (utilityFunction, actionSequences) {
  if (utilityFunction.actionObjectType) {
    return utilityFunction.actionObjectType
  }
  return actionSequences.some((s) => s.id === utilityFunction.actionId)
    ? 'actionSequence'
    : 'action'
}
