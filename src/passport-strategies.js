'use strict'

const passport = require('passport')

exports.configure = ({
    app = null, // Next.js App
    server = null, // Express Server
    users: Users = null, // User model
    path = '/auth' // URL base path for authentication routes
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

  // Tell Passport how to seralize/deseralize user accounts
  passport.serializeUser(function (user, next) {
    next(null, user.id)
  })

  passport.deserializeUser(async function (id, next) {
    const user = await Users.findOne({id})
    if (!user) {
      return next('user not found!')
    }
    // Note: We don't return all user profile fields to the client, just ones
    // that are whitelisted here to limit the amount of user data we expose.
    next(null, {
      id: user.id,
      name: user.name,
      email: user.email,
      verified: user.verified
    })
  })

  // Initialise Passport
  server.use(passport.initialize())
  server.use(passport.session())

  return passport
}
