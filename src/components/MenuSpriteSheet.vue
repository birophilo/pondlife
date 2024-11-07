<template>
  <div v-if="spriteSheetData.editing === true">
    name: <input v-model="spriteSheetData.name" type="text" placeholder="name" /><br />
    src: {{ spriteSheetData.src }}<br />
    <input type="file" placeholder="src" @change="updateSpritesheetFileInput($event)" /><br />
    rows: <input v-model="spriteSheetData.rows" type="number" placeholder="rows" /><br />
    columns: <input v-model="spriteSheetData.columns" type="number" placeholder="columns" /><br />
    numImages: <input v-model="spriteSheetData.numImages" type="number" placeholder="number of images" /><br />
    refreshInterval: <input v-model="spriteSheetData.refreshInterval" type="number" placeholder="refresh interval" /><br />
    <br />
    <button @click="saveSpriteSheet(spriteSheetData)">save</button>
    <button @click="spriteSheetData.editing = false">cancel</button>
  </div>
  <div v-else>
    <div>
      {{ spriteSheetData.name }}
      <button @click="spriteSheetData.editing = true; $forceUpdate()">edit</button>
      <button @click="deleteSpriteSheet()">delete</button>
    </div>
  </div>
</template>

<script>
import { useStore } from '../store/mainStore.js'


export default {
  name: 'MenuSpriteSheet',
  setup() {
    const store = useStore()
    return { store }
  },
  mounted: function () {
    this.setupSpriteSheetData()
  },
  data: function () {
    return {
      spriteSheetData: {}
    }
  },
  props: { 
    spriteSheet: Object,
    i: Number
  },
  methods: {
    setupSpriteSheetData: function () {
      const data = {
        adding: this.spriteSheet.adding,
        name: this.spriteSheet.name,
        src: this.spriteSheet.src,
        columns: Number(this.spriteSheet.columns),
        rows: Number(this.spriteSheet.rows),
        numImages: Number(this.spriteSheet.numImages),
        refreshInterval: Number(this.spriteSheet.refreshInterval)
      }
      this.spriteSheetData = data
    },
    saveSpriteSheet: function () {
      this.spriteSheetData.editing = false
      const i = this.i
      const keys = Object.keys(this.spriteSheetData)
      keys.forEach(key => this.store.spriteSheets[i][key] = this.spriteSheetData[key])
      localStorage.setItem('pondlifeSpriteSheets', JSON.stringify(this.store.spriteSheets))
    },
    deleteSpriteSheet: function () {
      this.store.spriteSheets.splice(this.i, 1)
      // 'save' to avoid inputting all after each page refresh
      localStorage.setItem('pondlifeSpriteSheets', JSON.stringify(this.store.spriteSheets))
    },
    updateSpritesheetFileInput: function (event) {
      const fileName = "/img/sprites/" + event.target.files[0].name
      this.spriteSheetData.src = fileName
      this.store.spriteSheets[this.i].src = fileName
      localStorage.setItem('pondlifeSpriteSheets', JSON.stringify(this.store.spriteSheets))
      localStorage.setItem('pondlifeSpriteMaps', JSON.stringify(this.store.spriteMaps))
    },
  }
}
</script>