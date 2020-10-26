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

  get isPrimary () { return false }

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

  close () {
    this._eventBus.clearListeners()

    this._peerConnection.destroy()
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

    this._peerConnection.on(
      'connect',
      () => this._handleStartedConnection()
    )

    this._peerConnection.on(
      'close',
      () => this._handleClosedConnection()
    )

    this._peerConnection.on(
      'error',
      error => this._handleError(error)
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

  _handleStartedConnection () {
    this._eventBus.emit(
      'peerConnect'
    )
  }

  _handleClosedConnection () {
    this._eventBus.emit(
      'peerDisconnect'
    )
  }

  _handleError (error) {
    this._eventBus.emit(
      'peerError',
      error
    )
  }
}

export default SiblingNode
