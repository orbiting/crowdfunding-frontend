const express = require('express')
const next = require('next')
const basicAuth = require('express-basic-auth')

const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'
if (DEV || process.env.DOTENV) {
  require('dotenv').config()
}

const PORT = process.env.PORT || 3000

const app = next({dir: '.', dev: DEV})
const handle = app.getRequestHandler()

app.prepare()
.then(() => {
  const server = express()

  if (!DEV) {
    server.enable('trust proxy')
    server.use((req, res, next) => {
      if (`${req.protocol}://${req.get('Host')}` !== process.env.PUBLIC_BASE_URL) {
        return res.redirect(process.env.PUBLIC_BASE_URL + req.url)
      }
      return next()
    })
  }

  if (process.env.BASIC_AUTH_PASS) {
    server.use(basicAuth({
      users: { [process.env.BASIC_AUTH_USER]: process.env.BASIC_AUTH_PASS },
      challenge: true,
      realm: process.env.BASIC_AUTH_REALM
    }))
  }

  server.get('/events/:slug', (req, res) => {
    return app.render(req, res, '/events', {
      slug: req.params.slug
    })
  })
  server.get('/updates/:slug', (req, res) => {
    return app.render(req, res, '/updates', {
      slug: req.params.slug
    })
  })
  server.get('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(PORT, (err) => {
    if (err) throw err
    console.log(`> Ready on port ${PORT}`)
  })
})
