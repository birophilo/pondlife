import { defineStore } from 'pinia'


export const useStore = defineStore({
  id: 'storeState',
  state: () => ({

    GlobalSettings: {
      globalSpeed: 100,
      animationFrameId: 1
    },

    dayNumber: 1,
    // agent detail to display in UI
    selectedAgent: null,
    // agent to select as target/object in action creation e.g. 'go to'
    selectedTargetAgent: null,
    agentPreview: null,
    placingAgent: false,
    deleteMode: false,
    // mode to select target agent
    selectionMode: false,
    selectedPoint: {x: null, y: null},
    // set by click on board in selection mode
    deleteButton: null,
    itemMenu: null,

    mouse: {x: 0, y: 0},
    hover: null,

    agentMenuButtons: [],

    animationSets: [],
    spriteSheets: [],

    // e.g. {customer: AgentType, lemonadeStall: AgentType}
    agentTypes: {},

    // e.g. {customer: [Agent, Agent, Agent], lemonadeStall: [Agent, Agent]}
    agentItems: {},

    actions: [],

    conditions: [],

    // hard-coded 8-way list (9 including 'idle') for basic 2D directional sprite movements
    directionList: [
      ['upLeft', 'up', 'upRight'],
      ['left', 'idle', 'right'],
      ['downLeft', 'down', 'downRight']
    ]

  })
})