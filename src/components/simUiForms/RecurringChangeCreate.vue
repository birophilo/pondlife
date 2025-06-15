<template>
  <div v-if="isAdding === true" class="recurring-change-form">
    agent type
    <select v-model="itemForm.agentType">
      <option value="null">--- select agent type ---</option>
      <option v-for="agentType in Object.keys(store.agentTypes)" :key="agentType" :value="agentType">{{ agentType }}</option>
    </select>
    property
    <select v-model="itemForm.property">
      <option value="null">--- select property ---</option>
      <option v-for="prop in store.agentProperties" :key="prop.name" :value="prop.name">{{ prop.name }}</option>
    </select>
    frame interval
    <input v-model="itemForm.frameInterval" type="number" min="1" />
    change value
    <input v-model="itemForm.change" type="number" step="0.1" />
    <button @click="createRecurringChange">create recurring change</button>
    <button @click="isAdding = false">cancel</button>
  </div>
  <div v-else class="recurring-change-form">
    <button @click="isAdding = true">new recurring change</button>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from '@/store/mainStore.js'
import api from '@/apiCrud.js'

export default {
  name: 'RecurringChangeCreate',
  setup: function () {
    const store = useStore()

    const isAdding = ref(false)

    const itemForm = ref({
      agentType: null,
      property: null,
      frameInterval: 60,
      change: 1
    })

    const createRecurringChange = async () => {
      const newRecurringChange = {
        agentType: itemForm.value.agentType,
        property: itemForm.value.property,
        frameInterval: parseInt(itemForm.value.frameInterval),
        change: parseFloat(itemForm.value.change)
      }

      const createdItem = await api.createRecurringChange(newRecurringChange)
      newRecurringChange.id = createdItem.id
      store.ungroupedRecurringChanges.push(newRecurringChange)
      store.groupRecurringChanges()

      await store.saveScene()

      isAdding.value = false

      itemForm.value = {
        agentType: null,
        property: null,
        frameInterval: 60,
        change: 1
      }
    }

    return {
      store,
      isAdding,
      itemForm,
      createRecurringChange
    }
  }
}
</script>

<style>
.recurring-change-form {
  border-top: 1px solid #e8b9ad;
}
</style> 