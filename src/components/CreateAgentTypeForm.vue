<template>
  <div>
    <div v-if="isAdding === true">
      name: <input v-model="itemForm.name" type="text" placeholder="name" /><br />
      width: <input v-model="itemForm.width" type="number" placeholder="width" /><br />
      height: <input v-model="itemForm.height" type="number" placeholder="height" /><br />
      movement speed: <input v-model="itemForm.nominalSpeed" type="number" placeholder="1" /><br />
      animationSet:
      <select v-model="itemForm.animationSet">
        <option value="">-- select animation set --</option>
        <option :value="animationSet" v-for="animationSet in store.animationSets">{{ animationSet.name }}</option>
      </select><br />
      thumbnail: {{ itemForm.thumbnail }}<br />
      <!-- <input type="file" placeholder="thumbnail" @change="updateThumbnailFileInput($event)" /><br /> -->
      <input type="file" @change="handleImageFileUpload" placeholder="media file upload" />
      <button @click="uploadFile">upload image</button>
      <button @click="createAgentTypeMultipart">save agent type</button>
      <button @click="isAdding = false">cancel</button>
      <br />
    </div>
    <div v-else><button @click="isAdding = true">new agent type</button></div>
  </div>
</template>


<script>
import { ref } from 'vue'
import { AgentMenuIcon } from '../classes/SelectionMenu.js'
import { useStore } from '../store/mainStore.js'
import api from '../apiCrud.js'

export default {
  name: 'CreateAgentTypeForm',
  setup: function () {
    const store = useStore()

    const isAdding = ref(false)

    const imageFile = ref(null)
    const formData = ref(null)

    const itemForm = ref({
      name: '',
      height: 50,
      width: 50,
      animationSet: '',
      thumbnail: '',
      nominalSpeed: 0.02,
      positionX: 100,
      positionY: 100
    })

    const updateThumbnailFileInput = (event) => {
      const fileName = "/img/thumbnails/" + event.target.files[0].name
      itemForm.value.thumbnail = fileName
    }

    const handleImageFileUpload = (event) => {
      imageFile.value = event.target.files[0]
    }

    const uploadFile = async () => {
      formData.value = new FormData();
      formData.value.append("jsondata", "this_image");
      formData.value.append("file", imageFile.value);

      const createdItem = await api.createAgentTypeMultipart(formData.value)

      console.log(createdItem)
    }

    const createAgentTypeMultipart = async () => {

      const agentTypeName = itemForm.value.name

      const newAgentType = {
        name: agentTypeName,
        width: Number(itemForm.value.width),
        height: Number(itemForm.value.height),
        offset: {
          x: itemForm.value.positionX,
          y: itemForm.value.positionY
        },
        scale: 1,
        nominalSpeed: Number(itemForm.value.nominalSpeed),
        animationSet: itemForm.value.animationSet
      }

      formData.value = new FormData();
      formData.value.append("jsondata", JSON.stringify(newAgentType));
      formData.value.append("file", imageFile.value);

      const createdItem = await api.createAgentTypeMultipart(formData.value)

      newAgentType.id = createdItem.id

      store.agentTypes[agentTypeName] = newAgentType
      store.agentItems[agentTypeName] = []
      store.firstActions[agentTypeName] = null

      await store.saveScene()

      let newIcon = new AgentMenuIcon({
        menu: store.itemMenu,
        i: store.agentMenuButtons.length + 1,
        name: agentTypeName,
        agentType: newAgentType
      })
      store.agentMenuButtons.push(newIcon)

      isAdding.value = false
    }

    return {
      store,
      isAdding,
      itemForm,
      createAgentTypeMultipart,
      updateThumbnailFileInput,
      handleImageFileUpload,
      uploadFile
    }
  }
}

</script>