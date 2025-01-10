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
          <button @click="deleteItem(action.actionName)">delete</button>
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
      <div v-if="isEditing === true">
        <div>interval (frames): <input v-model="itemForm.duration" type="number" /></div>
        <div>spritesheet: <input v-model="itemForm.spriteSheet" type="text" /></div>
      </div>
      <div v-else>
        <div>action type: {{ action.actionType }}</div>
        <div>interval (frames): <input :value="action.args.duration" type="number" disabled /></div>
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
import { ref, computed } from 'vue'
import { useStore } from '../store/mainStore.js'
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
        destinationType: props.action.args.destinationType,
        agentType: props.action.args.agentType,
        agentChoiceMethod: props.action.args.agentChoiceMethod,
        propertyChanges: props.action.propertyChanges,
        transitions: props.action.transitions,
        duration: props.action.args.duration,
        target: props.action.args.target,
        spriteSheet: props.action.args.spriteSheet
      }

      if (props.action.actionType === 'spawnAgent') {
        itemForm.value.position = props.action.position
      }

      if (props.action.actionType === 'interval') {
        itemForm.value.spriteSheet = props.action.args.spriteSheet
      }
    }

    const saveItem = () => {
      isEditing.value = false

      const act = store.actions.find(a => a.actionName === props.action.actionName)

      act.actionName = itemForm.value.actionName
      act.actionType = itemForm.value.actionType

      act.args.duration = itemForm.value.duration
      act.args.destinationType = itemForm.value.destinationType
      act.args.agentType = itemForm.value.agentType
      act.args.target = itemForm.value.target
      act.args.spriteSheet = itemForm.value.spriteSheet

      act.agentChoiceMethod = itemForm.value.agentChoiceMethod
      act.propertyChanges = itemForm.value.propertyChanges
      act.transitions = itemForm.value.transitions

      if (props.action.actionType === 'spawnAgent') {
        act.args.position = {x: Number(store.selectedPoint.x), y: Number(store.selectedPoint.y)}
      } else if (props.action.actionType === 'goTo') {
        act.args.target.position = {x: Number(store.selectedPoint.x), y: Number(store.selectedPoint.y)}
      } else if (props.action.actionType === 'interval') {
        act.args.spriteSheet = itemForm.value.spriteSheet
      }
      store.selectedPoint = {x: null, y: null}

      store.updateAction(act)
    }

    const deleteItem = (itemName) => {
      store.actions = store.actions.filter(item => item.actionName !== itemName)
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
      positionPointY
    }
  }
}

</script>