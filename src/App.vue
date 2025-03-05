<template>

<NavTopLogin />

<div id="container">

  <div v-show="store.displaySceneMenu" class="scene-menu-modal">
    <SceneMenu @load-scene="loadScene" @create-new-scene="createScene" />
  </div>

  <div v-show="store.displayLoadObjectModal" class="load-object-modal">
    <ModalLoadObject :agentTypeList="agentTypeList" />
  </div>

  <div class="canvas-container">

    <canvas></canvas>

    <div class="scene-heading">
      {{ sceneName }}
    </div>

    <div class="scene-button-container">
      <span v-if="store.sceneIsPlaying">
        <button @click="pauseScene">pause scene</button>
      </span>
      <span v-else-if="store.sceneIsPaused">
        <button @click="unPauseScene">unpause scene</button>
      </span>
      <span v-else>
        <button @click="playScene">play scene</button>
      </span>
      <button @click="saveScene">save scene</button>
      <button @click="showSceneMenu">scene menu</button>
    </div>
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
      <div v-for="(agentType) in store.agentTypes" class="agent-type-menu-container">
        <MenuAgentType :agentType="agentType" />
        <AgentTypeFirstActionMenu :agentType="agentType" />
      </div>
      <CreateAgentTypeForm />
      <button @click="loadAgentTypesModal">load agent type</button>
    </details>

    <details class="menu-section" id="sprite-sheets-section">
      <summary>Sprites</summary>
      <h3 class="menu-section-heading">Sprite Sheets</h3>
      <div v-for="(spriteSheet, index) in store.spriteSheets">
        <MenuSpriteSheet :spriteSheet="spriteSheet" :i="index" />
      </div>
      <SpriteSheetForm />

      <div class="agent-type-menu-container"></div>
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

    <details class="menu-section" id="properties-section">
      <summary class="menu-section-heading">Agent Properties</summary>
      <div v-for="(agentProperty, i) in store.agentProperties" class="item-list">
        <MenuAgentInitialProperty :agentProperty="agentProperty" :index="i" />
      </div>
      <CreateAgentPropertyForm />
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
          <button @click="cloneActionForSelectedAgent(action)">{{ action.actionName }}</button>
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

    <details class="menu-section" id="actions-section">
      <summary class="menu-section-heading">Sensors</summary>
      <div class="item-list">
        <div v-for="(sensor, index) in store.sensors" class="created-item">
          <MenuSensor :sensor="sensor" :i="index" />
        </div>
      </div>
      <SensorCreateForm />
    </details>

  </div>
</div>
</template>


<script>
import { onMounted, ref } from 'vue'
import { useStore } from '@/store/mainStore.js'

import { pointIsInArea } from '@/utils.js'
import { createAgentObject, AgentHandler } from '@/classes/Agent.js'
import { ConditionHandler } from '@/classes/Condition.js'
import { AgentMenu, AgentMenuIcon, DeleteButton, AgentPreview } from '@/classes/SelectionMenu.js'
import { ActionHandler, ACTION_HANDLERS } from '@/classes/Action.js'
import api from '@/apiCrud.js'
import SceneMenu from '@/components/SceneMenu.vue'
import CreateAgentTypeForm from '@/components/CreateAgentTypeForm.vue'
import MenuAgentType from '@/components/MenuAgentType.vue'
import SetPropertyForm from '@/components/SetPropertyForm.vue'
import MenuProperty from '@/components/MenuProperty.vue'
import ActionCreateForm from '@/components/ActionCreateForm.vue'
import MenuAction from '@/components/MenuAction.vue'
import ConditionCreateForm from '@/components/ConditionCreateForm.vue'
import MenuCondition from '@/components/MenuCondition.vue'
import SpriteSheetForm from '@/components/SpriteSheetForm.vue'
import MenuSpriteSheet from '@/components/MenuSpriteSheet.vue'
import AnimationSetForm from '@/components/AnimationSetForm.vue'
import MenuAnimationSet from '@/components/MenuAnimationSet.vue'
import CreateAgentPropertyForm from '@/components/CreateAgentPropertyForm.vue'
import MenuAgentInitialProperty from '@/components/MenuAgentInitialProperty.vue'
import ModalLoadObject from '@/components/ModalLoadObject.vue'
import AgentTypeFirstActionMenu from '@/components/AgentTypeFirstActionMenu.vue'
import NavTopLogin from '@/components/NavTopLogin.vue'
import SensorCreateForm from '@/components/CreateSensorForm.vue'
import MenuSensor from '@/components/MenuSensor.vue'


