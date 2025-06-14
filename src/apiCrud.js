import baseApiClient from "./baseApiClient"

export default {
  createCondition (data) {
    return baseApiClient.createItem('conditions', data)
  },
  getCondition (id) {
    return baseApiClient.getItem('condition', id)
  },
  updateCondition (data) {
    return baseApiClient.updateItem('condition', data)
  },
  deleteCondition (id) {
    return baseApiClient.deleteItem('condition', id)
  },
  createSpriteSheet (data) {
    return baseApiClient.createItem('spritesheets', data)
  },
  getSpriteSheet (id) {
    return baseApiClient.getItem('spritesheet', id)
  },
  updateSpriteSheet (data) {
    return baseApiClient.updateItem('spritesheet', data)
  },
  deleteSpriteSheet (id) {
    return baseApiClient.deleteItem('spritesheet', id)
  },
  createAnimationSet (data) {
    return baseApiClient.createItem('animationSets', data)
  },
  getAnimationSet (id) {
    return baseApiClient.getItem('animationSet', id)
  },
  updateAnimationSet (data) {
    return baseApiClient.updateItem('animationSet', data)
  },
  deleteAnimationSet (id) {
    return baseApiClient.deleteItem('animationSet', id)
  },
  createAgentType (data) {
    return baseApiClient.createItem('agentTypes', data)
  },
  createAgentTypeMultipart (data) {
    return baseApiClient.createItemMultipartForm('agentTypesMultipart', data)
  },
  getAgentType (id) {
    return baseApiClient.getItem('agentType', id)
  },
  listAgentTypes () {
    return baseApiClient.listItems('agentTypes')
  },
  updateAgentType (data) {
    return baseApiClient.updateItem('agentType', data)
  },
  deleteAgentType (id) {
    return baseApiClient.deleteItem('agentType', id)
  },
  createAction (data) {
    return baseApiClient.createItem('actions', data)
  },
  getAction (id) {
    return baseApiClient.getItem('action', id)
  },
  updateAction (data) {
    return baseApiClient.updateItem('action', data)
  },
  deleteAction (id) {
    return baseApiClient.deleteItem('action', id)
  },
  createPropertyChange (data) {
    return baseApiClient.createItem('propertyChanges', data)
  },
  getPropertyChange (id) {
    return baseApiClient.getItem('propertyChange', id)
  },
  updatePropertyChange (data) {
    return baseApiClient.updateItem('propertyChange', data)
  },
  deletePropertyChange (id) {
    return baseApiClient.deleteItem('propertyChange', id)
  },
  createAgent (data) {
    return baseApiClient.createItem('agents', data)
  },
  getAgent (id) {
    return baseApiClient.getItem('agent', id)
  },
  updateAgent (data) {
    return baseApiClient.updateItem('agent', data)
  },
  deleteAgent (id) {
    return baseApiClient.deleteItem('agent', id)
  },
  createInitialAgentProperty (data) {
    return baseApiClient.createItem('agentProperties', data)
  },
  getInitialAgentProperty (id) {
    return baseApiClient.getItem('agentProperty', id)
  },
  updateInitialAgentProperty (data) {
    return baseApiClient.updateItem('agentProperty', data)
  },
  deleteInitialAgentProperty (id) {
    return baseApiClient.deleteItem('agentProperty', id)
  },
  // add user filter/parameter in due course
  listScenes () {
    return baseApiClient.listItems('scenes')
  },
  createScene (data) {
    return baseApiClient.createItem('scenes', data)
  },
  uploadFile (data) {
    return baseApiClient.uploadImage(data)
  },
  createSensor (data) {
    return baseApiClient.createItem('sensors', data)
  },
  getSensor (id) {
    return baseApiClient.getItem('sensor', id)
  },
  updateSensor (data) {
    return baseApiClient.updateItem('sensor', data)
  },
  deleteSensor (id) {
    return baseApiClient.deleteItem('sensor', id)
  },
  createUtilityFunction (data) {
    return baseApiClient.createItem('utilityFunctions', data)
  },
  getUtilityFunction (id) {
    return baseApiClient.getItem('utilityFunction', id)
  },
  updateUtilityFunction (data) {
    return baseApiClient.updateItem('utilityFunction', data)
  },
  deleteUtilityFunction (id) {
    return baseApiClient.deleteItem('utilityFunction', id)
  }
}