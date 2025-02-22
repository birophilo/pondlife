export function createSpriteObject (
  position = {x: 0, y: 0},
  previewImage,
  animationSet = null,
  agentType
  // defaultSpriteSheet = 'idle'
) {
  const item = {
    position: position,
    image: new Image(),
    defaultImage: previewImage,
    defaultFrames: {
      max: 1,
      columns: 1,
      rows: 1,
      current: 0,
      elapsed: 0,
      hold: 3
    },
    animationSet: animationSet,
    frames: {
      max: 1,
      columns: 1,
      rows: 1,
      current: 0,
      elapsed: 0,
      hold: 3
    }
  }

  item.image.src = '/media/' + previewImage
  item.agentType = agentType

  return item
}


export class SpriteHandler {

  draw(c, item) {

    var offset
    var scale
    if (item.animationSet !== null) {
      offset = item.animationSet.offset
      scale = item.animationSet.scale
    } else {
      offset = {x: 0, y: 0}
      scale = 1
    }

    const cropWidth = item.image.width / item.frames.columns
    const cropHeight = item.image.height / item.frames.rows
    const crop = {
      position: {
        x: cropWidth * (item.frames.current % item.frames.columns),
        y: 0 + cropHeight * Math.floor(item.frames.current / item.frames.columns)
      },
      width: cropWidth,
      height: cropHeight
    }

    try {
      c.drawImage(
        item.image,
        crop.position.x + offset.x,
        crop.position.y + offset.y,
        crop.width, // image width
        crop.height, // image height
        item.position.x,
        item.position.y,
        crop.width * scale,  // image crop width
        crop.height * scale  // image crop height
      )
    } catch(error) {
      console.log(error)
      console.log(item.image)
      console.log(item.image.src)
    }

  }

  update(globals, item) {

    const frameSpeedMultiple = globals.globalSpeed / 100
    const hold = Number(item.frames.hold)
    item.frames.hold = hold / frameSpeedMultiple

    item.frames.elapsed++
    if (item.frames.elapsed % item.frames.hold === 0) {
      item.frames.current++
      if (item.frames.current >= item.frames.max) {
        item.frames.current = 0
      }
    }
  }

  useSpriteSheet(spriteSheetName, item) {
    if (item.animationSet !== null) {
      const spriteSheet = item.animationSet.sheets[spriteSheetName]
      item.image.src = '/media/' + spriteSheet.src

      item.frames = {
        ...item.frames,
        max: spriteSheet.numImages,
        columns: spriteSheet.columns,
        rows: spriteSheet.rows,
        hold: spriteSheet.refreshInterval
      }
    }
  }

}