<template>
  <div class="container">
    <div class="">IF</div>
    <div class="subject-agent-selector">
      <select>
        <option>agent selector</option>
      </select>
      AGENT SELECTOR
    </div>
    <div class="subject-attribute-selector">
      <select>
        <option>attribute selector</option>
      </select>
      ATTRIBUTE SELECTOR
    </div>
    <div class="comparison">
      <select>
        <option>comparison</option>
      </select>
      COMPARISON
    </div>
    <div class="object-agent-selector">
      <select>
        <option>object agent selector</option>
      </select>
      AGENT SELECTOR
    </div>
    <div class="object-attribute-selector">
      <select>
        <option>object attribute selector</option>
      </select>
      ATTRIBUTE SELECTOR
    </div>
  </div>
</template>

<script>

export default {
  name: 'SelectorMockup',
  setup() {}
}

</script>

<style>

.container {
  display: flex;
  font-family: Arial, Helvetica, sans-serif;
}

</style>