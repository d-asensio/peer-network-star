# peer-client-star-network

## How to install

```
yarn add peer-client-star-network
```

## How to use

You can import the library like:

```
import PeerClient from 'peer-client-star-network'
```

To create a client you can do:

```
const client = new PeerClient('http://localhost:3000')
```

The client will try to establish a WebSocket connection if possible (with **signaling-server**), and will fall back on HTTP long-polling if not.

WebSocket is a communication protocol that provides a full-duplex and low-latency channel between the server and the browser. More information can be found [here](https://en.wikipedia.org/wiki/WebSocket).

### **connect**

Use to **connect** primary or sibling node in a room from **signaling-server**.

```
client.connect(roomId, isPrimaryNode)
```

**Type:** async `function`.

**Params:**
```
roomId: <string>
isPrimaryNode: <boolean>
```

### **disconnect**

Use to **disconnect** primary or sibling node from **signaling-server**.

```
client.disconnect()
```

**Type:** async `function`.

### **send**

This event only works in the sibling node.
The connected primary node will receive the message.
The async function returns a response from primary node.
This function triggers the **onMessage** event.

```
const response = client.send(message)
```

**Type:** async `function`.

**Params:**
```
message: <string>
```

### **onMessage**

This event only works in the primary node.
This event is triggered when the peer sends a message.

```
client.onMessage(
  ({ senderId, message, respond }) => {
    const response = 'response message'

    respond(response)
  }
)
```

**Type:** `function`.

**Params:**
```
senderId: <string>
message: <string>
respond: <function>
```

### **onPeerConnect**

This event is triggered when a new peer node is connected.

```
client.onPeerConnect(() => {
  console.log('New Peer connected!')
})
```

**Type:** `function`.

### **onPeerDisconnect**

This event is triggered when a peer node is disconnected.

```
client.onPeerDisconnect(() => {
  console.log('Peer disconnected!')
})
```

**Type:** `function`.

### **onPeerError**

This event is triggered when a peer-to-peer connection fails.

```
client.onPeerError(error => {
  console.error(error)
})
```

**Type:** `function`.

**Params:**
```
error: <string>
```

### **onSocketConnect**

This event is triggered when the peer node is connected to the **signaling-server**.

```
client.onSocketConnect(() => {
  console.log('Signaling server connected!')
})
```

**Type:** `function`.

### **onSocketDisconnect**

This event is triggered when the peer node is disconnected from the **signaling-server**.

```
client.onSocketDisconnect(() => {
  console.log('Signaling server disconnected!')
})
```

**Type:** `function`.
