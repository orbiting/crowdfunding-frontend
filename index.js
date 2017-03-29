const express = require('express')
const next = require('next')
const basicAuth = require('express-basic-auth')

const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'
if (DEV) {
  require('dotenv').config()
}

// ensure required ENV vars are set
let requiredEnv = [
  'DATABASE_URL',
  'PUBLIC_URL'
]
let unsetEnv = requiredEnv.filter((env) => !(typeof process.env[env] !== 'undefined'))
if (unsetEnv.length > 0) {
  throw new Error('Required ENV variables are not set: [' + unsetEnv.join(', ') + ']')
}

const {PORT} = require('./constants')

const app = next({dir: '.', dev: DEV})
const handle = app.getRequestHandler()

app.prepare()
.then(() => {
  const server = express()

  if (process.env.BASIC_AUTH_PASS) {
    server.use(basicAuth({
      users: { [process.env.BASIC_AUTH_USER]: process.env.BASIC_AUTH_PASS },
      challenge: true,
      realm: process.env.BASIC_AUTH_REALM
    }))
  }

  server.get('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(PORT, (err) => {
    if (err) throw err
    console.log(`> Ready on port ${PORT}`)
  })
})
