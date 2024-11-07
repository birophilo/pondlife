<template>
  <div>
    <div v-if="agentTypeData.name !== 'world'">
      <div v-if="agentTypeData.editing === true">
        name: <input v-model="agentTypeData.name" type="text" placeholder="name" /><br />
        width: <input v-model="agentTypeData.width" type="number" placeholder="width" /><br />
        height: <input v-model="agentTypeData.height" type="number" placeholder="height" /><br />
        movement speed: <input v-model="agentTypeData.nominalSpeed" type="number" placeholder="1" /><br />
        spriteMap:
        <select v-model="agentTypeData.spriteMap">
          <option value="">-- select sprite map --</option>
          <option :value="spriteMap" v-for="spriteMap in store.spriteMaps">{{ spriteMap.name }}</option>
        </select>
        <br />
        thumbnail: {{ agentTypeData.thumbnail }}<br />
        <input type="file" placeholder="thumbnail" @change="updateThumbnailFileInput($event, agentTypeData)" /><br />
        <button @click="saveAgentType(agentTypeData.name)">save</button>
        <button @click="agentTypeData.editing = false; $forceUpdate()">cancel</button>
      </div>
      <div v-else>
        {{ agentType.name }}
        <button @click="agentTypeData.editing = true; $forceUpdate()">edit</button>
        <button @click="deleteAgentType(agentTypeData.name)">delete</button>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from '../store/mainStore.js'

export default {
  name: 'MenuAgentType',
  setup: function () {
    const store = useStore()
    return { store }
  },
  props: {
    agentType: Object
  },
  mounted: function () {
    this.setupAgentTypeData()
  },
  data: function () {
    return {
      agentTypeData: {}
    }
  },
  methods: {
    setupAgentTypeData: function () {
      this.agentTypeData = {
        editing: this.agentType.adding,
        name: this.agentType.name,
        height: this.agentType.config.height,
        width: this.agentType.config.width,
        spriteMap: this.agentType.config.spriteMap,
        thumbnail: this.agentType.config.thumbnail,
        nominalSpeed: this.agentType.config.nominalSpeed,
        positionX: 100,
        positionY: 100
      }
    },
    saveAgentType: function (agentTypeName) {
      this.agentTypeData.editing = false

      // this.store.agentItems[this.agentTypeName] = [...this.store.agentItems[this.agentType.name]]

      const data = {
        editing: this.agentTypeData.editing,
        name: this.agentTypeData.name,
        config: {
          height: this.agentTypeData.height,
          width: this.agentTypeData.width,
          spriteMap: this.agentTypeData.spriteMap,
          thumbnail: this.agentTypeData.thumbnail,
          nominalSpeed: this.agentTypeData.nominalSpeed,
        },
        positionX: this.agentTypeData.positionX,
        positionY: this.agentTypeData.positionY
      }

      this.store.agentTypes[agentTypeName] = data

      // delete this.store.agentTypes[this.agentType.name]
      // delete this.store.agentItems[this.agentType.name]

      this.$forceUpdate()
    },
    updateThumbnailFileInput: function (event, agentTypeData) {
      const fileName = "/img/thumbnails/" + event.target.files[0].name
      agentTypeData.thumbnail = fileName
    },
    deleteAgentType: function (agentType) {
      delete this.store.agentTypes[agentType]
      delete this.store.agentItems[agentType]
    },
  }

  
}

</script>