const fs = require('fs')
const path = require('path')
const http = require('http')

const socketIO = require('socket.io')
const Emittery = require('emittery')

const CLIENT_HTML_FILE = path.join(__dirname, 'index.html')

const htmlContent = fs.readFileSync(CLIENT_HTML_FILE, 'utf8')

const httpServer = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Content-Length', Buffer.byteLength(htmlContent))
  res.end(htmlContent)
})

const io = socketIO(httpServer)

io.on('connect', handleNewConnection)

httpServer.listen(3000, () => {
  console.log('go to http://localhost:3000')
})

class Node {
  constructor (id, isPrimary = false) {
    this._id = id
    this._isPrimary = isPrimary

    this._signals = []

    this._eventBus = new Emittery()
  }

  get id () { return this._id }
  get isPrimary () { return this._isPrimary }
  get signals () { return this._signals }

  addSignal (signal) {
    this._signals.push(signal)

    this._eventBus.emit('signal', signal)
  }

  on (eventName, eventHandler) {
    return this._eventBus.on(eventName, eventHandler)
  }

  clearListeners () {
    this._eventBus.clearListeners()
  }
}

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

    this._eventBus.emit('newSibling', node)

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

const roomPool = {
  _roomsById: new Map(),
  getRoom (roomId) {
    if (!this._roomsById.has(roomId)) {
      const room = new Room(roomId)

      room.on('broadcastPrimarySignal', signal => {
        for (const { id } of room.siblingNodes) {
          console.log('Primary signal', signal, 'being sent to', id, 'sibling')
          io.to(id).emit('signal', signal)
        }
      })

      room.on('broadcastSiblingSignal', signal => {
        const { id } = room.primaryNode

        io.to(id).emit('signal', signal)
      })

      room.on('newSibling', node => {
        const { signals } = room.primaryNode

        for (const signal of signals) {
          io.to(node.id).emit('signal', signal)
        }
      })

      // TODO: unsuscribe room events ?

      this._roomsById.set(roomId, room)
    }

    return this._roomsById.get(roomId)
  }
}

function handleNewConnection (socket) {
  const { id, handshake } = socket
  const { roomId, isPrimaryNode } = handshake.query

  try {
    const room = roomPool.getRoom(roomId)
    const node = new Node(id, isPrimaryNode === 'true')

    room.addNode(node)

    io.to(id).emit('identify', id)

    socket.on('disconnect', () => {
      room.removeNode(node.id)
    })

    socket.on('signal', signal => {
      node.addSignal(signal)
    })
  } catch (e) {
    console.error(e)
  }
}
