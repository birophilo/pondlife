<template>
  <div class="container">Utility</div>
  <div class="properties">
    <div>Hunger: {{ Math.round(hunger) }}</div>
    <div>Thirst: {{ Math.round(thirst) }}</div>
    <div>Tiredness: {{ Math.round(tiredness) }}</div>
    <div>Boredom: {{ Math.round(boredom) }}</div>
    <br />
    <br />
    <div>Agent is {{ agent.action }}</div>
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
      'hunger': 0.36,
      'thirst': 0.63,
      'tiredness': 0.27,
      'boredom': 2
    }

    const ACTIONS = {
      'eat': {
        'property': hunger,
        'statusName': 'eating',
        'duration': 50,
        'value': -100
      },
      'drink': {
        'property': thirst,
        'statusName': 'drinking',
        'duration': 50,
        'value': -100
      },
      'sleep': {
        'property': tiredness,
        'statusName': 'sleeping',
        'duration': 150,
        'value': -100
      },
      'shitpost': {
        'property': boredom,
        'statusName': 'shitposting',
        'duration': 10,
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
      console.log('incrementing values')

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
        console.log(animationFrameId)
        console.log(agent.value.actionStartedFrame + agent.value.actionDuration)
        if (animationFrameId > agent.value.actionStartedFrame + agent.value.actionDuration) {
          doNothingAgain()
        }
      }

      if (animationFrameId % 3 === 0) {
        incrementProperties()

        if (Math.round(hunger.value) === 100 && agent.value.action === 'doing nothing') {
          doAction('eat')
        }
        if (Math.round(thirst.value) === 100 && agent.value.action === 'doing nothing') {
          doAction('drink')
        }
        if (Math.round(tiredness.value) === 100 && agent.value.action === 'doing nothing') {
          doAction('sleep')
        }
        if (Math.round(boredom.value) === 100 && agent.value.action === 'doing nothing') {
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

.properties {
  display: flex;
  flex-direction: column;
}

</style>