<template>
  <div>
    <div v-if="isAdding">
      <table class="menu-form-table">
        <tr>
          <td class="menu-form-label-cell menu-body-small">name</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <input
              v-model="itemForm.name"
              type="text"
              class="menu-input menu-input--field"
            />
          </td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">condition type</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <select v-model="itemForm.type" class="menu-input menu-input--field">
              <option value="property">property</option>
              <option value="preset">preset</option>
              <option value="vicinity">vicinity</option>
            </select>
          </td>
        </tr>

        <template v-if="itemForm.type === 'property'">
          <tr>
            <td class="menu-form-label-cell menu-body-small">property</td>
            <td class="menu-form-value-cell menu-body-small-strong">
              <select
                id="condition-create-property"
                v-model="itemForm.forms.property.property"
                class="menu-input menu-input--field"
              >
                <option value="">-- select property --</option>
                <option
                  v-for="property in store.agentProperties"
                  :key="property.name"
                  :value="property.name"
                >
                  {{ property.name }}
                </option>
              </select>
            </td>
          </tr>
          <tr>
            <td class="menu-form-label-cell menu-body-small">comparison</td>
            <td class="menu-form-value-cell menu-body-small-strong">
              <select
                v-model="itemForm.forms.property.comparison"
                class="menu-input menu-input--field"
              >
                <option value="">-- select comparison --</option>
                <option value="isGreaterThan">is greater than</option>
                <option value="isLessThan">is less than</option>
              </select>
            </td>
          </tr>
          <tr>
            <td class="menu-form-label-cell menu-body-small">value</td>
            <td class="menu-form-value-cell menu-body-small-strong">
              <input
                id="condition-create-property-value"
                v-model="itemForm.forms.property.value"
                type="number"
                class="menu-input menu-input--field"
              />
            </td>
          </tr>
        </template>

        <template v-else-if="itemForm.type === 'preset'">
          <tr>
            <td class="menu-form-label-cell menu-body-small">preset</td>
            <td class="menu-form-value-cell menu-body-small-strong">
              <select
                v-model="itemForm.forms.preset.preset"
                class="menu-input menu-input--field"
              >
                <option value="">-- select preset --</option>
                <option value="atDestination">at destination</option>
                <option value="actionIsComplete">is complete</option>
              </select>
            </td>
          </tr>
          <tr>
            <td class="menu-form-label-cell menu-body-small">comparison</td>
            <td class="menu-form-value-cell menu-body-small-strong">
              <select
                v-model="itemForm.forms.preset.comparison"
                class="menu-input menu-input--field"
              >
                <option value="">-- select comparison --</option>
                <option value="isIdentical">is</option>
              </select>
            </td>
          </tr>
          <tr>
            <td class="menu-form-label-cell menu-body-small">value</td>
            <td class="menu-form-value-cell menu-body-small-strong">
              <select
                v-model="itemForm.forms.preset.value"
                class="menu-input menu-input--field"
              >
                <option :value="true">true</option>
                <option :value="false">false</option>
              </select>
            </td>
          </tr>
        </template>

        <template v-else-if="itemForm.type === 'vicinity'">
          <tr>
            <td class="menu-form-label-cell menu-body-small">agent type</td>
            <td class="menu-form-value-cell menu-body-small-strong">
              <select
                v-model="itemForm.forms.vicinity.agentType"
                class="menu-input menu-input--field"
              >
                <option :value="null">-- select agent type --</option>
                <option
                  v-for="[agentTypeName, agentType] of Object.entries(store.agentTypes)"
                  :key="agentTypeName"
                  :value="agentType"
                >
                  {{ agentTypeName }}
                </option>
              </select>
            </td>
          </tr>
          <tr>
            <td class="menu-form-label-cell menu-body-small">comparison</td>
            <td class="menu-form-value-cell menu-body-small-strong">
              <select
                v-model="itemForm.forms.vicinity.comparison"
                class="menu-input menu-input--field"
              >
                <option value="">-- select comparison --</option>
                <option value="isGreaterThan">is greater than</option>
                <option value="isLessThan">is less than</option>
              </select>
            </td>
          </tr>
          <tr>
            <td class="menu-form-label-cell menu-body-small">agent count</td>
            <td class="menu-form-value-cell menu-body-small-strong">
              <input
                v-model="itemForm.forms.vicinity.value"
                type="number"
                class="menu-input menu-input--field"
              />
            </td>
          </tr>
          <tr>
            <td class="menu-form-label-cell menu-body-small">property filter</td>
            <td class="menu-form-value-cell menu-body-small-strong">
              <label class="menu-checkbox-row">
                <input v-model="usingVicinityPropertyValue" type="checkbox" />
                use property value
              </label>
            </td>
          </tr>
          <template v-if="usingVicinityPropertyValue">
            <tr>
              <td class="menu-form-label-cell menu-body-small">property</td>
              <td class="menu-form-value-cell menu-body-small-strong">
                <select
                  v-model="itemForm.forms.vicinity.property"
                  class="menu-input menu-input--field"
                  :disabled="itemForm.forms.vicinity.agentType === null"
                >
                  <option :value="null">-- select agent property --</option>
                  <option
                    v-for="property in vicinityAgentProperties"
                    :key="property"
                    :value="property"
                  >
                    {{ property }}
                  </option>
                </select>
              </td>
            </tr>
            <tr>
              <td class="menu-form-label-cell menu-body-small">property value</td>
              <td class="menu-form-value-cell menu-body-small-strong">
                <input
                  v-model="itemForm.forms.vicinity.propertyValue"
                  type="text"
                  class="menu-input menu-input--field"
                />
              </td>
            </tr>
          </template>
        </template>
      </table>

      <div class="menu-form-actions">
        <MenuConfirmBtn label="Create condition" @click="createCondition" />
        <MenuCancelBtn @click="cancelAddCondition" />
      </div>
    </div>

    <MenuNewBtn v-else @click="isAdding = true" />
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useStore } from '@/store/mainStore.js'
import api from '@/apiCrud.js'
import MenuNewBtn from '@/components/simUi/MenuNewBtn.vue'
import MenuConfirmBtn from '@/components/simUi/MenuConfirmBtn.vue'
import MenuCancelBtn from '@/components/simUi/MenuCancelBtn.vue'

