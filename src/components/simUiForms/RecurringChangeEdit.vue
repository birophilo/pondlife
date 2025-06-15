<template>
  <div>
    <div v-if="isEditing === true">
      agent type
      <select v-model="itemForm.agentType">
        <option>--- select agent type ---</option>
        <option v-for="agentType in Object.keys(store.agentTypes)" :key="agentType" :value="agentType">{{ agentType }}</option>
      </select>
      property
      <select v-model="itemForm.property">
        <option>--- select property ---</option>
        <option v-for="prop in store.agentProperties" :key="prop.name" :value="prop.name">{{ prop.name }}</option>
      </select>
      frame interval
      <input v-model="itemForm.frameInterval" type="number" min="1" />
      change value
      <input v-model="itemForm.change" type="number" step="0.1" />
      <button @click="saveItem">save</button>
      <button @click="cancelEdit">cancel</button>
    </div>
    <div v-else>
      <div>{{ recurringChange.agentType }}: {{ recurringChange.property }}</div>
      <div>frame interval: {{ recurringChange.frameInterval }}</div>
      <div>change value: {{ recurringChange.change }}</div>
      <button @click="editItem">edit</button>
      <button @click="deleteItem">delete</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import api from '@/apiCrud.js'
import { useStore } from '@/store/mainStore.js'

export default {
  name: 'RecurringChangeEdit',
  props: {
    recurringChange: Object,
    index: Number
  },
  setup(props) {
    const store = useStore()

    const itemForm = ref({})
    const isEditing = ref(false)

    const populateItemForm = () => {
      itemForm.value = {...props.recurringChange}
    }

    const saveItem = () => {
      isEditing.value = false
      const payload = {...itemForm.value}
      store.ungroupedRecurringChanges.splice(props.index, 1, {
        ...store.ungroupedRecurringChanges[props.index],
        ...itemForm.value
      })
      store.groupRecurringChanges()
      api.updateRecurringChange(payload)
    }

    const deleteItem = () => {
      api.deleteRecurringChange(props.recurringChange.id)
      store.ungroupedRecurringChanges.splice(props.index, 1)
      store.groupRecurringChanges()
    }

    const editItem = () => {
      populateItemForm()
      isEditing.value = true
    }

    const cancelEdit = () => {
      isEditing.value = false
      itemForm.value = {}
    }

    return {
      store,
      itemForm,
      isEditing,
      saveItem,
      deleteItem,
      editItem,
      cancelEdit
    }
  }
}
</script> 