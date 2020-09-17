import io from 'socket.io-client'

import NodeFactory from './NodeFactory'

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
let node = null

function initConnection (connectionData) {
  closeConnectionIfAny()

  const { isPrimaryNode } = connectionData

  socket = io('http://localhost:3000', {
    query: connectionData
  })

  node = NodeFactory.createInstance({ isPrimaryNode })

  node.on(
    'signal',
    data => socket.emit('signal', data)
  )

  node.on(
    'data',
    data => writeMessage(data)
  )

  socket.on('signal', data => {
    node.signal(data)
  })
}

function closeConnectionIfAny () {
  if (socket !== null) {
    socket.close()
  }
}

$sendButton.addEventListener('click', () => {
  node.send($messageInput.value)
})
