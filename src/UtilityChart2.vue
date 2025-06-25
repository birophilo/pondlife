<template>
  <div>
    <!-- an SVG chart with X and Y axis line (thin black lines)-->
    <!-- grid lines (thin gray lines)-->
    <!-- utility function line (thick blue line)-->
    <svg width="300" height="500" viewBox="0 0 300 500" @mousedown="startDrag" @mousemove="onDrag" @mouseup="stopDrag" @mouseleave="stopDrag">
      <!-- X axis line -->
      <line x1="50" y1="250" x2="250" y2="250" stroke="black" stroke-width="1" />
      
      <!-- Y axis line -->
      <line x1="50" y1="50" x2="50" y2="450" stroke="black" stroke-width="1" />
      
      <!-- 1:1 line from origin (thick blue line) -->
      <line
        x1="50"
        :y1="computedLineStartY"
        x2="250"
        :y2="computedLineEndY"
        stroke="blue"
        stroke-width="5"
        class="utility-line"
        @mouseenter="onLineHover"
        @mouseleave="onLineLeave"
        @mousedown="startDrag($event, 'utilityLine')"
        style="cursor: pointer;"
      />
      
      <!-- Circle at XY origin -->
      <circle :cx="50" :cy="computedLineStartY" :r="CIRCLE_R" fill="red" stroke="darkred" stroke-width="1" />

      <!-- Circle at line end -->
      <circle :cx="250" :cy="computedLineEndY" :r="CIRCLE_R" fill="green" stroke="darkgreen" stroke-width="1" />
    </svg>
  </div>
  <div>
    <!-- Start: {{ computedLineStartY - 250 }}<br/>
    End: {{ (lineEndY - 250) * -1 }} -->
    Line slope: {{ lineSlope }}<br/>
    Intercept: {{ intercept }}<br/>
    set intercept <input type="number" v-model="intercept" /><br/>
    set line slope <input type="number" v-model="lineSlope" />
    <!-- lock line angle <input type="checkbox" v-model="lockLineAngle" /> -->


  </div>
</template>

<script>
import { computed, ref } from 'vue';

export default {
  name: 'UtilityChart',
  props: {
    functionType: String
  },
  setup(props) {

    const CIRCLE_R = 5
    const CHART_OFFSET_TOP = 50
    const CHART_WIDTH = 200
    const CHART_HEIGHT_ABOVE_ORIGIN = 200
    // const CHART_HEIGHT_BELOW_ORIGIN = 200

    const intercept = ref(0)
    const lineSlope = ref(1)
    // const computedLineStartY = ref(250)
    const lineEndY = ref(50)
    const isDragging = ref(false)
    const lockLineAngle = ref(false)
    const currentLineStartYDiff = ref(0)
    const currentLineEndYDiff = ref(0)

    const computedLineStartY = computed(() => {
      return (CHART_OFFSET_TOP + CHART_HEIGHT_ABOVE_ORIGIN) - intercept.value
    })

    const computedLineEndY = computed(() => {
      const lineStartY = computedLineStartY.value
      return (lineStartY - (lineSlope.value * CHART_WIDTH))
    })

    // const lineSlope = computed(() => {
    //   return (lineEndY.value - computedLineStartY.value) * -1 / CHART_WIDTH
    // })

    const startDrag = (event, type) => {
      console.log('startDrag', type)
      const rect = event.target.getBoundingClientRect()
      const y = event.clientY - rect.top

      const cursorPoint = event.clientY - CIRCLE_R

      console.log(cursorPoint, computedLineStartY.value)

      // Check if click is near the circle
      if (Math.abs(cursorPoint - computedLineStartY.value) <= CIRCLE_R) {
        isDragging.value = 'lineStart'
        console.log('dragging line start', y)
      }
      if (Math.abs(cursorPoint - computedLineEndY.value) <= CIRCLE_R) {
        isDragging.value = 'lineEnd'
        console.log('dragging line end', y)
      }
      if (type === 'utilityLine') {
        isDragging.value = 'utilityLine'
        console.log('dragging utility line', y)
        const currentLineStartY = computedLineStartY.value
        const currentLineEndY = computedLineEndY.value
        currentLineStartYDiff.value = (event.clientY - CIRCLE_R) - currentLineStartY
        currentLineEndYDiff.value = (event.clientY - CIRCLE_R) - currentLineEndY
      }
    }

    const onDrag = (event) => {

      if (!isDragging.value) return
      // Constrain to Y axis only (x = 50) and bounds (50 to 250)
      // circleY.value = Math.max(50, Math.min(250, y))
      if (isDragging.value === 'lineStart') {
        computedLineStartY.value = Math.max(50, Math.min(450, event.clientY))
      } else if (isDragging.value === 'lineEnd') {
        lineEndY.value = Math.max(50, Math.min(450, event.clientY))
      } else if (isDragging.value === 'utilityLine') {
        const newVal = Math.max(50, Math.min(450, currentLineEndYDiff.value + event.clientY))
        intercept.value = 250 - newVal
        // computedLineStartY.value = Math.max(50, Math.min(450, currentLineEndYDiff.value + event.clientY))
        lineEndY.value = Math.max(50, Math.min(450, currentLineStartYDiff.value + event.clientY))
        console.log('dragging utility line', currentLineStartYDiff, currentLineEndYDiff)
      }
    }

    const stopDrag = () => {
      isDragging.value = false
      console.log('stopDrag', computedLineStartY.value)
    }

    const utilityFunction = (x) => {
      if (props.functionType === 'linear') {
        return x
      } else if (props.functionType === 'quadratic') {
        return x * x
      }
    }

    const onLineHover = () => {
      console.log('hovering over line')
    }

    const onLineLeave = () => {
      console.log('left line')
    }

    const onLineMouseDown = () => {
      isDragging.value = 'utilityLine'
      console.log('started dragging line')
    }

    return {
      utilityFunction,
      CIRCLE_R,
      lineEndY,
      lineSlope,
      intercept,
      computedLineStartY,
      computedLineEndY,
      lockLineAngle,
      isDragging,
      startDrag,
      onDrag,
      stopDrag,
      onLineHover,
      onLineLeave,
      onLineMouseDown
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
