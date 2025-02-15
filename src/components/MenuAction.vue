<template>
  <div>
    <div class="created-item-header">
      <div class="menu-action-name">
        <div v-if="isEditing === true">
          <input v-model="itemForm.actionName" type="text" />
        </div>
        <div v-else>
          {{ action.actionName }}
        </div>
      </div>
      <div v-if="isEditing === true">
        <button @click="saveItem">save</button>
        <button @click="cancelEdit">cancel</button>
      </div>
      <div v-else>
        <div>
          <button @click="editItem">edit</button>
          <button @click="deleteItem(action.id)">delete</button>
        </div>
      </div>
    </div>

    <!-- GOTO ACTION EDIT FORM -->
    <div v-if="action.actionType === 'goTo'">
      <div v-if="isEditing === true">
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

          <form name="pointRadioSelect">
            <input
              @click="handleDefinedPointClick"
              type="radio"
              v-model="itemForm.pointType"
              name="pointType"
              value="defined"
              checked="true"
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

          <div v-if="itemForm.pointType === 'custom'">
            Select point:
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
      </div>

      <div v-else>
        <div>action type: {{ action.actionType }}</div>
      </div>
    </div>

    <!-- (ACTION) PROPERTY CHANGE ITEM EDIT FORM -->
    <div v-if="action.actionType === 'change'">
      <div v-for="(propertyChangeId, index) in action.propertyChanges">
        <MenuActionPropertyChange
          :action="action"
          :propertyChangeId="propertyChangeId"
          :index="index"
        />
      </div>
      <ActionPropertyChangeForm :action="action"/>
    </div>

    <!-- INTERVAL EDIT FORM -->
    <div v-if="action.actionType === 'interval'">
      <div v-if="isEditing === true">
        <div>interval (frames): <input v-model="itemForm.duration" type="number" /></div>
        <div>spritesheet: <input v-model="itemForm.spriteSheet" type="text" /></div>
      </div>
      <div v-else>
        <div>action type: {{ action.actionType }}</div>
        <div>interval (frames): <input :value="action.duration" type="number" disabled /></div>
      </div>
    </div>

    <div v-if="itemForm.actionType === 'removeAgent'">

      <div v-if="isEditing === true">

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
              v-for="agent in store.agentItems[itemForm.agentType.name]"
              :value="agent"
            >
              {{ agent.name }}
            </option>
          </select>
        </div>

      </div>

      <!-- <div v-else>
        <div>action type: {{ action.actionType }}</div>
        <div>interval (frames): <input :value="action.duration" type="number" disabled /></div>
      </div> -->

    </div>

    <div v-if="action.actionType === 'spawnAgent'">
      <div v-if="isEditing === true">
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
    </div>

    <h4>Action transitions</h4>
    <CreateActionTransitionForm :action="action" />
    <!-- ACTION TRANSITIONS -->
    <MenuActionTransition :action="action" />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from '../store/mainStore.js'
import api from '../apiCrud.js'
import ActionPropertyChangeForm from './ActionPropertyChangeForm.vue'
import MenuActionPropertyChange from './MenuActionPropertyChange.vue'
import MenuActionTransition from './MenuActionTransition.vue'
import CreateActionTransitionForm from './CreateActionTransitionForm.vue'

export default {
  name: 'MenuAction',
  components: {    
    ActionPropertyChangeForm,
    MenuActionPropertyChange,
    CreateActionTransitionForm,
    MenuActionTransition
  },
  props: {
    action: Object
  },
  setup: function (props) {
    const store = useStore()

    const isEditing = ref(false)
    const itemForm = ref({})

    const populateItemForm = () => {
      itemForm.value = {
        actionName: props.action.actionName,
        actionType: props.action.actionType,
        destinationType: props.action.destinationType,
        agentType: props.action.agentType,
        agentChoiceMethod: props.action.agentChoiceMethod,
        propertyChanges: props.action.propertyChanges,
        transitions: props.action.transitions,
        duration: props.action.duration,
        target: props.action.target,
        spriteSheet: props.action.spriteSheet,
        pointType: props.action.pointType,
        definedPoint: props.action.definedPoint
      }

      if (props.action.actionType === 'spawnAgent') {
        itemForm.value.position = props.action.position
      }

      if (props.action.actionType === 'interval') {
        itemForm.value.spriteSheet = props.action.spriteSheet
      }
    }

    const saveItem = () => {
      isEditing.value = false

      const act = store.actions.find(a => a.actionName === props.action.actionName)

      act.actionName = itemForm.value.actionName
      act.actionType = itemForm.value.actionType

      act.duration = itemForm.value.duration
      act.destinationType = itemForm.value.destinationType
      act.agentType = itemForm.value.agentType
      act.target = itemForm.value.target
      act.spriteSheet = itemForm.value.spriteSheet

      act.agentChoiceMethod = itemForm.value.agentChoiceMethod
      act.propertyChanges = itemForm.value.propertyChanges
      act.transitions = itemForm.value.transitions

      if (props.action.actionType === 'spawnAgent') {
        act.position = {x: Number(store.selectedPoint.x), y: Number(store.selectedPoint.y)}
      } else if (props.action.actionType === 'goTo') {
        // act.target.position = {x: Number(store.selectedPoint.x), y: Number(store.selectedPoint.y)}
        if (itemForm.value.pointType === 'custom') {
          act.pointType = itemForm.value.pointType
          act.target.position = {x: Number(store.selectedPoint.x), y: Number(store.selectedPoint.y)}
        } else if (itemForm.value.pointType === 'defined') {
          act.pointType = itemForm.value.pointType
          act.definedPoint = itemForm.value.definedPoint
        }
      } else if (props.action.actionType === 'interval') {
        act.spriteSheet = itemForm.value.spriteSheet
      }

      if (act.pointType !== 'defined') {delete act.definedPoint}

      store.selectedPoint = {x: null, y: null}

      api.updateAction(act)
    }

    const deleteItem = (itemId) => {
      api.deleteAction(itemId)
      store.actions = store.actions.filter(item => item.id !== itemId)
    }

    const editItem = () => {
      populateItemForm()
      isEditing.value = true
    }

    const cancelEdit = () => {
      store.selectedPoint = {x: null, y: null}
      isEditing.value = false
      itemForm.value = {}
    }

    const handleDefinedPointClick = () => {
      itemForm.value.definedPoint = ''
    }

    const targetPointX = computed(() => {
      return store.selectedPoint.x !== null ? store.selectedPoint.x : itemForm.value.target.position.x
    })

    const targetPointY = computed(() => {
      return store.selectedPoint.y !== null ? store.selectedPoint.y : itemForm.value.target.position.y
    })

    const positionPointX = computed(() => {
      return store.selectedPoint.x !== null ? store.selectedPoint.x : itemForm.value.position.x
    })

    const positionPointY = computed(() => {
      return store.selectedPoint.y !== null ? store.selectedPoint.y : itemForm.value.position.y
    })

    return {
      store,
      isEditing,
      itemForm,
      populateItemForm,
      saveItem,
      deleteItem,
      editItem,
      cancelEdit,
      targetPointX,
      targetPointY,
      positionPointX,
      positionPointY,
      handleDefinedPointClick
    }
  }
}

</script>