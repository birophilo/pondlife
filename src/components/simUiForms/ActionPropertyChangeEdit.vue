<template>
  <div>
    <div v-if="isEditing === true">
      <select v-model="itemForm.agentType">
        <option value="self">self</option>
        <option
            v-for="[agentType, obj] in Object.entries(store.agentTypes)"
            :value="obj">{{ agentType }}
        </option>
      </select>

      <form name="agentPropChangeRadioSelect">
        <input
          type="radio"
          v-model="itemForm.agentChoiceMethod"
          name="agentChoiceMethod"
          value="nearest"
          checked="true"
        />
        <label for="nearest">nearest</label>
        <input
          type="radio"
          v-model="itemForm.agentChoiceMethod"
          name="agentChoiceMethod"
          value="specific"
        />
        <label for="specific">specific</label>
        <input
          type="radio"
          v-model="itemForm.agentChoiceMethod"
          name="agentChoiceMethod"
          value="all"
        />
        <label for="all">all</label>
      </form>

      <select v-model="itemForm.property">
        <option value="money">money</option>
      </select>
      <select v-model="itemForm.change">
        <option value="increase">increase</option>
        <option value="decrease">decrease</option>
      </select>
      <input
        v-model="itemForm.value"
        type="number"
        placeholder="value"
      />
      <MenuConfirmBtn @click="saveItem" />
      <MenuCancelBtn @click="cancelEdit" />
    </div>
    <div v-else>
      <div>change {{ index + 1 }}: {{ propertyChangeHandler.description(propertyChange) }}</div>
      <button @click="editItem">edit item</button>
      <button @click="deleteItem">delete item</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import api from '@/apiCrud.js'
import { PropertyChangeHandler } from '@/classes/Action.js'
import { useStore } from '@/store/mainStore.js'
import MenuConfirmBtn from '@/components/simUi/MenuConfirmBtn.vue'
import MenuCancelBtn from '@/components/simUi/MenuCancelBtn.vue'

export default {
  name: 'ActionPropertyChangeEdit',
  components: { MenuConfirmBtn, MenuCancelBtn },
  props: {
    action: Object,
    propertyChangeId: String,
    index: Number
  },
  setup: function (props) {
    const store = useStore()

    const propertyChange = store.propertyChanges.find(ch => ch.id === props.propertyChangeId)
    const isEditing = ref(false)
    const itemForm = ref({})

    const populateItemForm = () => {
      itemForm.value = {...propertyChange}
    }

    const saveItem = () => {
      isEditing.value = false
      api.updatePropertyChange(itemForm.value)
      let propertyChange = store.propertyChanges.find(ch => ch.id === props.propertyChangeId)
      // propertyChange = {...itemForm.value}
      const keys = Object.keys(itemForm.value)
      keys.forEach(key => {
        propertyChange[key] = itemForm.value[key]
      })
    }

    const deleteItem = async () => {
      const action = store.actions.find(act => act.id === props.action.id)
      await api.deletePropertyChange(props.propertyChangeId)
      action.propertyChanges.splice(props.index, 1)
      store.propertyChanges = store.propertyChanges.filter(
        item => item.id !== props.propertyChangeId
      )
      await store.saveScene()
    }

    const editItem = () => {
      populateItemForm()
      isEditing.value = true
    }

    const cancelEdit = () => {
      isEditing.value = false
      itemForm.value = {}
    }

    const propertyChangeHandler = new PropertyChangeHandler()

    return {
      store,
      isEditing,
      itemForm,
      propertyChange,
      populateItemForm,
      saveItem,
      deleteItem,
      editItem,
      cancelEdit,
      propertyChangeHandler
    }
  }
}

</script>