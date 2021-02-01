# signaling-server-star-network

## How to install

```
yarn add signaling-server-star-network
```

## How to use

You must create a configuration file like this:

- a `signaling-server-star-network` property in `package.json`
- a `.signaling-server-star-networkrc` file in JSON or YAML format
- a `.signaling-server-star-networkrc.json`, `.signaling-server-star-networkrc.yaml`, `.signaling-server-star-networkrc.yml`, `.signaling-server-star-networkrc.js`, or `.signaling-server-star-networkrc.cjs` file
- a `signaling-server-star-network.config.js` or `signaling-server-star-network.config.cjs` CommonJS module exporting an object

Example: `signaling-server-star-network.config.js`

```
module.exports = {
  port: 3000,
  redis: {
    host: '127.0.0.1',
    port: 6379
  }
}
```

### **port:**
- Type: `number`. **Required.**
- Sets the port to run the package.

### **redis:**
- Type: `object`.
- Redis configuration, host and port.

```
  redis: {
    host: <string>
    port: <number>
  }
```