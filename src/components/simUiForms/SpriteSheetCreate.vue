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
          <td class="menu-form-label-cell menu-body-small">src</td>
          <td class="menu-form-value-cell menu-body-small-strong">
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
        <MenuConfirmBtn label="Create sprite sheet" @click="createSpriteSheet" />
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
  src: '',
  columns: 1,
  rows: 1,
  numImages: 1,
  refreshInterval: 1
}

export default {
  name: 'SpriteSheetCreate',

  components: { MenuNewBtn, MenuConfirmBtn, MenuCancelBtn },

  setup () {
    const store = useStore()
    const isAdding = ref(false)
    const itemForm = ref({ ...DEFAULT_FORM })

    const createSpriteSheet = async () => {
      const newSpriteSheet = {
        name: itemForm.value.name,
        src: itemForm.value.src,
        columns: Number(itemForm.value.columns),
        rows: Number(itemForm.value.rows),
        numImages: Number(itemForm.value.numImages),
        refreshInterval: Number(itemForm.value.refreshInterval)
      }

      const createdItem = await api.createSpriteSheet(newSpriteSheet)
      newSpriteSheet.id = createdItem.id
      store.spriteSheets.push(newSpriteSheet)

      await store.saveScene()

      isAdding.value = false
      itemForm.value = { ...DEFAULT_FORM }
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

    const cancelCreate = () => {
      isAdding.value = false
      itemForm.value = { ...DEFAULT_FORM }
    }

    return {
      store,
      isAdding,
      itemForm,
      createSpriteSheet,
      uploadFile,
      cancelCreate
    }
  }
}
</script>
