
export const initialAgentInstances = {
  lemonadeStall: [{x: 400, y: 200}, {x: 700, y: 100}],
  customer: [{x: 900, y: 400}],
  supplyVan: [],
  world: [{x: 20, y: 20}]
}

export const initialAgentTypes = [
  {
    name: 'customer',
    width: 30,
    height: 40,
    offset: {x: 96, y: 46},
    scale: 0.7,
    nominalSpeed: 0.02,
    previewImage: '/img/thumbnails/customer-thumbnail.png',
    spriteMap: null,
    thumbnail: '/img/thumbnails/customer-thumbnail.png'
  },
  {
    name: 'lemonadeStall',
    width: 130,
    height: 104,
    offset: {x: 0, y: 0},
    scale: 1,
    nominalSpeed: 0.02,
    previewImage: '/img/sprites/stall-1.png',
    spriteMap: null,
    thumbnail: '/img/thumbnails/lemonade-stall-thumbnail.png'
  },
  {
    name: 'supplyVan',
    width: 50,
    height: 50,
    offset: {x: 2, y: 0},
    scale: 2.5,
    nominalSpeed: 0.02,
    previewImage: '/img/sprites/SupplyVan_Right.png',
    spriteMap: null,
    thumbnail: '/img/thumbnails/supply-van-thumbnail.png'
  },
  {
    name: 'world',
    width: 25,
    height: 25,
    offset: {x: 0, y: 0},
    scale: 1,
    nominalSpeed: 0.02,
    previewImage: '/img/thumbnails/world-thumbnail.png',
    spriteMap: null,
    thumbnail: ''
  }
]

export const initialAgentMenuButtons = [
  'customer',
  'lemonadeStall',
  'supplyVan'
]