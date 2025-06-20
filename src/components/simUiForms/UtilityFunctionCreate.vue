<template>
  <div v-if="isAdding === true" class="utility-function-form">
      property
      <select v-model="itemForm.property">
        <option value="null">--- select property ---</option>
        <option v-for="prop in store.agentProperties" :value="prop.name" :key="prop.name">{{ prop.name }}</option>
      </select>
      function
      <select v-model="itemForm.func">
        <option value="null">--- select function ---</option>
        <option v-for="func in Object.keys(UTILITY_FUNCS)" :value="func" :key="func">{{ func }}</option>
      </select>
      action
      <select v-model="itemForm.actionId">
        <option value="null">--- select action ---</option>
        <option v-for="action in store.actions" :value="action.id" :key="action.id">{{ action.actionName }}</option>
        <option v-for="actionSequence in store.actionSequences" :value="actionSequence.id" :key="actionSequence.id">{{ actionSequence.name }}</option>
      </select>
      agent type
      <select v-model="itemForm.agentType">
        <option value="null">--- select agent type ---</option>
        <option v-for="agentType in Object.keys(store.agentTypes)" :value="agentType" :key="agentType">{{ agentType }}</option>
      </select>
    <button @click="createUtilityFunction">create utility function</button>
    <button @click="isAdding = false">cancel</button>
  </div>
  <div v-else class="utility-function-form">
    <button @click="isAdding = true">new utility function</button>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from '@/store/mainStore.js'
import api from '@/apiCrud.js'
import UTILITY_FUNCS from '@/UTILITY_FUNCS.js'

export default {
  name: 'UtilityFunctionCreate',
  setup: function () {
    const store = useStore()

    const isAdding = ref(false)

    const itemForm = ref({
        property: null,
        actionId: null,
        func: null,
        agentType: null,
      })

    const createUtilityFunction = async () => {
      const newUtilityFunction = {
        property: itemForm.value.property,
        actionId: itemForm.value.actionId,
        func: itemForm.value.func,
        agentType: itemForm.value.agentType
      }

      const sequenceIds = store.actionSequences.map(as => as.id)
      if (sequenceIds.includes(itemForm.value.actionId)) {
        newUtilityFunction.actionObjectType = 'actionSequence'
      } else {
        newUtilityFunction.actionObjectType = 'action'
      }

      const createdItem = await api.createUtilityFunction(newUtilityFunction)
      newUtilityFunction.id = createdItem.id
      store.agentUtilityFunctions.push(newUtilityFunction)

      await store.saveScene()

      isAdding.value = false

      itemForm.value = {
        property: null,
        actionId: null,
        func: null,
        agentType: null
      }
    }

    return {
      store,
      isAdding,
      itemForm,
      createUtilityFunction,
      UTILITY_FUNCS
    }
  }
}
</script>

<style>
.utility-function-form {
  border-top: 1px solid #e8b9ad;
}
</style>
