<template>
  <div v-if="isEditing === true">
    name: <input v-model="itemForm.name" type="text" placeholder="name" /><br />
    type: <input v-model="itemForm.type" type="text" placeholder="type" /><br />
    radius: <input v-model="itemForm.radius" type="float" placeholder="radius" /><br />
    sample interval: <input v-model="itemForm.sampleInterval" type="float" placeholder="sample interval" /><br />
    range type: <input v-model="itemForm.rangeType" type="text" placeholder="range type" /><br />
    <button @click="saveItem">save</button>
    <button @click="cancelEdit">cancel</button>
  </div>
  <div v-else>
    <div>
      {{ sensor.name }}
      <button @click="editItem">edit</button>
      <button @click="deleteItem">delete</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from '@/store/mainStore.js'
import api from '@/apiCrud.js'


export default {
  name: 'SensorEdit',
  props: {
    sensor: Object,
    i: Number
  },
  setup(props) {
    const store = useStore()

    const isEditing = ref(false)
    const itemForm = ref({})

    const populateItemForm = () => {
      itemForm.value = {...props.sensor}
    }

    const saveItem = () => {
      isEditing.value = false
      const payload = {...itemForm.value}
      api.updateSensor(payload)
    }

    const deleteItem = () => {
      api.deleteSensor(props.sensor.id)
      store.sensors.splice(props.i, 1)
    }

    const editItem = () => {
      populateItemForm()
      isEditing.value = true
    }

    const cancelEdit = () => {
      isEditing.value = false
      itemForm.value = {}
    }

    return {
      store,
      isEditing,
      itemForm,
      saveItem,
      deleteItem,
      editItem,
      cancelEdit,
      populateItemForm
    }
  }
}
</script>