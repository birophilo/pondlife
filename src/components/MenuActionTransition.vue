<template>
  <div>
    <div v-if="editing === true">
      <select v-model="itemForm.condition">
        <option value="">-- select condition --</option>
        <option v-for="condition in store.conditions" :value="condition">
          {{ condition.conditionName }}
        </option>
      </select>
      <select v-model="itemForm.nextAction">
        <option value="">-- select next action --</option>
        <option v-for="action in store.actions" :value="action">
          {{ action.actionName }}
        </option>
      </select>
      <button @click="saveItem(this.action)">save</button>
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
      <button @click="deleteItem(this.action)">delete</button>
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
      this.editing = false
      this.itemForm = {
        condition: this.transition.condition,
        nextAction: this.transition.nextAction
      }
    },
    saveItem: function (action) {
      this.editing = false
      const selectedAction = this.store.actions.find(a => a.actionName === action.actionName)
      selectedAction.transitions[this.index] = {
        condition: this.itemForm.condition,
        nextAction: this.itemForm.nextAction
      }
    },
    deleteItem: function (action) {
      const selectedAction = this.store.actions.find(a => a.actionName === action.actionName)
      selectedAction.transitions.splice(this.index, 1)
    },
    editItem: function () {
      this.populateItemForm()
      this.editing = true
    },
    cancelEdit: function () {
      this.editing = false
    }
  }
}

</script>