<template>
  <div id="scene-menu-content-container">
    <div class="close-menu-button">
      <p>
        <small @click="store.displaySceneMenu = false">close</small>
      </p>
    </div>

    <div>This is the scene menu</div>

    <div v-for="scene in store.sceneList">
      <button @click="$emit('load-scene', scene)">Scene {{ scene.name }} {{ scene.id }}</button>
    </div>

    <!-- <RouterView /> -->

    <!-- <div class="scene-button-container">
      <div v-for="sceneId in sceneData">
        <div>Scene {{ scene }}
          <router-link :to="{ name: 'SceneView', params: { sceneId: sceneId } }">
            <button>load</button>
          </router-link>
        </div>
      </div>
    </div> -->

  </div>
</template>


<script>
import { onMounted } from 'vue'
import { useStore } from '../store/mainStore.js'


export default {
  name: 'SceneMenu',

  setup() {
    const store = useStore()

    onMounted(() => {
      store.fetchSceneList()
    })

    return {
      store
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