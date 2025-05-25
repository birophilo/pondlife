<template>
  <nav>
    <div @click="showUi('selector')" :class="{ selected: showSelectorUi }">Selector</div>
    <div @click="showUi('condition')" :class="{ selected: showConditionUi }">Condition</div>
    <div @click="showUi('behaviorTree')" :class="{ selected: showBehaviorTreeUi }">Behavior Tree</div>
    <div @click="showUi('utility')" :class="{ selected: showUtilityTestUi }">Utility</div>
  </nav>
  <div v-show="showSelectorUi" class="selector-ui">
    <h2>Selector</h2>
    <SelectorMockup />
  </div>
  <div v-show="showConditionUi" class="condition-ui">
    <h2>Condition</h2>
    <ConditionMockup />
  </div>
  <div v-show="showBehaviorTreeUi" class="behavior-tree-ui">
    <h2>Behavior Tree</h2>
    <BehaviorTreeMockup />
  </div>
  <div v-show="showUtilityTestUi" class="utility-test-ui">
    <h2>Utility</h2>
    <UtilityTest />
  </div>
</template>

<script>
import { ref } from 'vue'
import SelectorMockup from './SelectorMockup.vue'
import ConditionMockup from './ConditionMockup.vue'
import BehaviorTreeMockup from './BehaviorTreeMockup.vue'
import UtilityTest from './UtilityTest.vue'

export default {
  name: 'UiMockups',
  components: {
    SelectorMockup,
    ConditionMockup,
    BehaviorTreeMockup,
    UtilityTest
  },
  setup() {

    const showSelectorUi = ref(false)
    const showConditionUi = ref(false)
    const showBehaviorTreeUi = ref(false)
    const showUtilityTestUi = ref(true)

    const showUi = (mockup) => {
      if (mockup === 'selector') {
        showSelectorUi.value = true
        showConditionUi.value = false
        showBehaviorTreeUi.value = false
        showUtilityTestUi.value = false
      }
      else if (mockup === 'condition') {
        showSelectorUi.value = false
        showConditionUi.value = true
        showBehaviorTreeUi.value = false
        showUtilityTestUi.value = false
      } else if (mockup === 'behaviorTree') {
        showSelectorUi.value = false
        showConditionUi.value = false
        showBehaviorTreeUi.value = true
        showUtilityTestUi.value = false
      } else if (mockup === 'utility') {
        showSelectorUi.value = false
        showConditionUi.value = false
        showBehaviorTreeUi.value = false
        showUtilityTestUi.value = true
      }
    }
    return {
      showUi,
      showSelectorUi,
      showConditionUi,
      showBehaviorTreeUi,
      showUtilityTestUi,
      // SelectorMockup,
      // ConditionMockup
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