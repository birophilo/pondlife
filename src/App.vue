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
        <div v-if="isEditingDefaultInterval">
          Default time interval:<br />
          name: <input v-model="defaultInterval.name" type="text" />
          frames per interval: <input v-model="defaultInterval.frames" type="number" />
        </div>
        <div v-else>
          <div>{{ defaultInterval.name }}: <span id="day-number">{{ store.dayNumber }}</span></div>
          <button @click="isEditingDefaultInterval = true">edit</button>
        </div>
      </div>

      <div class="speed-slide-container">
        <div>
          <span>speed: {{ store.GlobalSettings.globalSpeed / 100 }}</span>
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
        current action: {{ store.selectedAgent.currentStateName }}<br/>
        current state name: {{ store.selectedAgent.currentAction?.actionName }}<br/><br/>
        <span v-for="prop in Object.entries(store.selectedAgent.stateData)">
          {{ prop[0] }}: {{ prop[1] }}<br/>
        </span>
      </div>
      <div v-else>none</div>
    </details>

    <details class="menu-section" id="agent-types-section">
      <summary class="menu-section-heading">Agent Types</summary>
      <div v-for="(agentType) in store.agentTypes" class="agent-type-menu-container">
        <AgentTypeEdit :agentType="agentType" />
        <AgentTypeFirstActionEdit :agentType="agentType" />
      </div>
      <AgentTypeCreate />
      <button @click="loadAgentTypesModal">load agent type</button>
    </details>

    <details class="menu-section" id="sprite-sheets-section">
      <summary>Sprites</summary>
      <h3 class="menu-section-heading">Sprite Sheets</h3>
      <div v-for="(spriteSheet, index) in store.spriteSheets">
        <SpriteSheetEdit :spriteSheet="spriteSheet" :i="index" />
      </div>
      <SpriteSheetCreate />

      <div class="agent-type-menu-container"></div>
      <h3 class="menu-section-heading">Animation Sets</h3>
      <div v-for="(animationSet, index) in store.animationSets">
        <AnimationSetEdit :animationSet="animationSet" :i="index" />
      </div>
      <AnimationSetCreate />
    </details>

    <details class="menu-section" id="properties-section">
      <summary class="menu-section-heading">Properties</summary>
      <div v-if="store.selectedAgent !== null" class="item-list">
        <PropertyEdit :agentProperties="store.selectedAgent.stateData"/>
        <SetPropertyForm />
      </div>
    </details>

    <details class="menu-section" id="agent-properties-section">
      <summary class="menu-section-heading">Agent Properties</summary>
      <div v-for="(agentProperty, i) in store.agentProperties" class="item-list">
        <AgentInitialPropertyEdit :agentProperty="agentProperty" :index="i" />
      </div>
      <AgentPropertyCreate />
    </details>

    <details class="menu-section" id="actions-section">
      <summary class="menu-section-heading">Actions</summary>
      <div class="item-list">
        <div v-for="action in store.actions" class="created-item">
          {{ action.id }}
          <ActionEdit :action="action"/>
        </div>
        <ActionCreate />
      </div>
    </details>

    <details class="menu-section" id="start-actions-section" :open="store.actions.length > 0">
      <summary class="menu-section-heading">Start action</summary>
      <div v-if="store.actions.length > 0">
        <div v-for="action in store.actions">
          <button @click="cloneAction(action, store.selectedAgent)">{{ action.actionName }}</button>
        </div>
      </div>
      <div v-else>
        no actions yet
      </div>
    </details>

    <details class="menu-section" id="conditions-section">
      <summary class="menu-section-heading">Conditions</summary>
      <div class="item-list">
        <div v-for="(item, index) in store.conditions" class="created-item">
          <ConditionEdit :item="item" :index="index" />
        </div>
      </div>
      <ConditionCreate />
    </details>

    <details class="menu-section" id="sensors-section">
      <summary class="menu-section-heading">Sensors</summary>
      <div class="item-list">
        <div v-for="(sensor, index) in store.sensors" class="created-item">
          <SensorEdit :sensor="sensor" :i="index" />
        </div>
      </div>
      <SensorCreate />
    </details>

    <details class="menu-section" id="utility-functions-section">
      <summary class="menu-section-heading">Utility Functions</summary>
      <div class="item-list">
        <div v-for="(utilityFunction, index) in store.agentUtilityFunctions" class="created-item">
          <UtilityFunctionEdit :utilityFunction="utilityFunction" :i="index" />
        </div>
      </div>
      <!-- <UtilityFunctionCreateForm /> -->
    </details>

  </div>
