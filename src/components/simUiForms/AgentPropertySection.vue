<template>
  <div
    v-show="simCategoryDrawer === 'agent-properties'"
    class="menu-panel"
    role="region"
    aria-labelledby="menu-panel-agent-properties"
  >
    <h2 id="menu-panel-agent-properties" class="menu-panel__heading">Initial Agent Properties</h2>
    <MenuBrowseBtn
      :disabled="loadSimObjectListFetching"
      @click="loadAgentPropertiesModal"
    />
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
import MenuBrowseBtn from '@/components/simUi/MenuBrowseBtn.vue'
export default {
  name: 'AgentPropertySection',

  components: { AgentInitialPropertyEdit, AgentInitialPropertyCreate, MenuBrowseBtn },

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