const DEFAULT_CONDITION_TYPE = 'property'


export default {
  name: 'ConditionCreate',
  components: { MenuNewBtn, MenuConfirmBtn, MenuCancelBtn },
  setup: function () {
    const store = useStore()

    const isAdding = ref(false)

    const usingVicinityPropertyValue = ref(false)

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
        },
        vicinity: {
          agentType: null,
          comparison: '',
          value: 0,  // agent count only for now
          property: '',
          propertyValue: ''  // e.g. 'red' - string only for now
        }
      }
    })

    const vicinityAgentProperties = computed(() => {
      const properties = itemForm.value.forms.vicinity.agentType?.properties
      return Array.isArray(properties) ? properties : []
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
      } else if (conditionType === 'preset') {
        newCondition.classMethod = data.preset
      } else if (conditionType === 'vicinity') {
        newCondition.agentType = data.agentType.id
        newCondition.property = data.property
        newCondition.propertyValue = data.propertyValue
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
      itemForm.value.forms.vicinity.agentType = null
      itemForm.value.forms.vicinity.comparison = ''
      itemForm.value.forms.vicinity.property = ''
      itemForm.value.forms.vicinity.propertyValue = 0
      itemForm.value.forms.vicinity.count = 0
      usingVicinityPropertyValue.value = false
    }

    const cancelAddCondition = () => {
      resetConditionForms()
    }

    return {
      store,
      isAdding,
      usingVicinityPropertyValue,
      vicinityAgentProperties,
      itemForm,
      createCondition,
      resetConditionForms,
      cancelAddCondition
    }
  }
}

</script>