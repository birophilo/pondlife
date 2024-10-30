class Sprite {
  constructor({
    position = {x: 0, y: 0},
    previewImage,
    spriteMap = null
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
    this.spriteMap = spriteMap
    this.useSpriteSheet('idle')
  }

  draw() {

    var offset
    var scale
    if (this.spriteMap !== null) {
      offset = this.spriteMap.offset
      scale = this.spriteMap.scale
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
    if (this.spriteMap !== null) {
      // hard-coding - to change
      const spriteSheet = this.spriteMap.sheets[spriteSheetName]
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


class SpriteSheet {
  constructor(args) {
    this.name = args.name
    this.src = args.src
    this.columns = args.columns
    this.rows = args.rows
    this.numImages = args.numImages
    this.refreshInterval = args.refreshInterval

    this.editing = false
  }
}


class SpriteMap {
  constructor(args) {
    this.name = args.name
    this.sheets = args.sheets

    this.offset = {x: args.offsetX, y: args.offsetY}
    this.scale = args.scale

    this.editing = false
  }
}
