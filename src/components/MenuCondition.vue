<template>
  <div>
    <div>
      <div class="created-item-header">
      <div v-if="editing">
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
    <div v-if="editing === true">
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
import { useStore } from '../store/mainStore.js'

export default {
  name: 'MenuCondition',
  setup: function () {
    const store = useStore()
    return { store }
  },
  props: {
    item: Object,
    index: Number
  },
  data: function () {
    return {
      defaultCondition: {
        adding: false,
        type: 'property',
        name: '',
        comparison: '',
        value: 0,
        property: '',
        classMethod: ''
      },
      editing: false,
      itemForm: {}
    }
  },
  methods: {
    populateItemForm: function () {

      const data = {
        conditionType: this.item.conditionType,
        conditionName: this.item.conditionName,
        conditionValue: this.item.conditionValue,
        comparison: this.item.comparison
      }

      if (data.conditionType === 'preset') {
        data.property = this.item.property
      } else {
        data.classMethod = this.item.classMethod
      }
      this.itemForm = {...data}
    },
    saveItem: function () {
      this.editing = false
      const keys = Object.keys(this.itemForm)
      keys.forEach(key => this.store.conditions[this.index][key] = this.itemForm[key])
    },
    deleteItem: function () {
      this.store.conditions.splice(this.index, 1)
    },
    editItem: function () {
      this.populateItemForm()
      this.editing = true
    },
    cancelEdit: function () {
      this.editing = false
      this.itemForm = {}
    }
  }
}
</script>