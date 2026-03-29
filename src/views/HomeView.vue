<template>
  <div class="home-view">
    <NavTopLogin />
    <div class="home-body">
      <h1>Pondlife</h1>
      <p>Canvas simulation runs on its own route so leaving tears down rAF and listeners (Plan 3 Phase G).</p>
      <router-link class="home-sim-link" :to="{ name: 'sim' }">Open simulation</router-link>
    </div>
  </div>
</template>

<script>
import NavTopLogin from '@/components/NavTopLogin.vue'

export default {
  name: 'HomeView',
  components: { NavTopLogin }
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background-color: #efeee8;
  color: #e43d12;
  font-family: 'Rubik', sans-serif;
}
.home-body {
  padding: 24px 20px;
  max-width: 40rem;
}
.home-sim-link {
  display: inline-block;
  margin-top: 16px;
  padding: 8px 14px;
  border: 1px solid #e43d12;
  border-radius: 3px;
  color: #e43d12;
  text-decoration: none;
  font-weight: 500;
}
.home-sim-link:hover {
  background: rgba(228, 61, 18, 0.08);
}
</style>
