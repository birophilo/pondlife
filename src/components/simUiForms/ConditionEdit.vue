<template>
  <div>
    <div>
      <div class="created-item-header">
        <div v-if="isEditing">
          <input v-model="itemForm.name" type="text" placeholder="name" />
          <button @click="saveItem">save</button>
          <button @click="cancelEdit">cancel</button>
        </div>
        <div v-else>
          <div class="menu-action-name">{{ item.name }}</div>
          <button @click="editItem">edit</button>
          <button @click="deleteItem(index)">delete</button>
        </div>
      </div>
    </div>

    <!-- CONDITION FORM -->    
    <div v-if="isEditing === true">
      <select v-model="itemForm.conditionType">
        <option value="property">property</option>
        <option value="preset">preset</option>
        <option value="vicinity">vicinity</option>
      </select>

      <div v-if="itemForm.conditionType === 'property'">
        <select v-model="itemForm.property">
          <option value="">-- select property --</option>
          <option v-for="property in store.agentProperties" :value="property.name">
            {{ property.name }}
          </option>
        </select>

        <!-- <select v-model="itemForm.property">
          <option value="money">money</option>
        </select> -->

        <select v-model="itemForm.comparison">
          <option value="isGreaterThan">is greater than</option>
          <option value="isLessThan">is less than</option>
        </select>

        value <input type="number" v-model="itemForm.conditionValue" />
      </div>

      <div v-else-if="itemForm.conditionType === 'preset'">
        <select v-model="itemForm.classMethod">
          <option value="atDestination">at destination</option>
          <option value="actionIsComplete">is complete</option>
        </select>

        <select v-model="itemForm.comparison" value="isIdentical">
          <option value="isIdentical">is</option>
        </select>

        <select v-model="itemForm.conditionValue">
          <option :value="true">true</option>
          <option :value="false">false</option>
        </select>
      </div>

      <div v-else-if="itemForm.conditionType === 'vicinity'">
        agent
        <select
          v-model="itemForm.agentType"
          id="action-change-vicinity-name"
        >
          <option :value=null>-- select agent type --</option>
          <option
            v-for="[agentTypeName, agentType] of Object.entries(store.agentTypes)"
            :value="agentType.id"
          >
            {{ agentTypeName }}
          </option>
        </select>
        <br />

        <select v-model="itemForm.comparison">
          <option value="">-- select comparison --</option>
          <option value="isGreaterThan">is greater than</option>
          <option value="isLessThan">is less than</option>
        </select>
        <br />

        agent count: <input v-model="itemForm.conditionValue" type="number" /><br />

        <input type="checkbox" v-model="usingVicinityPropertyValue" /> use property value

        <div v-if="usingVicinityPropertyValue === true">

          <div v-if="itemForm.agentType !== null">
            <select v-model="itemForm.property">
              <option :value="null">-- select agent property --</option>
              <option v-for="propert in itemForm.agentType.properties" :value="propert">
                {{ propert }}
              </option>
            </select>
          </div>
          <br />

          property value: <input v-model="itemForm.propertyValue" type="number" />

        </div>

      </div>

      <div v-else>
        <div v-if="item.conditionType === 'property'">
          <input type="text" placeholder="property" :value="item.property" disabled />
        </div>
        <div v-else-if="item.conditionType === 'preset'">
          <input type="text" placeholder="preset" :value="item.classMethod" disabled />
        </div>
        <div v-else-if="item.conditionType === 'vicinity'">
          vicinity here
        </div>
        <input type="text" placeholder="comparison" :value="item.comparison" disabled />
        <input type="text" placeholder="value" :value="item.conditionValue" disabled />
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from '@/store/mainStore.js'
import api from '@/apiCrud.js'


export default {
  name: 'ConditionEdit',
  props: {
    item: Object,
    index: Number
  },
  setup: function (props) {
    const store = useStore()

    const itemForm = ref({})
    const isEditing = ref(false)

    const usingVicinityPropertyValue = ref(false)

    const populateItemForm = () => {
      itemForm.value = {...props.item}
    }

    const saveItem = () => {
      isEditing.value = false
      const keys = Object.keys(itemForm.value)
      api.updateCondition(itemForm.value)
      keys.forEach(key => store.conditions[props.index][key] = itemForm.value[key])
    }

    const deleteItem = () => {
      api.deleteCondition(props.item.id)
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
      usingVicinityPropertyValue,
      populateItemForm,
      saveItem,
      deleteItem,
      editItem,
      cancelEdit
    }
  }
}
</script>