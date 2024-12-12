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
      itemForm.value = {
        name: props.spriteSheet.name,
        src: props.spriteSheet.src,
        columns: Number(props.spriteSheet.columns),
        rows: Number(props.spriteSheet.rows),
        numImages: Number(props.spriteSheet.numImages),
        refreshInterval: Number(props.spriteSheet.refreshInterval)
      }
    }

    const saveItem = () => {
      isEditing.value = false
      const keys = Object.keys(props.spriteSheet)
      keys.forEach(key => store.spriteSheets[props.i][key] = itemForm.value[key])
      localStorage.setItem('pondlifeSpriteSheets', JSON.stringify(store.spriteSheets))
    }

    const deleteItem = () => {
      store.spriteSheets.splice(props.i, 1)
      // 'save' to avoid inputting all after each page refresh
      localStorage.setItem('pondlifeSpriteSheets', JSON.stringify(store.spriteSheets))
    }

    const updateSpritesheetFileInput = (event) => {
      const fileName = "/img/sprites/" + event.target.files[0].name
      itemForm.value.src = fileName
      store.spriteSheets[this.i].src = fileName
      localStorage.setItem('pondlifeSpriteSheets', JSON.stringify(store.spriteSheets))
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