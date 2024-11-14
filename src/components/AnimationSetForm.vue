<template>
  <div>
    <div v-if="adding === true">
      name: <input v-model="itemForm.name" type="text" placeholder="name" /><br />
      scale: <input v-model="itemForm.scale" type="number" placeholder="scale" /><br />
      offset X: <input v-model="itemForm.offset.x" type="number" placeholder="offset X" /><br />
      offset Y: <input v-model="itemForm.offset.y" type="number" placeholder="offset Y" /><br />

      <table class="sprite-map-direction-table">
        <tr v-for="row in store.directionList">
          <td v-for="directionName in row">
            <select v-model="itemForm.sheets[directionName]">
              <option value="">-- {{directionName  }} --</option>
              <option v-for="spriteSheet in store.spriteSheets" :value="spriteSheet">{{ spriteSheet.name }}</option>
            </select>
            <br />
            <img :src="itemForm.sheets[directionName].src" width="70" height="70"/>
          </td>
        </tr>
      </table>

      <button @click="createItem">create sprite map</button>
    </div>
    <div v-else>
      <button @click="adding = true">new sprite map</button>
    </div>
  </div>
</template>

<script>
import { useStore } from '../store/mainStore.js'
import { AnimationSet } from "../classes/Sprite.js"

export default {
  name: 'AnimationSetForm',
  setup: function () {
    const store = useStore()
    return { store }
  },
  data: function () {
    return {
      adding: false,
      itemForm: {
        name: '',
        scale: 1,
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
    createItem: function () {
      const data = {
        name: this.itemForm.name,
        scale: Number(this.itemForm.scale),
        offset: {
          x: Number(this.itemForm.offset.x),
          y: Number(this.itemForm.offset.y)
        },
        sheets: this.itemForm.sheets
      }
      this.store.animationSets.push(new AnimationSet(data))

      // 'save' to avoid inputting all after each page refresh
      localStorage.setItem('pondlifeSpriteMaps', JSON.stringify(this.store.animationSets))

      this.adding = false
      this.itemForm = {
        name: '',
        scale: 1,
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
    },
  }
}
</script>

