<template>
  <div class="simulations-view">
    <NavTopLogin />
    <div class="simulations-body">
      <SceneMenu @load-scene="onLoadScene" @create-new-scene="onCreateScene" />
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import NavTopLogin from '@/components/NavTopLogin.vue'
import SceneMenu from '@/components/SceneMenu.vue'
import api from '@/apiCrud.js'

export default {
  name: 'SimulationsView',
  components: { NavTopLogin, SceneMenu },
  setup () {
    const router = useRouter()

    const onLoadScene = async (scene) => {
      await router.push({
        name: 'simulationDetail',
        params: { sceneId: scene.id }
      })
    }

    const onCreateScene = async (sceneNameParam) => {
      const newScene = await api.createScene({ name: sceneNameParam })
      await router.push({
        name: 'simulationDetail',
        params: { sceneId: newScene.id }
      })
    }

    return {
      onLoadScene,
      onCreateScene
    }
  }
}
</script>

<style scoped>
.simulations-view {
  min-height: 100vh;
  background-color: #efeee8;
  color: #e43d12;
  font-family: 'Rubik', sans-serif;
}
.simulations-body {
  padding: 24px 20px;
}
</style>
