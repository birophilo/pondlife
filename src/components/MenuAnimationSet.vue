<template>
  <div v-if="isEditing === true">
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
import { ref } from 'vue'
import { useStore } from '../store/mainStore.js'


export default {
  name: 'MenuAnimationSet',
  setup(props) {
    const store = useStore()

    const isEditing = ref(false)
    const itemForm = ref({})

    const saveItem = () => {
      isEditing.value = false
      const keys = Object.keys(props.animationSet)
      keys.forEach(key => store.animationSets[props.i][key] = itemForm.value[key])
      localStorage.setItem('pondlifeSpriteMaps', JSON.stringify(store.animationSets))
    }

    const deleteItem = (index) => {
      store.animationSets.splice(index, 1)
      // 'save' to avoid inputting each page refresh
      localStorage.setItem('pondlifeSpriteMaps', JSON.stringify(store.animationSets))
    }

    const editItem = () => {
      populateItemForm()
      isEditing.value = true
    }

    const cancelEdit = () => {
      isEditing.value = false
      itemForm.value = {}
    }

    const populateItemForm = () => {
      itemForm.value = {
        name: props.animationSet.name,
        scale: props.animationSet.scale,
        offset: {
          x: props.animationSet.offset.x,
          y: props.animationSet.offset.y,
        },
        sheets: props.animationSet.sheets,
      }
    }

    return {
      store,
      isEditing,
      itemForm,
      saveItem,
      deleteItem,
      editItem,
      cancelEdit,
      populateItemForm
    }
  },
  props: {
    animationSet: Object,
    i: Number
  }
}
</script>