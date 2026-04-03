<template>
  <div id="scene-menu-content-container">
    <p class="scene-menu-back">
      <router-link :to="{ name: 'sim' }">Back to simulation</router-link>
    </p>

    <h1 class="scene-menu-title">Simulations</h1>

    <div class="scene-menu-item">
      <div class="scene-name">Name</div>
      <div class="scene-last-modified">Last modified</div>
      <div class="scene-load-button"></div>
    </div>

    <div v-for="scene in store.sceneList" :key="scene.id" class="scene-menu-item">
      <div class="scene-name">{{ scene.name }}</div>
      <div class="scene-last-modified">{{ formatDate(scene.lastModified) }}</div>
      <div class="scene-load-button">
        <button @click="$emit('load-scene', scene)">load</button>
      </div>
    </div>

    <div v-if="showSceneNameForm">
      <input v-model = "newSceneName" type="text" placeholder="enter name" />
      <button @click="$emit('create-new-scene', newSceneName)">create</button>
      <button @click="cancelCreate">cancel</button>
    </div>
    <div v-else>
      <button @click="showSceneNameForm = true">New simulation</button>
    </div>

  </div>
</template>


<script>
import { onMounted, ref } from 'vue'
import { useStore } from '../store/mainStore.js'


export default {
  name: 'SceneMenu',

  setup() {
    const store = useStore()

    const showSceneNameForm = ref(false)
    const newSceneName = ref('')

    const cancelCreate = () => {
      newSceneName.value = ''
      showSceneNameForm.value = false
    }

    const formatDate = (timestamp) => {
      const date = new Date(timestamp).toLocaleString("en-GB")
      return date
    }

    onMounted(() => {
      store.fetchSceneList()
    })

    return {
      store,
      showSceneNameForm,
      newSceneName,
      cancelCreate,
      formatDate
    }
  }

}

</script>

<style scoped>

.content-container {
  height: 600px;
  border: 1px solid black;
}

.scene-menu-back {
  margin: 0 0 12px 0;
}
.scene-menu-back a {
  color: inherit;
  font-weight: 500;
}
.scene-menu-title {
  margin: 0 0 16px 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.scene-menu-item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 600px;
}

.scene-name {
  width: 300px;
}

.scene-load-button {
  width: 100px;
}

.scene-last-modified {
  width: 200px;
}

</style>