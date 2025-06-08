<template>
  <div v-if="isAdding === true" class="spritesheet-form">
    name: <input v-model="itemForm.name" type="text" placeholder="name" /><br />
    src: <input type="file" placeholder="src" @change="uploadFile" /><br />
    rows: <input v-model="itemForm.rows" type="number" placeholder="rows" /><br />
    columns: <input v-model="itemForm.columns" type="number" placeholder="columns" /><br />
    numImages: <input v-model="itemForm.numImages" type="number" placeholder="number of images" /><br />
    refreshInterval: <input v-model="itemForm.refreshInterval" type="number" placeholder="refresh interval" /><br />
    <button @click="createSpriteSheet()">create sprite sheet</button>
    <button @click="isAdding = false">cancel</button>
  </div>
  <div v-else class="spritesheet-form">
    <button @click="isAdding = true">new sprite sheet</button>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from '@/store/mainStore.js'
import api from '@/apiCrud.js'

export default {
  name: 'SpriteSheetCreate',
  setup: function () {
    const store = useStore()

    const isAdding = ref(false)

    const itemForm = ref({
        name: '',
        src: '',
        columns: 1,
        rows: 1,
        numImages: 1,
        refreshInterval: 1
      })

    const createSpriteSheet = async () => {
      const newSpriteSheet = {
        name: itemForm.value.name,
        src: itemForm.value.src,
        columns: Number(itemForm.value.columns),
        rows: Number(itemForm.value.rows),
        numImages: Number(itemForm.value.numImages),
        refreshInterval: Number(itemForm.value.refreshInterval)
      }

      const createdItem = await api.createSpriteSheet(newSpriteSheet)
      newSpriteSheet.id = createdItem.id
      store.spriteSheets.push(newSpriteSheet)

      await store.saveScene()

      isAdding.value = false

      itemForm.value = {
        name: '',
        src: '',
        columns: 1,
        rows: 1,
        numImages: 1,
        refreshInterval: 1
      }
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

    return {
      store,
      isAdding,
      itemForm,
      createSpriteSheet,
      uploadFile
    }
  }
}
</script>

<style>
.spritesheet-form {
  border-top: 1px solid #e8b9ad;
}
</style>

