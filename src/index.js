const fs = require('fs')
const path = require('path')
const socketIO = require('socket.io')

const CLIENT_HTML_FILE = path.join(__dirname, 'index.html')

console.log(CLIENT_HTML_FILE)

const htmlContent = fs.readFileSync(CLIENT_HTML_FILE, 'utf8')

const httpServer = require('http').createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Content-Length', Buffer.byteLength(htmlContent))
  res.end(htmlContent)
})

const io = socketIO(httpServer)

io.on('connect', handleNewConnection)

httpServer.listen(3000, () => {
  console.log('go to http://localhost:3000')
})

function handleNewConnection (socket) {
  const { id } = socket

  console.log(id)

  socket.emit('identify', id)

  socket.on('message', data => {
    const { peerId, message } = data

    io.to(peerId).emit('message', message)
  })

  socket.on('disconnect', () => {
    console.log('bye')
  })
}
