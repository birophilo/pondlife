<template>
  <div>
    <!-- (ACTION) PROPERTY CHANGE ITEM CREATE FORM -->
    <div v-if="adding === true">
      <select v-model="itemForm.agentType">
        <option value="">-- agent --</option>
        <option value="self">self</option>
        <option
          v-for="agent in store.agentTypes"
          :value="agent.name">{{ agent.name }}
        </option>
      </select>

      <form name="agentPropChangeRadioCreate">
        <input
          type="radio"
          v-model="itemForm.agentChoiceMethod"
          name="agentChoiceMethod"
          value="nearest"
          checked="true"
        />
        <label for="nearest">nearest</label>
        <input
          type="radio"
          v-model="itemForm.agentChoiceMethod"
          name="agentChoiceMethod"
          value="specific"
        />
        <label for="specific">specific</label>
        <input
          type="radio"
          v-model="itemForm.agentChoiceMethod"
          name="agentChoiceMethod"
          value="all"
        />
        <label for="all">all</label>
      </form>

      <div v-if="itemForm.agentChoiceMethod === 'specific'">
        <select v-model="itemForm.target">
          <option value="">-- select agent --</option>
          <option
            v-for="agent in store.agentItems[itemForm.agentType]"
            :value="agent"
          >
            {{ agent.name }}
          </option>
        </select>
      </div>

      <select v-model="itemForm.property">
        <option value="">--  property --</option>
        <option
          v-for="property in Object.keys(store.selectedAgent.stateData)"
          :value="property">{{ property }}
        </option>
      </select>
      <select v-model="itemForm.change">
        <option value="">-- change --</option>
        <option value="increase">increase</option>
        <option value="decrease">decrease</option>
      </select>
      <input
        v-model="itemForm.value"
        type="number"
        placeholder="value"
      />
      <button @click="createItem">save</button>
      <button @click="adding = false">cancel</button>
    </div>
    <div v-else>
      <button @click="adding = true">new property change</button>
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
      adding: false,
      itemForm: {
        agent: '',
        agentType: '',
        agentChoiceMethod: 'nearest',
        target: '',
        property: '',
        change: '',
        value: ''
      }
    }
  },
  methods: {
    createItem: function () {
      const args = {
        agentType: this.itemForm.agentType,
        agentChoiceMethod: this.itemForm.agentChoiceMethod,
        target: this.itemForm.target
      }
      const propChange = new PropertyChange(
        null,
        this.itemForm.property,
        this.itemForm.change,
        this.itemForm.value,
        args
      )
      const act = this.store.actions.find(a => a.name === this.action.name)
      act.propertyChanges.push(propChange)
      this.adding = false
    }
  }
}

</script>