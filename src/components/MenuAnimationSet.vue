<template>
  <div v-if="animationSetData.editing === true">
    name: <input v-model="animationSetData.name" type="text" placeholder="name" /><br />
    scale: <input v-model="animationSetData.scale" type="number" placeholder="scale" /><br />
    offset X: <input v-model="animationSetData.offset.x" type="number" placeholder="offset X" /><br />
    offset Y: <input v-model="animationSetData.offset.y" type="number" placeholder="offset Y" /><br />

    <table class="sprite-map-direction-table">
      <tr v-for="row in store.directionList">
        <td v-for="directionName in row">
          <select v-model="animationSetData.sheets[directionName]">
            <option value="">-- {{directionName  }} --</option>
            <option v-for="spriteSheet in store.spriteSheets" :value="spriteSheet">{{ spriteSheet.name }}</option>
          </select>
          <br />
          <img :src="animationSetData.sheets[directionName].src" width="70" height="70"/>
        </td>
      </tr>
    </table>

    <br />
    <button @click="saveAnimationSet(animationSetData)">save</button>
    <button @click="animationSetData.editing = false">cancel</button>
  </div>
  <div v-else>
    <div>
      {{ animationSetData.name }}
      <button @click="animationSetData.editing = true; $forceUpdate()">edit</button>
      <button @click="deleteAnimationSet(i)">delete</button>
    </div>
  </div>
</template>

<script>
import { useStore } from '../store/mainStore.js'


export default {
  name: 'MenuAnimationSet',
  setup() {
    const store = useStore()
    return { store }
  },
  props: { 
    animationSet: Object,
    i: Number
  },
  mounted: function () {
    this.setupAnimationSetData()
  },
  data: function () {
    return {
      animationSetData: {
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
    setupAnimationSetData: function () {
      const data = {
        editing: this.animationSet.editing,
        name: this.animationSet.name,
        scale: this.animationSet.scale,
        offset: this.animationSet.offset,
        sheets: this.animationSet.sheets,
      }
      this.animationSetData = data
    },
    saveAnimationSet: function (animationSetData) {
      animationSetData.editing = false
      localStorage.setItem('pondlifeSpriteMaps', JSON.stringify(this.store.animationSets))
      this.$forceUpdate()
    },
    deleteAnimationSet: function (index) {
      this.store.animationSets.splice(index, 1)
      this.$forceUpdate()

      // 'save' to avoid inputting each page refresh
      localStorage.setItem('pondlifeSpriteMaps', JSON.stringify(this.store.animationSets))
    },
  }
}
</script>