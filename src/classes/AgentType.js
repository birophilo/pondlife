export function createAgentTypeObject (args) {
  const item = {
    name: args.name,
    config: {
      width: args.width,
      height: args.height,
      offset: args.offset,
      scale: args.scale,
      nominalSpeed: args.nominalSpeed,
      previewImage: args.previewImage,
      animationSet: args.animationSet,
      thumbnail: args.thumbnail
    }
  }
  return item
}