import PeerConnection from 'simple-peer'
import Emittery from 'emittery'
import hat from 'hat'

const generateUniqueId = hat.rack()

class SiblingNode {
  constructor () {
    this._id = generateUniqueId()

    this._peerConnection = new PeerConnection({
      initiator: true
    })

    this._eventBus = new Emittery()

    this._attachConnectionEvents()
  }

  on (eventName, eventHandler) {
    return this._eventBus.on(eventName, eventHandler)
  }

  send (message) {
    this._peerConnection.send(message)
  }

  signal (data) {
    const { siblingId, ...signalData } = data

    if (data.siblingId === this._id) {
      this._peerConnection.signal(signalData)
    }
  }

  _attachConnectionEvents () {
    this._peerConnection.on(
      'signal',
      data => this._handleGeneratedSignal(data)
    )

    this._peerConnection.on(
      'data',
      data => this._eventBus.emit('data', data)
    )
  }

  _handleGeneratedSignal (data) {
    this._eventBus.emit(
      'signal',
      {
        siblingId: this._id,
        ...data
      }
    )
  }
}

export default SiblingNode
