<template>
  <div
    v-show="simCategoryDrawer === 'agent-properties'"
    class="toolbar-panel"
    role="region"
    aria-labelledby="toolbar-panel-agent-properties"
  >
    <h2 id="toolbar-panel-agent-properties" class="toolbar-panel__heading">Initial Agent Properties</h2>
    <button
      type="button"
      :disabled="loadSimObjectListFetching"
      @click="loadAgentPropertiesModal"
      class="browse-btn"
    >
      <span>browse</span>
      <FolderUp :size="16" class="icon-btn--small" aria-hidden="true" />
    </button>
    <div v-for="(agentProperty, i) in store.agentProperties" :key="i" class="item-list">
      <AgentInitialPropertyEdit :agentProperty="agentProperty" :index="i" />
    </div>
    <AgentInitialPropertyCreate />
  </div>
</template>

<script>
import { useStore } from '@/store/mainStore.js'
import AgentInitialPropertyEdit from '@/components/simUiForms/AgentInitialPropertyEdit.vue'
import AgentInitialPropertyCreate from '@/components/simUiForms/AgentInitialPropertyCreate.vue'
import { FolderUp } from '@lucide/vue'
export default {
  name: 'AgentPropertySection',

  components: { AgentInitialPropertyEdit, AgentInitialPropertyCreate, FolderUp },

  props: {
    simCategoryDrawer: {
      type: [String, null],
      default: null
    },
    loadSimObjectListFetching: {
      type: Boolean,
      default: false
    },
    loadAgentPropertiesModal: {
      type: Function,
      required: true
    }
  },

  setup () {
    const store = useStore()
    return { store }
  }
}
</script>
