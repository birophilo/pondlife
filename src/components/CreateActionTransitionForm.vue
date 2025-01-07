<template>
  <div>
    <div v-if="isAdding === true && itemForm.action === action">
      <select v-model="itemForm.condition">
        <option value=null>-- select condition -- </option>
        <option v-for="condition in store.conditions" :value="condition">
          {{ condition.name }}
        </option>
      </select>
      <select v-model="itemForm.nextAction">
        <option value=null>-- select next action -- </option>
        <option v-for="action in store.actions" :value="action">
          {{ action.actionName }}
        </option>
      </select>
      <button @click="createTransition(action)">add</button> |
      <button @click="cancelAddTransition(action)">cancel</button>
    </div>
    <button @click="isAdding = true; itemForm.action = action">add transition</button>
  </div>
  
</template>

<script>
import { ref } from 'vue'
import { createActionTransitionObject } from '../classes/Action.js'
import { useStore } from '../store/mainStore.js'

export default {
  name: 'CreateActionTransitionForm',
  props: {
    action: Object
  },
  setup: function () {
    const store = useStore()

    const isAdding = ref(false)

    const itemForm = ref({
      condition: null,
      nextAction: null
    })

    const createTransition = (action) => {
      const condition = itemForm.value.condition
      const nextAction = itemForm.value.nextAction

      const transition = createActionTransitionObject(condition, nextAction)
      action.transitions.push(transition)

      itemForm.value.condition = null
      itemForm.value.nextAction = null
      isAdding.value = false
    }

    const cancelAddTransition = () => {
      itemForm.value.condition = null
      itemForm.value.nextAction = null
      isAdding.value = false
    }

    return { store, isAdding, itemForm, createTransition, cancelAddTransition }
  }
}

</script>