let canvas;
let c;  // canvas context

let dayLength = 1000 // frames
const backgroundColor = 'rgb(220, 220, 220)'

export default {
  name: 'App',
  components: {
    SceneMenu,
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
    AnimationSetForm,
    CreateAgentPropertyForm,
    MenuAgentInitialProperty,
    ModalLoadObject,
    AgentTypeFirstActionMenu,
    NavTopLogin,
    SensorCreateForm,
    MenuSensor
  },
  setup() {
    const store = useStore()

    const sceneName = ref('')

    const saveScene = async (sceneId) => {
      await store.saveScene(sceneId)
    }

    const showSceneMenu = () => {
      removeAgentLabels()
      store.displaySceneMenu = true
    }

    const loadAgentsAndFixtures = () => {

      store.sceneData.conditions.forEach(condition => {
        let newCondition = {...condition}
        newCondition.agent = null
        store.conditions.push(newCondition)
      })

      // populate spriteSheets and animationSets
      store.animationSets = store.sceneData.animationSets
      store.spriteSheets = store.sceneData.spritesheets

      // replace animationSet spriteSheet ID references with spriteSheet objects
      store.animationSets.forEach(animSet => {
        const sheetNames = Object.keys(animSet.sheets)
        sheetNames.forEach(sheet => {
          const spriteSheet = store.spriteSheets.find(sh => sh.id === animSet.sheets[sheet])
          animSet.sheets[sheet] = spriteSheet
        })
      })

      store.sensors = [...store.sceneData.sensors]

      store.sceneData.agentTypes.forEach(agentType => {
        store.agentTypes[agentType.name] = agentType
      })


      const agentTypeNames = Object.keys(store.agentTypes)

      agentTypeNames.forEach(agentTypeName => {
        const animationSetId = store.agentTypes[agentTypeName].animationSet
        const animationSet = store.animationSets.find(a => a.id === animationSetId)
        store.agentTypes[agentTypeName].animationSet = animationSet
      })

      // populate agents from initial data
      agentTypeNames.forEach(agentTypeName => {
        store.agentItems[agentTypeName] = []
        if (store.sceneData.agentInstances[agentTypeName] !== undefined) {
          store.sceneData.agentInstances[agentTypeName].forEach((item, i) => {

            let newAgent = createAgentObject(
              item.id,
              store.agentTypes[agentTypeName],  // agentType object
              {x: item.position.x, y: item.position.y},  // position
              i + 1,  // num
              store.GlobalSettings, // globals
            )

            store.agentItems[agentTypeName].push(newAgent)

            const handler = new AgentHandler()
            handler.useSpriteSheet('idle', newAgent)
          })
        }

      })

      store.firstActions = {...store.sceneData.firstActions}
      store.agentProperties = [...store.sceneData.agentProperties]
      store.propertyChanges = [...store.sceneData.propertyChanges]

      // set initial properties, for each agent, of each agent type, for each property
      store.agentProperties.forEach(property => {
        const agentTypes = property.agentTypes
        agentTypes.forEach(agentType => {
          const agentItems = store.agentItems[agentType]
          agentItems.forEach(agent => {
            agent.stateData[property.name] = property.initialValue
          })
        })
      })

      // populate actions
      store.actions = [...store.sceneData.actions]

      store.itemMenu = new AgentMenu()

      const agentTypeButtonNames = agentTypeNames.filter(name => name !== 'world')
      agentTypeButtonNames.forEach((agentName, i) => {
        store.agentMenuButtons.push(
          new AgentMenuIcon({
            menu: store.itemMenu,
            i: i,
            name: agentName,
            agentType: store.agentTypes[agentName]
          })
        )
      })
      store.deleteButton = new DeleteButton({
        menu: store.itemMenu,
        i: store.agentMenuButtons.length
      })
    }

    const loadScene = async (scene) => {
      sceneName.value = scene.name
      store.sceneId = scene.id
      store.displaySceneMenu = false
      store.clearAllData()
      removeAgentLabels()
      await store.fetchSceneData(scene.id)
      loadAgentsAndFixtures()
      animate()
    }

    const createScene = async (sceneName) => {
      const newScene = await api.createScene({ name: sceneName })
      loadScene(newScene)
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
      for (let transition of agent.currentAction.transitions) {
        const conditionId = transition.condition
        const condition = store.conditions.find(cond => cond.id === conditionId)
        const conditionHandler = new ConditionHandler()
        const result = conditionHandler.evaluateCondition(condition, agent)
        if (result === true) {
          const nextActionId = transition.nextAction
          const nextAction = store.actions.find(action => action.id === nextActionId)
          const ok = setDynamicActionTargetAgents(nextAction, agent, agent.currentAction)
          if (!ok) return
          let actionHandler = new ActionHandler()
          agent.currentAction = actionHandler.clone(nextAction, agent)
          return
        }
      }
      // no further action if no transitions
      agent.currentAction = null
    }

    const removeAgentLabels = () => {
      const agentLabels = document.getElementsByClassName('canvas-agent-label')
      Array.from(agentLabels).forEach(label => label.remove())
    }

    const agentHandler = new AgentHandler()

    /* ANIMATE */

    const animate = () => {

      let animationId

      if (store.sceneIsPaused === true) {
        animationId = requestAnimationFrame(() => console.log("PAUSED"))
      } else {
        animationId = requestAnimationFrame(animate)
      }

      store.hover = null

      c.fillStyle = backgroundColor
      c.fillRect(0, 0, canvas.width, canvas.height)

      store.GlobalSettings.animationFrameId = animationId

      const agentTypeNames = Object.keys(store.agentItems)

      // update each agent of each agent type
      agentTypeNames.forEach(agentTypeName => {
        store.agentItems[agentTypeName].forEach(agent => {
          agentHandler.update(c, {}, store.GlobalSettings, agent)

          let emissions = {agentsToDelete: [], agentsToSpawn: []}

          if (agent.currentAction) {
            const handlerClass = ACTION_HANDLERS[agent.currentAction.actionType]
            const handler = new handlerClass()
            if (handler.defaultCompletionCheckPasses(agent.currentAction, agentHandler) === true) {
              setNextActionOrNull(agent)
            }

            // if unstarted Action in action list, start it; if already doing action, check if complete
            if (agent.currentAction) {
              if (agent.currentAction.isComplete === false) {
                if (agent.currentAction.inProgress === true) {
                  // console.log('checking')
                  const handlerClass = ACTION_HANDLERS[agent.currentAction.actionType]
                  const handler = new handlerClass()
                  handler.check(
                    agent.currentAction,
                    agent.stateData,
                    store.GlobalSettings,
                    agentHandler
                  )
                } else {
                  agent.currentAction.inProgress = true
                  const handlerClass = ACTION_HANDLERS[agent.currentAction.actionType]
                  const handler = new handlerClass()
                  const emissionsFromAction = handler.start(
                    agent.currentAction,
                    store.GlobalSettings,
                    agentHandler,
                    store
                  ) // globals = {}?
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
            agentHandler.idle(agent)
          }

          if (emissions) {
            if (emissions.agentsToDelete?.length > 0) {
              emissions.agentsToDelete.forEach(agent => {
                const agentTypeName = agent.agentType.name
                const agentItems = store.agentItems[agentTypeName]
                const agentToDelete = agentItems.find(ag => ag.id === agent.id)
                const i = agentItems.indexOf(agentToDelete)
                deleteAgent(agentToDelete, agentItems, i)
              })
            }
            if (emissions.agentsToSpawn?.length > 0) {
              emissions.agentsToSpawn.forEach(args => {
                const agentTypeName = args.agentType.name

                let newAgent = createAgentObject(
                  null,
                  store.agentTypes[agentTypeName],  // agentType
                  args.position,  // position
                  store.agentItems[agentTypeName].length + 1,  // num
                  store.GlobalSettings  // globals
                )
                addAgent(agentTypeName, args.position)
                store.agentItems[agentTypeName].push(newAgent)
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

      // if (store.GlobalSettings.animationFrameId % 32 === 0) {
      //   const customerActions = store.agentItems['customer'].map(cust =>
      //     `${cust.name}, action: ${cust.currentAction ? cust.currentAction.actionName : 'none'}`
      //   )
      //   console.log(JSON.stringify(customerActions, null, 2))
      // }
    }

    const selectOrDeleteAgent = (agentTypeName, point) => {
      const agentItems = store.agentItems[agentTypeName]
      agentItems.forEach((agent, i) => {
        const isInArea = pointIsInArea(point, agent.collisionArea)

        // SELECT AGENT
        if (isInArea) {
          store.selectedAgent = agent
          store.hover = true
          if (store.selectionMode === true) store.selectedTargetAgent = agent
        }
        // DELETE AGENT (in delete mode)
        if (isInArea && store.deleteMode === true) {
          const agent = agentItems[i]
          deleteAgent(agent, agentItems, i)
        }
      })
    }

    const deleteAgent = async (agent, agentItems, i) => {
      agent.labelElement.remove()
      await api.deleteAgent(agent.id)
      agentItems.splice(i, 1)
      await store.saveScene()
    }

    const setDynamicActionTargetAgents = (action, agent, lastAction) => {
      /*
      Some target agent/s need to be set dynamically according to criteria that can
      only be determined when the action starts:
      - nearest agent: dynamic
      - specific agent: not dynamic
      - all agents: dynamic (number could change between creating action and starting it)

      Note: this may not be generalisable enough - to re-organise?
      */

      if (action.agentChoiceMethod === 'nearest' && action.destinationType === 'agent') {
        const agentTypeName = action.agentType.name
        const agentItems = store.agentItems[agentTypeName]
        if (agentItems.length === 0) {
          console.log(`No ${agentTypeName} exists - cannot choose nearest.`)
          agentHandler.idle(agent)
          return false
        }
        const targetAgent = agentHandler.getClosestAgent(agent, agentItems)

        action.target = targetAgent
        action.destination = targetAgent
      } else if (action.agentChoiceMethod === 'all') {
        const agentTypeName = action.agentType.name
        const agentItems = store.agentItems[agentTypeName]
        action.target = agentItems
      }

      // if action involves property changes, set target for each change based on
      // agentChoiceMethod ('nearest' etc)
      if (action.actionType === 'change') {
        const changeObjs = store.propertyChanges.filter(ch => action.propertyChanges.includes(ch.id))

        changeObjs.forEach(change => {
          if (change.agentType !== 'self') {
            if (change.agentChoiceMethod === 'nearest') {
              const agentTypeName = change.agentType
              const agentItems = store.agentItems[agentTypeName]
              const targetAgent = agentHandler.getClosestAgent(agent, agentItems)
              change.target = targetAgent
            } else if (change.agentChoiceMethod === 'all') {
              const agentTypeName = change.agentType
              const agentItems = store.agentItems[agentTypeName]
              change.target = agentItems
            }
          }
        })
      }

      if (action.actionType === 'interval') {
        action.target = lastAction.target
      }

      if (action.actionType === 'removeAgent') {

        if (action.agentType === 'currentTarget') {
          action.target = lastAction.target
        }

        else if (action.agentType !== 'self') {
          if (action.agentChoiceMethod === 'nearest') {
            const agentTypeName = action.agentType.name
            const targetAgents = store.agentItems[agentTypeName]
            const targetAgent = agentHandler.getClosestAgent(agent, targetAgents)
            action.target = targetAgent
          } else if (action.agentChoiceMethod === 'all') {
            const agentTypeName = action.agentType.name
            const agentItems = store.agentItems[agentTypeName]
            action.target = agentItems
          }
        }
      }
      return true  // 'ok' used by outer function, circuit breaker if not
    }

    const addAgent = async (agentTypeName, position) => {
      const agentItems = store.agentItems[agentTypeName]
      const num = agentItems.length + 1
      let newAgent = createAgentObject(
        null,
        store.agentTypes[agentTypeName],
        position,
        num,
        store.GlobalSettings
      )
      const handler = new AgentHandler()
      handler.useSpriteSheet('idle', newAgent)
      const newItem = await api.createAgent({agentType: agentTypeName, position: position})
      newAgent.id = newItem.id
      agentItems.push(newAgent)
      await store.saveScene()
    }

    const endDay = () => {
      store.dayNumber += 1
    }

    const cloneActionForAgent = (action, agent) => {
      // general clone action
      const ok = setDynamicActionTargetAgents(action, agent)
      if (!ok) return
      const handlerClass = ACTION_HANDLERS[action.actionType]
      const handler = new handlerClass()
      agent.currentAction = handler.clone(action, agent)
    }

    const cloneActionForSelectedAgent = (action) => {
      // this function only used for live trigger via button for selected agent
      const ok = setDynamicActionTargetAgents(action, store.selectedAgent)
      if (!ok) return
      const handlerClass = ACTION_HANDLERS[action.actionType]
      const handler = new handlerClass()
      store.selectedAgent.currentAction = handler.clone(action, store.selectedAgent)
    }

    const playScene = () => {

      store.sceneIsPlaying = true
      store.sceneIsPaused = false

      // eslint-disable-next-line
      Object.keys(store.agentTypes).forEach(atName => {
        const firstActionId = store.firstActions[atName]
        if (firstActionId) {
          const action = store.actions.find(a => a.id === firstActionId)

          if (action === undefined) {
            throw "Play scene: Can't find action"
          }

          store.agentItems[atName].forEach(agent => {
            cloneActionForAgent(action, agent)
          })
        }
      })
    }

    const unPauseScene = () => {
      store.sceneIsPlaying = true
      store.sceneIsPaused = false
      requestAnimationFrame(animate)
    }

    const pauseScene = () => {
      store.sceneIsPlaying = false
      store.sceneIsPaused = true
    }

    let agentTypeList = ref([])

    const loadAgentTypesModal = async () => {
      store.displayLoadObjectModal = true
      agentTypeList.value = await api.listAgentTypes()
    }

    onMounted(() => {

      store.displaySceneMenu = true

      canvas = document.querySelector('canvas')
      c = canvas.getContext('2d')

      canvas.width = 1000
      canvas.height = 600

      c.fillStyle = backgroundColor
      c.fillRect(0, 0, canvas.width, canvas.height)

      /* --- CLICK ACTIONS / EVENT LISTENERS --- */

      canvas.addEventListener('mousemove', (event) => {
        store.mouse.x = event.offsetX
        store.mouse.y = event.offsetY
      })

      canvas.addEventListener('click', (event) => {

        const point = {x: event.offsetX, y: event.offsetY}

        // PLACE NEW AGENT ON BOARD
        if (store.placingAgent) {
          const isInMenuArea = pointIsInArea(point, store.itemMenu.area)

          if (isInMenuArea === false) {
            const agentTypeName = store.agentPreview.agentType.name
            const position = {
              x: store.mouse.x - store.agentTypes[agentTypeName].width / 2,
              y: store.mouse.y - store.agentTypes[agentTypeName].height / 2
            }

            addAgent(agentTypeName, position)

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

      // cancel agent placement mode with Escape button
      document.addEventListener('keydown', (e) => {
        if (e.code === 'Escape' && store.placingAgent === true) {
          store.placingAgent = false
          store.agentPreview = null
        }
      })
    })

    return {
      store,
      loadAgentsAndFixtures,
      loadScene,
      createScene,
      showSceneMenu,
      deleteCondition,
      conditionReadableFormat,
      updateThumbnailFileInput,
      cloneActionForSelectedAgent,
      saveScene,
      playScene,
      pauseScene,
      unPauseScene,
      sceneName,
      loadAgentTypesModal,
      agentTypeList
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

#container {
  position: relative;
  display: flex;
  width: 100%;
  justify-content: left;
}

.scene-menu-modal {
  position: absolute;
  z-index: 2;
  top: 0px;
  left: 0px;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #efeee8;;
}

.load-object-modal {
  position: absolute;
  z-index: 2;
  height: 70%;
  width: 70%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #efeee8;;
}

canvas {
  width: 1000px;
  height: 600px;
  position: relative;
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

.agent-type-menu-container {
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #e8b9ad;
}

.canvas-agent-label {
  position: absolute;
  font-size: 11px;
  color: black;
  z-index: 1;
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
