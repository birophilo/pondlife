<template>
  <div>
    <div v-if="agentType.name !== 'world'">
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
            <td class="menu-form-label-cell menu-body-small">width</td>
            <td class="menu-form-value-cell menu-body-small-strong">
              <input
                v-model="itemForm.width"
                type="number"
                class="menu-input menu-input--field"
              />
            </td>
          </tr>
          <tr>
            <td class="menu-form-label-cell menu-body-small">height</td>
            <td class="menu-form-value-cell menu-body-small-strong">
              <input
                v-model="itemForm.height"
                type="number"
                class="menu-input menu-input--field"
              />
            </td>
          </tr>
          <tr>
            <td class="menu-form-label-cell menu-body-small">movement speed</td>
            <td class="menu-form-value-cell menu-body-small-strong">
              <input
                v-model="itemForm.nominalSpeed"
                type="number"
                class="menu-input menu-input--field"
              />
            </td>
          </tr>
          <tr>
            <td class="menu-form-label-cell menu-body-small">animation set</td>
            <td class="menu-form-value-cell menu-body-small-strong">
              <select
                v-model="itemForm.animationSet"
                class="menu-input menu-input--field"
              >
                <option :value="null">-- select animation set --</option>
                <option
                  v-for="animationSet in store.animationSets"
                  :key="animationSet.id"
                  :value="animationSet.id"
                >
                  {{ animationSet.name }}
                </option>
              </select>
            </td>
          </tr>
          <tr>
            <td class="menu-form-label-cell menu-body-small">thumbnail</td>
            <td class="menu-form-value-cell menu-body-small-strong">
              <div class="agent-type-thumbnail-field">
                <img
                  v-if="thumbnailSrc(itemForm.thumbnail)"
                  :src="thumbnailSrc(itemForm.thumbnail)"
                  :alt="`${itemForm.name || agentType.name} thumbnail`"
                  class="agent-type-thumbnail"
                />
                <span class="menu-body-small">{{ itemForm.thumbnail || '—' }}</span>
                <input type="file" @change="uploadFile" />
              </div>
            </td>
          </tr>
          <tr>
            <td class="menu-form-label-cell menu-body-small">sensor</td>
            <td class="menu-form-value-cell menu-body-small-strong">
              <select
                v-model="itemForm.sensor"
                class="menu-input menu-input--field"
              >
                <option :value="null">no sensor</option>
                <option
                  v-for="sensor in store.sensors"
                  :key="sensor.id"
                  :value="sensor.id"
                >
                  {{ sensor.name }}
                </option>
              </select>
            </td>
          </tr>
          <tr>
            <td class="menu-form-label-cell menu-body-small">starting action</td>
            <td class="menu-form-value-cell menu-body-small-strong">
              <select
                v-model="itemForm.firstAction"
                class="menu-input menu-input--field"
              >
                <option :value="null">no action</option>
                <option
                  v-for="action in store.actions"
                  :key="action.id"
                  :value="action.id"
                >
                  {{ action.actionName }}
                </option>
              </select>
            </td>
          </tr>
        </table>

        <div class="menu-form-actions">
          <MenuConfirmBtn @click="saveItem" />
          <MenuCancelBtn @click="cancelEdit" />
        </div>
      </div>
      <div v-else class="menu-form-item-summary">
        <div class="agent-type-summary-main">
          <img
            v-if="thumbnailSrc(agentType.thumbnail)"
            :src="thumbnailSrc(agentType.thumbnail)"
            :alt="`${agentType.name} thumbnail`"
            class="agent-type-thumbnail"
          />
          <span class="menu-body-small-strong">{{ agentType.name }}</span>
        </div>
        <div class="menu-form-item-actions">
          <button
            type="button"
            class="menu-icon-btn"
            aria-label="Edit"
            title="Edit"
            @click="editItem"
          >
            <Pencil :size="16" aria-hidden="true" />
          </button>
          <MenuTooltip
            :open="blockedTooltip === 'remove'"
            :message="blockedReason('remove')"
            @update:open="setBlockedTooltipOpen('remove', $event)"
          >
            <template #trigger="{ tooltipId }">
              <button
                type="button"
                class="menu-icon-btn"
                :class="{ 'menu-icon-btn--disabled': agentTypeChangeBlocked }"
                :aria-label="agentTypeChangeBlocked
                  ? 'Cannot remove from scene'
                  : 'Remove from scene'"
                :aria-disabled="agentTypeChangeBlocked"
                :aria-controls="agentTypeChangeBlocked ? tooltipId : undefined"
                :aria-expanded="agentTypeChangeBlocked
                  ? blockedTooltip === 'remove'
                  : undefined"
                :title="agentTypeChangeBlocked ? undefined : 'Remove from scene'"
                @click="removeFromMenu"
              >
                <CircleX :size="16" aria-hidden="true" />
              </button>
            </template>
          </MenuTooltip>
          <MenuTooltip
            :open="blockedTooltip === 'delete'"
            :message="blockedReason('delete')"
            @update:open="setBlockedTooltipOpen('delete', $event)"
          >
            <template #trigger="{ tooltipId }">
              <button
                type="button"
                class="menu-icon-btn menu-icon-btn--danger"
                :class="{ 'menu-icon-btn--disabled': agentTypeChangeBlocked }"
                :aria-label="agentTypeChangeBlocked
                  ? 'Cannot permanently delete'
                  : 'Delete permanently'"
                :aria-disabled="agentTypeChangeBlocked"
                :aria-controls="agentTypeChangeBlocked ? tooltipId : undefined"
                :aria-expanded="agentTypeChangeBlocked
                  ? blockedTooltip === 'delete'
                  : undefined"
                :title="agentTypeChangeBlocked ? undefined : 'Delete permanently'"
                @click="deleteItem"
              >
                <Trash2 :size="16" aria-hidden="true" />
              </button>
            </template>
          </MenuTooltip>
        </div>
      </div>
    </div>

    <ConfirmSimDeleteModal
      :open="removeConfirmOpen"
      title="Confirm remove from scene"
      confirm-label="Remove"
      entity-type-label="agent type"
      :entity-name="agentType.name || '—'"
      :deleting="removeInProgress"
      @close="closeRemoveConfirm"
      @confirm="confirmRemove"
    />

    <ConfirmSimDeleteModal
      :open="deleteConfirmOpen"
      entity-type-label="agent type"
      :entity-name="agentType.name || '—'"
      :deleting="deleteInProgress"
      @close="closeDeleteConfirm"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue'
