<template>
  <aside
    id="sim-category-drawer"
    class="sim-category-drawer"
    :class="{
      'is-open': modelValue !== null,
      'is-resizing': isResizing,
      'sim-category-drawer--overlay': overlay
    }"
    :style="drawerStyle"
    aria-label="Simulation category editor"
    :aria-hidden="modelValue === null"
  >
    <div class="sim-category-drawer__inner">
      <div
        v-show="modelValue === 'agent-types'"
        class="menu-panel"
        role="region"
        aria-labelledby="menu-panel-agent-types"
      >
        <h2 id="menu-panel-agent-types" class="menu-panel__heading">Agent Types</h2>
        <MenuBrowseBtn
          :disabled="loadSimObjectListFetching"
          @click="loadModals.agentTypes"
        />
        <div v-for="(agentType, index) in store.agentTypes" :key="index" class="agent-type-menu-container">
          <AgentTypeEdit :agentType="agentType" />
          <AgentTypeFirstActionEdit :agentType="agentType" />
        </div>
        <AgentTypeCreate />
      </div>

      <div
        v-show="modelValue === 'sprite-sheets'"
        class="menu-panel"
        role="region"
        aria-labelledby="menu-panel-sprite-sheets"
      >
        <h2 id="menu-panel-sprite-sheets" class="menu-panel__heading">Sprite Sheets</h2>
        <MenuBrowseBtn
          :disabled="loadSimObjectListFetching"
          @click="loadModals.spriteSheets"
        />
        <div class="item-list">
          <div v-for="(spriteSheet, index) in store.spriteSheets" :key="index" class="created-item">
            <SpriteSheetEdit :spriteSheet="spriteSheet" :i="index" />
          </div>
        </div>
        <SpriteSheetCreate />
      </div>

      <div
        v-show="modelValue === 'animation-sets'"
        class="menu-panel"
        role="region"
        aria-labelledby="menu-panel-animation-sets"
      >
        <h2 id="menu-panel-animation-sets" class="menu-panel__heading">Animation Sets</h2>
        <div v-for="(animationSet, index) in store.animationSets" :key="index">
          <AnimationSetEdit :animationSet="animationSet" :i="index" />
        </div>
        <AnimationSetCreate />
        <button
          type="button"
          :disabled="loadSimObjectListFetching"
          @click="loadModals.animationSets"
        >
          load animation set
        </button>
      </div>

      <div
        v-show="modelValue === 'properties'"
        class="menu-panel"
        role="region"
        aria-labelledby="menu-panel-properties"
      >
        <h2 id="menu-panel-properties" class="menu-panel__heading">Properties</h2>
        <div v-if="store.selectedAgent !== null" class="item-list">
          <PropertyEdit :agentProperties="store.selectedAgent.stateData" />
          <SetPropertyForm />
        </div>
        <p v-else class="menu-panel__hint">Select an agent on the canvas to edit properties.</p>
        <button
          type="button"
          :disabled="loadSimObjectListFetching"
          @click="loadModals.propertyChanges"
        >
          load property change
        </button>
      </div>

      <div
        v-show="modelValue === 'recurring-changes'"
        class="menu-panel"
        role="region"
        aria-labelledby="menu-panel-recurring-changes"
      >
        <h2 id="menu-panel-recurring-changes" class="menu-panel__heading">Recurring Changes</h2>
        <MenuBrowseBtn
          :disabled="loadSimObjectListFetching"
          @click="loadModals.recurringChanges"
        />
        <div class="item-list">
          <div v-for="(recurringChange, index) in store.ungroupedRecurringChanges" :key="index" class="created-item">
            <RecurringChangeEdit :recurringChange="recurringChange" :index="index" />
          </div>
        </div>
        <RecurringChangeCreate />
      </div>

      <AgentPropertySection
        :sim-category-drawer="modelValue"
        :load-sim-object-list-fetching="loadSimObjectListFetching"
        :load-agent-properties-modal="loadModals.agentProperties"
      />

      <div
        v-show="modelValue === 'actions'"
        class="menu-panel"
        role="region"
        aria-labelledby="menu-panel-actions"
      >
        <h2 id="menu-panel-actions" class="menu-panel__heading">Actions</h2>
        <div class="item-list">
          <div v-for="action in store.actions" :key="action.id" class="created-item">
            <ActionEdit :action="action" />
          </div>
          <ActionCreate />
        </div>
        <button
          type="button"
          :disabled="loadSimObjectListFetching"
          @click="loadModals.actions"
        >
          load action
        </button>
        <h3 class="menu-panel__subheading">Start action</h3>
        <div v-if="store.actions.length > 0">
          <div v-for="action in store.actions" :key="'start-' + action.id">
            <button @click="cloneAction(action, store.selectedAgent)">{{ action.actionName }}</button>
          </div>
        </div>
        <p v-else class="menu-panel__hint">no actions yet</p>
      </div>

      <div
        v-show="modelValue === 'conditions'"
        class="menu-panel"
        role="region"
        aria-labelledby="menu-panel-conditions"
      >
        <h2 id="menu-panel-conditions" class="menu-panel__heading">Conditions</h2>
        <div class="item-list">
          <div v-for="(item, index) in store.conditions" :key="index" class="created-item">
            <ConditionEdit :item="item" :index="index" />
          </div>
        </div>
        <ConditionCreate />
        <button
          type="button"
          :disabled="loadSimObjectListFetching"
          @click="loadModals.conditions"
        >
          load condition
        </button>
      </div>

      <div
        v-show="modelValue === 'sensors'"
        class="menu-panel"
        role="region"
        aria-labelledby="menu-panel-sensors"
      >
        <h2 id="menu-panel-sensors" class="menu-panel__heading">Sensors</h2>
        <MenuBrowseBtn
          :disabled="loadSimObjectListFetching"
          @click="loadModals.sensors"
        />
        <div class="item-list">
          <div v-for="(sensor, index) in store.sensors" :key="index" class="created-item">
            <SensorEdit :sensor="sensor" :i="index" />
          </div>
        </div>
        <SensorCreate />
      </div>

      <div
        v-show="modelValue === 'utility-functions'"
        class="menu-panel"
        role="region"
        aria-labelledby="menu-panel-utility-functions"
      >
        <h2 id="menu-panel-utility-functions" class="menu-panel__heading">Utility Functions</h2>
        <MenuBrowseBtn
          :disabled="loadSimObjectListFetching"
          @click="loadModals.utilityFunctions"
        />
        <div class="item-list">
          <div v-for="(utilityFunction, index) in store.agentUtilityFunctions" :key="index" class="created-item">
            <UtilityFunctionEdit :utilityFunction="utilityFunction" :index="index" />
          </div>
        </div>
        <UtilityFunctionCreate />
      </div>
    </div>

    <button
      v-show="modelValue !== null && !isDefaultDrawerWidth"
      type="button"
      class="sim-category-drawer__reset-width"
      aria-label="Reset drawer width"
      title="Reset drawer width"
      @click="resetDrawerWidth"
    >
      <MoveHorizontal :size="14" aria-hidden="true" />
    </button>

    <div
      v-show="modelValue !== null"
      class="sim-category-drawer__resize-handle"
      title="Drag to resize"
      aria-hidden="true"
      @pointerdown="onResizePointerDown"
    />
  </aside>
