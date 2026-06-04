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

  <nav class="left-sim-menu" aria-label="Simulation tools">
    <div class="left-sim-menu__grid">
      <button
        v-for="item in leftToolbarSections"
        :key="item.id"
        type="button"
        class="left-sim-menu__item"
        :class="{ 'is-active': activeToolbarPanel === item.id }"
        :title="item.label"
        :aria-label="item.label"
        :aria-expanded="activeToolbarPanel === item.id"
        aria-controls="toolbar-detail-panel"
        @click="onToolbarSectionClick(item.id)"
      >
        <component
          :is="item.icon"
          class="left-sim-menu__icon"
          :size="item.id === 'agent-types' ? 22 : 18"
          :stroke-width="1"
          aria-hidden="true"
        />
      </button>
    </div>

    <div class="left-sim-menu__overlay-control">
      <label class="left-sim-menu__overlay-switch" title="Overlay detail panel on canvas">
        <input
          v-model="toolbarDetailOverlay"
          type="checkbox"
          class="left-sim-menu__overlay-input"
        />
        <span class="left-sim-menu__overlay-track" aria-hidden="true" />
      </label>
      <span class="left-sim-menu__overlay-caption">overlay</span>
    </div>
  </nav>

  <aside
    id="toolbar-detail-panel"
    class="toolbar-detail-menu"
    :class="{
      'is-open': activeToolbarPanel !== null,
      'toolbar-detail-menu--overlay': toolbarDetailOverlay
    }"
    aria-label="Editor detail panel"
    :aria-hidden="activeToolbarPanel === null"
  >
    <div class="toolbar-detail-menu__inner">
      <div
        v-show="activeToolbarPanel === 'agent-types'"
        class="toolbar-panel"
        role="region"
        aria-labelledby="toolbar-panel-agent-types"
      >
        <h2 id="toolbar-panel-agent-types" class="toolbar-panel__heading">Agent Types</h2>
        <div v-for="(agentType, index) in store.agentTypes" :key="index" class="agent-type-menu-container">
          <AgentTypeEdit :agentType="agentType" />
          <AgentTypeFirstActionEdit :agentType="agentType" />
        </div>
        <AgentTypeCreate />
        <button
          type="button"
          :disabled="loadSimObjectListFetching"
          @click="loadAgentTypesModal"
        >
          load agent type
        </button>
      </div>

      <div
        v-show="activeToolbarPanel === 'sprite-sheets'"
        class="toolbar-panel"
        role="region"
        aria-labelledby="toolbar-panel-sprite-sheets"
      >
        <h2 id="toolbar-panel-sprite-sheets" class="toolbar-panel__heading">Sprite Sheets</h2>
        <div v-for="(spriteSheet, index) in store.spriteSheets" :key="index">
          <SpriteSheetEdit :spriteSheet="spriteSheet" :i="index" />
        </div>
        <SpriteSheetCreate />
        <button
          type="button"
          :disabled="loadSimObjectListFetching"
          @click="loadSpriteSheetsModal"
        >
          load sprite sheet
        </button>
      </div>

      <div
        v-show="activeToolbarPanel === 'animation-sets'"
        class="toolbar-panel"
        role="region"
        aria-labelledby="toolbar-panel-animation-sets"
      >
        <h2 id="toolbar-panel-animation-sets" class="toolbar-panel__heading">Animation Sets</h2>
        <div v-for="(animationSet, index) in store.animationSets" :key="index">
          <AnimationSetEdit :animationSet="animationSet" :i="index" />
        </div>
        <AnimationSetCreate />
        <button
          type="button"
          :disabled="loadSimObjectListFetching"
          @click="loadAnimationSetsModal"
        >
          load animation set
        </button>
      </div>

      <div
        v-show="activeToolbarPanel === 'properties'"
        class="toolbar-panel"
        role="region"
        aria-labelledby="toolbar-panel-properties"
      >
        <h2 id="toolbar-panel-properties" class="toolbar-panel__heading">Properties</h2>
        <div v-if="store.selectedAgent !== null" class="item-list">
          <PropertyEdit :agentProperties="store.selectedAgent.stateData"/>
          <SetPropertyForm />
        </div>
        <p v-else class="toolbar-panel__hint">Select an agent on the canvas to edit properties.</p>
        <button
          type="button"
          :disabled="loadSimObjectListFetching"
          @click="loadPropertyChangesModal"
        >
          load property change
        </button>
      </div>

      <div
        v-show="activeToolbarPanel === 'recurring-changes'"
        class="toolbar-panel"
        role="region"
        aria-labelledby="toolbar-panel-recurring-changes"
      >
        <h2 id="toolbar-panel-recurring-changes" class="toolbar-panel__heading">Recurring Changes</h2>
        <div v-for="(recurringChange, index) in store.ungroupedRecurringChanges" :key="index">
          <RecurringChangeEdit :recurringChange="recurringChange" :index="index" />
        </div>
        <RecurringChangeCreate />
        <button
          type="button"
          :disabled="loadSimObjectListFetching"
          @click="loadRecurringChangesModal"
        >
          load recurring change
        </button>
      </div>

      <div
        v-show="activeToolbarPanel === 'agent-properties'"
        class="toolbar-panel"
        role="region"
        aria-labelledby="toolbar-panel-agent-properties"
      >
        <h2 id="toolbar-panel-agent-properties" class="toolbar-panel__heading">Agent Properties</h2>
        <div v-for="(agentProperty, i) in store.agentProperties" :key="i" class="item-list">
          <AgentInitialPropertyEdit :agentProperty="agentProperty" :index="i" />
        </div>
        <AgentPropertyCreate />
        <button
          type="button"
          :disabled="loadSimObjectListFetching"
          @click="loadAgentPropertiesModal"
        >
          load agent property
        </button>
      </div>

      <div
        v-show="activeToolbarPanel === 'actions'"
        class="toolbar-panel"
        role="region"
        aria-labelledby="toolbar-panel-actions"
      >
        <h2 id="toolbar-panel-actions" class="toolbar-panel__heading">Actions</h2>
        <div class="item-list">
          <div v-for="action in store.actions" :key="action.id" class="created-item">
            <ActionEdit :action="action"/>
          </div>
          <ActionCreate />
        </div>
        <button
          type="button"
          :disabled="loadSimObjectListFetching"
          @click="loadActionsModal"
        >
          load action
        </button>
        <h3 class="toolbar-panel__subheading">Start action</h3>
        <div v-if="store.actions.length > 0">
          <div v-for="action in store.actions" :key="'start-' + action.id">
            <button @click="cloneAction(action, store.selectedAgent)">{{ action.actionName }}</button>
          </div>
        </div>
        <p v-else class="toolbar-panel__hint">no actions yet</p>
      </div>

      <div
        v-show="activeToolbarPanel === 'conditions'"
        class="toolbar-panel"
        role="region"
        aria-labelledby="toolbar-panel-conditions"
      >
        <h2 id="toolbar-panel-conditions" class="toolbar-panel__heading">Conditions</h2>
        <div class="item-list">
          <div v-for="(item, index) in store.conditions" :key="index" class="created-item">
            <ConditionEdit :item="item" :index="index" />
          </div>
        </div>
        <ConditionCreate />
        <button
          type="button"
          :disabled="loadSimObjectListFetching"
          @click="loadConditionsModal"
        >
          load condition
        </button>
      </div>

      <div
        v-show="activeToolbarPanel === 'sensors'"
        class="toolbar-panel"
        role="region"
        aria-labelledby="toolbar-panel-sensors"
      >
        <h2 id="toolbar-panel-sensors" class="toolbar-panel__heading">Sensors</h2>
        <div class="item-list">
          <div v-for="(sensor, index) in store.sensors" :key="index" class="created-item">
            <SensorEdit :sensor="sensor" :i="index" />
          </div>
        </div>
        <SensorCreate />
        <button
          type="button"
          :disabled="loadSimObjectListFetching"
          @click="loadSensorsModal"
        >
          load sensor
        </button>
      </div>

      <div
        v-show="activeToolbarPanel === 'utility-functions'"
        class="toolbar-panel"
        role="region"
        aria-labelledby="toolbar-panel-utility-functions"
      >
        <h2 id="toolbar-panel-utility-functions" class="toolbar-panel__heading">Utility Functions</h2>
        <div class="item-list">
          <div v-for="(utilityFunction, index) in store.agentUtilityFunctions" :key="index" class="created-item">
            <UtilityFunctionEdit :utilityFunction="utilityFunction" :index="index" />
          </div>
        </div>
        <UtilityFunctionCreate />
        <button
          type="button"
          :disabled="loadSimObjectListFetching"
          @click="loadUtilityFunctionsModal"
        >
          load utility function
        </button>
      </div>
    </div>
  </aside>

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
import ModalLoadSimObject from '@/components/ModalLoadSimObject.vue'
import { previewSrcForAnimationSet } from '@/components/simLoadModal/animationSetLoadHelpers.js'
import { actionLabelForUtilityFunction, resolveUtilityFunctionActionObjectType } from '@/components/simLoadModal/utilityFunctionLoadHelpers.js'
import AgentTypeFirstActionEdit from '@/components/simUiForms/AgentTypeFirstActionEdit.vue'
import NavTopLogin from '@/components/NavTopLogin.vue'
import SensorCreate from '@/components/simUiForms/SensorCreate.vue'
import SensorEdit from '@/components/simUiForms/SensorEdit.vue'
import UtilityFunctionEdit from '@/components/simUiForms/UtilityFunctionEdit.vue'
import UtilityFunctionCreate from '@/components/simUiForms/UtilityFunctionCreate.vue'
import RecurringChangeEdit from '@/components/simUiForms/RecurringChangeEdit.vue'
import RecurringChangeCreate from '@/components/simUiForms/RecurringChangeCreate.vue'
import {
  SlidersHorizontal,
  Images,
  Brain,
  PersonStanding,
  BookOpenText,
  Timeline,
  Clock2,
  Ear,
  Clapperboard,
  Footprints,
  Pause,
  Play,
  Save,
  List
} from '@lucide/vue'

