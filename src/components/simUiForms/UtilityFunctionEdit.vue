<template>
  <div>
    <div v-if="isEditing === true">
      property
      <select v-model="itemForm.property">
        <option>--- select property ---</option>
        <option v-for="prop in store.agentProperties" :value="prop.name" :key="prop.name">{{ prop.name }}</option>
      </select>
      function
      <select v-model="itemForm.func">
        <option>--- select function ---</option>
        <option v-for="func in Object.keys(UTILITY_FUNCS)" :value="func" :key="func">{{ func }}</option>
      </select>
      action

      <select v-model="itemForm.actionId">
        <option>--- select action ---</option>
        <option v-for="action in store.actions" :value="action.id" :key="action.id">{{ action.actionName }}</option>
        <option v-for="actionSequence in store.actionSequences" :value="actionSequence.id" :key="actionSequence.id">{{ actionSequence.name }}</option>
      </select>
      agent type :::{{ itemForm.agentType }}
      <select v-model="itemForm.agentType">
        <option>--- select agent type ---</option>
        <option v-for="agentType in Object.keys(store.agentTypes)" :value="agentType" :key="agentType">{{ agentType }}</option>
      </select>

      <!-- <input v-model="itemForm.func" type="text" placeholder="func" /><br />
      action: <input v-model="itemForm.actionId" type="text" placeholder="actionId" /><br /> -->
      <button @click="saveItem">save</button>
      <button @click="cancelEdit">cancel</button>
    </div>
    <div v-else>
      <div>{{ utilityFunction.agentType }}: {{ utilityFunction.property }}</div>
      <div>function: {{ utilityFunction.func }}</div>
      <div v-if="utilityFunction.actionObjectType === 'actionSequence'">
        <div>action sequence: {{ store.actionSequences.find(a => a.id === utilityFunction.actionId)?.name }}</div>
      </div>
      <div v-else>
        <div>action: {{ store.actions.find(a => a.id === utilityFunction.actionId)?.actionName }}</div>
      </div>

      <button @click="editItem">edit</button>
      <button @click="deleteItem">delete</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import api from '@/apiCrud.js'
import { useStore } from '@/store/mainStore.js'
import UTILITY_FUNCS from '@/UTILITY_FUNCS.js'

export default {
  name: 'UtilityFunctionEdit',
  props: {
    utilityFunction: Object,
    index: Number
  },
  setup(props) {
    const store = useStore()

    const itemForm = ref({})
    const isEditing = ref(false)

    const populateItemForm = () => {
      itemForm.value = {...props.utilityFunction}
    }

    const saveItem = () => {
      isEditing.value = false
      const payload = {...itemForm.value}
      store.agentUtilityFunctions.splice(props.index, 1, {
        ...store.agentUtilityFunctions[props.index],
        ...itemForm.value
      })
      api.updateUtilityFunction(payload)
    }

    const deleteItem = () => {
      api.deleteUtilityFunction(props.utilityFunction.id)
      store.agentUtilityFunctions.splice(props.index, 1)
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
      cancelEdit,
      UTILITY_FUNCS
    }
  }

}

</script>