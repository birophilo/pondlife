<template>
  <!-- ACTIONS CREATE -->
  <div v-if="isAdding === false" class="add-container">
    <button @click="isAdding = true">new action</button>
  </div>
  <div v-else>
    <input v-model="itemForm.actionName" type="text" placeholder="name" />
    <br />

    <select v-model="itemForm.actionType">
      <!-- World agent cannot travel, only change properties and pause for intervals -->
      <option value="">-- action type --</option>
      <!-- <option v-if="store.selectedAgent.agentType !== 'world'" value="goTo">go to</option> -->
      <option value="goTo">go to</option>
      <option value="change">change</option>
      <option value="interval">wait</option>
      <option value="spawnAgent">spawn agent</option>
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
          <option
            v-for="[agentType, obj] in Object.entries(store.agentTypes)"
            :value="obj">{{ agentType }}
          </option>
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
            <option :value="{}">-- select agent --</option>
            <option
              v-for="agent in store.agentItems[itemForm.agentType.name]"
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
            v-model="store.selectedPoint.x"
            type="text"
            :placeholder="store.mouse.x"
          />
          <br />
          y:
          <input
            v-model="store.selectedPoint.y"
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
      <input type="text" v-model="itemForm.spriteSheet" placeholder="sprite sheet" />
    </div>

    <div v-if="itemForm.actionType === 'removeAgent'">

      <select v-model="itemForm.agentType">
        <option value="">-- agent type --</option>
        <option
            v-for="[agentType, obj] in Object.entries(store.agentTypes)"
            :value="obj">{{ agentType }}
        </option>
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
          <option :value="{}">-- select agent --</option>
          <option
            v-for="agent in store.agentItems[itemForm.agentType]"
            :value="agent"
          >
            {{ agent.name }}
          </option>
        </select>
      </div>

    </div>

    <div v-if="itemForm.actionType === 'spawnAgent'">

      <select v-model="itemForm.agentType">
        <option value="">-- agent type --</option>
        <option
            v-for="[agentType, obj] in Object.entries(store.agentTypes)"
            :value="obj">{{ agentType }}
        </option>
      </select>

      <div>Select point:
        <button
          class="selection-mode-button"
          @click="store.selectionMode = !store.selectionMode"
          :style="{backgroundColor: store.selectionMode ? 'grey' : 'white'}"
        >x</button>
        <span v-if="store.selectionMode === true">x: {{ store.mouse.x }}, y: {{ store.mouse.y }}</span><br />
        x:
        <input
          v-model="store.selectedPoint.x"
          type="text"
          :placeholder="store.mouse.x"
        />
        <br />
        y:
        <input
          v-model="store.selectedPoint.y"
          type="text"
          :placeholder="store.mouse.y"
          value=""
        />
        <br />
      </div>

    </div>

    <button @click="createAction">save action</button> |
    <button @click="cancelAddAction">cancel</button>

  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from '../store/mainStore.js'
import api from '../apiCrud.js'
import {
  createActionGoTo,
  createActionPropertyChanges,
  createActionInterval,
  createActionSpawnAgent,
  createActionRemoveAgent
} from "../classes/Action.js"


const DEFAULT_ACTION_TYPE = 'goTo'


const CREATE_ACTION_FUNCTIONS = {
  'goTo': createActionGoTo,
  'change': createActionPropertyChanges,
  'interval': createActionInterval,
  'spawnAgent': createActionSpawnAgent,
  'removeAgent': createActionRemoveAgent
}

export default {
  name: 'ActionCreateForm',
  setup() {
    const store = useStore()

    const isAdding = ref(false)

    const itemForm = ref({
      actionType: '',
      actionName: '',
      agentType: '',
      agentChoiceMethod: 'nearest',
      target: {},
      duration: 0,
      destinationType: '',
      spriteSheet: '',
      propertyChanges: []
    })

    const forms = ref({
      goTo: ['destinationType', 'agentType', 'agentChoiceMethod', 'target'],
      change: ['propertyChanges'],
      interval: ['duration', 'spriteSheet'],
      spawnAgent: ['agentType', 'target'],
      removeAgent: ['agentType', 'agentChoiceMethod', 'target']
    })

    const createAction = async () => {
      const actionType = itemForm.value.actionType

      const data = {
        actionName: itemForm.value.actionName,
        actionType: actionType
      }

      // use config arguments specific to each action type
      const formArgs = forms.value[actionType]
      formArgs.forEach(key => {data[key] = itemForm.value[key]})

      if (itemForm.value.spriteSheet !== '') data.spriteSheet = itemForm.value.spriteSheet

      if (actionType === 'goTo') {
        if (itemForm.value.destinationType === 'point') {
          const pointX = Number(store.selectedPoint.x)
          const pointY = Number(store.selectedPoint.y)
          data.target = {
            name: `point: {x: ${pointX}, y: ${pointY}}`,
            width: 10,
            height: 10,
            position: {x: pointX, y: pointY}
          }
        }
        if (itemForm.value.target === 'home') data.destination = store.selectedAgent.home
      }

      if (actionType === 'spawnAgent') {
        const pointX = Number(store.selectedPoint.x)
        const pointY = Number(store.selectedPoint.y)
        data.position = {x: pointX, y: pointY}
      }

      let actionFunction = CREATE_ACTION_FUNCTIONS[actionType]

      let newAction = actionFunction(null, data)

      const newId = await api.createAction(newAction)
      newAction.id = newId

      store.actions.push(newAction)

      resetForm()
    }

    const resetForm = () => {
      isAdding.value = false
      itemForm.value.actionName = ''
      itemForm.value.actionType = DEFAULT_ACTION_TYPE
      itemForm.value.target = {}
      itemForm.value.spriteSheet = ''
    }

    const cancelAddAction = () => {
      store.selectedPoint = {x: null, y: null}
      resetForm()
    }

    return {
      store,
      isAdding,
      itemForm,
      forms,
      createAction,
      resetForm,
      cancelAddAction
    }
  }
}

</script>