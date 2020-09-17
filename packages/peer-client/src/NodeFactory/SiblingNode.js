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
    const messageString = JSON.stringify({
      senderId: this._id,
      message
    })

    this._peerConnection.send(messageString)
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
      signal => this._handleGeneratedSignal(signal)
    )

    this._peerConnection.on(
      'data',
      dataString => this._handleReceivedData(dataString)
    )
  }

  _handleGeneratedSignal (signal) {
    this._eventBus.emit(
      'signal',
      {
        siblingId: this._id,
        ...signal
      }
    )
  }

  _handleReceivedData (dataString) {
    const data = JSON.parse(dataString)

    this._eventBus.emit(
      'message',
      data
    )
  }
}

export default SiblingNode
