<template>
  <button
    type="button"
    class="browse-btn"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <span>browse</span>
    <FolderUp :size="16" aria-hidden="true" />
  </button>
</template>

<script>
import { FolderUp } from '@lucide/vue'

export default {
  name: 'MenuBrowseBtn',

  components: { FolderUp },

  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },

  emits: ['click']
}
</script>
