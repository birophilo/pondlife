<template>
<div id="container">

  <div class="canvas-container">
    <canvas></canvas>
  </div>

  <div class="info-container">

    <div class="menu-section">
      <div class="day-container">
        Day: <span id="day-number">{{ store.dayNumber }}</span>
      </div>
      <div class="speed-slide-container">
        <div>
          <span>Speed: {{ store.GlobalSettings.globalSpeed / 100 }}</span>
        </div>
        <input
          v-model="store.GlobalSettings.globalSpeed"
          id="sim-speed-slider"
          type="range" min="0" max="200" value="100"
        >
      </div>
    </div>

    <details class="menu-section" id="agent-types-section">
      <summary class="menu-section-heading">
        Selected Agent: &nbsp;
        <span class="body-small">{{ store.selectedAgent !== null ? store.selectedAgent.name : 'none' }}</span>
      </summary>
      <div v-if="store.selectedAgent !== null">
        {{ store.selectedAgent.name }}<br/>
        current action: {{ store.selectedAgent.currentStateName }}
      </div>
      <div v-else>none</div>
    </details>

    <details class="menu-section" id="agent-types-section">
      <summary class="menu-section-heading">Agent Types</summary>
      <div v-for="(agentType) in store.agentTypes">
        <MenuAgentType :agentType="agentType" />
      </div>
      <CreateAgentTypeForm />
    </details>

    <details class="menu-section" id="sprite-sheets-section">
      <summary>Sprites</summary>
      <h3 class="menu-section-heading">Sprite Sheets</h3>
      <div v-for="(spriteSheet, index) in store.spriteSheets">
        <MenuSpriteSheet :spriteSheet="spriteSheet" :i="index" />
      </div>
      <SpriteSheetForm />

      <h3 class="menu-section-heading">Animation Sets</h3>
      <div v-for="(animationSet, index) in store.animationSets">
        <MenuAnimationSet :animationSet="animationSet" :i="index" />
      </div>
      <AnimationSetForm />
    </details>

    <details class="menu-section" id="properties-section">
      <summary class="menu-section-heading">Properties</summary>
      <div v-if="store.selectedAgent !== null" class="item-list">
        <MenuProperty :agentProperties="store.selectedAgent.stateData"/>
        <SetPropertyForm />
      </div>
    </details>

    <details class="menu-section" id="actions-section">
      <summary class="menu-section-heading">Actions</summary>
      <div class="item-list">
        <div v-for="action in store.actions" class="created-item">
          <MenuAction :action="action"/>
        </div>
        <ActionCreateForm />
      </div>
    </details>

    <details class="menu-section" id="start-actions-section" :open="store.actions.length > 0">
      <summary class="menu-section-heading">Start action</summary>
      <div v-if="store.actions.length > 0">
        <div v-for="action in store.actions">
          <button @click="cloneAction(action)">{{ action.actionName }}</button>
        </div>
      </div>
      <div v-else>
        no actions yet
      </div>
    </details>

    <details class="menu-section" id="actions-section">
      <summary class="menu-section-heading">Conditions</summary>
      <div class="item-list">
        <div v-for="(item, index) in store.conditions" class="created-item">
          <MenuCondition :item="item" :index="index" />
        </div>
      </div>
      <ConditionCreateForm />
    </details>

  </div>
</div>
</template>


<script>
import { useStore } from './store/mainStore.js'

import { pointIsInArea } from "./utils.js"
import AgentType from "./classes/AgentType.js"
import Agent from "./classes/Agent.js"
import { AgentMenu, AgentMenuIcon, DeleteButton, AgentPreview } from "./classes/SelectionMenu.js"

import CreateAgentTypeForm from './components/CreateAgentTypeForm.vue'
import MenuAgentType from './components/MenuAgentType.vue'
import SetPropertyForm from './components/SetPropertyForm.vue'
import MenuProperty from './components/MenuProperty.vue'
import ActionCreateForm from './components/ActionCreateForm.vue'
import MenuAction from './components/MenuAction.vue'
import ConditionCreateForm from './components/ConditionCreateForm.vue'
import MenuCondition from './components/MenuCondition.vue'
import SpriteSheetForm from './components/SpriteSheetForm.vue'
import MenuSpriteSheet from './components/MenuSpriteSheet.vue'
import AnimationSetForm from './components/AnimationSetForm.vue'
import MenuAnimationSet from './components/MenuAnimationSet.vue'

import { initialAgentInstances, initialAgentTypes, initialAgentMenuButtons } from './initialData.js'


let canvas;
let c;  // canvas context

