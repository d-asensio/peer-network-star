import io from 'socket.io-client'

const $peerIdInput = $('peerIdInput')

const $roomIdInput = $('roomIdInput')
const $primaryNodeCheckbox = $('primaryNodeCheckbox')
const $connectButton = $('connectButton')

const $signalInput = $('signalInput')
const $sendButton = $('sendButton')

const $signalList = $('signalList')

$connectButton.addEventListener('click', () => {
  const connectionData = getConnectionData()

  initConnection(connectionData)
})

$sendButton.addEventListener('click', () => {
  sendSignal($signalInput.value)

  $signalInput.value = ''
})

/** DOM HELPERS **/

function $ (elementId) {
  return document.getElementById(elementId)
}

function newMessageElement (content) {
  const item = document.createElement('li')
  item.innerText = content
  return item
}

function getConnectionData () {
  return {
    roomId: $roomIdInput.value,
    isPrimaryNode: $primaryNodeCheckbox.checked
  }
}

/** MANAGE CONNECTION **/

let socket = null

function initConnection (connectionData) {
  closeConnectionIfAny()

  socket = io('http://localhost:3000', {
    query: connectionData
  })

  socket.on('identify', id => {
    $peerIdInput.value = id
  })

  socket.on('signal', message => {
    console.log(message)
    $signalList.append(
      newMessageElement(message)
    )
  })
}

function sendSignal (data) {
  socket.emit('signal', data)
}

function closeConnectionIfAny () {
  if (socket !== null) {
    socket.close()
  }
}
