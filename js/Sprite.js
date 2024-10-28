class Sprite {
  constructor({
    position = {x: 0, y: 0},
    imageSrc,
    offset = {x: 0, y: 0},
    scale = 1
  }) {
    this.position = position
    this.image = new Image()
    this.image.src = imageSrc
    this.defaultImage = imageSrc

    this.defaultFrames = {
      max: 1,
      columns: 1,
      rows: 1,
      current: 0,
      elapsed: 0,
      hold: 3
    }
    // to be set from Agent extending Sprite
    this.frames = this.defaultFrames

    this.offset = offset
    this.scale = scale
  }

  draw() {

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
      crop.position.x + this.offset.x,
      crop.position.y + this.offset.y,
      crop.width, // image width
      crop.height, // image height
      this.position.x,
      this.position.y,
      crop.width * this.scale,  // image crop width
      crop.height * this.scale  // image crop height
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

    this.editing = false
  }
}
