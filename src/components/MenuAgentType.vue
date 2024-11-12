<template>
  <div>
    <div v-if="itemForm.name !== 'world'">
      <div v-if="editing === true">
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
        <input type="file" placeholder="thumbnail" @change="updateThumbnailFileInput($event, agentTypeData)" /><br />
        <button @click="saveItem(itemForm.name)">save</button>
        <button @click="cancelEdit">cancel</button>
      </div>
      <div v-else>
        {{ agentType.name }}
        <button @click="editItem">edit</button>
        <button @click="deleteItem(agentType.name)">delete</button>
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
  data: function () {
    return {
      editing: false,
      itemForm: {}
    }
  },
  methods: {
    populateItemForm: function () {
      this.itemForm = {
        name: this.agentType.name,
        height: this.agentType.config.height,
        width: this.agentType.config.width,
        animationSet: this.agentType.config.animationSet,
        thumbnail: this.agentType.config.thumbnail,
        nominalSpeed: this.agentType.config.nominalSpeed,
        positionX: 100,
        positionY: 100
      }
    },
    saveItem: function (agentTypeName) {
      this.editing = false
      const data = {
        editing: this.itemForm.editing,
        name: this.itemForm.name,
        config: {
          height: this.itemForm.height,
          width: this.itemForm.width,
          animationSet: this.itemForm.animationSet,
          thumbnail: this.itemForm.thumbnail,
          nominalSpeed: this.itemForm.nominalSpeed,
        },
        positionX: this.itemForm.positionX,
        positionY: this.itemForm.positionY
      }
      this.store.agentTypes[agentTypeName] = data
    },
    updateThumbnailFileInput: function (event) {
      const fileName = "/img/thumbnails/" + event.target.files[0].name
      this.itemForm.thumbnail = fileName
    },
    deleteItem: function (agentType) {
      delete this.store.agentTypes[agentType]
      delete this.store.agentItems[agentType]
    },
    editItem: function () {
      this.populateItemForm()
      this.editing = true
    },
    cancelEdit: function () {
      this.editing = false
      this.itemForm = {}
    }
  }
}

</script>