<template>
  <div v-if="isAdding === true">
    name: <input v-model="itemForm.name" type="text" placeholder="name" /><br />
    src: <input type="file" placeholder="src" @change="updateSpritesheetFileInput($event)" /><br />
    rows: <input v-model="itemForm.rows" type="number" placeholder="rows" /><br />
    columns: <input v-model="itemForm.columns" type="number" placeholder="columns" /><br />
    numImages: <input v-model="itemForm.numImages" type="number" placeholder="number of images" /><br />
    refreshInterval: <input v-model="itemForm.refreshInterval" type="number" placeholder="refresh interval" /><br />
    <button @click="createSpriteSheet()">create sprite sheet</button>
    <button @click="isAdding = false">cancel</button>
  </div>
  <div v-else>
    <button @click="isAdding = true">new sprite sheet</button>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from '../store/mainStore.js'

export default {
  name: 'SpriteSheetForm',
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

      const createdId = await store.createSpriteSheet(newSpriteSheet)
      newSpriteSheet.id = createdId
      store.spriteSheets.push(newSpriteSheet)

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

    const updateSpritesheetFileInput = (event) => {
      const fileName = "/img/sprites/" + event.target.files[0].name
      itemForm.value.src = fileName
      // TODO: update AnimationSet here?
    }

    return { store, isAdding, itemForm, createSpriteSheet, updateSpritesheetFileInput }
  }
}
</script>

