<template>
  <div v-if="adding === true">
    name: <input v-model="itemForm.name" type="text" placeholder="name" /><br />
    src: <input type="file" placeholder="src" @change="updateSpritesheetFileInput($event, itemForm)" /><br />
    rows: <input v-model="itemForm.rows" type="number" placeholder="rows" /><br />
    columns: <input v-model="itemForm.columns" type="number" placeholder="columns" /><br />
    numImages: <input v-model="itemForm.numImages" type="number" placeholder="number of images" /><br />
    refreshInterval: <input v-model="itemForm.refreshInterval" type="number" placeholder="refresh interval" /><br />
    <button @click="createSpriteSheet()">create sprite sheet</button>
    <button @click="adding = false">cancel</button>
  </div>
  <div v-else>
    <button @click="adding = true">new sprite sheet</button>
  </div>
</template>

<script>
import { useStore } from '../store/mainStore.js'
import { SpriteSheet } from "../classes/Sprite.js"

export default {
  name: 'SpriteSheetForm',
  setup: function () {
    const store = useStore()
    return { store }
  },
  data: function () {
    return {
      adding: false,
      itemForm: {
        name: '',
        src: '',
        columns: 1,
        rows: 1,
        numImages: 1,
        refreshInterval: 1
      },
    }
  },
  methods: {
    createSpriteSheet: function () {
      const args = {
        name: this.itemForm.name,
        src: this.itemForm.src,
        columns: Number(this.itemForm.columns),
        rows: Number(this.itemForm.rows),
        numImages: Number(this.itemForm.numImages),
        refreshInterval: Number(this.itemForm.refreshInterval)
      }
      this.store.spriteSheets.push(new SpriteSheet(args))

      // 'save' to avoid inputting all after each page refresh
      localStorage.setItem('pondlifeSpriteSheets', JSON.stringify(this.store.spriteSheets))

      this.adding = false

      this.itemForm = {
        name: '',
        src: '',
        columns: 1,
        rows: 1,
        numImages: 1,
        refreshInterval: 1
      }
    },
    updateSpritesheetFileInput: function (event, itemForm) {
      const fileName = "/img/sprites/" + event.target.files[0].name
      itemForm.src = fileName
      localStorage.setItem('pondlifeSpriteSheets', JSON.stringify(this.store.spriteSheets))
      localStorage.setItem('pondlifeSpriteMaps', JSON.stringify(this.store.animationSets))
    },
  }
}
</script>

