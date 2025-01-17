<template>
  <div>
    <div v-if="isEditing === true">
      <select v-model="itemForm.condition">
        <option value="">-- select condition --</option>
        <option v-for="condition in store.conditions" :value="condition">
          {{ condition.name }}
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
        <tbody>
          <tr>
            <th>if condition met</th>
            <th>transition to</th>
          </tr>
          <tr v-for="(transition) in action.transitions">
            <!-- <td>{{ transition.condition.name }}</td>
            <td>{{ transition.nextAction.actionName }}</td> -->
            <td>{{ getCondition(transition).name }}</td>
            <td>{{ getNextAction(transition).actionName }}</td>
          </tr>
        </tbody>
      </table>
      <br />
      <button @click="editItem">edit</button>
      <button @click="deleteItem(this.action)">delete</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from '../store/mainStore.js'
import api from '../apiCrud'

export default {
  name: 'MenuActionTransition',
  props: {
    action: Object,
    transition: Object,
    index: Number
  },
  setup: function (props) {
    const store = useStore()

    const isEditing = ref(false)
    const itemForm = ref({})

    const getCondition = (transition) => store.conditions.find(cond => cond.id === transition.condition)
    const getNextAction = (transition) => store.actions.find(a => a.id === transition.nextAction)

    const populateItemForm = () => {
      isEditing.value = false
      itemForm.value = {
        condition: getCondition(props.transition),
        nextAction: getNextAction(props.transition)
      }
    }

    const saveItem = (action) => {
      isEditing.value = false
      const selectedAction = store.actions.find(a => a.actionName === action.actionName)
      selectedAction.transitions[props.index] = {
        condition: itemForm.value.condition.id,
        nextAction: itemForm.value.nextAction.id
      }
      api.updateAction(selectedAction)
    }

    const deleteItem = (action) => {
      const selectedAction = store.actions.find(a => a.actionName === action.actionName)
      selectedAction.transitions.splice(props.index, 1)
      api.updateAction(selectedAction)
    }

    const editItem = () => {
      populateItemForm()
      isEditing.value = true
    }

    const cancelEdit = () => {
      isEditing.value = false
    }

    return {
      store,
      isEditing,
      itemForm,
      getCondition,
      getNextAction,
      populateItemForm,
      saveItem,
      deleteItem,
      editItem,
      cancelEdit,
    }
  }
}

</script>