<template>
  <button
    type="button"
    class="menu-icon-btn"
    :aria-label="label"
    :title="label"
    :disabled="disabled"
  >
    <Check :size="16" aria-hidden="true" />
  </button>
</template>

<script>
import { Check } from '@lucide/vue'

export default {
  name: 'MenuConfirmBtn',

  components: { Check },

  props: {
    label: {
      type: String,
      default: 'Save'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
}
</script>
