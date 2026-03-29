/**
 * Plan 3 Phase F — canvas pointer for sim-only reads (no Pinia).
 * Updated on every mousemove in simRuntime; Vue reads store.mouse only when selectionMode syncs.
 */

export const simPointer = { x: 0, y: 0 }
