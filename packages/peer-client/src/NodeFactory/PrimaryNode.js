import PeerConnection from 'simple-peer'
import Emittery from 'emittery'
import hat from 'hat'

const generateUniqueId = hat.rack()

class PrimaryNode {
  constructor () {
    this._id = generateUniqueId()

    this._siblingsById = new Map()

    this._eventBus = new Emittery()
  }

  get isPrimary () { return true }

  on (eventName, eventHandler) {
    return this._eventBus.on(eventName, eventHandler)
  }

  send (message, receiverIds = this._siblingsById.keys()) {
    const messageString = JSON.stringify({
      senderId: this._id,
      message
    })

    for (const receiverId of receiverIds) {
      const receiverSibling = this._siblingsById.get(receiverId)

      if (receiverSibling) {
        receiverSibling.send(messageString)
      }
    }
  }

  signal (signal) {
    const { siblingId, ...signaldata } = signal

    if (!this._siblingsById.has(siblingId)) {
      const newSiblingPeer = new PeerConnection()

      newSiblingPeer.on(
        'signal',
        signal => this._handleSiblingSignal(siblingId, signal)
      )

      newSiblingPeer.on(
        'data',
        dataString => this._handleReceivedSiblingData(dataString)
      )

      this._siblingsById.set(siblingId, newSiblingPeer)
    }

    const siblingPeer = this._siblingsById.get(siblingId)

    siblingPeer.signal(signaldata)
  }

  close () {
    this._eventBus.clearListeners()

    for (const [, peerSibling] of this._siblingsById) {
      peerSibling.destroy()
    }
  }

  _handleSiblingSignal (siblingId, signal) {
    this._eventBus.emit(
      'signal',
      {
        siblingId,
        ...signal
      }
    )
  }

  _handleReceivedSiblingData (dataString) {
    const data = JSON.parse(dataString)

    this._eventBus.emit(
      'message',
      data
    )
  }
}

export default PrimaryNode
