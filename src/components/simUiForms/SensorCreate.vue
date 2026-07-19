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
          <td class="menu-form-label-cell menu-body-small">type</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <input
              v-model="itemForm.type"
              type="text"
              class="menu-input menu-input--field"
            />
          </td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">radius</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <input
              v-model="itemForm.radius"
              type="number"
              class="menu-input menu-input--field"
            />
          </td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">sample interval</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <input
              v-model="itemForm.sampleInterval"
              type="number"
              class="menu-input menu-input--field"
            />
          </td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">range type</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <input
              v-model="itemForm.rangeType"
              type="text"
              class="menu-input menu-input--field"
            />
          </td>
        </tr>
      </table>

      <div class="menu-form-actions">
        <MenuConfirmBtn label="Create sensor" @click="createSensor" />
        <MenuCancelBtn @click="cancelCreate" />
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
import MenuConfirmBtn from '@/components/simUi/MenuConfirmBtn.vue'
import MenuCancelBtn from '@/components/simUi/MenuCancelBtn.vue'

const DEFAULT_FORM = {
  name: '',
  type: 'spatial',
  rangeType: 'circle',
  radius: 100,
  sampleInterval: 1
}

export default {
  name: 'SensorCreate',

  components: { MenuNewBtn, MenuConfirmBtn, MenuCancelBtn },

  setup () {
    const store = useStore()
    const isAdding = ref(false)
    const itemForm = ref({ ...DEFAULT_FORM })

    const createSensor = async () => {
      const newSensor = { ...itemForm.value }
      const createdItem = await api.createSensor(newSensor)
      newSensor.id = createdItem.id
      store.sensors.push(newSensor)
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
      createSensor,
      cancelCreate
    }
  }
}
</script>
