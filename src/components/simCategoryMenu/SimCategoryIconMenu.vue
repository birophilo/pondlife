<template>
  <nav class="sim-category-icon-menu" aria-label="Simulation categories">
    <div class="sim-category-icon-menu__grid">
      <button
        v-for="item in sections"
        :key="item.id"
        type="button"
        class="sim-category-icon-menu__item"
        :class="{ 'is-active': modelValue === item.id }"
        :title="item.label"
        :aria-label="item.label"
        :aria-expanded="modelValue === item.id"
        aria-controls="sim-category-drawer"
        @click="onCategoryClick(item.id)"
      >
        <component
          :is="item.icon"
          class="sim-category-icon-menu__icon"
          :size="item.id === 'agent-types' ? 22 : 18"
          :stroke-width="1"
          aria-hidden="true"
        />
      </button>
    </div>

    <div class="sim-category-icon-menu__overlay-control">
      <label class="sim-category-icon-menu__overlay-switch" title="Overlay category drawer on canvas">
        <input
          :checked="overlay"
          type="checkbox"
          class="sim-category-icon-menu__overlay-input"
          @change="onOverlayChange"
        />
        <span class="sim-category-icon-menu__overlay-track" aria-hidden="true" />
      </label>
      <span class="sim-category-icon-menu__overlay-caption">overlay</span>
    </div>
  </nav>
</template>

<script>
import { SIM_CATEGORY_SECTIONS } from '@/components/simCategoryMenu/simCategorySections.js'

export default {
  name: 'SimCategoryIconMenu',

  props: {
    modelValue: {
      type: [String, null],
      default: null
    },
    overlay: {
      type: Boolean,
      default: true
    },
    sections: {
      type: Array,
      default: () => SIM_CATEGORY_SECTIONS
    }
  },

  emits: ['update:modelValue', 'update:overlay'],

  setup (props, { emit }) {
    const onCategoryClick = (id) => {
      emit('update:modelValue', props.modelValue === id ? null : id)
    }

    const onOverlayChange = (event) => {
      emit('update:overlay', event.target.checked)
    }

    return { onCategoryClick, onOverlayChange }
  }
}
</script>

<style scoped>
.sim-category-icon-menu {
  flex: 0 0 90px;
  width: 90px;
  box-sizing: border-box;
  padding: 2px;
  border-right: 1px solid #e8b9ad;
  background: #f5f3ee;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sim-category-icon-menu__overlay-control {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.sim-category-icon-menu__overlay-switch {
  position: relative;
  display: inline-flex;
  cursor: pointer;
}

.sim-category-icon-menu__overlay-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sim-category-icon-menu__overlay-track {
  display: block;
  width: 28px;
  height: 16px;
  border-radius: 8px;
  background: #dcc8c0;
  border: 1px solid #c8b4ac;
  box-sizing: border-box;
  transition: background 0.1s ease;
}

.sim-category-icon-menu__overlay-track::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 3px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fffef9;
  transition: transform 0.1s ease;
}

.sim-category-icon-menu__overlay-input:checked + .sim-category-icon-menu__overlay-track {
  background: #e8b9ad;
  border-color: #e43d12;
}

.sim-category-icon-menu__overlay-input:checked + .sim-category-icon-menu__overlay-track::after {
  transform: translateX(12px);
}

.sim-category-icon-menu__overlay-input:focus-visible + .sim-category-icon-menu__overlay-track {
  outline: 2px solid #e43d12;
  outline-offset: 2px;
}

.sim-category-icon-menu__overlay-caption {
  margin-top: 4px;
  font-size: 0.65rem;
  line-height: 1.2;
  text-align: center;
  color: #a03622;
  user-select: none;
}

.sim-category-icon-menu__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  width: 100%;
  align-self: stretch;
}

.sim-category-icon-menu__item {
  aspect-ratio: 1;
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border: 1px solid #dcc8c0;
  background: #fffef9;
  cursor: pointer;
  color: #a03622;
}

.sim-category-icon-menu__item:hover {
  background: #f0e8e4;
  border-color: #e43d12;
}

.sim-category-icon-menu__item.is-active {
  background: #e8b9ad;
  border-color: #e43d12;
}

.sim-category-icon-menu__item:focus-visible {
  outline: 2px solid #e43d12;
  outline-offset: 1px;
}

.sim-category-icon-menu__icon {
  flex-shrink: 0;
  pointer-events: none;
}
</style>
