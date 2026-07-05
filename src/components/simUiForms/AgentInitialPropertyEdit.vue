<template>
  <div>
    <div v-if="isEditing">
      <div>property: <input v-model="itemForm.name" type="text" /></div>
      <div>description: <input v-model="itemForm.description" type="text" /></div>

      <div>value type:
        <select v-model="itemForm.valueType" @change="$forceUpdate()">
            <option :value="{}">-- value type --</option>
            <option
              v-for="choice in valueTypeChoices"
              :value="choice.value">{{ choice.description }}
            </option>
        </select>
      </div>

      <div v-if="itemForm.valueType === 'boolean'">
        <div>initial value:
          <input
            v-model="itemForm.initialValue"
            name="itemBooleanValue"
            :value="true"
            type="radio"
          />
          <label :for="true">true</label>
          <input
            v-model="itemForm.initialValue"
            name="itemBooleanValue"
            :value="false"
            type="radio"
          />
          <label :for="false">false</label>
        </div>
      </div>
      <div v-else-if="itemForm.valueType === 'int'">
        <div>initial value: <input v-model="itemForm.initialValue" type="number" /></div>
      </div>
      <div v-else-if="itemForm.valueType === 'float'">
        <div>initial value: <input v-model="itemForm.initialValue" type="number" /></div>
      </div>
      <div v-else-if="itemForm.valueType === 'string'">
        <div>initial value: <input v-model="itemForm.initialValue" type="text" /></div>
      </div>

      <div>applies to:
        <select v-model="itemForm.applyTo">
          <option
            v-for="choice in applyToChoices"
            :value="choice.value">{{ choice.description }}
          </option>
        </select>
      </div>

      <div v-if="itemForm.applyTo === 'agentType'">
        <div>agent types:</div>
        <div v-for="agentType in Object.keys(store.agentTypes)">
          <input
            class="agent-type-checkbox"
            type="checkbox"
            :id="agentType"
            name="agentTypeForm"
            :value="agentType"
            :checked="itemForm.agentTypes.includes(agentType)"
            @change="handleAgentTypesCheckbox"
          >
          <label :for="agentType" >{{ agentType }}</label><br>
        </div>
      </div>

      <button @click="saveItem">save</button>
      <button @click="cancelEdit">cancel</button>
    </div>

    <div v-else class="agent-property-view">
      <div class="agent-property-actions">
        <button
          type="button"
          class="icon-btn"
          aria-label="Edit"
          @click="editItem"
        >
          <Pencil :size="16" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="icon-btn icon-btn--danger"
          aria-label="Delete"
          @click="deleteItem"
        >
          <X :size="16" aria-hidden="true" />
        </button>
      </div>
      <table class="agent-property-table">
        <tr>
          <td class="agent-property-name-cell">property</td>
          <td class="agent-property-value-cell">{{ agentProperty.name }}</td>
        </tr>
        <tr>

        </tr>
        <tr>
          <td class="agent-property-name-cell">description</td>
          <td class="agent-property-value-cell">{{ agentProperty.description }}</td>
        </tr>
        <tr>
          <td class="agent-property-name-cell">value type</td>
          <td class="agent-property-value-cell">{{ valueTypeLabel(agentProperty.valueType) }}</td>
        </tr>
        <tr>
          <td class="agent-property-name-cell">initial value</td>
          <td class="agent-property-value-cell">{{ agentProperty.initialValue }}</td>
        </tr>
        <tr>
          <td class="agent-property-name-cell">applies to</td>
          <td class="agent-property-value-cell">{{ agentProperty.applyTo }}</td>
        </tr>
        <tr v-if="agentProperty.applyTo === 'agentType'">
          <td class="agent-property-name-cell">agent types</td>
          <td class="agent-property-value-cell">{{ formatAgentTypes(agentProperty.agentTypes) }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { Pencil, X } from '@lucide/vue'
import { useStore } from '@/store/mainStore.js'
import api from '@/apiCrud.js'

export default {
  components: { Pencil, X },
  props: {
    agentProperty: Object,
    index: Number
  },
  setup: function (props) {
    const store = useStore()

    const itemForm = ref({})
    const isEditing = ref(false)

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
      store.agentProperties.splice(props.index, 1)
      api.deleteInitialAgentProperty(props.agentProperty.id)
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
      const selectedAgentTypes = [...document.querySelectorAll('.agent-type-checkbox:checked')].map(e => e.value);
      itemForm.value.agentTypes = selectedAgentTypes
    }

    return {
      store,
      itemForm,
      isEditing,
      editItem,
      saveItem,
      cancelEdit,
      deleteItem,
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

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid #eee;
  background: transparent;
  border-radius: 2px;
  color: #777;
  cursor: pointer;
}

.icon-btn:hover {
  color: #222;
}

.icon-btn--danger:hover {
  color: #b00020;
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
</style>