</div>
</template>


<script>
import { onMounted, ref } from 'vue'
import { useStore } from '@/store/mainStore.js'

import { pointIsInArea, rectanglesOverlap, generateFakeIdString } from '@/utils.js'
import { createAgentObject, AgentHandler } from '@/classes/Agent.js'
import { ConditionHandler } from '@/classes/Condition.js'
import { AgentMenu, AgentMenuIcon, DeleteButton, AgentPreview } from '@/classes/SelectionMenu.js'
import {
  ActionHandler,
  ActionGoToHandler,
  ActionPropertyChangesHandler,
  ActionIntervalHandler,
  ActionSpawnAgentHandler,
  ActionRemoveAgentHandler,
} from '@/classes/Action.js'
import api from '@/apiCrud.js'
import SceneMenu from '@/components/SceneMenu.vue'
import AgentTypeCreate from '@/components/simUiForms/AgentTypeCreate.vue'
import AgentTypeEdit from '@/components/simUiForms/AgentTypeEdit.vue'
import SetPropertyForm from '@/components/simUiForms/SetPropertyForm.vue'
import PropertyEdit from '@/components/simUiForms/PropertyEdit.vue'
import ActionCreate from '@/components/simUiForms/ActionCreate.vue'
import ActionEdit from '@/components/simUiForms/ActionEdit.vue'
import ConditionCreate from '@/components/simUiForms/ConditionCreate.vue'
import ConditionEdit from '@/components/simUiForms/ConditionEdit.vue'
import SpriteSheetCreate from '@/components/simUiForms/SpriteSheetCreate.vue'
import SpriteSheetEdit from '@/components/simUiForms/SpriteSheetEdit.vue'
import AnimationSetCreate from '@/components/simUiForms/AnimationSetCreate.vue'
import AnimationSetEdit from '@/components/simUiForms/AnimationSetEdit.vue'
import AgentPropertyCreate from '@/components/simUiForms/AgentPropertyCreate.vue'
import AgentInitialPropertyEdit from '@/components/simUiForms/AgentInitialPropertyEdit.vue'
import ModalLoadObject from '@/components/ModalLoadObject.vue'
import AgentTypeFirstActionEdit from '@/components/simUiForms/AgentTypeFirstActionEdit.vue'
import NavTopLogin from '@/components/NavTopLogin.vue'
import SensorCreate from '@/components/simUiForms/SensorCreate.vue'
import SensorEdit from '@/components/simUiForms/SensorEdit.vue'
import UtilityFunctionEdit from './components/simUiForms/UtilityFunctionEdit.vue'
// import UtilityFunctionCreate from './components/UtilityFunctionCreate.vue'
import UTILITY_FUNCS from './UTILITY_FUNCS.js'


let canvas;
let c;  // canvas context

let dayLength = 1000 // frames
const backgroundColor = 'rgb(220, 220, 220)'

const UPDATE_AGENT_KNOWLEDGE_EVERY_X_FRAMES = 10

