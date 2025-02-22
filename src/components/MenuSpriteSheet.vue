<template>
  <div v-if="isEditing === true" class="spritesheet-item">
    name: <input v-model="itemForm.name" type="text" placeholder="name" /><br />
    src: {{ itemForm.src }}<br />
    <input type="file" placeholder="src" @change="uploadFile" /><br />
    rows: <input v-model="itemForm.rows" type="number" placeholder="rows" /><br />
    columns: <input v-model="itemForm.columns" type="number" placeholder="columns" /><br />
    numImages: <input v-model="itemForm.numImages" type="number" placeholder="number of images" /><br />
    refreshInterval: <input v-model="itemForm.refreshInterval" type="number" placeholder="refresh interval" /><br />
    <br />
    <button @click="saveItem">save</button>
    <button @click="cancelEdit">cancel</button>
  </div>
  <div v-else class="spritesheet-item">
    <div>
      {{ spriteSheet.name }}
      <button @click="editItem">edit</button>
      <button @click="deleteItem">delete</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from '../store/mainStore.js'
import api from '../apiCrud.js'


export default {
  name: 'MenuSpriteSheet',
  props: { 
    spriteSheet: Object,
    i: Number
  },
  setup(props) {

    const store = useStore()

    const isEditing = ref(false)
    const itemForm = ref({})

    const populateItemForm = () => {
      itemForm.value = {...props.spriteSheet}
    }

    const saveItem = () => {
      isEditing.value = false
      const keys = Object.keys(props.spriteSheet)
      api.updateSpriteSheet(itemForm.value)
      keys.forEach(key => store.spriteSheets[props.i][key] = itemForm.value[key])
    }

    const deleteItem = () => {
      store.spriteSheets.splice(props.i, 1)
      api.deleteSpriteSheet(props.spriteSheet.id)
    }

    const uploadFile = async (event) => {
      const imageFile = event.target.files[0]
      let formData = new FormData()
      formData.append("resource", "spritesheet")
      formData.append("imageType", "spritesheet")
      formData.append("file", imageFile)

      const createdResponse = await api.uploadFile(formData)
      itemForm.value.src = createdResponse.filename
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
      populateItemForm,
      saveItem,
      deleteItem,
      uploadFile,
      editItem,
      cancelEdit
    }
  }
}
</script>

<style>

.spritesheet-item {
  padding: 5px 0 5px 0;
  border-top: 1px solid #e8b9ad;
}

</style>