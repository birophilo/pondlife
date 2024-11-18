export class Sprite {
  constructor({
    position = {x: 0, y: 0},
    previewImage,
    animationSet = null,
    defaultSpriteSheet = 'idle'
  }) {
    this.position = position
    this.image = new Image()
    this.image.src = previewImage
    this.defaultImage = previewImage

    this.defaultFrames = {
      max: 1,
      columns: 1,
      rows: 1,
      current: 0,
      elapsed: 0,
      hold: 3
    }

    this.frames = this.defaultFrames
    this.animationSet = animationSet
    this.useSpriteSheet(defaultSpriteSheet)
  }

  draw(c) {

    var offset
    var scale
    if (this.animationSet !== null) {
      offset = this.animationSet.offset
      scale = this.animationSet.scale
    } else {
      offset = {x: 0, y: 0}
      scale = 1
    }

    const cropWidth = this.image.width / this.frames.columns
    const cropHeight = this.image.height / this.frames.rows
    const crop = {
      position: {
        x: cropWidth * (this.frames.current % this.frames.columns),
        y: 0 + cropHeight * Math.floor(this.frames.current / this.frames.columns)
      },
      width: cropWidth,
      height: cropHeight
    }
    c.drawImage(
      this.image,
      crop.position.x + offset.x,
      crop.position.y + offset.y,
      crop.width, // image width
      crop.height, // image height
      this.position.x,
      this.position.y,
      crop.width * scale,  // image crop width
      crop.height * scale  // image crop height
    )
  }

  update(globals) {

    const frameSpeedMultiple = globals.globalSpeed / 100
    const hold = Number(this.frames.hold)
    this.frames.hold = hold / frameSpeedMultiple

    this.frames.elapsed++
    if (this.frames.elapsed % this.frames.hold === 0) {
      this.frames.current++
      if (this.frames.current >= this.frames.max) {
        this.frames.current = 0
      }
    }
  }

  useSpriteSheet(spriteSheetName) {
    if (this.animationSet !== null) {
      const spriteSheet = this.animationSet.sheets[spriteSheetName]
      this.image.src = spriteSheet.src

      this.frames = {
        ...this.frames,
        max: spriteSheet.numImages,
        columns: spriteSheet.columns,
        rows: spriteSheet.rows,
        hold: spriteSheet.refreshInterval
      }
    }
  }

}


export class SpriteSheet {
  constructor(args) {
    this.name = args.name
    this.src = args.src
    this.columns = args.columns
    this.rows = args.rows
    this.numImages = args.numImages
    this.refreshInterval = args.refreshInterval
  }
}


export class AnimationSet {
  constructor(args) {
    this.name = args.name
    this.sheets = args.sheets
    this.offset = {x: args.offsetX, y: args.offsetY}
    this.scale = args.scale
  }
}