</template>

<script>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { MoveHorizontal } from '@lucide/vue'
import { useStore } from '@/store/mainStore.js'
import AgentPropertySection from '@/components/simUiForms/AgentPropertySection.vue'
import AgentTypeCreate from '@/components/simUiForms/AgentTypeCreate.vue'
import AgentTypeEdit from '@/components/simUiForms/AgentTypeEdit.vue'
import AgentTypeFirstActionEdit from '@/components/simUiForms/AgentTypeFirstActionEdit.vue'
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
import SensorCreate from '@/components/simUiForms/SensorCreate.vue'
import SensorEdit from '@/components/simUiForms/SensorEdit.vue'
import UtilityFunctionEdit from '@/components/simUiForms/UtilityFunctionEdit.vue'
import UtilityFunctionCreate from '@/components/simUiForms/UtilityFunctionCreate.vue'
import RecurringChangeEdit from '@/components/simUiForms/RecurringChangeEdit.vue'
import RecurringChangeCreate from '@/components/simUiForms/RecurringChangeCreate.vue'
import MenuBrowseBtn from '@/components/simUi/MenuBrowseBtn.vue'

const DRAWER_WIDTH_STORAGE_KEY = 'simCategoryDrawerWidth'
const DEFAULT_DRAWER_WIDTH = 350
const MIN_DRAWER_WIDTH = 280
const MAX_DRAWER_WIDTH = 600

function readStoredDrawerWidth () {
  const stored = Number(localStorage.getItem(DRAWER_WIDTH_STORAGE_KEY))
  if (Number.isFinite(stored) && stored >= MIN_DRAWER_WIDTH && stored <= MAX_DRAWER_WIDTH) {
    return stored
  }
  return DEFAULT_DRAWER_WIDTH
}

