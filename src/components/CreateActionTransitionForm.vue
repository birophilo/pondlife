<template>
  <div>
    <div v-if="actionTransitionForm.adding === true && actionTransitionForm.action === action">
      <select v-model="actionTransitionForm.condition">
        <option v-for="condition in store.conditions" :value="condition">
          {{ condition.conditionName }}
        </option>
      </select>
      <select v-model="actionTransitionForm.nextAction">
        <option v-for="action in store.actions" :value="action">
          {{ action.actionName }}
        </option>
      </select>
      <button @click="createTransition(action)">add</button> |
      <button @click="cancelAddTransition(action)">cancel</button>
    </div>
    <button @click="actionTransitionForm.adding = true; actionTransitionForm.action = action">add transition</button>
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
      actionTransitionForm: {
        adding: false,
        action: null,
        condition: null,
        nextAction: null
      }
    }
  },
  methods: {
    createTransition: function (action) {
      const condition = this.actionTransitionForm.condition
      const nextAction = this.actionTransitionForm.nextAction

      const transition = new ActionTransition(condition, nextAction)
      action.transitions.push(transition)

      this.actionTransitionForm.condition = null
      this.actionTransitionForm.nextAction = null
      this.actionTransitionForm.adding = false
    },
    cancelAddTransition: function () {
      this.actionTransitionForm.condition = null
      this.actionTransitionForm.nextAction = null
      this.actionTransitionForm.adding = false
    }
  }
}

</script>