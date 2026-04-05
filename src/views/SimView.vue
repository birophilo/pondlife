<template>
<!--
  Plan 3: keep-alive SimView — onDeactivated suspends (pause + detach input); onActivated resumes listeners.
  True unmount → stopSimRuntime. Phase F: simPointer. Phase E: markRaw.
-->

<NavTopLogin />

<div id="container">

  <div v-show="store.displayLoadObjectModal" class="load-object-modal">
    <ModalLoadObject :agentTypeList="agentTypeList" />
  </div>

  <div class="canvas-container">
    <!-- Always mounted (Phase C); never v-if — simRuntime holds a native element reference. -->
    <canvas ref="canvasRef" />

    <!-- Phase D: empty host; initLiveHud() appends panel; scoped styles do not apply to those nodes — see global block below. -->
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
      <button type="button" @click="goToSimulations">Simulations</button>
    </div>
  </div>

  <div class="info-container">

    <!-- Phase C: imperative top strip + Selected Agent details — initTopMenuStrip() in setup -->
    <div ref="topMenuStripHost" />

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
import { onMounted, onBeforeUnmount, onActivated, onDeactivated, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '@/store/mainStore.js'
import api from '@/apiCrud.js'
import { createSimRuntime } from '@/sim/simRuntime.js'
import { createWorld } from '@/sim/world.js'
import { simPointer } from '@/sim/simPointer.js'
import { initLiveHud } from '@/hud/imperativeHud.js'
import { initTopMenuStrip } from '@/hud/imperativeTopMenuStrip.js'
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
    const router = useRouter()
    const route = useRoute()

    const canvasRef = ref(null)
    const liveHudHost = ref(null)
    const topMenuStripHost = ref(null)
    const sceneName = ref('')

    const showFrameRateDiagnostics = ref(false)
    const cumulativeAverageFps = ref(0)
    const currentFps = ref(0)

    const world = createWorld()

    const sim = createSimRuntime({
      store,
      world,
      fpsRefs: {
        showFrameRateDiagnostics,
        cumulativeAverageFps,
        currentFps
      }
    })

    const saveScene = async (sceneId) => {
      await store.saveScene(sceneId)
    }

    const goToSimulations = () => {
      router.push({ name: 'simulations' })
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

    const hydrateSimIfNeeded = () => {
      if (!store.needsSimHydration) return
      sceneName.value = store.sceneName
      sim.loadAgentsAndFixtures()
      sim.renderAgents('draw')
      sim.refreshLiveHud()
      store.needsSimHydration = false
    }

    /** Load scene from `/simulation/:sceneId` (or refresh with that URL). */
    const syncRouteScene = async () => {
      const rawId = route.params.sceneId
      if (rawId === undefined || rawId === null || String(rawId).length === 0) {
        hydrateSimIfNeeded()
        return
      }
      const id = String(rawId)
      if (id !== String(store.sceneId ?? '')) {
        sim.stopPlaybackForSceneChange()
        sim.resetFpsDiagnostics()
        await store.loadSceneForSimulation({ id })
      }
      hydrateSimIfNeeded()
    }

    const agentTypeList = ref([])

    const loadAgentTypesModal = async () => {
      store.displayLoadObjectModal = true
      agentTypeList.value = await api.listAgentTypes()
    }

    const getLiveHudSnapshot = () => {
      const a = store.selectedAgent
      let simMode = 'edit'
      if (store.sceneIsPlaying) {
        simMode = store.sceneIsPaused ? 'paused' : 'playing'
      } else if (store.sceneIsPaused) {
        simMode = 'paused'
      }
      return {
        simMode,
        dayNumber: store.dayNumber,
        selectedName: a ? a.name : null,
        currentStateName: a ? a.currentStateName : null,
        currentActionName: a?.currentAction?.actionName ?? null,
        currentActionSequenceName: a?.currentActionSequence?.name ?? null,
        mouseX: simPointer.x,
        mouseY: simPointer.y
      }
    }

    watch(
      () => store.selectionMode,
      (on) => {
        if (on) {
          store.mouse.x = simPointer.x
          store.mouse.y = simPointer.y
        }
      }
    )

    watch(
      () => route.params.sceneId,
      async () => {
        await syncRouteScene()
      }
    )

    const isFirstActivation = ref(true)

    onMounted(async () => {
      sim.attachCanvas(canvasRef.value)
      sim.attachDocumentListeners()
      const topMenu = initTopMenuStrip(topMenuStripHost.value, {
        store,
        defaultInterval,
        isEditingDefaultInterval,
        showFrameRateDiagnostics,
        cumulativeAverageFps,
        currentFps,
        onFpsDiagnosticsChange: onFrameRateDiagnosticsChange
      })
      const hud = initLiveHud(liveHudHost.value, getLiveHudSnapshot)
      sim.attachLiveHud({
        update () {
          hud.update()
          topMenu.update()
        },
        destroy () {
          hud.destroy()
          topMenu.destroy()
        }
      })
      hud.update()
      topMenu.update()
      await syncRouteScene()
    })

    onDeactivated(() => {
      sim.suspendForRouteLeave()
    })

    onActivated(async () => {
      if (isFirstActivation.value) {
        isFirstActivation.value = false
        return
      }
      sim.resumeAfterRouteEnter()
      await syncRouteScene()
    })

    onBeforeUnmount(() => {
      sim.stopSimRuntime()
    })

    return {
      store,
      canvasRef,
      liveHudHost,
      topMenuStripHost,
      loadAgentsAndFixtures,
      goToSimulations,
      cloneAction: sim.cloneAction,
      saveScene,
      playScene: sim.playScene,
      pauseScene: sim.pauseScene,
      unPauseScene: sim.unPauseScene,
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

.canvas-container {
  position: relative;
}

/* Phase D: imperative nodes under .sim-live-hud-host use these classes only (global — not scoped). */
.sim-live-hud-host {
  position: absolute;
  left: 8px;
  top: 8px;
  z-index: 2;
  pointer-events: none;
  font-size: 12px;
  color: #1a1a1a;
  text-shadow: 0 0 3px #efeee8, 0 0 6px #efeee8;
}

.sim-live-hud__panel {
  background: rgba(239, 238, 232, 0.9);
  border: 1px solid #c8c4bc;
  border-radius: 4px;
  padding: 8px 10px;
  min-width: 210px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.sim-live-hud__row {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
  line-height: 1.35;
}

.sim-live-hud__row:last-child {
  margin-bottom: 0;
}

.sim-live-hud__label {
  flex: 0 0 56px;
  font-weight: 500;
  color: #a03622;
}

.sim-live-hud__value {
  flex: 1;
  font-variant-numeric: tabular-nums;
  word-break: break-word;
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