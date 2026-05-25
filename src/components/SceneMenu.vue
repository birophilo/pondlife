<template>
  <div id="scene-menu-content-container">
    <p class="scene-menu-back">
      <router-link :to="simBackRoute">Back to simulation</router-link>
    </p>

    <h1 class="scene-menu-title">Simulations</h1>

    <p v-if="hasLoadedScene" class="scene-menu-currently-loaded">
      Currently loaded: {{ store.sceneName }}
    </p>

    <div class="scene-menu-item scene-menu-item--header">
      <div class="scene-name">Name</div>
      <div class="scene-last-modified">Last modified</div>
      <div class="scene-load-button"></div>
    </div>

    <div
      v-for="scene in store.sceneList"
      :key="scene.id"
      class="scene-menu-item"
      :class="{ 'scene-menu-item--loaded': isLoadedScene(scene) }"
    >
      <div class="scene-name">{{ scene.name }}</div>
      <div class="scene-last-modified">{{ formatDate(scene.lastModified) }}</div>
      <div class="scene-load-button">
        <button
          v-if="isLoadedScene(scene)"
          type="button"
          @click="$emit('exit-scene')"
        >
          exit scene
        </button>
        <button
          v-else
          type="button"
          :disabled="hasLoadedScene"
          :title="hasLoadedScene ? 'close selected scene first' : undefined"
          @click="$emit('load-scene', scene)"
        >
          load
        </button>
      </div>
    </div>

    <div v-if="showSceneNameForm">
      <input v-model="newSceneName" type="text" placeholder="enter name" />
      <button type="button" @click="$emit('create-new-scene', newSceneName)">create</button>
      <button type="button" @click="cancelCreate">cancel</button>
    </div>
    <div v-else>
      <button type="button" @click="showSceneNameForm = true">New simulation</button>
    </div>
  </div>
</template>


<script>
import { computed, onMounted, ref } from 'vue'
import { useStore } from '../store/mainStore.js'


export default {
  name: 'SceneMenu',

  emits: ['load-scene', 'exit-scene', 'create-new-scene'],

  setup () {
    const store = useStore()

    const showSceneNameForm = ref(false)
    const newSceneName = ref('')

    const hasLoadedScene = computed(() => {
      const id = store.sceneId
      return id != null && String(id).length > 0
    })

    const simBackRoute = computed(() => {
      if (hasLoadedScene.value) {
        return {
          name: 'simulationDetail',
          params: { sceneId: String(store.sceneId) }
        }
      }
      return { name: 'sim' }
    })

    const isLoadedScene = (scene) => {
      return hasLoadedScene.value && String(scene.id) === String(store.sceneId)
    }

    const cancelCreate = () => {
      newSceneName.value = ''
      showSceneNameForm.value = false
    }

    const formatDate = (timestamp) => {
      const date = new Date(timestamp).toLocaleString('en-GB')
      return date
    }

    onMounted(() => {
      store.fetchSceneList()
    })

    return {
      store,
      hasLoadedScene,
      simBackRoute,
      isLoadedScene,
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

.scene-menu-currently-loaded {
  margin: 0 0 14px 0;
  padding: 10px 12px;
  font-weight: 600;
  background: rgba(232, 185, 173, 0.35);
  border: 1px solid #e8b9ad;
  border-radius: 6px;
}

.scene-menu-item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 600px;
  padding: 6px 8px;
  margin: 0 -8px;
  border-radius: 6px;
}

.scene-menu-item--header {
  padding-top: 0;
}

.scene-menu-item--loaded {
  background: rgba(232, 185, 173, 0.45);
  border: 1px solid #e8b9ad;
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

.scene-load-button button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

</style>
