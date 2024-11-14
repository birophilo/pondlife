<template>
  <div>
    <div v-if="adding === true && itemForm.action === action">
      <select v-model="itemForm.condition">
        <option v-for="condition in store.conditions" :value="condition">
          {{ condition.conditionName }}
        </option>
      </select>
      <select v-model="itemForm.nextAction">
        <option v-for="action in store.actions" :value="action">
          {{ action.actionName }}
        </option>
      </select>
      <button @click="createTransition(action)">add</button> |
      <button @click="cancelAddTransition(action)">cancel</button>
    </div>
    <button @click="adding = true; itemForm.action = action">add transition</button>
  </div>
  
</template>

<script>
import { ActionTransition } from '../classes/Action.js'
import { useStore } from '../store/mainStore.js'

export default {
  name: 'CreateActionTransitionForm',
  setup: function () {
    const store = useStore()
    return { store }
  },
  props: {
    action: Object
  },
  data: function () {
    return {
      adding: false,
      itemForm: {
        action: null,
        condition: null,
        nextAction: null
      }
    }
  },
  methods: {
    createTransition: function (action) {
      const condition = this.itemForm.condition
      const nextAction = this.itemForm.nextAction

      const transition = new ActionTransition(condition, nextAction)
      action.transitions.push(transition)

      this.itemForm.condition = null
      this.itemForm.nextAction = null
      this.adding = false
    },
    cancelAddTransition: function () {
      this.itemForm.condition = null
      this.itemForm.nextAction = null
      this.adding = false
    }
  }
}

</script>