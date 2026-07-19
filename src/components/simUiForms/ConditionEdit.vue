<template>
  <div>
    <div v-if="isEditing">
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
            <select
              v-model="itemForm.conditionType"
              class="menu-input menu-input--field"
            >
              <option value="property">property</option>
              <option value="preset">preset</option>
              <option value="vicinity">vicinity</option>
            </select>
          </td>
        </tr>

        <template v-if="itemForm.conditionType === 'property'">
          <tr>
            <td class="menu-form-label-cell menu-body-small">property</td>
            <td class="menu-form-value-cell menu-body-small-strong">
              <select v-model="itemForm.property" class="menu-input menu-input--field">
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
              <select v-model="itemForm.comparison" class="menu-input menu-input--field">
                <option value="isGreaterThan">is greater than</option>
                <option value="isLessThan">is less than</option>
              </select>
            </td>
          </tr>
          <tr>
            <td class="menu-form-label-cell menu-body-small">value</td>
            <td class="menu-form-value-cell menu-body-small-strong">
              <input
                v-model="itemForm.conditionValue"
                type="number"
                class="menu-input menu-input--field"
              />
            </td>
          </tr>
        </template>

        <template v-else-if="itemForm.conditionType === 'preset'">
          <tr>
            <td class="menu-form-label-cell menu-body-small">preset</td>
            <td class="menu-form-value-cell menu-body-small-strong">
              <select v-model="itemForm.classMethod" class="menu-input menu-input--field">
                <option value="atDestination">at destination</option>
                <option value="actionIsComplete">is complete</option>
              </select>
            </td>
          </tr>
          <tr>
            <td class="menu-form-label-cell menu-body-small">comparison</td>
            <td class="menu-form-value-cell menu-body-small-strong">
              <select v-model="itemForm.comparison" class="menu-input menu-input--field">
                <option value="isIdentical">is</option>
              </select>
            </td>
          </tr>
          <tr>
            <td class="menu-form-label-cell menu-body-small">value</td>
            <td class="menu-form-value-cell menu-body-small-strong">
              <select
                v-model="itemForm.conditionValue"
                class="menu-input menu-input--field"
              >
                <option :value="true">true</option>
                <option :value="false">false</option>
              </select>
            </td>
          </tr>
        </template>

        <template v-else-if="itemForm.conditionType === 'vicinity'">
          <tr>
            <td class="menu-form-label-cell menu-body-small">agent type</td>
            <td class="menu-form-value-cell menu-body-small-strong">
              <select v-model="itemForm.agentType" class="menu-input menu-input--field">
                <option :value="null">-- select agent type --</option>
                <option
                  v-for="[agentTypeName, agentType] of Object.entries(store.agentTypes)"
                  :key="agentTypeName"
                  :value="agentType.id"
                >
                  {{ agentTypeName }}
                </option>
              </select>
            </td>
          </tr>
          <tr>
            <td class="menu-form-label-cell menu-body-small">comparison</td>
            <td class="menu-form-value-cell menu-body-small-strong">
              <select v-model="itemForm.comparison" class="menu-input menu-input--field">
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
                v-model="itemForm.conditionValue"
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
                  v-model="itemForm.property"
                  class="menu-input menu-input--field"
                  :disabled="itemForm.agentType === null"
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
                  v-model="itemForm.propertyValue"
                  type="text"
                  class="menu-input menu-input--field"
                />
              </td>
            </tr>
          </template>
        </template>
      </table>

      <div class="menu-form-actions">
        <button type="button" class="menu-btn" @click="saveItem">
          save
        </button>
        <button type="button" class="menu-btn" @click="cancelEdit">
          cancel
        </button>
      </div>
    </div>

    <div v-else class="menu-form-item-view">
      <div class="menu-form-item-summary">
        <span class="menu-body-small-strong">{{ item.name }}</span>
        <div class="menu-form-item-actions">
          <button
            type="button"
            class="menu-icon-btn"
            :aria-label="detailsExpanded ? 'Hide condition details' : 'Show condition details'"
            :aria-expanded="detailsExpanded"
            :aria-controls="`condition-details-${item.id || index}`"
            @click="detailsExpanded = !detailsExpanded"
          >
            <ChevronUp v-if="detailsExpanded" :size="16" aria-hidden="true" />
            <ChevronDown v-else :size="16" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="menu-icon-btn"
            aria-label="Edit"
            @click="editItem"
          >
            <Pencil :size="16" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="menu-icon-btn menu-icon-btn--danger"
            aria-label="Delete"
            @click="deleteItem"
          >
            <Trash2 :size="16" aria-hidden="true" />
          </button>
        </div>
      </div>
      <table
        v-show="detailsExpanded"
        :id="`condition-details-${item.id || index}`"
        class="menu-form-table menu-form-table--details"
      >
        <tr>
          <td class="menu-form-label-cell menu-body-small">condition type</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ item.conditionType }}</td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">{{ subjectLabel }}</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ subjectValue }}</td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">comparison</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ comparisonLabel(item.comparison) }}</td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">{{ valueLabel }}</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ item.conditionValue }}</td>
        </tr>
        <tr v-if="item.conditionType === 'vicinity' && item.property">
          <td class="menu-form-label-cell menu-body-small">property filter</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            {{ item.property }}: {{ item.propertyValue }}
          </td>
        </tr>
      </table>
    </div>

    <ConfirmSimDeleteModal
      :open="deleteConfirmOpen"
      entity-type-label="condition"
      :entity-name="item.name || '—'"
      :deleting="deleteInProgress"
      @close="closeDeleteConfirm"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { ChevronDown, ChevronUp, Pencil, Trash2 } from '@lucide/vue'
