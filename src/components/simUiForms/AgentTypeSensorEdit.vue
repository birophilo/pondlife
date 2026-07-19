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
      <MenuConfirmBtn @click="saveItem" />
      <MenuCancelBtn @click="cancelEdit" />
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
import MenuConfirmBtn from '@/components/simUi/MenuConfirmBtn.vue'
import MenuCancelBtn from '@/components/simUi/MenuCancelBtn.vue'

export default {
  name: 'AgentTypeSensorEdit',
  components: { MenuConfirmBtn, MenuCancelBtn },
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