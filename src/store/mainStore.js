import { defineStore } from 'pinia'
import apiCrud from '../apiCrud'

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

    // summary list data for scene menu selection
    sceneList: [],

    // scene detail
    sceneData: {},

    api: apiCrud,

    displaySceneMenu: true

  }),
  actions: {
    async fetchSceneList() {
      this.loading = true
      this.error = null
      try {
        const response = await fetch(`${BASE_URL}/scenes`)
        const data = await response.json()
        console.log("DATA")
        console.log(data)
        this.sceneList = data
      } catch (error) {
        this.error = error.message
      }
    },
    async fetchSceneData (sceneId) {
      this.loading = true
      this.error = null
      try {
        const response = await fetch(`${BASE_URL}/scene/${sceneId}`)
        const data = await response.json()
        this.sceneData = data.data
        this.sceneId = data.id
        this.sceneName = data.name
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
    async saveScene () {


      const data = {
        conditions: this.conditions.map(i => i.id),
        agentTypes: [],
        actions: this.actions.map(i => i.id),
        agentProperties: this.agentProperties.map(i => i.id),
        spritesheets: this.spriteSheets.map(i => i.id),
        animationSets: this.animationSets.map(i => i.id),
        agentInstances: []
      }

      // eslint-disable-next-line
      for (const [key, val] of Object.entries(this.agentTypes)) {
        data.agentTypes.push(val.id)
      }

      const agentTypeNames = Object.keys(this.agentItems)

      agentTypeNames.forEach(name => {
        this.agentItems[name].forEach(agent => {
          data.agentInstances.push(agent.id)
        })
      })

      const payload = {
        id: this.sceneId,
        name: this.sceneName,
        data: data
      }

      try {
        const response = await fetch(
          `${BASE_URL}/scene/${this.sceneId}`, {
            method: 'PUT',
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json;charset=UTF-8",
            },
            body: JSON.stringify(payload)
          }
        )
        const resp = await response.json()
        console.log("RESPONSE", resp)
      } catch (error) {
        this.error = error.message
      }
    }
  }
})