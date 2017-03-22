const bodyParser = require('body-parser')
const session = require('express-session')
const PgSession = require('connect-pg-simple')(session)
const request = require('request')
const csrf = require('lusca').csrf()
const uuid = require('uuid/v4')
const passportStrategies = require('./passport-strategies')

exports.configure = ({
  app = null, // Next.js App
  server = null, // Express Server
  users: Users = null, // User model
  // URL base path for authentication routes
  path = '/auth',
  // Directory in ./pages/ where auth pages can be found
  pages = 'auth',
  // Secret used to encrypt session data on the server
  secret = null,
  // Sessions store for express-session (defaults to connect-pg-simple using DATABASE_URL)
  store = new PgSession({
    tableName: 'sessions'
  }),
  // Max session age in ms (default is 4 weeks)
  // NB: With 'rolling: true' passed to session() the session expiry time will
  // be reset every time a user visits the site again before it expires.
  maxAge = 60000 * 60 * 24 * 7 * 4,
  // How often the client should revalidate the session in ms (default 60s)
  // Does not impact the session life on the server, but causes the client to
  // always refetch session info after N seconds has elapsed since last
  // checked. Sensible values are between 0 (always check the server) and a
  // few minutes.
  clientMaxAge = 60000,
  // URL of the server (e.g. 'http://www.example.com'). Used when sending
  // sign in links in emails. Autodetects to hostname if null.
  publicUrl = null,
  // is the server running in development
  dev = process.env.NODE_ENV !== 'production'
} = {}) => {
  if (app === null) {
    throw new Error('app option must be a next server instance')
  }
  if (server === null) {
    throw new Error('server option must be an express server instance')
  }
  if (Users === null) {
    throw new Error('users option must be a pogi user table')
  }

  // Load body parser to handle POST requests
  server.use(bodyParser.json())
  server.use(bodyParser.urlencoded({extended: true}))

  // Configure sessions
  server.use(session({
    secret: secret,
    store: store,
    resave: false,
    rolling: true,
    saveUninitialized: false,
    httpOnly: true,
    cookie: {
      maxAge: maxAge,
      secure: !dev
    }
  }))

  // Add CSRF to all POST requests
  // except /_next/ queries
  server.use((req, res, next) => {
    // exclude nextjs requests
    if (!req.path.match(/^\/_next\//)) {
      return csrf(req, res, next)
    }
    return next()
  })

  // With sessions connfigured (& before routes) we need to configure Passport
  // and trigger passport.initialize() before we add any routes
  passportStrategies.configure({
    app: app,
    server: server,
    users: Users
  })

  // Add route to get CSRF token via AJAX
  server.get(path + '/csrf', (req, res) => {
    return res.json({csrfToken: res.locals._csrf})
  })

  // Return session info
  server.get(path + '/session', (req, res) => {
    let session = {
      clientMaxAge: clientMaxAge,
      csrfToken: res.locals._csrf
    }

    // Add user object to session if logged in
    if (req.user) {
      session.user = req.user
    }

    return res.json(session)
  })

  // On post request, redirect to page with instrutions to check email for link
  server.post(path + '/email/signin', async (req, res) => {
    const email = req.body.email || null

    if (!email || email.trim() === '') {
      return app.render(req, res, pages + '/signin', req.params)
    }

    // Create verification token save it to database
    const token = uuid()
    const verificationUrl = (publicUrl || 'http://' + req.headers.host) + path + '/email/signin/' + token

    // FIXME save email, token to a separate store
    // create user only if email is validated
    const user = await Users.findOne({email})
    if (user) {
      Users.updateOne({email}, {token})
    } else {
      Users.insert({email, token})
    }

    request.post(`https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`, {
      auth: { user: 'api', pass: process.env.MAILGUN_API_KEY },
      form: {
        to: email,
        from: process.env.MAIL_FROM_ADDRESS,
        subject: 'Your login token',
        text: 'Use the link below to sign in:\n\n' + verificationUrl + '\n\n'
      }
    })

    return app.render(req, res, pages + '/check-email', req.params)
  })

  server.get(path + '/email/signin/:token', async (req, res) => {
    const token = req.params.token
    if (!token) {
      return res.redirect(path + '/signin')
    }

    // Look up user by token
    let user = await Users.findOne({token})
    if (!user) {
      return res.redirect(path + '/error')
    }
    user = await Users.updateAndGetOne({token}, {
      token: null,
      verified: true
    })

    // Having validated to the token, we log the user with Passport
    req.logIn(user, function (err) {
      if (err) {
        return res.redirect(path + '/error')
      }
      return res.redirect(path + '/success')
    })
  })

  server.post(path + '/signout', (req, res) => {
    // Log user out by disassociating their account from the session
    req.logout()
    res.redirect('/')
  })
}
