<template>
  <div v-if="isEditing === true">
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
import { ref } from 'vue'
import { useStore } from '../store/mainStore.js'
import api from '../apiCrud.js'


export default {
  name: 'MenuSpriteSheet',
  props: { 
    spriteSheet: Object,
    i: Number
  },
  setup(props) {

    const store = useStore()

    const isEditing = ref(false)
    const itemForm = ref({})

    const populateItemForm = () => {
      itemForm.value = {...props.spriteSheet}
    }

    const saveItem = () => {
      isEditing.value = false
      const keys = Object.keys(props.spriteSheet)
      api.updateSpriteSheet(itemForm.value)
      keys.forEach(key => store.spriteSheets[props.i][key] = itemForm.value[key])
    }

    const deleteItem = () => {
      store.spriteSheets.splice(props.i, 1)
      api.deleteSpriteSheet(props.spriteSheet.id)
    }

    const updateSpritesheetFileInput = (event) => {
      const fileName = "/img/sprites/" + event.target.files[0].name
      itemForm.value.src = fileName
      // TODO: update AnimationSet here?
    }

    const editItem = () => {
      populateItemForm()
      isEditing.value = true
    }

    const cancelEdit = () => {
      isEditing.value = false
      itemForm.value = {}
    }

    return {
      store,
      isEditing,
      itemForm,
      populateItemForm,
      saveItem,
      deleteItem,
      updateSpritesheetFileInput,
      editItem,
      cancelEdit
    }
  }
}
</script>