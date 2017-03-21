const express = require('express')
const next = require('next')
const { PgDb } = require('pogi')

const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'
if (DEV) {
  require('dotenv').config()
}

// ensure required ENV vars are set
let requiredEnv = [
  'DATABASE_URL',
  'SESSION_SECRET',
  'PUBLIC_URL',
  'MAILGUN_DOMAIN',
  'MAILGUN_API_KEY',
  'MAIL_FROM_ADDRESS'
]
let unsetEnv = requiredEnv.filter((env) => !(typeof process.env[env] !== 'undefined'))
if (unsetEnv.length > 0) {
  throw new Error('Required ENV variables are not set: [' + unsetEnv.join(', ') + ']')
}

const {PORT} = require('./constants')
const auth = require('./src/auth')

const app = next({dir: '.', dev: DEV})
const handle = app.getRequestHandler()

app.prepare()
.then(() => {
  return PgDb.connect({ connectionString: process.env.DATABASE_URL })
}).then(pgdb => {
  const server = express()

  // Once DB is available, setup sessions and routes for authentication
  auth.configure({
    app: app,
    server: server,
    users: pgdb['public']['users'],
    secret: process.env.SESSION_SECRET,
    publicUrl: process.env.PUBLIC_URL
  })

  server.get('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(PORT, (err) => {
    if (err) throw err
    console.log(`> Ready on port ${PORT}`)
  })
})
