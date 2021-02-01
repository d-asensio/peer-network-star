#!/usr/bin/env node
const { cosmiconfigSync } = require('cosmiconfig')

const SignalingServer = require('../src')

const explorerSync = cosmiconfigSync('signaling-server-star-network')
const configFile = explorerSync.search()

if (!configFile) {
  console.error('You must use a config file like:`signaling-server-star-network.config.js`. README for more details')
  process.exit(1)
}

const { config } = configFile
const { port, redis } = config

const server = SignalingServer({ redis })

if (redis) {
  if (redis.host && !redis.port) {
    console.warn('Maybe you forgot `redis: { port }` in your config file')
  }
  if (!redis.host && redis.port) {
    console.warn('Maybe you forgot `redis: { host }` in your config file')
  }
}

if (!port) {
  console.error('You must specify a port via the `port` in your config file')
} else {
  server.listen(port)
}
