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
        <button type="button" class="menu-btn" @click="createItem">
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

const createDefaultForm = () => ({
  name: '',
  scale: 1,
  offset: {
    x: 0,
    y: 0
  },
  sheets: {
    idle: '',
    up: '',
    upRight: '',
    right: '',
    downRight: '',
    down: '',
    downLeft: '',
    left: '',
    upLeft: ''
  }
})

export default {
  name: 'AnimationSetCreate',
  components: { MenuNewBtn },
  setup: function () {
    const store = useStore()

    const isAdding = ref(false)

    const itemForm = ref(createDefaultForm())

    const createItem = async () => {
      const newAnimationSet = {
        name: itemForm.value.name,
        scale: Number(itemForm.value.scale),
        offset: {
          x: Number(itemForm.value.offset.x),
          y: Number(itemForm.value.offset.y)
        },
        sheets: itemForm.value.sheets
      }
      // replace Spritesheet objects with just IDs for payload
      const sheetNames = Object.keys(newAnimationSet.sheets)
      sheetNames.forEach(sheetName => {
        newAnimationSet.sheets[sheetName] = newAnimationSet.sheets[sheetName].id
      })
      const createdItem = await api.createAnimationSet(newAnimationSet)
      newAnimationSet.id = createdItem.id
      store.animationSets.push(newAnimationSet)

      await store.saveScene()

      isAdding.value = false
      itemForm.value = createDefaultForm()
    }

    const cancelCreate = () => {
      isAdding.value = false
      itemForm.value = createDefaultForm()
    }

    return { store, isAdding, itemForm, createItem, cancelCreate }
  }
}
</script>

