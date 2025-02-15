<template>
  <div>
    <table>
      <tbody>
        <tr>
          <th>if condition met</th>
          <th>transition to</th>
        </tr>
        <tr v-for="(transition, index) in action.transitions">
          <td v-if="isEditing === true && editingIndex === index">
            <select v-model="itemForm.condition">
              <option value="">-- select condition --</option>
              <option v-for="condition in store.conditions" :value="condition">
                {{ condition.name }}
              </option>
            </select>
          </td>
          <td v-else>
            {{ getCondition(transition).name }}
          </td>

          <td v-if="isEditing === true && editingIndex === index">
            <select v-model="itemForm.nextAction">
              <option value="">-- select next action --</option>
              <option v-for="action in store.actions" :value="action">
                {{ action.actionName }}
              </option>
            </select>
          </td>
          <td v-else>
            {{ getNextAction(transition).actionName }}
          </td>

          <td v-if="isEditing === true && editingIndex === index">
            <button @click="saveItem(index)">save</button>
          </td>
          <td v-else>
            <button @click="editItem(index)">edit</button>
          </td>

          <td v-if="isEditing === true && editingIndex === index">
            <button @click="cancelEdit(index)">cancel</button>
          </td>
          <td v-else>
            <button @click="deleteItem(index)">delete</button>
          </td>

        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from '../store/mainStore.js'
import api from '../apiCrud'

export default {
  name: 'MenuActionTransition',
  props: {
    action: Object
  },
  setup: function (props) {
    const store = useStore()

    const isEditing = ref(false)
    const editingIndex = ref(null)

    const itemForm = ref({})

    const getCondition = (transition) => store.conditions.find(cond => cond.id === transition.condition)
    const getNextAction = (transition) => store.actions.find(a => a.id === transition.nextAction)

    const populateItemForm = (index) => {
      isEditing.value = false
      itemForm.value = {
        condition: getCondition(props.action.transitions[index]),
        nextAction: getNextAction(props.action.transitions[index])
      }
    }

    const saveItem = (index) => {
      isEditing.value = false
      editingIndex.value = null
      const selectedAction = store.actions.find(a => a.id === props.action.id)
      selectedAction.transitions[index] = {
        condition: itemForm.value.condition.id,
        nextAction: itemForm.value.nextAction.id
      }
      api.updateAction(selectedAction)
    }

    const deleteItem = (index) => {
      const selectedAction = store.actions.find(a => a.id === props.action.id)
      selectedAction.transitions.splice(index, 1)
      api.updateAction(selectedAction)
    }

    const editItem = (index) => {
      populateItemForm(index)
      isEditing.value = true
      editingIndex.value = index
    }

    const cancelEdit = () => {
      isEditing.value = false
      editingIndex.value = null
    }

    return {
      store,
      isEditing,
      editingIndex,
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