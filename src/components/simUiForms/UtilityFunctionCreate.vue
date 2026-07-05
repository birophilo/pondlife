<template>
  <div>
    <div v-if="isAdding">
      <table class="menu-form-table">
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
          <td class="menu-form-label-cell menu-body-small">function</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <select v-model="itemForm.func" class="menu-input menu-input--field">
              <option value="null">--- select function ---</option>
              <option
                v-for="func in Object.keys(UTILITY_FUNCS)"
                :key="func"
                :value="func"
              >
                {{ func }}
              </option>
            </select>
          </td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">action</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <select v-model="itemForm.actionId" class="menu-input menu-input--field">
              <option value="null">--- select action ---</option>
              <option
                v-for="action in store.actions"
                :key="action.id"
                :value="action.id"
              >
                {{ action.actionName }}
              </option>
              <option
                v-for="actionSequence in store.actionSequences"
                :key="actionSequence.id"
                :value="actionSequence.id"
              >
                {{ actionSequence.name }}
              </option>
            </select>
          </td>
        </tr>
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
      </table>

      <div class="menu-form-actions">
        <button type="button" class="menu-btn" @click="createUtilityFunction">
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
import UTILITY_FUNCS from '@/UTILITY_FUNCS.js'
import MenuNewBtn from '@/components/simUi/MenuNewBtn.vue'

const DEFAULT_FORM = {
  property: null,
  actionId: null,
  func: null,
  agentType: null
}

export default {
  name: 'UtilityFunctionCreate',

  components: { MenuNewBtn },

  setup () {
    const store = useStore()
    const isAdding = ref(false)
    const itemForm = ref({ ...DEFAULT_FORM })

    const createUtilityFunction = async () => {
      const newUtilityFunction = {
        property: itemForm.value.property,
        actionId: itemForm.value.actionId,
        func: itemForm.value.func,
        agentType: itemForm.value.agentType
      }

      const sequenceIds = store.actionSequences.map((as) => as.id)
      if (sequenceIds.includes(itemForm.value.actionId)) {
        newUtilityFunction.actionObjectType = 'actionSequence'
      } else {
        newUtilityFunction.actionObjectType = 'action'
      }

      const createdItem = await api.createUtilityFunction(newUtilityFunction)
      newUtilityFunction.id = createdItem.id
      store.agentUtilityFunctions.push(newUtilityFunction)

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
      createUtilityFunction,
      cancelCreate,
      UTILITY_FUNCS
    }
  }
}
</script>
