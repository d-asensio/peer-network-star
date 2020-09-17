import PeerConnection from 'simple-peer'
import Emittery from 'emittery'

class PrimaryNode {
  constructor () {
    this._siblingsById = new Map()

    this._eventBus = new Emittery()
  }

  on (eventName, eventHandler) {
    return this._eventBus.on(eventName, eventHandler)
  }

  send (message) {
    for (const [, siblingPeer] of this._siblingsById) {
      siblingPeer.send(message)
    }
  }

  signal (data) {
    const { siblingId, ...signaldata } = data

    if (!this._siblingsById.has(siblingId)) {
      const newSiblingPeer = new PeerConnection()

      newSiblingPeer.on(
        'signal',
        data => this._handleSiblingSignal(siblingId, data)
      )

      newSiblingPeer.on(
        'data',
        data => this._eventBus.emit('data', data)
      )

      this._siblingsById.set(siblingId, newSiblingPeer)
    }

    const siblingPeer = this._siblingsById.get(siblingId)

    siblingPeer.signal(signaldata)
  }

  _handleSiblingSignal (siblingId, data) {
    this._eventBus.emit(
      'signal',
      {
        siblingId,
        ...data
      }
    )
  }
}

export default PrimaryNode
