import { defineStore } from 'pinia'
import apiCrud from '../apiCrud'
import { groupRecurringChangesOnWorld } from '@/sim/world.js'

const BASE_URL = 'http://localhost:8000'

/**
 * Plan 3 — Pinia boundaries (Phases A + E)
 *
 * Reactive shell (forms, menus, routing): sceneList, sceneData, sceneId / sceneName,
 * needsSimHydration (load scene on Sim route after fetch), displayLoadObjectModal, defs (agentTypes, actions, conditions,
 * spriteSheets, animationSets, …), UI flags (sceneIsPlaying, sceneIsPaused, placingAgent,
 * deleteMode, selectionMode), GlobalSettings.globalSpeed, dayNumber, selectedAgent /
 * selectedTargetAgent, api reference.
 *
 * Phase E — Sim-hot data (no per-frame reactive writes):
 * • Agent instances from createAgentObject() are markRaw — not deep-tracked; rAF mutates
 *   position, frames, stateData, etc. without Vue proxy overhead.
 * • Canvas menu chrome (itemMenu, deleteButton, agentMenuButtons icons, agentPreview)
 *   are markRaw class instances updated every frame from simRuntime.
 * • Vue templates bound to store.selectedAgent nested fields may not auto-refresh on every
 *   sim tick while playing; the imperative live HUD + pause/edit flows use plain reads.
 * • sceneLoader.js, tickEffects.js, agentActions.js — run from simRuntime (or scene load),
 *   not from per-frame Vue logic.
 *
 * Phase F — sim pointer: src/sim/simPointer.js (plain { x, y }) updated every mousemove in
 * simRuntime. store.mouse is synced only when selectionMode (Vue action forms) needs
 * reactive coords, plus once when selectionMode is turned on (watch in SimView).
 */

export const useStore = defineStore({
  id: 'storeState',
  state: () => ({

    GlobalSettings: {
      globalSpeed: 100
    },

    sceneIsPlaying: false,
    sceneIsPaused: false,

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

    agentMenuButtons: [],

    animationSets: [],
    spriteSheets: [],

    // e.g. {customer: AgentType, lemonadeStall: AgentType}
    agentTypes: {},

    // e.g. {customer: [Agent, Agent, Agent], lemonadeStall: [Agent, Agent]}
    agentItems: {},

    actions: [],
    actionSequences: [],

    conditions: [],

    agentProperties: [],

    sensors: [],

    agentUtilityFunctions: [],

    ungroupedRecurringChanges: [],
    groupedRecurringChanges: {},

    firstActions: {},

    scheduledEffects: {},

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

    /** Set true after fetchSceneData from Simulations page; SimView runs sim hydration once. */
    needsSimHydration: false,

    displayLoadObjectModal: false

  }),
  actions: {
    /**
     * Load a scene's data into the store for the canvas (used from Simulations route).
     * Navigate to `sim` after; SimView will call loadAgentsAndFixtures when needsSimHydration is set.
     */
    async loadSceneForSimulation (scene) {
      this.clearSceneFixtureState()
      this.resetSimulationSessionState()
      await this.fetchSceneData(scene.id)
      if (this.error) {
        this.needsSimHydration = false
        return
      }
      this.needsSimHydration = true
    },

    /**
     * Playback + editor UI when switching to another simulation (or fresh load).
     * Does not clear fixture lists — use with clearSceneFixtureState.
     */
    resetSimulationSessionState () {
      this.sceneIsPlaying = false
      this.sceneIsPaused = false
      this.dayNumber = 1
      this.selectedAgent = null
      this.selectedTargetAgent = null
      this.selectionMode = false
      this.deleteMode = false
      this.placingAgent = false
      this.selectedPoint = { x: null, y: null }
    },

    /** Wipe in-memory scene payload before fetch+hydrate (avoids stale agents / recurring state). */
    clearSceneFixtureState () {
      this.clearAllData()
      this.animationSets = []
      this.spriteSheets = []
      this.sensors = []
      this.agentUtilityFunctions = []
      this.ungroupedRecurringChanges = []
      this.groupedRecurringChanges = {}
      this.firstActions = {}
      this.actionSequences = []
    },
    async fetchSceneList() {
      this.loading = true
      this.error = null
      try {
        const response = await fetch(`${BASE_URL}/scenes`)
        const data = await response.json()
        this.sceneList = data
      } catch (error) {
        this.error = error.message
      }
    },
    async fetchSceneData (sceneId) {
      this.loading = true
      this.error = null
      try {
        const response = await fetch(`${BASE_URL}/simulation/${encodeURIComponent(sceneId)}`)
        const data = await response.json()
        if (!response.ok) {
          const detail = data?.detail
          this.error =
            typeof detail === 'string'
              ? detail
              : Array.isArray(detail)
                ? detail.map((d) => d.msg || d).join('; ')
                : `HTTP ${response.status}`
          this.sceneData = {}
          return
        }
        if (!data || typeof data !== 'object' || data.data == null || typeof data.data !== 'object') {
          this.error = 'Invalid simulation payload (missing data)'
          this.sceneData = {}
          return
        }
        this.sceneData = data.data
        this.sceneId = data.id
        this.sceneName = data.name
        this.createdAt = data.createdAt
        this.lastModified = data.lastModified
      } catch (error) {
        this.error = error.message
        this.sceneData = {}
      }
    },
    clearAllData () {
      this.conditions = []
      this.actions = []
      this.agentItems = {}
      this.agentTypes = {}
      this.agentMenuButtons = []
      this.itemMenu = null
      this.deleteButton = null
      this.agentPreview = null
    },

    async saveScene () {
      const data = {
        agentTypes: [],
        agentInstances: [],
        conditions: this.conditions.map(i => i.id),
        actions: this.actions.map(i => i.id),
        actionSequences: this.actionSequences.map(i => i.id),
        agentProperties: this.agentProperties.map(i => i.id),
        spritesheets: this.spriteSheets.map(i => i.id),
        animationSets: this.animationSets.map(i => i.id),
        propertyChanges: this.propertyChanges.map(i => i.id),
        sensors: this.sensors.map(i => i.id),
        utilityFunctions: this.agentUtilityFunctions.map(i => i.id),
        recurringChanges: this.ungroupedRecurringChanges.map(i => i.id),
        firstActions: {...this.firstActions}
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
        data: data,
        createdAt: this.createdAt,
        lastModified: this.lastModified,
        resource: 'scene'
      }

      try {
        await fetch(
          `${BASE_URL}/scene/${this.sceneId}`, {
            method: 'PUT',
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json;charset=UTF-8",
            },
            body: JSON.stringify(payload)
          }
        )
        // const resp = await response.json()
        console.log('Saved scene')
      } catch (error) {
        this.error = error.message
      }
    },

    groupRecurringChanges () {
      groupRecurringChangesOnWorld(this)
    }
  }
})