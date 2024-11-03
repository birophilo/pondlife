<template>
  <div>
    <div v-if="propertyChangeData.editing === true">
      <select v-model="propertyChangeData.agent">
        <option value="self">self</option>
        <option v-for="agent in store.agentTypes" :value="agent.config.name">{{ agent.config.name }}</option>
      </select>

      <form name="agentPropChangeRadioSelect">
        <input
          type="radio"
          v-model="propertyChangeData.args.agentChoiceMethod"
          name="agentChoiceMethod"
          value="nearest"
          checked="true"
        />
        <label for="nearest">nearest</label>
        <input
          type="radio"
          v-model="propertyChangeData.args.agentChoiceMethod"
          name="agentChoiceMethod"
          value="specific"
        />
        <label for="specific">specific</label>
        <input
          type="radio"
          v-model="propertyChangeData.args.agentChoiceMethod"
          name="agentChoiceMethod"
          value="all"
        />
        <label for="all">all</label>
      </form>

      <select v-model="propertyChangeData.propertyName">
        <option value="money">money</option>
      </select>
      <select v-model="propertyChangeData.changeType">
        <option value="increase">increase</option>
        <option value="decrease">decrease</option>
      </select>
      <input
        v-model="propertyChangeData.propertyValue"
        type="number"
        placeholder="value"
      />
      <button @click="propertyChangeData.editing = false">save</button>
      <button @click="propertyChangeData.editing = false">cancel</button>
    </div>
    <div v-else>
      <div>change {{ index + 1 }}:</div>
      <input type="text" placeholder="property" :value="propertyChangeData.propertyName" disabled />
      <input type="text" placeholder="change" :value="propertyChangeData.changeType" disabled />
      <input type="number" placeholder="value" :value="propertyChangeData.propertyValue" disabled />
      <button @click="propertyChangeData.editing = true">edit item</button>
      <button @click="deletePropertyChange">delete item</button>
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
  mounted: function () {
    this.setupPropertyChangeData()
  },
  data: function () {
    return {
      propertyChangeData: {}
    }
  },
  methods: {
    setupPropertyChangeData: function () {
      const data = {
        editing: this.propertyChange.editing,
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
      this.propertyChangeData = data
    },
    deletePropertyChange: function (actionToDelete) {
      const action = this.store.actions.find(action => action.name === actionToDelete.name)
      action.propertyChanges.splice(this.index, 1)
    }
  }
}

</script>