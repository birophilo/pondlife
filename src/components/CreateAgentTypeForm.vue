<template>
  <div>
    <div v-if="agentTypeForm.adding === true">
      name: <input v-model="agentTypeForm.name" type="text" placeholder="name" /><br />
      width: <input v-model="agentTypeForm.width" type="number" placeholder="width" /><br />
      height: <input v-model="agentTypeForm.height" type="number" placeholder="height" /><br />
      movement speed: <input v-model="agentTypeForm.nominalSpeed" type="number" placeholder="1" /><br />
      animationSet:
      <select v-model="agentTypeForm.animationSet">
        <option value="">-- select sprite map --</option>
        <option :value="animationSet" v-for="animationSet in store.animationSets">{{ animationSet.name }}</option>
      </select><br />
      thumbnail: {{ agentTypeForm.thumbnail }}<br />
      <input type="file" placeholder="thumbnail" @change="updateThumbnailFileInput($event, agentTypeForm)" /><br />
      <button @click="createAgentType()">create agent type</button>
      <button @click="agentTypeForm.adding = false">cancel</button>
    </div>
    <div v-else><button @click="agentTypeForm.adding = true">new agent type</button></div>
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
      agentTypeForm: {
        adding: false,
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

      const agentTypeName = this.agentTypeForm.name

      const agentData = {
        agentClass: Agent,
        agentItems: [],
        config: {
          name: agentTypeName,
          width: Number(this.agentTypeForm.width),
          height: Number(this.agentTypeForm.height),
          frames: {max: 9, columns: 4, rows: 3, hold: 3},
          offset: {x: 96, y: 46},
          scale: 1,
          nominalSpeed: Number(this.agentTypeForm.nominalSpeed),
          previewImage: '/img/sprites/GirlSample_Walk_Down.png',
          animationSet: this.agentTypeForm.animationSet,
          thumbnail: this.agentTypeForm.thumbnail,
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

      this.agentTypeForm.adding = false
    },
    updateThumbnailFileInput: function (event, agentTypeForm) {
      const fileName = "/img/thumbnails/" + event.target.files[0].name
      agentTypeForm.thumbnail = fileName
    },
  }
}

</script>