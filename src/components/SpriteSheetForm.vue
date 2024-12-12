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
import { createSpriteSheetObject } from "../classes/Sprite.js"

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

    const createSpriteSheet = () => {
      const args = {
        name: itemForm.value.name,
        src: itemForm.value.src,
        columns: Number(itemForm.value.columns),
        rows: Number(itemForm.value.rows),
        numImages: Number(itemForm.value.numImages),
        refreshInterval: Number(itemForm.value.refreshInterval)
      }
      const spriteSheetObject = createSpriteSheetObject(args)
      store.spriteSheets.push(spriteSheetObject)

      // 'save' to avoid inputting all after each page refresh
      localStorage.setItem('pondlifeSpriteSheets', JSON.stringify(store.spriteSheets))

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
      localStorage.setItem('pondlifeSpriteSheets', JSON.stringify(store.spriteSheets))
      localStorage.setItem('pondlifeSpriteMaps', JSON.stringify(store.animationSets))
    }

    return { store, isAdding, itemForm, createSpriteSheet, updateSpritesheetFileInput }
  }
}
</script>

