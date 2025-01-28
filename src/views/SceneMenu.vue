<template>
<div id="container">

  <div>This is the scene menu</div>

  <RouterLink to="/scene-view/1">Scene Menu</RouterLink>

  <div class="scene-button-container">

    <div v-for="sceneId in scenes">
      <div>Scene {{ scene }}
        <router-link :to="{ name: 'SceneView', params: { id: sceneId } }">
          <button>load</button>
        </router-link>
      </div>
    </div>
    <button @click="loadScene('677b5d2f024c92f6b532f00d')">load scene 1</button>
    <button @click="loadScene(2)">load scene 2</button>
    <button @click="saveScene(3)">save scene</button>
  </div>

</div>
</template>


<script>
import { useStore } from '../store/mainStore.js'
// import api from './apiCrud.js'


export default {
  name: 'App',
  setup() {
    const store = useStore()

    const loadScene = async (sceneId) => {
      await store.fetchSceneData(sceneId)
    }

    const saveScene = async (sceneId) => {
      await store.saveScene(sceneId)
    }

    const scenes = [1,2,3]

    return {
      store,
      loadScene,
      saveScene,
      scenes
    }
  }

}

</script>

<style>


body {
  margin: 0;
  padding: 0;
  font-family: "Rubik", sans-serif;
  font-weight: 400;
  font-size: 16px;
  /* background-color: #f4f0e0; */
  background-color: #efeee8;
  /* color: #3345a4; */
  color: #e43d12;
}

canvas {
  width: 1000px;
  height: 600px;
  position: relative;
}

#container {
  display: flex;
  width: 100%;
  justify-content: left;
}

details {
  margin-top: 24px;
}

summary {
  font-size: 1.1rem;
  user-select: none;
}

details[open] summary {
  margin-bottom: 20px;
}

.info-container {
  width: 100%;
  padding: 5px 5px 5px 10px;
}

.speed-slide-container {
  display: flex;
  flex-direction: column;
  padding: 5px;
}

.day-container {
  padding: 5px;
}

.menu-subheading,h3 {
  font-weight: 500;
  font-size: 20px;
  margin: 16px 0 16px 0;
}

.menu-section {
  padding-bottom: 20px;
  border-bottom: 1px solid #ccc;
}

.menu-action-name {
  font-size: 20px;
  padding-right: 10px;
  font-weight: 500;
}

input,select,button {
  padding: 5px 8px 5px 8px;
  margin: 4px;
  font-family: "Rubik", sans-serif;
  border-radius: 3px;
  border-width: 1px;
}

.created-item-header {
  display: flex;
  align-items: center;
}

.created-item {
  border: 1px solid grey;
  border-radius: 5px;
  padding: 5px;
  margin-bottom: 10px;
}

.selection-mode-button {
  cursor: pointer;
}

.canvas-agent-label {
  position: absolute;
  font-size: 11px;
  color: black;
  z-index: 5;
  font-family: 'Helvetica';
  font-weight: 400;
}

table, th, td {
  border: 1px solid #e43d12;
  border-collapse: collapse;
  padding: 5px;
}

button {
  border: 1px solid #e43d12;
}

.body-small {
  font-size: 0.85rem;
}

</style>
