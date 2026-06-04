<template>
  <SimObjectLoadModal
    :open="store.loadSimObjectModal.open"
    :title="preset.title"
    :description="preset.description"
    :empty-text="preset.emptyText"
    :columns="preset.columns"
    :items="items"
    :loading="loading"
    @close="onClose"
    @select="onSelect"
  />
</template>

<script>
import { computed } from 'vue'
import { useStore } from '@/store/mainStore.js'
import SimObjectLoadModal from '@/components/simLoadModal/SimObjectLoadModal.vue'
import { getSimLoadModalPreset } from '@/components/simLoadModal/simLoadModalColumns.js'
import { applySimObjectLoadSelection } from '@/components/simLoadModal/simLoadModalHandlers.js'

export default {
  name: 'ModalLoadSimObject',

  components: { SimObjectLoadModal },

  props: {
    /** SIM_LOAD_MODAL_KINDS value — selects preset columns and load handler. */
    kind: {
      type: String,
      required: true
    },
    items: {
      type: Array,
      default: () => []
    },
    /** Optional context passed to kind-specific load handlers. */
    context: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  setup (props) {
    const store = useStore()

    const preset = computed(() => getSimLoadModalPreset(props.kind))

    const onClose = () => {
      store.closeLoadSimObjectModal()
    }

    const onSelect = (item) => {
      applySimObjectLoadSelection(props.kind, item, store, props.context)
    }

    return {
      store,
      preset,
      onClose,
      onSelect
    }
  }
}
</script>
