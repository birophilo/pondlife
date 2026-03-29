<template>
  <!-- SimView cached: leave /sim suspends rAF + listeners; full destroy only on unmount. -->
  <router-view v-slot="{ Component }">
    <keep-alive include="SimView">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<script setup>
</script>