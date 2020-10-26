import io from 'socket.io-client'
import hat from 'hat'
import Emittery from 'emittery'

import NodeFactory from './NodeFactory'

class PeerClient {
  constructor (host) {
    this._host = host

    this._socket = null
    this._peerNode = null

    this._eventBus = new Emittery()

    this._generateMessageId = hat.rack()
  }

  connect (roomId, isPrimaryNode = false) {
    this._connectionIdleOrThrow()

    this._connectSocket({
      roomId,
      isPrimaryNode
    })

    this._connectPeerNode(isPrimaryNode)
  }

  disconnect () {
    this._eventBus.clearListeners()

    this._disconnectSocket()
    this._disconnectPeerNode()
  }

  async send (message) {
    this._senderIsNotPrimaryOrThrow()

    const messageId = this._generateMessageId()

    const request = {
      id: messageId,
      content: message
    }

    this._peerNode.send(request)

    return this._waitForResponse(messageId)
  }

  onMessage (eventHandler) {
    // TODO: siblings cannot attach to this event
    return this._eventBus.on('message', eventHandler)
  }

  onPeerConnect (eventHandler) {
    return this._eventBus.on('peerConnect', eventHandler)
  }

  onPeerDisconnect (eventHandler) {
    return this._eventBus.on('peerDisconnect', eventHandler)
  }

  onPeerError (eventHandler) {
    return this._eventBus.on('peerError', eventHandler)
  }

  onSocketConnect (eventHandler) {
    return this._eventBus.on('socketConnect', eventHandler)
  }

  onSocketDisconnect (eventHandler) {
    return this._eventBus.on('socketDisconnect', eventHandler)
  }

  _connectionIdleOrThrow () {
    if (this._socket !== null || this._peerNode !== null) {
      throw new Error(
        'There is a connection already active, `disconnect()` before opening a new one.'
      )
    }
  }

  _connectSocket (query) {
    this._socket = io(
      this._host,
      { query }
    )

    this._attachSocketEvents()
  }

  _attachSocketEvents () {
    this._socket.on('signal', data => {
      this._peerNode.signal(data)
    })

    this._socket.on('connect', () => {
      this._eventBus.emit('socketConnect')
    })

    this._socket.on('disconnect', () => {
      this._eventBus.emit('socketDisconnect')
    })
  }

  _connectPeerNode (isPrimary) {
    this._peerNode = NodeFactory.createInstance({ isPrimary })

    this._attachPeerNodeEvents()
  }

  _attachPeerNodeEvents () {
    this._peerNode.on(
      'signal',
      data => this._socket.emit('signal', data)
    )

    this._peerNode.on(
      'message',
      data => this._handleMessageData(data)
    )

    this._peerNode.on(
      'peerConnect',
      () => this._eventBus.emit('peerConnect')
    )

    this._peerNode.on(
      'peerDisconnect',
      () => this._eventBus.emit('peerDisconnect')
    )

    this._peerNode.on(
      'peerError',
      error => this._eventBus.emit('peerError', error)
    )
  }

  _disconnectSocket () {
    if (this._socket !== null) {
      this._socket.close()
      this._socket = null
    }
  }

  _disconnectPeerNode () {
    if (this._peerNode !== null) {
      this._peerNode.close()
      this._peerNode = null
    }
  }

  _senderIsNotPrimaryOrThrow () {
    if (this._peerNode.isPrimary) {
      throw new Error(
        'You are attempting to send a message from a primary node. Primary nodes are only allowe to anwer sibling ' +
        'messages, please `disconnect()` and `connect()` again indicating that the node is not primary if you want ' +
        'to send messages.'
      )
    }
  }

  async _waitForResponse (messageId, timeout = 10000) {
    return Promise.race([
      this._onceResponseArrives(messageId),
      this._onceTimeout(timeout)
    ])
  }

  async _onceResponseArrives (messageId) {
    return this._eventBus.once(`response_${messageId}`)
  }

  async _onceTimeout (timeoutMs) {
    return new Promise(
      (resolve, reject) => setTimeout(() => {
        reject(
          new Error(
            `Timeout: We did not get a response in ${timeoutMs}ms`
          )
        )
      }, timeoutMs)
    )
  }

  _handleMessageData (data) {
    const { senderId, message } = data

    if (this._peerNode.isPrimary) {
      this._eventBus.emit(
        'message',
        {
          senderId,
          message: message.content,
          respond: responseContent => {
            const response = {
              id: message.id,
              content: responseContent
            }

            this._peerNode.send(response, [senderId])
          }
        }
      )
    } else {
      this._eventBus.emit(
        `response_${message.id}`,
        message.content
      )
    }
  }
}

export default PeerClient
