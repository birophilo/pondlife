/**
 * Presets for SimObjectLoadModal — title, copy, and list columns per object kind.
 * Add entries here when wiring load modals for other sim entity types.
 */
export const SIM_LOAD_MODAL_KINDS = {
  agentType: 'agentType'
}

export const SIM_LOAD_MODAL_PRESETS = {
  [SIM_LOAD_MODAL_KINDS.agentType]: {
    title: 'Load agent type',
    description: 'Select an agent type to add to this scene.',
    emptyText: 'No agent types available.',
    columns: [
      { key: 'thumbnail', label: '', type: 'image', width: '56px' },
      { key: 'name', label: 'Name', type: 'text', flex: '1', minWidth: '100px' },
      {
        key: 'authorUsername',
        fallbackKey: 'authorId',
        label: 'Created by',
        type: 'text',
        width: '110px'
      },
      {
        key: 'createdAt',
        label: 'Created at',
        type: 'datetime',
        width: '150px'
      }
    ]
  }
}

export function getSimLoadModalPreset (kind) {
  return SIM_LOAD_MODAL_PRESETS[kind] ?? {
    title: 'Load object',
    description: 'Select an item to add to this scene.',
    emptyText: 'No items available.',
    columns: [{ key: 'name', label: 'Name', type: 'text', flex: '1' }]
  }
}
