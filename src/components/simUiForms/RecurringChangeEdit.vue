<template>
  <div>
    <div v-if="isEditing">
      <table class="menu-form-table">
        <tr>
          <td class="menu-form-label-cell menu-body-small">agent type</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <select v-model="itemForm.agentType" class="menu-input menu-input--field">
              <option value="">--- select agent type ---</option>
              <option
                v-for="agentType in Object.keys(store.agentTypes)"
                :key="agentType"
                :value="agentType"
              >
                {{ agentType }}
              </option>
            </select>
          </td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">property</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <select v-model="itemForm.property" class="menu-input menu-input--field">
              <option value="">--- select property ---</option>
              <option
                v-for="prop in store.agentProperties"
                :key="prop.name"
                :value="prop.name"
              >
                {{ prop.name }}
              </option>
            </select>
          </td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">frame interval</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <input
              v-model="itemForm.frameInterval"
              type="number"
              min="1"
              class="menu-input menu-input--field"
            />
          </td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">change value</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <input
              v-model="itemForm.change"
              type="number"
              step="0.1"
              class="menu-input menu-input--field"
            />
          </td>
        </tr>
      </table>

      <div class="menu-form-actions">
        <MenuConfirmBtn @click="saveItem" />
        <MenuCancelBtn @click="cancelEdit" />
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
        <button
          type="button"
          class="menu-icon-btn menu-icon-btn--danger"
          aria-label="Delete"
          @click="deleteItem"
        >
          <Trash2 :size="16" aria-hidden="true" />
        </button>
      </div>
      <table class="menu-form-table">
        <tr>
          <td class="menu-form-label-cell menu-body-small">agent type</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ recurringChange.agentType }}</td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">property</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ recurringChange.property }}</td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">frame interval</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ recurringChange.frameInterval }}</td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">change value</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ recurringChange.change }}</td>
        </tr>
      </table>
    </div>

    <ConfirmSimDeleteModal
      :open="deleteConfirmOpen"
      entity-type-label="recurring change"
      :entity-name="recurringChangeLabel"
      :deleting="deleteInProgress"
      @close="closeDeleteConfirm"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { Pencil, Trash2 } from '@lucide/vue'
import api from '@/apiCrud.js'
import { useStore } from '@/store/mainStore.js'
import ConfirmSimDeleteModal from '@/components/ConfirmSimDeleteModal.vue'
import MenuConfirmBtn from '@/components/simUi/MenuConfirmBtn.vue'
import MenuCancelBtn from '@/components/simUi/MenuCancelBtn.vue'

export default {
  name: 'RecurringChangeEdit',

  components: { Pencil, Trash2, ConfirmSimDeleteModal, MenuConfirmBtn, MenuCancelBtn },

  props: {
    recurringChange: Object,
    index: Number
  },

  setup (props) {
    const store = useStore()

    const itemForm = ref({})
    const isEditing = ref(false)
    const deleteConfirmOpen = ref(false)
    const deleteInProgress = ref(false)

    const recurringChangeLabel = computed(() => {
      const { agentType, property } = props.recurringChange
      if (agentType && property) return `${agentType}: ${property}`
      return agentType || property || '—'
    })

    const populateItemForm = () => {
      itemForm.value = { ...props.recurringChange }
    }

    const saveItem = () => {
      isEditing.value = false
      const payload = { ...itemForm.value }
      store.ungroupedRecurringChanges.splice(props.index, 1, {
        ...store.ungroupedRecurringChanges[props.index],
        ...itemForm.value
      })
      store.groupRecurringChanges()
      api.updateRecurringChange(payload)
    }

    const deleteItem = () => {
      deleteConfirmOpen.value = true
    }

    const closeDeleteConfirm = () => {
      deleteConfirmOpen.value = false
    }

    const confirmDelete = async () => {
      if (deleteInProgress.value) return
      deleteInProgress.value = true
      try {
        await api.deleteRecurringChange(props.recurringChange.id)
        store.ungroupedRecurringChanges.splice(props.index, 1)
        store.groupRecurringChanges()
        await store.saveScene()
        deleteConfirmOpen.value = false
      } finally {
        deleteInProgress.value = false
      }
    }

    const editItem = () => {
      populateItemForm()
      isEditing.value = true
    }

    const cancelEdit = () => {
      isEditing.value = false
      itemForm.value = {}
    }

    return {
      store,
      itemForm,
      isEditing,
      recurringChangeLabel,
      saveItem,
      deleteItem,
      closeDeleteConfirm,
      confirmDelete,
      deleteConfirmOpen,
      deleteInProgress,
      editItem,
      cancelEdit
    }
  }
}
</script>
