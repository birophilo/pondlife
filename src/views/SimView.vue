<template>
<!--
  Plan 3: keep-alive SimView — onDeactivated suspends (pause + detach input); onActivated resumes listeners.
  True unmount → stopSimRuntime. Phase F: simPointer. Phase E: markRaw.
-->

<NavTopLogin />

<div class="container">

  <ModalLoadSimObject
    v-if="store.loadSimObjectModal.open"
    :kind="store.loadSimObjectModal.kind"
    :items="loadModalItems"
    :context="loadModalContext"
    :loading="loadSimObjectListFetching"
  />

  <SimCategoryIconMenu
    v-model="simCategoryDrawer"
    v-model:overlay="simCategoryDrawerOverlay"
  />

  <SimCategoryDrawer
    v-model="simCategoryDrawer"
    :overlay="simCategoryDrawerOverlay"
    :load-sim-object-list-fetching="loadSimObjectListFetching"
    :load-modals="loadModals"
    :clone-action="cloneAction"
  />

    <div class="canvas-container" style="border: 1px solid red;">
    <!-- Always mounted (Phase C); never v-if — simRuntime holds a native element reference. -->
    <canvas ref="canvasRef" />

    <div class="scene-heading">
      {{ sceneName }}
    </div>

    <div class="scene-button-container">
      <span v-if="store.sceneIsPlaying">
        <button type="button" class="scene-button" aria-label="Pause scene" @click="pauseScene">
          <Pause :size="20" :stroke-width="1.25" aria-hidden="true" />
        </button>
      </span>
      <span v-else-if="store.sceneIsPaused">
        <button type="button" class="scene-button" aria-label="Resume scene" @click="unPauseScene">
          <Play :size="20" :stroke-width="1.25" aria-hidden="true" />
        </button>
      </span>
      <span v-else>
        <button type="button" class="scene-button" aria-label="Play scene" @click="playScene">
          <Play :size="20" :stroke-width="1.25" aria-hidden="true" />
        </button>
      </span>
      <button type="button" class="scene-button" aria-label="Save scene" @click="saveScene">
        <Save :size="20" :stroke-width="1.25" aria-hidden="true" />
      </button>
      <!-- <button type="button" class="scene-button" aria-label="Simulations" @click="goToSimulations">
        Simulations
      </button> -->
    </div>
  </div>

  <div class="live-controls-menu">

    <!-- Phase C: imperative top strip + Selected Agent details — initTopMenuStrip() in setup -->
    <div ref="topMenuStripHost" />

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
import { initTopMenuStrip } from '@/hud/imperativeTopMenuStrip.js'
import SimCategoryIconMenu from '@/components/simCategoryMenu/SimCategoryIconMenu.vue'
import SimCategoryDrawer from '@/components/simCategoryMenu/SimCategoryDrawer.vue'
import ModalLoadSimObject from '@/components/ModalLoadSimObject.vue'
import { previewSrcForAnimationSet } from '@/components/simLoadModal/animationSetLoadHelpers.js'
import { actionLabelForUtilityFunction, resolveUtilityFunctionActionObjectType } from '@/components/simLoadModal/utilityFunctionLoadHelpers.js'
import NavTopLogin from '@/components/NavTopLogin.vue'
import {
  Pause,
  Play,
  Save
} from '@lucide/vue'


