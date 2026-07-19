<template>
  <span v-if="node.type === 'value'" class="simulation-value__value">
    {{ node.value }}
  </span>

  <span v-else-if="node.type === 'empty'" class="simulation-value__empty">
    None
  </span>

  <dl v-else-if="node.type === 'object'" class="simulation-value__object">
    <div
      v-for="entry in node.entries"
      :key="entry.key"
      class="simulation-value__row"
    >
      <dt class="simulation-value__key">{{ entry.label }}</dt>
      <dd class="simulation-value__description">
        <SimulationContentsValue :node="entry.value" />
      </dd>
    </div>
  </dl>

  <ol v-else class="simulation-value__array">
    <li
      v-for="(item, index) in node.items"
      :key="index"
      class="simulation-value__array-item"
    >
      <span class="simulation-value__array-label">Item {{ index + 1 }}</span>
      <SimulationContentsValue :node="item" />
    </li>
  </ol>
</template>

<script>
export default {
  name: 'SimulationContentsValue',

  props: {
    node: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.simulation-value__object {
  margin: 0;
}

.simulation-value__row {
  display: grid;
  grid-template-columns: minmax(120px, 28%) minmax(0, 1fr);
  gap: 10px;
  padding: 4px 0;
}

.simulation-value__row + .simulation-value__row {
  border-top: 1px solid var(--menu-border-subtle);
}

.simulation-value__key,
.simulation-value__array-label {
  font-weight: 600;
}

.simulation-value__description {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
}

.simulation-value__description > .simulation-value__object,
.simulation-value__description > .simulation-value__array {
  margin-top: 2px;
  padding-left: 14px;
  border-left: 2px solid var(--menu-border-light);
}

.simulation-value__array {
  margin: 0;
  padding: 0;
  list-style: none;
}

.simulation-value__array-item {
  display: grid;
  grid-template-columns: minmax(70px, auto) minmax(0, 1fr);
  gap: 10px;
  padding: 4px 0;
}

.simulation-value__array-item + .simulation-value__array-item {
  border-top: 1px solid var(--menu-border-subtle);
}

.simulation-value__value {
  font-weight: 400;
}

.simulation-value__empty {
  color: var(--menu-text-subtle);
  font-style: italic;
  font-weight: 400;
}
</style>
