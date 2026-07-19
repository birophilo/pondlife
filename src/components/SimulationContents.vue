<template>
  <section class="simulation-contents" aria-labelledby="simulation-contents-heading">
    <h2 id="simulation-contents-heading" class="simulation-contents__heading">
      Simulation Contents
    </h2>

    <p v-if="sections.length === 0" class="simulation-contents__empty">
      No simulation objects loaded.
    </p>

    <section
      v-for="section in sections"
      :key="section.key"
      class="simulation-contents__section"
      :aria-labelledby="`simulation-contents-${section.key}`"
    >
      <h3
        :id="`simulation-contents-${section.key}`"
        class="simulation-contents__section-heading"
      >
        {{ section.title }}
      </h3>

      <div class="simulation-contents__list">
        <article
          v-for="item in section.items"
          :key="item.key"
          class="simulation-contents__item"
        >
          <div class="simulation-contents__summary">
            <button
              type="button"
              class="simulation-contents__expand"
              :aria-expanded="isExpanded(item.key)"
              :aria-controls="`${item.key}-details`"
              :aria-label="`${isExpanded(item.key) ? 'Hide' : 'Show'} details for ${item.name}`"
              @click="toggleExpanded(item.key)"
            >
              <ChevronUp v-if="isExpanded(item.key)" :size="16" aria-hidden="true" />
              <ChevronDown v-else :size="16" aria-hidden="true" />
            </button>

            <span class="simulation-contents__name">{{ item.name }}</span>

            <span
              v-if="item.instanceCount !== null"
              class="simulation-contents__count"
              :title="`${item.instanceCount} instance${item.instanceCount === 1 ? '' : 's'} on the board`"
            >
              {{ item.instanceCount }}
            </span>
          </div>

          <pre
            v-if="isExpanded(item.key)"
            :id="`${item.key}-details`"
            class="simulation-contents__details"
          >{{ formatDetails(item.value) }}</pre>
        </article>
      </div>
    </section>
  </section>
</template>

<script>
import { computed, ref } from 'vue'
import { ChevronDown, ChevronUp } from '@lucide/vue'
import { useStore } from '@/store/mainStore.js'

function itemName (item, fallback) {
  if (item?.name) return item.name
  if (item?.actionName) return item.actionName
  if (item?.agentType && item?.property) return `${item.agentType}: ${item.property}`
  if (item?.property && item?.change) return `${item.property}: ${item.change}`
  if (item?.property) return item.property
  return item?.id ?? fallback
}

function itemKey (sectionKey, value, index) {
  const identifier = String(value?.id ?? value?.name ?? index)
    .replace(/[^a-zA-Z0-9_-]/g, '-')
  return `${sectionKey}-${index}-${identifier}`
}

function displayJson (value) {
  const seen = new WeakSet()

  return JSON.stringify(value, (key, item) => {
    if (typeof item === 'function') return `[Function ${item.name || 'anonymous'}]`

    if (
      item &&
      typeof item === 'object' &&
      typeof Element !== 'undefined' &&
      item instanceof Element
    ) {
      return `[${item.tagName.toLowerCase()} element]`
    }

    if (item && typeof item === 'object') {
      if (seen.has(item)) return '[Circular reference]'
      seen.add(item)
    }

    return item
  }, 2)
}

