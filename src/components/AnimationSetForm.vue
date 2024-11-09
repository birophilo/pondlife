<template>
  <div>
    <div v-if="animationSetForm.adding === true">
      name: <input v-model="animationSetForm.name" type="text" placeholder="name" /><br />
      scale: <input v-model="animationSetForm.scale" type="number" placeholder="scale" /><br />
      offset X: <input v-model="animationSetForm.offset.x" type="number" placeholder="offset X" /><br />
      offset Y: <input v-model="animationSetForm.offset.y" type="number" placeholder="offset Y" /><br />

      <table class="sprite-map-direction-table">
        <tr v-for="row in store.directionList">
          <td v-for="directionName in row">
            <select v-model="animationSetForm.sheets[directionName]">
              <option value="">-- {{directionName  }} --</option>
              <option v-for="spriteSheet in store.spriteSheets" :value="spriteSheet">{{ spriteSheet.name }}</option>
            </select>
            <br />
            <img :src="animationSetForm.sheets[directionName].src" width="70" height="70"/>
          </td>
        </tr>
      </table>

      <button @click="createAnimationSet()">create sprite map</button>
    </div>
    <div v-else>
      <button @click="animationSetForm.adding = true">new sprite map</button>
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
      animationSetForm: {
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
    createAnimationSet: function () {
      const args = {...this.animationSetForm}
      args.scale = Number(args.scale)
      args.offset = {
        x: Number(args.offset.x),
        y: Number(args.offset.y)
      }
      this.store.animationSets.push(new AnimationSet(args))

      // 'save' to avoid inputting all after each page refresh
      localStorage.setItem('pondlifeSpriteMaps', JSON.stringify(this.store.animationSets))

      this.animationSetForm = {
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

