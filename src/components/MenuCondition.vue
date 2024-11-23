<template>
  <div>
    <div>
      <div class="created-item-header">
      <div v-if="isEditing">
        <input v-model="itemForm.conditionName" type="text" placeholder="name" />
        <button @click="saveItem">save</button>
        <button @click="cancelEdit">cancel</button>
      </div>
      <div v-else>
        <div class="menu-action-name">{{ item.conditionName }}</div>
        <button @click="editItem">edit</button>
        <button @click="deleteItem(index)">delete</button>
      </div>
    </div>

    <!-- CONDITION FORM -->    
    <div v-if="isEditing === true">
      <select v-model="itemForm.conditionType">
        <option value="property">property</option>
        <option value="preset">preset</option>
      </select>

      <div v-if="itemForm.conditionType === 'property'">
        <select v-model="itemForm.property">
          <option value="money">money</option>
        </select>

        <select v-model="itemForm.comparison">
          <option value="isGreaterThan">is greater than</option>
          <option value="isLessThan">is less than</option>
        </select>
      </div>
      <div v-else-if="itemForm.conditionType === 'preset'">
        <select v-model="itemForm.classMethod">
          <option value="atDestination">at destination</option>
          <option value="actionIsComplete">is complete</option>
        </select>

        <select v-model="itemForm.comparison" value="isIdentical">
          <option value="isIdentical">is</option>
        </select>
      </div>

      <select v-model="itemForm.conditionValue">
        <option :value="true">true</option>
        <option :value="false">false</option>
      </select>

      </div>
      <div v-else>
        <div v-if="item.conditionType === 'property'">
          <input type="text" placeholder="property" :value="item.property" disabled />
        </div>
        <div v-else-if="item.conditionType === 'preset'">
          <input type="text" placeholder="preset" :value="item.classMethod" disabled />
        </div>
        <input type="text" placeholder="comparison" :value="item.comparison" disabled />
        <input type="text" placeholder="value" :value="item.conditionValue" disabled />
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from '../store/mainStore.js'

export default {
  name: 'MenuCondition',
  props: {
    item: Object,
    index: Number
  },
  setup: function (props) {
    const store = useStore()

    const itemForm = ref({})
    const isEditing = ref(false)

    const populateItemForm = () => {

      const data = {
        conditionType: props.item.conditionType,
        conditionName: props.item.conditionName,
        conditionValue: props.item.conditionValue,
        comparison: props.item.comparison
      }

      if (data.conditionType === 'preset') {
        data.property = props.item.property
      } else {
        data.classMethod = props.item.classMethod
      }
      itemForm.value = {...data}
    }

    const saveItem = () => {
      isEditing.value = false
      const keys = Object.keys(itemForm.value)
      keys.forEach(key => store.conditions[props.index][key] = itemForm.value[key])
    }

    const deleteItem = () => {
      store.conditions.splice(props.index, 1)
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
      itemForm,
      isEditing,
      populateItemForm,
      saveItem,
      deleteItem,
      editItem,
      cancelEdit
    }
  }
}
</script>