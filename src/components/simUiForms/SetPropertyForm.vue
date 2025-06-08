<template>
  <div>
    <div v-if="isAdding === false" class="add-container">
      <button @click="isAdding = true">new property +</button>
    </div>
    <div v-else>
      <input v-model="propertyForm.propertyName" type="text" placeholder="name" />
      <input v-model="propertyForm.propertyValue" type="number" placeholder="0" />
      <button @click="setAgentProperty">add</button> |
      <button @click="cancelSetAgentProperty">cancel</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from '@/store/mainStore.js'
import { AgentHandler } from '@/classes/Agent'

export default {
  name: 'SetPropertyForm',
  setup: function () {
    const store = useStore()

    const isAdding = ref(false)

    const propertyForm = ref({
        propertyName: '',
        propertyValue: 0
      })

    const agentHandler = new AgentHandler()

    const setAgentProperty = () => {
      const propName = propertyForm.value.propertyName
      const propValue = Number(propertyForm.value.propertyValue)
      agentHandler.setProperty(propName, propValue, store.selectedAgent)
      propertyForm.value.propertyName = ''
      propertyForm.value.propertyValue = 0
      isAdding.value = false
    }

    const cancelSetAgentProperty = () => {
      propertyForm.value.propertyName = ''
      propertyForm.value.propertyValue = 0
      isAdding.value = false
    }

    return { store, isAdding, propertyForm, setAgentProperty, cancelSetAgentProperty }
  }
}

</script>9