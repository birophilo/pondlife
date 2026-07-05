<template>
  <div>
    <div v-if="isAdding">
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

      <div class="menu-form-actions">
        <button type="button" class="menu-btn" @click="createInitialAgentProperty">
          create
        </button>
        <button type="button" class="menu-btn" @click="cancelCreate">
          cancel
        </button>
      </div>
    </div>

    <MenuNewBtn v-else @click="isAdding = true" />
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from '@/store/mainStore.js'
import api from '@/apiCrud.js'
import MenuNewBtn from '@/components/simUi/MenuNewBtn.vue'

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

  components: { MenuNewBtn },

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
      const checkboxes = document.querySelectorAll('.menu-form-checkbox:checked')
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
