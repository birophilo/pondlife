<template>
  <div>
    <div v-if="propertyForm.adding === false" class="add-container">
      <button @click="propertyForm.adding = true">new property +</button>
    </div>
    <div v-else>
      <input v-model="propertyForm.newPropertyName" type="text" placeholder="name" />
      <input v-model="propertyForm.newPropertyValue" type="number" placeholder="0" />
      <button @click="setAgentProperty">add</button> |
      <button @click="cancelSetAgentProperty">cancel</button>
    </div>
  </div>
</template>

<script>
import { useStore } from '../store/mainStore.js'

export default {
  name: 'SetPropertyForm',
  setup: function () {
    const store = useStore()
    return { store }
  },
  data: function () {
    return {
      propertyForm: {
        adding: false,
        newPropertyName: '',
        newPropertyValue: ''
      }
    }
  },
  methods: {
    setAgentProperty: function () {
      const propName = this.propertyForm.newPropertyName
      const propValue = Number(this.propertyForm.newPropertyValue)
      this.store.selectedAgent.setProperty(propName, propValue)
      this.propertyForm.newPropertyName = ''
      this.propertyForm.newPropertyValue = 0
      this.propertyForm.adding = false
      this.$forceUpdate()
    },
    cancelSetAgentProperty: function () {
      this.propertyForm.adding = false
      this.propertyForm.newPropertyName = ''
      this.propertyForm.newPropertyValue = 0
    }
  }
}

</script>