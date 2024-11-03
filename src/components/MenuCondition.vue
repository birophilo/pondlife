<template>
  <div>
    <div class="created-item-header">
    <div v-if="condition.editing">
      <input v-model="condition.conditionName" type="text" placeholder="name" />
      <button @click="condition.editing = false">save</button>
      <button @click="condition.editing = false">cancel</button>
    </div>
    <div v-else>
      <div class="menu-action-name">{{ item.conditionName }}</div>
      <button @click="condition.editing = true">edit</button>
      <button @click="deleteCondition(index)">delete</button>
    </div>
  </div>

  <!-- CONDITION FORM -->
  <div v-if="condition.editing === true">
    <select v-model="condition.conditionType">
      <option value="property">property</option>
      <option value="preset">preset</option>
    </select>
  </div>
    
  <div v-if="condition.editing === true">
    <div v-if="condition.conditionType === 'property'">
      <select v-model="condition.property">
        <option value="money">money</option>
      </select>

      <select v-model="condition.comparison">
        <option value="isGreaterThan">is greater than</option>
        <option value="isLessThan">is less than</option>
      </select>
    </div>
    <div v-else-if="condition.conditionType === 'preset'">
      <select v-model="condition.classMethod">
        <option value="atDestination">at destination</option>
        <option value="actionIsComplete">is complete</option>
      </select>

      <select v-model="condition.comparison" value="isIdentical">
        <option value="isIdentical">is</option>
      </select>
    </div>

    <select v-model="condition.conditionValue">
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
  mounted: function () {
    this.setupConditionData()
  },
  data: function () {
    return {
      condition: {
        adding: false,
        type: 'property',
        name: '',
        comparison: '',
        value: 0,
        property: '',
        classMethod: ''
      }
    }
  },
  methods: {
    setupConditionData: function () {
      const data = {
        adding: this.item.editing,
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

      this.condition = {...data}
    },
    saveCondition: function () {
      this.condition.editing = false
      const i = this.index
      console.log(i)
      const keys = Object.keys(this.condition)
      console.log(keys)
      keys.forEach(key => this.store.conditions[i][key] = this.condition[key])
    },
    deleteCondition: function () {
      this.store.conditions.splice(this.index, 1)
      this.$forceUpdate()
    }
  }
}

</script>