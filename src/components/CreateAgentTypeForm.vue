<template>
  <div>
    <div v-if="isAdding === true">
      name: <input v-model="itemForm.name" type="text" placeholder="name" /><br />
      width: <input v-model="itemForm.width" type="number" placeholder="width" /><br />
      height: <input v-model="itemForm.height" type="number" placeholder="height" /><br />
      movement speed: <input v-model="itemForm.nominalSpeed" type="number" placeholder="1" /><br />
      animationSet:
      <select v-model="itemForm.animationSet">
        <option value="">-- select sprite map --</option>
        <option :value="animationSet" v-for="animationSet in store.animationSets">{{ animationSet.name }}</option>
      </select><br />
      thumbnail: {{ itemForm.thumbnail }}<br />
      <input type="file" placeholder="thumbnail" @change="updateThumbnailFileInput($event)" /><br />
      <button @click="createAgentType()">create agent type</button>
      <button @click="isAdding = false">cancel</button>
    </div>
    <div v-else><button @click="isAdding = true">new agent type</button></div>
  </div>
</template>


<script>
import { ref } from 'vue'
import Agent from '../classes/Agent.js'
import { createAgentTypeObject } from '../classes/AgentType.js'
import { AgentMenuIcon } from '../classes/SelectionMenu.js'
import { useStore } from '../store/mainStore.js'

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
      positionY: 100
    })

    const createAgentType = () => {

      const agentTypeName = itemForm.value.name

      const agentData = {
        agentClass: Agent,
        agentItems: [],
        config: {
          name: agentTypeName,
          width: Number(itemForm.value.width),
          height: Number(itemForm.value.height),
          frames: {max: 9, columns: 4, rows: 3, hold: 3},
          offset: {x: 96, y: 46},
          scale: 1,
          nominalSpeed: Number(itemForm.value.nominalSpeed),
          previewImage: '/img/sprites/GirlSample_Walk_Down.png',
          animationSet: itemForm.value.animationSet,
          thumbnail: itemForm.value.thumbnail,
          defaultSpriteSheet: 'idle'
        }
      }

      store.agentTypes[agentTypeName] = createAgentTypeObject(agentData.config)

      store.agentItems[agentTypeName] = []

      let newIcon = new AgentMenuIcon({
        menu: store.itemMenu,
        i: store.agentMenuButtons.length + 1,
        name: agentData.config.name,
        agent: Agent,
        config: agentData.config
      })
      store.agentMenuButtons.push(newIcon)

      isAdding.value = false
    }

    const updateThumbnailFileInput = (event) => {
      const fileName = "/img/thumbnails/" + event.target.files[0].name
      itemForm.value.positionYthumbnail = fileName
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