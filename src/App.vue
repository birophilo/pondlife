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
import { onMounted } from 'vue'
import { useStore } from './store/mainStore.js'

import { pointIsInArea } from './utils.js'
import { createAgentTypeObject } from './classes/AgentType.js'
import { createAgentObject, AgentHandler, Agent } from './classes/Agent.js' // delete Agent
import { createConditionObject, createPresetConditionObject } from './classes/Condition.js'
import { AgentMenu, AgentMenuIcon, DeleteButton, AgentPreview } from './classes/SelectionMenu.js'
import { 
  ActionHandler,
  ActionGoToHandler,
  ActionPropertyChangesHandler,
  ActionIntervalHandler,
  ActionSpawnAgentHandler,
  ActionRemoveAgentHandler
} from './classes/Action.js'
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

import {
  initialAgentInstances,
  initialAgentTypes,
  initialAgentMenuButtons,
  initialConditions
} from './initialData.js'


const ACTION_HANDLERS = {
  'goTo': ActionGoToHandler,
  'change': ActionPropertyChangesHandler,
  'interval': ActionIntervalHandler,
  'spawnAgent': ActionSpawnAgentHandler,
  'removeAgent': ActionRemoveAgentHandler
}

let canvas;
let c;  // canvas context

let dayLength = 1000 // frames
const backgroundColor = 'rgb(220, 220, 220)'


