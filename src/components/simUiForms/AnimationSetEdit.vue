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
          <td class="menu-form-label-cell menu-body-small">scale</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <input
              v-model="itemForm.scale"
              type="number"
              class="menu-input menu-input--field"
            />
          </td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">offset X</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <input
              v-model="itemForm.offset.x"
              type="number"
              class="menu-input menu-input--field"
            />
          </td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">offset Y</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <input
              v-model="itemForm.offset.y"
              type="number"
              class="menu-input menu-input--field"
            />
          </td>
        </tr>
      </table>

      <h3 class="menu-panel__subheading">Directional sprite sheets</h3>
      <table class="menu-table">
        <tr v-for="(row, rowIndex) in store.directionList" :key="rowIndex">
          <td v-for="directionName in row" :key="directionName">
            <select
              v-model="itemForm.sheets[directionName]"
              class="menu-input menu-input--field menu-body-small"
            >
              <option value="">-- {{ directionName }} --</option>
              <option
                v-for="spriteSheet in store.spriteSheets"
                :key="spriteSheet.id"
                :value="spriteSheet"
              >
                {{ spriteSheet.name }}
              </option>
            </select>
            <br />
            <img
              :src="itemForm.sheets[directionName]?.src"
              width="70"
              height="70"
              alt=""
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
      <div class="menu-form-item-summary">
        <span class="menu-body-small-strong">{{ animationSet.name }}</span>
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
      </div>
    </div>

    <ConfirmSimDeleteModal
      :open="deleteConfirmOpen"
      entity-type-label="animation set"
      :entity-name="animationSet.name || '—'"
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
  name: 'AnimationSetEdit',
  components: { Pencil, Trash2, ConfirmSimDeleteModal },
  props: {
    animationSet: Object,
    i: Number
  },
  setup(props) {
    const store = useStore()

    const isEditing = ref(false)
    const itemForm = ref({})
    const deleteConfirmOpen = ref(false)
    const deleteInProgress = ref(false)

    const saveItem = () => {
      isEditing.value = false
      const payload = {...itemForm.value}
      // replace Spritesheet objects with just IDs for payload
      const sheetNames = Object.keys(payload.sheets)
      sheetNames.forEach(sheetName => {
        payload.sheets[sheetName] = payload.sheets[sheetName].id
      })
      api.updateAnimationSet(payload)
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
        await api.deleteAnimationSet(props.animationSet.id)
        store.animationSets.splice(props.i, 1)
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

    const populateItemForm = () => {
      itemForm.value = {...props.animationSet}
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
      cancelEdit,
      populateItemForm
    }
  }
}
</script>