<template>
  <div>
    <div v-if="isAdding === true">
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

      <button @click="createItem">create animation set</button>
    </div>
    <div v-else>
      <button @click="isAdding = true">new animation set</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from '@/store/mainStore.js'
import api from '@/apiCrud.js'

export default {
  name: 'AnimationSetCreate',
  setup: function () {
    const store = useStore()

    const isAdding = ref(false)

    const itemForm = ref({
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
    })

    const createItem = async () => {
      const newAnimationSet = {
        name: itemForm.value.name,
        scale: Number(itemForm.value.scale),
        offset: {
          x: Number(itemForm.value.offset.x),
          y: Number(itemForm.value.offset.y)
        },
        sheets: itemForm.value.sheets
      }
      // replace Spritesheet objects with just IDs for payload
      const sheetNames = Object.keys(newAnimationSet.sheets)
      sheetNames.forEach(sheetName => {
        newAnimationSet.sheets[sheetName] = newAnimationSet.sheets[sheetName].id
      })
      const createdItem = await api.createAnimationSet(newAnimationSet)
      newAnimationSet.id = createdItem.id
      store.animationSets.push(newAnimationSet)

      await store.saveScene()

      isAdding.value = false

      itemForm.value = {
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

    return { store, isAdding, itemForm, createItem }
  }
}
</script>

