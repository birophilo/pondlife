<template>
  <!-- <div class="container">Utility</div> -->
  <div class="properties">
    <div>Hunger: {{ Math.round(hunger) }}</div>
    <div>Thirst: {{ Math.round(thirst) }}</div>
    <div>Tiredness: {{ Math.round(tiredness) }}</div>
    <div>Boredom: {{ Math.round(boredom) }}</div>
    <br />
    <br />
    <div>Agent is {{ agent.action.toUpperCase() }}</div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'UtilityTest',
  setup() {

    const hunger = ref(0)
    const thirst = ref(0)
    const tiredness = ref(0)
    const boredom = ref(0)

    const INCREMENTS = {
      'hunger': 0.53,
      'thirst': 0.83,
      'tiredness': 0.27,
      'boredom': 1.71
    }

    const ACTIONS = {
      'eat': {
        'property': hunger,
        'statusName': 'eating',
        'duration': 80,
        'value': -100
      },
      'drink': {
        'property': thirst,
        'statusName': 'drinking',
        'duration': 40,
        'value': -100
      },
      'sleep': {
        'property': tiredness,
        'statusName': 'sleeping',
        'duration': 250,
        'value': -100
      },
      'shitpost': {
        'property': boredom,
        'statusName': 'shitposting',
        'duration': 20,
        'value': -100
      },
    }

    const agent = ref({
      action: 'doing nothing',
      actionStartedFrame: null,
      actionDuration: null
    })

    const incrementProperty = (property, propertyName) => {
      if (property.value <= 100 - INCREMENTS[propertyName]) {
        property.value += INCREMENTS[propertyName]
      }
    }

    const incrementProperties = () => {

      incrementProperty(hunger, 'hunger')
      incrementProperty(thirst, 'thirst')
      incrementProperty(tiredness, 'tiredness')
      incrementProperty(boredom, 'boredom')
    }

    let animationFrameId;

    const doAction = (actionName) => {
      ACTIONS[actionName]['property'].value += ACTIONS[actionName]['value']
      agent.value.action = ACTIONS[actionName]['statusName']
      agent.value.actionStartedFrame = animationFrameId
      agent.value.actionDuration = ACTIONS[actionName]['duration']
    }

    const doNothingAgain = () => {
      agent.value.action = 'doing nothing'
      agent.value.actionStartedFrame = null
      agent.value.actionDuration = null
    }

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      if (agent.value.action !== 'doing nothing') {
        if (animationFrameId > agent.value.actionStartedFrame + agent.value.actionDuration) {
          doNothingAgain()
        }
      }

      if (animationFrameId % 5 === 0) {
        incrementProperties()

        if ([98, 99, 100].includes(Math.round(hunger.value)) && agent.value.action === 'doing nothing') {
          doAction('eat')
        }
        if ([98, 99, 100].includes(Math.round(thirst.value)) && agent.value.action === 'doing nothing') {
          doAction('drink')
        }
        if ([98, 99, 100].includes(Math.round(tiredness.value)) && agent.value.action === 'doing nothing') {
          doAction('sleep')
        }
        if ([98, 99, 100].includes(Math.round(boredom.value)) && agent.value.action === 'doing nothing') {
          doAction('shitpost')
        }

      }
    }

    animate()

    return {
      agent,
      hunger,
      thirst,
      tiredness,
      boredom
    }
  }
}

</script>

<style>

body {
  font-family: Arial, Helvetica, sans-serif;
}

.properties {
  display: flex;
  flex-direction: column;
}

</style>