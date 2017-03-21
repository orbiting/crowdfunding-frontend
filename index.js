const express = require('express')
const next = require('next')

const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'
if (DEV) {
  require('dotenv').config()
}

const {PORT} = require('./constants')

const app = next({dir: '.', dev: DEV})
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()
  server.get('*', (req, res) => {
    return handle(req, res)
  })
  server.listen(PORT, (err) => {
    if (err) throw err
    console.log(`> Ready on port ${PORT}`)
  })
})