import { CircleX, Pencil, Trash2 } from '@lucide/vue'
import { useStore } from '@/store/mainStore.js'
import api from '@/apiCrud.js'
import { resolveAgentThumbnailSrc } from '@/classes/SelectionMenu.js'
import ConfirmSimDeleteModal from '@/components/ConfirmSimDeleteModal.vue'
import MenuTooltip from '@/components/simUi/MenuTooltip.vue'
import MenuConfirmBtn from '@/components/simUi/MenuConfirmBtn.vue'
import MenuCancelBtn from '@/components/simUi/MenuCancelBtn.vue'

export default {
  name: 'AgentTypeEdit',
  components: {
    Pencil,
    Trash2,
    CircleX,
    ConfirmSimDeleteModal,
    MenuTooltip,
    MenuConfirmBtn,
    MenuCancelBtn
  },
  props: {
    agentType: Object
  },
  setup: function (props) {
    const store = useStore()

    const isEditing = ref(false)
    const removeConfirmOpen = ref(false)
    const removeInProgress = ref(false)
    const deleteConfirmOpen = ref(false)
    const deleteInProgress = ref(false)
    const blockedTooltip = ref(null)

    const populateItemForm = () => {
      itemForm.value = {
        id: props.agentType.id,
        name: props.agentType.name,
        height: props.agentType.height,
        width: props.agentType.width,
        animationSet: props.agentType.animationSet?.id,
        thumbnail: props.agentType.thumbnail,
        nominalSpeed: props.agentType.nominalSpeed,
        positionX: props.agentType.offset.x,
        positionY: props.agentType.offset.y,
        sensor: props.agentType.sensor,
        firstAction: store.firstActions[props.agentType.name] ?? null
      }
    }

    const itemForm = ref({})

    const dependentAgents = () => {
      return store.agentItems[props.agentType.name] ?? []
    }

    const agentTypeChangeBlocked = computed(() => dependentAgents().length > 0)

    const blockedReason = (operation) => {
      return `Cannot ${operation} agent type while it has instances in the scene. Remove these first.`
    }

    const setBlockedTooltipOpen = (operation, open) => {
      if (open && agentTypeChangeBlocked.value) {
        blockedTooltip.value = operation
      } else if (blockedTooltip.value === operation) {
        blockedTooltip.value = null
      }
    }

    const toggleBlockedTooltip = (operation) => {
      blockedTooltip.value = blockedTooltip.value === operation ? null : operation
    }

    watch(agentTypeChangeBlocked, (isBlocked) => {
      if (!isBlocked) blockedTooltip.value = null
    })

    const deleteItem = () => {
      if (agentTypeChangeBlocked.value) {
        toggleBlockedTooltip('delete')
        return
      }
      blockedTooltip.value = null
      deleteConfirmOpen.value = true
    }

    const closeDeleteConfirm = () => {
      if (deleteInProgress.value) return
      deleteConfirmOpen.value = false
    }

    const confirmDelete = async () => {
      if (deleteInProgress.value) return
      if (agentTypeChangeBlocked.value) {
        deleteConfirmOpen.value = false
        blockedTooltip.value = 'delete'
        return
      }
      deleteInProgress.value = true
      try {
        await api.deleteAgentType(props.agentType.id)
        const sceneSaved = await store.saveSceneData(sceneDataWithoutAgentType())
        if (!sceneSaved) return
        removeAgentTypeFromStore()
        deleteConfirmOpen.value = false
      } finally {
        deleteInProgress.value = false
      }
    }

    const removeAgentTypeFromStore = () => {
      const atName = props.agentType.name
      delete store.agentTypes[atName]
      delete store.agentItems[atName]
      delete store.firstActions[atName]
      store.agentMenuButtons = store.agentMenuButtons.filter(button => button.name !== atName)
    }

    const sceneDataWithoutAgentType = () => {
      const data = store.buildSceneData()
      data.agentTypes = data.agentTypes.filter(id => id !== props.agentType.id)
      delete data.firstActions[props.agentType.name]
      return data
    }

    const editItem = () => {
      blockedTooltip.value = null
      populateItemForm()
      isEditing.value = true
    }

    const cancelEdit = () => {
      isEditing.value = false
      itemForm.value = {}
    }

    const uploadFile = async (event) => {
      const imageFile = event.target.files[0]
      let formData = new FormData()
      formData.append("resource", "agentType")
      formData.append("imageType", "thumbnail")
      formData.append("file", imageFile)

      const createdResponse = await api.uploadFile(formData)
      itemForm.value.thumbnail = createdResponse.filename
    }

    const saveItem = async () => {
      const data = {
        id: itemForm.value.id,
        name: itemForm.value.name,
        height: itemForm.value.height,
        width: itemForm.value.width,
        animationSet: itemForm.value.animationSet,
        thumbnail: itemForm.value.thumbnail,
        nominalSpeed: itemForm.value.nominalSpeed,
        offset: {
          x: itemForm.value.positionX,
          y: itemForm.value.positionY
        },
        sensor: itemForm.value.sensor
      }

      await api.updateAgentType(data)
      store.agentTypes[props.agentType.name] = data
      store.firstActions[props.agentType.name] = itemForm.value.firstAction
      await store.saveScene()

      isEditing.value = false
    }

    const removeFromMenu = () => {
      if (agentTypeChangeBlocked.value) {
        toggleBlockedTooltip('remove')
        return
      }
      blockedTooltip.value = null
      removeConfirmOpen.value = true
    }

    const closeRemoveConfirm = () => {
      if (removeInProgress.value) return
      removeConfirmOpen.value = false
    }

    const confirmRemove = async () => {
      if (removeInProgress.value) return
      if (agentTypeChangeBlocked.value) {
        removeConfirmOpen.value = false
        blockedTooltip.value = 'remove'
        return
      }
      removeInProgress.value = true
      try {
        const sceneSaved = await store.saveSceneData(sceneDataWithoutAgentType())
        if (!sceneSaved) return
        removeAgentTypeFromStore()
        removeConfirmOpen.value = false
      } finally {
        removeInProgress.value = false
      }
    }

    return {
      store,
      isEditing,
      itemForm,
      editItem,
      saveItem,
      deleteItem,
      closeDeleteConfirm,
      confirmDelete,
      deleteConfirmOpen,
      deleteInProgress,
      removeFromMenu,
      closeRemoveConfirm,
      confirmRemove,
      removeConfirmOpen,
      removeInProgress,
      blockedTooltip,
      agentTypeChangeBlocked,
      blockedReason,
      setBlockedTooltipOpen,
      cancelEdit,
      populateItemForm,
      uploadFile,
      thumbnailSrc: resolveAgentThumbnailSrc
    }
  }
}

</script>

<style scoped>
.agent-type-summary-main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.agent-type-thumbnail-field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.agent-type-thumbnail {
  display: block;
  width: 55px;
  max-width: 100%;
  height: auto;
  object-fit: contain;
  border: 1px solid var(--menu-border-light);
  background: var(--menu-surface);
}
</style>