let dayLength = 1000 // frames
const backgroundColor = 'rgb(220, 220, 220)'


export default {
  name: 'App',
  setup() {
    const store = useStore()
    return { store }
  },
  components: {
    CreateAgentTypeForm,
    MenuAgentType,
    SetPropertyForm,
    MenuProperty,
    ActionCreateForm,
    MenuAction,
    ConditionCreateForm,
    MenuCondition,
    MenuSpriteSheet,
    SpriteSheetForm,
    MenuAnimationSet,
    AnimationSetForm
  },
  data: function () {
    return {

      animationSetsData: JSON.parse(localStorage.getItem('pondlifeSpriteMaps')),
      spriteSheetsData: JSON.parse(localStorage.getItem('pondlifeSpriteSheets')),

      propertiesSection: {
        items: [{name: 'money', value: 200, editing: false}],
        adding: {
          status: false,
          newPropertyName: '',
          newPropertyValue: 0
        }
      }
    }
  },

  mounted: function () {

    canvas = document.querySelector('canvas')
    c = canvas.getContext('2d')

    canvas.width = 1000
    canvas.height = 600

    c.fillStyle = backgroundColor
    c.fillRect(0, 0, canvas.width, canvas.height)

    this.loadAgentsAndFixtures()

    this.animate()

    /* --- CLICK ACTIONS / EVENT LISTENERS --- */

    canvas.addEventListener('mousemove', (event) => {
      this.store.mouse.x = event.pageX
      this.store.mouse.y = event.pageY
    })

    canvas.addEventListener('click', (event) => {
      const point = {x: event.x, y: event.y}

      // PLACE NEW AGENT ON
      if (this.store.placingAgent) {
        const isInMenuArea = pointIsInArea(point, this.store.itemMenu.area)

        if (isInMenuArea === false) {
          const agentClassName = this.store.agentPreview.agentType.name
          this.addAgent(agentClassName)
          this.store.placingAgent = false
          this.store.agentPreview = null
        } else {
          this.store.hover = true
        }
      }

      const agentTypeNames = Object.keys(this.store.agentTypes)

      agentTypeNames.forEach(agentTypeName => this.selectOrDeleteAgent(agentTypeName, point))

      // SELECT AGENT BUTTON TO CREATE CURSOR PREVIEW (to place new agent on board)
      for (let i = 0; i < this.store.agentMenuButtons.length; i++) {

        const isInArea = pointIsInArea(point, this.store.agentMenuButtons[i].area)

        if (isInArea) this.store.hover = 'true'

        if (isInArea && !this.store.agentPreview) {
          const agentTypeName = this.store.agentMenuButtons[i].name
          this.store.agentPreview = new AgentPreview(this.store.agentTypes[agentTypeName])
          this.store.placingAgent = true
          break

        } else if (isInArea && this.store.agentPreview) {
          // if have active agent preview (tracking cursor), clicking on the agent menu again cancels the selection
          this.store.placingAgent = false
          this.store.agentPreview = null
        }
      }

      // TOGGLE DELETE MODE
      const isInArea = pointIsInArea(point, this.store.deleteButton.area)

      if (isInArea) {
        this.store.hover = true
        this.store.deleteMode = !this.store.deleteMode
      }

      // POINT/AGENT SELECTION MODE
      if (this.store.selectionMode === true) {
        this.store.selectedPoint = {
          x: this.store.mouse.x,
          y: this.store.mouse.y
        }
      }

    })

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && this.store.placingAgent === true) {
        this.store.placingAgent = false
        this.store.agentPreview = null
      }
    })
  },

  methods: {

    loadAgentsAndFixtures: function () {

      // load from localStorage (temporary solution while frontend-only)
      this.store.animationSets = this.animationSetsData !== null ? this.animationSetsData : []
      this.store.spriteSheets = this.spriteSheetsData !== null ? this.spriteSheetsData : []

      initialAgentTypes.forEach(agentType => {
        this.store.agentTypes[agentType.name] = new AgentType(agentType)
      })

      const agentTypeNames = Object.keys(this.store.agentTypes)

      // hard-coding for the moment
      this.store.agentTypes.customer.config.animationSet = this.store.animationSets[0]

      // populate agents from initial data
      agentTypeNames.forEach(agentTypeName => {
        this.store.agentItems[agentTypeName] = []
        initialAgentInstances[agentTypeName].forEach((item, i) => {
          this.store.agentItems[agentTypeName].push( new Agent({
            agentTypeName: agentTypeName,
            position: {x: item.x, y: item.y},
            num: i + 1,
            globals: this.store.GlobalSettings,
            config: this.store.agentTypes[agentTypeName].config
          }))
        })
      })

      this.store.itemMenu = new AgentMenu()
      initialAgentMenuButtons.forEach((agentName, i) => {
        this.store.agentMenuButtons.push(
          new AgentMenuIcon({
            menu: this.store.itemMenu,
            i: i,
            name: agentName,
            agent: Agent,
            config: this.store.agentTypes[agentName].config
          })
        )
      })
      this.store.deleteButton = new DeleteButton({
        menu: this.store.itemMenu,
        i: this.store.agentMenuButtons.length
      })
    },
    deleteCondition: function (index) {
      this.store.conditions.splice(index, 1)
    },
    conditionReadableFormat: function (condition) {
      const readable = `${ condition.property } ${ condition.comparison } ${ condition.value }`
      return readable
    },
    updateThumbnailFileInput: function (event, agentTypeForm) {
      const fileName = "/img/thumbnails/" + event.target.files[0].name
      agentTypeForm.thumbnail = fileName
    },

    /* ANIMATE */

    animate: function () {

      this.store.hover = null

      c.fillStyle = backgroundColor
      c.fillRect(0, 0, canvas.width, canvas.height)

      const animationId = requestAnimationFrame(this.animate)
      this.store.GlobalSettings.animationFrameId = animationId

      const agentTypeNames = Object.keys(this.store.agentItems)

      // update each agent of each agent type
      agentTypeNames.forEach(agentTypeName => {
        this.store.agentItems[agentTypeName].forEach(agent => {
          const emissions = agent.update(c, {}, this.store.GlobalSettings)

          if (emissions) {
            if (emissions.agentsToDelete?.length > 0) {
              emissions.agentsToDelete.forEach(agent => {
                const agentType = agent.agentType
                const items = this.store.agentItems[agentType]
                const item = items.find(ag => ag.name === agent.name)
                item.labelElement.remove()
                items.splice(items.indexOf(item), 1)
              })
            }
            if (emissions.agentsToSpawn?.length > 0) {
              emissions.agentsToSpawn.forEach(args => {
                const agentType = args.agentType
                this.store.agentItems[agentType].push( new Agent({
                  agentTypeName: agentType,
                  position: args.position,
                  num: this.store.agentItems[agentType].length + 1,
                  globals: this.store.GlobalSettings,
                  config: this.store.agentTypes[agentType].config
                }))
              })
            }
          }

          const isInArea = pointIsInArea(this.store.mouse, agent.collisionArea)
          if (isInArea) this.store.hover = true
        })
      })
      
      this.store.itemMenu.update(c, this.store.agentMenuButtons.length + 1)

      this.store.agentMenuButtons.forEach((button, i) => {
        button.update(c, i)
        const isInArea = pointIsInArea(this.store.mouse, button.area)
        if (isInArea) this.store.hover = true
      })

      if (this.store.agentPreview) this.store.agentPreview.update(c, this.store.mouse)

      if (pointIsInArea(this.store.mouse, this.store.deleteButton.area)) this.store.hover = true

      if (this.store.selectionMode === true) this.store.hover = true

      this.store.deleteButton.update(c, this.store.agentMenuButtons.length, this.store.deleteMode)

      canvas.style.cursor = this.store.hover ? 'pointer' : 'auto'

      if (animationId % dayLength === 0) this.endDay()

      if (this.store.GlobalSettings.animationFrameId % 32 === 0) {
        const customerActions = this.store.agentItems['customer'].map(cust =>
          `${cust.name}, action: ${cust.currentAction ? cust.currentAction.name : 'none'}`
        )
        console.log(JSON.stringify(customerActions, null, 2))
      }

    },

    selectOrDeleteAgent: function (agentTypeName, point) {
      const agentItems = this.store.agentItems[agentTypeName]
      agentItems.forEach((agent, i) => {
        const isInArea = pointIsInArea(point, agent.collisionArea)

        // SELECT AGENT
        if (isInArea) {
          this.store.selectedAgent = agent
          this.store.hover = true

          if (this.store.selectionMode === true) {
            this.store.selectedTargetAgent = agent
            this.actionsSection.adding.forms.goTo.target = this.store.selectedTargetAgent
          }
        }
        // DELETE AGENT (in delete mode)
        if (isInArea && this.store.deleteMode === true) {
          const agent = agentItems[i]
          agent.labelElement.remove()
          agentItems.splice(i, 1)
        }
      })
    },
    setDynamicActionTargetAgents: function (action) {
      /*
      Some target agent/s need to be set dynamically according to criteria that can
      only be determined when the action starts:
      - nearest agent: dynamic
      - specific agent: not dynamic
      - all agents: dynamic (number could change between creating action and starting it)

      Note: this may not be generalisable enough - to re-organise?
      */

      if (action.args.agentChoiceMethod === 'nearest') {
        const agentTypeName = action.args.agentType
        const agentItems = this.store.agentItems[agentTypeName]
        const targetAgent = this.store.selectedAgent.getClosestAgent(agentItems)
        action.args.target = targetAgent
      } else if (action.args.agentChoiceMethod === 'all') {
        const agentTypeName = action.args.agentType
        const agentItems = this.store.agentItems[agentTypeName]
        action.args.target = agentItems
      }

      // if action involves property changes, set target for each change based on
      // agentChoiceMethod ('nearest' etc)
      if (action.actionType === 'change') {
        action.propertyChanges.forEach(change => {
          if (change.args.agentType !== 'self') {
            if (change.args.agentChoiceMethod === 'nearest') {
              const agentTypeName = change.args.agentType
              const agentItems = this.store.agentItems[agentTypeName]
              const targetAgent = this.store.selectedAgent.getClosestAgent(agentItems)
              change.args = {...change.args, target: targetAgent}
            } else if (change.args.agentChoiceMethod === 'all') {
              const agentTypeName = change.args.agentType
              const agentItems = this.store.agentItems[agentTypeName]
              change.args = {...change.args, target: agentItems}
            }
          }
        })
      }
    },
    cloneAction: function (action) {
      this.setDynamicActionTargetAgents(action)
      this.store.selectedAgent.currentAction = action.clone(this.store.selectedAgent)
    },
    addAgent: function (agentTypeName) {
      const agentItems = this.store.agentItems[agentTypeName]
      const num = agentItems.length + 1
      agentItems.push( new Agent({
        agentTypeName: agentTypeName,
        position: {
          x: this.store.mouse.x - this.store.agentTypes[agentTypeName].config.width / 2,
          y: this.store.mouse.y - this.store.agentTypes[agentTypeName].config.height / 2
        },
        num: num,
        globals: this.store.GlobalSettings,
        offset: this.store.agentTypes[agentTypeName].config.offset,
        scale: this.store.agentTypes[agentTypeName].config.scale,
        config: this.store.agentTypes[agentTypeName].config
      }))
    },
    endDay: function() {
      this.store.dayNumber += 1
    }
  }
}

