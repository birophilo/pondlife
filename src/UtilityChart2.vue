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
        :y1="lineStartY"
        x2="250"
        :y2="lineEndY"
        stroke="blue"
        stroke-width="5"
        class="utility-line"
        @mouseenter="onLineHover"
        @mouseleave="onLineLeave"
        @mousedown="startDrag($event, 'utilityLine')"
        style="cursor: pointer;"
      />
      
      <!-- Circle at XY origin -->
      <circle :cx="50" :cy="lineStartY" :r="CIRCLE_R" fill="red" stroke="darkred" stroke-width="1" />

      <!-- Circle at line end -->
      <circle :cx="250" :cy="lineEndY" :r="CIRCLE_R" fill="green" stroke="darkgreen" stroke-width="1" />
    </svg>
  </div>
  <div>
    <!-- Start: {{ lineStartY - 250 }}<br/>
    End: {{ (lineEndY - 250) * -1 }} -->
    Line slope: {{ (lineEndY - lineStartY) * -1 / (250 - 50) }}<br/>
    Intercept: {{ (lineStartY - 250) * -1 }}<br/>
    set line slope <input type="number" v-model="lineStartY" />
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'UtilityChart',
  props: {
    functionType: String
  },
  setup(props) {

    const linearParams = ref({
      slope: 1,
      intercept: 0
    })

    const CIRCLE_R = 5

    const lineStartY = ref(250)
    const lineEndY = ref(50)
    const isDragging = ref(false)

    const currentLineStartYDiff = ref(0)
    const currentLineEndYDiff = ref(0)

    const startDrag = (event, type) => {
      console.log('startDrag', type)
      const rect = event.target.getBoundingClientRect()
      const y = event.clientY - rect.top

      const cursorPoint = event.clientY - CIRCLE_R

      console.log(cursorPoint, lineStartY.value)

      // Check if click is near the circle
      if (Math.abs(cursorPoint - lineStartY.value) <= CIRCLE_R) {
        isDragging.value = 'lineStart'
        console.log('dragging line start', y)
      }
      if (Math.abs(cursorPoint - lineEndY.value) <= CIRCLE_R) {
        isDragging.value = 'lineEnd'
        console.log('dragging line end', y)
      }
      if (type === 'utilityLine') {
        isDragging.value = 'utilityLine'
        console.log('dragging utility line', y)
        const currentLineStartY = lineStartY.value
        const currentLineEndY = lineEndY.value
        currentLineStartYDiff.value = (event.clientY - CIRCLE_R) - currentLineStartY
        currentLineEndYDiff.value = (event.clientY - CIRCLE_R) - currentLineEndY
      }
    }

    const onDrag = (event) => {

      if (!isDragging.value) return
      // Constrain to Y axis only (x = 50) and bounds (50 to 250)
      // circleY.value = Math.max(50, Math.min(250, y))
      if (isDragging.value === 'lineStart') {
        lineStartY.value = Math.max(50, Math.min(450, event.clientY))
      } else if (isDragging.value === 'lineEnd') {
        lineEndY.value = Math.max(50, Math.min(450, event.clientY))
      } else if (isDragging.value === 'utilityLine') {
        lineStartY.value = Math.max(50, Math.min(450, currentLineEndYDiff.value + event.clientY))
        lineEndY.value = Math.max(50, Math.min(450, currentLineStartYDiff.value + event.clientY))
        console.log('dragging utility line', currentLineStartYDiff, currentLineEndYDiff)
      }
    }

    const stopDrag = () => {
      isDragging.value = false
      console.log('stopDrag', lineStartY.value)
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
      linearParams,
      CIRCLE_R,
      lineStartY,
      lineEndY,
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
