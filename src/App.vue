<template>
<div id="container">

  <div class="canvas-container">
    <canvas></canvas>
  </div>

  <div class="info-container">

    <div>{{ store.myData }}</div>
    <button @click="store.myData = 'goodbye'">change store</button>

    <div class="menu-section" id="agent-types-section">
      <h3 class="menu-section-heading">Selected Agent</h3>
      <div v-if="store.selectedAgent !== null">
        {{ store.selectedAgent.name }}<br/>
        current action: {{ store.selectedAgent.currentStateName }}
      </div>
      <div v-else>none</div>
    </div>

    <div class="menu-section" id="agent-types-section">
      <h3 class="menu-section-heading">Agent Types</h3>

      <!-- EDIT AGENT TYPE -->
      <div v-for="(agentType) in store.agentTypes">
        <div v-if="agentType.name !== 'world'">
          <div v-if="agentType.editing === true">
            name: <input v-model="agentType.name" type="text" placeholder="name" /><br />
            width: <input v-model="agentType.config.width" type="number" placeholder="width" /><br />
            height: <input v-model="agentType.config.height" type="number" placeholder="height" /><br />
            movement speed: <input v-model="agentType.config.nominalSpeed" type="number" placeholder="1" /><br />
            spriteMap:
            <select v-model="agentType.config.spriteMap">
              <option value="">-- select sprite map --</option>
              <option :value="spriteMap" v-for="spriteMap in store.spriteMaps">{{ spriteMap.name }}</option>
            </select>
            <br />
            thumbnail: {{ agentType.config.thumbnail }}<br />
            <input type="file" placeholder="thumbnail" @change="updateThumbnailFileInput($event, agentType.config)" /><br />
            <button @click="agentType.editing = false; $forceUpdate()">save</button>
            <button @click="agentType.editing = false; $forceUpdate()">cancel</button>
          </div>
          <div v-else>
            {{ agentType.name }}
            <button @click="agentType.editing = true; $forceUpdate()">edit</button>
            <button @click="deleteAgentType(agentType.name)">delete</button>
          </div>
        </div>
      </div>

      <!-- CREATE AGENT TYPE -->
      <div v-if="agentTypeForm.adding === true">
        name: <input v-model="agentTypeForm.name" type="text" placeholder="name" /><br />
        width: <input v-model="agentTypeForm.width" type="number" placeholder="width" /><br />
        height: <input v-model="agentTypeForm.height" type="number" placeholder="height" /><br />
        movement speed: <input v-model="agentTypeForm.nominalSpeed" type="number" placeholder="1" /><br />
        spriteMap:
        <select v-model="agentTypeForm.spriteMap">
          <option value="">-- select sprite map --</option>
          <option :value="spriteMap" v-for="spriteMap in store.spriteMaps">{{ spriteMap.name }}</option>
        </select><br />
        thumbnail: {{ agentTypeForm.thumbnail }}<br />
        <input type="file" placeholder="thumbnail" @change="updateThumbnailFileInput($event, agentTypeForm)" /><br />
        <button @click="createAgentType()">create agent type</button>
        <button @click="agentTypeForm.adding = false">cancel</button>
      </div>
      <div v-else><button @click="agentTypeForm.adding = true">new agent type</button></div>

    </div>

    <div class="menu-section" id="sprite-sheets-section">
      <h3 class="menu-section-heading">Sprite Sheets</h3>
      <div v-for="(spriteSheet, index) in store.spriteSheets">
        <MenuSpriteSheet :spriteSheet="spriteSheet" :i="index" />
      </div>
      <SpriteSheetForm />
    </div>

    <div class="menu-section" id="sprite-maps-section">
      <h3 class="menu-section-heading">Sprite Maps</h3>
      <div v-for="(spriteMap, index) in store.spriteMaps">
        <MenuSpriteMap :spriteMap="spriteMap" :i="index" />
      </div>
      <SpriteMapForm />
    </div>


    <div class="menu-section" id="properties-section">
      <h3 class="menu-section-heading">Properties</h3>
      <!-- PROPERTY LIST -->
      <div v-if="store.selectedAgent !== null" class="item-list">
        <div v-for="property in Object.keys(store.selectedAgent.stateData)">
          <div v-if="property.editing === true">
            <input type="text" placeholder="name" :value="property" disabled />
            <input v-model="store.selectedAgent.stateData[property]" type="number" />
            <button @click="delete store.selectedAgent.stateData[property]">delete</button>
            <br/>
          </div>
          <div v-else>
            <input type="text" placeholder="name" :value="item.name" disabled />:
            <input type="text" placeholder="value" :value="item.value" disabled /> -
            <button @click="item.editing = true">edit</button> |
            <button @click="deleteProperty(item.name)">delete</button>
          </div>
        </div>

        <!-- ADD PROPERTY -->
        <div v-if="propertiesSection.adding.status === false" class="add-container">
          <button @click="propertiesSection.adding.status = true">new property +</button>
        </div>
        <div v-else>
          <input v-model="propertiesSection.adding.newPropertyName" type="text" placeholder="name" />
          <input v-model="propertiesSection.adding.newPropertyValue" type="number" placeholder="0" />
          <button @click="createAgentProperty">add</button> |
          <button @click="cancelSetAgentProperty">cancel</button>
        </div>
      </div>

      <div class="item-list">
        <h3 class="menu-section-heading">Choose action</h3>
        <div v-for="action in store.actions">
          <button @click="cloneAction(action)">{{ action.actionName }}</button>
        </div>
      </div>

    </div>


    <!-- ACTIONS -->

    <div class="menu-section" id="actions-section">
      <h3 class="menu-section-heading">Actions</h3>

      <!-- ACTION LIST -->
      <div class="item-list">
        <div v-for="action in store.actions" class="created-item">

          <div class="created-item-header">
            <div class="menu-action-name">{{ action.actionName }}</div>
            <div v-if="action.editing">
              <button @click="action.editing = false">save</button>
              <button @click="action.editing = false">cancel</button>
            </div>
            <div v-else>
              <div v-if="action.actionType === 'change'">
                <button @click="deleteAction(action.actionName)">delete action</button>
              </div>
              <div v-else>
                <button @click="action.editing = true">edit</button>
                <button @click="deleteAction(action.actionName)">delete</button>
              </div>

            </div>
          </div>

          <!-- GOTO ACTION EDIT FORM -->
          <div v-if="action.actionType === 'goTo'">
            <div v-if="action.editing === true">
              <!-- removed until can cleanly change action type -->
              <!-- <select v-model="action.actionType">
                <option value="goTo">go to</option>
                <option value="change">change</option>
                <option value="interval">wait</option>
              </select> -->

              <select v-model="action.args.destinationType">
                <option>-- select agent or point --</option>
                <option value="agent">agent</option>
                <option value="point">point</option>
              </select>

              <select v-model="action.args.agentType">
                <option value="">-- agent type --</option>
                <option v-for="agentType in store.agentTypes" :value="agentType.name">{{ agentType.name }}</option>
              </select>

              <form name="agentRadioSelect">
                <input
                  type="radio"
                  v-model="action.args.agentChoiceMethod"
                  name="agentChoiceMethod"
                  value="nearest"
                  checked="true"
                />
                <label for="nearest">nearest</label>
                <input
                  type="radio"
                  v-model="action.args.agentChoiceMethod"
                  name="agentChoiceMethod"
                  value="specific"
                />
                <label for="nearest">specific</label>
              </form>

              <div v-if="action.args.agentChoiceMethod === 'specific'">
                <select v-model="action.args.target">
                  <option value="">-- select agent --</option>
                  <option
                    v-for="agent in store.agentItems[action.args.agentType]"
                    :value="agent"
                  >
                    {{ agent.name }}
                  </option>
                </select>
              </div>

            </div>
            <div v-else>
              <div>action type: {{ action.actionType }}</div>
              <input v-model="action.args.agentType" type="text" placeholder="target" disabled />
            </div>
          </div>

          <!-- (ACTION) PROPERTY CHANGE ITEM EDIT FORM -->
          <div v-if="action.actionType === 'change'">
            <div v-for="(propertyChange, index) in action.propertyChanges">
              <div v-if="propertyChange.editing === true">
                <select v-model="propertyChange.agent">
                  <option value="self">self</option>
                  <option v-for="agent in store.agentTypes" :value="agent.config.name">{{ agent.config.name }}</option>
                </select>

                <form name="agentPropChangeRadioSelect">
                  <input
                    type="radio"
                    v-model="propertyChange.args.agentChoiceMethod"
                    name="agentChoiceMethod"
                    value="nearest"
                    checked="true"
                  />
                  <label for="nearest">nearest</label>
                  <input
                    type="radio"
                    v-model="propertyChange.args.agentChoiceMethod"
                    name="agentChoiceMethod"
                    value="specific"
                  />
                  <label for="specific">specific</label>
                  <input
                    type="radio"
                    v-model="propertyChange.args.agentChoiceMethod"
                    name="agentChoiceMethod"
                    value="all"
                  />
                  <label for="all">all</label>
                </form>

                <select v-model="propertyChange.propertyName">
                  <option value="money">money</option>
                </select>
                <select v-model="propertyChange.changeType">
                  <option value="increase">increase</option>
                  <option value="decrease">decrease</option>
                </select>
                <input
                  v-model="propertyChange.propertyValue"
                  type="number"
                  placeholder="value"
                />
                <button @click="propertyChange.editing = false">save</button>
                <button @click="propertyChange.editing = false">cancel</button>
              </div>
              <div v-else>
                <div>change {{ index + 1 }}:</div>
                <input type="text" placeholder="property" :value="propertyChange.propertyName" disabled />
                <input type="text" placeholder="change" :value="propertyChange.changeType" disabled />
                <input type="number" placeholder="value" :value="propertyChange.propertyValue" disabled />
                <button @click="propertyChange.editing = true">edit item</button>
                <button @click="action.propertyChanges.splice(index, 1); action.adding = true">delete item</button>
              </div>
            </div>

            <!-- (ACTION) PROPERTY CHANGE ITEM CREATE FORM -->
            <div v-if="propertyChangeForm.adding === true">
                <select v-model="propertyChangeForm.agentType">
                  <option value="">-- agent --</option>
                  <option value="self">self</option>
                  <option v-for="agent in store.agentTypes" :value="agent.config.name">{{ agent.config.name }}</option>
                  <option value="lemonadeStall">lemonade stall</option>
                </select>

                <form name="agentPropChangeRadioCreate">
                  <input
                    type="radio"
                    v-model="propertyChangeForm.agentChoiceMethod"
                    name="agentChoiceMethod"
                    value="nearest"
                    checked="true"
                  />
                  <label for="nearest">nearest</label>
                  <input
                    type="radio"
                    v-model="propertyChangeForm.agentChoiceMethod"
                    name="agentChoiceMethod"
                    value="specific"
                  />
                  <label for="specific">specific</label>
                  <input
                    type="radio"
                    v-model="propertyChangeForm.agentChoiceMethod"
                    name="agentChoiceMethod"
                    value="all"
                  />
                  <label for="all">all</label>
                </form>

                <div v-if="propertyChangeForm.agentChoiceMethod === 'specific'">
                  <select v-model="propertyChangeForm.target">
                    <option value="">-- select agent --</option>
                    <option
                      v-for="agent in store.agentItems[propertyChangeForm.agentType]"
                      :value="agent"
                    >
                      {{ agent.name }}
                    </option>
                  </select>
                </div>

                <select v-model="propertyChangeForm.property">
                  <option value="">--  property --</option>
                  <option v-for="property in Object.keys(store.selectedAgent.stateData)" :value="property">{{ property }}</option>
                </select>
                <select v-model="propertyChangeForm.change">
                  <option value="">-- change --</option>
                  <option value="increase">increase</option>
                  <option value="decrease">decrease</option>
                </select>
                <input
                  v-model="propertyChangeForm.value"
                  type="number"
                  placeholder="value"
                />
                <button @click="createPropertyChangeItem(action)">save</button>
                <button @click="propertyChangeForm.adding = false">cancel</button>
            </div>
            <div v-else>
              <button @click="propertyChangeForm.adding = true">new property change</button>
            </div>
          </div>

          <!-- INTERVAL EDIT FORM -->
          <div v-if="action.actionType === 'interval'">
            <div v-if="action.editing === true">
              <input v-model="action.duration" type="number" />
            </div>
            <div v-else>
              <div>action type: {{ action.actionType }}</div>
              <input :value="action.duration" type="number" disabled />
            </div>
          </div>

          <h4>Action transitions</h4>

          <!-- CREATE TRANSITION -->
          <div v-if="actionTransitionForm.adding === true && actionTransitionForm.action === action">
            <select v-model="actionTransitionForm.condition">
              <option v-for="condition in store.conditions" :value="condition">
                {{ condition.conditionName }}
              </option>
            </select>
            <select v-model="actionTransitionForm.nextAction">
              <option v-for="action in store.actions" :value="action">
                {{ action.actionName }}
              </option>
            </select>
            <button @click="createTransition(action)">add</button> |
            <button @click="cancelAddTransition(action)">cancel</button>
          </div>

          <!-- ACTION TRANSITIONS -->
          <div v-for="(transition, index) in action.transitions">
            <div v-if="transition.editing === true">
              <select :value="transition.condition">
                <option v-for="condition in store.conditions" :value="transition.condition">
                  {{ condition.conditionName }}
                </option>
              </select>
              <select :value="transition.nextAction">
                <option v-for="action in store.actions" :value="transition.nextAction">
                  {{ action.actionName }}
                </option>
              </select>
              <button @click="transition.editing = false">save</button>
              <button @click="transition.editing = false">cancel</button>
            </div>
            <div v-else>
              <table>
                <tr>
                  <th>if condition met</th>
                  <th>transition to</th>
                </tr>
                <tr v-for="(transition) in action.transitions">
                  <td>{{ transition.condition.conditionName }}</td>
                  <td>{{ transition.nextAction.actionName }}</td>
                </tr>
              </table>
              <br />
              <button @click="transition.editing = true">edit</button>
              <button @click="deleteTransition(action, index)">delete</button>
            </div>

          </div>

          <button @click="actionTransitionForm.adding = true; actionTransitionForm.action = action">add transition</button>

        </div>

        <ActionCreateForm />

      </div>
    </div>

    <!-- CONDITIONS -->

    <div class="menu-section" id="actions-section">
      <h3 class="menu-section-heading">Conditions</h3>

      <!-- CONDITION LIST -->
      <div class="item-list">
        <div v-for="(item, index) in store.conditions" class="created-item">
         <MenuCondition :item="item" :index="index" />
        </div>
      </div>

      <ConditionCreateForm />

    </div>

    <div class="menu-section">

      <div class="day-container">
        Day: <span id="day-number">{{ store.dayNumber }}</span>
      </div>

      <div class="speed-slide-container">
        <div><span>Speed: {{ store.GlobalSettings.globalSpeed / 100 }}</span></div>
        <input
          v-model="store.GlobalSettings.globalSpeed"
          type="range"
          min="0"
          max="200"
          value="100"
          id="sim-speed-slider"
        >
      </div>

    </div>
  </div>
