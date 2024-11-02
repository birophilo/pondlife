<template>
  <div v-if="spriteMapData.editing === true">
    name: <input v-model="spriteMapData.name" type="text" placeholder="name" /><br />
    scale: <input v-model="spriteMapData.scale" type="number" placeholder="scale" /><br />
    offset X: <input v-model="spriteMapData.offset.x" type="number" placeholder="offset X" /><br />
    offset Y: <input v-model="spriteMapData.offset.y" type="number" placeholder="offset Y" /><br />

    <table class="sprite-map-direction-table">
      <tr v-for="row in store.directionList">
        <td v-for="directionName in row">
          <select v-model="spriteMapData.sheets[directionName]">
            <option value="">-- {{directionName  }} --</option>
            <option v-for="spriteSheet in store.spriteSheets" :value="spriteSheet">{{ spriteSheet.name }}</option>
          </select>
          <br />
          <img :src="spriteMapData.sheets[directionName].src" width="70" height="70"/>
        </td>
      </tr>
    </table>

    <br />
    <button @click="saveSpriteMap(spriteMapData)">save</button>
    <button @click="spriteMapData.editing = false">cancel</button>
  </div>
  <div v-else>
    <div>
      {{ spriteMapData.name }}
      <button @click="spriteMapData.editing = true; $forceUpdate()">edit</button>
      <button @click="deleteSpriteMap(i)">delete</button>
    </div>
  </div>
</template>

<script>
import { useStore } from '../store/mainStore.js'


export default {
  name: 'MenuSpriteMap',
  setup() {
    const store = useStore()
    return { store }
  },
  props: { 
    spriteMap: Object,
    i: Number
  },
  mounted: function () {
    this.setupSpriteMapData()
  },
  data: function () {
    return {
      spriteMapData: {
        editing: false,
        name: '',
        scale: 0,
        offset: {
          x: 0,
          y: 0
        },
        sheets: {
          idle: '',
          up: '',
          upRight: '',
          right: '',
          downRight: '',
          down: '',
          downLeft: '',
          left: '',
          upLeft: ''
        }
      }
    }
  },
  methods: {
    setupSpriteMapData: function () {
      const data = {
        editing: this.spriteMap.editing,
        name: this.spriteMap.name,
        scale: this.spriteMap.scale,
        offset: this.spriteMap.offset,
        sheets: this.spriteMap.sheets,
      }
      this.spriteMapData = data
    },
    saveSpriteMap: function (spriteMapData) {
      spriteMapData.editing = false
      localStorage.setItem('pondlifeSpriteMaps', JSON.stringify(this.store.spriteMaps))
      this.$forceUpdate()
    },
    deleteSpriteMap: function (index) {
      this.store.spriteMaps.splice(index, 1)
      this.$forceUpdate()

      // 'save' to avoid inputting each page refresh
      localStorage.setItem('pondlifeSpriteMaps', JSON.stringify(this.store.spriteMaps))
    },
  }
}
</script>