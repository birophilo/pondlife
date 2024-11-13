<template>
  <!-- ACTIONS CREATE -->
  <div v-if="actionForm.adding === false" class="add-container">
    <button @click="actionForm.adding = true">new action</button>
  </div>
  <div v-else>
    <input v-model="actionForm.name" type="text" placeholder="name" />
    <br />
    <!-- <div>
      <select v-model="actionForm.forms.goTo.agentType">
        <option value="">-- agent type --</option>
        <option v-for="agentType in store.agentTypes" :value="agentType.name">{{ agentType.name }}</option>
      </select>
    </div> -->

    <select v-model="actionForm.type">
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
    <div v-if="actionForm.type === 'goTo'">
      <select v-model="actionForm.forms.goTo.destinationType">
        <option value="">-- destination type --</option>
        <option value="agent">agent</option>
        <option value="point">point</option>
      </select>

      <div v-if="actionForm.forms.goTo.destinationType === 'agent'">
        <select v-model="actionForm.forms.goTo.agentType">
          <option value="">-- agent type --</option>
          <option v-for="agentType in store.agentTypes" :value="agentType.name">{{ agentType.name }}</option>
        </select>

        <form name="agentRadioSelect">
          <input
            type="radio"
            v-model="actionForm.forms.goTo.agentChoiceMethod"
            name="agentChoiceMethod"
            value="nearest"
            checked="true"
          />
          <label for="nearest">nearest</label>
          <input
            type="radio"
            v-model="actionForm.forms.goTo.agentChoiceMethod"
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

        <div v-if="actionForm.forms.goTo.agentChoiceMethod === 'specific'">
          <select v-model="actionForm.forms.goTo.target">
            <option value="">-- select agent --</option>
            <option
              v-for="agent in store.agentItems[actionForm.forms.goTo.agentType]"
              :value="agent"
            >
              {{ agent.name }}
            </option>
          </select>
        </div>

      </div>

      <div v-if="actionForm.forms.goTo.destinationType === 'point'">
        <div>Select point:
          <button
            class="selection-mode-button"
            @click="store.selectionMode = !store.selectionMode"
            :style="{backgroundColor: store.selectionMode ? 'grey' : 'white'}"
          >x</button>
          <br />
          x:
          <input
            v-model="actionForm.forms.goTo.pointX"
            type="text"
            :placeholder="store.mouse.x"
          />
          <br />
          y:
          <input
            v-model="actionForm.forms.goTo.pointY"
            type="text"
            :placeholder="store.mouse.y"
            value=""
          />
          <br />
        </div>
      </div>

    </div>

    <div v-if="actionForm.type === 'interval'">
      <input
        type="number"
        v-model="actionForm.forms.interval.duration"
        placeholder="0"
      />
    </div>

    <div v-if="actionForm.type === 'removeAgent'">

      <select v-model="actionForm.forms.removeAgent.agentType">
        <option value="">-- agent type --</option>
        <option v-for="agentType in store.agentTypes" :value="agentType.name">{{ agentType.name }}</option>
      </select>

      <form name="agentRadioSelect">
        <input
          type="radio"
          v-model="actionForm.forms.removeAgent.agentChoiceMethod"
          name="agentChoiceMethod"
          value="nearest"
          checked="true"
        />
        <label for="nearest">nearest</label>
        <input
          type="radio"
          v-model="actionForm.forms.removeAgent.agentChoiceMethod"
          name="agentChoiceMethod"
          value="specific"
        />
        <label for="nearest">specific</label>
        <input
          type="radio"
          v-model="actionForm.forms.removeAgent.agentChoiceMethod"
          name="agentChoiceMethod"
          value="all"
        />
        <label for="all">all</label>
      </form>

      <div v-if="actionForm.forms.removeAgent.agentChoiceMethod === 'specific'">
        <select v-model="actionForm.forms.removeAgent.target">
          <option value="">-- select agent --</option>
          <option
            v-for="agent in store.agentItems[actionForm.forms.removeAgent.agentType]"
            :value="agent"
          >
            {{ agent.name }}
          </option>
        </select>
      </div>

    </div>

    <input type="text" v-model="actionForm.spriteSheet" placeholder="sprite sheet" />

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


export default {
  name: 'ActionCreateForm',
  setup() {
    const store = useStore()
    return { store }
  },
  data() {
    return {
      actionForm: {
        adding: false,
        type: '',
        name: '',
        spriteSheet: '',
        forms: {
          goTo: {
            destinationType: '',
            agentType: '',
            agentChoiceMethod: 'nearest',
            target: '',
            pointX: '',
            pointY: ''
          },
          interval: {
            duration: 0
          },
          removeAgent: {
            agentType: '',
            agentChoiceMethod: 'nearest',
            target: ''
          }
        }
      }
    }
  },
  methods: {
    createAction: function () {
      const actionType = this.actionForm.type
      const actionName = this.actionForm.name
      const spriteSheet = this.actionForm.spriteSheet
      const data = this.actionForm.forms[actionType]

      if (actionType === 'goTo') {

        const actionTarget = data.target

        let args = {
          id: this.store.actions.length + 1,
          actionName: actionName,
          actionType: actionType,
          agentType: data.agentType,
          destinationType: data.destinationType,
          agentChoiceMethod: data.agentChoiceMethod,

          target: data.target
        }

        if (data.destinationType === 'point') {
          const selectedPointX = this.actionForm.forms.goTo.pointX
          const selectedPointY = this.actionForm.forms.goTo.pointY
          args.target = {
            name: `point: {x: ${selectedPointX}, y: ${selectedPointY}}`,
            width: 10,
            height: 10,
            position: {
              x: selectedPointX,
              y: selectedPointY
            }
          }
        }

        if (actionTarget === 'home') {
          args.destination = this.store.selectedAgent.home
        }

        if (spriteSheet !== null) args.spriteSheet = spriteSheet

        let newAction = new ActionGoTo(null, args)
        this.store.actions.push(newAction)

      }

      if (actionType === 'change') {

        const args = {
          id: this.store.actions.length + 1,
          actionName: actionName,
          actionType: actionType,
          propertyChanges: []
        }

        let newAction = new ActionPropertyChanges(null, args)
        this.store.actions.push(newAction)

      }

      if (actionType === 'interval') {

        const args = {
          id: this.store.actions.length + 1,
          actionName: actionName,
          actionType: actionType,
          duration: Number(data.duration)
        }

        if (spriteSheet !== null) args.spriteSheet = spriteSheet

        let newAction = new ActionInterval(null, args)
        this.store.actions.push(newAction)
      }

      if (actionType === 'removeAgent') {

        let args = {
          id: this.store.actions.length + 1,
          actionName: actionName,
          actionType: actionType,
          agentType: data.agentType,
          agentChoiceMethod: data.agentChoiceMethod,

          target: data.target
        }

        if (spriteSheet !== null) args.spriteSheet = spriteSheet

        let newAction = new ActionRemoveAgent(null, args)
        this.store.actions.push(newAction)

      }

      this.resetActionForms()

    },
    resetActionForms: function () {
      // reset common form data/settings
      this.actionForm.name = ''
      this.actionForm.type = DEFAULT_ACTION_TYPE
      this.actionForm.adding = false

      // reset specific settings (hard-coded keys for now)
      this.actionForm.forms.goTo.target = ''
    },
    cancelAddAction: function () {
      this.resetActionForms()
    },
  }



}

</script>