export default {
  name: 'App',
  components: {
    SceneMenu,
    AgentTypeCreate,
    AgentTypeEdit,
    SetPropertyForm,
    PropertyEdit,
    ActionCreate,
    ActionEdit,
    ConditionCreate,
    ConditionEdit,
    SpriteSheetEdit,
    SpriteSheetCreate,
    AnimationSetEdit,
    AnimationSetCreate,
    AgentPropertyCreate,
    AgentInitialPropertyEdit,
    ModalLoadObject,
    AgentTypeFirstActionEdit,
    NavTopLogin,
    SensorCreate,
    SensorEdit,
    UtilityFunctionEdit,
    // UtilityFunctionCreate
  },
  setup() {
    const store = useStore()

    const sceneName = ref('')

    const saveScene = async (sceneId) => {
      await store.saveScene(sceneId)
    }

    const showSceneMenu = () => {
      store.displaySceneMenu = true
    }

    const isEditingDefaultInterval = ref(false)
    const defaultInterval = {
      name: "day",
      frames: 1000
    }

    const agentHandler = new AgentHandler()
    // for non-action specific base action methods
    const actionHandler = new ActionHandler()
    const actionHandlers = {
      'goTo': new ActionGoToHandler(),
      'change': new ActionPropertyChangesHandler(),
      'interval': new ActionIntervalHandler(),
      'spawnAgent': new ActionSpawnAgentHandler(),
      'removeAgent': new ActionRemoveAgentHandler()
    }
    const conditionHandler = new ConditionHandler()

    const loadAgentsAndFixtures = () => {

      for (let condition of store.sceneData.conditions) {
        let newCondition = {...condition}
        newCondition.agent = null
        store.conditions.push(newCondition)
      }

      // populate spriteSheets and animationSets
      store.animationSets = store.sceneData.animationSets
      store.spriteSheets = store.sceneData.spritesheets

      // replace animationSet spriteSheet ID references with spriteSheet objects
      for (let animSet of store.animationSets) {
        for (let sheet in animSet.sheets) {
          const spriteSheet = store.spriteSheets.find(sh => sh.id === animSet.sheets[sheet])
          animSet.sheets[sheet] = spriteSheet
        }
      }

      store.sensors = [...store.sceneData.sensors]

      for (let agentType of store.sceneData.agentTypes) {
        store.agentTypes[agentType.name] = agentType
      }

      for (let agentTypeName of Object.keys(store.agentTypes)) {
        const animationSetId = store.agentTypes[agentTypeName].animationSet
        const animationSet = store.animationSets.find(a => a.id === animationSetId)
        store.agentTypes[agentTypeName].animationSet = animationSet
      }

      // populate agents from initial data
      for (let agentTypeName of Object.keys(store.agentTypes)) {
        console.log(agentTypeName)
        store.agentItems[agentTypeName] = []
        if (store.sceneData.agentInstances[agentTypeName] !== undefined) {
          for (let i = 0; i < store.sceneData.agentInstances[agentTypeName].length; i++) {

            const item = store.sceneData.agentInstances[agentTypeName][i]

            let newAgent = createAgentObject(
              item.id,
              store.agentTypes[agentTypeName],  // agentType object
              {x: item.position.x, y: item.position.y},  // position
              i + 1,  // num
              store.GlobalSettings, // globals
            )

            store.agentItems[agentTypeName].push(newAgent)
            agentHandler.useSpriteSheet('idle', newAgent)
          }
        }
      }

      store.firstActions = {...store.sceneData.firstActions}
      store.agentProperties = [...store.sceneData.agentProperties]
      store.propertyChanges = [...store.sceneData.propertyChanges]
      store.agentUtilityFunctions = [...store.sceneData.utilityFunctions]

      console.log(store.sceneData.recurringChanges)

      for (let change of store.sceneData.recurringChanges) {
        if (store.recurringChanges[change.frameInterval] == undefined) {
          store.recurringChanges[change.frameInterval] = [
            {
              agentType: change.agentType,
              property: change.property,
              change: change.change
            }
          ]
        } else {
          store.recurringChanges[change.frameInterval].concat[
            {
              agentType: change.agentType,
              property: change.property,
              change: change.change
            }
          ]
        }
      }

      // set initial properties, for each agent, of each agent type, for each property
      for (let property of store.agentProperties) {

        for (let agentTypeName of property.agentTypes) {
          // set initial property values for each agent
          const agentItems = store.agentItems[agentTypeName]
          for (let agent of agentItems) {
            agent.stateData[property.name] = property.initialValue
          }

          // add properties to agentType model (this currently only in memory, not a DB field)
          if (!store.agentTypes[agentTypeName].properties) {
            store.agentTypes[agentTypeName].properties = []
          }
          store.agentTypes[agentTypeName].properties.push(property.name)
        }
      }

      // populate actions
      store.actions = [...store.sceneData.actions]

      store.itemMenu = new AgentMenu()

      const agentTypeButtonNames = Object.keys(store.agentTypes).filter(name => name !== 'world')

      for (let i = 0; i < agentTypeButtonNames.length; i++) {
        const agentName = agentTypeButtonNames[i]
        store.agentMenuButtons.push(
          new AgentMenuIcon({
            menu: store.itemMenu,
            i: i,
            name: agentName,
            agentType: store.agentTypes[agentName]
          })
        )
      }

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
      await store.fetchSceneData(scene.id)
      loadAgentsAndFixtures()
      renderAgents('draw')
      // animate()
    }

    const createScene = async (sceneName) => {
      const newScene = await api.createScene({ name: sceneName })
      loadScene(newScene)
    }

    const setNextAction = (agent) => {
      // check for state transitions and set next action if complete
      for (let transition of agent.currentAction.transitions) {

        const condition = store.conditions.find(cond => cond.id === transition.condition)
        const result = conditionHandler.evaluateCondition(condition, agent, store)

        if (result === true) {
          const nextAction = store.actions.find(action => action.id === transition.nextAction)
          const ok = setDynamicActionTargetAgents(nextAction, agent, agent.currentAction)
          if (ok) {
            agent.currentAction = actionHandler.clone(nextAction, agent)
          }
          return
        }
      }
      // no further action if no transitions
      agent.currentAction = null
    }

    const renderAgents = (drawOrUpdate) => {

      let ySortArray = []

      // sort all agents by position.y value
      for (let agentTypeName of Object.keys(store.agentItems)) {
         ySortArray = ySortArray.concat(store.agentItems[agentTypeName])
      }
      ySortArray.sort((a, b) => a.position.y - b.position.y);

      // paint agent on canvas
      for (let agent of ySortArray) {
        if (drawOrUpdate === 'draw') {
          agentHandler.draw(c, agent)
        } else {
          agentHandler.update(c, {}, store.GlobalSettings, agent)
        }
      }
    }

    const chooseNextActionByUtility = (agent) => {

      // utility functions currently specific to agent type
      const utilityFunctionsForAgent = store.agentUtilityFunctions.filter(uf => uf.agentType === agent.agentType.name)

      var highestScore = 0
      var highestScoreActionId = null

      for (let option of utilityFunctionsForAgent) {
        var score = calculateActionUtility(agent, option.property, UTILITY_FUNCS[option.func])
        if (score > highestScore) {
          highestScore = score
          highestScoreActionId = option.actionId
        }
      }

      return highestScoreActionId
    }

    function calculateActionUtility(agent, property, func) {
      const propValue = agent.stateData[property]
      const utilityScore = func(propValue)
      return utilityScore
    }

    const applyScheduledEffects = (frameId) => {
      for (let [frameInterval, effectArray] of Object.entries(store.recurringChanges)) {
        if (frameId % frameInterval == 0) {
          for (let effect of effectArray) {
            for (let agent of store.agentItems[effect.agentType]) {
              agent.stateData[effect.property] += effect.change
            }
          }
        }
      }
    }

    /* ANIMATE */

    const animate = () => {

      let frameId

      if (store.sceneIsPaused === true) {
        frameId = requestAnimationFrame(() => console.log("PAUSED"))
      } else {
        frameId = requestAnimationFrame(animate)
      }

      store.hover = null

      c.fillStyle = backgroundColor
      c.fillRect(0, 0, canvas.width, canvas.height)

      store.GlobalSettings.animationFrameId = frameId

      // update agent knowledge via sensory input
      for (let agentTypeName of Object.keys(store.agentItems)) {
        for (let agent of store.agentItems[agentTypeName]) {
          if (frameId % UPDATE_AGENT_KNOWLEDGE_EVERY_X_FRAMES === 0) {
            updateAgentKnowledge(agent)
            // if (frameId % 60 === 0) {
            //   console.log(agent.knowledge)
            // }
          }
        }
      }

      // apply time-based/frame-based property updates
      applyScheduledEffects(frameId)

      // update agent state and draw sprites on board
      renderAgents('update')

      let emissions = {agentsToDelete: [], agentsToSpawn: []}

      for (let agentTypeName of Object.keys(store.agentTypes)) {

        for (let agent of store.agentItems[agentTypeName]) {

          // utility system
          if (agent.agentType.name === 'customer') {
            if (agent.currentStateName === 'idle' || agent.currentAction === null) {
              const nextActionId = chooseNextActionByUtility(agent)
              if (nextActionId !== null) {
                const action = store.actions.find(action => action.id === nextActionId)
                cloneAction(action, agent)
              } else {
                agentHandler.idle(agent)
              }

            }
          }

          // set agent action
          if (agent.currentAction) {
            const handler = actionHandlers[agent.currentAction.actionType]
            if (handler.defaultCompletionCheckPasses(agent.currentAction, agentHandler) === true) {
              setNextAction(agent)
            }

            // start and check actions
            // if unstarted Action in action list, start it; if already doing action, check if complete
            if (agent.currentAction && agent.currentAction.isComplete === false) {

              const handler = actionHandlers[agent.currentAction.actionType]

              if (agent.currentAction.inProgress === false) {

                agent.currentAction.inProgress = true
                const emissionsFromAction = handler.start(
                  agent.currentAction,
                  store.GlobalSettings,
                  agentHandler,
                  store
                )

                if (emissionsFromAction) {
                  if (emissionsFromAction.agentsToDelete) {
                    emissions.agentsToDelete = emissions.agentsToDelete.concat(emissionsFromAction.agentsToDelete)
                  }
                  if (emissionsFromAction.agentsToSpawn) {
                    emissions.agentsToSpawn = emissions.agentsToSpawn.concat(emissionsFromAction.agentsToSpawn)
                  }
                }

              } else {

                handler.check(
                  agent.currentAction,
                  agent.stateData,
                  store.GlobalSettings,
                  agentHandler
                )

              }
            }
          }

          // go into 'idle' mode if no more actions
          if (agent.currentAction === null && agent.currentStateName !== 'idle') {
            agentHandler.idle(agent)
          }

          // move this?
          const isInArea = pointIsInArea(store.mouse, agent.collisionArea)
          if (isInArea) store.hover = true

        }
      }

      handleEmissions(emissions)

      store.itemMenu.update(c, store.agentMenuButtons.length + 1)

      for (let i = 0; i < store.agentMenuButtons.length; i++) {
        const button = store.agentMenuButtons[i]
        button.update(c, i)
        const isInArea = pointIsInArea(store.mouse, button.area)
        if (isInArea) store.hover = true
      }

      if (store.agentPreview) store.agentPreview.update(c, store.mouse)

      if (pointIsInArea(store.mouse, store.deleteButton.area)) store.hover = true

      if (store.selectionMode === true) store.hover = true

      store.deleteButton.update(c, store.agentMenuButtons.length, store.deleteMode)

      canvas.style.cursor = store.hover ? 'pointer' : 'auto'

      if (frameId % dayLength === 0) endDay()

      // if (store.GlobalSettings.animationFrameId % 32 === 0) {
      //   const customerActions = store.agentItems['customer'].map(cust =>
      //     `${cust.name}, action: ${cust.currentAction ? cust.currentAction.actionName : 'none'}`
      //   )
      //   console.log(JSON.stringify(customerActions, null, 2))
      // }
    }

    const selectOrDeleteAgent = (agentTypeName, point) => {
      const agentItems = store.agentItems[agentTypeName]
      for (let i = 0; i < agentItems.length; i++) {
        const agent = agentItems[i]
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
      }
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
      agentHandler.useSpriteSheet('idle', newAgent)

      // do not save agents created or deleted during scene runtime, i.e. scene will revert
      // to setup positions once finish playing.
      if (store.sceneIsPlaying !== true) {
        const newItem = await api.createAgent({agentType: agentTypeName, position: position})
        newAgent.id = newItem.id
        agentItems.push(newAgent)
        await store.saveScene()
      }
      // if scene is playing, don't call API; use dummy ID and don't save
      // created/deleted/updated to database.
      else {
        newAgent.id = generateFakeIdString()
        agentItems.push(newAgent)
      }
    }

    const deleteAgent = async (agent, agentItems, i) => {
      // do not save agents created or deleted during scene runtime, i.e. scene will revert
      // to setup positions once finish playing.
      if (store.sceneIsPlaying !== true) {
        await api.deleteAgent(agent.id)
        agentItems.splice(i, 1)
        await store.saveScene()
      }
      // if scene is playing, don't call API
      else {
        agentItems.splice(i, 1)
      }
    }

    const handleEmissions = (emissions) => {

      const areAgentsToCreate = emissions.agentsToSpawn?.length > 0
      const areAgentsToDelete = emissions.agentsToDelete?.length > 0

      if (areAgentsToDelete) {
        for (let agent of emissions.agentsToDelete) {
          const agentTypeName = agent.agentType.name
          const agentItems = store.agentItems[agentTypeName]
          const agentToDelete = agentItems.find(ag => ag.id === agent.id)
          const i = agentItems.indexOf(agentToDelete)
          deleteAgent(agentToDelete, agentItems, i)
        }
      }
      if (areAgentsToCreate) {
        for (let args of emissions.agentsToSpawn) {
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
        }
      }
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
        // get agents excluding self
        const agentItems = store.agentItems[agentTypeName].filter(ag => ag.id !== agent.id)

        if (agentItems.length === 0) {
          console.log(`No ${agentTypeName} exists - cannot choose nearest.`)
          agentHandler.idle(agent)
          return false
        }

        const targetAgent = agentHandler.getClosestAgent(agent, agentItems)

        action.target = targetAgent
        action.destination = targetAgent

      } else if (action.agentChoiceMethod === 'all') {
        action.target = store.agentItems[action.agentType.name]
      }

      if (action.agentChoiceMethod === 'random' && action.destinationType === 'agent') {

        const agentTypeName = action.agentType.name
        // get agents excluding self
        const agentItems = store.agentItems[agentTypeName].filter(ag => ag.id !== agent.id)

        if (agentItems.length === 0) {
          console.log(`No ${agentTypeName} exists - cannot choose random.`)
          agentHandler.idle(agent)
          return false
        }

        const targetAgent = agentHandler.getRandomAgent(agentItems)
        action.target = targetAgent
        action.destination = targetAgent

      }

      // if action involves property changes, set target for each change based on
      // agentChoiceMethod ('nearest' etc)
      if (action.actionType === 'change') {

        const changeObjs = store.propertyChanges.filter(ch => action.propertyChanges.includes(ch.id))

        for (let change of changeObjs) {
          if (change.agentType !== 'self') {
            if (change.agentChoiceMethod === 'nearest') {
              const agentItems = store.agentItems[change.agentType]
              const targetAgent = agentHandler.getClosestAgent(agent, agentItems)
              change.target = targetAgent
            } else if (change.agentChoiceMethod === 'all') {
              change.target = store.agentItems[change.agentType]
            }
          }
        }
      }

      if (action.actionType === 'interval' && lastAction) {
        action.target = lastAction.target
      }

      if (action.actionType === 'removeAgent') {
        if (action.agentType === 'currentTarget' && lastAction) {
          action.target = lastAction.target
        }

        else if (action.agentType !== 'self') {
          if (action.agentChoiceMethod === 'nearest') {
            const targetAgents = store.agentItems[action.agentType.name]
            const targetAgent = agentHandler.getClosestAgent(agent, targetAgents)
            action.target = targetAgent
          } else if (action.agentChoiceMethod === 'all') {
            action.target = store.agentItems[action.agentType.name]
          }
        }
      }

      return true  // 'ok' used by outer function, circuit breaker if not
    }

    const cloneAction = (action, agent) => {
      const ok = setDynamicActionTargetAgents(action, agent)
      if (ok) {
        // const handler = actionHandlers[action.actionType]
        agent.currentAction = actionHandler.clone(action, agent)
      }

    }

    const playScene = () => {

      store.sceneIsPlaying = true
      store.sceneIsPaused = false

      for (let atName of Object.keys(store.agentTypes)) {
        const firstActionId = store.firstActions[atName]
        if (firstActionId) {
          const action = store.actions.find(a => a.id === firstActionId)

          if (action === undefined) {
            throw "Play scene: Can't find action"
          }

          for (let agent of store.agentItems[atName]) {
            cloneAction(action, agent)
          }
        }
      }

      animate()
    }

    const pauseScene = () => {
      store.sceneIsPlaying = false
      store.sceneIsPaused = true
    }

    const unPauseScene = () => {
      store.sceneIsPlaying = true
      store.sceneIsPaused = false
      requestAnimationFrame(animate)
    }

    let agentTypeList = ref([])

    const loadAgentTypesModal = async () => {
      store.displayLoadObjectModal = true
      agentTypeList.value = await api.listAgentTypes()
    }

    const updateAgentKnowledge = (agent) => {
      const agentTypeNames = Object.keys(store.agentTypes)

      const sensor = store.sensors.find(sensor => sensor.id === agent.agentType.sensor)
      if (!sensor) return

      const len = sensor.radius
      const vicinityArea = {
        x: agent.center.x - len,
        y: agent.center.y - len,
        width: len * 2,
        height: len * 2
      }

      if (!agent.knowledge) {
        agent.knowledge = {
          vicinity: {
            agents: []
          }
        }
      }

      agent.knowledge.vicinity.agents = []

      for (let agentTypeName of agentTypeNames) {
        for (let ag of store.agentItems[agentTypeName]) {
          const agentArea = {x: ag.position.x, y: ag.position.y, width: ag.width, height: ag.height}
          if (agent.id !== ag.id) {  // don't add own id to vicinity knowledge
            if (rectanglesOverlap(vicinityArea, agentArea)) {
              agent.knowledge.vicinity.agents.push(ag.id)
            }
          }
        }
      }

    }

    const endDay = () => {
      store.dayNumber += 1
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

        for (let agentTypeName of Object.keys(store.agentTypes)) {
          selectOrDeleteAgent(agentTypeName, point)
        }

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
      cloneAction,
      saveScene,
      playScene,
      pauseScene,
      unPauseScene,
      sceneName,
      loadAgentTypesModal,
      agentTypeList,
      isEditingDefaultInterval,
      defaultInterval
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
