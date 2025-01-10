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
      height: props.agentType.height,
      width: props.agentType.width,
      animationSet: props.agentType.animationSet,
      thumbnail: props.agentType.thumbnail,
      nominalSpeed: props.agentType.nominalSpeed,
      positionX: 100,
      positionY: 100
    }

    const itemForm = ref(itemFormData)

    const deleteItem = () => {
      store.deleteAgentType(props.agentType.id)
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
        id: props.agentType.id,
        name: props.agentType.name,
        height: props.agentType.height,
        width: props.agentType.width,
        animationSet: props.agentType.animationSet,
        thumbnail: props.agentType.thumbnail,
        nominalSpeed: props.agentType.nominalSpeed,
        positionX: props.agentType.offset.x,
        positionY: props.agentType.offset.y
      }
    }

    const saveItem = () => {
      isEditing.value = false
      const data = {
        id: itemForm.value.id,
        name: itemForm.value.name,
        height: itemForm.value.height,
        width: itemForm.value.width,
        animationSet: itemForm.value.animationSet,
        thumbnail: itemForm.value.thumbnail,
        nominalSpeed: itemForm.value.nominalSpeed,
        offset: {
          x: itemForm.value.positionX,
          y: itemForm.value.positionY
        }
      }

      store.updateAgentType(data)
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