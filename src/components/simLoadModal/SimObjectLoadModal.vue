<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="sim-load-modal-backdrop"
      @pointerdown.self="emitClose"
    >
      <div
        class="sim-load-modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @keyup.esc="emitClose"
      >
        <button
          type="button"
          class="sim-load-modal__close"
          aria-label="Close"
          @click="emitClose"
        >
          ×
        </button>

        <h2 :id="titleId" class="sim-load-modal__title">
          {{ title }}
        </h2>

        <p v-if="description" class="sim-load-modal__description">
          {{ description }}
        </p>

        <div
          v-if="columns.length"
          class="sim-load-modal__list-header"
          aria-hidden="true"
        >
          <span
            v-for="column in columns"
            :key="column.key"
            class="sim-load-modal__list-header-cell"
            :style="headerCellStyle(column)"
          >
            {{ column.label }}
          </span>
        </div>

        <div class="sim-load-modal__list-body">
          <p
            v-if="loading"
            class="sim-load-modal__status sim-load-modal__status--placeholder"
          >
            Loading…
          </p>

          <div
            v-else-if="items.length"
            class="sim-load-modal__list"
            role="listbox"
            :aria-label="title"
          >
            <button
              v-for="(item, index) in items"
              :key="itemKeyFor(item, index)"
              type="button"
              class="sim-load-modal__row"
              role="option"
              @click="emitSelect(item)"
            >
              <span
                v-for="column in columns"
                :key="column.key"
                class="sim-load-modal__cell"
                :style="cellStyle(column)"
              >
                <img
                  v-if="column.type === 'image'"
                  :src="cellImageSrc(item, column)"
                  :alt="cellText(item, columns.find(c => c.type === 'text') || column)"
                  class="sim-load-modal__thumb"
                  width="48"
                  height="48"
                />
                <span v-else class="sim-load-modal__cell-text">
                  {{ cellDisplay(item, column) }}
                </span>
              </span>
            </button>
          </div>

          <p
            v-else
            class="sim-load-modal__status sim-load-modal__status--placeholder"
          >
            {{ emptyText }}
          </p>
        </div>

        <footer class="sim-load-modal__footer">
          <button
            type="button"
            class="sim-load-modal__btn sim-load-modal__btn--secondary"
            @click="emitClose"
          >
            Cancel
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { formatTimestamp, timestampMsFromObjectId } from '@/utils.js'

const EMPTY_CELL = '—'

let titleIdCounter = 0

export default {
  name: 'SimObjectLoadModal',

  props: {
    open: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    emptyText: {
      type: String,
      default: 'No items available.'
    },
    loading: {
      type: Boolean,
      default: false
    },
    columns: {
      type: Array,
      default: () => []
    },
    items: {
      type: Array,
      default: () => []
    },
    itemKey: {
      type: String,
      default: 'id'
    }
  },

  emits: ['close', 'select'],

  setup (props, { emit }) {
    const titleId = `sim-load-modal-title-${++titleIdCounter}`

    const emitClose = () => emit('close')
    const emitSelect = (item) => emit('select', item)

    const itemKeyFor = (item, index) => {
      const key = props.itemKey
      if (key && item != null && item[key] != null) {
        return String(item[key])
      }
      return `row-${index}`
    }

    const rawField = (item, column) => {
      if (!item || !column?.key) return null
      let val = item[column.key]
      if ((val == null || val === '') && column.fallbackKey) {
        val = item[column.fallbackKey]
      }
      return val
    }

    const cellDisplay = (item, column) => {
      if (!item || !column) return EMPTY_CELL
      if (column.type === 'datetime') {
        let ms = item[column.key]
        if ((ms == null || ms === '') && column.fallbackFromObjectId && item.id) {
          ms = timestampMsFromObjectId(item.id)
        }
        const formatted = formatTimestamp(ms)
        return formatted || EMPTY_CELL
      }
      const val = rawField(item, column)
      if (val == null || val === '') return EMPTY_CELL
      return String(val)
    }

    const cellText = (item, column) => {
      const val = rawField(item, column)
      return val == null ? '' : String(val)
    }

    const cellImageSrc = (item, column) => {
      const raw = cellText(item, column)
      if (!raw) return ''
      if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) {
        return raw
      }
      const prefix = column.imagePrefix ?? '/'
      return `${prefix}${raw}`
    }

    const headerCellStyle = (column) => {
      const style = {}
      if (column.width) style.width = column.width
      if (column.minWidth) style.minWidth = column.minWidth
      if (column.flex) style.flex = column.flex
      return style
    }

    const cellStyle = headerCellStyle

    return {
      titleId,
      emitClose,
      emitSelect,
      itemKeyFor,
      cellDisplay,
      cellText,
      cellImageSrc,
      headerCellStyle,
      cellStyle
    }
  }
}
</script>

<style scoped>
.sim-load-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: rgba(0, 0, 0, 0.45);
  box-sizing: border-box;
}

.sim-load-modal {
  position: relative;
  width: 100%;
  max-width: 820px;
  max-height: min(85vh, 640px);
  display: flex;
  flex-direction: column;
  padding: 28px 24px 20px;
  border-radius: 12px;
  background: #fffef9;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  border: 1px solid #e8d5cf;
  box-sizing: border-box;
}

.sim-load-modal__close {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: #555;
  border-radius: 6px;
}

.sim-load-modal__close:hover {
  background: rgba(0, 0, 0, 0.06);
}

.sim-load-modal__title {
  margin: 0 32px 8px 0;
  font-size: 1.35rem;
  font-weight: 600;
  color: #2a2a2a;
}

.sim-load-modal__description {
  margin: 0 0 16px;
  font-size: 0.95rem;
  color: #555;
  line-height: 1.4;
}

.sim-load-modal__status {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

/** Fixed list pane — loading, empty, and populated share the same height (~5 rows). */
.sim-load-modal__list-body {
  height: 360px;
  min-height: 360px;
  margin: 0 0 16px;
  box-sizing: border-box;
}

.sim-load-modal__status--placeholder {
  display: flex;
  align-items: flex-start;
  height: 100%;
  padding: 12px 8px;
  box-sizing: border-box;
}

.sim-load-modal__list-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #888;
  border-bottom: 1px solid #e8d5cf;
}

.sim-load-modal__list-header-cell {
  flex-shrink: 0;
}

.sim-load-modal__list {
  height: 100%;
  overflow-y: auto;
  margin: 0 -8px;
  padding: 4px 8px;
  box-sizing: border-box;
}

.sim-load-modal__row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin: 0 0 4px;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font: inherit;
  color: inherit;
  box-sizing: border-box;
}

.sim-load-modal__row:hover {
  background: rgba(232, 185, 173, 0.35);
  border-color: #e8b9ad;
}

.sim-load-modal__row:focus-visible {
  outline: 2px solid #e43d12;
  outline-offset: 1px;
}

.sim-load-modal__cell {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  min-width: 0;
}

.sim-load-modal__cell-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sim-load-modal__thumb {
  display: block;
  object-fit: contain;
  border-radius: 4px;
  background: #f0ebe6;
}

.sim-load-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid #eee5df;
}

.sim-load-modal__btn {
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid #dcc;
}

.sim-load-modal__btn--secondary {
  background: #f5f0eb;
  color: #333;
}

.sim-load-modal__btn--secondary:hover {
  background: #ebe4dc;
}
</style>
