const socketIO = require('socket.io')
const redis = require('socket.io-redis')

const createRoomPool = require('./createRoomPool')
const Node = require('./Node')

function SignalingServer ({ redis: redisConfig }) {
  const io = socketIO({
    serveClient: false,
    cors: {
      origin: true
    }
  })

  if (redisConfig) {
    const { host, port } = redisConfig

    io.adapter(redis({ host, port }))
  }

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
