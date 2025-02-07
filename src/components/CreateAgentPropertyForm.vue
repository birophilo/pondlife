<template>
  <div>
    <div v-if="isAdding">
      <div>property: <input v-model="itemForm.name" type="text" /></div>
      <div>description: <input v-model="itemForm.description" type="text" /></div>

      <div>applies to:
        <select v-model="itemForm.applyTo">
            <!-- <option :value="{}">-- applies to --</option> -->
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
          <label for="">true</label>
          <input
            v-model="itemForm.initialValue"
            name="itemBooleanValue"
            :value="false"
            type="radio"
          />
          <label for="nearest">false</label>
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

      <button @click="createInitialAgentProperty">create</button>
      <button @click="cancelCreate">cancel</button>
    </div>

    <div v-else>
      <button @click="isAdding = true">new initial property</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from '../store/mainStore.js'
import api from '../apiCrud.js'


export default {
  name: 'CreateAgentPropertyForm',
  setup: function () {
    const store = useStore()

    const isAdding = ref(false)

    const itemForm = ref({
      name: '',
      valueType: '',
      initialValue: '',
      applyTo: 'agentType',
      agentTypes: []

    })

    const createInitialAgentProperty = async () => {
      const agentProperty = {...itemForm.value}
      const createdItem = await api.createInitialAgentProperty(agentProperty)
      agentProperty.id = createdItem.id
      store.agentProperties.push(agentProperty)

      await store.saveScene()

      isAdding.value = false
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

    const handleAgentTypesCheckbox = () => {
      const checkboxes = document.querySelectorAll('.agent-type-checkbox:checked')
      const selectedAgentTypes = [...checkboxes].map(e => e.value);
      itemForm.value.agentTypes = selectedAgentTypes
    }

    return {
      store,
      isAdding,
      itemForm,
      applyToChoices,
      valueTypeChoices,
      handleAgentTypesCheckbox,
      createInitialAgentProperty
    }
  }
}

</script>
