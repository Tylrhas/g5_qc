// Express
var express = require('express')
var app = express()

// Models
var models = require('./app/models')

// Passport
var passport = require('passport')
var session = require('express-session')

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 60000
  }
}))
app.use(passport.initialize())
app.use(passport.session())

// force SSL Certs
if (process.env.ENVIRONMENT !== 'dev') {
  app.use(function (req, res, next) {
    if ((req.get('X-Forwarded-Proto') !== 'https')) {
      res.redirect('https://' + req.get('Host') + req.url)
    } else {
      next()
    }
  })
}

// load passport strategies
require('./app/config/passport.js')(passport, models.user)

// Socket IO
var server = require('http').Server(app)
var io = require('socket.io')(server)

var bodyParser = require('body-parser')
var crawl = require('./app/controllers/crawl.js')
var dictionary = require('./app/controllers/custom-dictionary.js')

var favicon = require('serve-favicon')

app.set('views', './app/views')
app.set('view engine', 'ejs')

var path = require('path')
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')))

var port = process.env.PORT || 3000
app.use(express.static(__dirname + '/public'))

// For BodyParser
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

app.get('/g5_auth/users/auth/g5',
  passport.authenticate('oauth2'))

app.get('/g5_auth/users/auth/g5/callback',
  passport.authenticate('oauth2', { failureRedirect: '/g5_auth/users/auth/g5' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/')
  })

app.get('/', checkAuthentication, function (req, res) {
  let jobs = models.jobQueue.findAll()
  let words = dictionary.load()
  // Successful authentication, render home.
  Promise.all([jobs, words]).then(results => {
    res.render('pages/index', { user: req.user, jobs: results[0], dictionary: results[0] })
  })
})

server.listen(port)

io.on('connection', function (socket) {
  socket.on('crawl', function (data) {
    enqueue(data.url).then(job => {
      socket.emit('enqueued', job.dataValues)
      io.emit('newJob', job.dataValues)
      var jobQueue = models.jobQueue.findOne({
        where: {
          processing: true
        }
      })
      jobQueue.then(function (jobQueue) {
        if (!jobQueue) {
          console.log('here we go!')
          crawl.crawl(io)
        }
      })
    })
  })
  socket.on('createWord', function (data) {
    // Create on for create word
    dictionary.add(data.word).then(() => {
      io.emit('wordAdded', data.word)
    })
  })

  socket.on('removeWord', function (data) {
    // Create on for remove word
    dictionary.remove(data.word).then(() => {
      io.emit('wordRemoved', data.word)
    })
  })

  socket.on('removeJob', function (data) {
    // Create on for Remove Job
  })
})

// Sync Database
models.sequelize.sync().then(function () {
  console.log('Nice! Database looks fine')
  // load the custom dict
}).catch(function (err) {
  console.log(err, 'Something went wrong with the Database Update!')
})
function enqueue (url) {
  // make sure the URL has a "/" as the last character
  if (url[url.length - 1] === '/') {
    url = url.replace(/\/$/, '')
  }
  return models.jobQueue.create({ url })
}

function checkAuthentication (req, res, next) {
  if (req.isAuthenticated()) {
    // if user is looged in, req.isAuthenticated() will return true
    next()
  } else {
    res.redirect('/g5_auth/users/auth/g5')
  }
}
