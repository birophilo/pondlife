<template>
  <div>
    <!-- (ACTION) PROPERTY CHANGE ITEM CREATE FORM -->
    <div v-if="isAdding === true">
      <select v-model="itemForm.agentType">
        <option value="">-- agent --</option>
        <option value="self">self</option>
        <option
            v-for="[agentType, obj] in Object.entries(store.agentTypes)"
            :value="obj">{{ agentType }}
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
// import { createPropertyChange } from '../classes/Action.js'
import { useStore } from '../store/mainStore.js'

export default {
  name: 'ActionPropertyChangeForm',
  props: {
    action: Object
  },
  setup: function (props) {
    const store = useStore()

    const isAdding = ref(false)

    const itemForm = ref({
      agent: '',
      property: '',
      change: '',
      value: '',
      target: '',
      agentType: '',
      agentChoiceMethod: 'nearest',
      actionId: props.action.id
    })

    const createItem = async () => {
      const propChange = {...itemForm.value, agent: null} // does agent need to be null?

      const act = store.actions.find(a => a.id === props.action.id)
      // create PropertyChange and update the Action's ID field
      const newId = await store.createPropertyChange(propChange, act.id)
      propChange.id = newId
      // TODO: change this to propChange ID to match document structure in database (or get from API)
      act.propertyChanges.push(propChange)
      isAdding.value = false
    }

    return { store, isAdding, itemForm, createItem }
  }
}

</script>