</div>
</template>


<script>
import { useStore } from './store/mainStore.js'

import { pointIsInArea } from "./classes/utils.js"
import AgentType from "./classes/AgentType.js"
import { ActionTransition, PropertyChange } from "./classes/Action.js"
import Agent from "./classes/Agent.js"
import { AgentMenu, AgentMenuIcon, DeleteButton, AgentPreview } from "./classes/SelectionMenu.js"

import ActionCreateForm from './components/ActionCreateForm.vue'
import ConditionCreateForm from './components/ConditionCreateForm.vue'
import MenuCondition from './components/MenuCondition.vue'
import SpriteSheetForm from './components/SpriteSheetForm.vue'
import MenuSpriteSheet from './components/MenuSpriteSheet.vue'
import SpriteMapForm from './components/SpriteMapForm.vue'
import MenuSpriteMap from './components/MenuSpriteMap.vue'


let canvas;
let c;  // canvas context

const backgroundColor = 'rgb(200, 200, 200)'

let dayLength = 1000 // frames

// const customerData = [{x: 0, y: 0}, {x: 900, y: 400}]
// const supplyVanData = [{x: 800, y: 800}]

const agentMenuButtonData = ['customer', 'lemonadeStall', 'supplyVan']

const initialAgentData = {
  lemonadeStall: [{x: 400, y: 200}, {x: 700, y: 100}],
  customer: [{x: 900, y: 400}],
  supplyVan: [],
  world: [{x: 20, y: 20}]
}

