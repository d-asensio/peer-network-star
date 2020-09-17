import io from 'socket.io-client'
import SimplePeer from 'simple-peer'
import hat from 'hat'

const generateUniqueId = hat.rack()

const $peerIdInput = $('peerIdInput')

const $roomIdInput = $('roomIdInput')
const $primaryNodeCheckbox = $('primaryNodeCheckbox')
const $connectButton = $('connectButton')

const $chatMessageList = $('chatMessageList')

const $messageInput = $('messageInput')
const $sendButton = $('sendButton')

$connectButton.addEventListener('click', () => {
  const connectionData = getConnectionData()

  initConnection(connectionData)
})

/** DOM HELPERS **/

function $ (elementId) {
  return document.getElementById(elementId)
}

function getConnectionData () {
  return {
    roomId: $roomIdInput.value,
    isPrimaryNode: $primaryNodeCheckbox.checked
  }
}

function writeMessage (message) {
  const $messageItem = document.createElement('li')
  $messageItem.innerText = message

  $chatMessageList.append($messageItem)
}

/** MANAGE CONNECTION **/

let socket = null
let peer = null

const siblingPeers = new Map()

function initConnection (connectionData) {
  closeConnectionIfAny()

  const { isPrimaryNode } = connectionData

  socket = io('http://localhost:3000', {
    query: connectionData
  })

  if (!isPrimaryNode) {
    const siblingId = generateUniqueId()

    peer = new SimplePeer({
      initiator: true
    })

    peer.on('signal', data => {
      socket.emit('signal', {
        ...data,
        siblingId
      })
    })

    peer.on('data', data => {
      writeMessage(data)
    })

    socket.on('signal', data => {
      if (data.siblingId === siblingId) {
        peer.signal(data)
      }
    })
  } else {
    socket.on('signal', data => {
      const { siblingId, ...signaldata } = data

      if (!siblingPeers.has(siblingId)) {
        const newSiblingPeer = new SimplePeer()

        newSiblingPeer.on('signal', data => {
          socket.emit('signal', {
            ...data,
            siblingId
          })
        })

        newSiblingPeer.on('data', data => {
          writeMessage(data)
        })

        siblingPeers.set(siblingId, newSiblingPeer)
      }

      const siblingPeer = siblingPeers.get(siblingId)

      siblingPeer.signal(signaldata)
    })
  }

  socket.on('identify', id => {
    $peerIdInput.value = id
  })
}

function closeConnectionIfAny () {
  if (socket !== null) {
    socket.close()
  }
}

$sendButton.addEventListener('click', () => {
  if (peer !== null) {
    peer.send($messageInput.value)
  }

  for (const [, siblingPeer] of siblingPeers) {
    siblingPeer.send($messageInput.value)
  }
})