export default {
  name: 'SimulationContents',

  components: { ChevronDown, ChevronUp },

  setup () {
    const store = useStore()
    const expandedKeys = ref(new Set())

    const createItems = (sectionKey, values, options = {}) => {
      return values.map((value, index) => {
        return {
          key: itemKey(sectionKey, value, index),
          name: itemName(value, `${options.fallbackName ?? 'item'} ${index + 1}`),
          instanceCount: options.instanceCount?.(value) ?? null,
          value
        }
      })
    }

    const sections = computed(() => {
      const agentTypes = Object.entries(store.agentTypes)
        .filter(([name]) => name !== 'world')
        .map(([name, value], index) => ({
          key: itemKey('agent-types', value, index),
          name,
          instanceCount: store.agentItems[name]?.length ?? 0,
          value
        }))

      const definitions = [
        {
          key: 'agent-types',
          title: 'Agent Types',
          items: agentTypes
        },
        {
          key: 'actions',
          title: 'Actions',
          items: createItems('actions', store.actions, { fallbackName: 'action' })
        },
        {
          key: 'action-sequences',
          title: 'Action Sequences',
          items: createItems('action-sequences', store.actionSequences, {
            fallbackName: 'action sequence'
          })
        },
        {
          key: 'conditions',
          title: 'Conditions',
          items: createItems('conditions', store.conditions, { fallbackName: 'condition' })
        },
        {
          key: 'agent-properties',
          title: 'Initial Agent Properties',
          items: createItems('agent-properties', store.agentProperties, {
            fallbackName: 'property'
          })
        },
        {
          key: 'sprite-sheets',
          title: 'Sprite Sheets',
          items: createItems('sprite-sheets', store.spriteSheets, {
            fallbackName: 'sprite sheet'
          })
        },
        {
          key: 'animation-sets',
          title: 'Animation Sets',
          items: createItems('animation-sets', store.animationSets, {
            fallbackName: 'animation set'
          })
        },
        {
          key: 'property-changes',
          title: 'Property Changes',
          items: createItems('property-changes', store.propertyChanges ?? [], {
            fallbackName: 'property change'
          })
        },
        {
          key: 'sensors',
          title: 'Sensors',
          items: createItems('sensors', store.sensors, { fallbackName: 'sensor' })
        },
        {
          key: 'utility-functions',
          title: 'Utility Functions',
          items: createItems('utility-functions', store.agentUtilityFunctions, {
            fallbackName: 'utility function'
          })
        },
        {
          key: 'recurring-changes',
          title: 'Recurring Changes',
          items: createItems('recurring-changes', store.ungroupedRecurringChanges, {
            fallbackName: 'recurring change'
          })
        }
      ]

      return definitions.filter(section => section.items.length > 0)
    })

    const isExpanded = (key) => expandedKeys.value.has(key)

    const toggleExpanded = (key) => {
      const next = new Set(expandedKeys.value)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      expandedKeys.value = next
    }

    return {
      sections,
      isExpanded,
      toggleExpanded,
      formatDetails: displayJson
    }
  }
}
</script>

<style scoped>
.simulation-contents {
  box-sizing: border-box;
  width: 100%;
  padding: 18px 20px 40px;
  border-top: 1px solid var(--menu-divider);
  color: var(--menu-text);
}

.simulation-contents__heading {
  margin: 0 0 18px;
  color: var(--menu-accent);
  font-size: 1.25rem;
  font-weight: 600;
}

.simulation-contents__section {
  margin-bottom: 20px;
}

.simulation-contents__section-heading {
  margin: 0 0 8px;
  font-size: 1rem;
  font-weight: 600;
}

.simulation-contents__list {
  border: 1px solid var(--menu-border);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.35);
}

.simulation-contents__item + .simulation-contents__item {
  border-top: 1px solid var(--menu-border-light);
}

.simulation-contents__summary {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 3px 8px 3px 4px;
}

.simulation-contents__expand {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
  border: 1px solid transparent;
  background: transparent;
  color: var(--menu-text-subtle);
  cursor: pointer;
}

.simulation-contents__expand:hover {
  border-color: var(--menu-border-light);
  color: var(--menu-text-hover);
}

.simulation-contents__name {
  overflow-wrap: anywhere;
  font-family: var(--menu-font-mono);
  font-size: 0.85rem;
  font-weight: 600;
}

.simulation-contents__count {
  min-width: 2ch;
  padding: 2px 7px;
  border: 1px solid var(--menu-border-light);
  border-radius: 999px;
  background: var(--menu-surface);
  color: var(--menu-text-muted);
  font-family: var(--menu-font-mono);
  font-size: 0.8rem;
  text-align: center;
}

.simulation-contents__details {
  max-height: 320px;
  margin: 0;
  padding: 12px 14px;
  overflow: auto;
  border-top: 1px solid var(--menu-border-light);
  background: var(--menu-surface);
  color: var(--menu-text);
  font-family: var(--menu-font-mono);
  font-size: 0.75rem;
  line-height: 1.45;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.simulation-contents__empty {
  color: var(--menu-text-hint);
  font-size: 0.9rem;
}
</style>