export default {
  name: 'SimCategoryDrawer',

  components: {
    MoveHorizontal,
    AgentPropertySection,
    AgentTypeCreate,
    AgentTypeEdit,
    AgentTypeFirstActionEdit,
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
    SensorCreate,
    SensorEdit,
    UtilityFunctionEdit,
    UtilityFunctionCreate,
    RecurringChangeEdit,
    RecurringChangeCreate,
    MenuBrowseBtn
  },

  props: {
    /** Active category id from SIM_CATEGORY_SECTIONS, or null when closed. */
    modelValue: {
      type: [String, null],
      default: null
    },
    overlay: {
      type: Boolean,
      default: true
    },
    loadSimObjectListFetching: {
      type: Boolean,
      default: false
    },
    loadModals: {
      type: Object,
      required: true
    },
    cloneAction: {
      type: Function,
      required: true
    }
  },

  emits: ['update:modelValue'],

  setup (props, { emit }) {
    const store = useStore()
    const drawerWidth = ref(readStoredDrawerWidth())
    const isResizing = ref(false)

    const drawerStyle = computed(() => {
      if (props.modelValue === null) return undefined
      const width = `${drawerWidth.value}px`
      return { width, minWidth: width }
    })

    const isDefaultDrawerWidth = computed(
      () => drawerWidth.value === DEFAULT_DRAWER_WIDTH
    )

    const resetDrawerWidth = () => {
      drawerWidth.value = DEFAULT_DRAWER_WIDTH
      localStorage.setItem(DRAWER_WIDTH_STORAGE_KEY, String(DEFAULT_DRAWER_WIDTH))
    }

    const onResizePointerDown = (event) => {
      if (props.modelValue === null) return
      event.preventDefault()

      const handle = event.currentTarget
      const startX = event.clientX
      const startWidth = drawerWidth.value
      isResizing.value = true
      handle.setPointerCapture(event.pointerId)

      const onPointerMove = (moveEvent) => {
        if (moveEvent.pointerId !== event.pointerId) return
        const nextWidth = startWidth + (moveEvent.clientX - startX)
        drawerWidth.value = Math.min(
          MAX_DRAWER_WIDTH,
          Math.max(MIN_DRAWER_WIDTH, nextWidth)
        )
      }

      const endResize = (endEvent) => {
        if (endEvent.pointerId !== event.pointerId) return
        isResizing.value = false
        handle.releasePointerCapture(event.pointerId)
        handle.removeEventListener('pointermove', onPointerMove)
        handle.removeEventListener('pointerup', endResize)
        handle.removeEventListener('pointercancel', endResize)
        localStorage.setItem(DRAWER_WIDTH_STORAGE_KEY, String(drawerWidth.value))
      }

      handle.addEventListener('pointermove', onPointerMove)
      handle.addEventListener('pointerup', endResize)
      handle.addEventListener('pointercancel', endResize)
    }

    const onEscapeKeydown = (event) => {
      if (event.key === 'Escape' && props.modelValue !== null) {
        emit('update:modelValue', null)
      }
    }

    onMounted(() => {
      document.addEventListener('keydown', onEscapeKeydown)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', onEscapeKeydown)
    })

    return {
      store,
      drawerStyle,
      isResizing,
      isDefaultDrawerWidth,
      resetDrawerWidth,
      onResizePointerDown
    }
  }
}
</script>

<style scoped>
.sim-category-drawer {
  flex: 0 0 auto;
  width: 0;
  min-width: 0;
  overflow: hidden;
  box-sizing: border-box;
  transition: width 0.1s ease, min-width 0.1s ease;
}

.sim-category-drawer.is-open {
  align-self: stretch;
  min-height: 100%;
  max-height: calc(100vh - 42px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Positioning context for resize handle — only when in normal flex layout (not overlay). */
.sim-category-drawer.is-open:not(.sim-category-drawer--overlay) {
  position: relative;
}

.sim-category-drawer.is-resizing {
  transition: none;
}

.sim-category-drawer__resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 100%;
  cursor: col-resize;
  z-index: 2;
  touch-action: none;
  background: transparent;
}

.sim-category-drawer__resize-handle:hover,
.sim-category-drawer.is-resizing .sim-category-drawer__resize-handle {
  background: rgba(228, 61, 18, 0.14);
}

.sim-category-drawer__reset-width {
  position: absolute;
  top: 8px;
  right: 12px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin: 0;
  padding: 0;
  border: 1px solid #dcc8c0;
  border-radius: 3px;
  background: #fffef9;
  color: #a03622;
  cursor: pointer;
}

.sim-category-drawer__reset-width:hover {
  background: #f0e8e4;
  border-color: #e43d12;
}

.sim-category-drawer--overlay {
  position: absolute;
  left: 90px;
  top: 0;
  bottom: 0;
  z-index: 10;
  height: auto;
  max-height: 100%;
  background: #efeee8;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.08);
}

.sim-category-drawer.is-open.sim-category-drawer--overlay {
  position: absolute;
}

.sim-category-drawer--overlay.is-open {
  min-height: 100%;
  max-height: calc(100vh - 42px);
}

.sim-category-drawer--overlay .sim-category-drawer__inner {
  font-size: 14px;
  border-right: 1px solid #e8b9ad;
}

.sim-category-drawer__inner {
  width: 100%;
  flex: 1;
  min-height: 0;
  padding: 8px 10px 4rem;
  padding-right: 2.75rem;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
