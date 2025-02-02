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
      <input type="file" placeholder="thumbnail" @change="updateThumbnailFileInput($event)" /><br />
      first action:
      <select v-model="itemForm.firstAction">
        <option value="">-- select action --</option>
        <option
          v-for="action in store.actions"
          :value="action.id">{{ action.actionName }}
        </option>
      </select><br />
      <button @click="createAgentType()">create agent type</button>
      <button @click="isAdding = false">cancel</button>
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

    const itemForm = ref({
      name: '',
      height: 50,
      width: 50,
      animationSet: '',
      thumbnail: '',
      nominalSpeed: 0.02,
      positionX: 100,
      positionY: 100,
      firstAction: ''
    })

    const createAgentType = async () => {

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
        previewImage: '/img/sprites/GirlSample_Walk_Down.png',
        animationSet: itemForm.value.animationSet,
        thumbnail: itemForm.value.thumbnail,
        firstAction: itemForm.value.firstAction
      }

      const createdItem = await api.createAgentType(newAgentType)
      newAgentType.id = createdItem.id

      store.agentTypes[agentTypeName] = newAgentType

      store.agentItems[agentTypeName] = []

      let newIcon = new AgentMenuIcon({
        menu: store.itemMenu,
        i: store.agentMenuButtons.length + 1,
        name: agentTypeName,
        agentType: newAgentType
      })
      store.agentMenuButtons.push(newIcon)

      isAdding.value = false
    }

    const updateThumbnailFileInput = (event) => {
      const fileName = "/img/thumbnails/" + event.target.files[0].name
      itemForm.value.thumbnail = fileName
    }

    return {
      store,
      isAdding,
      itemForm,
      createAgentType,
      updateThumbnailFileInput
    }
  }
}

</script>