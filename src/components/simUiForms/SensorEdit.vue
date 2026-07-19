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
        <button type="button" class="menu-btn" @click="saveItem">
          save
        </button>
        <button type="button" class="menu-btn" @click="cancelEdit">
          cancel
        </button>
      </div>
    </div>

    <div v-else class="menu-form-item-view">
      <div class="menu-form-item-actions">
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
      <table class="menu-form-table">
        <tr>
          <td class="menu-form-label-cell menu-body-small">name</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ sensor.name }}</td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">type</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ sensor.type }}</td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">radius</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ sensor.radius }}</td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">sample interval</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ sensor.sampleInterval }}</td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">range type</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ sensor.rangeType }}</td>
        </tr>
      </table>
    </div>

    <ConfirmSimDeleteModal
      :open="deleteConfirmOpen"
      entity-type-label="sensor"
      :entity-name="sensor.name || '—'"
      :deleting="deleteInProgress"
      @close="closeDeleteConfirm"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script>
import { ref } from 'vue'
import { Pencil, Trash2 } from '@lucide/vue'
import { useStore } from '@/store/mainStore.js'
import api from '@/apiCrud.js'
import ConfirmSimDeleteModal from '@/components/ConfirmSimDeleteModal.vue'

export default {
  name: 'SensorEdit',

  components: { Pencil, Trash2, ConfirmSimDeleteModal },

  props: {
    sensor: Object,
    i: Number
  },

  setup (props) {
    const store = useStore()

    const isEditing = ref(false)
    const itemForm = ref({})
    const deleteConfirmOpen = ref(false)
    const deleteInProgress = ref(false)

    const populateItemForm = () => {
      itemForm.value = { ...props.sensor }
    }

    const saveItem = () => {
      isEditing.value = false
      api.updateSensor(itemForm.value)
      const keys = Object.keys(props.sensor)
      keys.forEach((key) => {
        store.sensors[props.i][key] = itemForm.value[key]
      })
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
        await api.deleteSensor(props.sensor.id)
        store.sensors.splice(props.i, 1)
        await store.saveScene()
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
      isEditing,
      itemForm,
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
