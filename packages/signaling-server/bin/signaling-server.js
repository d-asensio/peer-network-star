#!/usr/bin/env node
const yargs = require('yargs')

const SignalingServer = require('../src')

const server = SignalingServer()

const { argv } = yargs

if (!argv.port) {
  console.error('You must specify a port via the `--port <port>` argument')
} else {
  server.listen(argv.port)
}
