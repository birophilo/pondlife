<template>
  <div>
    <div v-if="editing === true">
      <select v-model="itemForm.agent">
        <option value="self">self</option>
        <option v-for="agent in store.agentTypes" :value="agent.config.name">{{ agent.config.name }}</option>
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
      <div>change {{ index + 1 }}:</div>
      <input type="text" placeholder="property" :value="propertyChangeData.propertyName" disabled />
      <input type="text" placeholder="change" :value="propertyChangeData.changeType" disabled />
      <input type="number" placeholder="value" :value="propertyChangeData.propertyValue" disabled />
      <button @click="editItem">edit item</button>
      <button @click="deleteItem">delete item</button>
    </div>
  </div>
</template>

<script>
import { useStore } from '../store/mainStore.js'

export default {
  name: 'MenuActionPropertyChange',
  setup: function () {
    const store = useStore()
    return { store }
  },
  props: {
    action: Object,
    propertyChange: Object,
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
        agent: this.propertyChange.agent,
        agentType: this.propertyChange.agentType,
        args: {
          agentChoiceMethod: this.propertyChange.args.agentChoiceMethod
        },
        target: this.propertyChange.target,
        propertyName: this.propertyChange.propertyName,
        changeType: this.propertyChange.changeType,
        propertyValue: this.propertyChange.propertyValue
      }
    },
    saveItem: function () {
      this.editing = false
      const keys = Object.keys(this.itemForm)
      var action = this.store.actions.find(act => act.name === this.action.name)
      var propChange = action.propertyChanges[this.i]
      keys.forEach(key => {
          if (key === 'args') {
            propChange.args = {...this.itemForm.args}
          } else {
            propChange[key] = this.itemForm[key]
          }
        }
      )
    },
    deleteItem: function (actionToDelete) {
      const action = this.store.actions.find(action => action.name === actionToDelete.name)
      action.propertyChanges.splice(this.index, 1)
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