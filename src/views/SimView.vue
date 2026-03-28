<template>
<!--
  Plan 3 — phase A boundaries (see src/store/mainStore.js for Pinia split):
  • Hot path (→ simRuntime in phase B): canvas + rAF + listeners on canvas ref
  • liveHudHost: empty mount for imperative DOM (phase D); Vue must not put {{ }} inside
  • Slow / Vue: modals, info-container, forms — reactive OK; avoid per-frame store writes
-->

<NavTopLogin />

<div id="container">

  <div v-show="store.displaySceneMenu" class="scene-menu-modal">
    <SceneMenu @load-scene="loadScene" @create-new-scene="createScene" />
  </div>

  <div v-show="store.displayLoadObjectModal" class="load-object-modal">
    <ModalLoadObject :agentTypeList="agentTypeList" />
  </div>

  <div class="canvas-container">

    <canvas ref="canvasRef" />

    <!-- Imperative HUD mount (phase D). Keep empty; sim code will own children. -->
    <div ref="liveHudHost" class="sim-live-hud-host" />

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

      <div class="fps-diagnostics-container">
        <label>
          <input type="checkbox" v-model="showFrameRateDiagnostics" @change="onFrameRateDiagnosticsChange" />
          frame rate diagnostics
        </label>
        <div v-if="showFrameRateDiagnostics" class="fps-readings">
          <div>cumulative avg: {{ cumulativeAverageFps.toFixed(1) }} FPS</div>
          <div>current: {{ currentFps.toFixed(1) }} FPS</div>
        </div>
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
        current action sequence: {{ store.selectedAgent.currentActionSequence?.name }}<br/><br/>
        <span v-for="prop in Object.entries(store.selectedAgent.stateData)" :key="prop[0]">
          {{ prop[0] }}: {{ prop[1] }}<br/>
        </span>
      </div>
      <div v-else>none</div>
    </details>

    <details class="menu-section" id="agent-types-section">
      <summary class="menu-section-heading">Agent Types</summary>
      <div v-for="(agentType, index) in store.agentTypes" :key="index" class="agent-type-menu-container">
        <AgentTypeEdit :agentType="agentType" />
        <AgentTypeFirstActionEdit :agentType="agentType" />
      </div>
      <AgentTypeCreate />
      <button @click="loadAgentTypesModal">load agent type</button>
    </details>

    <details class="menu-section" id="sprite-sheets-section">
      <summary>Sprites</summary>
      <h3 class="menu-section-heading">Sprite Sheets</h3>
      <div v-for="(spriteSheet, index) in store.spriteSheets" :key="index">
        <SpriteSheetEdit :spriteSheet="spriteSheet" :i="index" />
      </div>
      <SpriteSheetCreate />

      <div class="agent-type-menu-container"></div>
      <h3 class="menu-section-heading">Animation Sets</h3>
      <div v-for="(animationSet, index) in store.animationSets" :key="index">
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

    <details class="menu-section" id="recurring-changes-section">
      <summary class="menu-section-heading">Recurring Changes</summary>
      <div v-for="(recurringChange, index) in store.ungroupedRecurringChanges" :key="index">
        <RecurringChangeEdit :recurringChange="recurringChange" :index="index" />
      </div>
      <RecurringChangeCreate />
    </details>

    <details class="menu-section" id="agent-properties-section">
      <summary class="menu-section-heading">Agent Properties</summary>
      <div v-for="(agentProperty, i) in store.agentProperties" :key="i" class="item-list">
        <AgentInitialPropertyEdit :agentProperty="agentProperty" :index="i" />
      </div>
      <AgentPropertyCreate />
    </details>

    <details class="menu-section" id="actions-section">
      <summary class="menu-section-heading">Actions</summary>
      <div class="item-list">
        <div v-for="action in store.actions" :key="action.id" class="created-item">
          {{ action.id }}
          <ActionEdit :action="action"/>
        </div>
        <ActionCreate />
      </div>
    </details>

    <details class="menu-section" id="start-actions-section" :open="store.actions.length > 0">
      <summary class="menu-section-heading">Start action</summary>
      <div v-if="store.actions.length > 0">
        <div v-for="action in store.actions" :key="action.id">
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
        <div v-for="(item, index) in store.conditions" :key="index" class="created-item">
          <ConditionEdit :item="item" :index="index" />
        </div>
      </div>
      <ConditionCreate />
    </details>

    <details class="menu-section" id="sensors-section">
      <summary class="menu-section-heading">Sensors</summary>
      <div class="item-list">
        <div v-for="(sensor, index) in store.sensors" :key="index" class="created-item">
          <SensorEdit :sensor="sensor" :i="index" />
        </div>
      </div>
      <SensorCreate />
    </details>

    <details class="menu-section" id="utility-functions-section">
      <summary class="menu-section-heading">Utility Functions</summary>
      <div class="item-list">
        <div v-for="(utilityFunction, index) in store.agentUtilityFunctions" :key="index" class="created-item">
          <UtilityFunctionEdit :utilityFunction="utilityFunction" :index="index" />
        </div>
      </div>
      <UtilityFunctionCreate />
    </details>

  </div>
