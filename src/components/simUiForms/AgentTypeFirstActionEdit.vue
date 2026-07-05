<template>
  <div>
    <div v-if="isEditing">
      <table class="menu-form-table">
        <tr>
          <td class="menu-form-label-cell menu-body-small">starting action</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <select v-model="itemForm" class="menu-input menu-input--field">
              <option :value="null">no action</option>
              <option
                v-for="action in store.actions"
                :key="action.id"
                :value="action.id"
              >
                {{ action.actionName }}
              </option>
            </select>
          </td>
        </tr>
      </table>

      <div class="menu-form-actions">
        <button type="button" class="menu-btn" @click="saveItem">
          save
        </button>
        <button type="button" class="menu-btn" @click="cancelEdit">
          cancel
        </button>
      </div>
    </div>

    <div v-else class="menu-form-item-view">
      <div class="menu-form-item-actions">
        <button
          type="button"
          class="menu-icon-btn"
          aria-label="Edit"
          @click="editItem"
        >
          <Pencil :size="16" aria-hidden="true" />
        </button>
      </div>
      <table class="menu-form-table">
        <tr>
          <td class="menu-form-label-cell menu-body-small">starting action</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ actionLabel(store.firstActions[agentType.name]) }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { Pencil } from '@lucide/vue'
import { useStore } from '@/store/mainStore.js'

export default {
  name: 'AgentTypeFirstActionEdit',

  components: { Pencil },

  props: {
    agentType: Object
  },

  setup (props) {
    const store = useStore()
    const isEditing = ref(false)
    const itemForm = ref(null)

    const actionLabel = (actionId) => {
      if (!actionId) return '—'
      const action = store.actions.find((a) => a.id === actionId)
      return action?.actionName ?? actionId
    }

    const editItem = () => {
      populateItemForm()
      isEditing.value = true
    }

    const cancelEdit = () => {
      isEditing.value = false
      itemForm.value = null
    }

    const populateItemForm = () => {
      itemForm.value = store.firstActions[props.agentType.name]
    }

    const saveItem = () => {
      isEditing.value = false
      store.firstActions[props.agentType.name] = itemForm.value
      store.saveScene()
    }

    return {
      store,
      itemForm,
      isEditing,
      actionLabel,
      editItem,
      cancelEdit,
      saveItem
    }
  }
}
</script>
