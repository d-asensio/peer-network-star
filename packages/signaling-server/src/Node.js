const Emittery = require('emittery')

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

module.exports = Node
