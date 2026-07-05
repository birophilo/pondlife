<template>
  <div>
    <div v-if="isAdding" class="agent-property-create">
      <table class="agent-property-table">
        <tr>
          <td class="agent-property-name-cell">property</td>
          <td class="agent-property-value-cell">
            <input
              v-model="itemForm.name"
              type="text"
              class="agent-property-input"
            />
          </td>
        </tr>
        <tr>
          <td class="agent-property-name-cell">description</td>
          <td class="agent-property-value-cell">
            <input
              v-model="itemForm.description"
              type="text"
              class="agent-property-input"
            />
          </td>
        </tr>
        <tr>
          <td class="agent-property-name-cell">value type</td>
          <td class="agent-property-value-cell">
            <select
              v-model="itemForm.valueType"
              class="agent-property-input"
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
          <td class="agent-property-name-cell">initial value</td>
          <td class="agent-property-value-cell">
            <label class="agent-property-radio">
              <input
                v-model="itemForm.initialValue"
                name="itemBooleanValue"
                :value="true"
                type="radio"
              />
              true
            </label>
            <label class="agent-property-radio">
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
          <td class="agent-property-name-cell">initial value</td>
          <td class="agent-property-value-cell">
            <input
              v-model="itemForm.initialValue"
              type="number"
              class="agent-property-input"
            />
          </td>
        </tr>
        <tr v-else-if="itemForm.valueType === 'string'">
          <td class="agent-property-name-cell">initial value</td>
          <td class="agent-property-value-cell">
            <input
              v-model="itemForm.initialValue"
              type="text"
              class="agent-property-input"
            />
          </td>
        </tr>
        <tr>
          <td class="agent-property-name-cell">applies to</td>
          <td class="agent-property-value-cell">
            <select v-model="itemForm.applyTo" class="agent-property-input">
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
          <td class="agent-property-name-cell">agent types</td>
          <td class="agent-property-value-cell">
            <div
              v-for="agentType in Object.keys(store.agentTypes)"
              :key="agentType"
              class="agent-property-checkbox-row"
            >
              <input
                class="agent-type-checkbox"
                type="checkbox"
                :id="`create-${agentType}`"
                name="agentTypeForm"
                :value="agentType"
                :checked="itemForm.agentTypes.includes(agentType)"
                @change="handleAgentTypesCheckbox"
              />
              <label :for="`create-${agentType}`">{{ agentType }}</label>
            </div>
          </td>
        </tr>
      </table>

      <div class="agent-property-form-actions">
        <button type="button" class="form-action-btn" @click="createInitialAgentProperty">
          create
        </button>
        <button type="button" class="form-action-btn" @click="cancelCreate">
          cancel
        </button>
      </div>
    </div>

    <div v-else>
      <button
        type="button"
        class="new-btn"
        @click="isAdding = true"
      >
        <span>new</span>
        <Plus :size="16" class="icon-btn--small" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { Plus } from '@lucide/vue'
import { useStore } from '@/store/mainStore.js'
import api from '@/apiCrud.js'

const DEFAULT_FORM = {
  name: '',
  description: '',
  valueType: '',
  initialValue: '',
  applyTo: 'agentType',
  agentTypes: []
}

export default {
  name: 'AgentInitialPropertyCreate',

  components: { Plus },

  setup () {
    const store = useStore()
    const isAdding = ref(false)
    const itemForm = ref({ ...DEFAULT_FORM })

    const createInitialAgentProperty = async () => {
      const agentProperty = { ...itemForm.value }
      const createdItem = await api.createInitialAgentProperty(agentProperty)
      agentProperty.id = createdItem.id
      store.agentProperties.push(agentProperty)

      await store.saveScene()

      isAdding.value = false
      itemForm.value = { ...DEFAULT_FORM }
    }

    const applyToChoices = [
      { value: '', description: '--- applies to ---' },
      { value: 'agentType', description: 'all agents of given type' },
      { value: 'individual', description: 'individual agents' }
    ]

    const valueTypeChoices = [
      { value: 'string', description: 'text' },
      { value: 'int', description: 'whole number' },
      { value: 'float', description: 'decimal' },
      { value: 'boolean', description: 'true or false' }
    ]

    const handleAgentTypesCheckbox = () => {
      const checkboxes = document.querySelectorAll('.agent-type-checkbox:checked')
      itemForm.value.agentTypes = [...checkboxes].map((e) => e.value)
    }

    const cancelCreate = () => {
      isAdding.value = false
      itemForm.value = { ...DEFAULT_FORM }
    }

    return {
      store,
      isAdding,
      itemForm,
      applyToChoices,
      valueTypeChoices,
      cancelCreate,
      handleAgentTypesCheckbox,
      createInitialAgentProperty
    }
  }
}
</script>

<style scoped>
.new-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 4px;
  color: #444;
  cursor: pointer;
}

.agent-property-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #bbb;
  margin-bottom: 10px;
}

.agent-property-table td {
  border: 1px solid #bbb;
  padding: 7px;
}

.agent-property-name-cell {
  width: 120px;
  font-size: 0.8em;
  font-family: 'Lucida Console', monospace;
  color: #333;
}

.agent-property-value-cell {
  font-size: 0.8em;
  font-family: 'Lucida Console', monospace;
  font-weight: bold;
  color: #333;
}

.agent-property-input {
  width: 100%;
  box-sizing: border-box;
  font: inherit;
  font-weight: bold;
  color: inherit;
  border: none;
  background: transparent;
  padding: 0;
}

.agent-property-input:focus {
  outline: 1px solid #999;
  outline-offset: 1px;
}

.agent-property-checkbox-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  font-weight: normal;
}

.agent-property-checkbox-row:last-child {
  margin-bottom: 0;
}

.agent-property-radio {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-right: 12px;
  font-weight: normal;
}

.agent-property-form-actions {
  display: flex;
  gap: 8px;
}

.form-action-btn {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  font-size: 0.85em;
  color: #444;
  cursor: pointer;
}

.form-action-btn:hover {
  background: #f5f5f5;
}
</style>
