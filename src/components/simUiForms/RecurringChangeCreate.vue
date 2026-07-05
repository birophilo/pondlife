<template>
  <div>
    <div v-if="isAdding">
      <table class="menu-form-table">
        <tr>
          <td class="menu-form-label-cell menu-body-small">agent type</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <select v-model="itemForm.agentType" class="menu-input menu-input--field">
              <option value="null">--- select agent type ---</option>
              <option
                v-for="agentType in Object.keys(store.agentTypes)"
                :key="agentType"
                :value="agentType"
              >
                {{ agentType }}
              </option>
            </select>
          </td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">property</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <select v-model="itemForm.property" class="menu-input menu-input--field">
              <option value="null">--- select property ---</option>
              <option
                v-for="prop in store.agentProperties"
                :key="prop.name"
                :value="prop.name"
              >
                {{ prop.name }}
              </option>
            </select>
          </td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">frame interval</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <input
              v-model="itemForm.frameInterval"
              type="number"
              min="1"
              class="menu-input menu-input--field"
            />
          </td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">change value</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <input
              v-model="itemForm.change"
              type="number"
              step="0.1"
              class="menu-input menu-input--field"
            />
          </td>
        </tr>
      </table>

      <div class="menu-form-actions">
        <button type="button" class="menu-btn" @click="createRecurringChange">
          create
        </button>
        <button type="button" class="menu-btn" @click="cancelCreate">
          cancel
        </button>
      </div>
    </div>

    <MenuNewBtn v-else @click="isAdding = true" />
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from '@/store/mainStore.js'
import api from '@/apiCrud.js'
import MenuNewBtn from '@/components/simUi/MenuNewBtn.vue'

const DEFAULT_FORM = {
  agentType: null,
  property: null,
  frameInterval: 60,
  change: 1
}

export default {
  name: 'RecurringChangeCreate',

  components: { MenuNewBtn },

  setup () {
    const store = useStore()
    const isAdding = ref(false)
    const itemForm = ref({ ...DEFAULT_FORM })

    const createRecurringChange = async () => {
      const newRecurringChange = {
        agentType: itemForm.value.agentType,
        property: itemForm.value.property,
        frameInterval: parseInt(itemForm.value.frameInterval),
        change: parseFloat(itemForm.value.change)
      }

      const createdItem = await api.createRecurringChange(newRecurringChange)
      newRecurringChange.id = createdItem.id
      store.ungroupedRecurringChanges.push(newRecurringChange)
      store.groupRecurringChanges()

      await store.saveScene()

      isAdding.value = false
      itemForm.value = { ...DEFAULT_FORM }
    }

    const cancelCreate = () => {
      isAdding.value = false
      itemForm.value = { ...DEFAULT_FORM }
    }

    return {
      store,
      isAdding,
      itemForm,
      createRecurringChange,
      cancelCreate
    }
  }
}
</script>