export default {
  name: 'App',
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
  setup() {
    const store = useStore()

    // localStorage.setItem('pondlifeSpriteSheets', JSON.stringify([]))
    // localStorage.setItem('pondlifeSpriteMaps', JSON.stringify([]))

    const animationSetsData = JSON.parse(localStorage.getItem('pondlifeSpriteMaps'))
    const spriteSheetsData = JSON.parse(localStorage.getItem('pondlifeSpriteSheets'))

    const loadAgentsAndFixtures = () => {

      initialConditions.forEach(condition => {

        let newCondition

        if (condition.conditionType === 'property') {
          newCondition = createConditionObject(
            null,
            condition.name,
            condition.property,
            condition.comparison,
            condition.conditionValue
          )
        } else {
          newCondition = createPresetConditionObject(
            null,
            condition.name,
            condition.classMethod,
            condition.comparison,
            condition.conditionValue
          )
        }
        store.conditions.push(newCondition)
      })

      // load from localStorage (temporary solution while frontend-only)
      store.animationSets = animationSetsData !== null ? animationSetsData : []
      store.spriteSheets = spriteSheetsData !== null ? spriteSheetsData : []

      initialAgentTypes.forEach(agentType => {
        store.agentTypes[agentType.name] = createAgentTypeObject(agentType)
      })

      const agentTypeNames = Object.keys(store.agentTypes)

      // hard-coding for the moment
      store.agentTypes.customer.config.animationSet = store.animationSets[0]

      // populate agents from initial data
      agentTypeNames.forEach(agentTypeName => {
        store.agentItems[agentTypeName] = []
        initialAgentInstances[agentTypeName].forEach((item, i) => {

          let newAgent = createAgentObject(
            agentTypeName, // agentTypeName
            {x: item.x, y: item.y},  // position
            i + 1,  // num
            store.GlobalSettings, // globals
            store.agentTypes[agentTypeName].config  // config
          )
          const handler = new AgentHandler()
          handler.useSpritesheet(newAgent)

          store.agentItems[agentTypeName].push(newAgent)
        })
      })

      store.itemMenu = new AgentMenu()
      initialAgentMenuButtons.forEach((agentName, i) => {
        store.agentMenuButtons.push(
          new AgentMenuIcon({
            menu: store.itemMenu,
            i: i,
            name: agentName,
            agent: Agent,
            config: store.agentTypes[agentName].config
          })
        )
      })
      store.deleteButton = new DeleteButton({
        menu: store.itemMenu,
        i: store.agentMenuButtons.length
      })
    }

    const deleteCondition = (index) => {
      store.conditions.splice(index, 1)
    }

    const conditionReadableFormat = (condition) => {
      const readable = `${ condition.property } ${ condition.comparison } ${ condition.value }`
      return readable
    }

    const updateThumbnailFileInput = (event, agentTypeForm) => {
      const fileName = "/img/thumbnails/" + event.target.files[0].name
      agentTypeForm.thumbnail = fileName
    }

    const setNextActionOrNull = (agent) => {
      // check for state transitions and set next action if complete
      for (let i = 0; i < agent.currentAction.transitions.length; i++) {
        const result = agent.currentAction.transitions[i].condition.evaluate()
        if (result === true) {
          const nextAction = agent.currentAction.transitions[i].nextAction
          setDynamicActionTargetAgents(nextAction)
          agent.currentAction = ActionHandler.clone(nextAction, agent)
          return
        }
      }
      // no further action if no transitions
      agent.currentAction = null
    }

    /* ANIMATE */

    const animate = () => {

      store.hover = null

      c.fillStyle = backgroundColor
      c.fillRect(0, 0, canvas.width, canvas.height)

      const animationId = requestAnimationFrame(animate)
      store.GlobalSettings.animationFrameId = animationId

      const agentTypeNames = Object.keys(store.agentItems)

      // update each agent of each agent type
      agentTypeNames.forEach(agentTypeName => {
        store.agentItems[agentTypeName].forEach(agent => {
          agent.update(c, {}, store.GlobalSettings)

          let emissions = {agentsToDelete: [], agentsToSpawn: []}

          if (agent.currentAction) {
            const handlerClass = ACTION_HANDLERS[agent.currentAction.actionType]
            const handler = new handlerClass()
            if (handler.defaultCompletionCheckPasses(agent.currentAction) === true) {
              setNextActionOrNull(agent)
            }

            // if unstarted Action in action list, start it; if already doing action, check if complete
            if (agent.currentAction) {
              if (agent.currentAction.isComplete === false) {
                if (agent.currentAction.inProgress === true) {
                  // console.log('checking')
                  const handlerClass = ACTION_HANDLERS[agent.currentAction.actionType]
                  const handler = new handlerClass()
                  handler.check(agent.currentAction, agent.stateData, store.GlobalSettings)
                } else {
                  agent.currentAction.inProgress = true
                  const handlerClass = ACTION_HANDLERS[agent.currentAction.actionType]
                  const handler = new handlerClass()
                  const emissionsFromAction = handler.start(agent.currentAction, store.GlobalSettings) // globals = {}?
                  if (emissionsFromAction) {
                    if (emissionsFromAction.agentsToDelete) {
                      emissions.agentsToDelete = emissions.agentsToDelete.concat(emissionsFromAction.agentsToDelete)
                    }
                    if (emissionsFromAction.agentsToSpawn) {
                      emissions.agentsToSpawn = emissions.agentsToSpawn.concat(emissionsFromAction.agentsToSpawn)
                    }
                  }
                }
              }
            }
          }

          // go into 'idle' mode if no more actions
          if (agent.currentAction === null && agent.currentStateName !== 'idle') {
            agent.idle()
          }

          if (emissions) {
            if (emissions.agentsToDelete?.length > 0) {
              emissions.agentsToDelete.forEach(agent => {
                const agentType = agent.agentType
                const items = store.agentItems[agentType]
                const item = items.find(ag => ag.name === agent.name)
                item.labelElement.remove()
                items.splice(items.indexOf(item), 1)
              })
            }
            if (emissions.agentsToSpawn?.length > 0) {
              emissions.agentsToSpawn.forEach(args => {
                const agentType = args.agentType

                let newAgent = createAgentObject(
                  agentType,  // agentTypeName
                  args.position,  // position
                  store.agentItems[agentType].length + 1,  // num
                  store.GlobalSettings,  // globals
                  store.agentTypes[agentType].config  // config
                )
                const handler = new AgentHandler()
                handler.useSpritesheet(newAgent)

                store.agentItems[agentType].push(newAgent)
              })
            }
          }

          const isInArea = pointIsInArea(store.mouse, agent.collisionArea)
          if (isInArea) store.hover = true
        })
      })
      
      store.itemMenu.update(c, store.agentMenuButtons.length + 1)

      store.agentMenuButtons.forEach((button, i) => {
        button.update(c, i)
        const isInArea = pointIsInArea(store.mouse, button.area)
        if (isInArea) store.hover = true
      })

      if (store.agentPreview) store.agentPreview.update(c, store.mouse)

      if (pointIsInArea(store.mouse, store.deleteButton.area)) store.hover = true

      if (store.selectionMode === true) store.hover = true

      store.deleteButton.update(c, store.agentMenuButtons.length, store.deleteMode)

      canvas.style.cursor = store.hover ? 'pointer' : 'auto'

      if (animationId % dayLength === 0) endDay()

      if (store.GlobalSettings.animationFrameId % 32 === 0) {
        const customerActions = store.agentItems['customer'].map(cust =>
          `${cust.name}, action: ${cust.currentAction ? cust.currentAction.actionName : 'none'}`
        )
        console.log(JSON.stringify(customerActions, null, 2))
      }
    }

    const selectOrDeleteAgent = (agentTypeName, point) => {
      const agentItems = store.agentItems[agentTypeName]
      agentItems.forEach((agent, i) => {
        const isInArea = pointIsInArea(point, agent.collisionArea)

        // SELECT AGENT
        if (isInArea) {
          store.selectedAgent = agent
          store.hover = true

          if (store.selectionMode === true) {
            store.selectedTargetAgent = agent
            // to fix/update
            // actionsSection.adding.forms.goTo.target = store.selectedTargetAgent
          }
        }
        // DELETE AGENT (in delete mode)
        if (isInArea && store.deleteMode === true) {
          const agent = agentItems[i]
          agent.labelElement.remove()
          agentItems.splice(i, 1)
        }
      })
    }

    const setDynamicActionTargetAgents = (action) => {
      /*
      Some target agent/s need to be set dynamically according to criteria that can
      only be determined when the action starts:
      - nearest agent: dynamic
      - specific agent: not dynamic
      - all agents: dynamic (number could change between creating action and starting it)

      Note: this may not be generalisable enough - to re-organise?
      */

      if (action.args.agentChoiceMethod === 'nearest' && action.args.destinationType === 'agent') {
        const agentTypeName = action.args.agentType
        const agentItems = store.agentItems[agentTypeName]
        const targetAgent = store.selectedAgent.getClosestAgent(agentItems)
        action.args.target = targetAgent
      } else if (action.args.agentChoiceMethod === 'all') {
        const agentTypeName = action.args.agentType
        const agentItems = store.agentItems[agentTypeName]
        action.args.target = agentItems
      }

      // if action involves property changes, set target for each change based on
      // agentChoiceMethod ('nearest' etc)
      if (action.actionType === 'change') {
        action.propertyChanges.forEach(change => {
          if (change.args.agentType !== 'self') {
            if (change.args.agentChoiceMethod === 'nearest') {
              const agentTypeName = change.args.agentType
              const agentItems = store.agentItems[agentTypeName]
              const targetAgent = store.selectedAgent.getClosestAgent(agentItems)
              change.target = targetAgent
            } else if (change.args.agentChoiceMethod === 'all') {
              const agentTypeName = change.args.agentType
              const agentItems = store.agentItems[agentTypeName]
              change.target = agentItems
            }
          }
        })
      }
    }

    const cloneAction = (action) => {
      setDynamicActionTargetAgents(action)
      let actionHandler = new ActionHandler()
      store.selectedAgent.currentAction = actionHandler.clone(action, store.selectedAgent)
    }

    const addAgent = (agentTypeName) => {
      const agentItems = store.agentItems[agentTypeName]
      const num = agentItems.length + 1
      let newAgent = createAgentObject(
        agentTypeName,
        {
          x: store.mouse.x - store.agentTypes[agentTypeName].config.width / 2,
          y: store.mouse.y - store.agentTypes[agentTypeName].config.height / 2
        },
        num,
        store.GlobalSettings,
        store.agentTypes[agentTypeName].config.offset,
        store.agentTypes[agentTypeName].config.scale,
        store.agentTypes[agentTypeName].config
      )
      const handler = new AgentHandler()
      handler.useSpritesheet(newAgent)
      agentItems.push(newAgent)
    }

    const endDay = () => {
      store.dayNumber += 1
    }

    onMounted(() => {

      canvas = document.querySelector('canvas')
      c = canvas.getContext('2d')

      canvas.width = 1000
      canvas.height = 600

      c.fillStyle = backgroundColor
      c.fillRect(0, 0, canvas.width, canvas.height)

      loadAgentsAndFixtures()

      animate()

      /* --- CLICK ACTIONS / EVENT LISTENERS --- */

      canvas.addEventListener('mousemove', (event) => {
        store.mouse.x = event.pageX
        store.mouse.y = event.pageY
      })

      canvas.addEventListener('click', (event) => {
        const point = {x: event.x, y: event.y}

        // PLACE NEW AGENT ON
        if (store.placingAgent) {
          const isInMenuArea = pointIsInArea(point, store.itemMenu.area)

          if (isInMenuArea === false) {
            const agentClassName = store.agentPreview.agentType.name
            addAgent(agentClassName)
            store.placingAgent = false
            store.agentPreview = null
          } else {
            store.hover = true
          }
        }

        const agentTypeNames = Object.keys(store.agentTypes)

        agentTypeNames.forEach(agentTypeName => selectOrDeleteAgent(agentTypeName, point))

        // SELECT AGENT BUTTON TO CREATE CURSOR PREVIEW (to place new agent on board)
        for (let i = 0; i < store.agentMenuButtons.length; i++) {

          const isInArea = pointIsInArea(point, store.agentMenuButtons[i].area)

          if (isInArea) store.hover = 'true'

          if (isInArea && !store.agentPreview) {
            const agentTypeName = store.agentMenuButtons[i].name
            store.agentPreview = new AgentPreview(store.agentTypes[agentTypeName])
            store.placingAgent = true
            break

          } else if (isInArea && store.agentPreview) {
            // if have active agent preview (tracking cursor), clicking on the agent menu again cancels the selection
            store.placingAgent = false
            store.agentPreview = null
          }
        }

        // TOGGLE DELETE MODE
        const isInArea = pointIsInArea(point, store.deleteButton.area)

        if (isInArea) {
          store.hover = true
          store.deleteMode = !store.deleteMode
        }

        // POINT/AGENT SELECTION MODE
        if (store.selectionMode === true) {
          store.selectedPoint = {
            x: store.mouse.x,
            y: store.mouse.y
          }
        }

      })

      document.addEventListener('keydown', (e) => {
        if (e.code === 'Escape' && store.placingAgent === true) {
          store.placingAgent = false
          store.agentPreview = null
        }
      })
    })

    return {
      store,
      deleteCondition,
      conditionReadableFormat,
      updateThumbnailFileInput,
      cloneAction
    }
  },

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