export default {
  name: 'SimView',
  components: {
    SimCategoryIconMenu,
    SimCategoryDrawer,
    ModalLoadSimObject,
    NavTopLogin,
    Play,
    Pause,
    Save
  },
  setup () {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()

    const canvasRef = ref(null)
    const topMenuStripHost = ref(null)
    const sceneName = ref('')

    const showFrameRateDiagnostics = ref(false)
    const cumulativeAverageFps = ref(0)
    const currentFps = ref(0)

    /** null = drawer closed; otherwise category id from SIM_CATEGORY_SECTIONS */
    const simCategoryDrawer = ref(null)
    /** When true, drawer overlaps canvas instead of pushing layout. */
    const simCategoryDrawerOverlay = ref(true)

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

    const worldNeedsSceneHydration = () => {
      return Object.keys(world.agentTypes).length === 0
    }

    const hasScenePayload = () => {
      const data = store.sceneData
      return data != null && typeof data === 'object' && Object.keys(data).length > 0
    }

    const applySceneToWorld = () => {
      sceneName.value = store.sceneName
      sim.loadAgentsAndFixtures()
      sim.paintInitialScene()
      sim.refreshSidePanel()
      store.needsSimHydration = false
    }

    /** Load scene from `/simulation/:sceneId` (or refresh with that URL). */
    let syncRouteSceneInFlight = null
    const syncRouteScene = async () => {
      if (syncRouteSceneInFlight) {
        await syncRouteSceneInFlight
        return
      }
      syncRouteSceneInFlight = (async () => {
        const rawId = route.params.sceneId
        if (rawId === undefined || rawId === null || String(rawId).length === 0) {
          if (store.needsSimHydration && hasScenePayload()) {
            applySceneToWorld()
          }
          return
        }
        const id = String(rawId)
        if (id !== String(store.sceneId ?? '')) {
          sim.stopPlaybackForSceneChange()
          sim.resetFpsDiagnostics()
          await store.loadSceneForSimulation({ id })
        }
        const routeMatchesStore =
          !store.error && String(store.sceneId) === id && hasScenePayload()
        const shouldApply =
          routeMatchesStore &&
          (store.needsSimHydration || worldNeedsSceneHydration())
        if (shouldApply) {
          applySceneToWorld()
        }
      })()
      try {
        await syncRouteSceneInFlight
      } finally {
        syncRouteSceneInFlight = null
      }
    }

    const loadModalItems = ref([])
    const loadModalContext = ref({})
    const loadSimObjectListFetching = ref(false)

    const openLoadModal = (kind) => {
      loadModalItems.value = []
      loadModalContext.value = {}
      store.openLoadSimObjectModal(kind)
    }

    const loadAgentTypesModal = async () => {
      if (loadSimObjectListFetching.value) return
      openLoadModal('agentType')
      loadSimObjectListFetching.value = true
      try {
        const data = await api.listAgentTypes()
        if (data?.error || !Array.isArray(data)) {
          store.closeLoadSimObjectModal()
          return
        }
        loadModalItems.value = data
      } finally {
        loadSimObjectListFetching.value = false
      }
    }

    const loadSpriteSheetsModal = async () => {
      if (loadSimObjectListFetching.value) return
      openLoadModal('spriteSheet')
      loadSimObjectListFetching.value = true
      try {
        const data = await api.listSpriteSheets()
        if (data?.error || !Array.isArray(data)) {
          store.closeLoadSimObjectModal()
          return
        }
        loadModalItems.value = data
      } finally {
        loadSimObjectListFetching.value = false
      }
    }

    const loadAnimationSetsModal = async () => {
      if (loadSimObjectListFetching.value) return
      openLoadModal('animationSet')
      loadSimObjectListFetching.value = true
      try {
        const [sets, sheets] = await Promise.all([
          api.listAnimationSets(),
          api.listSpriteSheets()
        ])
        if (sets?.error || sheets?.error || !Array.isArray(sets) || !Array.isArray(sheets)) {
          store.closeLoadSimObjectModal()
          return
        }
        loadModalContext.value = { allSpriteSheets: sheets }
        loadModalItems.value = sets.map((set) => ({
          ...set,
          previewSrc: previewSrcForAnimationSet(set, sheets)
        }))
      } finally {
        loadSimObjectListFetching.value = false
      }
    }

    const loadSensorsModal = async () => {
      if (loadSimObjectListFetching.value) return
      openLoadModal('sensor')
      loadSimObjectListFetching.value = true
      try {
        const data = await api.listSensors()
        if (data?.error || !Array.isArray(data)) {
          store.closeLoadSimObjectModal()
          return
        }
        loadModalItems.value = data
      } finally {
        loadSimObjectListFetching.value = false
      }
    }

    const loadUtilityFunctionsModal = async () => {
      if (loadSimObjectListFetching.value) return
      openLoadModal('utilityFunction')
      loadSimObjectListFetching.value = true
      try {
        const [utilities, actions, actionSequences] = await Promise.all([
          api.listUtilityFunctions(),
          api.listActions(),
          api.listActionSequences()
        ])
        if (
          utilities?.error ||
          actions?.error ||
          actionSequences?.error ||
          !Array.isArray(utilities) ||
          !Array.isArray(actions) ||
          !Array.isArray(actionSequences)
        ) {
          store.closeLoadSimObjectModal()
          return
        }
        loadModalItems.value = utilities.map((uf) => {
          const actionObjectType = resolveUtilityFunctionActionObjectType(uf, actionSequences)
          const enriched = { ...uf, actionObjectType }
          return {
            ...enriched,
            actionLabel: actionLabelForUtilityFunction(enriched, actions, actionSequences)
          }
        })
      } finally {
        loadSimObjectListFetching.value = false
      }
    }

    const loadActionsModal = async () => {
      if (loadSimObjectListFetching.value) return
      openLoadModal('action')
      loadSimObjectListFetching.value = true
      try {
        const data = await api.listActions()
        if (data?.error || !Array.isArray(data)) {
          store.closeLoadSimObjectModal()
          return
        }
        loadModalItems.value = data
      } finally {
        loadSimObjectListFetching.value = false
      }
    }

    const loadConditionsModal = async () => {
      if (loadSimObjectListFetching.value) return
      openLoadModal('condition')
      loadSimObjectListFetching.value = true
      try {
        const data = await api.listConditions()
        if (data?.error || !Array.isArray(data)) {
          store.closeLoadSimObjectModal()
          return
        }
        loadModalItems.value = data
      } finally {
        loadSimObjectListFetching.value = false
      }
    }

    const loadPropertyChangesModal = async () => {
      if (loadSimObjectListFetching.value) return
      openLoadModal('propertyChange')
      loadSimObjectListFetching.value = true
      try {
        const [propertyChanges, actions] = await Promise.all([
          api.listPropertyChanges(),
          api.listActions()
        ])
        if (
          propertyChanges?.error ||
          actions?.error ||
          !Array.isArray(propertyChanges) ||
          !Array.isArray(actions)
        ) {
          store.closeLoadSimObjectModal()
          return
        }
        loadModalItems.value = propertyChanges.map((pc) => ({
          ...pc,
          actionLabel:
            actions.find((a) => a.id === pc.actionId)?.actionName ?? pc.actionId ?? '—'
        }))
      } finally {
        loadSimObjectListFetching.value = false
      }
    }

    const loadRecurringChangesModal = async () => {
      if (loadSimObjectListFetching.value) return
      openLoadModal('recurringChange')
      loadSimObjectListFetching.value = true
      try {
        const data = await api.listRecurringChanges()
        if (data?.error || !Array.isArray(data)) {
          store.closeLoadSimObjectModal()
          return
        }
        loadModalItems.value = data
      } finally {
        loadSimObjectListFetching.value = false
      }
    }

    const loadAgentPropertiesModal = async () => {
      if (loadSimObjectListFetching.value) return
      openLoadModal('agentProperty')
      loadSimObjectListFetching.value = true
      try {
        const data = await api.listAgentProperties()
        if (data?.error || !Array.isArray(data)) {
          store.closeLoadSimObjectModal()
          return
        }
        loadModalItems.value = data
      } finally {
        loadSimObjectListFetching.value = false
      }
    }

    const loadModals = {
      agentTypes: loadAgentTypesModal,
      spriteSheets: loadSpriteSheetsModal,
      animationSets: loadAnimationSetsModal,
      propertyChanges: loadPropertyChangesModal,
      recurringChanges: loadRecurringChangesModal,
      agentProperties: loadAgentPropertiesModal,
      actions: loadActionsModal,
      conditions: loadConditionsModal,
      sensors: loadSensorsModal,
      utilityFunctions: loadUtilityFunctionsModal
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

    watch(
      () => store.sceneId,
      (id) => {
        if (id == null || id === '') {
          sceneName.value = ''
          sim.unloadSimWorld()
          sim.refreshSidePanel()
        }
      }
    )

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
      sim.attachSidePanel({
        update () {
          topMenu.update()
        },
        destroy () {
          topMenu.destroy()
        }
      })
      topMenu.update()
      await syncRouteScene()
    })

    onDeactivated(() => {
      simCategoryDrawer.value = null
      sim.suspendForRouteLeave()
    })

    onActivated(async () => {
      sim.resumeAfterRouteEnter()
      await syncRouteScene()
    })

    onBeforeUnmount(() => {
      sim.stopSimRuntime()
    })

    return {
      store,
      simCategoryDrawer,
      simCategoryDrawerOverlay,
      canvasRef,
      topMenuStripHost,
      loadAgentsAndFixtures,
      goToSimulations,
      cloneAction: sim.cloneAction,
      saveScene,
      playScene: sim.playScene,
      pauseScene: sim.pauseScene,
      unPauseScene: sim.unPauseScene,
      sceneName,
      loadModals,
      loadModalItems,
      loadModalContext,
      loadSimObjectListFetching
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

.container {
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
  /* Block-level divs still span the viewport; when columns exceed that width, scroll instead of shrinking. */
  overflow-x: auto;
}

canvas {
  width: 1000px;
  height: 600px;
  position: relative;
}

.canvas-container {
  position: relative;
  flex: 0 0 auto;
  min-width: 1000px;
}

.live-controls-menu {
  flex: 0 0 200px;
  width: 200px;
  min-width: 200px;
  padding: 5px 5px 5px 10px;
  box-sizing: border-box;
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

.menu-action-name {
  font-size: 18px;
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

.scene-button-container button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 6px 10px;
  color:#a03622
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