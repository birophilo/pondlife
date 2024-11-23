<template>
  <div>
    <!-- (ACTION) PROPERTY CHANGE ITEM CREATE FORM -->
    <div v-if="isAdding === true">
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
      <button @click="isAdding = false">cancel</button>
    </div>
    <div v-else>
      <button @click="isAdding = true">new property change</button>
    </div>
  </div>
</template>


<script>
import { ref } from 'vue'
import { PropertyChange } from '../classes/Action.js'
import { useStore } from '../store/mainStore.js'

export default {
  name: 'ActionPropertyChangeForm',
  props: {
    action: Object
  },
  setup: function () {
    const store = useStore()

    const isAdding = ref(false)

    const itemForm = ref({
      agent: '',
      agentType: '',
      agentChoiceMethod: 'nearest',
      target: '',
      property: '',
      change: '',
      value: ''
    })

    const createItem = () => {
      const args = {
        agentType: itemForm.value.agentType,
        agentChoiceMethod: itemForm.value.agentChoiceMethod,
        target: itemForm.value.target
      }
      const propChange = new PropertyChange(
        null,
        itemForm.value.target,
        itemForm.value.property,
        itemForm.value.change,
        itemForm.value.value,
        args
      )
      const act = store.actions.find(a => a.actionName === this.action.actionName)
      act.propertyChanges.push(propChange)
      isAdding.value = false
    }

    return { store, isAdding, itemForm, createItem }
  }
}

</script>