const agentTypesData = [
  {
    name: 'customer',
    width: 30,
    height: 40,
    offset: {x: 96, y: 46},
    scale: 0.7,
    nominalSpeed: 0.02,
    previewImage: '/img/thumbnails/customer-thumbnail.png',
    spriteMap: null,
    thumbnail: '/img/thumbnails/customer-thumbnail.png'
  },
  {
    name: 'lemonadeStall',
    width: 130,
    height: 104,
    offset: {x: 0, y: 0},
    scale: 1,
    nominalSpeed: 0.02,
    previewImage: '/img/sprites/stall-1.png',
    spriteMap: null,
    thumbnail: '/img/thumbnails/lemonade-stall-thumbnail.png'
  },
  {
    name: 'supplyVan',
    width: 50,
    height: 50,
    offset: {x: 2, y: 0},
    scale: 2.5,
    nominalSpeed: 0.02,
    previewImage: '/img/sprites/SupplyVan_Right.png',
    spriteMap: null,
    thumbnail: '/img/thumbnails/supply-van-thumbnail.png'
  },
  {
    name: 'world',
    width: 25,
    height: 25,
    offset: {x: 0, y: 0},
    scale: 1,
    nominalSpeed: 0.02,
    previewImage: '/img/thumbnails/world-thumbnail.png',
    spriteMap: null,
    thumbnail: ''
  }
]


