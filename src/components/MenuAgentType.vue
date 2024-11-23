<template>
  <div>
    <div v-if="itemForm.name !== 'world'">
      <div v-if="isEditing === true">
        name: <input v-model="itemForm.name" type="text" placeholder="name" /><br />
        width: <input v-model="itemForm.width" type="number" placeholder="width" /><br />
        height: <input v-model="itemForm.height" type="number" placeholder="height" /><br />
        movement speed: <input v-model="itemForm.nominalSpeed" type="number" placeholder="1" /><br />
        animationSet:
        <select v-model="itemForm.animationSet">
          <option value="">-- select animation set --</option>
          <option :value="animationSet" v-for="animationSet in store.animationSets">{{ animationSet.name }}</option>
        </select>
        <br />
        thumbnail: {{ itemForm.thumbnail }}<br />
        <input type="file" placeholder="thumbnail" @change="updateThumbnailFileInput($event)" /><br />
        <button @click="saveItem(itemForm.name)">save</button>
        <button @click="cancelEdit">cancel</button>
      </div>
      <div v-else>
        {{ agentType.name }}
        <button @click="editItem">edit</button>
        <button @click="deleteItem">delete</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from '../store/mainStore.js'

export default {
  name: 'MenuAgentType',
  props: {
    agentType: Object
  },
  setup: function (props) {
    const store = useStore()

    const isEditing = ref(false)

    const itemFormData = {
      name: props.agentType.name,
      height: props.agentType.config.height,
      width: props.agentType.config.width,
      animationSet: props.agentType.config.animationSet,
      thumbnail: props.agentType.config.thumbnail,
      nominalSpeed: props.agentType.config.nominalSpeed,
      positionX: 100,
      positionY: 100
    }

    const itemForm = ref(itemFormData)

    const deleteItem = () => {
      delete store.agentTypes[props.agentType.name]
      delete store.agentItems[props.agentType.name]
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
        name: props.agentType.name,
        height: props.agentType.config.height,
        width: props.agentType.config.width,
        animationSet: props.agentType.config.animationSet,
        thumbnail: props.agentType.config.thumbnail,
        nominalSpeed: props.agentType.config.nominalSpeed,
        positionX: 100,
        positionY: 100
      }
    }

    const saveItem = () => {
      isEditing.value = false
      const data = {
        isEditing: itemForm.value.isEditing,
        name: itemForm.value.name,
        config: {
          height: itemForm.value.height,
          width: itemForm.value.width,
          animationSet: itemForm.value.animationSet,
          thumbnail: itemForm.value.thumbnail,
          nominalSpeed: itemForm.value.nominalSpeed,
        },
        positionX: itemForm.value.positionX,
        positionY: itemForm.value.positionY
      }
      store.agentTypes[props.agentType.name] = data
    }

    const updateThumbnailFileInput = (event) => {
      const fileName = "/img/thumbnails/" + event.target.files[0].name
      itemForm.value.thumbnail = fileName
    }

    return {
      store,
      isEditing,
      itemForm,
      editItem,
      saveItem,
      deleteItem,
      cancelEdit,
      populateItemForm,
      updateThumbnailFileInput
    }
  }
}

</script>