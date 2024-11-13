<template>
  <!-- ACTIONS CREATE -->
  <div v-if="adding === false" class="add-container">
    <button @click="adding = true">new action</button>
  </div>
  <div v-else>
    <input v-model="itemForm.actionName" type="text" placeholder="name" />
    <br />
    <!-- <div>
      <select v-model="itemForm.agentType">
        <option value="">-- agent type --</option>
        <option v-for="agentType in store.agentTypes" :value="agentType.name">{{ agentType.name }}</option>
      </select>
    </div> -->

    <select v-model="itemForm.actionType">
      <!-- World agent cannot travel, only change properties and pause for intervals -->
      <option value="">-- action type --</option>
      <!-- <option v-if="store.selectedAgent.agentType !== 'world'" value="goTo">go to</option> -->
      <option value="goTo">go to</option>
      <option value="change">change</option>
      <option value="interval">wait</option>
      <option value="removeAgent">remove agent</option>
    </select>
    <br />

    <!-- FORM FIELDS SPECIFIC TO ACTION TYPE -->
    <div v-if="itemForm.actionType === 'goTo'">
      <select v-model="itemForm.destinationType">
        <option value="">-- destination type --</option>
        <option value="agent">agent</option>
        <option value="point">point</option>
      </select>

      <div v-if="itemForm.destinationType === 'agent'">
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
        <button
          class="selection-mode-button"
          @click="store.selectionMode = !store.selectionMode"
          :style="{backgroundColor: store.selectionMode ? 'grey' : 'white'}"
        >x</button>

        <div v-if="itemForm.agentChoiceMethod === 'specific'">
          <select v-model="itemForm.target">
            <option value="">-- select agent --</option>
            <option
              v-for="agent in store.agentItems[itemForm.pointYagentType]"
              :value="agent"
            >
              {{ agent.name }}
            </option>
          </select>
        </div>

      </div>

      <div v-if="itemForm.destinationType === 'point'">
        <div>Select point:
          <button
            class="selection-mode-button"
            @click="store.selectionMode = !store.selectionMode"
            :style="{backgroundColor: store.selectionMode ? 'grey' : 'white'}"
          >x</button>
          <br />
          x:
          <input
            v-model="itemForm.pointX"
            type="text"
            :placeholder="store.mouse.x"
          />
          <br />
          y:
          <input
            v-model="itemForm.pointY"
            type="text"
            :placeholder="store.mouse.y"
            value=""
          />
          <br />
        </div>
      </div>

    </div>

    <div v-if="itemForm.actionType === 'interval'">
      <input
        type="number"
        v-model="itemForm.duration"
        placeholder="0"
      />
    </div>

    <div v-if="itemForm.type === 'removeAgent'">

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
        <input
          type="radio"
          v-model="itemForm.agentChoiceMethod"
          name="agentChoiceMethod"
          value="all"
        />
        <label for="all">all</label>
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

    <input type="text" v-model="itemForm.spriteSheet" placeholder="sprite sheet" />

    <button @click="createAction">save action</button> |
    <button @click="cancelAddAction">cancel</button>

  </div>
</template>

<script>
import { useStore } from '../store/mainStore.js'
import {
  ActionGoTo,
  ActionPropertyChanges,
  ActionInterval,
  ActionRemoveAgent
} from "../classes/Action.js"


const DEFAULT_ACTION_TYPE = 'goTo'


const ACTION_TYPES = {
  'goTo': ActionGoTo,
  'change': ActionPropertyChanges,
  'interval': ActionInterval,
  'removeAgent': ActionRemoveAgent
}

export default {
  name: 'ActionCreateForm',
  setup() {
    const store = useStore()
    return { store }
  },
  data() {
    return {
      adding: false,
      itemForm: {
        actionType: '',
        actionName: '',
        agentType: '',
        agentChoiceMethod: 'nearest',
        target: '',
        pointX: '',
        pointY: '',
        duration: 0,
        destinationType: '',
        spriteSheet: '',
        propertyChanges: []
      },
      forms: {
        goTo: ['destinationType', 'agentType', 'agentChoiceMethod', 'target'],
        change: ['propertyChanges'],
        interval: ['duration'],
        removeAgent: ['agentType', 'agentChoiceMethod', 'target']
      }
    }
  },
  methods: {
    createAction: function () {
      const actionType = this.itemForm.actionType

      const args = {
        id: this.store.actions.length + 1,
        actionName: this.itemForm.actionName,
        actionType: actionType,
      }

      // use config arguments specific to each action type
      const formArgs = this.forms[actionType]
      formArgs.forEach(key => {
        args[key] = this.itemForm[key]
      })

      if (this.itemForm.spriteSheet !== null) args.spriteSheet = this.itemForm.spriteSheet

      if (actionType === 'goTo') {
        if (this.itemForm.destinationType === 'point') {
          args.target = {
            name: `point: {x: ${this.itemForm.pointX}, y: ${this.itemForm.pointY}}`,
            width: 10,
            height: 10,
            position: {
              x: this.itemForm.pointX,
              y: this.itemForm.pointY
            }
          }
        }
        if (this.itemForm.target === 'home') args.destination = this.store.selectedAgent.home
      }

      let actionClass = ACTION_TYPES[actionType]
      let newAction = new actionClass(null, args)
      this.store.actions.push(newAction)

      this.resetActionForms()

    },
    resetActionForms: function () {
      // reset common form data/settings
      this.adding = false
      this.itemForm.actionName = ''
      this.itemForm.actionType = DEFAULT_ACTION_TYPE
      this.itemForm.target = ''
    },
    cancelAddAction: function () {
      this.resetActionForms()
    },
  }
}

</script>