/** Left toolbar icons — one distinct Lucide icon per editor section. */
// const LEFT_NAV_SECTIONS = [
//   { id: 'agent-types', label: 'Agent Types', icon: Users },
//   { id: 'agent-properties', label: 'Agent Properties', icon: ClipboardList },
//   { id: 'actions', label: 'Actions', icon: Zap },
//   { id: 'recurring-changes', label: 'Recurring Changes', icon: Repeat },
//   { id: 'conditions', label: 'Conditions', icon: GitBranch },
//   { id: 'properties', label: 'Properties', icon: SlidersHorizontal },
//   { id: 'sprite-sheets', label: 'Sprite Sheets', icon: Images },
//   { id: 'animation-sets', label: 'Animation Sets', icon: Film },
//   { id: 'sensors', label: 'Sensors', icon: Radar },
//   { id: 'utility-functions', label: 'Utility Functions', icon: Brain }
// ]

const LEFT_TOOLBAR_SECTIONS = [
  { id: 'agent-types', label: 'Agent Types', icon: PersonStanding },
  { id: 'agent-properties', label: 'Agent Properties', icon: BookOpenText }, // or BookOpenText
  { id: 'actions', label: 'Actions', icon: Footprints },  // or ClipboardPaste, Workflow
  { id: 'recurring-changes', label: 'Recurring Changes', icon: Clock2 },  // or Clock2
  { id: 'conditions', label: 'Conditions', icon: Timeline },  // or Timeline
  { id: 'properties', label: 'Properties', icon: SlidersHorizontal },  // PencilRuler
  { id: 'sprite-sheets', label: 'Sprite Sheets', icon: Images },
  { id: 'animation-sets', label: 'Animation Sets', icon: Clapperboard },  // or Clapperboard
  { id: 'sensors', label: 'Sensors', icon: Ear }, // could also do SmartphoneNfc, Wifi, Ear
  { id: 'utility-functions', label: 'Utility Functions', icon: Brain }
]


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
    ModalLoadSimObject,
    AgentTypeFirstActionEdit,
    NavTopLogin,
    SensorCreate,
    SensorEdit,
    UtilityFunctionEdit,
    UtilityFunctionCreate,
    RecurringChangeEdit,
    RecurringChangeCreate,
    Play,
    Pause,
    Save,
    List
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

    /** null = detail drawer collapsed; otherwise id from LEFT_TOOLBAR_SECTIONS */
    const activeToolbarPanel = ref(null)
    /** When true, expanded detail panel overlaps canvas instead of pushing layout. */
    const toolbarDetailOverlay = ref(true)

    function onToolbarSectionClick (id) {
      activeToolbarPanel.value =
        activeToolbarPanel.value === id ? null : id
    }

    function onToolbarDetailKeydown (event) {
      if (event.key === 'Escape' && activeToolbarPanel.value !== null) {
        activeToolbarPanel.value = null
      }
    }

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
      document.addEventListener('keydown', onToolbarDetailKeydown)
      // Attach canvas synchronously before any await so onActivated cannot
      // hydrate/paint while c/canvas are still unset (cold start from Simulations).
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
      activeToolbarPanel.value = null
      sim.suspendForRouteLeave()
    })

    onActivated(async () => {
      sim.resumeAfterRouteEnter()
      await syncRouteScene()
    })

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', onToolbarDetailKeydown)
      sim.stopSimRuntime()
    })

    return {
      store,
      leftToolbarSections: LEFT_TOOLBAR_SECTIONS,
      activeToolbarPanel,
      toolbarDetailOverlay,
      onToolbarSectionClick,
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
      loadAgentTypesModal,
      loadSpriteSheetsModal,
      loadAnimationSetsModal,
      loadSensorsModal,
      loadUtilityFunctionsModal,
      loadActionsModal,
      loadConditionsModal,
      loadPropertyChangesModal,
      loadRecurringChangesModal,
      loadAgentPropertiesModal,
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

.left-sim-menu {
  flex: 0 0 90px;
  width: 90px;
  box-sizing: border-box;
  padding: 2px;
  border-right: 1px solid #e8b9ad;
  background: #f5f3ee;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.left-sim-menu__overlay-control {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.left-sim-menu__overlay-switch {
  position: relative;
  display: inline-flex;
  cursor: pointer;
}

.left-sim-menu__overlay-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.left-sim-menu__overlay-track {
  display: block;
  width: 28px;
  height: 16px;
  border-radius: 8px;
  background: #dcc8c0;
  border: 1px solid #c8b4ac;
  box-sizing: border-box;
  transition: background 0.1s ease;
}

.left-sim-menu__overlay-track::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 3px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fffef9;
  transition: transform 0.1s ease;
}