import { useStore } from '@/store/mainStore.js'
import api from '@/apiCrud.js'
import ConfirmSimDeleteModal from '@/components/ConfirmSimDeleteModal.vue'

export default {
  name: 'ConditionEdit',
  components: { ChevronDown, ChevronUp, Pencil, Trash2, ConfirmSimDeleteModal },
  props: {
    item: Object,
    index: Number
  },
  setup: function (props) {
    const store = useStore()

    const itemForm = ref({})
    const isEditing = ref(false)
    const detailsExpanded = ref(false)
    const usingVicinityPropertyValue = ref(false)
    const deleteConfirmOpen = ref(false)
    const deleteInProgress = ref(false)

    const selectedVicinityAgentType = computed(() => {
      return Object.values(store.agentTypes).find((agentType) => {
        return agentType.id === itemForm.value.agentType
      })
    })

    const vicinityAgentProperties = computed(() => {
      const properties = selectedVicinityAgentType.value?.properties
      return Array.isArray(properties) ? properties : []
    })

    const agentTypeLabel = (agentTypeId) => {
      const entry = Object.entries(store.agentTypes).find(([, agentType]) => {
        return agentType.id === agentTypeId
      })
      return entry?.[0] ?? agentTypeId ?? '—'
    }

    const subjectLabel = computed(() => {
      if (props.item.conditionType === 'preset') return 'preset'
      if (props.item.conditionType === 'vicinity') return 'agent type'
      return 'property'
    })

    const subjectValue = computed(() => {
      if (props.item.conditionType === 'preset') return props.item.classMethod || '—'
      if (props.item.conditionType === 'vicinity') return agentTypeLabel(props.item.agentType)
      return props.item.property || '—'
    })

    const valueLabel = computed(() => {
      return props.item.conditionType === 'vicinity' ? 'agent count' : 'value'
    })

    const comparisonLabel = (comparison) => {
      const labels = {
        isGreaterThan: 'is greater than',
        isLessThan: 'is less than',
        isIdentical: 'is'
      }
      return labels[comparison] ?? comparison ?? '—'
    }

    const populateItemForm = () => {
      itemForm.value = {...props.item}
      usingVicinityPropertyValue.value = (
        props.item.conditionType === 'vicinity' && Boolean(props.item.property)
      )
    }

    const saveItem = () => {
      isEditing.value = false
      api.updateCondition(itemForm.value)
      // const keys = Object.keys(itemForm.value)
      store.conditions.splice(props.index, 1, {
        ...store.conditions[props.index],
        ...itemForm.value
      })
      // keys.forEach(key => store.conditions[props.index][key] = itemForm.value[key])
    }

    const deleteItem = () => {
      deleteConfirmOpen.value = true
    }

    const closeDeleteConfirm = () => {
      deleteConfirmOpen.value = false
    }

    const confirmDelete = async () => {
      if (deleteInProgress.value) return
      deleteInProgress.value = true
      try {
        await api.deleteCondition(props.item.id)
        store.conditions.splice(props.index, 1)
        deleteConfirmOpen.value = false
      } finally {
        deleteInProgress.value = false
      }
    }

    const editItem = () => {
      populateItemForm()
      isEditing.value = true
    }

    const cancelEdit = () => {
      isEditing.value = false
      itemForm.value = {}
    }

    return {
      store,
      itemForm,
      isEditing,
      detailsExpanded,
      usingVicinityPropertyValue,
      vicinityAgentProperties,
      subjectLabel,
      subjectValue,
      valueLabel,
      comparisonLabel,
      populateItemForm,
      saveItem,
      deleteItem,
      closeDeleteConfirm,
      confirmDelete,
      deleteConfirmOpen,
      deleteInProgress,
      editItem,
      cancelEdit
    }
  }
}
</script>