<template>
  <div>
    <div v-if="isEditing === true">
      sensor:
      <select v-model="itemForm">
        <option :value="null">no action</option>
        <option
          v-for="sensor in store.sensors"
          :value="sensor.id"
        >{{ sensor.name }}</option>
      </select>
      <button @click="saveItem">save</button>
      <button @click="cancelEdit">cancel</button>
    </div>
    <div v-else>
      sensor: {{ agentType.sensor }}
      <button @click="editItem">edit</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from '@/store/mainStore.js'

export default {
  name: 'AgentTypeSensorEdit',
  props: {
    agentType: Object
  },
  setup(props) {

    const store = useStore()
    const isEditing = ref(false)

    const itemForm = ref('')

    const editItem = () => {
      populateItemForm()
      store.firstActions[props.agentType.name]
      isEditing.value = true
    }

    const cancelEdit = () => {
      isEditing.value = false
      itemForm.value = ''
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
      editItem,
      cancelEdit,
      saveItem
    }

  }
}


</script>