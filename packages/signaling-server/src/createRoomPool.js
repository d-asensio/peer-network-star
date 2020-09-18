const Room = require('./Room')

const createRoomPool = function (io) {
  return {
    _roomsById: new Map(),
    getRoom (roomId) {
      if (!this._roomsById.has(roomId)) {
        const room = new Room(roomId)

        room.on('broadcastPrimarySignal', signal => {
          for (const { id } of room.siblingNodes) {
            io.to(id).emit('signal', signal)
          }
        })

        room.on('broadcastSiblingSignal', signal => {
          const { id } = room.primaryNode

          io.to(id).emit('signal', signal)
        })

        room.on('newPrimaryNode', node => {
          for (const { signals } of room.siblingNodes) {
            for (const signal of signals) {
              io.to(node.id).emit('signal', signal)
            }
          }
        })

        // TODO: unsuscribe room events ?

        this._roomsById.set(roomId, room)
      }

      return this._roomsById.get(roomId)
    }
  }
}

module.exports = createRoomPool
