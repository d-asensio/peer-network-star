const socketIO = require('socket.io')

const createRoomPool = require('./createRoomPool')
const Node = require('./Node')

function SignalingServer () {
  const io = socketIO({
    serveClient: false
  })

  const roomPool = createRoomPool(io)

  io.on('connect', function (socket) {
    const { id, handshake } = socket
    const { roomId, isPrimaryNode } = handshake.query

    try {
      const room = roomPool.getRoom(roomId)
      const node = new Node(id, isPrimaryNode === 'true')

      room.addNode(node)

      socket.on('disconnect', () => {
        room.removeNode(node.id)
      })

      socket.on('signal', signal => {
        node.addSignal(signal)
      })
    } catch (e) {
      console.error(e)
    }
  })

  return {
    listen (port) {
      io.listen(port)
    }
  }
}

module.exports = SignalingServer
