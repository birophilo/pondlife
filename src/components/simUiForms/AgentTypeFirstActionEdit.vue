<template>
  <div>
    <div v-if="isEditing === true">
      starting action:
      <select v-model="itemForm">
        <option :value="null">no action</option>
        <option
          v-for="action in store.actions"
          :value="action.id"
        >{{ action.actionName }}</option>
      </select>
      <button @click="saveItem">save</button>
      <button @click="cancelEdit">cancel</button>
    </div>
    <div v-else>
      starting action: {{ store.firstActions[agentType.name] }}
      <button @click="editItem">edit</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from '@/store/mainStore.js'

export default {
  name: 'AgentTypeFirstActionEdit',
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