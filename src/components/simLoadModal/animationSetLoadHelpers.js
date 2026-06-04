/**
 * Idle-direction sprite src for animation set load modal preview column.
 */
export function previewSrcForAnimationSet (animationSet, spriteSheets) {
  const idleRef = animationSet?.sheets?.idle
  const idleId = idleRef == null || idleRef === ''
    ? null
    : typeof idleRef === 'string'
      ? idleRef
      : idleRef.id
  if (!idleId) return ''
  const sheet = spriteSheets.find((s) => s.id === idleId)
  return sheet?.src ?? ''
}