.left-sim-menu__overlay-input:checked + .left-sim-menu__overlay-track {
  background: #e8b9ad;
  border-color: #e43d12;
}

.left-sim-menu__overlay-input:checked + .left-sim-menu__overlay-track::after {
  transform: translateX(12px);
}

.left-sim-menu__overlay-input:focus-visible + .left-sim-menu__overlay-track {
  outline: 2px solid #e43d12;
  outline-offset: 2px;
}

.left-sim-menu__overlay-caption {
  margin-top: 4px;
  font-size: 0.65rem;
  line-height: 1.2;
  text-align: center;
  color: #a03622;
  user-select: none;
}

.left-sim-menu__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  width: 100%;
  align-self: stretch;
}

.left-sim-menu__item {
  aspect-ratio: 1;
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border: 1px solid #dcc8c0;
  background: #fffef9;
  cursor: pointer;
  color: #a03622;
}

.left-sim-menu__item:hover {
  background: #f0e8e4;
  border-color: #e43d12;
}

.left-sim-menu__item.is-active {
  background: #e8b9ad;
  border-color: #e43d12;
}

.left-sim-menu__item:focus-visible {
  outline: 2px solid #e43d12;
  outline-offset: 1px;
}

.left-sim-menu__icon {
  flex-shrink: 0;
  pointer-events: none;
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

.toolbar-detail-menu {
  flex: 0 0 auto;
  width: 0;
  min-width: 0;
  overflow: hidden;
  box-sizing: border-box;
  transition: width 0.1s ease, min-width 0.1s ease;
}

.toolbar-detail-menu.is-open {
  width: 350px;
  min-width: 350px;
}

.toolbar-detail-menu--overlay {
  position: absolute;
  left: 90px;
  top: 0;
  z-index: 10;
  height: 100%;
  min-height: 100%;
  background: #efeee8;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.08);
}

.toolbar-detail-menu--overlay .toolbar-detail-menu__inner {
  font-size: 14px;
  border-right: 1px solid #e8b9ad;
}

.toolbar-detail-menu__inner {
  width: 350px;
  padding: 8px 10px 16px;
  box-sizing: border-box;
  max-height: 100vh;
  overflow-y: auto;
}

.toolbar-panel__heading {
  margin: 0 0 16px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #a03622;
}

.toolbar-panel__subheading {
  margin: 20px 0 12px;
  font-size: 1rem;
  font-weight: 500;
}

.toolbar-panel__hint {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
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