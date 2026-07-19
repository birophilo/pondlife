<template>
  <span ref="anchorRef" class="menu-tooltip-anchor">
    <slot name="trigger" :tooltip-id="tooltipId" />
  </span>

  <Teleport to="body">
    <div
      v-if="open"
      :id="tooltipId"
      ref="tooltipRef"
      class="menu-tooltip"
      :class="{ 'menu-tooltip--below': placement === 'below' }"
      :style="tooltipStyle"
      role="dialog"
      aria-label="Action unavailable"
    >
      <button
        type="button"
        class="menu-tooltip__close"
        aria-label="Close message"
        @click="close"
      >
        <X :size="14" aria-hidden="true" />
      </button>
      <div class="menu-tooltip__content">
        <slot>{{ message }}</slot>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { X } from '@lucide/vue'

let tooltipIdCounter = 0

export default {
  name: 'MenuTooltip',

  components: { X },

  props: {
    open: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: ''
    }
  },

  emits: ['update:open'],

  setup (props, { emit }) {
    const tooltipId = `menu-tooltip-${++tooltipIdCounter}`
    const anchorRef = ref(null)
    const tooltipRef = ref(null)
    const position = ref({ top: 0, left: 0, arrowLeft: 20 })
    const positionReady = ref(false)
    const placement = ref('above')

    const tooltipStyle = computed(() => ({
      top: `${position.value.top}px`,
      left: `${position.value.left}px`,
      visibility: positionReady.value ? 'visible' : 'hidden',
      '--menu-tooltip-arrow-left': `${position.value.arrowLeft}px`
    }))

    const close = () => {
      emit('update:open', false)
    }

    const updatePosition = () => {
      if (!props.open || !anchorRef.value || !tooltipRef.value) return

      const gap = 8
      const viewportPadding = 8
      const anchorRect = anchorRef.value.getBoundingClientRect()
      const tooltipRect = tooltipRef.value.getBoundingClientRect()
      const anchorCentre = anchorRect.left + (anchorRect.width / 2)

      let left = anchorRect.right - tooltipRect.width
      left = Math.max(
        viewportPadding,
        Math.min(left, window.innerWidth - tooltipRect.width - viewportPadding)
      )

      let top = anchorRect.top - tooltipRect.height - gap
      placement.value = 'above'
      if (top < viewportPadding) {
        top = anchorRect.bottom + gap
        placement.value = 'below'
      }

      const arrowLeft = Math.max(
        12,
        Math.min(anchorCentre - left, tooltipRect.width - 12)
      )

      position.value = { top, left, arrowLeft }
      positionReady.value = true
    }

    const handleDocumentPointerDown = (event) => {
      if (!props.open) return
      const path = event.composedPath()
      if (path.includes(anchorRef.value) || path.includes(tooltipRef.value)) return
      close()
    }

    const handleDocumentKeyDown = (event) => {
      if (props.open && event.key === 'Escape') close()
    }

    watch(
      () => props.open,
      async (isOpen) => {
        if (!isOpen) return
        positionReady.value = false
        await nextTick()
        updatePosition()
      }
    )

    onMounted(() => {
      document.addEventListener('pointerdown', handleDocumentPointerDown)
      document.addEventListener('keydown', handleDocumentKeyDown)
      window.addEventListener('resize', updatePosition)
      window.addEventListener('scroll', updatePosition, true)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('pointerdown', handleDocumentPointerDown)
      document.removeEventListener('keydown', handleDocumentKeyDown)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    })

    return {
      anchorRef,
      tooltipRef,
      tooltipId,
      tooltipStyle,
      placement,
      close
    }
  }
}
</script>

<style scoped>
.menu-tooltip-anchor {
  display: inline-flex;
  position: relative;
}

.menu-tooltip {
  position: fixed;
  z-index: 1200;
  box-sizing: border-box;
  width: min(270px, calc(100vw - 16px));
  padding: 12px 32px 12px 14px;
  border: 1px solid var(--menu-border);
  border-radius: 4px;
  background: var(--menu-surface);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
  color: var(--menu-text);
  font-size: var(--menu-body-small-size);
  line-height: 1.4;
}

.menu-tooltip::after {
  position: absolute;
  top: 100%;
  left: var(--menu-tooltip-arrow-left);
  width: 9px;
  height: 9px;
  border-right: 1px solid var(--menu-border);
  border-bottom: 1px solid var(--menu-border);
  background: var(--menu-surface);
  content: '';
  transform: translate(-50%, -5px) rotate(45deg);
}

.menu-tooltip--below::after {
  top: auto;
  bottom: 100%;
  border: 0;
  border-top: 1px solid var(--menu-border);
  border-left: 1px solid var(--menu-border);
  transform: translate(-50%, 5px) rotate(45deg);
}

.menu-tooltip__close {
  position: absolute;
  top: 5px;
  right: 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin: 0;
  padding: 0;
  border: 1px solid transparent;
  background: transparent;
  color: var(--menu-text-subtle);
  cursor: pointer;
}

.menu-tooltip__close:hover {
  border-color: var(--menu-border-light);
  color: var(--menu-text-hover);
}

.menu-tooltip__content {
  overflow-wrap: anywhere;
}
</style>
