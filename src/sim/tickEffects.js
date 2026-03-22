/**
 * Deferred world mutations for one simulation tick.
 * Handlers call `emit` during the agent loop; effects are applied afterward
 * so we never mutate agent lists while iterating them.
 */

export const TICK_EFFECT_REMOVE_AGENT = 'removeAgent'
export const TICK_EFFECT_SPAWN_AGENT = 'spawnAgent'

/**
 * @param {Array<{ type: string, agent?: object, agentType?: object, position?: object }>} effects
 * @param {{ store: object, deleteAgent: Function, addAgent: Function }} deps
 */
export function applyTickEffects (effects, { store, deleteAgent, addAgent }) {
  const removals = effects.filter((e) => e.type === TICK_EFFECT_REMOVE_AGENT)
  const spawns = effects.filter((e) => e.type === TICK_EFFECT_SPAWN_AGENT)

  for (const effect of removals) {
    const agent = effect.agent
    const agentTypeName = agent.agentType.name
    const agentItems = store.agentItems[agentTypeName]
    const agentToDelete = agentItems.find((ag) => ag.id === agent.id)
    const i = agentItems.indexOf(agentToDelete)
    if (agentToDelete !== undefined && i >= 0) {
      deleteAgent(agentToDelete, agentItems, i)
    }
  }

  for (const effect of spawns) {
    const agentTypeName = effect.agentType.name
    addAgent(agentTypeName, effect.position)
  }
}
