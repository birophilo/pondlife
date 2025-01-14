import { defineStore } from 'pinia'
import baseApiClient from '../baseApiClient'

const BASE_URL = 'http://localhost:8000'


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

    agentProperties: [],

    // hard-coded 8-way list (9 including 'idle') for basic 2D directional sprite movements
    directionList: [
      ['upLeft', 'up', 'upRight'],
      ['left', 'idle', 'right'],
      ['downLeft', 'down', 'downRight']
    ],

    sceneData: {}

  }),
  actions: {
    async fetchSceneData (sceneId) {
      this.loading = true
      this.error = null
      try {
        const response = await fetch(`${BASE_URL}/scene/${sceneId}`)
        const data = await response.json()
        this.sceneData = data.data
        this.sceneId = data.id
      } catch (error) {
        this.error = error.message
      }
    },
    clearAllData () {
      this.conditions = []
      this.actions = []
      this.agentItems = {}
      this.agentTypes = {}
      this.agentMenuButtons = []
    },
    async saveScene (sceneId) {
      try {
        const response = await fetch(
          `${BASE_URL}/scene/${sceneId}`, {
            method: 'POST',
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json;charset=UTF-8",
            },
            body: JSON.stringify(this.sceneData)
          }
        )
        const resp = await response.json()
        console.log("RESPONSE", resp)
      } catch (error) {
        this.error = error.message
      }
    },
    createCondition (data) {
      return baseApiClient.createItem('conditions', data)
    },
    getCondition (id) {
      return baseApiClient.getItem('condition', id)
    },
    updateCondition (data) {
      return baseApiClient.updateItem('condition', data)
    },
    deleteCondition (id) {
      return baseApiClient.deleteItem('condition', id)
    },
    createSpriteSheet (data) {
      return baseApiClient.createItem('spritesheets', data)
    },
    getSpriteSheet (id) {
      return baseApiClient.getItem('spritesheet', id)
    },
    updateSpriteSheet (data) {
      return baseApiClient.updateItem('spritesheet', data)
    },
    deleteSpriteSheet (id) {
      return baseApiClient.deleteItem('spritesheet', id)
    },
    createAnimationSet (data) {
      return baseApiClient.createItem('animationSets', data)
    },
    getAnimationSet (id) {
      return baseApiClient.getItem('animationSet', id)
    },
    updateAnimationSet (data) {
      return baseApiClient.updateItem('animationSet', data)
    },
    deleteAnimationSet (id) {
      return baseApiClient.deleteItem('animationSet', id)
    },
    createAgentType (data) {
      return baseApiClient.createItem('agentTypes', data)
    },
    getAgentType (id) {
      return baseApiClient.getItem('agentType', id)
    },
    updateAgentType (data) {
      return baseApiClient.updateItem('agentType', data)
    },
    deleteAgentType (id) {
      return baseApiClient.deleteItem('agentType', id)
    },
    createAction (data) {
      return baseApiClient.createItem('actions', data)
    },
    getAction (id) {
      return baseApiClient.getItem('action', id)
    },
    updateAction (data) {
      return baseApiClient.updateItem('action', data)
    },
    deleteAction (id) {
      return baseApiClient.deleteItem('action', id)
    },
    createPropertyChange (propertyChange, actionId) {
      const data = {propertyChange: propertyChange, actionId: actionId}
      return baseApiClient.createItem('propertyChanges', data)
    },
    getPropertyChange (id) {
      return baseApiClient.getItem('propertyChange', id)
    },
    updatePropertyChange (data) {
      return baseApiClient.updateItem('propertyChange', data)
    },
    deletePropertyChange (id) {
      return baseApiClient.deleteItem('propertyChange', id)
    },
    createAgent (data) {
      return baseApiClient.createItem('agents', data)
    },
    getAgent (id) {
      return baseApiClient.getItem('agent', id)
    },
    updateAgent (data) {
      return baseApiClient.updateItem('agent', data)
    },
    deleteAgent (id) {
      return baseApiClient.deleteItem('agent', id)
    },
    createInitialAgentProperty (data) {
      return baseApiClient.createItem('agentProperties', data)
    },
    getInitialAgentProperty (id) {
      return baseApiClient.getItem('agentProperty', id)
    },
    updateInitialAgentProperty (data) {
      return baseApiClient.updateItem('agentProperty', data)
    },
    deleteInitialAgentProperty (id) {
      return baseApiClient.deleteItem('agentProperty', id)
    }
  }
})