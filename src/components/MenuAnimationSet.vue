<template>
  <div v-if="editing === true">
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

    <br />
    <button @click="saveItem()">save</button>
    <button @click="cancelEdit">cancel</button>
  </div>
  <div v-else>
    <div>
      {{ animationSet.name }}
      <button @click="editItem">edit</button>
      <button @click="deleteItem(i)">delete</button>
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
  data: function () {
    return {
      defaultItemForm: {
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
      },
      editing: false,
      itemForm: {}
    }
  },
  methods: {
    populateItemForm: function () {
      this.itemForm = {
        name: this.animationSet.name,
        scale: this.animationSet.scale,
        offset: {
          x: this.animationSet.offsetX,
          y: this.animationSet.offsetY,
        },
        sheets: this.animationSet.sheets,
      }
    },
    saveItem: function () {
      this.editing = false
      localStorage.setItem('pondlifeSpriteMaps', JSON.stringify(this.store.animationSets))
    },
    deleteItem: function (index) {
      this.store.animationSets.splice(index, 1)
      // 'save' to avoid inputting each page refresh
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