<template>
  <div>
    <div v-if="isAdding === true">
      name: <input v-model="itemForm.name" type="text" placeholder="name" /><br />
      type: <input v-model="itemForm.type" type="text" placeholder="type" /><br />
      radius: <input v-model="itemForm.radius" type="float" placeholder="radius" /><br />
      sample interval: <input v-model="itemForm.sampleInterval" type="float" placeholder="sample interval" /><br />
      range type: <input v-model="itemForm.rangeType" type="text" placeholder="range type" /><br />

      <button @click="createSensor">save sensor</button>
      <button @click="cancelCreate">cancel</button>
      <br />
    </div>
    <div v-else><button @click="isAdding = true">new sensor</button></div>
  </div>
</template>


<script>
import { ref } from 'vue'
import { useStore } from '../store/mainStore.js'
import api from '../apiCrud.js'

export default {
  name: 'CreateSensorForm',
  setup: function () {
    const store = useStore()

    const isAdding = ref(false)

    const defaultItemForm = {
      name: '',
      type: "spatial",
      rangeType: "circle",
      radius: 100,
      sampleInterval: 1
    }

    const itemForm = ref(defaultItemForm)

    const createSensor = async () => {
      const newSensor = {...itemForm.value}
      const createdItem = await api.createSensor(newSensor)
      newSensor.id = createdItem.id
      store.sensors.push(newSensor)
      await store.saveScene()
      isAdding.value = false
    }

    const cancelCreate = () => {
      isAdding.value = false
      itemForm.value = {...defaultItemForm}
    }

    return {
      store,
      isAdding,
      itemForm,
      createSensor,
      cancelCreate
    }
  }
}

</script>