</div>

</template>


<script>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useStore } from '@/store/mainStore.js'
import api from '@/apiCrud.js'
import { createSimRuntime } from '@/sim/simRuntime.js'
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
import UtilityFunctionEdit from '@/components/simUiForms/UtilityFunctionEdit.vue'
import UtilityFunctionCreate from '@/components/simUiForms/UtilityFunctionCreate.vue'
import RecurringChangeEdit from '@/components/simUiForms/RecurringChangeEdit.vue'
import RecurringChangeCreate from '@/components/simUiForms/RecurringChangeCreate.vue'

export default {
  name: 'SimView',
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
    UtilityFunctionCreate,
    RecurringChangeEdit,
    RecurringChangeCreate
  },
  setup () {
    const store = useStore()

    const canvasRef = ref(null)
    const liveHudHost = ref(null)
    const sceneName = ref('')

    const showFrameRateDiagnostics = ref(false)
    const cumulativeAverageFps = ref(0)
    const currentFps = ref(0)

    const sim = createSimRuntime({
      store,
      fpsRefs: {
        showFrameRateDiagnostics,
        cumulativeAverageFps,
        currentFps
      }
    })

    const saveScene = async (sceneId) => {
      await store.saveScene(sceneId)
    }

    const showSceneMenu = () => {
      store.displaySceneMenu = true
    }

    const isEditingDefaultInterval = ref(false)
    const defaultInterval = {
      name: 'day',
      frames: 1000
    }

    const onFrameRateDiagnosticsChange = () => {
      if (!showFrameRateDiagnostics.value) {
        sim.resetFpsDiagnostics()
      }
    }

    const loadAgentsAndFixtures = () => {
      sim.loadAgentsAndFixtures()
    }

    const loadScene = async (scene) => {
      sceneName.value = scene.name
      store.sceneId = scene.id
      store.displaySceneMenu = false
      store.clearAllData()
      await store.fetchSceneData(scene.id)
      sim.loadAgentsAndFixtures()
      sim.renderAgents('draw')
    }

    const createScene = async (sceneNameParam) => {
      const newScene = await api.createScene({ name: sceneNameParam })
      loadScene(newScene)
    }

    const agentTypeList = ref([])

    const loadAgentTypesModal = async () => {
      store.displayLoadObjectModal = true
      agentTypeList.value = await api.listAgentTypes()
    }

    onMounted(() => {
      store.displaySceneMenu = true
      sim.attachCanvas(canvasRef.value)
      sim.attachDocumentListeners()
    })

    onBeforeUnmount(() => {
      sim.destroy()
    })

    return {
      store,
      canvasRef,
      liveHudHost,
      loadAgentsAndFixtures,
      loadScene,
      createScene,
      showSceneMenu,
      cloneAction: sim.cloneAction,
      saveScene,
      playScene: sim.playScene,
      pauseScene: sim.pauseScene,
      unPauseScene: sim.unPauseScene,
      sceneName,
      loadAgentTypesModal,
      agentTypeList,
      isEditingDefaultInterval,
      defaultInterval,
      showFrameRateDiagnostics,
      cumulativeAverageFps,
      currentFps,
      onFrameRateDiagnosticsChange
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

/* Phase D: imperative HUD under .sim-live-hud-host; hide empty host */
.sim-live-hud-host:empty {
  display: none;
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