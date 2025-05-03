<template>
  <nav>
    <div @click="showUi('selector')" :class="{ selected: showSelectorUi }">Selector</div>
    <div @click="showUi('condition')" :class="{ selected: showConditionUi }">Condition</div>
  </nav>
  <div v-show="showSelectorUi" class="selector-ui">
    <h2>Selector</h2>
    <SelectorMockup />
  </div>
  <div v-show="showConditionUi" class="condition-ui">
    <h2>Condition</h2>
    <ConditionMockup />
  </div>
</template>

<script>
import { ref } from 'vue'
import SelectorMockup from './SelectorMockup.vue'
import ConditionMockup from './ConditionMockup.vue'

export default {
  name: 'UiMockups',
  components: {
    SelectorMockup,
    ConditionMockup
  },
  setup() {

    const showSelectorUi = ref(true)
    const showConditionUi = ref(false)


    const showUi = (mockup) => {
      if (mockup === 'selector') {
        showSelectorUi.value = true
        showConditionUi.value = false
      }
      else if (mockup === 'condition') {
        showSelectorUi.value = false
        showConditionUi.value = true
      }
    }
    return {
      showUi,
      showSelectorUi,
      showConditionUi,
      SelectorMockup,
      ConditionMockup
    }
  }
}

</script>

<style scoped>

nav {
  display: flex;
  width: 100%;
  border-bottom: 1px solid grey;
}

nav div {
  cursor: pointer;
  margin: 5px;
  color: grey;
}

nav div.selected {
  color: black;
}

</style>