export default {
  name: 'App',
  setup() {
    const store = useStore()
    return { store }
  },
  components: {
    ActionCreateForm,
    ConditionCreateForm,
    MenuCondition,
    MenuSpriteSheet,
    SpriteSheetForm,
    MenuSpriteMap,
    SpriteMapForm
  },
  data: function () {
    return {

    spriteMapsData: JSON.parse(localStorage.getItem('pondlifeSpriteMaps')),
    spriteSheetsData: JSON.parse(localStorage.getItem('pondlifeSpriteSheets')),

    agentTypeForm: {
      adding: false,
      name: '',
      height: 50,
      width: 50,
      spriteMap: '',
      thumbnail: '',
      nominalSpeed: 0.02,
      positionX: 100,
      positionY: 100
    },
    propertiesSection: {
      items: [{name: 'money', value: 200, editing: false}],
      adding: {
        status: false,
        newPropertyName: '',
        newPropertyValue: 0
      }
    },
    actionTransitionForm: {
      adding: false,
      action: null,
      condition: null,
      nextAction: null
    },
    propertyChangeForm: {
      adding: false,
      agent: '',
      agentType: '',
      agentChoiceMethod: '',
      target: '',
      property: '',
      change: '',
      value: ''
    }
  }
  },

  mounted: function () {

    canvas = document.querySelector('canvas')
    c = canvas.getContext('2d')

    canvas.width = 1000
    canvas.height = 600

    c.fillStyle = backgroundColor
    c.fillRect(0, 0, canvas.width, canvas.height)

    this.loadAgentsAndFixtures()

    this.animate()

    /* --- CLICK ACTIONS / EVENT LISTENERS --- */

    canvas.addEventListener('mousemove', (event) => {
      this.store.mouse.x = event.pageX
      this.store.mouse.y = event.pageY
    })

    canvas.addEventListener('click', (event) => {
      const point = {x: event.x, y: event.y}

      // PLACE NEW AGENT ON
      if (this.store.placingAgent) {
        const isInMenuArea = pointIsInArea(point, this.store.itemMenu.area)

        if (isInMenuArea === false) {
          const agentClassName = this.store.agentPreview.agentType.name
          this.addAgent(agentClassName)
          this.store.placingAgent = false
          this.store.agentPreview = null
        } else {
          this.store.hover = true
        }
      }

      const agentTypeNames = Object.keys(this.store.agentTypes)

      agentTypeNames.forEach(agentTypeName => this.selectOrDeleteAgent(agentTypeName, point))

      // SELECT AGENT BUTTON TO CREATE CURSOR PREVIEW (to place new agent on board)
      for (let i = 0; i < this.store.agentMenuButtons.length; i++) {

        const isInArea = pointIsInArea(point, this.store.agentMenuButtons[i].area)

        if (isInArea) this.store.hover = 'true'

        if (isInArea && !this.store.agentPreview) {
          const agentTypeName = this.store.agentMenuButtons[i].name
          this.store.agentPreview = new AgentPreview(this.store.agentTypes[agentTypeName])
          this.store.placingAgent = true
          break

        } else if (isInArea && this.store.agentPreview) {
          // if have active agent preview (tracking cursor), clicking on the agent menu again cancels the selection
          this.store.placingAgent = false
          this.store.agentPreview = null
        }
      }

      // TOGGLE DELETE MODE
      const isInArea = pointIsInArea(point, this.store.deleteButton.area)

      if (isInArea) {
        this.store.hover = true
        this.store.deleteMode = !this.store.deleteMode
      }

      // POINT/AGENT SELECTION MODE
      if (this.store.selectionMode === true) {
        this.actionsSection.adding.forms.goTo.pointX = this.store.mouse.x
        this.actionsSection.adding.forms.goTo.pointY = this.store.mouse.y
      }

    })

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && this.store.placingAgent === true) {
        this.store.placingAgent = false
        this.store.agentPreview = null
      }
    })
  },

  methods: {

    changeStoreData: function () {
      this.store.changeMyData('goodbye')
    },

    loadAgentsAndFixtures: function () {

      // load from localStorage (temporary solution while frontend-only)
      this.store.spriteMaps = this.spriteMapsData !== null ? this.spriteMapsData : []
      this.store.spriteSheets = this.spriteSheetsData !== null ? this.spriteSheetsData : []

      agentTypesData.forEach(agentType => {
        this.store.agentTypes[agentType.name] = new AgentType(agentType)
      })

      const agentTypeNames = Object.keys(this.store.agentTypes)

      // hard-coding for the moment
      this.store.agentTypes.customer.config.spriteMap = this.store.spriteMaps[0]

      // populate agents from initial data
      agentTypeNames.forEach(agentTypeName => {
        this.store.agentItems[agentTypeName] = []
        initialAgentData[agentTypeName].forEach((item, i) => {
          this.store.agentItems[agentTypeName].push( new Agent({
            agentTypeName: agentTypeName,
            position: {x: item.x, y: item.y},
            num: i + 1,
            globals: this.store.GlobalSettings,
            config: this.store.agentTypes[agentTypeName].config
          }))
        })
      })

      this.store.itemMenu = new AgentMenu()
      agentMenuButtonData.forEach((agentName, i) => {
        this.store.agentMenuButtons.push(
          new AgentMenuIcon({
            menu: this.store.itemMenu,
            i: i,
            name: agentName,
            agent: Agent,
            config: this.store.agentTypes[agentName].config
          })
        )
      })
      this.store.deleteButton = new DeleteButton({
        menu: this.store.itemMenu,
        i: this.store.agentMenuButtons.length
      })
    },

    createAgentType: function () {

      const agentTypeName = this.agentTypeForm.name

      const agentData = {
        agentClass: Agent,
        agentItems: [],
        config: {
          name: agentTypeName,
          width: Number(this.agentTypeForm.width),
          height: Number(this.agentTypeForm.height),
          frames: {max: 9, columns: 4, rows: 3, hold: 3},
          offset: {x: 96, y: 46},
          scale: 1,
          nominalSpeed: Number(this.agentTypeForm.nominalSpeed),
          previewImage: '/img/sprites/GirlSample_Walk_Down.png',
          spriteMap: this.agentTypeForm.spriteMap,
          thumbnail: this.agentTypeForm.thumbnail
        }
      }

      this.store.agentTypes[agentTypeName] = new AgentType(agentData.config)

      let newIcon = new AgentMenuIcon({
        menu: this.store.itemMenu,
        i: this.store.agentMenuButtons.length + 1,
        name: agentData.config.name,
        agent: Agent,
        config: agentData.config
      })
      this.store.agentMenuButtons.push(newIcon)

      this.agentTypeForm.adding = false
    },

    deleteAgentType: function (agentType) {
      delete this.store.agentTypes[agentType]
    },

    createAgentProperty: function () {
      const propName = this.propertiesSection.adding.newPropertyName
      const propValue = Number(this.propertiesSection.adding.newPropertyValue)
      this.store.selectedAgent.setProperty(propName, propValue)
      this.propertiesSection.adding.newPropertyName = ''
      this.propertiesSection.adding.newPropertyValue = 0
      this.propertiesSection.adding.status = false
    },
    deleteProperty: function (itemName) {
      this.propertiesSection.items = this.propertiesSection.items.filter(item => item.name !== itemName)
    },
    cancelSetAgentProperty: function () {
      this.propertiesSection.adding.status = false
      this.propertiesSection.adding.newPropertyName = ''
      this.propertiesSection.adding.newPropertyValue = 0
    },
    createPropertyChangeItem: function (action) {

      const property = this.propertyChangeForm.property
      const change = this.propertyChangeForm.change
      const value = this.propertyChangeForm.value

      const args = {
        agentType: this.propertyChangeForm.agentType,
        agentChoiceMethod: this.propertyChangeForm.agentChoiceMethod,
        target: this.propertyChangeForm.target
      }
      const propChange = new PropertyChange(
        null,
        property,
        change,
        value,
        args
      )
      action.propertyChanges.push(propChange)
      this.propertyChangeForm.adding = false
    },
    deleteAction: function (itemName) {
      this.store.actions = this.store.actions.filter(item => item.actionName !== itemName)
    },
    deleteCondition: function (index) {
      this.store.conditions.splice(index, 1)
    },
    createTransition: function (action) {
      const condition = this.actionTransitionForm.condition
      const nextAction = this.actionTransitionForm.nextAction

      const transition = new ActionTransition(condition, nextAction)
      action.transitions.push(transition)

      this.actionTransitionForm.condition = null
      this.actionTransitionForm.nextAction = null
      this.actionTransitionForm.adding = false
    },
    cancelAddTransition: function () {
      this.actionTransitionForm.condition = null
      this.actionTransitionForm.nextAction = null
      this.actionTransitionForm.adding = false
    },
    deleteTransition: function (action, transitionIndex) {
      action.transitions.splice(transitionIndex, 1)
    },
    conditionReadableFormat: function (condition) {
      const readable = `${ condition.property } ${ condition.comparison } ${ condition.value }`
      return readable
    },
    updateThumbnailFileInput: function (event, agentTypeForm) {
      const fileName = "/img/thumbnails/" + event.target.files[0].name
      agentTypeForm.thumbnail = fileName
    },

    /* ANIMATE */

    animate: function () {

      this.store.hover = null

      c.fillStyle = backgroundColor
      c.fillRect(0, 0, canvas.width, canvas.height)

      const animationId = requestAnimationFrame(this.animate)
      this.store.GlobalSettings.animationFrameId = animationId

      const agentTypeNames = Object.keys(this.store.agentItems)

      // update each agent of each agent type
      agentTypeNames.forEach(agentTypeName => {
        this.store.agentItems[agentTypeName].forEach(agent => {
          agent.update(c, {}, this.store.GlobalSettings)
          const isInArea = pointIsInArea(this.store.mouse, agent.collisionArea)
          if (isInArea) this.store.hover = true
        })
      })
      
      this.store.itemMenu.update(c, this.store.agentMenuButtons.length + 1)

      this.store.agentMenuButtons.forEach((button, i) => {
        button.update(c, i)
        const isInArea = pointIsInArea(this.store.mouse, button.area)
        if (isInArea) this.store.hover = true
      })

      if (this.store.agentPreview) this.store.agentPreview.update(c, this.store.mouse)

      if (pointIsInArea(this.store.mouse, this.store.deleteButton.area)) this.store.hover = true

      if (this.store.selectionMode === true) this.store.hover = true

      this.store.deleteButton.update(c, this.store.agentMenuButtons.length, this.store.deleteMode)

      canvas.style.cursor = this.store.hover ? 'pointer' : 'auto'

      if (animationId % dayLength === 0) this.endDay()

      if (this.store.GlobalSettings.animationFrameId % 32 === 0) {
        const customerActions = this.store.agentItems['customer'].map(cust =>
          `${cust.name}, action: ${cust.currentAction ? cust.currentAction.name : 'none'}`
        )
        console.log(JSON.stringify(customerActions, null, 2))
      }

    },

    selectOrDeleteAgent: function (agentTypeName, point) {
      const agentItems = this.store.agentItems[agentTypeName]
      agentItems.forEach((agent, i) => {
        const isInArea = pointIsInArea(point, agent.collisionArea)

        // SELECT AGENT
        if (isInArea) {
          this.store.selectedAgent = agent
          this.store.hover = true

          if (this.store.selectionMode === true) {
            this.store.selectedTargetAgent = agent
            this.actionsSection.adding.forms.goTo.target = this.store.selectedTargetAgent
          }
        }
        // DELETE AGENT (in delete mode)
        if (isInArea && this.store.deleteMode === true) {
          const agent = agentItems[i]
          agent.labelElement.remove()
          agentItems.splice(i, 1)
        }
      })
    },
    cloneAction: function (action) {
      this.store.selectedAgent.currentAction = action.clone(this.store.selectedAgent, {})
    },

    addAgent: function (agentTypeName) {
      const agentItems = this.store.agentItems[agentTypeName]
      const num = agentItems.length + 1
      agentItems.push( new Agent({
        agentType: agentTypeName,
        position: {
          x: this.store.mouse.x - this.store.agentTypes[agentTypeName].config.width / 2,
          y: this.store.mouse.y - this.store.agentTypes[agentTypeName].config.height / 2
        },
        num: num,
        globals: this.store.GlobalSettings,
        offset: this.store.agentTypes[agentTypeName].config.offset,
        scale: this.store.agentTypes[agentTypeName].config.scale,
        config: this.store.agentTypes[agentTypeName].config
      }))
    },
    endDay: function() {
      this.store.dayNumber += 1
    }
  }
}

