/**
 * Presets for SimObjectLoadModal — title, copy, and list columns per object kind.
 * Selection handlers live in simLoadModalHandlers.js; wired via ModalLoadSimObject.
 */
export const SIM_LOAD_MODAL_KINDS = {
  agentType: 'agentType',
  spriteSheet: 'spriteSheet',
  animationSet: 'animationSet',
  sensor: 'sensor',
  utilityFunction: 'utilityFunction',
  action: 'action',
  condition: 'condition',
  propertyChange: 'propertyChange',
  recurringChange: 'recurringChange',
  agentProperty: 'agentProperty'
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
        width: '160px',
        fallbackFromObjectId: true
      }
    ]
  },
  [SIM_LOAD_MODAL_KINDS.spriteSheet]: {
    title: 'Load sprite sheet',
    description: 'Select a sprite sheet to add to this scene.',
    emptyText: 'No sprite sheets available.',
    columns: [
      { key: 'src', label: '', type: 'image', width: '56px', imagePrefix: '/media/' },
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
        width: '160px',
        fallbackFromObjectId: true
      }
    ]
  },
  [SIM_LOAD_MODAL_KINDS.animationSet]: {
    title: 'Load animation set',
    description: 'Select an animation set to add to this scene.',
    emptyText: 'No animation sets available.',
    columns: [
      { key: 'previewSrc', label: '', type: 'image', width: '56px', imagePrefix: '/media/' },
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
        width: '160px',
        fallbackFromObjectId: true
      }
    ]
  },
  [SIM_LOAD_MODAL_KINDS.sensor]: {
    title: 'Load sensor',
    description: 'Select a sensor to add to this scene.',
    emptyText: 'No sensors available.',
    columns: [
      { key: 'name', label: 'Name', type: 'text', flex: '1', minWidth: '100px' },
      { key: 'type', label: 'Type', type: 'text', width: '80px' },
      { key: 'radius', label: 'Radius', type: 'text', width: '72px' },
      {
        key: 'authorUsername',
        fallbackKey: 'authorId',
        label: 'Created by',
        type: 'text',
        width: '100px'
      },
      {
        key: 'createdAt',
        label: 'Created at',
        type: 'datetime',
        width: '150px',
        fallbackFromObjectId: true
      }
    ]
  },
  [SIM_LOAD_MODAL_KINDS.utilityFunction]: {
    title: 'Load utility function',
    description: 'Select a utility function to add to this scene.',
    emptyText: 'No utility functions available.',
    columns: [
      { key: 'agentType', label: 'Agent type', type: 'text', width: '90px' },
      { key: 'property', label: 'Property', type: 'text', width: '80px' },
      { key: 'func', label: 'Function', type: 'text', width: '88px' },
      { key: 'actionLabel', label: 'Action', type: 'text', flex: '1', minWidth: '100px' },
      {
        key: 'authorUsername',
        fallbackKey: 'authorId',
        label: 'Created by',
        type: 'text',
        width: '100px'
      },
      {
        key: 'createdAt',
        label: 'Created at',
        type: 'datetime',
        width: '150px',
        fallbackFromObjectId: true
      }
    ]
  },
  [SIM_LOAD_MODAL_KINDS.action]: {
    title: 'Load action',
    description: 'Select an action to add to this scene.',
    emptyText: 'No actions available.',
    columns: [
      { key: 'actionName', label: 'Name', type: 'text', flex: '1', minWidth: '120px' },
      { key: 'actionType', label: 'Type', type: 'text', width: '100px' },
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
        width: '160px',
        fallbackFromObjectId: true
      }
    ]
  },
  [SIM_LOAD_MODAL_KINDS.condition]: {
    title: 'Load condition',
    description: 'Select a condition to add to this scene.',
    emptyText: 'No conditions available.',
    columns: [
      { key: 'name', label: 'Name', type: 'text', flex: '1', minWidth: '120px' },
      { key: 'conditionType', label: 'Type', type: 'text', width: '90px' },
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
        width: '160px',
        fallbackFromObjectId: true
      }
    ]
  },
  [SIM_LOAD_MODAL_KINDS.propertyChange]: {
    title: 'Load property change',
    description: 'Select a property change to add to this scene.',
    emptyText: 'No property changes available.',
    columns: [
      { key: 'property', label: 'Property', type: 'text', width: '90px' },
      { key: 'change', label: 'Change', type: 'text', width: '80px' },
      { key: 'value', label: 'Value', type: 'text', width: '72px' },
      { key: 'actionLabel', label: 'Action', type: 'text', flex: '1', minWidth: '100px' },
      {
        key: 'authorUsername',
        fallbackKey: 'authorId',
        label: 'Created by',
        type: 'text',
        width: '100px'
      },
      {
        key: 'createdAt',
        label: 'Created at',
        type: 'datetime',
        width: '150px',
        fallbackFromObjectId: true
      }
    ]
  },
  [SIM_LOAD_MODAL_KINDS.recurringChange]: {
    title: 'Load recurring change',
    description: 'Select a recurring change to add to this scene.',
    emptyText: 'No recurring changes available.',
    columns: [
      { key: 'agentType', label: 'Agent type', type: 'text', width: '100px' },
      { key: 'property', label: 'Property', type: 'text', width: '90px' },
      { key: 'frameInterval', label: 'Interval', type: 'text', width: '80px' },
      { key: 'change', label: 'Change', type: 'text', width: '72px' },
      {
        key: 'authorUsername',
        fallbackKey: 'authorId',
        label: 'Created by',
        type: 'text',
        width: '100px'
      },
      {
        key: 'createdAt',
        label: 'Created at',
        type: 'datetime',
        width: '150px',
        fallbackFromObjectId: true
      }
    ]
  },
  [SIM_LOAD_MODAL_KINDS.agentProperty]: {
    title: 'Load agent property',
    description: 'Select an agent property definition to add to this scene.',
    emptyText: 'No agent properties available.',
    columns: [
      { key: 'name', label: 'Name', type: 'text', flex: '1', minWidth: '100px' },
      { key: 'valueType', label: 'Type', type: 'text', width: '80px' },
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
        width: '160px',
        fallbackFromObjectId: true
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
