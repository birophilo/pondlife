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
      <line x1="50" :y1="lineStartY" x2="250" :y2="lineEndY" stroke="blue" stroke-width="2" />
      
      <!-- Circle at XY origin -->
      <circle :cx="50" :cy="lineStartY" :r="CIRCLE_R" fill="red" stroke="darkred" stroke-width="1" />

      <!-- Circle at line end -->
      <circle :cx="250" :cy="lineEndY" :r="CIRCLE_R" fill="green" stroke="darkgreen" stroke-width="1" />
    </svg>
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

    const startDrag = (event) => {
      const rect = event.target.getBoundingClientRect()
      const y = event.clientY - rect.top

      const cursorPoint = event.clientY - CIRCLE_R

      console.log(cursorPoint, lineStartY.value)

      
      // Check if click is near the circle
      // if (Math.abs(y - circleY.value) <= 10 && Math.abs(event.offsetX - 50) <= 10) {
      if (Math.abs(cursorPoint - lineStartY.value) <= CIRCLE_R) {
        isDragging.value = 'lineStart'
        console.log('dragging line start', y)
      }
      if (Math.abs(cursorPoint - lineEndY.value) <= CIRCLE_R) {
        isDragging.value = 'lineEnd'
        console.log('dragging line end', y)
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

    return {
      utilityFunction,
      linearParams,
      CIRCLE_R,
      lineStartY,
      lineEndY,
      isDragging,
      startDrag,
      onDrag,
      stopDrag
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
</style>
