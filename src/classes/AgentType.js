export default class AgentType {
  constructor(args) {
    this.name = args.name
    this.agentItems = []
    this.config = {
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
}
