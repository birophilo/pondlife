<template>
  <div>
    <div v-if="isEditing" ref="editFormRef">
      <table class="menu-form-table">
        <tr>
          <td class="menu-form-label-cell menu-body-small">property</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <input
              v-model="itemForm.name"
              type="text"
              class="menu-input menu-input--field"
            />
          </td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">description</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <input
              v-model="itemForm.description"
              type="text"
              class="menu-input menu-input--field"
            />
          </td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">value type</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <select
              v-model="itemForm.valueType"
              class="menu-input menu-input--field"
              @change="$forceUpdate()"
            >
              <option value="">-- value type --</option>
              <option
                v-for="choice in valueTypeChoices"
                :key="choice.value"
                :value="choice.value"
              >
                {{ choice.description }}
              </option>
            </select>
          </td>
        </tr>
        <tr v-if="itemForm.valueType === 'boolean'">
          <td class="menu-form-label-cell menu-body-small">initial value</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <label class="menu-radio-label">
              <input
                v-model="itemForm.initialValue"
                name="itemBooleanValue"
                :value="true"
                type="radio"
              />
              true
            </label>
            <label class="menu-radio-label">
              <input
                v-model="itemForm.initialValue"
                name="itemBooleanValue"
                :value="false"
                type="radio"
              />
              false
            </label>
          </td>
        </tr>
        <tr v-else-if="itemForm.valueType === 'int' || itemForm.valueType === 'float'">
          <td class="menu-form-label-cell menu-body-small">initial value</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <input
              v-model="itemForm.initialValue"
              type="number"
              class="menu-input menu-input--field"
            />
          </td>
        </tr>
        <tr v-else-if="itemForm.valueType === 'string'">
          <td class="menu-form-label-cell menu-body-small">initial value</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <input
              v-model="itemForm.initialValue"
              type="text"
              class="menu-input menu-input--field"
            />
          </td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">applies to</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <select v-model="itemForm.applyTo" class="menu-input menu-input--field">
              <option
                v-for="choice in applyToChoices"
                :key="choice.value"
                :value="choice.value"
              >
                {{ choice.description }}
              </option>
            </select>
          </td>
        </tr>
        <tr v-if="itemForm.applyTo === 'agentType'">
          <td class="menu-form-label-cell menu-body-small">agent types</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <div
              v-for="agentType in Object.keys(store.agentTypes)"
              :key="agentType"
              class="menu-checkbox-row"
            >
              <input
                class="menu-form-checkbox"
                type="checkbox"
                :id="`edit-${index}-${agentType}`"
                name="agentTypeForm"
                :value="agentType"
                :checked="itemForm.agentTypes.includes(agentType)"
                @change="handleAgentTypesCheckbox"
              />
              <label :for="`edit-${index}-${agentType}`">{{ agentType }}</label>
            </div>
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

    <div v-else class="agent-property-view">
      <div class="agent-property-actions">
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
          <X :size="16" aria-hidden="true" />
        </button>
      </div>
      <table class="menu-form-table">
        <tr>
          <td class="menu-form-label-cell menu-body-small">property</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ agentProperty.name }}</td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">description</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ agentProperty.description }}</td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">value type</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ valueTypeLabel(agentProperty.valueType) }}</td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">initial value</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ agentProperty.initialValue }}</td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">applies to</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ agentProperty.applyTo }}</td>
        </tr>
        <tr v-if="agentProperty.applyTo === 'agentType'">
          <td class="menu-form-label-cell menu-body-small">agent types</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ formatAgentTypes(agentProperty.agentTypes) }}</td>
        </tr>
      </table>
    </div>

    <ConfirmSimDeleteModal
      :open="deleteConfirmOpen"
      entity-type-label="agent initial property"
      :entity-name="agentProperty.name || '—'"
      :deleting="deleteInProgress"
      @close="closeDeleteConfirm"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script>
import { ref } from 'vue'
import { Pencil, X } from '@lucide/vue'
import { useStore } from '@/store/mainStore.js'
import api from '@/apiCrud.js'
import ConfirmSimDeleteModal from '@/components/ConfirmSimDeleteModal.vue'

export default {
  components: { Pencil, X, ConfirmSimDeleteModal },
  props: {
    agentProperty: Object,
    index: Number
  },
  setup: function (props) {
    const store = useStore()

    const itemForm = ref({})
    const isEditing = ref(false)
    const editFormRef = ref(null)
    const deleteConfirmOpen = ref(false)
    const deleteInProgress = ref(false)

    const saveItem = () => {
      isEditing.value = false
      const keys = Object.keys(props.agentProperty)
      api.updateInitialAgentProperty(itemForm.value)
      keys.forEach(key => store.agentProperties[props.index][key] = itemForm.value[key])
    }

    const editItem = () => {
      populateItemForm()
      isEditing.value = true
    }

    const cancelEdit = () => {
      isEditing.value = false
      itemForm.value = {}
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
        store.agentProperties.splice(props.index, 1)
        await api.deleteInitialAgentProperty(props.agentProperty.id)
        deleteConfirmOpen.value = false
      } finally {
        deleteInProgress.value = false
      }
    }

    const populateItemForm = () => {
      itemForm.value = {...props.agentProperty}
    }

    const applyToChoices = [
      {value: "", description: "--- applies to ---"},
      {value: "agentType", description: "all agents of given type"},
      {value: "individual", description: "individual agents"}
    ]

    const valueTypeChoices = [
      {value: "string", description: "text"},
      {value: "int", description: "whole number"},
      {value: "float", description: "decimal"},
      {value: "boolean", description: "true or false"}
    ]

    const valueTypeLabel = (value) => {
      const choice = valueTypeChoices.find((c) => c.value === value)
      return choice?.description ?? value ?? '—'
    }

    const formatAgentTypes = (agentTypes) => {
      if (!Array.isArray(agentTypes) || agentTypes.length === 0) return '—'
      return agentTypes.join(', ')
    }

    const handleAgentTypesCheckbox = () => {
      const root = editFormRef.value
      if (!root) return
      const checkboxes = root.querySelectorAll('.menu-form-checkbox:checked')
      itemForm.value.agentTypes = [...checkboxes].map((e) => e.value)
    }

    return {
      store,
      itemForm,
      isEditing,
      editFormRef,
      editItem,
      saveItem,
      cancelEdit,
      deleteItem,
      closeDeleteConfirm,
      confirmDelete,
      deleteConfirmOpen,
      deleteInProgress,
      applyToChoices,
      valueTypeChoices,
      valueTypeLabel,
      formatAgentTypes,
      handleAgentTypesCheckbox
    }
  }
}

</script>

<style scoped>
.agent-property-view {
  position: relative;
}

.agent-property-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
