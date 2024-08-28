class Sprite {
  constructor({
    position = { x: 0, y: 0 },
    imageSrc,
    frames = {max, columns, rows},
    offset = {x: 0, y: 0},
    scale = 1
  }) {
    this.position = position
    this.image = new Image()
    this.image.src = imageSrc
    this.frames = {
      max: frames.max,
      columns: frames.columns,
      rows: frames.rows,
      current: 0,
      elapsed: 0,
      hold: 3
    }
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
      // need 9 arguments to display a crop!
      this.image,
      crop.position.x + this.offset.x,
      crop.position.y + this.offset.y,
      // crop.position.x, // x on canvas
      // crop.position.y,  // y on canvas
      crop.width, // image width
      crop.height, // image height
      // this.position.x + this.offset.x,
      // this.position.y + this.offset.y,
      this.position.x,
      this.position.y,
      crop.width * this.scale,  // image crop width
      crop.height * this.scale  // image crop height
    )
  }

  update() {
    this.frames.elapsed++
    if (this.frames.elapsed % this.frames.hold === 0) {
      this.frames.current++
      if (this.frames.current >= this.frames.max) {
        this.frames.current = 0
      }
    }
  }

}