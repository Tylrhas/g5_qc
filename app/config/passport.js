module.exports = function (passport, user) {
  var User = user
  var OAuth2Strategy = require('passport-oauth2')

  passport.serializeUser(function (user, done) {
    // placeholder for custom user serialization
    // null is for errors
    done(null, user)
  })

  passport.deserializeUser(function (user, done) {
    // placeholder for custom user deserialization.
    // maybe you are going to get the user from mongo by id?
    // null is for errors
    done(null, user)
  })

  // oauth 2 configuration for the passport strategy
  passport.use(new OAuth2Strategy({
    authorizationURL: process.env.G5_AUTH_ENDPOINT,
    tokenURL: process.env.G5_TOKEN_ENDPOINT,
    clientID: process.env.G5_AUTH_CLIENT_ID,
    clientSecret: process.env.G5_AUTH_CLIENT_SECRET,
    callbackURL: process.env.G5_AUTH_REDIRECT_URI
  },
  function (accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ id: profile.id }, function (err, user) {
      return cb(err, user)
    })
  }
  ))
}
