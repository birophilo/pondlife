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
        <button @click="deleteProperty(property)">delete</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from '@/store/mainStore.js'

export default {
  props: {
    agentProperties: Object
  },
  setup: function (props) {
    const store = useStore()

    const propertiesForm = ref({})
    const editFlags = ref({})

    const setProperty = (property) => {
      store.selectedAgent.stateData[property] = propertiesForm.value[property]
      editFlags.value[property] = false
    }

    const cancelSetProperty = (property) => {
       propertiesForm.value[property] = store.selectedAgent.stateData[property]
       editFlags.value[property] = false
    }

    const editItem = (property) => {
      populatePropertiesForm()
      editFlags.value[property] = true
    }

    const cancelEdit = (property) => {
      editFlags.value[property] = false
      propertiesForm.value = {}
    }

    const deleteProperty = (property) => {
      delete store.selectedAgent.stateData[property]
    }

    const populatePropertiesForm = () => {
      propertiesForm.value = {...props.agentProperties}
      const propertyKeys = Object.keys(propertiesForm)
      propertyKeys.forEach(key => editFlags.value[key] = false)
    }

    return {
      store,
      propertiesForm,
      editFlags,
      setProperty,
      cancelSetProperty,
      editItem,
      cancelEdit,
      deleteProperty
    }
  }
}

</script>