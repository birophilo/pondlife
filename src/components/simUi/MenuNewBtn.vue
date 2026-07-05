<template>
  <button
    type="button"
    class="new-btn"
    @click="$emit('click')"
  >
    <span>new</span>
    <Plus :size="16" aria-hidden="true" />
  </button>
</template>

<script>
import { Plus } from '@lucide/vue'

export default {
  name: 'MenuNewBtn',

  components: { Plus },

  emits: ['click']
}
</script>
