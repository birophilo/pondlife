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

      <button @click="saveItem">save</button>
      <button @click="cancelEdit">cancel</button>
    </div>

    <div v-else>
      <div>property: {{ agentProperty.name }}</div>
      <div>description: {{ agentProperty.description }}</div>
      <div>value type: {{ agentProperty.valueType }}</div>
      <div>initial value: {{ agentProperty.initialValue }}</div>
      <div>applies to: {{ agentProperty.applyTo }}</div>
      <div v-if="agentProperty.applyTo === 'agentType'">
        <div>agent types: {{ agentProperty.agentType }}</div>
      </div>
      <br />
      <button @click="editItem">edit</button>
      <button @click="deleteItem(index)">delete</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from '../store/mainStore.js'

export default {
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
      store.updateInitialAgentProperty(itemForm.value)
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
      store.deleteInitialAgentProperty(props.agentProperty.id)
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
      handleAgentTypesCheckbox
    }
  }
}

</script>