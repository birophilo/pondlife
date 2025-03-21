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
          <label for="specific">specific</label>
          <input
            type="radio"
            v-model="itemForm.agentChoiceMethod"
            name="agentChoiceMethod"
            value="random"
          />
          <label for="random">random</label>
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

        <form name="pointRadioSelect">
          <input
            type="radio"
            v-model="itemForm.pointType"
            name="pointType"
            value="defined"
          />
          <label for="defined">defined</label>
          <input
            type="radio"
            v-model="itemForm.pointType"
            name="pointType"
            value="custom"
          />
          <label for="custom">custom</label>
        </form>

        <div v-if="itemForm.pointType === 'defined'">
          <select v-model="itemForm.definedPoint">
            <option value="">--- select point ---</option>
            <option value="spawnPoint">agent spawn point</option>
          </select>
        </div>

        <div v-if="itemForm.pointType === 'custom'">click to enable cursor select:
          <button
            class="selection-mode-button"
            @click="store.selectionMode = !store.selectionMode"
            :style="{backgroundColor: store.selectionMode ? 'grey' : 'white'}"
          >x</button>
        </div>
        <div v-if="itemForm.pointType === 'custom'">
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

      <form name="pointRadioSelect">
        <input
          type="radio"
          v-model="itemForm.intervalType"
          name="intervalType"
          value="frames"
        />
        <label for="frames">frames</label>
        <input
          type="radio"
          v-model="itemForm.intervalType"
          name="intervalType"
          value="untilNextInterval"
        />
        <label for="untilNextInterval">untilNextInterval</label>
      </form>

      <div v-if="itemForm.intervalType === 'frames'">
        frames duration: <input
          type="number"
          v-model="itemForm.duration"
          placeholder="0"
        />
      </div>

      <input type="text" v-model="itemForm.spriteSheet" placeholder="sprite sheet" />
    </div>

    <div v-if="itemForm.actionType === 'removeAgent'">

      <select v-model="itemForm.agentType">
        <option value="">-- agent type --</option>
        <option value="self">self</option>
        <option value="currentTarget">current target</option>
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
        <label for="specific">specific</label>
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
            v-for="agent in store.agentItems[itemForm.agentType.name]"
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
      <br />

      Create at position:
      <div>
        <input
          type="radio"
          v-model="itemForm.spawnAgentPlacement"
          value="selfPosition"
        >
        <label for="selfPosition">position of triggering agent</label>
        <br />
        <input
          type="radio"
          v-model="itemForm.spawnAgentPlacement"
          value="specific"
        >
        <label for="specific">specific point</label>
      </div>

      <div v-if="itemForm.spawnAgentPlacement === 'specific'">

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

    const spawnAgentPlacement = ref("specific")

    const itemForm = ref({
      actionType: '',
      actionName: '',
      agentType: '',
      agentChoiceMethod: 'nearest',
      target: {},
      duration: 0,
      destinationType: '',
      // 'defined' for named points; 'custom' for nominal user-selected XY point
      pointType: 'custom',
      // can have multiple defined named XY positions here, but only 'spawnPoint' for now
      definedPoint: '',
      spriteSheet: '',
      propertyChanges: [],
      spawnAgentPlacement: 'specific',
      intervalType: 'frames'
    })

    const forms = ref({
      goTo: ['destinationType', 'agentType', 'agentChoiceMethod', 'target', 'pointType', 'definedPoint'],
      change: ['propertyChanges'],
      interval: ['duration', 'intervalType', 'spriteSheet'],
      spawnAgent: ['agentType', 'target', 'spawnAgentPlacement'],
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
          if (itemForm.value.pointType === 'custom') {
            const pointX = Number(store.selectedPoint.x)
            const pointY = Number(store.selectedPoint.y)
            data.target = {
              name: `point: {x: ${pointX}, y: ${pointY}}`,
              width: 10,
              height: 10,
              position: {x: pointX, y: pointY}
            }
          } else if (itemForm.value.pointType === 'defined' && itemForm.value.definedPoint === 'spawnPoint') {
            itemForm.value.pointType = 'defined'
            data.target = {name: 'spawnPoint'}
          }
        }
      }

      if (actionType === 'spawnAgent') {
        const pointX = Number(store.selectedPoint.x)
        const pointY = Number(store.selectedPoint.y)
        data.position = {x: pointX, y: pointY}
      }

      let actionFunction = CREATE_ACTION_FUNCTIONS[actionType]

      let newAction = actionFunction(null, data)

      const newItem = await api.createAction(newAction)
      newAction.id = newItem.id

      store.actions.push(newAction)

      await store.saveScene()

      resetForm()
    }

    const resetForm = () => {
      isAdding.value = false
      itemForm.value.actionName = ''
      itemForm.value.actionType = DEFAULT_ACTION_TYPE
      itemForm.value.target = {}
      itemForm.value.spriteSheet = ''
      itemForm.value.pointType = 'custom'
      itemForm.value.intervalType = 'frames'
    }

    const cancelAddAction = () => {
      store.selectedPoint = {x: null, y: null}
      resetForm()
    }

    return {
      store,
      isAdding,
      spawnAgentPlacement,
      itemForm,
      forms,
      createAction,
      resetForm,
      cancelAddAction
    }
  }
}

</script>