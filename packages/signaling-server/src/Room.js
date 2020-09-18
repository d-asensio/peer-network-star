const Emittery = require('emittery')

class Room {
  constructor (id) {
    this._id = id
    this._primaryNode = null
    this._siblingNodesById = new Map()

    this._eventBus = new Emittery()
  }

  get primaryNode () {
    return this._primaryNode
  }

  get siblingNodes () {
    return this._siblingNodesById.values()
  }

  addNode (node) {
    if (node.isPrimary) {
      this._addPrimaryNode(node)
    } else {
      this._addSiblingNode(node)
    }
  }

  removeNode (nodeId) {
    this._nodeCanBeRemovedOrThrow(nodeId)

    if (this._isPrimaryNodeId(nodeId)) {
      this._removePrimaryNode()
    } else {
      this._removeSiblingNode(nodeId)
    }
  }

  on (eventName, eventHandler) {
    return this._eventBus.on(eventName, eventHandler)
  }

  _addPrimaryNode (node) {
    this._emptyPrimaryNodeOrThrow()

    this._primaryNode = node

    this._notifyNewPrimary()
    this._suscribeToPrimaryNodeEvents()
  }

  _emptyPrimaryNodeOrThrow () {
    if (this._primaryNode !== null) {
      throw new Error(
        'The primary node is already registered in this room. A room can not have multiple primary nodes but you can ' +
        'change the primary node by unregistering the current one first.'
      )
    }
  }

  _notifyNewPrimary () {
    this._eventBus.emit('newPrimaryNode', this._primaryNode)
  }

  _suscribeToPrimaryNodeEvents () {
    this._primaryNode.on(
      'signal',
      signal => this._handlePrimaryNodeSignal(signal)
    )
  }

  _handlePrimaryNodeSignal (signal) {
    this._eventBus.emit('broadcastPrimarySignal', signal)
  }

  _addSiblingNode (node) {
    this._validSiblingOrThrow(node)

    this._siblingNodesById.set(node.id, node)

    this._suscribeToSiblingNodeEvents(node)
  }

  _validSiblingOrThrow (node) {
    if (this._siblingNodesById.has(node.id)) {
      throw new Error(
        `The node ${node.id} already exists in this room.`
      )
    }
  }

  _suscribeToSiblingNodeEvents (node) {
    node.on(
      'signal',
      signal => this._handleSiblingNodeSignal(signal)
    )
  }

  _handleSiblingNodeSignal (signal) {
    this._eventBus.emit('broadcastSiblingSignal', signal)
  }

  _nodeCanBeRemovedOrThrow (nodeId) {
    if (!this._isPrimaryNodeId(nodeId) && !this._siblingNodesById.has(nodeId)) {
      throw new Error(
        `The node ${nodeId} can not be removed because it not exists in this room.`
      )
    }
  }

  _isPrimaryNodeId (nodeId) {
    return (
      this._primaryNode !== null &&
      this._primaryNode.id === nodeId
    )
  }

  _removePrimaryNode () {
    this._unsuscribePrimaryNodeEvents()

    this._primaryNode = null
  }

  _removeSiblingNode (nodeId) {
    this._unsuscribeSiblingNodeEvents(nodeId)

    this._siblingNodesById.delete(nodeId)
  }

  _unsuscribeSiblingNodeEvents (nodeId) {
    const node = this._siblingNodesById.get(nodeId)
    // This assumes that a node belongs only to one room.
    node.clearListeners()
  }

  _unsuscribePrimaryNodeEvents () {
    // This assumes that a primary node belongs only to one room.
    this._primaryNode.clearListeners()
  }
}

module.exports = Room
