<template>
  <div>
    <div v-if="agentType.name !== 'world'">
      <div v-if="isEditing === true">
        name: <input v-model="itemForm.name" type="text" placeholder="name" /><br />
        width: <input v-model="itemForm.width" type="number" placeholder="width" /><br />
        height: <input v-model="itemForm.height" type="number" placeholder="height" /><br />
        movement speed: <input v-model="itemForm.nominalSpeed" type="number" placeholder="1" /><br />

        animation set:
        <select v-model="itemForm.animationSet">
          <option :value="null">-- select animation set --</option>
          <option
            v-for="animationSet in store.animationSets"
            :key="animationSet.id"
            :value="animationSet.id"
          >
            {{ animationSet.name }}
          </option>
        </select>
        <br />

        thumbnail: {{ itemForm.thumbnail }}<br />
        <input type="file" placeholder="thumbnail" @change="uploadFile" /><br />

        sensor: <select v-model="itemForm.sensor">
          <option :value="null">no sensor</option>
          <option
            v-for="sensor in store.sensors"
            :key="sensor.id"
            :value="sensor.id"
          >{{ sensor.name }}</option>
        </select><br />

        <button @click="saveItem">save</button>
        <button @click="cancelEdit">cancel</button>
      </div>
      <div v-else class="menu-form-item-summary">
        <span class="menu-body-small-strong">{{ agentType.name }}</span>
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
          <button
            type="button"
            class="menu-icon-btn"
            aria-label="Remove from scene"
            title="Remove from scene"
            @click="removeFromMenu(agentType)"
          >
            <X :size="16" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="menu-icon-btn menu-icon-btn--danger"
            aria-label="Delete"
            title="Delete"
            @click="deleteItem"
          >
            <Trash2 :size="16" aria-hidden="true" />
          </button>
        </div>
      </div>
      <p v-if="operationBlockedReason" class="menu-panel__hint" role="alert">
        {{ operationBlockedReason }}
      </p>
    </div>

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
import { ref } from 'vue'
import { Pencil, Trash2, X } from '@lucide/vue'
import { useStore } from '@/store/mainStore.js'
import api from '@/apiCrud.js'
import ConfirmSimDeleteModal from '@/components/ConfirmSimDeleteModal.vue'

export default {
  name: 'AgentTypeEdit',
  components: { Pencil, Trash2, X, ConfirmSimDeleteModal },
  props: {
    agentType: Object
  },
  setup: function (props) {
    const store = useStore()

    const isEditing = ref(false)
    const deleteConfirmOpen = ref(false)
    const deleteInProgress = ref(false)
    const operationBlockedReason = ref('')

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
        sensor: props.agentType.sensor
      }
    }

    const itemForm = ref({})

    const dependentAgents = () => {
      return store.agentItems[props.agentType.name] ?? []
    }

    const blockIfAgentInstancesExist = (operation) => {
      const count = dependentAgents().length
      if (count === 0) {
        operationBlockedReason.value = ''
        return false
      }
      const noun = count === 1 ? 'agent instance' : 'agent instances'
      operationBlockedReason.value = (
        `Cannot ${operation} "${props.agentType.name}" while it is used by ${count} ${noun}. ` +
        'Remove those agents from the scene first.'
      )
      return true
    }

    const deleteItem = () => {
      if (blockIfAgentInstancesExist('delete')) return
      deleteConfirmOpen.value = true
    }

    const closeDeleteConfirm = () => {
      if (deleteInProgress.value) return
      deleteConfirmOpen.value = false
    }

    const confirmDelete = async () => {
      if (deleteInProgress.value || blockIfAgentInstancesExist('delete')) return
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
      operationBlockedReason.value = ''
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

    const saveItem = () => {
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

      api.updateAgentType(data)
      store.agentTypes[props.agentType.name] = data

      isEditing.value = false
    }

    const removeFromMenu = async () => {
      if (blockIfAgentInstancesExist('remove from the scene')) return
      const sceneSaved = await store.saveSceneData(sceneDataWithoutAgentType())
      if (!sceneSaved) return
      removeAgentTypeFromStore()
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
      operationBlockedReason,
      cancelEdit,
      populateItemForm,
      uploadFile,
      removeFromMenu
    }
  }
}

</script>