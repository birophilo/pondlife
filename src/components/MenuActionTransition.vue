<template>
  <div>
    <div v-if="transitionData.editing === true">
      <select :value="transitionData.condition">
        <option v-for="condition in store.conditions" :value="transitionData.condition">
          {{ condition.conditionName }}
        </option>
      </select>
      <select :value="transitionData.nextAction">
        <option v-for="action in store.actions" :value="transitionData.nextAction">
          {{ action.actionName }}
        </option>
      </select>
      <button @click="saveTransition(this.action, this.index)">save</button>
      <button @click="transitionData.editing = false">cancel</button>
    </div>
    <div v-else>
      <table>
        <tr>
          <th>if condition met</th>
          <th>transition to</th>
        </tr>
        <tr v-for="(transition) in action.transitions">
          <td>{{ transition.condition.conditionName }}</td>
          <td>{{ transition.nextAction.actionName }}</td>
        </tr>
      </table>
      <br />
      <button @click="transitionData.editing = true">edit</button>
      <button @click="deleteTransition(this.action, this.index)">delete</button>
    </div>
  </div>
</template>

<script>
import { useStore } from '../store/mainStore.js'

export default {
  name: 'MenuActionTransition',
  setup: function () {
    const store = useStore()
    return { store }
  },
  props: {
    action: Object,
    transition: Object,
    index: Number
  },
  mounted: function () {
    this.setupTransitionData()
  },
  data: function () {
    return {
      transitionData: {}
    }
  },
  methods: {
    setupTransitionData: function () {
      const data = {
        editing: this.transition.editing,
        action: this.transition.action,
        condition: this.transition.condition,
        nextAction: this.transition.nextAction
      }
      this.transitionData = {...data}
    },
    saveTransition: function (action, transitionIndex) {
      this.transitionData.editing = false

      const data = {...this.transitionData}
      const selectedAction = this.store.actions.find(a => a.name === action.name)
      selectedAction.transitions[transitionIndex] = data
    },
    deleteTransition: function (action, transitionIndex) {
      const selectedAction = this.store.actions.find(a => a.name === action.name)
      selectedAction.transitions.splice(transitionIndex, 1)
    }
  }
}

</script>