<template>
  <div v-if="isAdding === false" class="add-container">
    <button @click="isAdding = true">new condition</button>
  </div>
  <div v-else>
    <input v-model="itemForm.name" type="text" placeholder="name" />
    <br />
    <select v-model="itemForm.type">
      <option value="property">property</option>
      <option value="preset">preset</option>
    </select>
    <br />

    <div v-if="itemForm.type === 'property'">
      <select
        v-model="itemForm.forms.property.property"
        id="action-change-property-name"
      >
        <option value="">-- select property --</option>
        <option value="money">money</option>
      </select>
      <select v-model="itemForm.forms.property.comparison" value="isGreaterThan">
        <option value="">-- select comparison --</option>
        <option value="isGreaterThan">is greater than</option>
        <option value="isLessThan">is less than</option>
      </select>
      <input
        number="text"
        v-model="itemForm.forms.property.value"
        id="action-change-property-value"
        placeholder="conditions value"
      />
    </div>

    <div v-else-if="itemForm.type === 'preset'">
      <select
        v-model="itemForm.forms.preset.preset"
        id="action-change-property-name"
      >
        <option value="">-- select preset --</option>
        <option value="atDestination">at destination</option>
        <option value="actionIsComplete">is complete</option>
      </select>

      <select v-model="itemForm.forms.preset.comparison" value="isIdentical">
        <option value="">-- select comparison --</option>
        <option value="isIdentical">is</option>
      </select>

      <select v-model="itemForm.forms.preset.value">
        <option :value="true">true</option>
        <option :value="false">false</option>
      </select>

    </div>

    <button @click="createCondition">add</button> |
    <button @click="cancelAddCondition">cancel</button>
  </div>
</template>

<script>
import { ref } from 'vue'
import { createConditionObject, createPresetConditionObject } from '../classes/Condition.js'
import { useStore } from '../store/mainStore.js'


const DEFAULT_CONDITION_TYPE = 'property'


export default {
  name: 'ConditionCreateForm',
  setup: function () {
    const store = useStore()

    const isAdding = ref(false)

    const itemForm = ref({
      type: 'property',
      name: '',
      forms: {
        property: {
          property: '',
          comparison: '',
          value: 0
        },
        preset: {
          preset: '',
          comparison: '',
          value: true
        }
      }
    })

    const createCondition = () => {
      const conditionType = itemForm.value.type
      const conditionName = itemForm.value.name
      const data = itemForm.value.forms[conditionType]

      var newCondition

      if (conditionType === 'property') {

        console.log('creating condition')
        const conditionProperty = data.property
        const conditionComparison = data.comparison
        const conditionValue = data.value

        newCondition = createConditionObject(
          store.selectedAgent,
          conditionName,
          conditionProperty,
          conditionComparison,
          Number(conditionValue),
          store.conditions.length + 1  // id
        )
      } else {

        console.log('creating preset condition')
        const conditionPreset = data.preset
        const conditionComparison = data.comparison
        const conditionValue = data.value

        newCondition = createPresetConditionObject(
          store.selectedAgent,
          conditionName,
          conditionPreset,
          conditionComparison,
          conditionValue,
          store.conditions.length + 1  // id
        )
      }

      const payload = {...newCondition}
      delete payload.agent
      store.createCondition(payload)

      store.conditions.push(newCondition)
      resetConditionForms()
    }

    const resetConditionForms = () => {
      // reset common form data/settings
      itemForm.value.name = ''
      itemForm.value.type = DEFAULT_CONDITION_TYPE
      isAdding.value = false

      // reset specific settings (hard-coded keys for now)
      itemForm.value.forms.property.property = ''
      itemForm.value.forms.property.comparison = ''
      itemForm.value.forms.property.value = ''
      itemForm.value.forms.preset.preset = ''
      itemForm.value.forms.preset.comparison = ''
      itemForm.value.forms.preset.value = ''
    }

    const cancelAddCondition = () => {
      resetConditionForms()
    }

    return {
      store,
      isAdding,
      itemForm,
      createCondition,
      resetConditionForms,
      cancelAddCondition
    }
  }
}

</script>