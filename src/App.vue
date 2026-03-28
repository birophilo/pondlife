<template>
  <!--
    Plan 3 Phase C: no :key on router-view — a key forces remount and would tear
    down SimView’s canvas + simRuntime. Use a key only when you want that reset.
  -->
  <router-view />
</template>

<script setup>
</script>