<template>
  <div>
    <div v-for="property in Object.keys(agentProperties)">
      <div v-if="editFlags[property] === true">
        <input type="text" placeholder="name" :value="property" disabled />
        <input v-model="propertiesForm[property]" type="number" />
        <button @click="setProperty(property)">save</button>
        <button @click="cancelSetProperty(property)">cancel</button>
        <br/>
      </div>
      <div v-else>
        <input type="text" placeholder="name" :value="property" disabled />:
        <input type="text" placeholder="value" :value="agentProperties[property]" disabled /> -
        <button @click="editItem(property)">edit</button> |
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
    agentProperties: Object
  },
  data: function () {
    return {
      propertiesForm: {},
      editFlags: {}
    }
  },
  methods: {
    populatePropertiesForm: function () {
      this.propertiesForm = {...this.agentProperties}
      this.propertyKeys = Object.keys(this.propertiesForm)
      this.propertyKeys.forEach(key => this.editFlags[key] = false)
    },
    deleteProperty: function (property) {
      delete this.store.selectedAgent.stateData[property]
    },
    setProperty: function (property) {
      this.store.selectedAgent.stateData[property] = this.propertiesForm[property]
      this.editFlags[property] = false
    },
    cancelSetProperty: function (property) {
       this.propertiesForm[property] = this.store.selectedAgent.stateData[property]
       this.editFlags[property] = false
    },
    editItem: function (property) {
      this.populatePropertiesForm()
      this.editFlags[property] = true
    },
    cancelEdit: function (property) {
      this.editFlags[property] = false
      this.itemForm = {}
    }
  }
}

</script>