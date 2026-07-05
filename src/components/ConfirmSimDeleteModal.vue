<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="confirm-sim-delete-backdrop"
      @pointerdown.self="emitClose"
    >
      <form
        class="confirm-sim-delete"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @submit.prevent="emitConfirm"
        @keyup.esc="emitClose"
      >
        <h2 :id="titleId" class="confirm-sim-delete__title">
          Confirm delete
        </h2>

        <p class="confirm-sim-delete__target">
          <span class="confirm-sim-delete__entity-type">{{ entityTypeLabel }}</span>
          <span class="confirm-sim-delete__entity-name">{{ entityName }}</span>
        </p>

        <footer class="confirm-sim-delete__footer">
          <button
            type="button"
            class="confirm-sim-delete__btn confirm-sim-delete__btn--secondary"
            :disabled="deleting"
            @click="emitClose"
          >
            Cancel
          </button>
          <button
            ref="submitButtonRef"
            type="submit"
            class="confirm-sim-delete__btn confirm-sim-delete__btn--danger"
            :disabled="deleting"
          >
            Delete
          </button>
        </footer>
      </form>
    </div>
  </Teleport>
</template>

<script>
import { nextTick, ref, watch } from 'vue'

let titleIdCounter = 0

export default {
  name: 'ConfirmSimDeleteModal',

  props: {
    open: {
      type: Boolean,
      default: false
    },
    /** Human-readable entity kind, e.g. "agent initial property". */
    entityTypeLabel: {
      type: String,
      required: true
    },
    /** Primary identifier shown to the user, e.g. property or action name. */
    entityName: {
      type: String,
      default: ''
    },
    deleting: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close', 'confirm'],

  setup (props, { emit }) {
    const titleId = `confirm-sim-delete-title-${++titleIdCounter}`
    const submitButtonRef = ref(null)

    const emitClose = () => {
      if (!props.deleting) emit('close')
    }

    const emitConfirm = () => {
      if (!props.deleting) emit('confirm')
    }

    watch(
      () => props.open,
      (isOpen) => {
        if (!isOpen) return
        // Clicking delete leaves focus on that button; move focus here so
        // native Enter activates the submit control (form has no text inputs).
        nextTick(() => {
          submitButtonRef.value?.focus()
        })
      }
    )

    return {
      titleId,
      submitButtonRef,
      emitClose,
      emitConfirm
    }
  }
}
</script>

<style scoped>
.confirm-sim-delete-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: rgba(0, 0, 0, 0.45);
  box-sizing: border-box;
}

.confirm-sim-delete {
  width: 100%;
  max-width: 420px;
  margin: 0;
  padding: 24px;
  border-radius: 12px;
  background: #fffef9;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  border: 1px solid #e8d5cf;
  box-sizing: border-box;
}

.confirm-sim-delete__title {
  margin: 0 0 16px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2a2a2a;
}

.confirm-sim-delete__target {
  margin: 0 0 20px;
  line-height: 1.45;
  color: #444;
}

.confirm-sim-delete__entity-type {
  display: block;
  font-size: 0.8rem;
  text-transform: lowercase;
  color: #888;
}

.confirm-sim-delete__entity-name {
  display: block;
  margin-top: 4px;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Lucida Console', monospace;
  color: #2a2a2a;
  word-break: break-word;
}

.confirm-sim-delete__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid #eee5df;
}

.confirm-sim-delete__btn {
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid #dcc;
}

.confirm-sim-delete__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.confirm-sim-delete__btn--secondary {
  background: #f5f0eb;
  color: #333;
}

.confirm-sim-delete__btn--secondary:hover:not(:disabled) {
  background: #ebe4dc;
}

.confirm-sim-delete__btn--danger {
  background: #b00020;
  border-color: #8f0019;
  color: #fff;
}

.confirm-sim-delete__btn--danger:hover:not(:disabled) {
  background: #96001b;
}
</style>
