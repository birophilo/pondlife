<template>
  <div>
    <div class="created-item-header">
      <div class="menu-action-name">
        <div v-if="editing === true">
          <input v-model="itemForm.actionName" type="text" />
        </div>
        <div v-else>
          {{ action.actionName }}
        </div>
      </div>
      <div v-if="editing === true">
        <button @click="saveItem">save</button>
        <button @click="cancelEdit">cancel</button>
      </div>
      <div v-else>
        <div>
          <button @click="editItem">edit</button>
          <button @click="deleteItem(action.actionName)">delete</button>
        </div>
      </div>
    </div>

    <!-- GOTO ACTION EDIT FORM -->
    <div v-if="action.actionType === 'goTo'">
      <div v-if="editing === true">
        <!-- removed until can cleanly change action type -->
        <!-- <select v-model="action.actionType">
          <option value="goTo">go to</option>
          <option value="change">change</option>
          <option value="interval">wait</option>
        </select> -->

        <select v-model="itemForm.destinationType">
          <option>-- select agent or point --</option>
          <option value="agent">agent</option>
          <option value="point">point</option>
        </select>

        <div v-if="itemForm.destinationType === 'point'">
          <div>Select point:
            <button
              class="selection-mode-button"
              @click="store.selectionMode = !store.selectionMode"
              :style="{backgroundColor: store.selectionMode ? 'grey' : 'white'}"
            >x</button>
            <span v-if="store.selectionMode === true">x: {{ store.mouse.x }}, y: {{ store.mouse.y }}</span><br/>
            x: <input
              v-model="targetPointX"
              type="text"
              :placeholder="store.mouse.x"
            />
            <br />
            y:
            <input
              v-model="targetPointY"
              type="text"
              :placeholder="store.mouse.y"
              value=""
            />
            <br />
          </div>
        </div>

        <div v-else>

          <select v-model="itemForm.agentType">
            <option value="">-- agent type --</option>
            <option v-for="agentType in store.agentTypes" :value="agentType.name">{{ agentType.name }}</option>
          </select>

          <form name="agentRadioSelect">
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
            <label for="nearest">specific</label>
          </form>

          <div v-if="itemForm.agentChoiceMethod === 'specific'">
            <select v-model="itemForm.target">
              <option value="">-- select agent --</option>
              <option
                v-for="agent in store.agentItems[itemForm.agentType]"
                :value="agent"
              >
                {{ agent.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div v-else>
        <div>action type: {{ action.actionType }}</div>
        <div>{{ action.agentType }}</div>
      </div>
    </div>

    <!-- (ACTION) PROPERTY CHANGE ITEM EDIT FORM -->
    <div v-if="action.actionType === 'change'">
      <div v-for="(propertyChange, index) in action.propertyChanges">
        <MenuActionPropertyChange
          :action="action"
          :propertyChange="propertyChange"
          :index="index"
        />
      </div>
      <ActionPropertyChangeForm :action="action"/>
    </div>

    <!-- INTERVAL EDIT FORM -->
    <div v-if="action.actionType === 'interval'">
      <div v-if="editing === true">
        <div>interval (frames): <input v-model="itemForm.duration" type="number" /></div>
      </div>
      <div v-else>
        <div>action type: {{ action.actionType }}</div>
        <div>interval (frames): <input :value="itemForm.duration" type="number" disabled /></div>
      </div>
    </div>

    <div v-if="action.actionType === 'spawnAgent'">
      <div>Select point:
        <button
          class="selection-mode-button"
          @click="store.selectionMode = !store.selectionMode"
          :style="{backgroundColor: store.selectionMode ? 'grey' : 'white'}"
        >x</button>
        <span v-if="store.selectionMode === true">x: {{ store.mouse.x }}, y: {{ store.mouse.y }}</span><br/>
        x: <input
          v-model="positionPointX"
          type="text"
          :placeholder="store.mouse.x"
        />
        <br />
        y:
        <input
          v-model="positionPointY"
          type="text"
          :placeholder="store.mouse.y"
          value=""
        />
        <br />
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
  data: function () {
    return {
      editing: false,
      itemForm: {}
    }
  },
  methods: {
    populateItemForm: function () {
      this.itemForm = {
        actionName: this.action.actionName,
        actionType: this.action.actionType,
        destinationType: this.action.args.destinationType,
        agentType: this.action.args.agentType,
        agentChoiceMethod: this.action.args.agentChoiceMethod,
        propertyChanges: this.action.propertyChanges,
        transitions: this.action.transitions,
        duration: this.action.duration,
        target: this.action.args.target,
      }

      if (this.action.actionType === 'spawnAgent') {
        this.itemForm.position = this.action.position
      }
    },
    saveItem: function () {
      this.editing = false

      const act = this.store.actions.find(a => a.name === this.action.name)

      act.actionName = this.itemForm.actionName
      act.actionType = this.itemForm.actionType
      act.propertyChanges = this.itemForm.propertyChanges
      act.transitions = this.itemForm.transitions
      act.duration = this.itemForm.duration
      act.args.destinationType = this.itemForm.destinationType
      act.args.agentType = this.itemForm.agentType
      act.args.target = this.itemForm.target
      act.agentChoiceMethod = this.itemForm.agentChoiceMethod

      if (this.action.actionType === 'spawnAgent') {
        act.args.position = {x: Number(this.store.selectedPoint.x), y: Number(this.store.selectedPoint.y)}
      } else if (this.action.actionType === 'goTo') {
        act.args.target.position = {x: Number(this.store.selectedPoint.x), y: Number(this.store.selectedPoint.y)}
      }
      this.store.selectedPoint = {x: null, y: null}
    },
    deleteItem: function (itemName) {
      this.store.actions = this.store.actions.filter(item => item.actionName !== itemName)
    },
    editItem: function () {
      this.populateItemForm()
      this.editing = true
    },
    cancelEdit: function () {
      this.store.selectedPoint = {x: null, y: null}
      this.editing = false
      this.itemForm = {}
    }
  },
  computed : {
    targetPointX: function () {
      return this.store.selectedPoint.x !== null ? this.store.selectedPoint.x : this.itemForm.target.position.x
    },
    targetPointY: function () {
      return this.store.selectedPoint.y !== null ? this.store.selectedPoint.y : this.itemForm.target.position.y
    },
    positionPointX: function () {
      return this.store.selectedPoint.x !== null ? this.store.selectedPoint.x : this.itemForm.position.x
    },
    positionPointY: function () {
      return this.store.selectedPoint.y !== null ? this.store.selectedPoint.y : this.itemForm.position.y
    }
  }
}

</script>