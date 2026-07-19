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
            <select v-model="itemForm.animationSet" class="menu-input menu-input--field">
              <option :value="null">-- select animation set --</option>
              <option
                v-for="animationSet in store.animationSets"
                :key="animationSet.id"
                :value="animationSet"
              >
                {{ animationSet.name }}
              </option>
            </select>
          </td>
        </tr>
        <tr>
          <td class="menu-form-label-cell menu-body-small">thumbnail</td>
          <td class="menu-form-value-cell menu-body-small-strong">
            <span class="menu-body-small">{{ itemForm.thumbnail || '—' }}</span>
            <input type="file" @change="uploadFile" />
          </td>
        </tr>
      </table>

      <div class="menu-form-actions">
        <MenuConfirmBtn label="Create agent type" @click="createAgentType" />
        <MenuCancelBtn @click="cancelCreate" />
      </div>
    </div>

    <MenuNewBtn v-else @click="isAdding = true" />
  </div>
</template>

<script>
import { ref, markRaw } from 'vue'
import { AgentMenuIcon } from '@/classes/SelectionMenu.js'
import { useStore } from '@/store/mainStore.js'
import api from '@/apiCrud.js'
import MenuNewBtn from '@/components/simUi/MenuNewBtn.vue'
import MenuConfirmBtn from '@/components/simUi/MenuConfirmBtn.vue'
import MenuCancelBtn from '@/components/simUi/MenuCancelBtn.vue'

const DEFAULT_FORM = {
  name: '',
  height: 50,
  width: 50,
  animationSet: null,
  thumbnail: '',
  nominalSpeed: 0.02,
  positionX: 100,
  positionY: 100
}

export default {
  name: 'AgentTypeCreate',

  components: { MenuNewBtn, MenuConfirmBtn, MenuCancelBtn },

  setup () {
    const store = useStore()
    const isAdding = ref(false)
    const itemForm = ref({ ...DEFAULT_FORM })

    const uploadFile = async (event) => {
      const imageFile = event.target.files[0]
      const formData = new FormData()
      formData.append('resource', 'agentType')
      formData.append('imageType', 'thumbnail')
      formData.append('file', imageFile)

      const createdResponse = await api.uploadFile(formData)
      itemForm.value.thumbnail = createdResponse.filename
    }

    const createAgentType = async () => {
      const agentTypeName = itemForm.value.name

      const newAgentType = {
        name: agentTypeName,
        width: Number(itemForm.value.width),
        height: Number(itemForm.value.height),
        offset: {
          x: itemForm.value.positionX,
          y: itemForm.value.positionY
        },
        nominalSpeed: Number(itemForm.value.nominalSpeed),
        animationSet: itemForm.value.animationSet.id,
        thumbnail: itemForm.value.thumbnail
      }

      const createdItem = await api.createAgentType(newAgentType)
      newAgentType.id = createdItem.id

      store.agentTypes[agentTypeName] = newAgentType
      store.agentItems[agentTypeName] = []
      store.firstActions[agentTypeName] = null

      await store.saveScene()

      const newIcon = markRaw(
        new AgentMenuIcon({
          menu: store.itemMenu,
          i: store.agentMenuButtons.length + 1,
          name: agentTypeName,
          agentType: newAgentType
        })
      )
      store.agentMenuButtons.push(newIcon)

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
      createAgentType,
      uploadFile,
      cancelCreate
    }
  }
}
</script>
