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
        <option v-for="property in store.agentProperties" :value="property.name">{{ property.name }}</option>
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
import { useStore } from '../store/mainStore.js'
import api from '../apiCrud.js'


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

    const createCondition = async () => {
      const conditionType = itemForm.value.type
      const data = itemForm.value.forms[conditionType]

      let newCondition = {
        name: itemForm.value.name,
        comparison: data.comparison,
        conditionValue: Number(data.value),
        conditionType: itemForm.value.type
      }

      if (conditionType === 'property') {
        newCondition.property = data.property
      } else {
        newCondition.classMethod = data.preset
      }

      const createdItem = await api.createCondition(newCondition)
      newCondition.id = createdItem.id
      newCondition.agent = store.selectedAgent
      store.conditions.push(newCondition)

      await store.saveScene()

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