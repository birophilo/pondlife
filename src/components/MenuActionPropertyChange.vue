<template>
  <div>
    <div v-if="isEditing === true">
      <select v-model="itemForm.agentType">
        <option value="self">self</option>
        <option v-for="agentType in store.agentTypes" :value="agentType.name">{{ agentType.name }}</option>
      </select>

      <form name="agentPropChangeRadioSelect">
        <input
          type="radio"
          v-model="itemForm.args.agentChoiceMethod"
          name="agentChoiceMethod"
          value="nearest"
          checked="true"
        />
        <label for="nearest">nearest</label>
        <input
          type="radio"
          v-model="itemForm.args.agentChoiceMethod"
          name="agentChoiceMethod"
          value="specific"
        />
        <label for="specific">specific</label>
        <input
          type="radio"
          v-model="itemForm.args.agentChoiceMethod"
          name="agentChoiceMethod"
          value="all"
        />
        <label for="all">all</label>
      </form>

      <select v-model="itemForm.propertyName">
        <option value="money">money</option>
      </select>
      <select v-model="itemForm.changeType">
        <option value="increase">increase</option>
        <option value="decrease">decrease</option>
      </select>
      <input
        v-model="itemForm.propertyValue"
        type="number"
        placeholder="value"
      />
      <button @click="saveItem">save</button>
      <button @click="cancelEdit">cancel</button>
    </div>
    <div v-else>
      <div>change {{ index + 1 }}: {{ propertyChange.description() }}</div>
      <button @click="editItem">edit item</button>
      <button @click="deleteItem">delete item</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from '../store/mainStore.js'

export default {
  name: 'MenuActionPropertyChange',
  props: {
    action: Object,
    propertyChange: Object,
    index: Number
  },
  setup: function (props) {
    const store = useStore()

    const isEditing = ref(false)
    const itemForm = ref({})

    const populateItemForm = () => {
      itemForm.value = {
        agent: props.propertyChange.agent,
        agentType: props.propertyChange.agentType,
        args: {
          agentChoiceMethod: props.propertyChange.args.agentChoiceMethod
        },
        target: props.propertyChange.target,
        propertyName: props.propertyChange.propertyName,
        changeType: props.propertyChange.changeType,
        propertyValue: props.propertyChange.propertyValue
      }
    }

    const saveItem = () => {
      isEditing.value = false
      const keys = Object.keys(itemForm.value)
      var action = store.actions.find(act => act.actionName === props.action.actionName)
      var propChange = action.propertyChanges[props.index]
      keys.forEach(key => {
          if (key === 'args') {
            propChange.args = {...itemForm.value.args}
          } else {
            propChange[key] = itemForm.value[key]
          }
        }
      )
    }

    const deleteItem = (actionToDelete) => {
      const action = store.actions.find(action => action.actionName === actionToDelete.actionName)
      action.propertyChanges.splice(props.index, 1)
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
      isEditing,
      itemForm,
      populateItemForm,
      saveItem,
      deleteItem,
      editItem,
      cancelEdit
    }
  }
}

</script>