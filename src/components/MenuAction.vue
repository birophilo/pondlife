<template>
  <div>
    <div class="created-item-header">
      <div class="menu-action-name">{{ actionData.actionName }}</div>
      <div v-if="actionData.editing">
        <button @click="actionData.editing = false">save</button>
        <button @click="actionData.editing = false">cancel</button>
      </div>
      <div v-else>
        <div v-if="actionData.actionType === 'change'">
          <button @click="deleteAction(actionData.actionName)">delete action</button>
        </div>
        <div v-else>
          <button @click="actionData.editing = true">edit</button>
          <button @click="deleteAction(actionData.actionName)">delete</button>
        </div>

      </div>
    </div>

    <!-- GOTO ACTION EDIT FORM -->
    <div v-if="actionData.actionType === 'goTo'">
      <div v-if="actionData.editing === true">
        <!-- removed until can cleanly change action type -->
        <!-- <select v-model="action.actionType">
          <option value="goTo">go to</option>
          <option value="change">change</option>
          <option value="interval">wait</option>
        </select> -->

        <select v-model="actionData.destinationType">
          <option>-- select agent or point --</option>
          <option value="agent">agent</option>
          <option value="point">point</option>
        </select>

        <select v-model="actionData.agentType">
          <option value="">-- agent type --</option>
          <option v-for="agentType in store.agentTypes" :value="agentType.name">{{ agentType.name }}</option>
        </select>

        <form name="agentRadioSelect">
          <input
            type="radio"
            v-model="actionData.agentChoiceMethod"
            name="agentChoiceMethod"
            value="nearest"
            checked="true"
          />
          <label for="nearest">nearest</label>
          <input
            type="radio"
            v-model="actionData.agentChoiceMethod"
            name="agentChoiceMethod"
            value="specific"
          />
          <label for="nearest">specific</label>
        </form>

        <div v-if="actionData.agentChoiceMethod === 'specific'">
          <select v-model="actionData.target">
            <option value="">-- select agent --</option>
            <option
              v-for="agent in store.agentItems[actionData.agentType]"
              :value="agent"
            >
              {{ agent.name }}
            </option>
          </select>
        </div>

      </div>
      <div v-else>
        <div>action type: {{ action.actionType }}</div>
        <input v-model="actionData.agentType" type="text" placeholder="target" disabled />
      </div>
    </div>

    <!-- (ACTION) PROPERTY CHANGE ITEM EDIT FORM -->
    <div v-if="actionData.actionType === 'change'">
      <div v-for="(propertyChange, index) in actionData.propertyChanges">
        <MenuActionPropertyChange
          :action="action"
          :propertyChange="propertyChange"
          :index="index"
        />
      </div>
      <ActionPropertyChangeForm :action="action"/>
    </div>

    <!-- INTERVAL EDIT FORM -->
    <div v-if="actionData.actionType === 'interval'">
      <div v-if="actionData.editing === true">
        <input v-model="actionData.duration" type="number" />
      </div>
      <div v-else>
        <div>action type: {{ actionData.actionType }}</div>
        <input :value="actionData.duration" type="number" disabled />
      </div>
    </div>

    <h4>Action transitions</h4>
    <CreateActionTransitionForm :action="action" />
    <!-- ACTION TRANSITIONS -->
    <div v-for="(transition, index) in action.transitions">
      <MenuActionTransition :action="action" :transition="transition" :index="index" />
    </div>
  </div>
</template>

<script>
import { useStore } from '../store/mainStore.js'
import ActionPropertyChangeForm from './ActionPropertyChangeForm.vue'
import MenuActionPropertyChange from './MenuActionPropertyChange.vue'
import MenuActionTransition from './MenuActionTransition.vue'
import CreateActionTransitionForm from './CreateActionTransitionForm.vue'

export default {
  name: 'MenuAction',
  setup: function () {
    const store = useStore()
    return { store }
  },
  components: {    
    ActionPropertyChangeForm,
    MenuActionPropertyChange,
    CreateActionTransitionForm,
    MenuActionTransition
  },
  props: {
    action: Object
  },
  mounted: function () {
    this.setupActionData()
  },
  data: function () {
    return {
      actionData: {}
    }
  },
  methods: {
    setupActionData: function () {
      const data = {
        editing: this.action.editing,
        actionName: this.action.actionName,
        actionType: this.action.actionType,
        destinationType: this.action.args.destinationType,
        agentType: this.action.args.agentType,
        agentChoiceMethod: this.action.args.agentChoiceMethod,
        propertyChanges: this.action.propertyChanges,
        transitions: this.action.transitions,
        duration: this.action.duration,
        target: this.action.args.target
      }
      this.actionData = {...data}
    },
    saveAction: function () {
      this.actionData.editing = false

      const act = this.store.actions.find(a => a.name === this.action.name)

      act.editing = this.actionData.editing
      act.actionName = this.actionData.actionName
      act.actionType = this.actionData.actionType
      act.propertyChanges = this.actionData.propertyChanges
      act.transitions = this.actionData.transitions
      act.duration = this.actionData.duration
      act.args.destinationType = this.actionData.destinationType
      act.args.agentType = this.actionData.agentType
      act.args.target = this.actionData.target
      act.agentChoiceMethod = this.actionData.agentChoiceMethod

    },
    deleteAction: function (itemName) {
      this.store.actions = this.store.actions.filter(item => item.actionName !== itemName)
    },
  }
}

</script>