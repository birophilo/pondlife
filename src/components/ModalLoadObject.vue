<template>
  <div>
    <button @click="store.displayLoadObjectModal = false">X</button>
    {{ objectType }}
    <p>
    Select {{ objectType }} to add to scene
    </p>

    <div v-for="agentType in agentTypeList">
      <div class="load-object-modal-item">
        <img
          :src="agentType.thumbnail"
          width="50"
          height="50"
          @click="addAgentTypeToScene(agentType)"
        >
        <span
          class="modal-item-name"
          @click="addAgentTypeToScene(agentType)"
        >{{ agentType.name }}</span>
      </div>
      
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from '@/store/mainStore.js'
import { AgentMenuIcon } from '@/classes/SelectionMenu.js'

export default {
  name: 'ModalLoadObject',
  props: {
    agentTypeList: Array
  },
  setup() {
    const store = useStore()

    const objectType = ref('Agent Type')

    const addAgentTypeToScene = async (agentType) => {

      const atName = agentType.name
      store.agentTypes[atName] = agentType
      store.agentItems[atName] = []
      store.displayLoadObjectModal = false

      store.agentMenuButtons.push(
        new AgentMenuIcon({
          menu: store.itemMenu,
          i: store.agentMenuButtons.length,
          name: atName,
          agentType: store.agentTypes[atName]
        })
      )

      await store.saveScene()
    }

    return {
      store,
      objectType,
      addAgentTypeToScene
    }

  }
}

</script>

<style scoped>

.load-object-modal-item {
  display: flex;
  align-items: center;
  margin: 10px 0 10px 0;
  cursor: pointer;
}

.modal-item-name {
  margin-left: 16px;
}

</style>
