<template>
  <button
    type="button"
    class="menu-icon-btn"
    :aria-label="label"
    :title="label"
    :disabled="disabled"
  >
    <X :size="16" aria-hidden="true" />
  </button>
</template>

<script>
import { X } from '@lucide/vue'

export default {
  name: 'MenuCancelBtn',

  components: { X },

  props: {
    label: {
      type: String,
      default: 'Cancel'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
}
</script>
