<template>
  <div>
    {{ JSON.stringify(propertiesData) }}
    <div v-for="property in Object.keys(propertiesData)">
      hello<br/>
      <div v-if="editFlags[property] === true">
        <input type="text" placeholder="name" :value="property" disabled />
        <input v-model="propertiesData[property]" type="number" />
        <button @click="setProperty(property)">save</button>
        <button @click="cancelSetProperty(property)">cancel</button>
        <br/>
      </div>
      <div v-else>
        something here<br/>
        <input type="text" placeholder="name" :value="property" disabled />:
        <input type="text" placeholder="value" :value="propertiesData[property]" disabled /> -
        <button @click="editFlags[property] = true">edit</button> |
        <button @click="deleteProperty(item.name)">delete</button>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from '../store/mainStore.js'

export default {
  setup: function () {
    const store = useStore()
    return { store }
  },
  props: {
    selectedAgentProperties: Object
  },
  mounted: function () {
    this.setupPropertiesData()
  },
  data: function () {
    return {
      propertiesData: {},
      editFlags: {}
    }
  },
  methods: {
    setupPropertiesData: function () {
      // const properties = this.store.selectedAgent.stateData
      this.propertiesData = {...this.selectedAgentProperties}
      this.propertyKeys = Object.keys(this.propertiesData)
      this.propertyKeys.forEach(key => this.editFlags[key] = false)
    },
    deleteProperty: function (itemName) {
      this.propertiesData = this.propertiesData.filter(item => item.name !== itemName)
      this.store.selectedAgent.stateData = {...this.propertiesData}
    },
    setProperty: function (property) {
      this.store.selectedAgent.stateData[property] = this.propertiesData[property]
      this.editFlags[property] = false
    },
    cancelSetProperty: function (property) {
       this.propertiesData[property] = this.store.selectedAgent.stateData[property]
       this.editFlags[property] = false
    }
  }
}

</script>