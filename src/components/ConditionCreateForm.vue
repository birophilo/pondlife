<template>
  <!-- CREATE CONDITION -->

  <div v-if="conditionForm.adding === false" class="add-container">
    <button @click="conditionForm.adding = true">new condition</button>
  </div>
  <div v-else>
    <input v-model="conditionForm.name" type="text" placeholder="name" />
    <br />
    <select v-model="conditionForm.type">
      <option value="property">property</option>
      <option value="preset">preset</option>
    </select>
    <br />

    <div v-if="conditionForm.type === 'property'">
      <select
        v-model="conditionForm.forms.property.property"
        id="action-change-property-name"
      >
        <option value="">-- select property --</option>
        <option value="money">money</option>
      </select>
      <select v-model="conditionForm.forms.property.comparison" value="isGreaterThan">
        <option value="">-- select comparison --</option>
        <option value="isGreaterThan">is greater than</option>
        <option value="isLessThan">is less than</option>
      </select>
      <input
        number="text"
        v-model="conditionForm.forms.property.value"
        id="action-change-property-value"
        placeholder="conditions value"
      />
    </div>

    <div v-else-if="conditionForm.type === 'preset'">
      <select
        v-model="conditionForm.forms.preset.preset"
        id="action-change-property-name"
      >
        <option value="">-- select preset --</option>
        <option value="atDestination">at destination</option>
        <option value="actionIsComplete">is complete</option>
      </select>

      <select v-model="conditionForm.forms.preset.comparison" value="isIdentical">
        <option value="">-- select comparison --</option>
        <option value="isIdentical">is</option>
      </select>

      <select v-model="conditionForm.forms.preset.value">
        <option :value="true">true</option>
        <option :value="false">false</option>
      </select>

    </div>

    <button @click="createCondition">add</button> |
    <button @click="cancelAddCondition">cancel</button>
  </div>
</template>

<script>
import { Condition, PresetCondition } from '../classes/Condition.js'
import { useStore } from '../store/mainStore.js'


const DEFAULT_CONDITION_TYPE = 'property'


export default {
  name: 'ConditionCreateForm',
  setup: function () {
    const store = useStore()
    return { store }
  },
  data: function () {
    return {
      conditionForm: {
        adding: false,
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
      }
    }
  },
  methods: {
    createCondition: function () {
      const conditionType = this.conditionForm.type
      const conditionName = this.conditionForm.name
      const data = this.conditionForm.forms[conditionType]

      var newCondition

      if (conditionType === 'property') {

        console.log('creating condition')
        const conditionProperty = data.property
        const conditionComparison = data.comparison
        const conditionValue = data.value

        newCondition = new Condition(
          this.store.selectedAgent,
          conditionName,
          conditionProperty,
          conditionComparison,
          Number(conditionValue),
          this.store.conditions.length + 1  // id
        )
      } else {

        console.log('creating preset condition')
        const conditionPreset = data.preset
        const conditionComparison = data.comparison
        const conditionValue = data.value

        newCondition = new PresetCondition(
          this.store.selectedAgent,
          conditionName,
          conditionPreset,
          conditionComparison,
          conditionValue,
          this.store.conditions.length + 1  // id
        )
      }
      this.store.conditions.push(newCondition)
      this.resetConditionForms()
    },
    resetConditionForms: function () {
      // reset common form data/settings
      this.conditionForm.name = ''
      this.conditionForm.type = DEFAULT_CONDITION_TYPE
      this.conditionForm.adding = false

      // reset specific settings (hard-coded keys for now)
      this.conditionForm.forms.property.property = ''
      this.conditionForm.forms.property.comparison = ''
      this.conditionForm.forms.property.value = ''
      this.conditionForm.forms.preset.preset = ''
      this.conditionForm.forms.preset.comparison = ''
      this.conditionForm.forms.preset.value = ''
    },
    cancelAddCondition: function () {
      this.resetConditionForms()
    }
  }
}

</script>