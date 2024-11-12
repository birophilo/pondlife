<template>
  <div v-if="editing === true">
    name: <input v-model="itemForm.name" type="text" placeholder="name" /><br />
    src: {{ itemForm.src }}<br />
    <input type="file" placeholder="src" @change="updateSpritesheetFileInput($event)" /><br />
    rows: <input v-model="itemForm.rows" type="number" placeholder="rows" /><br />
    columns: <input v-model="itemForm.columns" type="number" placeholder="columns" /><br />
    numImages: <input v-model="itemForm.numImages" type="number" placeholder="number of images" /><br />
    refreshInterval: <input v-model="itemForm.refreshInterval" type="number" placeholder="refresh interval" /><br />
    <br />
    <button @click="saveItem">save</button>
    <button @click="cancelEdit">cancel</button>
  </div>
  <div v-else>
    <div>
      {{ spriteSheet.name }}
      <button @click="editItem">edit</button>
      <button @click="deleteItem">delete</button>
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
  data: function () {
    return {
      editing: false,
      itemForm: {}
    }
  },
  props: { 
    spriteSheet: Object,
    i: Number
  },
  methods: {
    populateItemForm: function () {
      this.itemForm = {
        name: this.spriteSheet.name,
        src: this.spriteSheet.src,
        columns: Number(this.spriteSheet.columns),
        rows: Number(this.spriteSheet.rows),
        numImages: Number(this.spriteSheet.numImages),
        refreshInterval: Number(this.spriteSheet.refreshInterval)
      }
    },
    saveItem: function () {
      this.editing = false
      const keys = Object.keys(this.spriteSheet)
      keys.forEach(key => this.store.spriteSheets[this.i][key] = this.itemForm[key])
      localStorage.setItem('pondlifeSpriteSheets', JSON.stringify(this.store.spriteSheets))
    },
    deleteItem: function () {
      this.store.spriteSheets.splice(this.i, 1)
      // 'save' to avoid inputting all after each page refresh
      localStorage.setItem('pondlifeSpriteSheets', JSON.stringify(this.store.spriteSheets))
    },
    updateSpritesheetFileInput: function (event) {
      const fileName = "/img/sprites/" + event.target.files[0].name
      this.itemForm.src = fileName
      this.store.spriteSheets[this.i].src = fileName
      localStorage.setItem('pondlifeSpriteSheets', JSON.stringify(this.store.spriteSheets))
      localStorage.setItem('pondlifeSpriteMaps', JSON.stringify(this.store.animationSets))
    },
    editItem: function () {
      this.populateItemForm()
      this.editing = true
    },
    cancelEdit: function () {
      this.editing = false
      this.itemForm = {}
    }
  }
}
</script>