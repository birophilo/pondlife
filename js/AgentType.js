class AgentType {
  constructor(args) {
    this.name = args.name
    this.agentItems = []
    this.config = {
      width: args.width,
      height: args.height,
      offset: args.offset,
      scale: args.scale,
      nominalSpeed: args.nominalSpeed,
      imageSrc: args.imageSrc,
      spriteMap: args.spriteMap,
      thumbnail: args.thumbnail
    }
    this.editing = false
  }
}
