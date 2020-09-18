import Client from './Client'

const $roomIdInput = $('roomIdInput')
const $primaryNodeCheckbox = $('primaryNodeCheckbox')
const $connectButton = $('connectButton')

const $sendBox = $('sendBox')
const $messageInput = $('messageInput')
const $sendButton = $('sendButton')

/** UI MANAGEMENT */

$connectButton.addEventListener('click', () => {
  const connectionData = getConnectionData()

  initConnection(connectionData)
})

$sendButton.addEventListener('click', async () => {
  const response = await client.send($messageInput.value)

  window.alert(response)
})

$primaryNodeCheckbox.addEventListener('change', e => {
  showSendBox(!e.target.checked)
})

/** DOM HELPERS **/

function $ (elementId) {
  return document.getElementById(elementId)
}

function showSendBox (show) {
  $sendBox.style.display = show ? 'initial' : 'none'
}

/** MANAGE CONNECTION **/

const client = new Client('http://localhost:3000')

function initConnection ({ roomId, isPrimaryNode }) {
  client.disconnect()

  client.connect(roomId, isPrimaryNode)

  client.onMessage(
    ({ senderId, message, respond }) => {
      const response = window.prompt(`${senderId} says ${message}`)

      respond(response)
    }
  )
}

function getConnectionData () {
  return {
    roomId: $roomIdInput.value,
    isPrimaryNode: $primaryNodeCheckbox.checked
  }
}
