<template>
  <div>
    <div v-if="isEditing === true">
      property: <input v-model="itemForm.property" type="text" placeholder="property" /><br />
      function: <input v-model="itemForm.func" type="text" placeholder="func" /><br />
      action: <input v-model="itemForm.actionId" type="text" placeholder="actionId" /><br />
      <button @click="saveItem">save</button>
      <button @click="cancelEdit">cancel</button>
    </div>
    <div v-else>
      <div>{{ utilityFunction.property }}</div>
      <div>{{ utilityFunction.func }}</div>
      <div>{{ utilityFunction.actionId }}</div>

      <button @click="editItem">edit</button>
      <!-- <button @click="deleteItem">delete</button> -->
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import api from '../apiCrud.js'
import { useStore } from '../store/mainStore.js'

export default {
  name: 'MenuUtilityFunction',
  props: {
    utilityFunction: Object,
    index: Number
  },
  setup(props) {
    const store = useStore()

    const itemForm = ref({})
    const isEditing = ref(false)

    const populateItemForm = () => {
      itemForm.value = {...props.utilityFunction}
    }

    const saveItem = () => {
      isEditing.value = false
      const payload = {...itemForm.value}
      api.updateUtilityFunction(payload)
    }

    const deleteItem = () => {
      api.deleteUtilityFunction(props.utilityFunction.id)
      store.utilityFunctions.splice(props.i, 1)
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
      itemForm,
      isEditing,
      saveItem,
      deleteItem,
      editItem,
      cancelEdit
    }
  }

}

</script>