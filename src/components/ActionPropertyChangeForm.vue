<template>
  <div>
    <!-- (ACTION) PROPERTY CHANGE ITEM CREATE FORM -->
    <div v-if="propertyChangeForm.adding === true">
      <select v-model="propertyChangeForm.agentType">
        <option value="">-- agent --</option>
        <option value="self">self</option>
        <option v-for="agent in store.agentTypes" :value="agent.config.name">{{ agent.config.name }}</option>
        <option value="lemonadeStall">lemonade stall</option>
      </select>

      <form name="agentPropChangeRadioCreate">
        <input
          type="radio"
          v-model="propertyChangeForm.agentChoiceMethod"
          name="agentChoiceMethod"
          value="nearest"
          checked="true"
        />
        <label for="nearest">nearest</label>
        <input
          type="radio"
          v-model="propertyChangeForm.agentChoiceMethod"
          name="agentChoiceMethod"
          value="specific"
        />
        <label for="specific">specific</label>
        <input
          type="radio"
          v-model="propertyChangeForm.agentChoiceMethod"
          name="agentChoiceMethod"
          value="all"
        />
        <label for="all">all</label>
      </form>

      <div v-if="propertyChangeForm.agentChoiceMethod === 'specific'">
        <select v-model="propertyChangeForm.target">
          <option value="">-- select agent --</option>
          <option
            v-for="agent in store.agentItems[propertyChangeForm.agentType]"
            :value="agent"
          >
            {{ agent.name }}
          </option>
        </select>
      </div>

      <select v-model="propertyChangeForm.property">
        <option value="">--  property --</option>
        <option v-for="property in Object.keys(store.selectedAgent.stateData)" :value="property">{{ property }}</option>
      </select>
      <select v-model="propertyChangeForm.change">
        <option value="">-- change --</option>
        <option value="increase">increase</option>
        <option value="decrease">decrease</option>
      </select>
      <input
        v-model="propertyChangeForm.value"
        type="number"
        placeholder="value"
      />
      <button @click="createPropertyChangeItem(action)">save</button>
      <button @click="propertyChangeForm.adding = false">cancel</button>
    </div>
    <div v-else>
      <button @click="propertyChangeForm.adding = true">new property change</button>
    </div>
  </div>
</template>


<script>
import { PropertyChange } from '../classes/Action.js'
import { useStore } from '../store/mainStore.js'

export default {
  name: 'ActionPropertyChangeForm',
  setup: function () {
    const store = useStore()
    return { store }
  },
  props: {
    action: Object
  },
  data: function () {
    return {
      propertyChangeForm: {
        adding: false,
        agent: '',
        agentType: '',
        agentChoiceMethod: '',
        target: '',
        property: '',
        change: '',
        value: ''
      }
    }
  },
  methods: {
    createPropertyChangeItem: function (action) {

      const property = this.propertyChangeForm.property
      const change = this.propertyChangeForm.change
      const value = this.propertyChangeForm.value

      const args = {
        agentType: this.propertyChangeForm.agentType,
        agentChoiceMethod: this.propertyChangeForm.agentChoiceMethod,
        target: this.propertyChangeForm.target
      }
      const propChange = new PropertyChange(
        null,
        property,
        change,
        value,
        args
      )
      action.propertyChanges.push(propChange)
      this.propertyChangeForm.adding = false
    },
  }
}

</script>