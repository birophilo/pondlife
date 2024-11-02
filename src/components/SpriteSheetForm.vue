<template>
  <div v-if="spriteSheetForm.adding === true">
    name: <input v-model="spriteSheetForm.name" type="text" placeholder="name" /><br />
    src: <input type="file" placeholder="src" @change="updateSpritesheetFileInput($event, spriteSheetForm)" /><br />
    rows: <input v-model="spriteSheetForm.rows" type="number" placeholder="rows" /><br />
    columns: <input v-model="spriteSheetForm.columns" type="number" placeholder="columns" /><br />
    numImages: <input v-model="spriteSheetForm.numImages" type="number" placeholder="number of images" /><br />
    refreshInterval: <input v-model="spriteSheetForm.refreshInterval" type="number" placeholder="refresh interval" /><br />
    <button @click="createSpriteSheet()">create sprite sheet</button>
    <button @click="spriteSheetForm.adding = false">cancel</button>
  </div>
  <div v-else>
    <button @click="spriteSheetForm.adding = true">new sprite sheet</button>
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
      spriteSheetForm: {
        adding: false,
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
        adding: this.spriteSheetForm.adding,
        name: this.spriteSheetForm.name,
        src: this.spriteSheetForm.src,
        columns: Number(this.spriteSheetForm.columns),
        rows: Number(this.spriteSheetForm.rows),
        numImages: Number(this.spriteSheetForm.numImages),
        refreshInterval: Number(this.spriteSheetForm.refreshInterval)
      }
      this.store.spriteSheets.push(new SpriteSheet(args))

      // 'save' to avoid inputting all after each page refresh
      localStorage.setItem('pondlifeSpriteSheets', JSON.stringify(this.store.spriteSheets))

      this.spriteSheetForm = {
        adding: false,
        name: '',
        src: '',
        columns: 1,
        rows: 1,
        numImages: 1,
        refreshInterval: 1
      }
    },
    updateSpritesheetFileInput: function (event, spriteSheetForm) {
      const fileName = "/img/sprites/" + event.target.files[0].name
      spriteSheetForm.src = fileName
      localStorage.setItem('pondlifeSpriteSheets', JSON.stringify(this.store.spriteSheets))
      localStorage.setItem('pondlifeSpriteMaps', JSON.stringify(this.store.spriteMaps))
    },
  }
}
</script>

