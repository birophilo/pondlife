<template>
  <div>
    <div v-if="spriteMapForm.adding === true">
      name: <input v-model="spriteMapForm.name" type="text" placeholder="name" /><br />
      scale: <input v-model="spriteMapForm.scale" type="number" placeholder="scale" /><br />
      offset X: <input v-model="spriteMapForm.offset.x" type="number" placeholder="offset X" /><br />
      offset Y: <input v-model="spriteMapForm.offset.y" type="number" placeholder="offset Y" /><br />

      <table class="sprite-map-direction-table">
        <tr v-for="row in store.directionList">
          <td v-for="directionName in row">
            <select v-model="spriteMapForm.sheets[directionName]">
              <option value="">-- {{directionName  }} --</option>
              <option v-for="spriteSheet in store.spriteSheets" :value="spriteSheet">{{ spriteSheet.name }}</option>
            </select>
            <br />
            <img :src="spriteMapForm.sheets[directionName].src" width="70" height="70"/>
          </td>
        </tr>
      </table>

      <button @click="createSpriteMap()">create sprite map</button>
    </div>
    <div v-else>
      <button @click="spriteMapForm.adding = true">new sprite map</button>
    </div>
  </div>
</template>

<script>
import { useStore } from '../store/mainStore.js'
import { SpriteMap } from "../classes/Sprite.js"

export default {
  name: 'SpriteMapForm',
  setup: function () {
    const store = useStore()
    return { store }
  },
  data: function () {
    return {
      spriteMapForm: {
        adding: false,
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
    createSpriteMap: function () {
      const args = {...this.spriteMapForm}
      args.scale = Number(args.scale)
      args.offset = {
        x: Number(args.offset.x),
        y: Number(args.offset.y)
      }
      this.store.spriteMaps.push(new SpriteMap(args))

      // 'save' to avoid inputting all after each page refresh
      localStorage.setItem('pondlifeSpriteMaps', JSON.stringify(this.store.spriteMaps))

      this.spriteMapForm = {
        adding: false,
        name: '',
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

