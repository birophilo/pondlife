<template>
  <div>
    <div v-if="adding === true">
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
      <button @click="adding = false">cancel</button>
    </div>
    <div v-else><button @click="adding = true">new agent type</button></div>
  </div>
</template>


<script>
import Agent from '../classes/Agent.js'
import AgentType from '../classes/AgentType.js'
import { AgentMenuIcon } from '../classes/SelectionMenu.js'
import { useStore } from '../store/mainStore.js'

export default {
  name: 'CreateAgentTypeForm',
  setup: function () {
    const store = useStore()
    return { store }
  },
  data: function () {
    return {
      adding: false,
      itemForm: {
        name: '',
        height: 50,
        width: 50,
        animationSet: '',
        thumbnail: '',
        nominalSpeed: 0.02,
        positionX: 100,
        positionY: 100
      }
    }
  },
  methods: {
    createAgentType: function () {

      const agentTypeName = this.itemForm.name

      const agentData = {
        agentClass: Agent,
        agentItems: [],
        config: {
          name: agentTypeName,
          width: Number(this.itemForm.width),
          height: Number(this.itemForm.height),
          frames: {max: 9, columns: 4, rows: 3, hold: 3},
          offset: {x: 96, y: 46},
          scale: 1,
          nominalSpeed: Number(this.itemForm.nominalSpeed),
          previewImage: '/img/sprites/GirlSample_Walk_Down.png',
          animationSet: this.itemForm.animationSet,
          thumbnail: this.itemForm.thumbnail,
          defaultSpriteSheet: 'idle'
        }
      }

      this.store.agentTypes[agentTypeName] = new AgentType(agentData.config)

      this.store.agentItems[agentTypeName] = []

      let newIcon = new AgentMenuIcon({
        menu: this.store.itemMenu,
        i: this.store.agentMenuButtons.length + 1,
        name: agentData.config.name,
        agent: Agent,
        config: agentData.config
      })
      this.store.agentMenuButtons.push(newIcon)

      this.adding = false
    },
    updateThumbnailFileInput: function (event) {
      const fileName = "/img/thumbnails/" + event.target.files[0].name
      this.itemForm.thumbnail = fileName
    },
  }
}

</script>