</script>

<style>

/* @import url('https://fonts.googleapis.com/css?family=Roboto+Condensed');
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet">
 */


body {
  margin: 0;
  padding: 0;
  font-family: "Rubik", sans-serif;
  font-weight: 400;
  font-size: 16px;
  /* background-color: #f4f0e0; */
  background-color: #ebe9e1;
  /* color: #3345a4; */
  color: #e43d12;
}

canvas {
  width: 1000px;
  height: 600px;
  position: relative;
}

#container {
  display: flex;
  width: 100%;
  justify-content: left;
}

.info-container {
  border: 1px solid black;
  width: 100%;
  padding: 5px;
  height: 1200px;
}

.speed-slide-container {
  display: flex;
  flex-direction: column;
  padding: 5px;
}

.day-container {
  padding: 5px;
}

.menu-subheading,h3 {
  font-weight: 500;
  font-size: 20px;
  margin: 16px 0 16px 0;
}

.menu-section {
  padding-bottom: 20px;
  border-bottom: 1px solid #ccc;
}

.menu-action-name {
  font-size: 20px;
  padding-right: 10px;
  font-weight: 500;
}

input,select,button {
  padding: 5px 8px 5px 8px;
  margin: 4px;
  font-family: "Rubik", sans-serif;
  border-radius: 3px;
  border-width: 1px;
}

.created-item-header {
  display: flex;
  align-items: center;
}

.created-item {
  border: 1px solid grey;
  border-radius: 5px;
  padding: 5px;
  margin-bottom: 10px;
}

.selection-mode-button {
  cursor: pointer;
}

.canvas-agent-label {
  position: absolute;
  font-size: 11px;
  color: black;
  z-index: 5;
  font-family: 'Helvetica';
  font-weight: 400;
}

table, th, td {
  border: 1px solid #e43d12;
  border-collapse: collapse;
  padding: 5px;
}

</style>
