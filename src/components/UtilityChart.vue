<template>
  <div ref="chartContainer">
    <svg
      width="300"
      :height="SVG_HEIGHT"
      :viewBox="`0 0 300 ${SVG_HEIGHT}`"
      @mousedown="startDrag"
      @mousemove="onDrag"
      @mouseup="stopDrag"
      @mouseleave="stopDrag"
      style="border: 1px solid black"
    >
      <!-- X axis line -->
      <line x1="50" y1="250" x2="250" y2="250" stroke="black" stroke-width="1" />
      
      <!-- Y axis line -->
      <line x1="50" y1="50" x2="50" y2="450" stroke="black" stroke-width="1" />
      
      <!-- Utility line -->
      <!-- <line
        :x1="chartLeftPageX"
        :y1="computedLineStartY"
        :x2="chartLeftPageX + 250"
        :y2="computedLineEndY"
        stroke="blue"
        stroke-width="5"
        class="utility-line"
        @mouseenter="onUtilityLineHover"
        @mouseleave="onUtilityLineLeave"
        @mousedown="startDrag($event, 'utilityLine')"
        style="cursor: pointer;"
      /> -->

      <line
        x1="50"
        :y1="computedLineStartY"
        x2="250"
        :y2="computedLineEndY"
        stroke="blue"
        stroke-width="5"
        class="utility-line"
        @mouseenter="onUtilityLineHover"
        @mouseleave="onUtilityLineLeave"
        @mousedown="startDrag($event, 'utilityLine')"
        style="cursor: pointer;"
      />
      
      <!-- Line start drag handle -->
      <circle :cx="50" :cy="computedLineStartY" :r="CIRCLE_R" fill="red" stroke="darkred" stroke-width="1" />

      <!-- Line end drag handle -->
      <circle :cx="250" :cy="computedLineEndY" :r="CIRCLE_R" fill="green" stroke="darkgreen" stroke-width="1" />
    </svg>
  </div>
  <div>
    <!-- Start: {{ computedLineStartY - 250 }}<br/>
    End: {{ (lineEndY - 250) * -1 }} -->
    Line slope: {{ slope }}<br/>
    Intercept: {{ intercept }}<br/>
    set intercept <input type="number" :value="intercept" @input="emit('update:intercept', $event.target.value)" /><br/>
    set line slope <input type="number" :value="slope" @input="emit('update:slope', $event.target.value)" />
    <!-- lock line angle <input type="checkbox" v-model="lockLineAngle" /> -->
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue';

export default {
  name: 'UtilityChart',
  props: {
    functionType: String,
    slope: Number,
    intercept: Number
  },
  emits: ['update:intercept', 'update:slope'],
  setup(props, { emit }) {

    const SVG_HEIGHT = 500
    const CIRCLE_R = 5
    const CHART_OFFSET_TOP = 50
    const CHART_WIDTH = 200
    const CHART_HEIGHT_ABOVE_ORIGIN = 200
    const CHART_HEIGHT_BELOW_ORIGIN = 200
    const ORIGIN_Y = CHART_OFFSET_TOP + CHART_HEIGHT_ABOVE_ORIGIN
    // const CHART_BOTTOM_POS = CHART_OFFSET_TOP + CHART_HEIGHT_ABOVE_ORIGIN + CHART_HEIGHT_BELOW_ORIGIN

    const isDragging = ref(false)
    // const lockLineAngle = ref(false)
    const currentLineStartYDiff = ref(0)
    const currentLineEndYDiff = ref(0)

    const chartContainer = ref(null)
    const chartLeftPageX = ref(0)
    const chartTopPageY = ref(0)
    const chartBottomPos = ref(0)

    onMounted(() => {
      if (chartContainer.value) {
        console.log("HAS VALUE")
        console.log(chartContainer.value.getBoundingClientRect().top, window.pageYOffset)
        console.log('')
        chartLeftPageX.value = chartContainer.value.getBoundingClientRect().left + window.pageXOffset
        chartTopPageY.value = chartContainer.value.getBoundingClientRect().top
        chartBottomPos.value = chartTopPageY.value + CHART_HEIGHT_ABOVE_ORIGIN + CHART_HEIGHT_BELOW_ORIGIN

        console.log(chartLeftPageX.value)
        console.log(chartTopPageY.value)
        console.log(chartBottomPos.value)
      }
    })

    const computedLineStartY = computed(() => {
      return ORIGIN_Y - props.intercept
    })

    const computedLineEndY = computed(() => {
      return computedLineStartY.value - (props.slope * CHART_WIDTH)
    })

    const startDrag = (event, type) => {
      const cursorPoint = event.clientY - chartContainer.value.getBoundingClientRect().top
      console.log(111)
      // Check if click is near the circle
      console.log(cursorPoint, computedLineStartY.value)
      console.log('----')
      if (Math.abs(cursorPoint - computedLineStartY.value) <= CIRCLE_R) {
        console.log(222)
        isDragging.value = 'lineStart'
      }
      if (Math.abs(cursorPoint - computedLineEndY.value) <= CIRCLE_R) {
        isDragging.value = 'lineEnd'
        console.log('dragging line end', cursorPoint)
      }
      if (type === 'utilityLine') {
        isDragging.value = 'utilityLine'
        currentLineStartYDiff.value = cursorPoint - computedLineStartY.value
        currentLineEndYDiff.value = cursorPoint - computedLineEndY.value
      }
    }

    const onDrag = (event) => {

      if (!isDragging.value) return

      const cursorPoint = event.clientY - chartContainer.value.getBoundingClientRect().top

      if (isDragging.value === 'lineStart') {
        // Constrain to Y axis only (x = 50) and bounds
        console.log('line start')
        const newPos = Math.max(50, Math.min(chartBottomPos.value, cursorPoint))
        emit('update:intercept', ORIGIN_Y - newPos)
      } else if (isDragging.value === 'lineEnd') {
        const newPos = Math.max(50, Math.min(chartBottomPos.value, cursorPoint))
        emit('update:slope', (computedLineStartY.value - newPos) / CHART_WIDTH)
      } else if (isDragging.value === 'utilityLine') {
        const newVal = Math.max(50, Math.min(chartBottomPos.value, currentLineEndYDiff.value + cursorPoint))
        emit('update:intercept', 250 - newVal)
        console.log('dragging utility line', currentLineStartYDiff, currentLineEndYDiff)
      }
    }

    const stopDrag = () => {
      isDragging.value = false
    }

    const utilityFunction = (x) => {
      if (props.functionType === 'linear') {
        return x
      } else if (props.functionType === 'quadratic') {
        return x * x
      }
    }

    const onUtilityLineHover = () => {
      console.log('hovering over line')
    }

    const onUtilityLineLeave = () => {
      console.log('left line')
    }

    const onUtilityLineMouseDown = () => {
      isDragging.value = 'utilityLine'
    }

    return {
      utilityFunction,
      SVG_HEIGHT,
      CIRCLE_R,
      ORIGIN_Y,
      computedLineStartY,
      computedLineEndY,
      isDragging,
      startDrag,
      onDrag,
      stopDrag,
      onUtilityLineHover,
      onUtilityLineLeave,
      onUtilityLineMouseDown,
      chartContainer,
      chartLeftPageX,
      chartTopPageY
    }

  }
}

</script>

<style>
circle {
  cursor: grab;
}
circle:hover {
  cursor: grabbing;
}
.utility-line {
  cursor: grab;
}
</style>
