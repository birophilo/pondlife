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
          <td class="menu-form-label-cell menu-body-small">src</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <span class="menu-body-small">{{ itemForm.src || '—' }}</span>
            <input type="file" @change="uploadFile" />
          </td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">rows</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <input
              v-model="itemForm.rows"
              type="number"
              class="menu-input menu-input--field"
            />
          </td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">columns</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <input
              v-model="itemForm.columns"
              type="number"
              class="menu-input menu-input--field"
            />
          </td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">num images</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <input
              v-model="itemForm.numImages"
              type="number"
              class="menu-input menu-input--field"
            />
          </td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">refresh interval</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <input
              v-model="itemForm.refreshInterval"
              type="number"
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
          <td class="menu-form-value-cell menu-body-small-strong">{{ spriteSheet.name }}</td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">src</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ spriteSheet.src }}</td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">rows</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ spriteSheet.rows }}</td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">columns</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ spriteSheet.columns }}</td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">num images</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ spriteSheet.numImages }}</td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">refresh interval</td>
          <td class="menu-form-value-cell menu-body-small-strong">{{ spriteSheet.refreshInterval }}</td>
        </tr>
      </table>
    </div>

    <ConfirmSimDeleteModal
      :open="deleteConfirmOpen"
      entity-type-label="sprite sheet"
      :entity-name="spriteSheet.name || '—'"
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
  name: 'SpriteSheetEdit',

  components: { Pencil, Trash2, ConfirmSimDeleteModal },

  props: {
    spriteSheet: Object,
    i: Number
  },

  setup (props) {
    const store = useStore()

    const isEditing = ref(false)
    const itemForm = ref({})
    const deleteConfirmOpen = ref(false)
    const deleteInProgress = ref(false)

    const populateItemForm = () => {
      itemForm.value = { ...props.spriteSheet }
    }

    const saveItem = () => {
      isEditing.value = false
      const keys = Object.keys(props.spriteSheet)
      api.updateSpriteSheet(itemForm.value)
      keys.forEach((key) => {
        store.spriteSheets[props.i][key] = itemForm.value[key]
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
        await api.deleteSpriteSheet(props.spriteSheet.id)
        store.spriteSheets.splice(props.i, 1)
        await store.saveScene()
        deleteConfirmOpen.value = false
      } finally {
        deleteInProgress.value = false
      }
    }

    const uploadFile = async (event) => {
      const imageFile = event.target.files[0]
      const formData = new FormData()
      formData.append('resource', 'spritesheet')
      formData.append('imageType', 'spritesheet')
      formData.append('file', imageFile)

      const createdResponse = await api.uploadFile(formData)
      itemForm.value.src = createdResponse.filename
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
      uploadFile,
      editItem,
      cancelEdit
    }
  }
}
</script>
