<template>
  <div id="scene-menu-content-container">
    <div class="close-menu-button">
      <p>
        <small @click="store.displaySceneMenu = false">close</small>
      </p>
    </div>

    <div>Simulation Menu</div>

    <div v-for="scene in store.sceneList">
      {{ scene.name }}<button @click="$emit('load-scene', scene)">load</button>
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

    onMounted(() => {
      store.fetchSceneList()
    })

    return {
      store,
      showSceneNameForm,
      newSceneName,
      cancelCreate
    }
  }

}

</script>

<style>

.content-container {
  width: 450px;
  height: 600px;
  border: 1px solid black;
}

.close-menu-button {
  cursor: pointer
}

</style>