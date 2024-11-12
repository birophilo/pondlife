<template>
  <div>
    <div v-if="editing === true">
      <select :value="itemForm.condition">
        <option v-for="condition in store.conditions" :value="itemForm.condition">
          {{ condition.conditionName }}
        </option>
      </select>
      <select :value="itemForm.nextAction">
        <option v-for="action in store.actions" :value="itemForm.nextAction">
          {{ action.actionName }}
        </option>
      </select>
      <button @click="saveItem(this.action, this.index)">save</button>
      <button @click="cancelEdit">cancel</button>
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
      <button @click="editItem">edit</button>
      <button @click="deleteItem(this.action, this.index)">delete</button>
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
  data: function () {
    return {
      editing: false,
      itemForm: {}
    }
  },
  methods: {
    populateItemForm: function () {
      this.itemForm = {
        editing: this.transition.editing,
        action: this.transition.action,
        condition: this.transition.condition,
        nextAction: this.transition.nextAction
      }
    },
    saveItem: function (action, transitionIndex) {
      this.editing = false
      const selectedAction = this.store.actions.find(a => a.name === action.name)
      selectedAction.transitions[transitionIndex] = {...this.itemForm}
    },
    deleteItem: function (action, transitionIndex) {
      const selectedAction = this.store.actions.find(a => a.name === action.name)
      selectedAction.transitions.splice(transitionIndex, 1)
    },
    editItem: function () {
      this.populateItemForm()
      this.editing = true
    },
    cancelEdit: function () {
      this.editing = false
      this.itemForm = {}
    }
  }
}

</script>