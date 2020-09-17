import io from 'socket.io-client'

import NodeFactory from './NodeFactory'

const $roomIdInput = $('roomIdInput')
const $primaryNodeCheckbox = $('primaryNodeCheckbox')
const $connectButton = $('connectButton')

const $chatMessageList = $('chatMessageList')

const $messageInput = $('messageInput')
const $sendButton = $('sendButton')

const $targetsField = $('targetsField')
const $targetsIdInput = $('targetsIdInput')

/** UI MANAGEMENT */

$connectButton.addEventListener('click', () => {
  const connectionData = getConnectionData()

  initConnection(connectionData)
})

$sendButton.addEventListener('click', () => {
  node.send(
    $messageInput.value,
    getTargets()
  )
})

$primaryNodeCheckbox.addEventListener('change', e => {
  showTargetsField(e.target.checked)
})

/** DOM HELPERS **/

function $ (elementId) {
  return document.getElementById(elementId)
}

function writeMessage ({ senderId, message }) {
  const $messageWrapperItem = document.createElement('li')

  const $senderIdItem = document.createElement('i')
  $senderIdItem.appendChild(
    document.createTextNode(`${senderId} `)
  )

  const $messageItem = document.createElement('span')
  $messageItem.appendChild(
    document.createTextNode(message)
  )

  $messageWrapperItem.appendChild($senderIdItem)
  $messageWrapperItem.appendChild($messageItem)

  $chatMessageList.appendChild($messageWrapperItem)
}

function showTargetsField (show) {
  $targetsField.style.display = show ? 'initial' : 'none'
}

function getTargets () {
  if ($targetsIdInput.value === '') return undefined
  return $targetsIdInput.value.split(',').map(t => t.trim())
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
    'message',
    writeMessage
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

function getConnectionData () {
  return {
    roomId: $roomIdInput.value,
    isPrimaryNode: $primaryNodeCheckbox.checked
  }
}