</script>

<style>

/* @import url('https://fonts.googleapis.com/css?family=Roboto+Condensed');
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet">
 */


body {
  margin: 0;
  padding: 0;
  font-family: "Rubik", sans-serif;
  font-weight: 400;
  font-size: 16px;
  /* background-color: #f4f0e0; */
  background-color: #efeee8;
  /* color: #3345a4; */
  color: #e43d12;
}

canvas {
  width: 1000px;
  height: 600px;
  position: relative;
}

#container {
  display: flex;
  width: 100%;
  justify-content: left;
}

details {
  margin-top: 24px;
}

summary {
  font-size: 1.1rem;
  user-select: none;
}

details[open] summary {
  margin-bottom: 20px;
}

.info-container {
  width: 100%;
  padding: 5px 5px 5px 10px;
}

.speed-slide-container {
  display: flex;
  flex-direction: column;
  padding: 5px;
}

.day-container {
  padding: 5px;
}

.menu-subheading,h3 {
  font-weight: 500;
  font-size: 20px;
  margin: 16px 0 16px 0;
}

.menu-section {
  padding-bottom: 20px;
  border-bottom: 1px solid #ccc;
}

.menu-action-name {
  font-size: 20px;
  padding-right: 10px;
  font-weight: 500;
}

input,select,button {
  padding: 5px 8px 5px 8px;
  margin: 4px;
  font-family: "Rubik", sans-serif;
  border-radius: 3px;
  border-width: 1px;
}

.created-item-header {
  display: flex;
  align-items: center;
}

.created-item {
  border: 1px solid grey;
  border-radius: 5px;
  padding: 5px;
  margin-bottom: 10px;
}

.selection-mode-button {
  cursor: pointer;
}

.canvas-agent-label {
  position: absolute;
  font-size: 11px;
  color: black;
  z-index: 5;
  font-family: 'Helvetica';
  font-weight: 400;
}

table, th, td {
  border: 1px solid #e43d12;
  border-collapse: collapse;
  padding: 5px;
}

button {
  border: 1px solid #e43d12;
}

.body-small {
  font-size: 0.85rem;
}

</style>
