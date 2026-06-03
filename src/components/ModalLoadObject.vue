<template>
  <SimObjectLoadModal
    :open="store.loadSimObjectModal.open"
    :title="preset.title"
    :description="preset.description"
    :empty-text="preset.emptyText"
    :loading="listLoading"
    :columns="preset.columns"
    :items="agentTypeList"
    @close="onClose"
    @select="addAgentTypeToScene"
  />
</template>

<script>
import { computed, markRaw } from 'vue'
import { useStore } from '@/store/mainStore.js'
import { AgentMenuIcon } from '@/classes/SelectionMenu.js'
import SimObjectLoadModal from '@/components/simLoadModal/SimObjectLoadModal.vue'
import {
  SIM_LOAD_MODAL_KINDS,
  getSimLoadModalPreset
} from '@/components/simLoadModal/simLoadModalColumns.js'

export default {
  name: 'ModalLoadObject',

  components: { SimObjectLoadModal },

  props: {
    agentTypeList: {
      type: Array,
      default: () => []
    },
    listLoading: {
      type: Boolean,
      default: false
    }
  },

  setup () {
    const store = useStore()

    const preset = computed(() =>
      getSimLoadModalPreset(SIM_LOAD_MODAL_KINDS.agentType)
    )

    const onClose = () => {
      store.closeLoadSimObjectModal()
    }

    const addAgentTypeToScene = async (agentType) => {
      const atName = agentType.name
      store.agentTypes[atName] = agentType
      store.agentItems[atName] = []
      store.closeLoadSimObjectModal()

      store.agentMenuButtons.push(
        markRaw(
          new AgentMenuIcon({
            menu: store.itemMenu,
            i: store.agentMenuButtons.length,
            name: atName,
            agentType: store.agentTypes[atName]
          })
        )
      )

      await store.saveScene()
    }

    return {
      store,
      preset,
      onClose,
      addAgentTypeToScene
    }
  }
}
</script>
