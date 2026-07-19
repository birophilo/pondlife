<template>
  <div>
    <div v-if="isAdding === true && itemForm.action === action">
      <select v-model="itemForm.condition">
        <option value=null>-- select condition -- </option>
        <option v-for="condition in store.conditions" :value="condition">
          {{ condition.name }}
        </option>
      </select>
      <select v-model="itemForm.nextAction">
        <option value=null>-- select next action -- </option>
        <option v-for="action in store.actions" :value="action">
          {{ action.actionName }}
        </option>
      </select>
      <MenuConfirmBtn label="Add transition" @click="createTransition(action)" />
      <MenuCancelBtn @click="cancelAddTransition(action)" />
    </div>
    <button @click="isAdding = true; itemForm.action = action">add transition</button>
  </div>
  
</template>

<script>
import { ref } from 'vue'
import { useStore } from '@/store/mainStore.js'
import api from '@/apiCrud'
import MenuConfirmBtn from '@/components/simUi/MenuConfirmBtn.vue'
import MenuCancelBtn from '@/components/simUi/MenuCancelBtn.vue'

export default {
  name: 'ActionTransitionCreate',
  components: { MenuConfirmBtn, MenuCancelBtn },
  props: {
    action: Object
  },
  setup: function () {
    const store = useStore()

    const isAdding = ref(false)

    const itemForm = ref({
      condition: null,
      nextAction: null
    })

    const createTransition = async (action) => {
      const transition = {
        condition: itemForm.value.condition.id,
        nextAction: itemForm.value.nextAction.id
      }
      action.transitions.push(transition)

      await api.updateAction(action)

      itemForm.value.condition = null
      itemForm.value.nextAction = null
      isAdding.value = false
    }

    const cancelAddTransition = () => {
      itemForm.value.condition = null
      itemForm.value.nextAction = null
      isAdding.value = false
    }

    return {
      store,
      isAdding,
      itemForm,
      createTransition,
      cancelAddTransition
    }
  }
}

</script>