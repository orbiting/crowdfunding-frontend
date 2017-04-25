const express = require('express')
const next = require('next')
const basicAuth = require('express-basic-auth')
const newsletter = require('./server/newsletter')

// can be removed after public launch
const cookieParser = require('cookie-parser')

const DEV = process.env.NODE_ENV && process.env.NODE_ENV !== 'production'
if (DEV || process.env.DOTENV) {
  require('dotenv').config()
}

const COUNTDOWN_DATE = require('./constants').COUNTDOWN_DATE
const BACKDOOR_URL = require('./constants').BACKDOOR_URL

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

  // only attach middle-ware if we're not already past it
  if ((new Date()) < COUNTDOWN_DATE) {
    const ALLOWED_PATHS = [
      '/_next',
      '/_webpack/',
      '/__webpack_hmr',
      '/static/',
      '/newsletter/',
      '/manifest'
    ]

    server.use(cookieParser())
    server.use((req, res, next) => {
      const now = new Date()
      if (now < COUNTDOWN_DATE) {
        if (req.url === BACKDOOR_URL) {
          res.cookie('aliBaba', 'OpenSesame', { maxAge: 2880000, httpOnly: true })
          return res.redirect('/')
        }
        if (req.cookies.aliBaba === 'OpenSesame' ||
          ALLOWED_PATHS.some(path => req.url.startsWith(path))) {
          return next()
        }
        if (req.url === '/') {
          return app.render(req, res, '/countdown', {})
        }
        req.path = '/404'
        req.url = '/404'
        return handle(req, res)
      }
      return next()
    })
  }

  server.use(newsletter)

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
